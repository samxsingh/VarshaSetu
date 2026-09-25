"""
Tests for Continuous Forecast Uncertainty (Phase 4C)
"""

import pytest
import numpy as np
from app.calibration.uncertainty import ContinuousUncertaintyEstimator


def test_continuous_uncertainty_sufficient_samples():
    np.random.seed(42)
    n = 50
    y_true = np.random.uniform(10, 80, n)
    # Model predictions with gaussian error (std = 5)
    y_pred = y_true + np.random.normal(0, 5, n)

    report = ContinuousUncertaintyEstimator.estimate_uncertainty(
        y_true=y_true,
        y_pred=y_pred,
        model_id="xgboost_regressor",
        target_name="RAINFALL_AMOUNT"
    )

    assert report.uncertainty_status == "EVALUATED"
    assert report.sample_count == 50
    assert report.mae > 0.0
    assert report.rmse > 0.0
    assert report.residual_std > 0.0
    assert report.p10_residual is not None
    assert report.p50_residual is not None
    assert report.p90_residual is not None
    # Quantiles must be monotonic
    assert report.p10_residual <= report.p50_residual <= report.p90_residual
    assert "prediction intervals" in report.distinction_notes


def test_continuous_uncertainty_insufficient_samples_blocks_intervals():
    # Only 10 samples (< 20 required threshold)
    y_true = np.array([10.0, 20.0, 15.0, 30.0, 25.0, 12.0, 18.0, 22.0, 19.0, 14.0])
    y_pred = np.array([12.0, 18.0, 14.0, 28.0, 26.0, 11.0, 20.0, 21.0, 17.0, 15.0])

    report = ContinuousUncertaintyEstimator.estimate_uncertainty(
        y_true=y_true,
        y_pred=y_pred,
        model_id="insufficient_model",
        target_name="RAINFALL_AMOUNT"
    )

    assert report.uncertainty_status == "INSUFFICIENT_DATA"
    assert report.p10_residual is None
    assert report.p50_residual is None
    assert report.p90_residual is None
    assert "INACTIVE" in report.distinction_notes
