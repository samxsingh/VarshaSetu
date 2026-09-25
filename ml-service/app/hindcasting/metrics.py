"""
VarshaSetu - Hindcasting Metric Calculation Engine
Computes atmospheric and probabilistic forecast verification metrics across
horizons with strict null handling when class balance or sample sizes prevent computation.
Never substitutes zero for 'not computable'.
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from sklearn.metrics import (
    brier_score_loss,
    log_loss,
    roc_auc_score,
    precision_recall_curve,
    auc,
    mean_absolute_error,
    mean_squared_error
)
from .schemas import HorizonEvaluationReport


class HindcastMetricsCalculator:
    """
    Computes mathematically rigorous hindcast metrics.
    """

    @classmethod
    def evaluate_classification(
        cls,
        y_true: np.ndarray,
        y_prob: np.ndarray,
        climatology_prob: float,
        horizon_days: int,
        target_name: str
    ) -> HorizonEvaluationReport:
        """
        Evaluates probabilistic classification forecast on out-of-sample hindcast slice.
        """
        y_true = np.asarray(y_true).astype(int)
        y_prob = np.clip(np.asarray(y_prob).astype(float), 1e-6, 1.0 - 1e-6)

        sample_count = len(y_true)
        event_count = int(np.sum(y_true))
        notes: List[str] = []

        if sample_count == 0:
            return HorizonEvaluationReport(
                horizon_days=horizon_days,
                target_name=target_name,
                task_type="classification",
                sample_count=0,
                status="INSUFFICIENT_DATA",
                notes=["Zero evaluation records available."]
            )

        # 1. Brier Score
        bs = float(round(brier_score_loss(y_true, y_prob), 4))

        # 2. Climatology Brier Score & BSS
        clim_prob_clipped = np.clip(climatology_prob, 1e-6, 1.0 - 1e-6)
        bs_clim = float(np.mean((clim_prob_clipped - y_true) ** 2))

        bss: Optional[float] = None
        has_skill: Optional[bool] = None
        if bs_clim > 1e-6:
            bss_val = 1.0 - (bs / bs_clim)
            bss = float(round(bss_val, 4))
            has_skill = bool(bss > 0.0)
        else:
            notes.append("BSS undefined: Climatology reference has zero variance in test partition.")

        # 3. Log Loss
        ll: Optional[float] = None
        try:
            ll = float(round(log_loss(y_true, y_prob, labels=[0, 1]), 4))
        except Exception as e:
            notes.append(f"Log loss calculation omitted: {str(e)}")

        # 4. ROC-AUC & PR-AUC
        roc_auc: Optional[float] = None
        pr_auc: Optional[float] = None
        unique_classes = np.unique(y_true)

        if len(unique_classes) >= 2:
            try:
                roc_auc = float(round(roc_auc_score(y_true, y_prob), 4))
            except Exception as e:
                notes.append(f"ROC-AUC failed: {str(e)}")

            try:
                precision, recall, _ = precision_recall_curve(y_true, y_prob)
                pr_auc = float(round(auc(recall, precision), 4))
            except Exception as e:
                notes.append(f"PR-AUC failed: {str(e)}")
        else:
            notes.append(
                f"ROC-AUC and PR-AUC not computable: only class {unique_classes[0]} present in test partition."
            )

        # 5. Expected Calibration Error (ECE)
        ece: Optional[float] = None
        if sample_count >= 10:
            bins = np.linspace(0.0, 1.0, 11)
            bin_indices = np.digitize(y_prob, bins) - 1
            ece_val = 0.0
            for b in range(10):
                mask = bin_indices == b
                if np.any(mask):
                    n_b = np.sum(mask)
                    mean_pred = np.mean(y_prob[mask])
                    mean_obs = np.mean(y_true[mask])
                    ece_val += (n_b / sample_count) * abs(mean_obs - mean_pred)
            ece = float(round(ece_val, 4))
        else:
            notes.append("ECE omitted: sample count < 10 records.")

        return HorizonEvaluationReport(
            horizon_days=horizon_days,
            target_name=target_name,
            task_type="classification",
            sample_count=sample_count,
            event_count=event_count,
            brier_score=bs,
            brier_skill_score=bss,
            log_loss=ll,
            roc_auc=roc_auc,
            pr_auc=pr_auc,
            expected_calibration_error=ece,
            skill_relative_to_climatology=has_skill,
            status="EVALUATED",
            notes=notes
        )

    @classmethod
    def evaluate_regression(
        cls,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        climatology_mean: float,
        horizon_days: int,
        target_name: str
    ) -> HorizonEvaluationReport:
        """
        Evaluates quantitative precipitation or temperature regression hindcast.
        """
        y_true = np.asarray(y_true).astype(float)
        y_pred = np.asarray(y_pred).astype(float)

        sample_count = len(y_true)
        notes: List[str] = []

        if sample_count == 0:
            return HorizonEvaluationReport(
                horizon_days=horizon_days,
                target_name=target_name,
                task_type="regression",
                sample_count=0,
                status="INSUFFICIENT_DATA",
                notes=["Zero evaluation records available."]
            )

        mae = float(round(mean_absolute_error(y_true, y_pred), 3))
        rmse = float(round(np.sqrt(mean_squared_error(y_true, y_pred)), 3))

        mae_clim = float(mean_absolute_error(y_true, np.full_like(y_true, climatology_mean)))
        mss: Optional[float] = None
        has_skill: Optional[bool] = None

        if mae_clim > 1e-4:
            mss_val = 1.0 - (mae / mae_clim)
            mss = float(round(mss_val, 4))
            has_skill = bool(mss > 0.0)
        else:
            notes.append("MAE skill score undefined: Climatology baseline has zero error.")

        return HorizonEvaluationReport(
            horizon_days=horizon_days,
            target_name=target_name,
            task_type="regression",
            sample_count=sample_count,
            event_count=None,
            mae=mae,
            rmse=rmse,
            mae_skill_score=mss,
            skill_relative_to_climatology=has_skill,
            status="EVALUATED",
            notes=notes
        )
