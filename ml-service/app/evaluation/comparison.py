from typing import Dict, Any, List, Optional
import numpy as np
from pydantic import BaseModel, Field
from .metrics import BinaryEvaluationReport, ContinuousEvaluationReport

class BaselineComparisonReport(BaseModel):
    model_name: str
    target_name: str
    horizon_days: int
    evaluation_period: str
    sample_count: int
    model_brier_score: Optional[float] = None
    climatology_brier_score: Optional[float] = None
    brier_skill_score: Optional[float] = None  # 1 - (Brier_model / Brier_clim)
    model_mae: Optional[float] = None
    climatology_mae: Optional[float] = None
    mae_skill_score: Optional[float] = None
    has_skill_over_climatology: bool
    scientific_summary: str

class BaselineComparator:
    """
    Scientific Comparison Engine: Model vs Empirical Climatology.
    Quantifies genuine skill score (BSS / MSS) over climatological expectation.
    """

    @classmethod
    def compare_binary(
        cls,
        y_true: np.ndarray,
        model_prob: np.ndarray,
        climatology_prob: float,
        model_name: str = "LogisticRegressionBaseline",
        target_name: str = "HEAVY_RAIN",
        horizon_days: int = 7,
        evaluation_period: str = "N/A"
    ) -> BaselineComparisonReport:
        y_true = np.asarray(y_true, dtype=int)
        model_prob = np.asarray(model_prob, dtype=float)
        n = len(y_true)

        if n == 0:
            return BaselineComparisonReport(
                model_name=model_name,
                target_name=target_name,
                horizon_days=horizon_days,
                evaluation_period=evaluation_period,
                sample_count=0,
                has_skill_over_climatology=False,
                scientific_summary="No evaluation samples available for comparison."
            )

        # Climatology vector
        clim_vec = np.full(n, climatology_prob, dtype=float)

        brier_model = float(np.mean((model_prob - y_true) ** 2))
        brier_clim = float(np.mean((clim_vec - y_true) ** 2))

        bss = None
        has_skill = False
        if brier_clim > 1e-6:
            bss = float(round(1.0 - (brier_model / brier_clim), 4))
            has_skill = bss > 0.0

        if bss is not None:
            if bss > 0.0:
                summary = (
                    f"Model demonstrates positive skill over historical climatology "
                    f"(Brier Skill Score = {bss:+.4f}; model error {brier_model:.4f} vs climatology {brier_clim:.4f})."
                )
            elif bss == 0.0:
                summary = "Model performance is identical to climatological frequency baseline (BSS = 0.0000)."
            else:
                summary = (
                    f"Model does NOT improve over historical climatology "
                    f"(BSS = {bss:+.4f}; climatology baseline {brier_clim:.4f} outperforms model {brier_model:.4f})."
                )
        else:
            summary = "Climatology baseline has near-zero variance; BSS undefined."

        return BaselineComparisonReport(
            model_name=model_name,
            target_name=target_name,
            horizon_days=horizon_days,
            evaluation_period=evaluation_period,
            sample_count=n,
            model_brier_score=round(brier_model, 4),
            climatology_brier_score=round(brier_clim, 4),
            brier_skill_score=bss,
            has_skill_over_climatology=has_skill,
            scientific_summary=summary
        )

    @classmethod
    def compare_continuous(
        cls,
        y_true: np.ndarray,
        model_pred: np.ndarray,
        climatology_val: float,
        model_name: str = "RidgeRegressionBaseline",
        target_name: str = "RAINFALL_AMOUNT",
        horizon_days: int = 7,
        evaluation_period: str = "N/A"
    ) -> BaselineComparisonReport:
        y_true = np.asarray(y_true, dtype=float)
        model_pred = np.asarray(model_pred, dtype=float)
        n = len(y_true)

        if n == 0:
            return BaselineComparisonReport(
                model_name=model_name,
                target_name=target_name,
                horizon_days=horizon_days,
                evaluation_period=evaluation_period,
                sample_count=0,
                has_skill_over_climatology=False,
                scientific_summary="No evaluation samples available for comparison."
            )

        clim_vec = np.full(n, climatology_val, dtype=float)
        mae_model = float(np.mean(np.abs(y_true - model_pred)))
        mae_clim = float(np.mean(np.abs(y_true - clim_vec)))

        mss = None
        has_skill = False
        if mae_clim > 1e-6:
            mss = float(round(1.0 - (mae_model / mae_clim), 4))
            has_skill = mss > 0.0

        if mss is not None and mss > 0.0:
            summary = f"Model has skill over climatology (MAE Skill Score = {mss:+.4f}, MAE: {mae_model:.2f}mm vs {mae_clim:.2f}mm)."
        else:
            summary = f"Model does NOT outperform climatology (MSS = {mss if mss is not None else 'N/A'}, MAE: {mae_model:.2f}mm vs {mae_clim:.2f}mm)."

        return BaselineComparisonReport(
            model_name=model_name,
            target_name=target_name,
            horizon_days=horizon_days,
            evaluation_period=evaluation_period,
            sample_count=n,
            model_mae=round(mae_model, 2),
            climatology_mae=round(mae_clim, 2),
            mae_skill_score=mss,
            has_skill_over_climatology=has_skill,
            scientific_summary=summary
        )
