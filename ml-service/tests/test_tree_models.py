"""
Tests for Tree Ensemble Models (XGBoost, LightGBM)
"""

import pytest
import numpy as np
import pandas as pd
import tempfile
import os

from app.models.tree.config import TreeModelConfig
from app.models.tree.xgboost_model import XGBoostTreeModel
from app.models.tree.lightgbm_model import LightGBMTreeModel


@pytest.fixture
def synthetic_classification_data():
    np.random.seed(42)
    n = 60
    X = pd.DataFrame({
        "rainfall_1d": np.random.uniform(0, 50, n),
        "humidity": np.random.uniform(40, 95, n),
        "nino34_anomaly": np.random.uniform(-1.5, 1.5, n),
        "cos_doy": np.random.uniform(-1, 1, n)
    })
    # y depends slightly on rainfall and humidity
    prob = 1 / (1 + np.exp(-(0.05 * X["rainfall_1d"] + 0.03 * X["humidity"] - 3)))
    y = pd.Series((prob > 0.5).astype(int), name="target_heavy_rain_7d")
    return X, y


def test_xgboost_classifier(synthetic_classification_data):
    X, y = synthetic_classification_data
    cfg = TreeModelConfig(model_type="xgboost", task_type="classification", n_estimators=20, max_depth=2)
    model = XGBoostTreeModel(config=cfg, target_name="HEAVY_RAIN")
    model.fit(X.iloc[:45], y.iloc[:45], X.iloc[45:], y.iloc[45:])

    preds = model.predict(X.iloc[45:])
    probs = model.predict_proba(X.iloc[45:])

    assert len(preds) == 15
    assert probs.shape == (15, 2)
    assert np.all(probs >= 0.0) and np.all(probs <= 1.0)

    importances = model.get_feature_importances()
    assert len(importances) == 4
    assert abs(sum(importances.values()) - 1.0) < 1e-4

    # Test serialization
    with tempfile.TemporaryDirectory() as tmpdir:
        save_path = os.path.join(tmpdir, "xgb_test.joblib")
        model.save(save_path)
        loaded = XGBoostTreeModel.load(save_path)
        assert loaded.model_id == model.model_id
        np.testing.assert_array_equal(loaded.predict(X.iloc[45:]), preds)


def test_lightgbm_classifier(synthetic_classification_data):
    X, y = synthetic_classification_data
    cfg = TreeModelConfig(model_type="lightgbm", task_type="classification", n_estimators=20, max_depth=2)
    model = LightGBMTreeModel(config=cfg, target_name="HEAVY_RAIN")
    model.fit(X.iloc[:45], y.iloc[:45], X.iloc[45:], y.iloc[45:])

    preds = model.predict(X.iloc[45:])
    probs = model.predict_proba(X.iloc[45:])

    assert len(preds) == 15
    assert probs.shape == (15, 2)
    assert np.all(probs >= 0.0) and np.all(probs <= 1.0)

    importances = model.get_feature_importances()
    assert len(importances) == 4
    assert abs(sum(importances.values()) - 1.0) < 1e-4

    with tempfile.TemporaryDirectory() as tmpdir:
        save_path = os.path.join(tmpdir, "lgb_test.joblib")
        model.save(save_path)
        loaded = LightGBMTreeModel.load(save_path)
        assert loaded.model_id == model.model_id
        np.testing.assert_array_equal(loaded.predict(X.iloc[45:]), preds)
