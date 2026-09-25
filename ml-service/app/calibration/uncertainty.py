"""
VarshaSetu - Continuous Forecast Uncertainty
Estimates empirical prediction intervals and residual error dispersion
for quantitative precipitation forecasts (rainfall amount / accumulation).
Refuses ungrounded uncertainty claims when empirical samples are insufficient.
"""

from typing import Dict, Any, Optional, Tuple
import numpy as np

from .schemas import ContinuousUncertaintyReport


class ContinuousUncertaintyEstimator:
    """
    Computes empirical error dispersion and residual quantiles for continuous targets.
    """

    MIN_SAMPLES_FOR_INTERVALS = 20

    @classmethod
    def estimate_uncertainty(
        cls,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        model_id: str = "regressor",
        target_name: str = "RAINFALL_AMOUNT"
    ) -> ContinuousUncertaintyReport:
        y_true = np.asarray(y_true, dtype=float)
        y_pred = np.asarray(y_pred, dtype=float)
        n = len(y_true)

        if n < cls.MIN_SAMPLES_FOR_INTERVALS:
            return ContinuousUncertaintyReport(
                model_id=model_id,
                target_name=target_name,
                uncertainty_status="INSUFFICIENT_DATA",
                sample_count=n,
                mae=float(round(np.mean(np.abs(y_true - y_pred)), 3)) if n > 0 else 0.0,
                rmse=float(round(np.sqrt(np.mean((y_true - y_pred) ** 2)), 3)) if n > 0 else 0.0,
                residual_std=float(round(np.std(y_true - y_pred), 3)) if n > 1 else 0.0,
                median_absolute_error=float(round(np.median(np.abs(y_true - y_pred)), 3)) if n > 0 else 0.0,
                p10_residual=None,
                p50_residual=None,
                p90_residual=None,
                distinction_notes=(
                    f"Sample count ({n} < {cls.MIN_SAMPLES_FOR_INTERVALS}) is insufficient for robust quantile estimation. "
                    "Prediction intervals remain INACTIVE to prevent fabricated confidence."
                )
            )

        residuals = y_true - y_pred
        mae = float(round(np.mean(np.abs(residuals)), 3))
        rmse = float(round(np.sqrt(np.mean(residuals ** 2)), 3))
        r_std = float(round(np.std(residuals), 3))
        med_ae = float(round(np.median(np.abs(residuals)), 3))

        p10 = float(round(np.percentile(residuals, 10), 3))
        p50 = float(round(np.percentile(residuals, 50), 3))
        p90 = float(round(np.percentile(residuals, 90), 3))

        return ContinuousUncertaintyReport(
            model_id=model_id,
            target_name=target_name,
            uncertainty_status="EVALUATED",
            sample_count=n,
            mae=mae,
            rmse=rmse,
            residual_std=r_std,
            median_absolute_error=med_ae,
            p10_residual=p10,
            p50_residual=p50,
            p90_residual=p90,
            distinction_notes=(
                "Residual quantiles (P10, P50, P90) represent empirical prediction intervals under exchangeability assumptions, "
                "not epistemic confidence intervals or observational measurement error bounds."
            )
        )
