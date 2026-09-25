"""
Tests for Platt Scaling Calibrator (Phase 4C)
"""

import pytest
import numpy as np
from app.calibration.platt import PlattCalibrator


def test_platt_calibration_deterministic_fit():
    np.random.seed(42)
    # Generate overconfident raw probabilities (e.g. predicts 0.9 for 60% event rate)
    raw_p = np.array([0.1, 0.2, 0.3, 0.4, 0.7, 0.8, 0.85, 0.9, 0.95, 0.99] * 5)
    obs = np.array([0, 0, 0, 1, 0, 1, 1, 1, 1, 1] * 5)

    calibrator = PlattCalibrator()
    assert calibrator.status() == "UNFITTED"

    calibrator.fit(raw_p, obs)
    assert calibrator.is_fitted is True
    assert calibrator.status() == "FITTED"

    meta = calibrator.metadata()
    assert meta["method"] == "PLATT_SCALING"
    assert "slope_a" in meta["parameters"]
    assert "intercept_b" in meta["parameters"]

    # Test prediction
    test_probs = np.array([0.05, 0.5, 0.95])
    cal_probs = calibrator.predict(test_probs)

    assert len(cal_probs) == 3
    assert np.all(cal_probs >= 0.0) and np.all(cal_probs <= 1.0)
    # Monotonicity of Platt sigmoid mapping
    assert cal_probs[0] <= cal_probs[1] <= cal_probs[2]


def test_platt_calibration_insufficient_samples():
    calibrator = PlattCalibrator()
    # Only 3 samples
    raw_p = np.array([0.2, 0.8, 0.9])
    obs = np.array([0, 1, 1])

    calibrator.fit(raw_p, obs)
    assert calibrator.is_fitted is False
    assert calibrator.status() == "FAILED_INSUFFICIENT_SAMPLES"

    # Predict returns raw untouched
    preds = calibrator.predict(raw_p)
    np.testing.assert_array_equal(preds, raw_p)
