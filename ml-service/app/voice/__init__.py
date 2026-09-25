"""
VarshaSetu - Voice Subsystem (Phase 5C)
"""

from app.voice.schemas import (
    VoiceStatus,
    AudioFormat,
    VoiceSynthesisRequest,
    VoiceSynthesisResponse,
)
from app.voice.provider import VoiceProvider
from app.voice.mock import MockVoiceProvider, BhashiniVoiceProvider
from app.voice.service import VoiceService, voice_service

__all__ = [
    "VoiceStatus",
    "AudioFormat",
    "VoiceSynthesisRequest",
    "VoiceSynthesisResponse",
    "VoiceProvider",
    "MockVoiceProvider",
    "BhashiniVoiceProvider",
    "VoiceService",
    "voice_service",
]
