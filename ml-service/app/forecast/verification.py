"""
VarshaSetu - Retrospective Forecast Verification Engine
Compares historical forecast records against ground truth observations
when observations become available, calculating empirical forecast skill and error.
"""

from typing import Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np

from ..schemas.forecast import ScientificForecastRecord


class ForecastVerificationResult:
    def __init__(
        self,
        forecast_id: str,
        verification_status: str,  # VERIFIED, PENDING, INSUFFICIENT_OBSERVATION
        observation_value: Optional[float] = None,
        observed_event: Optional[bool] = None,
        lead_time_days: int = 7,
        error_metric: Optional[float] = None,
        skill_details: Optional[Dict[str, Any]] = None,
        notes: str = ""
    ):
        self.forecast_id = forecast_id
        self.verification_status = verification_status
        self.observation_value = observation_value
        self.observed_event = observed_event
        self.lead_time_days = lead_time_days
        self.error_metric = error_metric
        self.skill_details = skill_details or {}
        self.notes = notes

    def to_dict(self) -> Dict[str, Any]:
        return {
            "forecast_id": self.forecast_id,
            "verification_status": self.verification_status,
            "observation_value": self.observation_value,
            "observed_event": self.observed_event,
            "lead_time_days": self.lead_time_days,
            "error_metric": self.error_metric,
            "skill_details": self.skill_details,
            "notes": self.notes
        }


class ForecastVerifier:
    """
    Retrospectively verifies predictions against ground truth observation records.
    """

    @classmethod
    def verify(
        cls,
        forecast: ScientificForecastRecord,
        df_observations: pd.DataFrame,
        date_col: str = "date",
        rainfall_col: str = "precipitation_sum_mm"
    ) -> ForecastVerificationResult:
        """
        Attempts to match forecast valid_until date with an actual ground observation.
        """
        valid_until_str = forecast.valid_until[:10]
        target_name = forecast.target.target_type.upper()
        lead_time = forecast.horizon.horizon_days

        if df_observations.empty or date_col not in df_observations.columns:
            return ForecastVerificationResult(
                forecast_id=forecast.forecast_id,
                verification_status="PENDING",
                lead_time_days=lead_time,
                notes="Observation dataset is empty or unindexed."
            )

        # Look up valid_until date
        obs_df = df_observations.copy()
        obs_df[date_col] = pd.to_datetime(obs_df[date_col]).dt.strftime("%Y-%m-%d")
        matched = obs_df[obs_df[date_col] == valid_until_str]

        if matched.empty:
            return ForecastVerificationResult(
                forecast_id=forecast.forecast_id,
                verification_status="PENDING",
                lead_time_days=lead_time,
                notes=f"Observation for verification date '{valid_until_str}' is not yet in the observational record."
            )

        row = matched.iloc[0]

        # Classification target verification
        if forecast.prediction.probability is not None:
            pred_prob = forecast.prediction.probability
            threshold = forecast.target.threshold or 64.5

            if target_name in ("HEAVY_RAIN", "MONSOON_ONSET", "DRY_SPELL", "FALSE_ONSET"):
                if target_name == "HEAVY_RAIN":
                    rain_val = float(row.get(rainfall_col, 0.0) or 0.0)
                    actual_event = rain_val >= threshold
                elif target_name == "DRY_SPELL":
                    # Check dry spell indicator if present
                    actual_event = bool(row.get("is_dry_day", False))
                else:
                    actual_event = bool(row.get("is_heavy_rain_event", False))

                actual_int = 1 if actual_event else 0
                brier_err = round(float((pred_prob - actual_int) ** 2), 4)

                # Log loss
                eps = 1e-6
                p_clamped = np.clip(pred_prob, eps, 1 - eps)
                log_loss = round(float(-(actual_int * np.log(p_clamped) + (1 - actual_int) * np.log(1 - p_clamped))), 4)

                # Categorical contingency
                predicted_event = pred_prob >= 0.5
                if predicted_event and actual_event:
                    contingency = "HIT"
                elif predicted_event and not actual_event:
                    contingency = "FALSE_ALARM"
                elif not predicted_event and actual_event:
                    contingency = "MISS"
                else:
                    contingency = "CORRECT_REJECTION"

                return ForecastVerificationResult(
                    forecast_id=forecast.forecast_id,
                    verification_status="VERIFIED",
                    observed_event=actual_event,
                    lead_time_days=lead_time,
                    error_metric=brier_err,
                    skill_details={
                        "brier_score": brier_err,
                        "log_loss": log_loss,
                        "contingency_outcome": contingency,
                        "predicted_probability": pred_prob,
                        "observed_event": actual_event
                    },
                    notes=f"Retrospectively verified against ground observation for {valid_until_str}. Outcome: {contingency}."
                )

        # Continuous target verification (RAINFALL_AMOUNT)
        elif forecast.prediction.predicted_value is not None:
            pred_val = forecast.prediction.predicted_value
            actual_val = float(row.get(rainfall_col, 0.0) or 0.0)

            abs_err = round(abs(pred_val - actual_val), 3)
            sq_err = round((pred_val - actual_val) ** 2, 3)
            bias = round(pred_val - actual_val, 3)

            return ForecastVerificationResult(
                forecast_id=forecast.forecast_id,
                verification_status="VERIFIED",
                observation_value=actual_val,
                lead_time_days=lead_time,
                error_metric=abs_err,
                skill_details={
                    "absolute_error_mm": abs_err,
                    "squared_error_mm2": sq_err,
                    "bias_mm": bias,
                    "predicted_value_mm": pred_val,
                    "observed_value_mm": actual_val
                },
                notes=f"Retrospectively verified against ground rainfall for {valid_until_str}. Absolute error: {abs_err} mm."
            )

        return ForecastVerificationResult(
            forecast_id=forecast.forecast_id,
            verification_status="PENDING",
            lead_time_days=lead_time,
            notes="Forecast contains neither probability nor expected value."
        )
