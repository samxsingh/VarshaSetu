"""
Tests for Phase 4E ForecastGenerator.
Verifies end-to-end execution of the 19-step forecast pipeline,
for classification, continuous rainfall, calibration status, and disclosures.
"""

from app.forecast.generator import ForecastGenerator
from app.schemas.forecast import ForecastGenerateRequest


def test_generate_heavy_rain_forecast():
    req = ForecastGenerateRequest(
        target_name="HEAVY_RAIN",
        horizon_days=7,
        block_id="UP_LKO_BKT"
    )

    record = ForecastGenerator.generate(req)

    assert record.forecast_id.startswith("fc_heavy_rain_7d_")
    assert record.location.block_id == "UP_LKO_BKT"
    assert record.target.target_type == "HEAVY_RAIN"
    assert record.horizon.horizon_days == 7
    assert record.prediction.probability is not None
    assert 0.0 <= record.prediction.probability <= 1.0
    assert record.prediction.predicted_value is None
    assert record.scientific_disclosure.status in ("DIAGNOSTIC_ONLY", "INSUFFICIENT_DATA", "NOT_CALIBRATED")
    assert len(record.scientific_disclosure.messages) > 0


def test_generate_rainfall_amount_continuous_forecast():
    req = ForecastGenerateRequest(
        target_name="RAINFALL_AMOUNT",
        horizon_days=7,
        block_id="UP_LKO_BKT"
    )

    record = ForecastGenerator.generate(req)

    assert record.forecast_id.startswith("fc_rainfall_amount_7d_")
    assert record.target.target_type == "RAINFALL_AMOUNT"
    assert record.prediction.predicted_value is not None
    assert record.prediction.predicted_value >= 0.0
    assert record.uncertainty.status == "CALCULATED"
    assert record.uncertainty.lower_bound is not None
    assert record.uncertainty.upper_bound is not None
    assert record.uncertainty.upper_bound >= record.uncertainty.lower_bound


def test_generate_dry_spell_forecast():
    req = ForecastGenerateRequest(
        target_name="DRY_SPELL",
        horizon_days=3,
        block_id="UP_LKO_BKT"
    )

    record = ForecastGenerator.generate(req)

    assert record.target.target_type == "DRY_SPELL"
    assert record.horizon.horizon_days == 3
    assert record.prediction.probability is not None
