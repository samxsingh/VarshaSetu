"""
Tests for Isotonic Regression Calibrator (Phase 4C)
"""

import pytest
import numpy as np
from app.calibration.isotonic import IsotonicCalibrator


def test_isotonic_calibration_monotonicity():
    raw_p = np.linspace(0.05, 0.95, 30)
    # Monotonic event rates with mild noise
    obs = (raw_p + np.random.normal(0, 0.1, 30) > 0.5).astype(int)
    # Ensure at least 3 positive and 3 negative
    obs[:5] = 0
    obs[-5:] = 1

    calibrator = IsotonicCalibrator()
    assert calibrator.status() == "UNFITTED"

    calibrator.fit(raw_p, obs)
    assert calibrator.is_fitted is True
    assert calibrator.status() == "FITTED"

    test_inputs = np.array([0.1, 0.25, 0.5, 0.75, 0.9])
    cal_outputs = calibrator.predict(test_inputs)

    assert len(cal_outputs) == 5
    assert np.all(cal_outputs >= 0.0) and np.all(cal_outputs <= 1.0)
    # Monotonic property: non-decreasing
    for i in range(len(cal_outputs) - 1):
        assert cal_outputs[i] <= cal_outputs[i + 1]


def test_isotonic_calibration_insufficient_samples():
    calibrator = IsotonicCalibrator()
    raw_p = np.array([0.1, 0.5])
    obs = np.array([0, 1])

    calibrator.fit(raw_p, obs)
    assert calibrator.is_fitted is False
    assert calibrator.status() == "FAILED_INSUFFICIENT_SAMPLES"
