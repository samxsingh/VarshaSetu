"""
Tests for Multi-Model Benchmark Comparator
"""

import pytest
import numpy as np
from app.evaluation.benchmark import MultiModelBenchmarkComparator


def test_benchmark_comparator_classification():
    y_true = np.array([0, 1, 0, 1, 1, 0, 0, 1, 0, 1])
    predictions_map = {
        "climatology": {"name": "Climatology Baseline", "prob": 0.5, "is_calibrated": True},
        "baseline_logistic": {"name": "Logistic Baseline", "prob": np.array([0.2, 0.8, 0.3, 0.7, 0.9, 0.1, 0.4, 0.6, 0.2, 0.8]), "is_calibrated": True},
        "xgboost": {"name": "XGBoost", "prob": np.array([0.1, 0.9, 0.1, 0.9, 0.9, 0.1, 0.2, 0.8, 0.1, 0.9]), "is_calibrated": True},
        "lightgbm": {"name": "LightGBM", "prob": np.array([0.15, 0.85, 0.2, 0.8, 0.85, 0.15, 0.25, 0.75, 0.2, 0.8]), "is_calibrated": True}
    }

    report = MultiModelBenchmarkComparator.evaluate_classification(
        target_name="HEAVY_RAIN",
        horizon_days=7,
        evaluation_period="2024-09-01 to 2024-09-10",
        y_true=y_true,
        predictions_map=predictions_map
    )

    assert report.target_name == "HEAVY_RAIN"
    assert report.test_sample_count == 10
    assert len(report.models) == 4

    # All models should have brier scores calculated
    for m in report.models:
        assert m.brier_score is not None
        assert m.accuracy is not None

    # XGBoost should have positive Brier Skill Score over climatology
    xgb_entry = next(m for m in report.models if m.model_id == "xgboost")
    assert xgb_entry.brier_skill_score > 0.0
    assert xgb_entry.has_skill_over_climatology is True
