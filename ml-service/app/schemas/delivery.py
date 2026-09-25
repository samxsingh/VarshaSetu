"""
VarshaSetu - Provider-Neutral Delivery Contracts (Phase 4F)
Delivery abstractions simulating internal notification distribution.
External provider integrations (SMS, WhatsApp, Bhashini) are strictly future work.
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid


class DeliveryChannel(str, Enum):
    """
    Communication channels. Only IN_APP / LOG / SIMULATION are active in Phase 4F.
    External third-party channels return NOT_CONFIGURED.
    """
    IN_APP = "IN_APP"
    EMAIL = "EMAIL"
    SMS = "SMS"
    WHATSAPP = "WHATSAPP"
    VOICE = "VOICE"
    LOG = "LOG"


class DeliveryStatus(str, Enum):
    """
    Delivery status outcome.
    """
    SIMULATED = "SIMULATED"
    DELIVERED = "DELIVERED"
    NOT_CONFIGURED = "NOT_CONFIGURED"
    FAILED = "FAILED"
    SUPPRESSED = "SUPPRESSED"


class DeliveryMessage(BaseModel):
    """
    Payload to be delivered through a notification provider.
    """
    message_id: str = Field(default_factory=lambda: f"msg_{uuid.uuid4().hex[:12]}")
    recipient_id: str
    channel: DeliveryChannel
    event_id: str
    title: str
    body: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DeliveryResult(BaseModel):
    """
    Result outcome returned by a DeliveryProvider.
    """
    delivery_id: str = Field(default_factory=lambda: f"deliv_{uuid.uuid4().hex[:12]}")
    message_id: str
    channel: DeliveryChannel
    status: DeliveryStatus
    provider_name: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    details: Dict[str, Any] = Field(default_factory=dict)
