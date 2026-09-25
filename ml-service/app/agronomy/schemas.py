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


class ScenarioContract(BaseModel):
    """What-If scenario simulation input contract."""
    scenario_id: Optional[str] = None
    base_forecast_id: Optional[str] = None
    block_id: str = "UP_LKO_BKT"
    rainfall_delta_mm: float = 0.0
    temperature_delta_c: float = 0.0
    additional_dry_days: int = 0
    crop: CropType = CropType.GENERAL
    crop_stage: GrowthStage = GrowthStage.VEGETATIVE
    horizon_days: int = 7


class ScenarioResult(BaseModel):
    """Output of scenario simulation, strictly labeled SCENARIO_INDICATOR_ONLY."""
    scenario_id: str
    classification: str = "SCENARIO_INDICATOR_ONLY"
    block_id: str
    crop: str
    crop_stage: str
    inputs: Dict[str, Any]
    baseline_summary: Dict[str, Any]
    simulated_summary: Dict[str, Any]
    hypothetical_risk_indicators: List[Dict[str, Any]]
    scientific_disclaimer: str = (
        "Scenario simulation provides exploratory meteorological sensitivity indicators only. "
        "It does NOT predict crop yields, germination rates, or economic outcomes."
    )
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
