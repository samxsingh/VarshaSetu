from datetime import datetime, date
from typing import Optional, List, Dict, Any
import pandas as pd
import numpy as np
from .definitions import target_config, DrySpellTargetResult

class DrySpellDetector:
    """
    Configurable Dry Spell & Break Monsoon Detection Engine.
    Distinguishes ordinary agrometeorological dry spells (>= 5 consecutive dry days < 1.0mm)
    from candidate synoptic Break-Monsoon conditions (>= 10 consecutive dry days in July-August).
    """

    @classmethod
    def audit_dry_spells(cls, df: pd.DataFrame, config=target_config) -> List[DrySpellTargetResult]:
        if df.empty or "precipitation_sum_mm" not in df.columns or "date" not in df.columns:
            return []

        data = df.sort_values("date").reset_index(drop=True)
        results: List[DrySpellTargetResult] = []

        in_spell = False
        spell_start_idx = 0
        current_len = 0

        for i, row in data.iterrows():
            rain = float(row["precipitation_sum_mm"])
            is_dry = rain < config.DRY_DAY_THRESHOLD_MM

            if is_dry:
                if not in_spell:
                    in_spell = True
                    spell_start_idx = i
                    current_len = 1
                else:
                    current_len += 1
            else:
                if in_spell and current_len >= config.DRY_SPELL_MIN_DAYS:
                    start_dt = str(pd.to_datetime(data.loc[spell_start_idx, "date"]).date())
                    end_dt = str(pd.to_datetime(data.loc[i - 1, "date"]).date())
                    start_month = pd.to_datetime(start_dt).month

                    is_break = 1 if (current_len >= config.BREAK_MONSOON_MIN_DAYS and start_month in [7, 8]) else 0
                    label = (
                        "CANDIDATE_BREAK_MONSOON" if is_break else
                        "PROLONGED_DRY_SPELL" if current_len >= 7 else
                        "MODERATE_DRY_SPELL"
                    )

                    results.append(DrySpellTargetResult(
                        dry_spell_active=1,
                        duration_days=current_len,
                        start_date=start_dt,
                        end_date=end_dt,
                        break_monsoon_candidate=is_break,
                        status_label=label
                    ))
                in_spell = False
                current_len = 0

        # Handle spell active until the final record
        if in_spell and current_len >= config.DRY_SPELL_MIN_DAYS:
            start_dt = str(pd.to_datetime(data.loc[spell_start_idx, "date"]).date())
            end_dt = str(pd.to_datetime(data.iloc[-1]["date"]).date())
            start_month = pd.to_datetime(start_dt).month
            is_break = 1 if (current_len >= config.BREAK_MONSOON_MIN_DAYS and start_month in [7, 8]) else 0
            label = "CANDIDATE_BREAK_MONSOON" if is_break else "ACTIVE_DRY_SPELL"

            results.append(DrySpellTargetResult(
                dry_spell_active=1,
                duration_days=current_len,
                start_date=start_dt,
                end_date=end_dt,
                break_monsoon_candidate=is_break,
                status_label=label
            ))

        return results

    @classmethod
    def label_dry_spell_target(cls, df: pd.DataFrame, config=target_config) -> pd.DataFrame:
        """
        Label DataFrame with:
        - consecutive_dry_days: running count of consecutive dry days at t.
        - is_dry_spell_active: 1 if currently in a dry spell (>= 5 days).
        - is_break_monsoon_active: 1 if currently in break monsoon condition (>= 10 days in July-Aug).
        - target_dry_spell_7d: 1 if day t is followed by >= 5 dry days in next 7 days.
        - target_dry_spell_14d: 1 if day t is followed by >= 7 dry days in next 14 days.
        """
        out = df.sort_values("date").reset_index(drop=True)
        out["date"] = pd.to_datetime(out["date"])
        n = len(out)

        out["consecutive_dry_days"] = 0
        out["is_dry_spell_active"] = 0
        out["is_break_monsoon_active"] = 0
        out["target_dry_spell_7d"] = 0
        out["target_dry_spell_14d"] = 0

        cdd = 0
        for i in range(n):
            rain = float(out.loc[i, "precipitation_sum_mm"])
            if rain < config.DRY_DAY_THRESHOLD_MM:
                cdd += 1
            else:
                cdd = 0
            out.loc[i, "consecutive_dry_days"] = cdd
            if cdd >= config.DRY_SPELL_MIN_DAYS:
                out.loc[i, "is_dry_spell_active"] = 1
            month = out.loc[i, "date"].month
            if cdd >= config.BREAK_MONSOON_MIN_DAYS and month in [7, 8]:
                out.loc[i, "is_break_monsoon_active"] = 1

        # Forward-looking targets: evaluate future dry spell occurrence
        for i in range(n):
            # 7-day forward window: days i+1 to i+7
            w7 = out.iloc[i + 1 : i + 8]
            if len(w7) == 7:
                dry_in_w7 = (w7["precipitation_sum_mm"] < config.DRY_DAY_THRESHOLD_MM).sum()
                if dry_in_w7 >= config.DRY_SPELL_MIN_DAYS:
                    out.loc[i, "target_dry_spell_7d"] = 1

            # 14-day forward window: days i+1 to i+14
            w14 = out.iloc[i + 1 : i + 15]
            if len(w14) >= 10:
                dry_in_w14 = (w14["precipitation_sum_mm"] < config.DRY_DAY_THRESHOLD_MM).sum()
                if dry_in_w14 >= 7:
                    out.loc[i, "target_dry_spell_14d"] = 1

        return out
