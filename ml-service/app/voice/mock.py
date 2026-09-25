"""
VarshaSetu - Voice Providers Implementation (Phase 5C)
Includes MockVoiceProvider (DEMO_ONLY) and BhashiniVoiceProvider (NOT_CONFIGURED).
Ensures zero fabricated credentials or mock external connections.
"""

import os
import math
import struct
import base64
from typing import Dict, Any
from app.voice.provider import VoiceProvider
from app.voice.schemas import (
    VoiceStatus,
    AudioFormat,
    VoiceSynthesisRequest,
    VoiceSynthesisResponse,
)


def _generate_demo_wav_bytes(duration_sec: float, sample_rate: int = 16000) -> bytes:
    """
    Generates a tiny, valid PCM WAV file with a soft sinusoidal acoustic tone (440 Hz)
    for interactive browser testing.
    """
    num_samples = int(duration_sec * sample_rate)
    # Clamp sample size to at most 1 second to keep payload compact for tests
    num_samples = min(num_samples, sample_rate * 2)
    frequency = 440.0
    amplitude = 4000  # soft tone
    
    # 44-byte WAV header for 16-bit mono PCM
    byte_rate = sample_rate * 2
    block_align = 2
    subchunk2_size = num_samples * block_align
    chunk_size = 36 + subchunk2_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        chunk_size,
        b"WAVE",
        b"fmt ",
        16,       # Subchunk1Size
        1,        # AudioFormat (PCM)
        1,        # NumChannels (Mono)
        sample_rate,
        byte_rate,
        block_align,
        16,       # BitsPerSample
        b"data",
        subchunk2_size,
    )

    data = bytearray()
    for i in range(num_samples):
        # Soft sine wave
        val = int(amplitude * math.sin(2.0 * math.pi * frequency * (i / sample_rate)))
        data.extend(struct.pack("<h", val))

    return header + bytes(data)


class MockVoiceProvider(VoiceProvider):
    """Local demonstration speech provider returning DEMO_ONLY status."""

    def get_provider_name(self) -> str:
        return "MOCK_LOCAL_VOICE_ENGINE"

    def get_status(self) -> Dict[str, Any]:
        return {
            "provider": self.get_provider_name(),
            "status": VoiceStatus.DEMO_ONLY.value,
            "configured": True,
            "mode": "PROTOTYPE_DEMONSTRATION",
            "supported_languages": ["EN", "HI"],
            "disclaimer": (
                "Mock voice provider active for accessibility prototyping. "
                "Generates synthetic acoustic tones and client speech synthesis fallback."
            ),
        }

    def synthesize(self, req: VoiceSynthesisRequest, advisory_text: str) -> VoiceSynthesisResponse:
        words = advisory_text.split()
        word_count = len(words)
        # Average reading speed ~ 2.5 words per second
        raw_duration = max(1.5, word_count / (2.5 * req.speech_rate))
        duration = round(raw_duration, 1)

        wav_bytes = _generate_demo_wav_bytes(duration_sec=min(duration, 1.5))
        b64_audio = base64.b64encode(wav_bytes).decode("ascii")

        return VoiceSynthesisResponse(
            advisory_id=req.advisory_id,
            language=req.language,
            status=VoiceStatus.DEMO_ONLY,
            provider=self.get_provider_name(),
            format=AudioFormat.WAV,
            duration_seconds=duration,
            sample_rate_hz=16000,
            audio_url=None,
            audio_content_base64=f"data:audio/wav;base64,{b64_audio}",
            transcript=advisory_text,
            disclosure=(
                "Demonstration Voice Output: Operating in controlled prototype mode. "
                "External telecom infrastructure and Bhashini pipelines are not configured."
            ),
        )


class BhashiniVoiceProvider(VoiceProvider):
    """
    Integration stub for Government of India Bhashini TTS.
    Reports NOT_CONFIGURED when API credentials are absent.
    """

    def __init__(self):
        self.api_key = os.getenv("BHASHINI_API_KEY", "")
        self.user_id = os.getenv("BHASHINI_USER_ID", "")

    def get_provider_name(self) -> str:
        return "BHASHINI_GOV_IN"

    def is_configured(self) -> bool:
        return bool(self.api_key and self.user_id)

    def get_status(self) -> Dict[str, Any]:
        configured = self.is_configured()
        return {
            "provider": self.get_provider_name(),
            "status": VoiceStatus.READY.value if configured else VoiceStatus.NOT_CONFIGURED.value,
            "configured": configured,
            "mode": "GOVERNMENT_PIPELINE" if configured else "UNCONFIGURED_STUB",
            "message": (
                "Bhashini API credentials active."
                if configured
                else "Bhashini credentials (BHASHINI_API_KEY) not configured. System defaults to local demo provider."
            ),
        }

    def synthesize(self, req: VoiceSynthesisRequest, advisory_text: str) -> VoiceSynthesisResponse:
        if not self.is_configured():
            # Graceful degraded response
            return VoiceSynthesisResponse(
                advisory_id=req.advisory_id,
                language=req.language,
                status=VoiceStatus.NOT_CONFIGURED,
                provider=self.get_provider_name(),
                format=AudioFormat.METADATA_ONLY,
                duration_seconds=0.0,
                sample_rate_hz=16000,
                audio_url=None,
                audio_content_base64=None,
                transcript=advisory_text,
                disclosure="Bhashini production voice provider is NOT_CONFIGURED. No external synthesis performed.",
            )
        # In case credentials exist in future phases:
        raise NotImplementedError("Live Bhashini synthesis pipeline is strictly out of Phase 5C scope.")
