from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from pydantic import BaseModel, Field
from ..targets.definitions import target_config

class ClimatologyBaselineResult(BaseModel):
    geography: str
    target: str
    horizon_days: int
    historical_period_start: str
    historical_period_end: str
    sample_records_count: int
    distinct_years_count: int
    status: str  # "AVAILABLE" or "INSUFFICIENT_HISTORY"
    baseline_probability: Optional[float] = None
    baseline_expected_value: Optional[float] = None
    historical_variance: Optional[float] = None
    scientific_notes: str

class ClimatologyEngine:
    """
    Empirical Climatological Baseline Estimator.
    Calculates historical event frequencies and expected rainfall values without ML modeling.
    Honesty Guardrail: Never claims 30-year climatological normal when records span limited seasons.
    """

    MIN_SEASONS_FOR_FULL_CLIMATOLOGY: int = 10  # Scientific standard for robust multi-decadal climatology

    @classmethod
    def compute_daily_climatology(
        cls,
        df: pd.DataFrame,
        rainfall_col: str = "precipitation_sum_mm"
    ) -> pd.DataFrame:
        """Calculate day-of-year mean and standard deviation from observations."""
        data = df.copy()
        data["date"] = pd.to_datetime(data["date"])
        data["day_of_year"] = data["date"].dt.dayofyear

        grouped = data.groupby("day_of_year")[rainfall_col].agg(
            mean_rain="mean",
            std_rain="std",
            rainy_days_count=lambda x: (x >= target_config.RAINY_DAY_THRESHOLD_MM).sum(),
            heavy_rain_count=lambda x: (x >= target_config.HEAVY_RAIN_THRESHOLD_MM).sum(),
            total_observations="count"
        ).reset_index()

        grouped["prob_rainy_day"] = grouped["rainy_days_count"] / grouped["total_observations"]
        grouped["prob_heavy_rain"] = grouped["heavy_rain_count"] / grouped["total_observations"]
        grouped["std_rain"] = grouped["std_rain"].fillna(0.0)

        return grouped

    @classmethod
    def get_target_climatology(
        cls,
        df: pd.DataFrame,
        target_name: str,
        horizon_days: int = 7,
        geography_id: str = "UP_LKO_BKT"
    ) -> ClimatologyBaselineResult:
        if df.empty or "date" not in df.columns:
            return ClimatologyBaselineResult(
                geography=geography_id,
                target=target_name,
                horizon_days=horizon_days,
                historical_period_start="N/A",
                historical_period_end="N/A",
                sample_records_count=0,
                distinct_years_count=0,
                status="INSUFFICIENT_HISTORY",
                scientific_notes="No observation data provided for climatology estimation."
            )

        data = df.copy()
        data["date"] = pd.to_datetime(data["date"])
        p_start = str(data["date"].min().date())
        p_end = str(data["date"].max().date())
        n_records = len(data)
        n_years = data["date"].dt.year.nunique()

        status = "AVAILABLE"
        note = (
            f"Climatology calculated across {n_years} season(s) ({p_start} to {p_end}) over {n_records} daily records. "
            f"Notice: Multi-decadal (30-year) IMD normal requires extended multi-year assimilation."
        )

        prob = None
        exp_val = None
        var_val = None

        if target_name in ["HEAVY_RAIN", "heavy_rain"]:
            col = f"target_heavy_rain_{horizon_days}d"
            if col in data.columns and data[col].notnull().any():
                s = data[col].dropna()
                prob = float(round(s.mean(), 4))
                var_val = float(round(s.var(), 4))
            elif "precipitation_sum_mm" in data.columns:
                s = (data["precipitation_sum_mm"] >= target_config.HEAVY_RAIN_THRESHOLD_MM).astype(int)
                prob = float(round(s.mean(), 4))
                var_val = float(round(s.var(), 4))

        elif target_name in ["DRY_SPELL_BREAK", "dry_spell"]:
            col = f"target_dry_spell_{horizon_days}d"
            if col in data.columns and data[col].notnull().any():
                s = data[col].dropna()
                prob = float(round(s.mean(), 4))
                var_val = float(round(s.var(), 4))
            elif "is_dry_spell_active" in data.columns:
                s = data["is_dry_spell_active"].dropna()
                prob = float(round(s.mean(), 4))
                var_val = float(round(s.var(), 4))

        elif target_name in ["MONSOON_ONSET", "onset"]:
            col = f"target_onset_{horizon_days}d"
            if col in data.columns and data[col].notnull().any():
                s = data[col].dropna()
                prob = float(round(s.mean(), 4))
                var_val = float(round(s.var(), 4))

        elif target_name in ["FALSE_ONSET", "false_onset"]:
            col = "target_false_onset_14d"
            if col in data.columns and data[col].notnull().any():
                s = data[col].dropna()
                prob = float(round(s.mean(), 4))
                var_val = float(round(s.var(), 4))

        elif target_name in ["RAINFALL_ANOMALY", "anomaly", "rainfall_amount"]:
            col = f"target_rain_sum_{horizon_days}d"
            if col in data.columns and data[col].notnull().any():
                s = data[col].dropna()
                exp_val = float(round(s.mean(), 2))
                var_val = float(round(s.var(), 2))
            elif "precipitation_sum_mm" in data.columns:
                daily_mean = float(data["precipitation_sum_mm"].mean())
                exp_val = float(round(daily_mean * horizon_days, 2))
                var_val = float(round(data["precipitation_sum_mm"].var(), 2))

        return ClimatologyBaselineResult(
            geography=geography_id,
            target=target_name,
            horizon_days=horizon_days,
            historical_period_start=p_start,
            historical_period_end=p_end,
            sample_records_count=n_records,
            distinct_years_count=n_years,
            status=status,
            baseline_probability=prob,
            baseline_expected_value=exp_val,
            historical_variance=var_val,
            scientific_notes=note
        )
