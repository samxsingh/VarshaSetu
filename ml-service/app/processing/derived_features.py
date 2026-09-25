import pandas as pd
import numpy as np
from typing import Optional
from ..config import settings

class DerivedFeatureCalculator:
    @staticmethod
    def compute_all_monsoon_features(
        df: pd.DataFrame,
        precip_col: str = "precipitation_sum_mm",
        dry_threshold_mm: float = settings.DRY_DAY_THRESHOLD_MM,
        heavy_threshold_mm: float = settings.HEAVY_RAIN_THRESHOLD_MM,
    ) -> pd.DataFrame:
        """Derive rolling sums, spell durations, and intensity flags for Phase 4 ML consumption."""
        if df.empty or precip_col not in df.columns:
            return df

        df = df.copy()
        df = df.sort_values("date").reset_index(drop=True)

        precip = df[precip_col].fillna(0.0)

        # 1. Rolling rainfall accumulations (7-day and 14-day backward windows)
        df["rain_7d_sum_mm"] = precip.rolling(window=7, min_periods=1).sum().round(2)
        df["rain_14d_sum_mm"] = precip.rolling(window=14, min_periods=1).sum().round(2)

        # 2. Configurable Dry Day and Wet Day Boolean Indicators
        df["is_dry_day"] = precip < dry_threshold_mm
        df["is_heavy_rain_event"] = precip >= heavy_threshold_mm

        # 3. Consecutive dry days counter
        consecutive_dry = []
        consecutive_wet = []
        cur_dry = 0
        cur_wet = 0

        for is_dry in df["is_dry_day"]:
            if is_dry:
                cur_dry += 1
                cur_wet = 0
            else:
                cur_wet += 1
                cur_dry = 0
            consecutive_dry.append(cur_dry)
            consecutive_wet.append(cur_wet)

        df["consecutive_dry_days"] = consecutive_dry
        df["consecutive_wet_days"] = consecutive_wet

        # 4. Climatological anomaly baseline (day-of-year normal)
        if "date" in df.columns:
            day_of_year = pd.to_datetime(df["date"]).dt.dayofyear
            # Compute empirical daily climatology across available years, or default 10mm baseline for monsoon
            daily_normals = df.groupby(day_of_year)[precip_col].transform("mean").round(2)
            df["climatological_normal_mm"] = daily_normals
            df["rain_anomaly_mm"] = (precip - daily_normals).round(2)
            df["rain_departure_pct"] = np.where(
                daily_normals > 0.1,
                ((precip - daily_normals) / daily_normals * 100).round(1),
                0.0
            )

        return df
