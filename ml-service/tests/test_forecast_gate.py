"""
Tests for Phase 4E ForecastOperationalGate.
Verifies multi-tier gating: operational status granted only when all gates pass,
and appropriate diagnostic classifications otherwise.
"""

from app.forecast.gates import ForecastOperationalGate
from app.schemas.forecast import ForecastOperationalStatus, DataFreshnessStatus


def test_forecast_gate_historical_refusal():
    # Model ready, calibrated, validated, but data is historical
    result = ForecastOperationalGate.evaluate(
        model_exists=True,
        model_id="xgboost",
        calibration_allowed=True,
        validation_allowed=True,
        freshness_status=DataFreshnessStatus.HISTORICAL_ONLY.value,
        spatial_resolution="BLOCK",
        total_seasons=5,
        target_name="HEAVY_RAIN",
        horizon_days=7
    )

    assert result.operational is False
    assert result.status == ForecastOperationalStatus.DIAGNOSTIC_ONLY
    assert any("historical archive" in msg.lower() for msg in result.messages)


def test_forecast_gate_insufficient_seasons():
    # Only 1 season available
    result = ForecastOperationalGate.evaluate(
        model_exists=True,
        model_id="xgboost",
        calibration_allowed=False,
        validation_allowed=False,
        freshness_status=DataFreshnessStatus.FRESH.value,
        spatial_resolution="BLOCK",
        total_seasons=1,
        target_name="HEAVY_RAIN",
        horizon_days=7
    )

    assert result.operational is False
    assert result.status in (ForecastOperationalStatus.INSUFFICIENT_DATA, ForecastOperationalStatus.NOT_CALIBRATED)
    assert any("5 required" in msg for msg in result.messages)


def test_forecast_gate_spatial_limitation():
    # Unsupported micro-panchayat resolution requested
    result = ForecastOperationalGate.evaluate(
        model_exists=True,
        model_id="xgboost",
        calibration_allowed=True,
        validation_allowed=True,
        freshness_status=DataFreshnessStatus.FRESH.value,
        spatial_resolution="VILLAGE_MICRO_STATION",
        total_seasons=5
    )

    assert result.operational is False
    assert result.status == ForecastOperationalStatus.SPATIAL_LIMITATION


def test_forecast_gate_model_unavailable():
    result = ForecastOperationalGate.evaluate(
        model_exists=False,
        model_id="non_existent_model",
        calibration_allowed=True,
        validation_allowed=True,
        freshness_status=DataFreshnessStatus.FRESH.value
    )

    assert result.operational is False
    assert result.status == ForecastOperationalStatus.MODEL_UNAVAILABLE


def test_forecast_gate_all_pass():
    # Theoretical production scenario where all gates pass
    result = ForecastOperationalGate.evaluate(
        model_exists=True,
        model_id="xgboost",
        calibration_allowed=True,
        validation_allowed=True,
        freshness_status=DataFreshnessStatus.FRESH.value,
        spatial_resolution="BLOCK",
        total_seasons=5
    )

    assert result.operational is True
    assert result.status == ForecastOperationalStatus.OPERATIONAL
