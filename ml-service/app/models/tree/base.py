"""
VarshaSetu - Base Tree Model
Abstract interface for tree-based ensemble estimators (XGBoost, LightGBM).
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
import numpy as np
import pandas as pd
from .config import TreeModelConfig
from .metadata import TreeModelMetadata


class BaseTreeModel(ABC):
    def __init__(self, config: TreeModelConfig, target_name: str, model_id: Optional[str] = None):
        self.config = config
        self.target_name = target_name
        self.model_id = model_id or f"{config.model_type}_{target_name}"
        self.estimator = None
        self.feature_names: List[str] = []
        self.metadata: Optional[TreeModelMetadata] = None

    @abstractmethod
    def fit(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_val: Optional[pd.DataFrame] = None,
        y_val: Optional[pd.Series] = None
    ) -> "BaseTreeModel":
        """Fits the tree ensemble on training data with optional early stopping on validation."""
        pass

    @abstractmethod
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Generates continuous or class predictions."""
        pass

    @abstractmethod
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Generates class probabilities [P(0), P(1)] for classification."""
        pass

    @abstractmethod
    def get_feature_importances(self) -> Dict[str, float]:
        """Returns normalized feature importances keyed by feature name."""
        pass

    @abstractmethod
    def save(self, filepath: str) -> str:
        """Serializes model weights and metadata."""
        pass

    @classmethod
    @abstractmethod
    def load(cls, filepath: str) -> "BaseTreeModel":
        """Loads serialized model and metadata."""
        pass
