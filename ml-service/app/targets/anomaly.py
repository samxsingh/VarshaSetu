from typing import Optional, Tuple
import pandas as pd
import numpy as np
from .definitions import RainfallAnomalyCategory, RainfallAnomalyTargetResult

class RainfallAnomalyCalculator:
    """
    Scientific rainfall departure and anomaly evaluation module.
    Computes absolute anomaly and percentage departure against climatological baseline.
    Safe handling of zero or near-zero climatological normals prevents zero-division spikes.
    """

    MIN_CLIMATOLOGY_EPSILON: float = 0.5  # mm (below which percentage departure is clamped / flagged)

    @classmethod
    def classify_percentage_departure(cls, pct_departure: float) -> RainfallAnomalyCategory:
        """
        Classifies rainfall departure percentage into agrometeorological categories:
        - VERY_DEFICIENT: < -60%
        - DEFICIENT: -59% to -20%
        - NORMAL: -19% to +19%
        - EXCESS: +20% to +59%
        - HIGHLY_EXCESS: >= +60%
        """
        if pct_departure <= -60.0:
            return RainfallAnomalyCategory.VERY_DEFICIENT
        elif pct_departure <= -20.0:
            return RainfallAnomalyCategory.DEFICIENT
        elif pct_departure < 20.0:
            return RainfallAnomalyCategory.NORMAL
        elif pct_departure < 60.0:
            return RainfallAnomalyCategory.EXCESS
        else:
            return RainfallAnomalyCategory.HIGHLY_EXCESS

    @classmethod
    def calculate_departure(
        cls,
        observed_mm: float,
        climatology_mm: float
    ) -> RainfallAnomalyTargetResult:
        absolute_anomaly = round(observed_mm - climatology_mm, 2)

        if climatology_mm < cls.MIN_CLIMATOLOGY_EPSILON:
            # When climatological expectation is near-zero (e.g. pre-monsoon dry day),
            # percentage departure is mathematically ill-posed.
            pct = 100.0 if observed_mm >= cls.MIN_CLIMATOLOGY_EPSILON else 0.0
            cat = RainfallAnomalyCategory.HIGHLY_EXCESS if observed_mm >= 10.0 else RainfallAnomalyCategory.NORMAL
            return RainfallAnomalyTargetResult(
                observed_mm=round(observed_mm, 2),
                climatology_mm=round(climatology_mm, 2),
                absolute_anomaly_mm=absolute_anomaly,
                percentage_departure=round(pct, 2),
                category=cat,
                insufficient_climatology=True
            )

        pct = round(((observed_mm - climatology_mm) / climatology_mm) * 100.0, 2)
        cat = cls.classify_percentage_departure(pct)
        return RainfallAnomalyTargetResult(
            observed_mm=round(observed_mm, 2),
            climatology_mm=round(climatology_mm, 2),
            absolute_anomaly_mm=absolute_anomaly,
            percentage_departure=pct,
            category=cat,
            insufficient_climatology=False
        )

    @classmethod
    def label_rainfall_anomaly_targets(
        cls,
        df: pd.DataFrame,
        climatology_daily_col: str = "climatological_normal_mm"
    ) -> pd.DataFrame:
        """
        Label DataFrame with forward cumulative rainfall sums and anomaly departures:
        - target_rain_sum_7d: actual rainfall sum in [t+1, t+7]
        - target_rain_sum_14d: actual rainfall sum in [t+1, t+14]
        - target_rain_anomaly_7d_pct: % departure of 7d future sum vs 7d climatology
        """
        out = df.sort_values("date").reset_index(drop=True)
        out["date"] = pd.to_datetime(out["date"])
        n = len(out)

        out["target_rain_sum_7d"] = np.nan
        out["target_rain_sum_14d"] = np.nan
        out["target_rain_anomaly_7d_pct"] = np.nan
        out["target_anomaly_category_7d"] = None

        has_clim = climatology_daily_col in out.columns

        for i in range(n):
            # 7-day forward window
            w7 = out.iloc[i + 1 : i + 8]
            if len(w7) == 7:
                sum7 = float(w7["precipitation_sum_mm"].sum())
                out.loc[i, "target_rain_sum_7d"] = round(sum7, 2)

                if has_clim:
                    clim7 = float(w7[climatology_daily_col].sum())
                    dep = cls.calculate_departure(sum7, clim7)
                    out.loc[i, "target_rain_anomaly_7d_pct"] = dep.percentage_departure
                    out.loc[i, "target_anomaly_category_7d"] = dep.category.value

            # 14-day forward window
            w14 = out.iloc[i + 1 : i + 15]
            if len(w14) == 14:
                sum14 = float(w14["precipitation_sum_mm"].sum())
                out.loc[i, "target_rain_sum_14d"] = round(sum14, 2)

        return out
