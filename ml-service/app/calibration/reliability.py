"""
VarshaSetu - Reliability Diagrams & Brier Score Decomposition
Calculates discrete probability binning, Expected Calibration Error (ECE),
Maximum Calibration Error (MCE), and Murphy (1973) Brier Score decomposition.
Safely handles empty bins without fabricating values.
"""

from typing import List, Dict, Any, Optional, Tuple
import numpy as np

from .schemas import (
    ReliabilityBin,
    ReliabilityReport,
    BrierDecompositionReport
)


class ReliabilityAnalyzer:
    """
    Computes empirical reliability, ECE, MCE, and Brier decomposition.
    """

    CLIPPING_BOUNDS = (1e-6, 1.0 - 1e-6)

    @classmethod
    def compute_reliability(
        cls,
        y_true: np.ndarray,
        y_prob: np.ndarray,
        num_bins: int = 10,
        model_id: str = "model",
        target_name: str = "HEAVY_RAIN",
        evaluation_period: str = "N/A",
        diagnostic_only: bool = False
    ) -> ReliabilityReport:
        y_true = np.asarray(y_true, dtype=float)
        y_prob = np.asarray(y_prob, dtype=float)
        n = len(y_true)

        if n == 0:
            return ReliabilityReport(
                model_id=model_id,
                target_name=target_name,
                num_bins=num_bins,
                bins=[],
                expected_calibration_error=0.0,
                maximum_calibration_error=0.0,
                brier_score=0.0,
                log_loss=0.0,
                probabilities_clipped=False,
                evaluation_period=evaluation_period,
                sample_count=0,
                diagnostic_only=diagnostic_only
            )

        # Track clipping
        clipped = bool(np.any(y_prob <= cls.CLIPPING_BOUNDS[0]) or np.any(y_prob >= cls.CLIPPING_BOUNDS[1]))
        p_safe = np.clip(y_prob, cls.CLIPPING_BOUNDS[0], cls.CLIPPING_BOUNDS[1])

        # Brier Score & Log Loss
        brier = float(np.mean((y_prob - y_true) ** 2))
        ll = float(-np.mean(y_true * np.log(p_safe) + (1.0 - y_true) * np.log(1.0 - p_safe)))

        # Define bin edges
        bin_edges = np.linspace(0.0, 1.0, num_bins + 1)
        bins_list: List[ReliabilityBin] = []
        weighted_errors = []
        calibration_errors = []

        for b_idx in range(num_bins):
            b_low = float(bin_edges[b_idx])
            b_high = float(bin_edges[b_idx + 1])

            # Edge condition: include upper bound on last bin
            if b_idx == num_bins - 1:
                mask = (y_prob >= b_low) & (y_prob <= b_high)
            else:
                mask = (y_prob >= b_low) & (y_prob < b_high)

            bin_count = int(np.sum(mask))

            if bin_count > 0:
                p_mean = float(np.mean(y_prob[mask]))
                o_freq = float(np.mean(y_true[mask]))
                cal_err = float(abs(p_mean - o_freq))

                bins_list.append(ReliabilityBin(
                    bin_index=b_idx,
                    bin_lower=round(b_low, 3),
                    bin_upper=round(b_high, 3),
                    predicted_prob_mean=round(p_mean, 4),
                    observed_frequency=round(o_freq, 4),
                    sample_count=bin_count,
                    calibration_error=round(cal_err, 4)
                ))

                weighted_errors.append((bin_count / n) * cal_err)
                calibration_errors.append(cal_err)
            else:
                # Safe empty bin representation - NEVER invent values
                bins_list.append(ReliabilityBin(
                    bin_index=b_idx,
                    bin_lower=round(b_low, 3),
                    bin_upper=round(b_high, 3),
                    predicted_prob_mean=None,
                    observed_frequency=None,
                    sample_count=0,
                    calibration_error=None
                ))

        ece = float(round(sum(weighted_errors), 4)) if weighted_errors else 0.0
        mce = float(round(max(calibration_errors), 4)) if calibration_errors else 0.0

        return ReliabilityReport(
            model_id=model_id,
            target_name=target_name,
            num_bins=num_bins,
            bins=bins_list,
            expected_calibration_error=ece,
            maximum_calibration_error=mce,
            brier_score=round(brier, 4),
            log_loss=round(ll, 4),
            probabilities_clipped=clipped,
            clipping_bounds=cls.CLIPPING_BOUNDS,
            evaluation_period=evaluation_period,
            sample_count=n,
            diagnostic_only=diagnostic_only
        )

    @classmethod
    def decompose_brier_score(
        cls,
        y_true: np.ndarray,
        y_prob: np.ndarray,
        num_bins: int = 10
    ) -> BrierDecompositionReport:
        """
        Decomposes Brier Score into Reliability (REL), Resolution (RES), and Uncertainty (UNC):
        BS ≈ REL - RES + UNC
        Following Murphy (1973) partition.
        """
        y_true = np.asarray(y_true, dtype=float)
        y_prob = np.asarray(y_prob, dtype=float)
        n = len(y_true)

        if n == 0:
            return BrierDecompositionReport(
                brier_score=0.0,
                reliability=0.0,
                resolution=0.0,
                uncertainty=0.0,
                decomposition_delta=0.0,
                sample_count=0,
                is_mathematically_valid=False,
                scientific_notes="Empty cohort provided."
            )

        brier = float(np.mean((y_prob - y_true) ** 2))
        base_rate = float(np.mean(y_true))
        unc = float(base_rate * (1.0 - base_rate))

        bin_edges = np.linspace(0.0, 1.0, num_bins + 1)
        rel_sum = 0.0
        res_sum = 0.0

        for b_idx in range(num_bins):
            b_low = bin_edges[b_idx]
            b_high = bin_edges[b_idx + 1]

            if b_idx == num_bins - 1:
                mask = (y_prob >= b_low) & (y_prob <= b_high)
            else:
                mask = (y_prob >= b_low) & (y_prob < b_high)

            n_k = int(np.sum(mask))
            if n_k > 0:
                p_k = float(np.mean(y_prob[mask]))
                o_k = float(np.mean(y_true[mask]))
                rel_sum += (n_k / n) * ((p_k - o_k) ** 2)
                res_sum += (n_k / n) * ((o_k - base_rate) ** 2)

        # In Murphy's decomposition, BS_discrete = REL - RES + UNC
        theoretical_brier = rel_sum - res_sum + unc
        delta = float(round(abs(brier - theoretical_brier), 5))

        # Check validity (delta is within small bin discretisation tolerance)
        is_valid = delta <= 0.05

        notes = (
            f"Brier = {brier:.4f} ≈ REL ({rel_sum:.4f}) - RES ({res_sum:.4f}) + UNC ({unc:.4f}). "
            f"Within-bin discretization variance delta = {delta:.5f}."
        )

        return BrierDecompositionReport(
            brier_score=round(brier, 4),
            reliability=round(rel_sum, 4),
            resolution=round(res_sum, 4),
            uncertainty=round(unc, 4),
            decomposition_delta=delta,
            sample_count=n,
            is_mathematically_valid=is_valid,
            scientific_notes=notes
        )

    @classmethod
    def calculate_brier_skill_score(
        cls,
        model_brier: float,
        climatology_brier: float
    ) -> Tuple[Optional[float], str]:
        """
        BSS = 1 - (BS_model / BS_climatology)
        Returns (bss, status_string). If denominator is zero/near-zero, returns (None, 'UNDEFINED...').
        """
        if climatology_brier <= 1e-6:
            return (
                None,
                "UNDEFINED — CLIMATOLOGY REFERENCE HAS ZERO/NEAR-ZERO ERROR"
            )

        bss = 1.0 - (model_brier / climatology_brier)
        return (round(bss, 4), "VALID")
