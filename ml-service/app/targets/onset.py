from datetime import datetime, date
from typing import Optional, Tuple
import pandas as pd
import numpy as np
from .definitions import target_config, OnsetTargetResult

class MonsoonOnsetDetector:
    """
    Configurable multi-day monsoon onset detection framework.
    Scientific Note:
    This agrometeorological onset definition requires a qualifying rainfall burst 
    (>= 25mm over 3 days with >= 2 rainy days >= 2.5mm) within the Kharif monsoon window.
    Before operational agricultural deployment, regional wind shear (850 hPa westerlies)
    and Outgoing Longwave Radiation (OLR) should be coupled per IMD criteria.
    """

    @classmethod
    def detect_onset_date(
        cls,
        df: pd.DataFrame,
        year: Optional[int] = None,
        config=target_config
    ) -> Optional[str]:
        """Determine the date of confirmed monsoon onset for the specified year."""
        if df.empty or "precipitation_sum_mm" not in df.columns or "date" not in df.columns:
            return None

        data = df.copy()
        data["date"] = pd.to_datetime(data["date"])
        data = data.sort_values("date").reset_index(drop=True)

        if year is not None:
            data = data[data["date"].dt.year == year]

        if data.empty:
            return None

        # Filter to the onset season window (e.g., June 1 to July 15)
        mask_window = (
            (data["date"].dt.month > config.ONSET_SEASON_START_MONTH) |
            ((data["date"].dt.month == config.ONSET_SEASON_START_MONTH) & (data["date"].dt.day >= config.ONSET_SEASON_START_DAY))
        ) & (
            (data["date"].dt.month < config.ONSET_SEASON_END_MONTH) |
            ((data["date"].dt.month == config.ONSET_SEASON_END_MONTH) & (data["date"].dt.day <= config.ONSET_SEASON_END_DAY))
        )
        season_df = data[mask_window].reset_index(drop=True)

        for i in range(len(season_df) - config.ONSET_WINDOW_DAYS + 1):
            window = season_df.iloc[i : i + config.ONSET_WINDOW_DAYS]
            accum_rain = window["precipitation_sum_mm"].sum()
            rainy_days = (window["precipitation_sum_mm"] >= config.RAINY_DAY_THRESHOLD_MM).sum()

            if accum_rain >= config.ONSET_MIN_ACCUMULATED_MM and rainy_days >= config.ONSET_QUALIFYING_DAYS:
                # Onset date is the first qualifying rainy day (>= 2.5mm) of the onset burst spell
                qualifying_days = window[window["precipitation_sum_mm"] >= config.RAINY_DAY_THRESHOLD_MM]
                return str(qualifying_days.iloc[0]["date"].date())

        return None

    @classmethod
    def label_onset_target(cls, df: pd.DataFrame, config=target_config) -> pd.DataFrame:
        """
        Label a timeseries with binary onset status:
        - onset_observed: 1 for dates on or after confirmed onset in that season; 0 prior to onset.
        - target_onset_7d: 1 if onset will occur within next 7 days.
        - target_onset_14d: 1 if onset will occur within next 14 days.
        """
        out = df.copy()
        out["date"] = pd.to_datetime(out["date"])
        out["onset_observed"] = 0
        out["target_onset_7d"] = 0
        out["target_onset_14d"] = 0

        years = out["date"].dt.year.unique()
        for yr in years:
            onset_dt_str = cls.detect_onset_date(out, year=int(yr), config=config)
            if onset_dt_str:
                onset_dt = pd.to_datetime(onset_dt_str)
                yr_mask = out["date"].dt.year == yr
                out.loc[yr_mask & (out["date"] >= onset_dt), "onset_observed"] = 1

                # Forward-looking targets: will onset occur in [t, t + horizon]?
                pre_onset_mask = yr_mask & (out["date"] < onset_dt)
                for idx in out[pre_onset_mask].index:
                    cur_dt = out.loc[idx, "date"]
                    days_to_onset = (onset_dt - cur_dt).days
                    if 0 <= days_to_onset <= 7:
                        out.loc[idx, "target_onset_7d"] = 1
                    if 0 <= days_to_onset <= 14:
                        out.loc[idx, "target_onset_14d"] = 1

        return out
