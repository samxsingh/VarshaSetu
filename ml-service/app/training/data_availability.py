"""
VarshaSetu - Data Availability Auditor
Inspects observational and feature datasets to verify temporal coverage,
variable completeness, spatial resolution, and target event viability.
Ensures transparent status reporting (READY, PARTIAL, INSUFFICIENT_DATA)
and prevents false claims of 30-year climatology or sub-block granularity.
"""

from typing import Dict, List, Optional, Any
from enum import Enum
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np


class AvailabilityStatus(str, Enum):
    READY = "READY"
    PARTIAL = "PARTIAL"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class VariableCompleteness(BaseModel):
    variable_name: str
    present: bool
    total_count: int
    null_count: int
    null_percentage: float
    min_value: Optional[float] = None
    max_value: Optional[float] = None


class TargetBalanceInfo(BaseModel):
    target_name: str
    total_samples: int
    positive_count: int
    negative_count: int
    positive_ratio: float
    is_learnable: bool  # Needs at least 2 positive and 2 negative samples


class DataAvailabilityReport(BaseModel):
    status: AvailabilityStatus
    spatial_coverage: Dict[str, Any]
    temporal_coverage: Dict[str, Any]
    variable_completeness: List[VariableCompleteness]
    target_event_counts: List[TargetBalanceInfo]
    has_30_year_climatology: bool = False
    spatial_resolution_level: str = "BLOCK"  # "DISTRICT", "BLOCK", or "PANCHAYAT"
    warnings: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


