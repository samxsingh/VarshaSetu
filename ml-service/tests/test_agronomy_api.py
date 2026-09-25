"""
Tests for Phase 5A FastAPI Agronomy Endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_agronomy_status():
    """Verifies agronomy status endpoint returns diagnostic mode disclosures."""
    res = client.get("/agronomy/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "active"
    assert data["phase"] == "PHASE_5A_AGRONOMIC_RULES_FOUNDATION"
    assert data["operational_mode"] == "DIAGNOSTIC_ONLY"
    assert data["operational_advisory_allowed"] is False
    assert data["safety_gate"]["status"] == "ENFORCING"
    assert data["total_registered_rules"] >= 7
    assert data["total_supported_crops"] == 6


def test_list_and_get_agronomy_rules():
    """Verifies rules listing and individual rule retrieval."""
    res = client.get("/agronomy/rules")
    assert res.status_code == 200
    data = res.json()
    assert data["total_rules"] >= 7
    first_rule_id = data["rules"][0]["rule_id"]

    rule_res = client.get(f"/agronomy/rules/{first_rule_id}")
    assert rule_res.status_code == 200
    rule_data = rule_res.json()
    assert rule_data["rule_id"] == first_rule_id
    assert rule_data["diagnostic_only"] is True

    # 404 on non-existent
    bad_res = client.get("/agronomy/rules/NON_EXISTENT_RULE")
    assert bad_res.status_code == 404


def test_list_and_get_agronomy_crops():
    """Verifies crop vocabulary listing and individual crop retrieval."""
    res = client.get("/agronomy/crops")
    assert res.status_code == 200
    data = res.json()
    assert data["total_crops"] == 6

    paddy_res = client.get("/agronomy/crops/PADDY")
    assert paddy_res.status_code == 200
    paddy_data = paddy_res.json()
    assert paddy_data["crop_id"] == "PADDY"
    assert "VEGETATIVE" in paddy_data["supported_stages"]


def test_evaluate_agronomy_advisories():
    """Verifies POST /agronomy/evaluate runs rules and produces diagnostic advisories."""
    payload = {
        "block_id": "UP_LKO_BKT",
        "crop": "PADDY",
        "crop_stage": "VEGETATIVE",
        "horizon_days": 7,
    }
    res = client.post("/agronomy/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["block_id"] == "UP_LKO_BKT"
    assert data["crop"] == "PADDY"
    assert data["crop_stage"] == "VEGETATIVE"
    assert data["system_status"] == "DIAGNOSTIC_ONLY"
    assert isinstance(data["advisories"], list)


def test_simulate_agronomy_scenario():
    """Verifies POST /agronomy/simulate returns scenario indicators."""
    payload = {
        "block_id": "UP_LKO_BKT",
        "rainfall_delta_mm": 20.0,
        "temperature_delta_c": 1.5,
        "additional_dry_days": 5,
        "crop": "PADDY",
        "crop_stage": "VEGETATIVE",
        "horizon_days": 7,
    }
    res = client.post("/agronomy/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["classification"] == "SCENARIO_INDICATOR_ONLY"
    assert "NOT predict crop yields" in data["scientific_disclaimer"]
