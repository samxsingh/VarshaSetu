"""
VarshaSetu - Historical Feature Coverage Inspector
Inspects feature availability across the historical timeline to ensure
models do not silently consume variables outside their valid observation epochs.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
from .schemas import FeatureCoverageItem, FeatureCoverageReport


class FeatureCoverageInspector:
    """
    Analyzes historical temporal coverage and missingness across meteorological variables.
    """

    FEATURE_SOURCE_MAP: Dict[str, str] = {
        "rainfall_1d": "ERA5-Land Surface Reanalysis",
        "rainfall_3d": "Derived Antecedent Rainfall",
        "rainfall_7d": "Derived Antecedent Rainfall",
        "rainfall_14d": "Derived Antecedent Rainfall",
        "rainy_days_7d": "Derived Antecedent Precipitation",
        "consecutive_dry_days": "Derived Surface Moisture Metric",
        "consecutive_wet_days": "Derived Surface Moisture Metric",
        "temperature_2m_max_c": "ERA5-Land Daily Maximum Temperature",
        "temperature_2m_min_c": "ERA5-Land Daily Minimum Temperature",
        "diurnal_temp_range_c": "Derived Temperature Range",
        "surface_pressure_hpa": "ERA5-Land Atmospheric Pressure",
        "wind_speed_10m_mps": "ERA5-Land 10m Vector Wind Speed",
        "mjo_amplitude": "BoM Australia MJO RMM Index",
        "mjo_phase": "BoM Australia MJO Phase",
        "nino34_anomaly": "NOAA CPC Niño 3.4 SST Anomaly",
        "iod_dmi": "BoM Australia Dipole Mode Index",
        "day_of_year": "Astronomical Calendar Coordinate",
        "sin_doy": "Harmonic Seasonality Coordinate",
        "cos_doy": "Harmonic Seasonality Coordinate",
    }

    @classmethod
    def inspect_coverage(
        cls,
        df: pd.DataFrame,
        date_col: str = "date",
        features: Optional[List[str]] = None
    ) -> FeatureCoverageReport:
        """
        Inspects feature date boundaries, missing percentages, and continuity.
        """
        if df is None or len(df) == 0:
            return FeatureCoverageReport(
                total_features=0,
                features_full_coverage=0,
                features_partial_coverage=0,
                temporal_span="None",
                coverage_items=[],
                scientific_notes="No data available for feature coverage analysis."
            )

        df = df.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        min_date = df[date_col].min()
        max_date = df[date_col].max()
        temporal_span = f"{min_date.date()} to {max_date.date()}"

        target_features = features or [c for c in cls.FEATURE_SOURCE_MAP.keys() if c in df.columns]
        items: List[FeatureCoverageItem] = []
        full_count = 0
        partial_count = 0

        for feat in target_features:
            if feat not in df.columns:
                continue

            valid_df = df.dropna(subset=[feat])
            missing_pct = float(round(df[feat].isnull().mean() * 100.0, 2))

            if len(valid_df) > 0:
                first_d = str(valid_df[date_col].min().date())
                last_d = str(valid_df[date_col].max().date())
                avail_years = sorted([int(y) for y in valid_df[date_col].dt.year.unique()])
            else:
                first_d = "N/A"
                last_d = "N/A"
                avail_years = []

            if missing_pct == 0.0:
                coverage_status = "FULL"
                full_count += 1
            elif missing_pct < 20.0:
                coverage_status = "PARTIAL"
                partial_count += 1
            else:
                coverage_status = "INSUFFICIENT"

            source = cls.FEATURE_SOURCE_MAP.get(feat, "Local Feature Engineering")

            items.append(FeatureCoverageItem(
                feature_name=feat,
                first_available_date=first_d,
                last_available_date=last_d,
                available_years=avail_years,
                total_records=len(valid_df),
                missing_percent=missing_pct,
                source=source,
                coverage_status=coverage_status
            ))

        notes = (
            f"Evaluated {len(items)} features over {temporal_span}. "
            f"{full_count} feature(s) with 100% complete coverage, {partial_count} partial."
        )

        return FeatureCoverageReport(
            total_features=len(items),
            features_full_coverage=full_count,
            features_partial_coverage=partial_count,
            temporal_span=temporal_span,
            coverage_items=items,
            scientific_notes=notes
        )
