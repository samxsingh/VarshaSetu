from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class PreprocessingMetadata(BaseModel):
    feature_names: List[str]
    feature_means: Dict[str, float]
    feature_stds: Dict[str, float]
    imputed_defaults: Dict[str, float]
    training_sample_count: int

class ModelMetadata(BaseModel):
    model_id: str
    model_type: str  # "LOGISTIC_REGRESSION_BASELINE" or "LINEAR_REGRESSION_BASELINE"
    target_name: str
    horizon_days: int
    training_period: str
    validation_period: str
    feature_names: List[str]
    hyperparameters: Dict[str, Any]
    fitted_at: str
    preprocessing: PreprocessingMetadata
    coefficients: Dict[str, float]
    intercept: float
    scientific_status: str  # "BASELINE_TRAINED", "INSUFFICIENT_DATA", "FAILED"
