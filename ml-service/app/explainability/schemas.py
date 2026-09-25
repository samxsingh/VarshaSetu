"""
VarshaSetu - SHAP Explainability Schemas
Data models for feature-level attribution, directionality, and meteorological context.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field


class ShapFeatureContribution(BaseModel):
    feature_name: str
    feature_value: float
    shap_value: float
    direction: Literal["increases_risk", "decreases_risk", "increases_rainfall", "decreases_rainfall", "neutral"]
    meteorological_category: str
    human_explanation: str


class ShapExplanationReport(BaseModel):
    model_id: str
    target_name: str
    sample_index: int
    base_value: float
    prediction_value: float
    top_contributions: List[ShapFeatureContribution]
    scientific_summary: str
    all_contributions: List[ShapFeatureContribution] = Field(default_factory=list)


class GlobalFeatureImportance(BaseModel):
    feature_name: str
    mean_abs_shap: float
    relative_importance_pct: float
    meteorological_category: str


class ModelGlobalExplainabilityReport(BaseModel):
    model_id: str
    target_name: str
    sample_count_evaluated: int
    global_importances: List[GlobalFeatureImportance]
    top_driver: str
    secondary_driver: str
    teleconnection_importance_pct: float
