"""
VarshaSetu - Tree Model Metadata
Structured provenance tracking for trained XGBoost / LightGBM models.
Includes Phase 4C probabilistic calibration metadata.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from .config import TreeModelConfig


class ModelCalibrationMetadata(BaseModel):
    status: str = "INSUFFICIENT_DATA"  # NOT_ATTEMPTED, INSUFFICIENT_DATA, DIAGNOSTIC_ONLY, CALIBRATED, FAILED_VALIDATION
    method: str = "NONE"               # NONE, PLATT, ISOTONIC
    fitted: bool = False
    sampleCount: int = 0
    validationPeriod: str = "N/A"
    testPeriod: str = "N/A"
    metrics: Dict[str, Any] = Field(default_factory=dict)


class TreeModelMetadata(BaseModel):
    model_id: str
    target_name: str
    model_type: str  # "xgboost" or "lightgbm"
    task_type: str   # "classification" or "regression"
    status: str      # "trained", "validated", "calibrated", "insufficient_data"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    config: TreeModelConfig
    feature_names: List[str]
    target_event_count: int
    train_sample_count: int
    val_sample_count: int
    test_sample_count: int
    is_calibrated: bool = False
    calibration_method: Optional[str] = None
    calibration: ModelCalibrationMetadata = Field(default_factory=ModelCalibrationMetadata)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    feature_importances: Dict[str, float] = Field(default_factory=dict)
    model_path: Optional[str] = None
    dataset_fingerprint: Optional[str] = None
    data_availability_status: str = "PARTIAL"
