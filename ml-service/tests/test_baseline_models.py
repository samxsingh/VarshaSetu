import pytest
import numpy as np
import pandas as pd
from app.models.baseline.logistic import BaselineLogisticModel
from app.models.baseline.regression import BaselineRegressionModel
from app.models.calibration import ProbabilityCalibrator
from app.evaluation.metrics import MetricsEvaluator
from app.evaluation.comparison import BaselineComparator

class TestBaselineModelsAndEvaluation:
    def test_logistic_baseline_fit_and_predict(self):
        np.random.seed(42)
        n = 60
        X = pd.DataFrame({
            "feat1": np.random.randn(n),
            "feat2": np.random.randn(n)
        })
        y = pd.Series((X["feat1"] + X["feat2"] > 0).astype(int))

        model = BaselineLogisticModel(learning_rate=0.1, max_iter=200, l2_penalty=0.01)
        model.fit(X, y, training_period="2024-06-01 to 2024-07-31")

        probs = model.predict_proba(X)
        assert len(probs) == n
        assert np.all((probs >= 0.0) & (probs <= 1.0))

        preds = model.predict(X, threshold=0.5)
        assert set(np.unique(preds)).issubset({0, 1})

    def test_regression_baseline_fit_and_predict(self):
        np.random.seed(42)
        n = 50
        X = pd.DataFrame({
            "feat1": np.random.exponential(scale=5.0, size=n),
            "feat2": np.random.uniform(10.0, 30.0, size=n)
        })
        y = pd.Series(X["feat1"] * 1.5 + 5.0)

        reg = BaselineRegressionModel(alpha=1.0, non_negative=True)
        reg.fit(X, y)

        preds = reg.predict(X)
        assert len(preds) == n
        assert np.all(preds >= 0.0)

    def test_metrics_evaluator_handles_single_class_gracefully(self):
        y_true = np.array([0, 0, 0, 0, 0])
        y_prob = np.array([0.1, 0.2, 0.15, 0.05, 0.3])

        report = MetricsEvaluator.evaluate_binary(y_true, y_prob)
        assert report.sample_count == 5
        assert report.positive_count == 0
        assert report.brier_score is not None
        assert report.roc_auc is None  # Must be None, NOT 0.0
        assert "ROC-AUC undefined" in report.metric_notes.get("roc_auc", "")

    def test_probability_calibrator_guards_against_small_samples(self):
        # 15 samples (< 30 minimum threshold)
        val_probs = np.random.uniform(0.1, 0.9, size=15)
        val_labels = np.random.choice([0, 1], size=15)

        calibrator = ProbabilityCalibrator(method="PLATT_SCALING")
        calibrator.fit(val_probs, val_labels)

        res = calibrator.calibrate(0.65)
        assert res.calibration_status == "NOT_CALIBRATED"
        assert res.calibrated_probability is None

    def test_baseline_comparator_computes_brier_skill_score(self):
        y_true = np.array([1, 0, 1, 0, 1, 0])
        model_prob = np.array([0.8, 0.2, 0.9, 0.1, 0.7, 0.3])  # Good model
        clim_prob = 0.5  # Climatological frequency

        comp = BaselineComparator.compare_binary(
            y_true=y_true,
            model_prob=model_prob,
            climatology_prob=clim_prob,
            target_name="HEAVY_RAIN"
        )
        assert comp.has_skill_over_climatology is True
        assert comp.brier_skill_score is not None
        assert comp.brier_skill_score > 0.0
