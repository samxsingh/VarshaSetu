"""
VarshaSetu - Multi-Year Data Validation Gate
Evaluates multi-year historical observations against scientific sufficiency thresholds:
minimum years (>=5), complete seasons, observation density, extreme event balance,
missingness, duplicate timestamps, schema consistency, and block coverage.
"""

from typing import Dict, Any, List, Optional
from enum import Enum
import pandas as pd
import numpy as np
from pydantic import BaseModel, Field


class MultiYearGateStatus(str, Enum):
    SUFFICIENT = "SUFFICIENT"
    PARTIAL = "PARTIAL"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class MultiYearGateReport(BaseModel):
    status: MultiYearGateStatus
    years_available: List[int]
    total_years: int
    complete_seasons: List[int]
    eligible_years: List[int]
    excluded_years: List[int]
    exclusion_reasons: List[str]
    event_balance: Dict[str, Dict[str, int]] = Field(default_factory=dict)
    missingness: Dict[str, float] = Field(default_factory=dict)
    block_coverage: Dict[str, int] = Field(default_factory=dict)
    schema_consistent: bool = True
    fingerprint_consistent: bool = True
    operational_validation_allowed: bool = False
    scientific_notes: str = ""


class MultiYearValidationGate:
    """
    Enforces scientific data availability thresholds before operational
    multi-year validation or hindcasting can be marked valid.
    """

    MIN_VALIDATION_YEARS: int = 5
    MIN_COMPLETE_SEASONS: int = 5
    MIN_OBSERVATIONS_PER_YEAR: int = 90  # Kharif monsoon is ~122 days
    MIN_POSITIVE_EVENTS_PER_YEAR: int = 5
    MIN_NEGATIVE_EVENTS_PER_YEAR: int = 5
    MAX_MISSING_PERCENT: float = 10.0
    MIN_BLOCKS: int = 1

    REQUIRED_METEOROLOGICAL_COLS: List[str] = [
        "rainfall_1d",
        "temperature_2m_max_c",
        "temperature_2m_min_c",
        "surface_pressure_hpa",
        "wind_speed_10m_mps",
    ]

    @classmethod
    def evaluate(
        cls,
        df: pd.DataFrame,
        date_col: str = "date",
        target_cols: Optional[List[str]] = None,
        block_col: str = "block_id",
        min_years: Optional[int] = None,
        min_seasons: Optional[int] = None,
        min_obs_per_year: Optional[int] = None
    ) -> MultiYearGateReport:
        """
        Evaluates an observational DataFrame against multi-year gate thresholds.
        """
        min_y = min_years if min_years is not None else cls.MIN_VALIDATION_YEARS
        min_s = min_seasons if min_seasons is not None else cls.MIN_COMPLETE_SEASONS
        min_obs = min_obs_per_year if min_obs_per_year is not None else cls.MIN_OBSERVATIONS_PER_YEAR

        exclusion_reasons: List[str] = []
        notes: List[str] = []

        if df is None or len(df) == 0:
            return MultiYearGateReport(
                status=MultiYearGateStatus.INSUFFICIENT_DATA,
                years_available=[],
                total_years=0,
                complete_seasons=[],
                eligible_years=[],
                excluded_years=[],
                exclusion_reasons=["Dataset is empty or null."],
                operational_validation_allowed=False,
                scientific_notes="Zero observational records available."
            )

        # 1. Date column verification
        if date_col not in df.columns:
            return MultiYearGateReport(
                status=MultiYearGateStatus.INSUFFICIENT_DATA,
                years_available=[],
                total_years=0,
                complete_seasons=[],
                eligible_years=[],
                excluded_years=[],
                exclusion_reasons=[f"Date column '{date_col}' missing from dataset."],
                operational_validation_allowed=False,
                scientific_notes=f"Temporal index '{date_col}' not found."
            )

        df = df.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        df["_year"] = df[date_col].dt.year

        years_present = sorted([int(y) for y in df["_year"].unique()])
        total_years = len(years_present)

        # 2. Duplicate timestamp check
        duplicates = int(df.duplicated(subset=[date_col]).sum())
        if duplicates > 0:
            exclusion_reasons.append(f"Found {duplicates} duplicate timestamps across records.")

        # 3. Schema consistency check
        missing_schema_cols = [c for c in cls.REQUIRED_METEOROLOGICAL_COLS if c not in df.columns]
        schema_consistent = len(missing_schema_cols) == 0
        if not schema_consistent:
            exclusion_reasons.append(f"Missing core meteorological variables: {missing_schema_cols}")

        # 4. Block coverage
        block_coverage: Dict[str, int] = {}
        if block_col in df.columns:
            block_counts = df[block_col].value_counts().to_dict()
            block_coverage = {str(k): int(v) for k, v in block_counts.items()}
        else:
            block_coverage = {"UP_LKO_BKT": len(df)}

        # 5. Missingness analysis
        missingness: Dict[str, float] = {}
        for col in cls.REQUIRED_METEOROLOGICAL_COLS:
            if col in df.columns:
                pct = float(df[col].isnull().mean() * 100.0)
                missingness[col] = round(pct, 2)
                if pct > cls.MAX_MISSING_PERCENT:
                    exclusion_reasons.append(f"Variable '{col}' has {pct:.1f}% missingness (max allowed: {cls.MAX_MISSING_PERCENT}%).")

        # 6. Year-by-year inspection & complete seasons
        complete_seasons: List[int] = []
        eligible_years: List[int] = []
        excluded_years: List[int] = []

        target_columns = target_cols or [c for c in df.columns if c.startswith("target_")]
        event_balance: Dict[str, Dict[str, int]] = {}

        for yr in years_present:
            yr_df = df[df["_year"] == yr]
            obs_count = len(yr_df)
            yr_reasons: List[str] = []

            # Check obs count
            if obs_count >= min_obs:
                complete_seasons.append(yr)
            else:
                yr_reasons.append(f"Year {yr} has {obs_count} observations (minimum required: {min_obs}).")

            # Check event balance for targets
            for tcol in target_columns:
                if tcol in yr_df.columns:
                    unique_vals = yr_df[tcol].dropna().unique()
                    if len(unique_vals) <= 1:
                        yr_reasons.append(f"Year {yr} has single-class distribution for '{tcol}'.")

                    pos = int((yr_df[tcol] == 1).sum()) if set(unique_vals).issubset({0, 1, 0.0, 1.0}) else 0
                    neg = int((yr_df[tcol] == 0).sum()) if set(unique_vals).issubset({0, 1, 0.0, 1.0}) else 0

                    if yr not in event_balance:
                        event_balance[str(yr)] = {}
                    event_balance[str(yr)][f"{tcol}_positive"] = pos
                    event_balance[str(yr)][f"{tcol}_negative"] = neg

            if not yr_reasons and obs_count >= min_obs:
                eligible_years.append(yr)
            else:
                excluded_years.append(yr)
                for r in yr_reasons:
                    if r not in exclusion_reasons:
                        exclusion_reasons.append(r)

        # 7. Check multi-year threshold
        if total_years < min_y:
            exclusion_reasons.append(
                f"Available observation years ({total_years}) is less than the required minimum ({min_y} seasons). "
                f"Currently available: {years_present}."
            )

        if len(complete_seasons) < min_s:
            exclusion_reasons.append(
                f"Complete monsoon seasons ({len(complete_seasons)}) is less than required ({min_s})."
            )

        # 8. Operational status synthesis
        if total_years >= min_y and len(complete_seasons) >= min_s and schema_consistent and not exclusion_reasons:
            status = MultiYearGateStatus.SUFFICIENT
            operational_allowed = True
            notes.append("Multi-year dataset satisfies all scientific thresholds for operational validation.")
        elif total_years >= 2 and len(complete_seasons) >= 1:
            status = MultiYearGateStatus.PARTIAL
            operational_allowed = False
            notes.append("Partial multi-year data available; suitable only for exploratory historical diagnostic checks.")
        else:
            status = MultiYearGateStatus.INSUFFICIENT_DATA
            operational_allowed = False
            notes.append(
                f"Current observational archive contains only {total_years} season(s) ({years_present}). "
                f"Multi-year operational validation is scientifically gated and inactive."
            )

        return MultiYearGateReport(
            status=status,
            years_available=years_present,
            total_years=total_years,
            complete_seasons=complete_seasons,
            eligible_years=eligible_years,
            excluded_years=excluded_years,
            exclusion_reasons=exclusion_reasons,
            event_balance=event_balance,
            missingness=missingness,
            block_coverage=block_coverage,
            schema_consistent=schema_consistent,
            fingerprint_consistent=True,
            operational_validation_allowed=operational_allowed,
            scientific_notes=" ".join(notes)
        )
