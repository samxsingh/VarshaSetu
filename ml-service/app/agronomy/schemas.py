"""
VarshaSetu - Agronomic Schemas & Data Contracts (Phase 5A)
Defines strictly typed Pydantic models for the Agronomic Rules Engine,
Evidence Objects, Advisory Candidates, Safety Gate, and Scenario Simulator.
"""

from enum import Enum
from typing import Optional, Dict, Any, List, Union
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class CropType(str, Enum):
    """Controlled crop vocabulary."""
    WHEAT = "WHEAT"
    PADDY = "PADDY"
    MAIZE = "MAIZE"
    PULSES = "PULSES"
    MUSTARD = "MUSTARD"
    GENERAL = "GENERAL"


class GrowthStage(str, Enum):
    """Controlled crop growth stage vocabulary."""
    PRE_SOWING = "PRE_SOWING"
    SOWING = "SOWING"
    GERMINATION = "GERMINATION"
    VEGETATIVE = "VEGETATIVE"
    FLOWERING = "FLOWERING"
    GRAIN_FILLING = "GRAIN_FILLING"
    MATURITY = "MATURITY"
    HARVEST = "HARVEST"
    ALL = "ALL"


class AdvisorySeverity(str, Enum):
    """Non-alarmist severity tiers for agronomic advisories."""
    INFO = "INFO"
    WATCH = "WATCH"
    ELEVATED = "ELEVATED"
    HIGH = "HIGH"


class AdvisoryCategory(str, Enum):
    """Semantic category for agronomic advisories."""
    WEATHER_RISK = "WEATHER_RISK"
    WATER_STRESS = "WATER_STRESS"
    RAINFALL_ANOMALY = "RAINFALL_ANOMALY"
    MONSOON_STATUS = "MONSOON_STATUS"
    FIELD_CONDITION = "FIELD_CONDITION"
    GENERAL_INFORMATION = "GENERAL_INFORMATION"


class AdvisoryOperationalStatus(str, Enum):
    """Advisory operational status gated to diagnostic-only."""
    DIAGNOSTIC_ONLY = "DIAGNOSTIC_ONLY"
    OPERATIONAL = "OPERATIONAL"


class SafetyGateStatus(str, Enum):
    """Safety gate evaluation status."""
    PASSED = "PASSED"
    BLOCKED = "BLOCKED"


class CropDefinition(BaseModel):
    """Metadata definition for a crop in the registry."""
    crop_id: CropType
    display_name: str
    supported_stages: List[GrowthStage]
    relevant_weather_hazards: List[str]
    status: str = "INFORMATIONAL_ONLY"
    scientific_notes: str


class AgronomicRule(BaseModel):
    """Contract for a deterministic agronomic rule."""
    rule_id: str
    rule_version: str = "1.0"
    name: str
    description: str
    target: str
    applicable_crop: Union[CropType, str] = CropType.GENERAL
    applicable_stages: List[GrowthStage] = [GrowthStage.ALL]
    required_inputs: List[str] = Field(default_factory=list)
    thresholds: Dict[str, Any] = Field(default_factory=dict)
    priority: int = 10  # Higher value = higher priority
    severity: AdvisorySeverity = AdvisorySeverity.INFO
    category: AdvisoryCategory = AdvisoryCategory.WEATHER_RISK
    advisory_template: str
    explanation_template: str
    enabled: bool = True
    scientific_source: str
    provenance: str
    diagnostic_only: bool = True


class AdvisoryEvidence(BaseModel):
    """Traceable scientific evidence linking forecast to advisory."""
    source: str
    forecast_id: str
    target: str
    horizon_days: int
    probability: Optional[float] = None
    point_estimate: Optional[float] = None
    uncertainty: Optional[Dict[str, Optional[float]]] = None
    data_freshness: str = "HISTORICAL_ONLY"
    validation_status: str = "INSUFFICIENT_DATA"
    spatial_resolution: str = "BLOCK"
    features_summary: Optional[List[Dict[str, Any]]] = None