class DataAvailabilityAuditor:
    """
    Audits a DataFrame containing meteorological / feature data.
    """

    CRITICAL_MET_VARS = ["rainfall", "temp_min", "temp_max", "humidity"]
    CLIMATE_INDICES = ["nino34_anom", "dmi", "mjo_amplitude", "mjo_phase"]

    def __init__(
        self,
        min_days_ready: int = 1095,  # ~3 years for READY
        min_days_partial: int = 60,   # ~2 months minimum for PARTIAL
        max_missing_ratio: float = 0.20
    ):
        self.min_days_ready = min_days_ready
        self.min_days_partial = min_days_partial
        self.max_missing_ratio = max_missing_ratio

    def audit(
        self,
        df: pd.DataFrame,
        date_col: str = "date",
        target_cols: Optional[List[str]] = None,
        spatial_col: Optional[str] = "block_id",
        panchayat_col: Optional[str] = "panchayat_id"
    ) -> DataAvailabilityReport:
        warnings = []
        recommendations = []

        if df.empty:
            return DataAvailabilityReport(
                status=AvailabilityStatus.INSUFFICIENT_DATA,
                spatial_coverage={"error": "Empty dataset"},
                temporal_coverage={"error": "Empty dataset"},
                variable_completeness=[],
                target_event_counts=[],
                has_30_year_climatology=False,
                spatial_resolution_level="UNKNOWN",
                warnings=["Dataset is completely empty."],
                recommendations=["Ingest meteorological observations before training."]
            )

        # 1. Temporal Analysis
        if date_col not in df.columns:
            warnings.append(f"Date column '{date_col}' not found.")
            temporal_info = {"error": f"Missing '{date_col}'"}
            total_days = len(df)
            has_30_yr = False
        else:
            dates = pd.to_datetime(df[date_col]).sort_values()
            earliest = dates.min()
            latest = dates.max()
            unique_dates = dates.nunique()
            expected_days = (latest - earliest).days + 1
            missing_dates = max(0, expected_days - unique_dates)

            temporal_info = {
                "earliest_date": str(earliest.date()),
                "latest_date": str(latest.date()),
                "total_rows": len(df),
                "unique_dates": unique_dates,
                "expected_span_days": expected_days,
                "missing_calendar_dates": missing_dates,
                "missing_date_ratio": round(missing_dates / max(1, expected_days), 4)
            }

            has_30_yr = unique_dates >= (30 * 365)
            if not has_30_yr:
                warnings.append(
                    f"Temporal span ({unique_dates} days) does not satisfy standard 30-year WMO climatology requirements."
                )

        # 2. Spatial Coverage
        blocks = df[spatial_col].unique().tolist() if spatial_col and spatial_col in df.columns else []
        panchayats = df[panchayat_col].unique().tolist() if panchayat_col and panchayat_col in df.columns else []

        if panchayats and len(panchayats) > 0 and not all(pd.isna(panchayats)):
            resolution_level = "PANCHAYAT"
        elif blocks and len(blocks) > 0:
            resolution_level = "BLOCK"
        else:
            resolution_level = "DISTRICT"

        spatial_info = {
            "blocks_count": len(blocks),
            "blocks": [b for b in blocks if pd.notna(b)],
            "panchayats_count": len(panchayats),
            "resolution_level": resolution_level
        }

        if resolution_level != "PANCHAYAT":
            warnings.append(
                f"Spatial resolution is '{resolution_level}'. Village/panchayat micro-scale observations not available in raw feed."
            )

        # 3. Variable Completeness
        completeness_list: List[VariableCompleteness] = []
        checked_vars = self.CRITICAL_MET_VARS + self.CLIMATE_INDICES
        for col in checked_vars:
            present = col in df.columns
            if present:
                tot = len(df)
                nulls = int(df[col].isna().sum())
                null_pct = round((nulls / tot) * 100, 2)
                valid = df[col].dropna()
                c_min = float(valid.min()) if not valid.empty else None
                c_max = float(valid.max()) if not valid.empty else None
                completeness_list.append(VariableCompleteness(
                    variable_name=col,
                    present=True,
                    total_count=tot,
                    null_count=nulls,
                    null_percentage=null_pct,
                    min_value=c_min,
                    max_value=c_max
                ))
                if null_pct > (self.max_missing_ratio * 100):
                    warnings.append(f"Variable '{col}' has high null rate: {null_pct}%.")
            else:
                completeness_list.append(VariableCompleteness(
                    variable_name=col,
                    present=False,
                    total_count=len(df),
                    null_count=len(df),
                    null_percentage=100.0,
                    min_value=None,
                    max_value=None
                ))

        # 4. Target Event Balance
        target_counts: List[TargetBalanceInfo] = []
        targets_to_check = target_cols or ["is_wet_day", "dry_spell_3d", "dry_spell_5d", "heavy_rain_event"]
        for t in targets_to_check:
            if t in df.columns:
                series = df[t].dropna()
                pos = int((series == 1).sum()) if set(series.unique()).issubset({0, 1, 0.0, 1.0}) else int((series > 0).sum())
                neg = len(series) - pos
                ratio = round(pos / max(1, len(series)), 4)
                learnable = (pos >= 2 and neg >= 2)
                target_counts.append(TargetBalanceInfo(
                    target_name=t,
                    total_samples=len(series),
                    positive_count=pos,
                    negative_count=neg,
                    positive_ratio=ratio,
                    is_learnable=learnable
                ))
                if not learnable:
                    warnings.append(f"Target '{t}' has extreme imbalance or insufficient samples (pos: {pos}, neg: {neg}).")

        # 5. Status Determination
        unique_dates_count = temporal_info.get("unique_dates", len(df))
        missing_date_ratio = temporal_info.get("missing_date_ratio", 0.0)

        # Critical failure checks
        if unique_dates_count < self.min_days_partial or missing_date_ratio > 0.50:
            status = AvailabilityStatus.INSUFFICIENT_DATA
            recommendations.append("Acquire broader time-series data before attempting training.")
        elif unique_dates_count < self.min_days_ready:
            status = AvailabilityStatus.PARTIAL
            recommendations.append(
                "Data is sufficient for short-term single-season calibration and baseline comparison. "
                "Tag all models as experimental / limited-data until multi-year archive is ingested."
            )
        else:
            status = AvailabilityStatus.READY
            recommendations.append("Full multi-year historical depth confirmed. Ready for operational downscaling.")

        return DataAvailabilityReport(
            status=status,
            spatial_coverage=spatial_info,
            temporal_coverage=temporal_info,
            variable_completeness=completeness_list,
            target_event_counts=target_counts,
            has_30_year_climatology=has_30_yr,
            spatial_resolution_level=resolution_level,
            warnings=warnings,
            recommendations=recommendations
        )
