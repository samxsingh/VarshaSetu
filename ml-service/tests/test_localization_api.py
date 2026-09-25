"""
Integration tests for Localization and Voice Endpoints (Phase 5C).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_languages_endpoint():
    response = client.get("/agronomy/languages")
    assert response.status_code == 200
    data = response.json()
    assert "supported_languages" in data
    codes = [l["code"] for l in data["supported_languages"]]
    assert "EN" in codes
    assert "HI" in codes
    assert data["translation_engine"] == "CONTROLLED_DETERMINISTIC_TEMPLATES"


def test_get_terminology_endpoint():
    response = client.get("/agronomy/terminology")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert data["total_terms"] >= 15
    assert len(data["terms"]) >= 15


def test_localize_advisory_endpoint():
    sample_advisory = {
        "advisory_id": "ADV_SAMPLE_API_001",
        "triggered_rules": ["AGRO_DRY_SPELL_INFO_001"],
        "dedup_hash": "aabbccdd11223344",
        "confidence_status": "HISTORICALLY_CALIBRATED",
        "evidence": {
            "target": "DRY_SPELL",
            "horizon_days": 7,
            "probability": 0.45,
        },
    }

    # Test Hindi localization
    resp_hi = client.post(
        "/agronomy/localize",
        json={"advisory": sample_advisory, "target_language": "HI"},
    )
    assert resp_hi.status_code == 200
    res_hi = resp_hi.json()
    assert res_hi["safety_gate_status"] == "PASSED"
    loc = res_hi["localized_advisory"]
    assert loc["language"] == "HI"
    assert "शुष्क अवधि जोखिम सूचक" in loc["title"]
    assert "7 दिनों" in loc["summary"]
    assert "45" in loc["summary"]

    # Test English localization
    resp_en = client.post(
        "/agronomy/localize",
        json={"advisory": sample_advisory, "target_language": "EN"},
    )
    assert resp_en.status_code == 200
    loc_en = resp_en.json()["localized_advisory"]
    assert loc_en["language"] == "EN"
    assert "Dry Spell Risk Indicator" in loc_en["title"]


def test_voice_status_and_synthesis_api():
    status_resp = client.get("/agronomy/voice/status")
    assert status_resp.status_code == 200
    assert status_resp.json()["system_mode"] == "DEMO_ONLY"

    # Evaluate an advisory first so it exists in memory
    eval_resp = client.post(
        "/agronomy/evaluate",
        json={"block_id": "UP_LKO_BKT", "crop": "GENERAL", "crop_stage": "ALL"},
    )
    assert eval_resp.status_code == 200
    advisories = eval_resp.json().get("advisories", [])

    if advisories:
        adv_id = advisories[0]["advisory_id"]
        # Test localized GET
        loc_get = client.get(f"/agronomy/advisories/{adv_id}/localized?lang=HI")
        assert loc_get.status_code == 200
        assert loc_get.json()["language"] == "HI"

        # Test Voice Synthesis
        voice_resp = client.post(
            f"/agronomy/advisories/{adv_id}/voice",
            json={"advisory_id": adv_id, "language": "HI", "speech_rate": 1.0},
        )
        assert voice_resp.status_code == 200
        v_data = voice_resp.json()
        assert v_data["status"] == "DEMO_ONLY"
        assert v_data["duration_seconds"] > 0
