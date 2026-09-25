import math
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
from ..targets.definitions import target_config
from ..targets.onset import MonsoonOnsetDetector
from ..targets.false_onset import FalseOnsetDetector
from ..targets.dry_spell import DrySpellDetector
from ..targets.heavy_rain import HeavyRainDetector
from ..targets.anomaly import RainfallAnomalyCalculator

class FeatureEngineer:
    """
    Temporal Feature Engineering Pipeline for Hyperlocal Monsoon Modeling.
    Transforms raw atmospheric observations and teleconnections into structured, 
    ML-ready feature matrices with strict temporal causality.
    """

    @classmethod
    def generate_features(
        cls,
        weather_df: pd.DataFrame,
        enso_df: Optional[pd.DataFrame] = None,
        iod_df: Optional[pd.DataFrame] = None,
        mjo_df: Optional[pd.DataFrame] = None,
        include_targets: bool = True
    ) -> pd.DataFrame:
        if weather_df.empty:
            raise ValueError("weather_df cannot be empty for feature engineering.")

        df = weather_df.copy()
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date").reset_index(drop=True)

        # ----------------------------------------------------
        # 1. Rainfall Antecedent Features
        # ----------------------------------------------------
        rain = df["precipitation_sum_mm"].astype(float)
        df["rainfall_1d"] = rain
        df["rainfall_3d"] = rain.rolling(window=3, min_periods=1).sum().round(2)
        df["rainfall_7d"] = rain.rolling(window=7, min_periods=1).sum().round(2)
        df["rainfall_14d"] = rain.rolling(window=14, min_periods=1).sum().round(2)
        df["rainfall_30d"] = rain.rolling(window=30, min_periods=1).sum().round(2)

        # Count of rainy days (>= 2.5mm per IMD definition)
        is_rainy_day = (rain >= target_config.RAINY_DAY_THRESHOLD_MM).astype(int)
        df["rainy_days_7d"] = is_rainy_day.rolling(window=7, min_periods=1).sum().astype(int)
        df["rainy_days_14d"] = is_rainy_day.rolling(window=14, min_periods=1).sum().astype(int)

        # Consecutive dry / wet days (strictly causal, 0d running)
        cdd_list = []
        cwd_list = []
        cdd = 0
        cwd = 0
        for r in rain:
            if r < target_config.DRY_DAY_THRESHOLD_MM:
                cdd += 1
                cwd = 0
            else:
                cwd += 1
                cdd = 0
            cdd_list.append(cdd)
            cwd_list.append(cwd)
        df["consecutive_dry_days"] = cdd_list
        df["consecutive_wet_days"] = cwd_list

        # Heavy rain counts in past windows
        is_heavy = (rain >= target_config.HEAVY_RAIN_THRESHOLD_MM).astype(int)
        df["heavy_rain_count_7d"] = is_heavy.rolling(window=7, min_periods=1).sum().astype(int)
        df["heavy_rain_count_14d"] = is_heavy.rolling(window=14, min_periods=1).sum().astype(int)

        # ----------------------------------------------------
        # 2. Temperature & Thermodynamic Features
        # ----------------------------------------------------
        if "temperature_2m_max_c" in df.columns and "temperature_2m_min_c" in df.columns:
            tmax = df["temperature_2m_max_c"].astype(float)
            tmin = df["temperature_2m_min_c"].astype(float)
            df["diurnal_temp_range_c"] = (tmax - tmin).round(2)
        elif "temperature_2m_mean_c" in df.columns:
            df["diurnal_temp_range_c"] = 0.0

        # ----------------------------------------------------
        # 3. Teleconnections Integration (strictly causal)
        # ----------------------------------------------------
        # MJO (Daily)
        if mjo_df is not None and not mjo_df.empty:
            mjo_clean = mjo_df.copy()
            mjo_clean["date"] = pd.to_datetime(mjo_clean["date"])
            mjo_clean = mjo_clean.sort_values("date").drop_duplicates(subset=["date"])

            # Map columns if needed
            if "amplitude" in mjo_clean.columns and "mjo_amplitude" not in mjo_clean.columns:
                mjo_clean["mjo_amplitude"] = mjo_clean["amplitude"].astype(float)
            if "phase" in mjo_clean.columns and "mjo_phase" not in mjo_clean.columns:
                mjo_clean["mjo_phase"] = mjo_clean["phase"].astype(int)

            # Compute lags in MJO before merging to avoid future leakage
            mjo_clean["mjo_amplitude_lag_3d"] = mjo_clean["mjo_amplitude"].shift(3)
            mjo_clean["mjo_amplitude_lag_7d"] = mjo_clean["mjo_amplitude"].shift(7)
            mjo_clean["mjo_amplitude_lag_14d"] = mjo_clean["mjo_amplitude"].shift(14)

            cols_to_merge = ["date", "rmm1", "rmm2", "mjo_phase", "mjo_amplitude",
                             "mjo_amplitude_lag_3d", "mjo_amplitude_lag_7d", "mjo_amplitude_lag_14d"]
            cols_avail = [c for c in cols_to_merge if c in mjo_clean.columns]
            df = pd.merge(df, mjo_clean[cols_avail], on="date", how="left")

        # ENSO (Monthly)
        if enso_df is not None and not enso_df.empty:
            enso_clean = enso_df.copy()
            enso_clean["date"] = pd.to_datetime(enso_clean["date"])
            enso_clean = enso_clean.sort_values("date").drop_duplicates(subset=["date"])
            enso_clean["year_month"] = enso_clean["date"].dt.to_period("M")
            if "anomaly" in enso_clean.columns and "nino34_anomaly" not in enso_clean.columns:
                enso_clean["nino34_anomaly"] = enso_clean["anomaly"].astype(float)
            enso_clean["nino34_lag_1m"] = enso_clean["nino34_anomaly"].shift(1)

            df["year_month"] = df["date"].dt.to_period("M")
            cols = ["year_month", "nino34_anomaly", "nino34_lag_1m"]
            cols_avail = [c for c in cols if c in enso_clean.columns]
            df = pd.merge(df, enso_clean[cols_avail], on="year_month", how="left")
            df = df.drop(columns=["year_month"])

        # IOD (Monthly)
        if iod_df is not None and not iod_df.empty:
            iod_clean = iod_df.copy()
            iod_clean["date"] = pd.to_datetime(iod_clean["date"])
            iod_clean = iod_clean.sort_values("date").drop_duplicates(subset=["date"])
            iod_clean["year_month"] = iod_clean["date"].dt.to_period("M")
            if "dmi_value" in iod_clean.columns and "iod_dmi" not in iod_clean.columns:
                iod_clean["iod_dmi"] = iod_clean["dmi_value"].astype(float)
            iod_clean["iod_dmi_lag_1m"] = iod_clean["iod_dmi"].shift(1)

            df["year_month"] = df["date"].dt.to_period("M")
            cols = ["year_month", "iod_dmi", "iod_dmi_lag_1m"]
            cols_avail = [c for c in cols if c in iod_clean.columns]
            df = pd.merge(df, iod_clean[cols_avail], on="year_month", how="left")
            df = df.drop(columns=["year_month"])

        # ----------------------------------------------------
        # 4. Temporal & Seasonal Cycles
        # ----------------------------------------------------
        doy = df["date"].dt.dayofyear
        df["day_of_year"] = doy
        df["sin_doy"] = np.sin(2 * np.pi * doy / 365.25).round(4)
        df["cos_doy"] = np.cos(2 * np.pi * doy / 365.25).round(4)
        df["month"] = df["date"].dt.month
        # Monsoon day: days relative to June 1 (day 153 in non-leap year)
        df["monsoon_day"] = df["date"].apply(
            lambda d: (d - pd.Timestamp(year=d.year, month=6, day=1)).days
        )

        # ----------------------------------------------------
        # 5. Label Targets if Requested
        # ----------------------------------------------------
        if include_targets:
            df = MonsoonOnsetDetector.label_onset_target(df)
            df = FalseOnsetDetector.label_false_onset_target(df)
            df = DrySpellDetector.label_dry_spell_target(df)
            df = HeavyRainDetector.label_heavy_rain_target(df)
            df = RainfallAnomalyCalculator.label_rainfall_anomaly_targets(df)

        return df
