from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ml_health_observability():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "varshasetu-ml-service"
    assert "health_classification" in data
    
    # Subsystems verification
    subsystems = data["subsystems"]
    assert subsystems["forecast_engine"]["status"] == "DIAGNOSTIC_ONLY"
    assert subsystems["forecast_engine"]["ground_anchor"] == "UP_LKO_BKT"
    assert subsystems["calibration_engine"]["status"] == "HEALTHY"
    assert subsystems["hindcast_validation"]["status"] == "HEALTHY"
    assert subsystems["agronomic_engine"]["status"] == "HEALTHY"
    assert subsystems["scenario_simulator"]["status"] == "HEALTHY"
    assert subsystems["localization_engine"]["status"] == "HEALTHY"
    assert subsystems["voice_subsystem"]["status"] == "DEMO_ONLY"
    assert subsystems["voice_subsystem"]["bhashini"] == "NOT_CONFIGURED"
    assert subsystems["notification_delivery"]["status"] == "NOT_CONFIGURED"

    # Scientific integrity distinction
    scientific = data["scientific_integrity"]
    assert "distinction_note" in scientific
    assert scientific["ground_anchor"] == "UP_LKO_BKT"
    assert scientific["observational_season"] == "Kharif 2024"
    assert scientific["single_season_constraint"] is True
    assert scientific["operational_forecast_active"] is False

    # Security check: verify no internal filesystem paths leaked in storage
    storage = data["storage"]
    for key, val in storage.items():
        assert "/" not in val, f"Storage key {key} leaked absolute path: {val}"

def test_ml_ready_endpoint():
    response = client.get("/ready")
    assert response.status_code in [200, 503]
    if response.status_code == 200:
        data = response.json()
        assert data["ready"] is True
        assert "dependencies" in data

def test_ml_version_endpoint():
    response = client.get("/version")
    assert response.status_code == 200
    data = response.json()
    assert data["version"] == "1.0.0"
    assert data["phase"] == "PHASE_6_PRODUCTION_READY"
    assert data["ground_anchor"] == "UP_LKO_BKT"

def test_ml_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "varshasetu-ml-service"
    assert data["scientific_mode"] == "DIAGNOSTIC_ONLY"
    assert "memory" in data

def test_ml_security_headers_and_tracing():
    response = client.get("/health", headers={"X-Request-Id": "test-req-1234"})
    assert response.headers.get("X-Request-Id") == "test-req-1234"
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
