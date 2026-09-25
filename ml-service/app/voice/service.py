"""
VarshaSetu - Voice Service Dispatcher (Phase 5C)
Manages voice providers, status evaluation, and synthesis invocation.
"""

from typing import Dict, Any, Optional
from app.voice.schemas import (
    VoiceStatus,
    VoiceSynthesisRequest,
    VoiceSynthesisResponse,
)
from app.voice.provider import VoiceProvider
from app.voice.mock import MockVoiceProvider, BhashiniVoiceProvider


class VoiceService:
    """Manages voice synthesis dispatching."""

    def __init__(self):
        self.mock_provider = MockVoiceProvider()
        self.bhashini_provider = BhashiniVoiceProvider()
        self._active_provider: VoiceProvider = self.mock_provider

    def get_status(self) -> Dict[str, Any]:
        """Returns consolidated voice subsystem status."""
        return {
            "active_provider": self._active_provider.get_provider_name(),
            "status": self._active_provider.get_status(),
            "all_providers": {
                "mock": self.mock_provider.get_status(),
                "bhashini": self.bhashini_provider.get_status(),
            },
            "system_mode": "DEMO_ONLY",
            "telecom_integration": "DISABLED",
            "disclosure": (
                "Accessibility Voice Engine: Demonstrates localized audio readout capabilities. "
                "Production telecom delivery and live Bhashini integration are disabled."
            ),
        }

    def synthesize(self, req: VoiceSynthesisRequest, text: str) -> VoiceSynthesisResponse:
        """Dispatches synthesis to active provider."""
        return self._active_provider.synthesize(req, text)


# Singleton
voice_service = VoiceService()