class ScientificAdvisory(BaseModel):
    """Typed scientific advisory product."""
    advisory_id: str
    generated_at: str
    valid_from: str
    valid_until: str
    location: Dict[str, Any]
    crop: str
    crop_stage: str
    severity: AdvisorySeverity
    category: AdvisoryCategory
    title: str
    summary: str
    advisory_text: str
    evidence: AdvisoryEvidence
    triggered_rules: List[str]
    confidence_status: str = "NOT_OPERATIONALLY_CALIBRATED"
    uncertainty_description: str
    scientific_status: str = "DIAGNOSTIC_ONLY"
    operational_status: AdvisoryOperationalStatus = AdvisoryOperationalStatus.DIAGNOSTIC_ONLY
    explanation: Dict[str, Any]
    provenance: Dict[str, Any]
    diagnostic_only: bool = True
    dedup_hash: str


class BlockedAdvisoryResponse(BaseModel):
    """Response returned when an advisory is blocked by the safety gate."""
    status: str = "BLOCKED"
    reason_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    diagnostic_only: bool = True


class AdvisoryEvaluationRequest(BaseModel):
    """Payload to evaluate advisories for a block and crop context."""
    block_id: str = "UP_LKO_BKT"
    crop: CropType = CropType.GENERAL
    crop_stage: GrowthStage = GrowthStage.ALL
    horizon_days: Optional[int] = 7
    forecast_id: Optional[str] = None


class AdvisoryEvaluationResponse(BaseModel):
    """Result of an advisory evaluation run."""
    block_id: str
    crop: str
    crop_stage: str
    total_rules_evaluated: int
    triggered_rules_count: int
    advisories: List[ScientificAdvisory]
    blocked_advisories: List[BlockedAdvisoryResponse] = Field(default_factory=list)
    system_status: str = "DIAGNOSTIC_ONLY"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    notice: str = "Advisories are informational meteorological risk indicators on historical data. Field-level agronomic actions are not certified."



# ====================================================================
# PHASE 5B — ADVANCED SCENARIO ANALYSIS, SENSITIVITY & ENVELOPES
# ====================================================================

class ScenarioType(str, Enum):
    """Controlled scenario typology for decision support simulation."""
    SOWING_DELAY = "SOWING_DELAY"
    IRRIGATION_INTERVENTION = "IRRIGATION_INTERVENTION"
    SEASONAL_ANOMALY = "SEASONAL_ANOMALY"
    RAINFALL_TIMING_SHIFT = "RAINFALL_TIMING_SHIFT"
    HEAVY_RAIN_CONCENTRATION = "HEAVY_RAIN_CONCENTRATION"
    COMBINED_SCENARIO = "COMBINED_SCENARIO"


class IndicatorSeverity(str, Enum):
    """Standardized 4-tier indicator category for agro-climatic exposures."""
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    SEVERE = "SEVERE"


class HazardApplicability(str, Enum):
    """Relevance of hazard indicator to specific crop and stage."""
    APPLICABLE = "APPLICABLE"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class IndicatorDelta(BaseModel):
    """Quantitative baseline vs scenario comparison for an indicator."""
    indicator_name: str
    baseline_value: float
    scenario_value: float
    absolute_delta: float
    relative_delta_pct: Optional[float] = None
    baseline_category: IndicatorSeverity
    scenario_category: IndicatorSeverity
    direction: str  # INCREASED, DECREASED, UNCHANGED
    scientific_interpretation: str


class ScenarioEnvelope(BaseModel):
    """Bounded parameter range envelope (min, max, baseline, median)."""
    indicator_name: str
    min_value: float
    max_value: float
    baseline_value: float
    median_value: float
    min_category: IndicatorSeverity
    max_category: IndicatorSeverity
    baseline_category: IndicatorSeverity
    median_category: IndicatorSeverity
    data_origin_labels: Dict[str, str] = Field(default_factory=lambda: {
        "observed": "OBSERVED",
        "baseline": "BASELINE",
        "scenario": "SCENARIO",
        "derived": "DERIVED_INDICATOR",
    })


class SensitivityPoint(BaseModel):
    """Single point along a deterministic parameter sensitivity curve."""
    parameter_value: float
    parameter_label: str
    indicator_values: Dict[str, float]
    indicator_categories: Dict[str, IndicatorSeverity]
    deltas: Dict[str, float]


class SensitivityAnalysisResult(BaseModel):
    """Complete response curve and envelope across bounded parameter variations."""
    scenario_id: str
    scenario_type: ScenarioType
    parameter_name: str
    parameter_range: List[float]
    curve_points: List[SensitivityPoint]
    envelope: ScenarioEnvelope
    scientific_notes: List[str]


