"""
Tests for Phase 5A AgronomicSafetyGate & Blocked Advisories.
"""

import pytest
from app.agronomy.schemas import CropType, GrowthStage, SafetyGateStatus
from app.agronomy.safety import AgronomicSafetyGate
from app.agronomy.registry import rule_registry


@pytest.fixture
def valid_forecast():
    """Provides a valid baseline forecast record for testing."""
    return {
        "forecast_id": "fc_test_001",
        "generated_at": "2024-09-15T00:00:00Z",
        "valid_from": "2024-09-15T00:00:00Z",
        "valid_until": "2024-09-22T00:00:00Z",
        "location": {
            "block_id": "UP_LKO_BKT",
            "spatial_resolution": "BLOCK",
        },
        "target": {
            "target_type": "HEAVY_RAIN",
            "threshold": 64.5,
        },
        "horizon": {
            "horizon_days": 7,
        },
        "model": {
            "model_id": "xgboost",
        },
        "prediction": {
            "probability": 0.55,
            "predicted_value": 72.0,
        },
        "calibration": {
            "status": "CALIBRATED",
        },
        "uncertainty": {
            "status": "CALCULATED",
            "lower_bound": 45.0,
            "upper_bound": 98.0,
        },
        "validation": {
            "validation_status": "INSUFFICIENT_DATA",
        },
        "data": {
            "freshness_status": "HISTORICAL_ONLY",
        },
        "scientific_disclosure": {
            "status": "DIAGNOSTIC_ONLY",
        },
    }


def test_safety_gate_passes_valid_forecast(valid_forecast):
    """Verifies that a well-structured forecast passes all 13 checks."""
    rule = rule_registry.get_rule_by_id("AGRO_HEAVY_RAIN_INFO_001")
    assert rule is not None
    status, blocked = AgronomicSafetyGate.evaluate(
        forecast=valid_forecast,
        rule=rule,
        crop=CropType.GENERAL,
        crop_stage=GrowthStage.ALL,
    )
    assert status == SafetyGateStatus.PASSED
    assert blocked is None


def test_safety_gate_blocks_missing_forecast():
    """Verifies null forecast is rejected."""
    rule = rule_registry.get_rule_by_id("AGRO_HEAVY_RAIN_INFO_001")
    status, blocked = AgronomicSafetyGate.evaluate(
        forecast=None,
        rule=rule,
        crop=CropType.GENERAL,
        crop_stage=GrowthStage.ALL,
    )
    assert status == SafetyGateStatus.BLOCKED
    assert blocked is not None
    assert blocked.reason_code == "MISSING_FORECAST"


def test_safety_gate_blocks_invalid_horizon(valid_forecast):
    """Verifies uncalibrated or unsupported horizon is blocked."""
    invalid_fc = dict(valid_forecast)
    invalid_fc["horizon"] = {"horizon_days": 42}  # Unsupported horizon
    rule = rule_registry.get_rule_by_id("AGRO_HEAVY_RAIN_INFO_001")

    status, blocked = AgronomicSafetyGate.evaluate(
        forecast=invalid_fc,
        rule=rule,
        crop=CropType.GENERAL,
        crop_stage=GrowthStage.ALL,
    )
    assert status == SafetyGateStatus.BLOCKED
    assert blocked is not None
    assert blocked.reason_code == "INVALID_HORIZON"


def test_safety_gate_blocks_inapplicable_crop_stage(valid_forecast):
    """Verifies stage mismatch blocks rule execution."""
    paddy_harvest_rule = rule_registry.get_rule_by_id("AGRO_PADDY_HEAVY_RAIN_HARVEST_001")
    assert paddy_harvest_rule is not None

    # Evaluate at SOWING stage (should be blocked)
    status, blocked = AgronomicSafetyGate.evaluate(
        forecast=valid_forecast,
        rule=paddy_harvest_rule,
        crop=CropType.PADDY,
        crop_stage=GrowthStage.SOWING,
    )
    assert status == SafetyGateStatus.BLOCKED
    assert blocked is not None
    assert blocked.reason_code == "RULE_INAPPLICABLE_TO_CONTEXT"
