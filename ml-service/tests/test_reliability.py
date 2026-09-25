"""
Tests for Reliability Analysis, ECE, MCE, and Brier Decomposition (Phase 4C)
"""

import pytest
import numpy as np
from app.calibration.reliability import ReliabilityAnalyzer


def test_reliability_diagram_bins_and_empty_handling():
    # Only probabilities in [0.0, 0.2] and [0.8, 1.0]; bins in between will be empty
    y_prob = np.array([0.05, 0.1, 0.15, 0.85, 0.9, 0.95])
    y_true = np.array([0, 0, 1, 1, 1, 1])

    report = ReliabilityAnalyzer.compute_reliability(
        y_true=y_true,
        y_prob=y_prob,
        num_bins=5,
        model_id="test_model",
        target_name="HEAVY_RAIN"
    )

    assert report.num_bins == 5
    assert len(report.bins) == 5

    # First bin [0, 0.2] has 3 samples
    b0 = report.bins[0]
    assert b0.sample_count == 3
    assert b0.predicted_prob_mean is not None
    assert b0.observed_frequency is not None

    # Middle bin [0.4, 0.6] has 0 samples and MUST be None (no invented values)
    b2 = report.bins[2]
    assert b2.sample_count == 0
    assert b2.predicted_prob_mean is None
    assert b2.observed_frequency is None
    assert b2.calibration_error is None

    assert report.expected_calibration_error >= 0.0
    assert report.maximum_calibration_error >= 0.0


def test_brier_score_decomposition_identity():
    # Murphy (1973): BS ≈ REL - RES + UNC
    np.random.seed(42)
    n = 100
    y_prob = np.random.uniform(0.1, 0.9, n)
    y_true = np.random.choice([0, 1], size=n, p=[0.7, 0.3])

    decomp = ReliabilityAnalyzer.decompose_brier_score(y_true, y_prob, num_bins=10)

    assert decomp.sample_count == 100
    assert decomp.reliability >= 0.0
    assert decomp.resolution >= 0.0
    assert decomp.uncertainty >= 0.0
    # Decomposition check delta should be very small
    assert decomp.decomposition_delta < 0.05
    assert decomp.is_mathematically_valid is True


def test_brier_skill_score_undefined_on_near_zero_climatology():
    # Model Brier = 0.05, Climatology Brier = 0.0 (near-zero)
    bss, status = ReliabilityAnalyzer.calculate_brier_skill_score(0.05, 0.0)
    assert bss is None
    assert "UNDEFINED" in status
    assert "ZERO/NEAR-ZERO" in status

    # Normal case: Model Brier = 0.10, Climatology Brier = 0.20 -> BSS = 0.50
    bss_norm, status_norm = ReliabilityAnalyzer.calculate_brier_skill_score(0.10, 0.20)
    assert bss_norm == 0.50
    assert status_norm == "VALID"
