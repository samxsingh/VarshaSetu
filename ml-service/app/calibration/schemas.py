"""
VarshaSetu - Calibration & Scientific Forecast Reliability Schemas
Data models for data gates, reliability diagrams, ECE/MCE metrics,
Brier score decomposition, calibration comparisons, and continuous uncertainty.
"""

from typing import List, Dict, Any, Optional, Tuple, Literal
from enum import Enum
from pydantic import BaseModel, Field


class CalibrationGateStatus(str, Enum):
    PASSED = "PASSED"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    DIAGNOSTIC_ONLY = "DIAGNOSTIC_ONLY"


class CalibrationDataGateReport(BaseModel):
    status: CalibrationGateStatus
    train_observations: int
    val_observations: int
    test_observations: int
    positive_class_count: int
    negative_class_count: int
    unique_seasons: int
    unique_years: int
    target_variance: float
    event_frequency: float
    missingness_ratio: float
    thresholds: Dict[str, Any]
    passed_checks: List[str]
    failed_checks: List[str]
    operational_calibration_allowed: bool
    scientific_notes: str


class ReliabilityBin(BaseModel):
    bin_index: int
    bin_lower: float
    bin_upper: float
    predicted_prob_mean: Optional[float] = None
    observed_frequency: Optional[float] = None
    sample_count: int
    calibration_error: Optional[float] = None  # |predicted_prob_mean - observed_frequency|


class ReliabilityReport(BaseModel):
    model_id: str
    target_name: str
    num_bins: int
    bins: List[ReliabilityBin]
    expected_calibration_error: float  # ECE = sum((n_b / N) * |p_b - o_b|)
    maximum_calibration_error: float   # MCE = max(|p_b - o_b|)
    brier_score: float
    log_loss: float
    probabilities_clipped: bool
    clipping_bounds: Tuple[float, float] = (1e-6, 1.0 - 1e-6)
    evaluation_period: str
    sample_count: int
    diagnostic_only: bool = False


class BrierDecompositionReport(BaseModel):
    brier_score: float
    reliability: float       # Component measuring calibration error
    resolution: float        # Component measuring discrimination ability
    uncertainty: float       # Inherent variance of the event (o_bar * (1 - o_bar))
    decomposition_delta: float  # |BS - (Reliability - Resolution + Uncertainty)|
    sample_count: int
    is_mathematically_valid: bool
    scientific_notes: str


class CalibrationComparisonEntry(BaseModel):
    model_id: str
    model_name: str
    target_name: str
    calibration_method: str  # "NONE", "PLATT", "ISOTONIC"
    calibration_status: str  # "INSUFFICIENT_DATA", "DIAGNOSTIC_ONLY", "CALIBRATED"
    raw_brier: float
    calibrated_brier: Optional[float] = None
    raw_log_loss: float
    calibrated_log_loss: Optional[float] = None
    raw_ece: float
    calibrated_ece: Optional[float] = None
    raw_mce: float
    calibrated_mce: Optional[float] = None
    raw_roc_auc: Optional[float] = None
    calibrated_roc_auc: Optional[float] = None
    sample_count: int
    positive_count: int
    negative_count: int
    training_years: int
    validation_years: int
    test_years: int
    bss_vs_climatology: Optional[float] = None
    bss_status: str  # "VALID" or "UNDEFINED — CLIMATOLOGY REFERENCE HAS ZERO/NEAR-ZERO ERROR"
    probabilities_clipped: bool = False


class ContinuousUncertaintyReport(BaseModel):
    model_id: str
    target_name: str
    uncertainty_status: str  # "EVALUATED" | "INSUFFICIENT_DATA"
    sample_count: int
    mae: float
    rmse: float
    residual_std: float
    median_absolute_error: float
    p10_residual: Optional[float] = None
    p50_residual: Optional[float] = None
    p90_residual: Optional[float] = None
    distinction_notes: str = (
        "Residual quantiles represent empirical prediction intervals under exchangeability assumptions, "
        "not epistemic confidence intervals or observational measurement error bounds."
    )


class CalibrationArtifactManifest(BaseModel):
    experiment_id: str
    model_id: str
    target_name: str
    calibration_method: str
    calibration_status: str
    dataset_fingerprint: str
    feature_schema_hash: str
    train_period: str
    calibration_period: str
    test_period: str
    sample_counts: Dict[str, int]
    class_counts: Dict[str, int]
    calibration_parameters: Dict[str, Any]
    reliability_bins: List[ReliabilityBin]
    ece: float
    mce: float
    brier_score: float
    log_loss: float
    brier_decomposition: Optional[BrierDecompositionReport] = None
    uncertainty_metadata: Optional[ContinuousUncertaintyReport] = None
    software_versions: Dict[str, str]
    git_commit: Optional[str] = None
    created_at: str
