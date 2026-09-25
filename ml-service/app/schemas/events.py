"""
VarshaSetu - Event Intelligence & Alert Contracts (Phase 4F)
Data contracts for threshold-based scientific event detection, alert deduplication,
cooldown management, and provider-neutral delivery simulation.
"""

from enum import Enum
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid


class EventType(str, Enum):
    """
    Standard scientific event types derived strictly from Phase 4A target definitions.
    Agronomic decision commands (sow, irrigate, spray, harvest) are strictly prohibited.
    """
    HEAVY_RAIN_RISK = "HEAVY_RAIN_RISK"
    EXTREME_RAIN_RISK = "EXTREME_RAIN_RISK"
    DRY_SPELL_RISK = "DRY_SPELL_RISK"
    MONSOON_ONSET_RISK = "MONSOON_ONSET_RISK"
    FALSE_ONSET_RISK = "FALSE_ONSET_RISK"
    RAINFALL_ANOMALY = "RAINFALL_ANOMALY"


class EventSeverity(str, Enum):
    """
    Scientific event severity tiers.
    Severity does NOT declare an operational emergency if operational gates are not passed.
    """
    INFO = "INFO"
    WATCH = "WATCH"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class EventState(str, Enum):
    """
    Lifecycle states for detected meteorological events.
    """
    DETECTED = "DETECTED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    UPDATED = "UPDATED"
    RESOLVED = "RESOLVED"
    EXPIRED = "EXPIRED"
    SUPPRESSED = "SUPPRESSED"


class EventTransitionRecord(BaseModel):
    """
    Audit record for state transitions of an event.
    """
    transition_id: str = Field(default_factory=lambda: f"evtr_{uuid.uuid4().hex[:12]}")
    event_id: str
    previous_state: EventState
    new_state: EventState
    actor: str = "SYSTEM"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    reason: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ScientificEventRecord(BaseModel):
    """
    Immutable representation of a detected scientific meteorological event.
    """
    event_id: str = Field(default_factory=lambda: f"ev_{uuid.uuid4().hex[:14]}")
    event_type: EventType
    forecast_id: str
    block_id: str
    detected_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    valid_from: str
    valid_until: str
    probability: float
    threshold: float
    unit: str = "mm"
    severity: EventSeverity
    confidence_status: str
    operational_status: str = "DIAGNOSTIC_ONLY"
    data_freshness: str = "HISTORICAL_ONLY"
    validation_status: str = "INSUFFICIENT_DATA"
    explanation_reference: Optional[str] = None
    state: EventState = EventState.DETECTED
    description: str
    deduplication_hash: str
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[str] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class EventDetectionRequest(BaseModel):
    """
    Parameters for triggering threshold-based event detection across active forecasts.
    """
    block_id: Optional[str] = "UP_LKO_BKT"
    target_types: Optional[List[str]] = None
    force_reevaluate: bool = False
    cooldown_hours: int = 24


class EventDetectionResponse(BaseModel):
    """
    Results summary from an event detection pass.
    """
    total_evaluated_forecasts: int
    detected_events: List[ScientificEventRecord] = Field(default_factory=list)
    updated_events: List[ScientificEventRecord] = Field(default_factory=list)
    suppressed_count: int = 0
    operational_status: str = "DIAGNOSTIC_ONLY"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    summary: str


class EventActionRequest(BaseModel):
    """
    Request model for acknowledging or resolving an event.
    """
    actor: str = "SYSTEM"
    reason: str
    metadata: Optional[Dict[str, Any]] = None
