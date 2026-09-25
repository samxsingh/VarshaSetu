"""
VarshaSetu - Scientific Forecast Record & Product Contracts
Defines the universal data contracts for operational and diagnostic forecast products.
Strictly separates meteorological forecasts from downstream agronomic recommendations.
Enforces non-nullable scientific disclosure and transparency metadata.
"""

from enum import Enum
from typing import Optional, Dict, Any, List, Union
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class ForecastTargetType(str, Enum):
    """
    Standard meteorological target types established in Phase 4A.
    Agronomic decisions (sow, spray, irrigate, harvest) are strictly forbidden here.
    """
    MONSOON_ONSET = "MONSOON_ONSET"
    FALSE_ONSET = "FALSE_ONSET"
    DRY_SPELL = "DRY_SPELL"
    HEAVY_RAIN = "HEAVY_RAIN"
    RAINFALL_AMOUNT = "RAINFALL_AMOUNT"
    RAINFALL_ANOMALY = "RAINFALL_ANOMALY"


class ForecastHorizonDays(int, Enum):
    """
    Supported forecast horizons in days.
    """
    DAY_1 = 1
    DAY_3 = 3
    DAY_7 = 7
    DAY_14 = 14
    DAY_21 = 21
    DAY_30 = 30


class ForecastOperationalStatus(str, Enum):
    """
    Operational status of a forecast product.
    Determined strictly by evidence and multi-tier scientific gates.
    """
    OPERATIONAL = "OPERATIONAL"
    DIAGNOSTIC_ONLY = "DIAGNOSTIC_ONLY"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    NOT_CALIBRATED = "NOT_CALIBRATED"
    MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE"
    DATA_STALE = "DATA_STALE"
    SPATIAL_LIMITATION = "SPATIAL_LIMITATION"
    HISTORICAL_ONLY = "HISTORICAL_ONLY"


class DataFreshnessStatus(str, Enum):
    """
    Freshness classification for observational input data.
    """
    FRESH = "FRESH"
    AGING = "AGING"
    STALE = "STALE"
    HISTORICAL_ONLY = "HISTORICAL_ONLY"
    MISSING = "MISSING"
    UNKNOWN = "UNKNOWN"


class CalibrationStatus(str, Enum):
    """
    Probabilistic calibration status.
    """
    CALIBRATED = "CALIBRATED"
    NOT_CALIBRATED = "NOT_CALIBRATED"
    GATE_FAILED = "GATE_FAILED"
    UNAVAILABLE = "UNAVAILABLE"


class UncertaintyStatus(str, Enum):
    """
    Uncertainty evaluation status.
    """
    CALCULATED = "CALCULATED"
    NOT_AVAILABLE = "NOT_AVAILABLE"
    INSUFFICIENT_SAMPLES = "INSUFFICIENT_SAMPLES"


class ValidationStatus(str, Enum):
    """
    Validation status from Phase 4D hindcasting engine.
    """
    OPERATIONAL = "OPERATIONAL"
    PARTIAL = "PARTIAL"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    NOT_EVALUATED = "NOT_EVALUATED"


class ExplainabilityStatus(str, Enum):
    """
    SHAP explainability status.
    """
    EXPLAINED = "EXPLAINED"
    UNAVAILABLE = "UNAVAILABLE"
    NOT_SUPPORTED = "NOT_SUPPORTED"


# =====================================================================
# SUB-CONTEXT MODELS FOR SCIENTIFIC FORECAST RECORD
# =====================================================================

class LocationContext(BaseModel):
    state_id: str = Field(description="State administrative identifier, e.g. UP")
    district_id: str = Field(description="District administrative identifier, e.g. UP_LKO")
    block_id: str = Field(description="Block administrative identifier, e.g. UP_LKO_BKT")
    latitude: float = Field(description="Centroid latitude in decimal degrees")
    longitude: float = Field(description="Centroid longitude in decimal degrees")
    spatial_resolution: str = Field(default="BLOCK", description="Spatial resolution: BLOCK, DISTRICT, STATE")


class TargetContext(BaseModel):
    target_type: str = Field(description="Target identifier, e.g. HEAVY_RAIN, RAINFALL_AMOUNT")
    target_definition_version: str = Field(default="v1.0-imd-kharif", description="Target definition version")
    threshold: Optional[float] = Field(default=None, description="Physical threshold value if applicable")
    unit: str = Field(default="probability", description="Unit of measurement: probability, mm, index")


