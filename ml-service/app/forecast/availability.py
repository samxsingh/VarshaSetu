"""
VarshaSetu - Forecast Data Availability Gate
Evaluates observational data freshness, provider update cadence,
and feature completeness before forecast generation.
Strictly distinguishes current operational weather from historical archives.
"""

from datetime import datetime, timezone, date
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from ..schemas.forecast import DataFreshnessStatus, ForecastAvailabilityResponse


class ForecastAvailabilityGate:
    """
    Evaluates whether input observational data meets operational freshness standards.
    """

    CORE_METEOROLOGICAL_FEATURES = [
        "rainfall_1d", "rainfall_3d", "rainfall_7d", "rainfall_14d",
        "rainy_days_7d", "consecutive_dry_days", "consecutive_wet_days",
        "temperature_2m_max_c", "temperature_2m_min_c", "diurnal_temp_range_c",
        "surface_pressure_hpa", "wind_speed_10m_mps",
        "mjo_amplitude", "mjo_phase",
        "nino34_anomaly", "iod_dmi",
        "day_of_year", "sin_doy", "cos_doy"
    ]

    STALE_THRESHOLD_HOURS: int = 48
    HISTORICAL_THRESHOLD_DAYS: int = 30

    @classmethod
    def evaluate(
        cls,
        df: pd.DataFrame,
        block_id: str = "UP_LKO_BKT",
        reference_date: Optional[datetime] = None
    ) -> ForecastAvailabilityResponse:
        """
        Audits latest observational record for freshness, missingness, and feature completeness.
        """
        now = reference_date or datetime.now(timezone.utc)

        if df.empty or "date" not in df.columns:
            return ForecastAvailabilityResponse(
                block_id=block_id,
                data_freshness=DataFreshnessStatus.MISSING.value,
                latest_observation_date="UNKNOWN",
                days_since_latest_observation=9999,
                features_available=0,
                features_required=len(cls.CORE_METEOROLOGICAL_FEATURES),
                feature_coverage_pct=0.0,
                missingness_pct=100.0,
                expected_cadence="Daily (24h)",
                stale_threshold_hours=cls.STALE_THRESHOLD_HOURS,
                operational_allowed=False,
                scientific_notes="Observational dataset is empty or lacks date indexing."
            )

        # Ensure date format
        dates = pd.to_datetime(df["date"])
        latest_dt = dates.max()
        latest_date_str = latest_dt.strftime("%Y-%m-%d")

        # Calculate time delta
        now_dt = now.replace(tzinfo=None)
        delta_days = (now_dt - latest_dt).days

        # Feature availability
        present_features = [f for f in cls.CORE_METEOROLOGICAL_FEATURES if f in df.columns]
        missing_features = [f for f in cls.CORE_METEOROLOGICAL_FEATURES if f not in df.columns]

        coverage_pct = round(len(present_features) / len(cls.CORE_METEOROLOGICAL_FEATURES) * 100.0, 1)

        # Missingness on latest record
        latest_row = df.iloc[-1]
        null_count = sum(1 for f in present_features if pd.isna(latest_row.get(f)))
        missingness_pct = round((null_count / len(present_features)) * 100.0, 1) if present_features else 100.0

        # Determine freshness status
        if delta_days > cls.HISTORICAL_THRESHOLD_DAYS:
            freshness = DataFreshnessStatus.HISTORICAL_ONLY
            operational_allowed = False
            notes = (
                f"Latest ground observation is from {latest_date_str} ({delta_days} days ago). "
                "Dataset represents a historical archive (Kharif 2024), NOT real-time operational weather. "
                "Forecast generation permitted strictly in DIAGNOSTIC_ONLY mode."
            )
        elif delta_days > (cls.STALE_THRESHOLD_HOURS / 24):
            freshness = DataFreshnessStatus.STALE
            operational_allowed = False
            notes = (
                f"Data is {delta_days} days old, exceeding the operational freshness threshold of "
                f"{cls.STALE_THRESHOLD_HOURS} hours."
            )
        elif missing_features:
            freshness = DataFreshnessStatus.MISSING
            operational_allowed = False
            notes = f"Missing core meteorological features: {missing_features}."
        else:
            freshness = DataFreshnessStatus.FRESH
            operational_allowed = True
            notes = "Observational records satisfy operational cadence and completeness criteria."

        return ForecastAvailabilityResponse(
            block_id=block_id,
            data_freshness=freshness.value,
            latest_observation_date=latest_date_str,
            days_since_latest_observation=delta_days,
            features_available=len(present_features),
            features_required=len(cls.CORE_METEOROLOGICAL_FEATURES),
            feature_coverage_pct=coverage_pct,
            missingness_pct=missingness_pct,
            expected_cadence="Daily (24h)",
            stale_threshold_hours=cls.STALE_THRESHOLD_HOURS,
            operational_allowed=operational_allowed,
            scientific_notes=notes
        )
