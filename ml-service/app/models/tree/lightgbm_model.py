"""
VarshaSetu - LightGBM Tree Model Implementation
Wraps LightGBM Classifier and Regressor with explicit hyperparameter validation,
feature importance tracking, and safe serialization.
"""

import os
import joblib
from typing import Dict, List, Optional, Any
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier, LGBMRegressor

from .base import BaseTreeModel
from .config import TreeModelConfig
from .metadata import TreeModelMetadata


class LightGBMTreeModel(BaseTreeModel):
    def __init__(self, config: Optional[TreeModelConfig] = None, target_name: str = "is_wet_day", model_id: Optional[str] = None):
        cfg = config or TreeModelConfig(model_type="lightgbm")
        super().__init__(config=cfg, target_name=target_name, model_id=model_id)

    def _init_estimator(self, n_samples: int):
        # Prevent LightGBM error if dataset is small: min_child_samples must be <= sample count
        min_child_samples = max(2, min(20, n_samples // 4))

        common_params = {
            "n_estimators": self.config.n_estimators,
            "max_depth": self.config.max_depth,
            "learning_rate": self.config.learning_rate,
            "subsample": self.config.subsample,
            "colsample_bytree": self.config.colsample_bytree,
            "reg_alpha": self.config.reg_alpha,
            "reg_lambda": self.config.reg_lambda,
            "random_state": self.config.random_state,
            "min_child_samples": min_child_samples,
            "verbosity": -1,
            "n_jobs": self.config.n_jobs
        }

        if self.config.task_type == "classification":
            self.estimator = LGBMClassifier(**common_params)
        else:
            self.estimator = LGBMRegressor(**common_params)

    def fit(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_val: Optional[pd.DataFrame] = None,
        y_val: Optional[pd.Series] = None
    ) -> "LightGBMTreeModel":
        self._init_estimator(len(X_train))
        self.feature_names = list(X_train.columns)

        if X_val is not None and y_val is not None and len(X_val) > 5:
            # Check validation class diversity
            if self.config.task_type == "classification" and len(np.unique(y_val)) < 2:
                eval_set = None
            else:
                eval_set = [(X_val, y_val)]
        else:
            eval_set = None

        if eval_set:
            self.estimator.fit(
                X_train,
                y_train,
                eval_set=eval_set
            )
        else:
            self.estimator.fit(X_train, y_train)

        return self

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        if self.estimator is None:
            raise RuntimeError("Model is not fitted yet.")
        X_aligned = X[self.feature_names]
        return self.estimator.predict(X_aligned)

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        if self.estimator is None:
            raise RuntimeError("Model is not fitted yet.")
        if self.config.task_type != "classification":
            raise ValueError("predict_proba is only available for classification tasks.")
        X_aligned = X[self.feature_names]
        return self.estimator.predict_proba(X_aligned)

    def get_feature_importances(self) -> Dict[str, float]:
        if self.estimator is None:
            return {}
        raw_importances = self.estimator.feature_importances_
        tot = sum(raw_importances)
        if tot == 0:
            tot = 1.0
        return {
            feat: round(float(imp / tot), 5)
            for feat, imp in zip(self.feature_names, raw_importances)
        }

    def save(self, filepath: str) -> str:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        payload = {
            "config": self.config.model_dump(),
            "target_name": self.target_name,
            "model_id": self.model_id,
            "feature_names": self.feature_names,
            "estimator": self.estimator,
            "metadata": self.metadata.model_dump() if self.metadata else None
        }
        joblib.dump(payload, filepath)
        return filepath

    @classmethod
    def load(cls, filepath: str) -> "LightGBMTreeModel":
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")
        payload = joblib.load(filepath)
        cfg = TreeModelConfig(**payload["config"])
        instance = cls(config=cfg, target_name=payload["target_name"], model_id=payload["model_id"])
        instance.feature_names = payload["feature_names"]
        instance.estimator = payload["estimator"]
        if payload.get("metadata"):
            instance.metadata = TreeModelMetadata(**payload["metadata"])
        return instance