class HorizonContext(BaseModel):
    horizon_days: int = Field(description="Lead time horizon in days (1, 3, 7, 14, 21, 30)")
    horizon_label: str = Field(description="Human-readable label, e.g. 7-Day Medium-Range Outlook")


class ModelContext(BaseModel):
    model_id: str = Field(description="Identifier of model used, e.g. xgboost, lightgbm, climatology")
    model_family: str = Field(description="Model architecture family: Gradient Boosted Trees, Linear, Climatology")
    model_version: str = Field(default="1.0.0", description="Semantic model version")
    training_period: str = Field(default="2024-06-01 to 2024-07-31", description="Temporal date range of training slice")
    dataset_fingerprint: str = Field(default="unknown", description="SHA-256 fingerprint of training data")


class PredictionContext(BaseModel):
    probability: Optional[float] = Field(default=None, description="Estimated probability [0.0, 1.0] for classification")
    predicted_value: Optional[float] = Field(default=None, description="Predicted numerical value for continuous targets (mm)")
    category: str = Field(default="UNSPECIFIED", description="Category label: LOW, MODERATE, HIGH, EXTREME, UNLIKELY, LIKELY")
    event_observed_reference_if_available: Optional[Union[float, bool, int]] = Field(
        default=None, description="Actual observed outcome if retrospective verification is available"
    )


class CalibrationContext(BaseModel):
    status: str = Field(default="NOT_CALIBRATED", description="Calibration status: CALIBRATED, NOT_CALIBRATED, GATE_FAILED, UNAVAILABLE")
    calibrator_type: str = Field(default="NONE", description="Calibrator method: PLATT, ISOTONIC, NONE")
    calibration_artifact_id: Optional[str] = Field(default=None, description="Artifact ID of fitted calibrator")


class UncertaintyContext(BaseModel):
    status: str = Field(default="NOT_AVAILABLE", description="Uncertainty status: CALCULATED, NOT_AVAILABLE, INSUFFICIENT_SAMPLES")
    lower_bound: Optional[float] = Field(default=None, description="10th percentile empirical residual bound (P10)")
    median: Optional[float] = Field(default=None, description="50th percentile median estimate (P50)")
    upper_bound: Optional[float] = Field(default=None, description="90th percentile empirical residual bound (P90)")
    method: str = Field(default="NONE", description="Estimation method: EMPIRICAL_RESIDUAL_QUANTILES, NONE")


class ValidationContext(BaseModel):
    validation_status: str = Field(default="INSUFFICIENT_DATA", description="Validation status from Phase 4D gate")
    validation_years: List[int] = Field(default_factory=list, description="Historical seasons evaluated")
    hindcast_experiment_id: Optional[str] = Field(default=None, description="ID of corresponding hindcast manifest")


class FeatureContributionItem(BaseModel):
    feature: str
    category: str
    shap_value: float
    direction: str  # elevates, suppresses, neutral
    magnitude: float
    description: str


class ExplainabilityContext(BaseModel):
    status: str = Field(default="UNAVAILABLE", description="Explainability status: EXPLAINED, UNAVAILABLE, NOT_SUPPORTED")
    top_features: List[FeatureContributionItem] = Field(default_factory=list, description="Top SHAP feature attributions")
    shap_artifact_id: Optional[str] = Field(default=None, description="ID of persisted SHAP explanation artifact")


class DataContext(BaseModel):
    source_status: str = Field(default="IMD_ERA5_INGESTED", description="Observational data sources")
    freshness_status: str = Field(default="HISTORICAL_ONLY", description="Data freshness status: FRESH, STALE, HISTORICAL_ONLY")
    missingness: float = Field(default=0.0, description="Percentage of missing values in input window")
    feature_coverage: str = Field(default="19/19 features complete", description="Feature coverage summary")


class ScientificDisclosureContext(BaseModel):
    status: str = Field(default="DIAGNOSTIC_ONLY", description="Primary scientific operational classification")
    messages: List[str] = Field(default_factory=list, description="Mandatory scientific disclosures and limitations")


# =====================================================================
# ROOT SCIENTIFIC FORECAST RECORD
# =====================================================================

