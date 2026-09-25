"""
Tests for Phase 5B Scenario Analysis FastAPI endpoints.
Verifies registry catalog, simulation, comparison, sensitivity, explanation,
and provenance endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_scenario_registry():
    """GET /agronomy/scenario-registry returns the 6 allowed scenario types."""
    res = client.get("/agronomy/scenario-registry")
    assert res.status_code == 200
    data = res.json()
    assert "registry" in data
    items = data["registry"]
    assert len(items) == 6
    types = [item["scenario_type"] for item in items]
    assert "SOWING_DELAY" in types
    assert "IRRIGATION_INTERVENTION" in types
    assert "SEASONAL_ANOMALY" in types
    assert "RAINFALL_TIMING_SHIFT" in types
    assert "HEAVY_RAIN_CONCENTRATION" in types
    assert "COMBINED_SCENARIO" in types


def test_run_scenario_endpoint():
    """POST /agronomy/scenarios/run executes simulation with safety gate validation."""
    payload = {
        "scenario_type": "SOWING_DELAY",
        "delay_days": 10,
        "crop": "PADDY",
        "crop_stage": "VEGETATIVE",
        "block_id": "UP_LKO_BKT",
    }
    res = client.post("/agronomy/scenarios/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["classification"] == "SCENARIO_INDICATOR_ONLY"
    assert "deltas" in data
    assert "envelope" in data
    assert "explanation" in data
    assert "provenance" in data
    scenario_id = data["scenario_id"]

    # Test GET /agronomy/scenarios/{id}
    res_get = client.get(f"/agronomy/scenarios/{scenario_id}")
    assert res_get.status_code == 200
    assert res_get.json()["scenario_id"] == scenario_id

    # Test GET /agronomy/scenarios/{id}/explanation
    res_exp = client.get(f"/agronomy/scenarios/{scenario_id}/explanation")
    assert res_exp.status_code == 200
    assert "non_causal_statement" in res_exp.json()

    # Test GET /agronomy/scenarios/{id}/provenance
    res_prov = client.get(f"/agronomy/scenarios/{scenario_id}/provenance")
    assert res_prov.status_code == 200
    assert "parameter_hash" in res_prov.json()


def test_compare_scenario_endpoint():
    """POST /agronomy/scenarios/compare returns comparative report."""
    payload = {
        "scenario_type": "SEASONAL_ANOMALY",
        "rainfall_anomaly_pct": -25.0,
        "crop": "MAIZE",
        "crop_stage": "VEGETATIVE",
        "block_id": "UP_LKO_BKT",
    }
    res = client.post("/agronomy/scenarios/compare", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["baseline_reference"] == "Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)"
    assert len(data["deltas"]) > 0


def test_sensitivity_endpoint():
    """POST /agronomy/scenarios/sensitivity returns parameter response curves."""
    payload = {
        "scenario_type": "SOWING_DELAY",
        "delay_days": 7,
        "crop": "PADDY",
        "crop_stage": "VEGETATIVE",
        "block_id": "UP_LKO_BKT",
    }
    res = client.post("/agronomy/scenarios/sensitivity", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["parameter_name"] == "delay_days"
    assert len(data["curve_points"]) > 0


def test_run_scenario_blocked_by_safety():
    """POST /agronomy/scenarios/run returns 422 if safety check is violated."""
    payload = {
        "scenario_type": "SOWING_DELAY",
        "delay_days": 45,  # Exceeds max 21 days
        "block_id": "UP_LKO_BKT",
    }
    res = client.post("/agronomy/scenarios/run", json=payload)
    assert res.status_code == 422
    assert "Safety gate blocked scenario" in res.json()["detail"]
