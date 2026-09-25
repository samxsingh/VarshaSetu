"""
VarshaSetu - Forecast Freshness Tests (Phase 4F)
Verifies physical time audits, staleness flags, and historical data enforcement.
"""

from datetime import datetime, timezone, timedelta
from app.forecast.freshness import ForecastFreshnessEvaluator


def test_forecast_freshness_historical_data_classification():
    """Verifies that 2024 Kharif records are strictly classified as HISTORICAL and non-operational."""
    now = datetime(2026, 9, 25, 12, 0, 0, tzinfo=timezone.utc)
    res = ForecastFreshnessEvaluator.evaluate(
        forecast_id="fc_test_hist",
        generated_at_str="2024-09-15T12:00:00Z",
        valid_from_str="2024-09-16",
        valid_until_str="2024-09-22",
        source_observation_date_str="2024-09-15",
        reference_time=now,
    )

    assert res.freshness_status == "HISTORICAL"
    assert res.is_operational_allowed is False
    assert "historical" in res.scientific_notes.lower()
    assert res.is_validity_passed is True


def test_forecast_freshness_fresh_simulated():
    """Verifies fresh data within 24h evaluates to FRESH."""
    now = datetime(2026, 9, 25, 12, 0, 0, tzinfo=timezone.utc)
    res = ForecastFreshnessEvaluator.evaluate(
        forecast_id="fc_test_fresh",
        generated_at_str="2026-09-25T10:00:00Z",
        valid_from_str="2026-09-26",
        valid_until_str="2026-10-02",
        source_observation_date_str="2026-09-25",
        reference_time=now,
    )

    assert res.freshness_status == "FRESH"
    assert res.is_operational_allowed is True
    assert res.is_validity_passed is False
