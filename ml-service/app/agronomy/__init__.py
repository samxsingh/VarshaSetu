"""
VarshaSetu - Agronomic Intelligence Package (Phase 5A)
Deterministic Rules Engine, Evidence Model, Safety Gates & What-If Simulator Foundation.
"""

from app.agronomy.schemas import (
    CropType,
    GrowthStage,
    AdvisorySeverity,
    AdvisoryCategory,
    AdvisoryOperationalStatus,
    CropDefinition,
    AgronomicRule,
    AdvisoryEvidence,
    ScientificAdvisory,
    BlockedAdvisoryResponse,
    AdvisoryEvaluationRequest,
    AdvisoryEvaluationResponse,
    ScenarioContract,
    ScenarioResult,
)
from app.agronomy.crops import CROP_REGISTRY, get_all_crops, get_crop
from app.agronomy.registry import rule_registry, AgronomicRuleRegistry
from app.agronomy.safety import AgronomicSafetyGate
from app.agronomy.evidence import build_evidence_from_forecast
from app.agronomy.explain import generate_advisory_explanation
from app.agronomy.advisory import advisory_engine, AdvisoryEngine
from app.agronomy.simulator.scenarios import ScenarioSimulator

__all__ = [
    "CropType",
    "GrowthStage",
    "AdvisorySeverity",
    "AdvisoryCategory",
    "AdvisoryOperationalStatus",
    "CropDefinition",
    "AgronomicRule",
    "AdvisoryEvidence",
    "ScientificAdvisory",
    "BlockedAdvisoryResponse",
    "AdvisoryEvaluationRequest",
    "AdvisoryEvaluationResponse",
    "ScenarioContract",
    "ScenarioResult",
    "CROP_REGISTRY",
    "get_all_crops",
    "get_crop",
    "rule_registry",
    "AgronomicRuleRegistry",
    "AgronomicSafetyGate",
    "build_evidence_from_forecast",
    "generate_advisory_explanation",
    "advisory_engine",
    "AdvisoryEngine",
    "ScenarioSimulator",
]
