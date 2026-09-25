"""
VarshaSetu - Multi-Model Benchmark Comparison
Compares Climatology, Phase 4A Statistical Baselines, XGBoost, and LightGBM
on the EXACT same chronological test partition with zero data leakage.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import numpy as np
from sklearn.metrics import (
    brier_score_loss, log_loss, roc_auc_score, f1_score, accuracy_score,
    mean_absolute_error, root_mean_squared_error
)


class ModelBenchmarkEntry(BaseModel):
    model_id: str
    model_name: str
    model_family: str  # "climatology", "linear_baseline", "xgboost", "lightgbm"
    task_type: str     # "classification" or "regression"
    brier_score: Optional[float] = None
    brier_skill_score: Optional[float] = None  # 1 - (BS_model / BS_clim)
    log_loss: Optional[float] = None
    roc_auc: Optional[float] = None
    f1_score: Optional[float] = None
    accuracy: Optional[float] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mae_skill_score: Optional[float] = None    # 1 - (MAE_model / MAE_clim)
    is_calibrated: bool = False
    has_skill_over_climatology: bool = False
    status: str = "evaluated"


class MultiModelBenchmarkReport(BaseModel):
    target_name: str
    horizon_days: int
    task_type: str
    evaluation_period: str
    test_sample_count: int
    models: List[ModelBenchmarkEntry]
    climatology_reference_val: float
    notes: List[str] = Field(default_factory=list)


class MultiModelBenchmarkComparator:
    """
    Evaluates and compiles uniform benchmark entries across all 4 model paradigms.
    """

    @classmethod
    def evaluate_classification(
        cls,
        target_name: str,
        horizon_days: int,
        evaluation_period: str,
        y_true: np.ndarray,
        predictions_map: Dict[str, Dict[str, Any]]
        # predictions_map format:
        # {
        #   "climatology": {"prob": clim_prob_scalar_or_array, "is_calibrated": True},
        #   "baseline_logistic": {"prob": array, "is_calibrated": True/False},
        #   "xgboost": {"prob": array, "is_calibrated": True/False},
        #   "lightgbm": {"prob": array, "is_calibrated": True/False}
        # }
    ) -> MultiModelBenchmarkReport:
        y_true = np.asarray(y_true, dtype=int)
        n = len(y_true)

        if "climatology" not in predictions_map:
            raise ValueError("climatology predictions must be provided as reference benchmark.")

        # Compute climatology Brier score
        clim_prob_raw = predictions_map["climatology"]["prob"]
        clim_probs = np.full(n, clim_prob_raw) if np.isscalar(clim_prob_raw) else np.asarray(clim_prob_raw)
        clim_brier = float(np.mean((clim_probs - y_true) ** 2))

        entries: List[ModelBenchmarkEntry] = []
        has_two_classes = len(np.unique(y_true)) >= 2

        for model_id, data in predictions_map.items():
            prob = np.full(n, data["prob"]) if np.isscalar(data["prob"]) else np.asarray(data["prob"])
            prob_clipped = np.clip(prob, 1e-6, 1 - 1e-6)
            preds = (prob >= 0.5).astype(int)

            brier = float(np.mean((prob - y_true) ** 2))
            bss = round(1.0 - (brier / clim_brier), 4) if clim_brier > 1e-6 else 0.0
            has_skill = bss > 0.0

            # Compute classification metrics
            acc = float(round(accuracy_score(y_true, preds), 4))
            f1 = float(round(f1_score(y_true, preds, zero_division=0), 4))
            
            # ROC AUC only defined if test set has both classes
            auc = None
            if has_two_classes:
                try:
                    auc = float(round(roc_auc_score(y_true, prob), 4))
                except Exception:
                    auc = None

            ll = None
            try:
                ll = float(round(log_loss(y_true, prob_clipped), 4))
            except Exception:
                ll = None

            family = "climatology"
            if "logistic" in model_id.lower() or "baseline" in model_id.lower():
                family = "linear_baseline"
            elif "xgboost" in model_id.lower():
                family = "xgboost"
            elif "lightgbm" in model_id.lower():
                family = "lightgbm"

            entries.append(ModelBenchmarkEntry(
                model_id=model_id,
                model_name=data.get("name", model_id),
                model_family=family,
                task_type="classification",
                brier_score=round(brier, 4),
                brier_skill_score=bss,
                log_loss=ll,
                roc_auc=auc,
                f1_score=f1,
                accuracy=acc,
                is_calibrated=data.get("is_calibrated", False),
                has_skill_over_climatology=has_skill,
                status="evaluated"
            ))

        return MultiModelBenchmarkReport(
            target_name=target_name,
            horizon_days=horizon_days,
            task_type="classification",
            evaluation_period=evaluation_period,
            test_sample_count=n,
            models=entries,
            climatology_reference_val=float(clim_prob_raw if np.isscalar(clim_prob_raw) else np.mean(clim_probs)),
            notes=[
                f"Evaluated on {n} chronological test samples.",
                "All models evaluated on identical test partition without leakage.",
                "Brier Skill Score measures percentage reduction in Brier score relative to climatology."
            ]
        )

    @classmethod
    def evaluate_regression(
        cls,
        target_name: str,
        horizon_days: int,
        evaluation_period: str,
        y_true: np.ndarray,
        predictions_map: Dict[str, Dict[str, Any]]
    ) -> MultiModelBenchmarkReport:
        y_true = np.asarray(y_true, dtype=float)
        n = len(y_true)

        if "climatology" not in predictions_map:
            raise ValueError("climatology predictions must be provided as reference benchmark.")

        clim_val_raw = predictions_map["climatology"]["pred"]
        clim_preds = np.full(n, clim_val_raw) if np.isscalar(clim_val_raw) else np.asarray(clim_val_raw)
        clim_mae = float(np.mean(np.abs(y_true - clim_preds)))

        entries: List[ModelBenchmarkEntry] = []

        for model_id, data in predictions_map.items():
            pred = np.full(n, data["pred"]) if np.isscalar(data["pred"]) else np.asarray(data["pred"])
            mae = float(np.mean(np.abs(y_true - pred)))
            rmse = float(np.sqrt(np.mean((y_true - pred) ** 2)))

            mss = round(1.0 - (mae / clim_mae), 4) if clim_mae > 1e-6 else 0.0
            has_skill = mss > 0.0

            family = "climatology"
            if "ridge" in model_id.lower() or "baseline" in model_id.lower():
                family = "linear_baseline"
            elif "xgboost" in model_id.lower():
                family = "xgboost"
            elif "lightgbm" in model_id.lower():
                family = "lightgbm"

            entries.append(ModelBenchmarkEntry(
                model_id=model_id,
                model_name=data.get("name", model_id),
                model_family=family,
                task_type="regression",
                mae=round(mae, 3),
                rmse=round(rmse, 3),
                mae_skill_score=mss,
                is_calibrated=False,
                has_skill_over_climatology=has_skill,
                status="evaluated"
            ))

        return MultiModelBenchmarkReport(
            target_name=target_name,
            horizon_days=horizon_days,
            task_type="regression",
            evaluation_period=evaluation_period,
            test_sample_count=n,
            models=entries,
            climatology_reference_val=float(clim_val_raw if np.isscalar(clim_val_raw) else np.mean(clim_preds)),
            notes=[
                f"Evaluated on {n} chronological test samples.",
                "MAE Skill Score measures error reduction relative to climatology mean."
            ]
        )
