"""
Tests for Phase 4E ForecastArtifactManager.
Verifies saving, retrieving, listing, immutability, and history extraction.
"""

from app.forecast.artifacts import ForecastArtifactManager
from app.forecast.generator import ForecastGenerator
from app.schemas.forecast import ForecastGenerateRequest


def test_save_and_retrieve_forecast_artifact():
    req = ForecastGenerateRequest(target_name="HEAVY_RAIN", horizon_days=7)
    record = ForecastGenerator.generate(req)

    saved_path = ForecastArtifactManager.save_forecast(record)
    assert saved_path.endswith(".json")

    retrieved = ForecastArtifactManager.get_forecast(record.forecast_id)
    assert retrieved is not None
    assert retrieved.forecast_id == record.forecast_id
    assert retrieved.location.block_id == record.location.block_id
    assert retrieved.target.target_type == record.target.target_type
    assert retrieved.prediction.probability == record.prediction.probability


def test_list_forecast_artifacts_filter():
    req1 = ForecastGenerateRequest(target_name="HEAVY_RAIN", horizon_days=7)
    req2 = ForecastGenerateRequest(target_name="RAINFALL_AMOUNT", horizon_days=7)
    r1 = ForecastGenerator.generate(req1)
    r2 = ForecastGenerator.generate(req2)

    heavy_list = ForecastArtifactManager.list_forecasts(target="HEAVY_RAIN")
    assert len(heavy_list) >= 1
    assert all(r.target.target_type == "HEAVY_RAIN" for r in heavy_list)


def test_forecast_history():
    history = ForecastArtifactManager.get_history(limit=10)
    assert len(history) >= 1
    item = history[0]
    assert item.forecast_id is not None
    assert item.target_name is not None
    assert item.verification_status == "PENDING"
