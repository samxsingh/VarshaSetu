"""
VarshaSetu - Operational Monitoring & Observability Contracts (Phase 4F)
Schemas for system health, operational readiness, expiry processing, and failure recovery.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class OperationalStatusSummary(BaseModel):
    """
    Comprehensive operational monitoring status across all sub-systems.
    Unavailable values must be null with an explicit status (no fabricated uptimes).
    """
    forecast_service_status: str
    model_registry_status: str
    data_freshness_status: str
    calibration_status: str
    validation_status: str
    event_engine_status: str
    delivery_status: str
    database_status: str
    last_successful_forecast_generation: Optional[str] = None
    last_event_detection: Optional[str] = None
    last_expiry_run: Optional[str] = None
    total_active_forecasts: int = 0
    total_active_events: int = 0
    active_dataset: str = "Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)"
    spatial_extent: str = "1 Block (BLOCK resolution ~9 km)"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    scientific_disclosures: List[str] = Field(default_factory=list)


class ProcessExpiryResponse(BaseModel):
    """
    Summary returned by idempotent forecast expiry processor.
    """
    processed_count: int
    expired_count: int
    expired_forecast_ids: List[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    message: str
