import math
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from pydantic import BaseModel, Field

class BinaryEvaluationReport(BaseModel):
    sample_count: int
    positive_count: int
    negative_count: int
    evaluation_period: str
    brier_score: Optional[float] = None
    log_loss: Optional[float] = None
    roc_auc: Optional[float] = None
    pr_auc: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    expected_calibration_error: Optional[float] = None
    metric_notes: Dict[str, str] = Field(default_factory=dict)

class ContinuousEvaluationReport(BaseModel):
    sample_count: int
    evaluation_period: str
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2_score: Optional[float] = None
    mean_observed: float
    mean_predicted: float
    metric_notes: Dict[str, str] = Field(default_factory=dict)

class MetricsEvaluator:
    """
    Scientific Evaluation Engine for Meteorological Predictions.
    Strict Honesty Rule: Never fabricates zeros for uncalculable metrics;
    returns None accompanied by an explicit scientific justification.
    """

    @classmethod
    def evaluate_binary(
        cls,
        y_true: np.ndarray,
        y_prob: np.ndarray,
        threshold: float = 0.5,
        evaluation_period: str = "N/A"
    ) -> BinaryEvaluationReport:
        y_true = np.asarray(y_true, dtype=int)
        y_prob = np.asarray(y_prob, dtype=float)

        n = len(y_true)
        if n == 0:
            return BinaryEvaluationReport(
                sample_count=0, positive_count=0, negative_count=0,
                evaluation_period=evaluation_period,
                metric_notes={"error": "Empty evaluation dataset."}
            )

        pos_count = int(np.sum(y_true == 1))
        neg_count = int(np.sum(y_true == 0))
        notes: Dict[str, str] = {}

        # 1. Brier Score (Mean Squared Probability Error)
        brier = float(np.mean((y_prob - y_true) ** 2))

        # 2. Log Loss (Binary Cross-Entropy)
        eps = 1e-15
        p_clipped = np.clip(y_prob, eps, 1.0 - eps)
        logloss = float(-np.mean(y_true * np.log(p_clipped) + (1 - y_true) * np.log(1 - p_clipped)))

        # 3. Precision, Recall, F1
        y_pred = (y_prob >= threshold).astype(int)
        tp = int(np.sum((y_true == 1) & (y_pred == 1)))
        fp = int(np.sum((y_true == 0) & (y_pred == 1)))
        fn = int(np.sum((y_true == 1) & (y_pred == 0)))

        prec = None
        if tp + fp > 0:
            prec = float(round(tp / (tp + fp), 4))
        else:
            notes["precision"] = "Zero positive predictions made by model."

        rec = None
        if tp + fn > 0:
            rec = float(round(tp / (tp + fn), 4))
        else:
            notes["recall"] = "Zero positive true events in dataset."

        f1 = None
        if prec is not None and rec is not None and (prec + rec) > 0:
            f1 = float(round(2 * (prec * rec) / (prec + rec), 4))
        else:
            notes["f1_score"] = "F1 undefined when precision or recall is undefined."

        # 4. ROC-AUC (Rank-based Wilcoxon-Mann-Whitney computation)
        roc_auc = None
        if pos_count == 0 or neg_count == 0:
            notes["roc_auc"] = f"ROC-AUC undefined: dataset has only one class (pos={pos_count}, neg={neg_count})."
        else:
            # Vectorized Mann-Whitney U test for exact AUC
            order = np.argsort(y_prob)
            rank = np.empty_like(order, dtype=float)
            rank[order] = np.arange(1, n + 1)
            u_stat = np.sum(rank[y_true == 1]) - (pos_count * (pos_count + 1)) / 2.0
            roc_auc = float(round(u_stat / (pos_count * neg_count), 4))

        # 5. Expected Calibration Error (ECE) across 5 probability bins
        ece = None
        if n >= 10:
            bin_boundaries = np.linspace(0.0, 1.0, 6)
            total_ece = 0.0
            for i in range(len(bin_boundaries) - 1):
                b_min = bin_boundaries[i]
                b_max = bin_boundaries[i + 1]
                in_bin = (y_prob >= b_min) & (y_prob < b_max if i < 4 else y_prob <= b_max)
                bin_count = np.sum(in_bin)
                if bin_count > 0:
                    bin_acc = np.mean(y_true[in_bin])
                    bin_conf = np.mean(y_prob[in_bin])
                    total_ece += (bin_count / n) * abs(bin_acc - bin_conf)
            ece = float(round(total_ece, 4))
        else:
            notes["expected_calibration_error"] = "Insufficient samples (< 10) to partition into probability bins."

        return BinaryEvaluationReport(
            sample_count=n,
            positive_count=pos_count,
            negative_count=neg_count,
            evaluation_period=evaluation_period,
            brier_score=round(brier, 4),
            log_loss=round(logloss, 4),
            roc_auc=roc_auc,
            precision=prec,
            recall=rec,
            f1_score=f1,
            expected_calibration_error=ece,
            metric_notes=notes
        )

    @classmethod
    def evaluate_continuous(
        cls,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        evaluation_period: str = "N/A"
    ) -> ContinuousEvaluationReport:
        y_true = np.asarray(y_true, dtype=float)
        y_pred = np.asarray(y_pred, dtype=float)

        n = len(y_true)
        if n == 0:
            return ContinuousEvaluationReport(
                sample_count=0, evaluation_period=evaluation_period,
                mean_observed=0.0, mean_predicted=0.0,
                metric_notes={"error": "Empty evaluation dataset."}
            )

        mae = float(round(np.mean(np.abs(y_true - y_pred)), 2))
        rmse = float(round(np.sqrt(np.mean((y_true - y_pred) ** 2)), 2))

        # R^2 calculation
        ss_res = np.sum((y_true - y_pred) ** 2)
        ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
        r2 = None
        notes: Dict[str, str] = {}
        if ss_tot > 1e-6:
            r2 = float(round(1.0 - (ss_res / ss_tot), 4))
        else:
            notes["r2_score"] = "R^2 undefined: zero variance in true observed values."

        return ContinuousEvaluationReport(
            sample_count=n,
            evaluation_period=evaluation_period,
            mae=mae,
            rmse=rmse,
            r2_score=r2,
            mean_observed=float(round(np.mean(y_true), 2)),
            mean_predicted=float(round(np.mean(y_pred), 2)),
            metric_notes=notes
        )
