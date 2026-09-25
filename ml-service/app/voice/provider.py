"""
VarshaSetu - Voice Provider Abstract Base Class (Phase 5C)
Defines uniform contract for speech synthesis providers.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
from app.voice.schemas import VoiceSynthesisRequest, VoiceSynthesisResponse


class VoiceProvider(ABC):
    """Abstract interface for speech synthesis implementations."""

    @abstractmethod
    def get_provider_name(self) -> str:
        """Returns provider identifier name."""
        pass

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Returns provider health and configuration readiness."""
        pass

    @abstractmethod
    def synthesize(self, req: VoiceSynthesisRequest, advisory_text: str) -> VoiceSynthesisResponse:
        """Synthesizes speech from input text."""
        pass