class ScientificForecastRecord(BaseModel):
    """
    Authoritative scientific forecast record contract for VarshaSetu.
    Contains complete lineage, model identity, probabilistic predictions,
    calibration status, uncertainty intervals, validation context, and disclosures.
    """
    forecast_id: str = Field(description="Unique immutable forecast identifier")
    generated_at: str = Field(description="ISO 8601 generation timestamp UTC")
    valid_from: str = Field(description="ISO 8601 start date of forecast validity")
    valid_until: str = Field(description="ISO 8601 end date of forecast validity")

    location: LocationContext
    target: TargetContext
    horizon: HorizonContext
    model: ModelContext
    prediction: PredictionContext
    calibration: CalibrationContext
    uncertainty: UncertaintyContext
    validation: ValidationContext
    explainability: ExplainabilityContext
    data: DataContext
    scientific_disclosure: ScientificDisclosureContext

    # Backward compatibility properties for Phase 4A/4B consumers
    @property
    def geography(self) -> str:
        return self.location.block_id

    @property
    def target_name(self) -> str:
        return self.target.target_type

    @property
    def horizon_days(self) -> int:
        return self.horizon.horizon_days


# =====================================================================
# API REQUEST & RESPONSE ENVELOPES
# =====================================================================

class ForecastGenerateRequest(BaseModel):
    """
    Request payload to generate a structured forecast product.
    """
    target_name: str = Field(default="HEAVY_RAIN", description="Target: HEAVY_RAIN, DRY_SPELL, MONSOON_ONSET, RAINFALL_AMOUNT, RAINFALL_ANOMALY, FALSE_ONSET")
    horizon_days: int = Field(default=7, description="Lead time horizon in days (1, 3, 7, 14, 21, 30)")
    block_id: str = Field(default="UP_LKO_BKT", description="Target administrative block")
    model_id: Optional[str] = Field(default=None, description="Optional explicit model ID preference: xgboost, lightgbm, climatology, baseline_linear")


class ForecastStatusResponse(BaseModel):
    service: str = "varshasetu-forecast-engine"
    phase: str = "PHASE_4E_OPERATIONAL_FORECAST_STAGE"
    operational_forecast_allowed: bool = False
    system_status: str = "DIAGNOSTIC_ONLY"
    active_dataset: str = "Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)"
    total_records: int = 122
    total_forecasts_generated: int = 0
    message: str
    scientific_disclosure: str


class ForecastAvailabilityResponse(BaseModel):
    block_id: str = "UP_LKO_BKT"
    data_freshness: str = "HISTORICAL_ONLY"
    latest_observation_date: str = "2024-09-30"
    days_since_latest_observation: int = 725
    features_available: int = 19
    features_required: int = 19
    feature_coverage_pct: float = 100.0
    missingness_pct: float = 0.0
    expected_cadence: str = "Daily (24h)"
    stale_threshold_hours: int = 48
    operational_allowed: bool = False
    scientific_notes: str


class ForecastListResponse(BaseModel):
    total_forecasts: int
    forecasts: List[ScientificForecastRecord]


class ForecastExplanationResponse(BaseModel):
    forecast_id: str
    target_name: str
    horizon_days: int
    model_id: str
    model_name: str
    explainability_status: str
    top_features: List[FeatureContributionItem]
    evidence_summary: Dict[str, Any]
    deterministic_narrative: str
    scientific_limitations: List[str]


class ForecastTargetItem(BaseModel):
    target_type: str
    name: str
    description: str
    unit: str
    threshold: Optional[float] = None
    category: str
    version: str = "v1.0-imd-kharif"


class TargetListResponse(BaseModel):
    targets: List[ForecastTargetItem]


class ForecastHorizonItem(BaseModel):
    horizon_days: int
    horizon_label: str
    description: str
    meteorological_scale: str
    uncertainty_supported: bool


class HorizonListResponse(BaseModel):
    horizons: List[ForecastHorizonItem]


class ForecastHistoryItem(BaseModel):
    forecast_id: str
    generated_at: str
    valid_from: str
    valid_until: str
    target_name: str
    horizon_days: int
    model_id: str
    model_version: str
    dataset_fingerprint: str
    probability: Optional[float]
    predicted_value: Optional[float]
    status: str
    verification_status: str = "PENDING"
    verification_error: Optional[float] = None


class ForecastHistoryResponse(BaseModel):
    total: int
    history: List[ForecastHistoryItem]
