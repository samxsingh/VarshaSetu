"""
Unit tests for Voice Subsystem & Providers (Phase 5C).
"""

import pytest
from app.voice.schemas import VoiceStatus, AudioFormat, VoiceSynthesisRequest
from app.voice.mock import MockVoiceProvider, BhashiniVoiceProvider
from app.voice.service import voice_service


def test_mock_voice_provider_status_and_synthesis():
    provider = MockVoiceProvider()
    status = provider.get_status()
    assert status["status"] == VoiceStatus.DEMO_ONLY.value
    assert status["configured"] is True

    req = VoiceSynthesisRequest(
        advisory_id="ADV_TEST_001",
        language="HI",
        speech_rate=1.0,
    )
    res = provider.synthesize(req, "भारी वर्षा जोखिम सूचक। खेतों में जलभराव की संभावना।")
    assert res.status == VoiceStatus.DEMO_ONLY
    assert res.format == AudioFormat.WAV
    assert res.duration_seconds > 0.0
    assert res.audio_content_base64 is not None
    assert "data:audio/wav;base64," in res.audio_content_base64


def test_bhashini_provider_unconfigured_behavior():
    bhashini = BhashiniVoiceProvider()
    status = bhashini.get_status()
    # In test environment without credentials, must report NOT_CONFIGURED
    assert status["status"] == VoiceStatus.NOT_CONFIGURED.value
    assert status["configured"] is False

    req = VoiceSynthesisRequest(
        advisory_id="ADV_TEST_002",
        language="HI",
    )
    res = bhashini.synthesize(req, "परीक्षण संदेश")
    assert res.status == VoiceStatus.NOT_CONFIGURED


def test_voice_service_consolidated_status():
    status = voice_service.get_status()
    assert status["system_mode"] == "DEMO_ONLY"
    assert status["telecom_integration"] == "DISABLED"
    assert "mock" in status["all_providers"]
    assert "bhashini" in status["all_providers"]
