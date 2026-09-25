"""
Tests for Hindcasting Metrics and Experiment Runner.
Verifies null handling for zero variance, continuous targets, and experiment persistence.
"""

import pytest
import numpy as np

from app.hindcasting.metrics import HindcastMetricsCalculator
from app.hindcasting.runner import HindcastRunner
from app.hindcasting.artifacts import HindcastArtifactManager


def test_metrics_classification_balanced():
    y_true = np.array([0, 1, 0, 1, 0, 1, 0, 0, 1, 0])
    y_prob = np.array([0.1, 0.9, 0.2, 0.8, 0.3, 0.7, 0.2, 0.1, 0.85, 0.15])
    clim_prob = 0.4

    rep = HindcastMetricsCalculator.evaluate_classification(
        y_true=y_true,
        y_prob=y_prob,
        climatology_prob=clim_prob,
        horizon_days=7,
        target_name="HEAVY_RAIN"
    )

    assert rep.status == "EVALUATED"
    assert rep.sample_count == 10
    assert rep.event_count == 4
    assert rep.brier_score is not None
    assert rep.brier_score < 0.10
    assert rep.brier_skill_score is not None
    assert rep.brier_skill_score > 0.0
    assert rep.roc_auc is not None
    assert rep.roc_auc > 0.9
    assert rep.skill_relative_to_climatology is True


def test_metrics_classification_single_class_null_safety():
    # Only negative class present in test partition
    y_true = np.array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    y_prob = np.array([0.05, 0.1, 0.08, 0.12, 0.02, 0.04, 0.01, 0.03, 0.06, 0.09])
    clim_prob = 0.1

    rep = HindcastMetricsCalculator.evaluate_classification(
        y_true=y_true,
        y_prob=y_prob,
        climatology_prob=clim_prob,
        horizon_days=7,
        target_name="HEAVY_RAIN"
    )

    # Must NOT substitute zero for ROC-AUC / PR-AUC
    assert rep.roc_auc is None
    assert rep.pr_auc is None
    assert any("only class 0 present" in n for n in rep.notes)
    assert rep.brier_score is not None


def test_metrics_regression():
    y_true = np.array([10.0, 20.0, 30.0, 40.0, 50.0])
    y_pred = np.array([12.0, 19.0, 28.0, 42.0, 49.0])
    clim_mean = 30.0

    rep = HindcastMetricsCalculator.evaluate_regression(
        y_true=y_true,
        y_pred=y_pred,
        climatology_mean=clim_mean,
        horizon_days=7,
        target_name="RAINFALL_AMOUNT"
    )

    assert rep.status == "EVALUATED"
    assert rep.sample_count == 5
    assert rep.mae is not None
    assert rep.mae < 3.0
    assert rep.rmse is not None
    assert rep.mae_skill_score is not None
    assert rep.mae_skill_score > 0.0
    assert rep.skill_relative_to_climatology is True


def test_hindcast_runner_and_artifacts():
    manifest = HindcastRunner.run_experiment(target_name="HEAVY_RAIN", primary_horizon=7)

    assert manifest.experiment_id.startswith("hindcast_heavy_rain_7d_")
    assert manifest.spatial_resolution == "BLOCK"
    assert len(manifest.models_evaluated) >= 4
    assert len(manifest.horizon_reports) == 6
    assert manifest.multiyear_gate_status in ["INSUFFICIENT_DATA", "PARTIAL", "SUFFICIENT"]

    # Verify persistence & retrieval
    loaded = HindcastArtifactManager.load_manifest(manifest.experiment_id)
    assert loaded is not None
    assert loaded.experiment_id == manifest.experiment_id
