"""
VarshaSetu - Forecast Lifecycle Schema Contracts (Phase 4F)
Deterministic state machine models for scientific forecast lifecycle management.
Guarantees immutability of forecasts while recording transparent state transitions.
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid


class ForecastLifecycleState(str, Enum):
    """
    Standard deterministic lifecycle states for a scientific forecast.
    """
    GENERATED = "GENERATED"
    ACTIVE = "ACTIVE"
    EXPIRING = "EXPIRING"
    EXPIRED = "EXPIRED"
    VERIFIED = "VERIFIED"
    SUPERSEDED = "SUPERSEDED"
    REJECTED = "REJECTED"


class LifecycleTransitionRecord(BaseModel):
    """
    Immutable audit record for a single forecast lifecycle transition.
    """
    transition_id: str = Field(default_factory=lambda: f"trans_{uuid.uuid4().hex[:12]}")
    forecast_id: str
    previous_status: ForecastLifecycleState
    new_status: ForecastLifecycleState
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    reason: str
    model_version: str
    dataset_fingerprint: str
    actor: str = "SYSTEM"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LifecycleTransitionRequest(BaseModel):
    """
    Request model for triggering a state transition on an active forecast.
    """
    target_status: ForecastLifecycleState
    reason: str
    actor: Optional[str] = "SYSTEM"
    metadata: Optional[Dict[str, Any]] = None


class ForecastLifecycleSummary(BaseModel):
    """
    Summary view of a forecast's current lifecycle state and audit trail.
    """
    forecast_id: str
    current_status: ForecastLifecycleState
    created_at: str
    last_updated_at: str
    transitions_count: int
    history: List[LifecycleTransitionRecord] = Field(default_factory=list)
