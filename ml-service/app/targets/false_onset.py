from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np
from .definitions import target_config, FalseOnsetTargetResult
from .onset import MonsoonOnsetDetector

class FalseOnsetDetector:
    """
    Deterministic detector for False Monsoon Onset events.
    A candidate false onset occurs when:
    1. An initial rainfall pulse satisfies the onset burst criteria.
    2. Followed within 14 days by a prolonged desiccation hiatus (>= 7 consecutive dry days < 1.0mm).
    3. Leading to high risk of seed mortality in newly sown Kharif crops.
    """

    @classmethod
    def detect_false_onset(
        cls,
        df: pd.DataFrame,
        year: Optional[int] = None,
        config=target_config
    ) -> FalseOnsetTargetResult:
        if df.empty or "precipitation_sum_mm" not in df.columns or "date" not in df.columns:
            return FalseOnsetTargetResult(
                false_onset_observed=0,
                dry_spell_days_after=0,
                risk_context="Insufficient data for false onset audit."
            )

        onset_dt_str = MonsoonOnsetDetector.detect_onset_date(df, year=year, config=config)
        if not onset_dt_str:
            return FalseOnsetTargetResult(
                false_onset_observed=0,
                dry_spell_days_after=0,
                risk_context="No candidate onset trigger detected in season."
            )

        onset_dt = pd.to_datetime(onset_dt_str)
        data = df.copy()
        data["date"] = pd.to_datetime(data["date"])
        data = data.sort_values("date").reset_index(drop=True)

        # Audit the 14-day window following the onset trigger
        window_end = onset_dt + pd.Timedelta(days=config.FALSE_ONSET_EVALUATION_WINDOW)
        post_onset = data[(data["date"] > onset_dt) & (data["date"] <= window_end)].reset_index(drop=True)

        if post_onset.empty:
            return FalseOnsetTargetResult(
                false_onset_observed=0,
                dry_spell_days_after=0,
                risk_context="Insufficient post-trigger observations to evaluate dry hiatus."
            )

        # Count consecutive dry days in the post-onset window
        max_cdd = 0
        current_cdd = 0
        for r in post_onset["precipitation_sum_mm"]:
            if r < config.DRY_DAY_THRESHOLD_MM:
                current_cdd += 1
                if current_cdd > max_cdd:
                    max_cdd = current_cdd
            else:
                current_cdd = 0

        is_false_onset = 1 if max_cdd >= config.FALSE_ONSET_DRY_DAYS_HIATUS else 0
        risk_context = (
            f"False onset confirmed: onset trigger on {onset_dt_str} was followed by "
            f"{max_cdd} consecutive dry days within {config.FALSE_ONSET_EVALUATION_WINDOW} days. High seed mortality risk."
            if is_false_onset else
            f"Normal onset establishment: maximum dry spell following {onset_dt_str} was {max_cdd} days."
        )

        return FalseOnsetTargetResult(
            false_onset_observed=is_false_onset,
            false_onset_date=onset_dt_str if is_false_onset else None,
            dry_spell_days_after=max_cdd,
            risk_context=risk_context
        )

    @classmethod
    def label_false_onset_target(cls, df: pd.DataFrame, config=target_config) -> pd.DataFrame:
        """Label timeseries with false onset flags and forward targets."""
        out = df.copy()
        out["date"] = pd.to_datetime(out["date"])
        out["false_onset_observed"] = 0
        out["target_false_onset_14d"] = 0

        years = out["date"].dt.year.unique()
        for yr in years:
            res = cls.detect_false_onset(out, year=int(yr), config=config)
            if res.false_onset_observed and res.false_onset_date:
                fo_dt = pd.to_datetime(res.false_onset_date)
                yr_mask = out["date"].dt.year == yr
                out.loc[yr_mask & (out["date"] >= fo_dt), "false_onset_observed"] = 1

                # Prior to false onset trigger, label forward 14d risk
                for idx in out[yr_mask].index:
                    cur_dt = out.loc[idx, "date"]
                    days_diff = (fo_dt - cur_dt).days
                    if 0 <= days_diff <= 14:
                        out.loc[idx, "target_false_onset_14d"] = 1

        return out
