"""
VarshaSetu - Hindcasting & Walk-Forward Schemas
Defines immutable data models for historical walk-forward folds, horizon evaluations,
model hindcast benchmarks, stability reports, and experiment artifacts.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class HindcastFold(BaseModel):
    fold_id: str
    train_start: str
    train_end: str
    validation_start: str
    validation_end: str
    test_start: str
    test_end: str
    test_year: int
    training_rows: int
    validation_rows: int
    test_rows: int
    training_years: List[int]
    feature_cutoff: str
    dataset_fingerprint: str
    notes: Optional[str] = None


class HorizonEvaluationReport(BaseModel):
    horizon_days: int
    target_name: str
    task_type: str  # "classification" or "regression"
    sample_count: int
    event_count: Optional[int] = None
    brier_score: Optional[float] = None
    brier_skill_score: Optional[float] = None
    log_loss: Optional[float] = None
    roc_auc: Optional[float] = None
    pr_auc: Optional[float] = None
    expected_calibration_error: Optional[float] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mae_skill_score: Optional[float] = None
    skill_relative_to_climatology: Optional[bool] = None
    status: str = "EVALUATED"  # "EVALUATED", "INSUFFICIENT_DATA", "UNDEFINED"
    notes: List[str] = Field(default_factory=list)


class ModelHindcastResult(BaseModel):
    model_id: str
    model_name: str
    model_family: str  # "climatology", "baseline_linear", "xgboost", "lightgbm"
    task_type: str
    horizon_days: int
    target_name: str
    sample_count: int
    event_count: Optional[int] = None
    metrics: Dict[str, Optional[float]] = Field(default_factory=dict)
    calibration_status: str  # "CALIBRATED_PLATT", "CALIBRATED_ISOTONIC", "NOT_CALIBRATED", "DIAGNOSTIC_ONLY"
    data_status: str  # "EVALUATED", "INSUFFICIENT_DATA", "PARTIAL"
    dataset_fingerprint: str
    has_skill_over_climatology: Optional[bool] = None
    notes: List[str] = Field(default_factory=list)


class YearlyStabilityReport(BaseModel):
    year: int
    sample_count: int
    event_count: Optional[int] = None
    brier_score: Optional[float] = None
    brier_skill_score: Optional[float] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    roc_auc: Optional[float] = None
    ece: Optional[float] = None
    is_degraded: bool = False
    notes: Optional[str] = None


class StabilityDistributionStats(BaseModel):
    metric_name: str
    count: int
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    iqr: Optional[float] = None


class HindcastStabilityAnalysis(BaseModel):
    target_name: str
    horizon_days: int
    model_id: str
    years_evaluated: List[int]
    total_years: int
    yearly_reports: List[YearlyStabilityReport] = Field(default_factory=list)
    distribution_stats: Dict[str, StabilityDistributionStats] = Field(default_factory=dict)
    degraded_years: List[int] = Field(default_factory=list)
    stability_status: str = "EVALUATED"  # "STABLE", "VARIABLE", "INSUFFICIENT_SEASONS"
    notes: str = ""


class FeatureCoverageItem(BaseModel):
    feature_name: str
    first_available_date: str
    last_available_date: str
    available_years: List[int]
    total_records: int
    missing_percent: float
    source: str
    coverage_status: str  # "FULL", "PARTIAL", "INSUFFICIENT"


class FeatureCoverageReport(BaseModel):
    total_features: int
    features_full_coverage: int
    features_partial_coverage: int
    temporal_span: str
    coverage_items: List[FeatureCoverageItem] = Field(default_factory=list)
    scientific_notes: str = ""


class BlockValidationReport(BaseModel):
    block_id: str
    block_name: str
    sample_count: int
    years_available: List[int]
    target_event_count: int
    metrics: Dict[str, Optional[float]] = Field(default_factory=dict)
    data_status: str
    spatial_resolution_verified: str = "BLOCK"


class HindcastExperimentManifest(BaseModel):
    experiment_id: str
    created_at: str
    git_commit: str
    target_name: str
    horizon_days: int
    models_evaluated: List[str]
    training_years: List[int]
    validation_year: Optional[int] = None
    test_year: int
    dataset_fingerprints: Dict[str, str] = Field(default_factory=dict)
    feature_registry_version: str = "1.0.0"
    target_definition_version: str = "1.0.0"
    spatial_resolution: str = "BLOCK"
    multiyear_gate_status: str
    operational_validation_allowed: bool
    horizon_reports: List[HorizonEvaluationReport] = Field(default_factory=list)
    model_results: List[ModelHindcastResult] = Field(default_factory=list)
    stability_analysis: Optional[HindcastStabilityAnalysis] = None
    block_reports: List[BlockValidationReport] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
