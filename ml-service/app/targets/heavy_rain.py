from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np
from .definitions import target_config, HeavyRainTargetResult

class HeavyRainDetector:
    """
    Centralized Heavy Rainfall Detection & Categorization Framework.
    Threshold source: India Meteorological Department (IMD) Agrometeorological Standard.
    - Heavy Rain: >= 64.5 mm / 24h
    - Very Heavy Rain: >= 115.5 mm / 24h
    - Extremely Heavy Rain: >= 204.5 mm / 24h
    """

    @classmethod
    def categorize_daily_rainfall(cls, amount_mm: float, config=target_config) -> str:
        if amount_mm >= config.EXTREME_RAIN_THRESHOLD_MM:
            return "EXTREMELY_HEAVY_RAIN"
        elif amount_mm >= config.VERY_HEAVY_RAIN_THRESHOLD_MM:
            return "VERY_HEAVY_RAIN"
        elif amount_mm >= config.HEAVY_RAIN_THRESHOLD_MM:
            return "HEAVY_RAIN"
        elif amount_mm >= config.RAINY_DAY_THRESHOLD_MM:
            return "MODERATE_OR_LIGHT_RAIN"
        elif amount_mm >= config.DRY_DAY_THRESHOLD_MM:
            return "VERY_LIGHT_RAIN"
        else:
            return "DRY"

    @classmethod
    def evaluate_record(cls, amount_mm: float, config=target_config) -> HeavyRainTargetResult:
        is_heavy = 1 if amount_mm >= config.HEAVY_RAIN_THRESHOLD_MM else 0
        cat = cls.categorize_daily_rainfall(amount_mm, config=config)
        return HeavyRainTargetResult(
            heavy_rain_observed=is_heavy,
            rainfall_amount_mm=amount_mm,
            category=cat,
            threshold_mm=config.HEAVY_RAIN_THRESHOLD_MM
        )

    @classmethod
    def label_heavy_rain_target(cls, df: pd.DataFrame, config=target_config) -> pd.DataFrame:
        """
        Label DataFrame with:
        - is_heavy_rain_observed: 1 if precipitation_sum_mm >= 64.5 mm at day t.
        - target_heavy_rain_7d: 1 if at least one heavy rain event occurs in [t+1, t+7].
        - target_heavy_rain_14d: 1 if at least one heavy rain event occurs in [t+1, t+14].
        """
        out = df.sort_values("date").reset_index(drop=True)
        out["date"] = pd.to_datetime(out["date"])
        n = len(out)

        out["is_heavy_rain_observed"] = (out["precipitation_sum_mm"] >= config.HEAVY_RAIN_THRESHOLD_MM).astype(int)
        out["rainfall_category"] = out["precipitation_sum_mm"].apply(lambda r: cls.categorize_daily_rainfall(float(r), config=config))
        out["target_heavy_rain_7d"] = 0
        out["target_heavy_rain_14d"] = 0

        for i in range(n):
            # 7-day forward window: days i+1 to i+7
            w7 = out.iloc[i + 1 : i + 8]
            if not w7.empty:
                if (w7["precipitation_sum_mm"] >= config.HEAVY_RAIN_THRESHOLD_MM).any():
                    out.loc[i, "target_heavy_rain_7d"] = 1

            # 14-day forward window: days i+1 to i+14
            w14 = out.iloc[i + 1 : i + 15]
            if not w14.empty:
                if (w14["precipitation_sum_mm"] >= config.HEAVY_RAIN_THRESHOLD_MM).any():
                    out.loc[i, "target_heavy_rain_14d"] = 1

        return out
