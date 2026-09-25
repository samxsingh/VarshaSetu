"""
VarshaSetu - Tree Ensemble Model Configuration
Configuration dataclasses for XGBoost and LightGBM models.
Includes conservative defaults to prevent overfitting on regional / single-season data.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class TreeModelConfig(BaseModel):
    model_type: Literal["xgboost", "lightgbm"] = "xgboost"
    task_type: Literal["classification", "regression"] = "classification"
    n_estimators: int = Field(default=80, ge=10, le=1000)
    max_depth: int = Field(default=3, ge=1, le=12)  # Shallow trees to avoid memorizing small samples
    learning_rate: float = Field(default=0.03, ge=0.001, le=1.0)
    subsample: float = Field(default=0.8, ge=0.1, le=1.0)
    colsample_bytree: float = Field(default=0.8, ge=0.1, le=1.0)
    reg_alpha: float = Field(default=0.1, ge=0.0)  # L1 regularization
    reg_lambda: float = Field(default=1.0, ge=0.0)  # L2 regularization
    min_child_weight: float = Field(default=2.0, ge=0.0)
    random_state: int = 42
    early_stopping_rounds: Optional[int] = 10
    n_jobs: int = -1