class ScenarioProvenance(BaseModel):
    """Deterministic cryptographic lineage metadata for scenario reproducibility."""
    dataset_fingerprint: str = "3fec50c2ef89dbfc"
    scenario_fingerprint: str
    engine_version: str = "1.0.0"
    scenario_version: str = "5B.1.0"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    baseline_reference: str = "Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)"
    parameter_hash: str
    input_feature_hash: str


class ScenarioExplanation(BaseModel):
    """Non-causal explainability breakdown of scenario perturbations."""
    baseline_description: str
    perturbations_applied: List[str]
    indicator_shift_summary: str
    meteorological_drivers: List[str]
    assumptions: List[str]
    observed_vs_simulated: Dict[str, str]
    non_causal_statement: str = (
        "Statistical associations reflect historical analog shifts under defined scenario perturbations. "
        "Outputs evaluate sensitivity indicators rather than physical or causal guarantees."
    )


class ScenarioContract(BaseModel):
    """What-If scenario simulation input contract (supports Phases 5A & 5B)."""
    scenario_id: Optional[str] = None
    base_forecast_id: Optional[str] = "fc_kharif2024_anchor"
    block_id: str = "UP_LKO_BKT"
    crop: CropType = CropType.GENERAL
    crop_stage: GrowthStage = GrowthStage.VEGETATIVE
    horizon_days: int = 7
    scenario_type: ScenarioType = ScenarioType.SOWING_DELAY
    parameters: Dict[str, Any] = Field(default_factory=dict)
    
    # Typed parameter shortcuts
    delay_days: Optional[int] = None
    intervention_start_day: Optional[int] = None
    intervention_frequency: Optional[int] = None
    intervention_duration: Optional[int] = None
    rainfall_anomaly_pct: Optional[float] = None
    shift_days: Optional[int] = None
    rainfall_window: Optional[int] = None
    concentration_factor: Optional[float] = None
    window_days: Optional[int] = None
    combined_types: Optional[List[ScenarioType]] = None

    # Phase 5A legacy fields
    rainfall_delta_mm: float = 0.0
    temperature_delta_c: float = 0.0
    additional_dry_days: int = 0


class ScenarioComparison(BaseModel):
    """Baseline vs scenario comparative evaluation."""
    scenario_id: str
    baseline_reference: str
    scenario_type: ScenarioType
    crop: str
    crop_stage: str
    applicability: HazardApplicability
    deltas: List[IndicatorDelta]
    envelope: Optional[ScenarioEnvelope] = None
    explanation: ScenarioExplanation
    provenance: ScenarioProvenance
    scientific_disclaimer: str = (
        "This scenario evaluates meteorological and agro-meteorological sensitivity indicators only. "
        "It does NOT predict crop yields, biomass production, revenue, or guaranteed agronomic outcomes."
    )


class ScenarioResult(BaseModel):
    """Comprehensive output of scenario simulation, strictly labeled SCENARIO_INDICATOR_ONLY."""
    scenario_id: str
    scenario_type: ScenarioType = ScenarioType.SOWING_DELAY
    classification: str = "SCENARIO_INDICATOR_ONLY"
    block_id: str
    crop: str
    crop_stage: str
    applicability: HazardApplicability = HazardApplicability.APPLICABLE
    inputs: Dict[str, Any]
    baseline_summary: Dict[str, Any]
    simulated_summary: Dict[str, Any]
    hypothetical_risk_indicators: List[Dict[str, Any]]
    deltas: List[IndicatorDelta] = Field(default_factory=list)
    envelope: Optional[ScenarioEnvelope] = None
    explanation: Optional[ScenarioExplanation] = None
    provenance: Optional[ScenarioProvenance] = None
    scientific_disclaimer: str = (
        "This scenario evaluates meteorological and agro-meteorological sensitivity indicators only. "
        "It does NOT predict crop yields, biomass production, revenue, or guaranteed agronomic outcomes."
    )
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ScenarioRegistryItem(BaseModel):
    """Metadata item in the scenario registry catalog."""
    scenario_type: ScenarioType
    display_name: str
    description: str
    allowed_parameters: Dict[str, Any]
    evaluated_indicators: List[str]
    max_dimensions: int = 1

