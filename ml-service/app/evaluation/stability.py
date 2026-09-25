"""
VarshaSetu - Multi-Year Stability Analysis Engine
Computes year-by-year forecast performance stability, cross-season variance,
and identifies historical anomaly years where model performance degraded.
"""

from typing import Dict, Any, List, Optional
import numpy as np
from ..hindcasting.schemas import (
    YearlyStabilityReport,
    StabilityDistributionStats,
    HindcastStabilityAnalysis
)


class StabilityAnalyzer:
    """
    Computes year-by-year forecast skill stability metrics without subjective rankings.
    """

    @classmethod
    def calculate_distribution_stats(
        cls,
        values: List[float],
        metric_name: str
    ) -> StabilityDistributionStats:
        """
        Calculates mean, median, std, min, max, and IQR for a metric series across years.
        """
        clean = [v for v in values if v is not None and not np.isnan(v)]
        if not clean:
            return StabilityDistributionStats(metric_name=metric_name, count=0)

        arr = np.array(clean)
        q75, q25 = np.percentile(arr, [75, 25])
        iqr = float(round(q75 - q25, 4))

        return StabilityDistributionStats(
            metric_name=metric_name,
            count=len(arr),
            mean=float(round(np.mean(arr), 4)),
            median=float(round(np.median(arr), 4)),
            std=float(round(np.std(arr), 4)) if len(arr) > 1 else 0.0,
            min=float(round(np.min(arr), 4)),
            max=float(round(np.max(arr), 4)),
            iqr=iqr
        )

    @classmethod
    def analyze_stability(
        cls,
        yearly_reports: List[YearlyStabilityReport],
        target_name: str,
        horizon_days: int,
        model_id: str
    ) -> HindcastStabilityAnalysis:
        """
        Synthesizes stability across yearly evaluation records.
        """
        years_evaluated = [r.year for r in yearly_reports]
        total_years = len(years_evaluated)

        if total_years == 0:
            return HindcastStabilityAnalysis(
                target_name=target_name,
                horizon_days=horizon_days,
                model_id=model_id,
                years_evaluated=[],
                total_years=0,
                yearly_reports=[],
                distribution_stats={},
                degraded_years=[],
                stability_status="INSUFFICIENT_SEASONS",
                notes="Zero historical years available for stability analysis."
            )

        # Extract metric arrays
        bs_vals = [r.brier_score for r in yearly_reports if r.brier_score is not None]
        bss_vals = [r.brier_skill_score for r in yearly_reports if r.brier_skill_score is not None]
        mae_vals = [r.mae for r in yearly_reports if r.mae is not None]
        rmse_vals = [r.rmse for r in yearly_reports if r.rmse is not None]
        roc_vals = [r.roc_auc for r in yearly_reports if r.roc_auc is not None]

        dist_stats: Dict[str, StabilityDistributionStats] = {}
        if bs_vals:
            dist_stats["brier_score"] = cls.calculate_distribution_stats(bs_vals, "brier_score")
        if bss_vals:
            dist_stats["brier_skill_score"] = cls.calculate_distribution_stats(bss_vals, "brier_skill_score")
        if mae_vals:
            dist_stats["mae"] = cls.calculate_distribution_stats(mae_vals, "mae")
        if rmse_vals:
            dist_stats["rmse"] = cls.calculate_distribution_stats(rmse_vals, "rmse")
        if roc_vals:
            dist_stats["roc_auc"] = cls.calculate_distribution_stats(roc_vals, "roc_auc")

        # Identify degraded years (where Brier Score or MAE exceeds mean + 1.5 * std, or BSS < -0.1)
        degraded_years: List[int] = []
        if total_years >= 3 and bs_vals:
            mean_bs = float(np.mean(bs_vals))
            std_bs = float(np.std(bs_vals))
            threshold_bs = mean_bs + 1.5 * std_bs

            for r in yearly_reports:
                if r.brier_score is not None and r.brier_score > threshold_bs:
                    r.is_degraded = True
                    degraded_years.append(r.year)
                elif r.brier_skill_score is not None and r.brier_skill_score < -0.2:
                    r.is_degraded = True
                    if r.year not in degraded_years:
                        degraded_years.append(r.year)

        if total_years < 3:
            status = "INSUFFICIENT_SEASONS"
            notes = (
                f"Historical record spans {total_years} season(s). Cross-season stability and variance "
                f"statistics require >= 3 observation seasons for meaningful assessment."
            )
        elif len(degraded_years) > (total_years // 2):
            status = "VARIABLE"
            notes = f"Significant performance variability detected across years. Degraded years: {degraded_years}."
        else:
            status = "STABLE"
            notes = f"Model performance is temporally robust across {total_years} evaluated seasons."

        return HindcastStabilityAnalysis(
            target_name=target_name,
            horizon_days=horizon_days,
            model_id=model_id,
            years_evaluated=years_evaluated,
            total_years=total_years,
            yearly_reports=yearly_reports,
            distribution_stats=dist_stats,
            degraded_years=degraded_years,
            stability_status=status,
            notes=notes
        )
