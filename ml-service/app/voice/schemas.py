"""
VarshaSetu - Voice Accessibility Schemas (Phase 5C)
Defines strictly typed data models for synthetic voice generation,
playback states, provider contracts, and accessibility disclosures.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class VoiceStatus(str, Enum):
    """Lifecycle / configuration status of voice synthesis provider."""
    NOT_CONFIGURED = "NOT_CONFIGURED"
    DEMO_ONLY = "DEMO_ONLY"
    READY = "READY"
    ERROR = "ERROR"


class AudioFormat(str, Enum):
    """Synthesized audio output payload format."""
    WAV = "WAV"
    MP3 = "MP3"
    SYNTHETIC_TONE = "SYNTHETIC_TONE"
    METADATA_ONLY = "METADATA_ONLY"


class VoiceSynthesisRequest(BaseModel):
    """Payload to request audio synthesis for an advisory."""
    advisory_id: str
    language: str = "HI"
    text: Optional[str] = None
    speech_rate: float = Field(default=1.0, ge=0.5, le=2.0)


class VoiceSynthesisResponse(BaseModel):
    """Synthesized speech metadata and audio payload."""
    advisory_id: str
    language: str
    status: VoiceStatus
    provider: str
    format: AudioFormat
    duration_seconds: float
    sample_rate_hz: int = 16000
    audio_url: Optional[str] = None
    audio_content_base64: Optional[str] = None
    transcript: str
    synthesized_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    disclosure: str = (
        "Demonstration Voice Output: Operating in controlled prototype mode. "
        "Telecommunications infrastructure, SMS/IVR, and production Bhashini pipelines are not configured."
    )
