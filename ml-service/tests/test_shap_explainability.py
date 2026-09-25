"""
Tests for SHAP Tree Explainability
"""

import pytest
import numpy as np
import pandas as pd

from app.models.tree.config import TreeModelConfig
from app.models.tree.xgboost_model import XGBoostTreeModel
from app.explainability.shap_explainer import TreeShapExplainer


@pytest.fixture
def trained_model_and_data():
    np.random.seed(42)
    n = 60
    X = pd.DataFrame({
        "rainfall_1d": np.random.uniform(0, 50, n),
        "nino34_anomaly": np.random.uniform(-1.5, 1.5, n),
        "temperature_2m_max_c": np.random.uniform(28, 42, n)
    })
    y = pd.Series((X["rainfall_1d"] > 25).astype(int))

    cfg = TreeModelConfig(model_type="xgboost", task_type="classification", n_estimators=15, max_depth=2)
    model = XGBoostTreeModel(config=cfg, target_name="HEAVY_RAIN")
    model.fit(X, y)
    return model, X


def test_shap_sample_and_global_explanations(trained_model_and_data):
    model, X = trained_model_and_data

    # Sample explanation
    sample_rep = TreeShapExplainer.explain_sample(model, X, sample_index=0, top_k=2)
    assert sample_rep.model_id == model.model_id
    assert len(sample_rep.top_contributions) == 2
    assert sample_rep.top_contributions[0].meteorological_category in [
        "moisture_antecedent", "teleconnection", "thermodynamics"
    ]
    assert len(sample_rep.scientific_summary) > 10

    # Global explanation
    global_rep = TreeShapExplainer.explain_global(model, X)
    assert global_rep.sample_count_evaluated == len(X)
    assert len(global_rep.global_importances) == 3
    assert global_rep.top_driver in ["rainfall_1d", "nino34_anomaly", "temperature_2m_max_c"]
