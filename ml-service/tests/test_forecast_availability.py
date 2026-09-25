"""
Tests for Phase 4E ForecastAvailabilityGate.
Verifies data freshness evaluation, stale detection, historical-only classification,
and feature completeness checking.
"""

from datetime import datetime, timezone, timedelta
import pandas as pd
import numpy as np

from app.forecast.availability import ForecastAvailabilityGate
from app.schemas.forecast import DataFreshnessStatus


def test_forecast_availability_historical():
    # Construct DataFrame with historical dates (e.g., 2024-09-30)
    dates = pd.date_range("2024-06-01", "2024-09-30", freq="D")
    data = {"date": dates}
    for col in ForecastAvailabilityGate.CORE_METEOROLOGICAL_FEATURES:
        data[col] = np.random.randn(len(dates))

    df = pd.DataFrame(data)

    report = ForecastAvailabilityGate.evaluate(df, block_id="UP_LKO_BKT")
    assert report.data_freshness == DataFreshnessStatus.HISTORICAL_ONLY.value
    assert report.operational_allowed is False
    assert report.latest_observation_date == "2024-09-30"
    assert report.days_since_latest_observation > 30
    assert report.features_available == 19
    assert report.feature_coverage_pct == 100.0


def test_forecast_availability_fresh():
    # Construct DataFrame with today's date
    now = datetime.now(timezone.utc)
    dates = pd.date_range(end=now.date(), periods=30, freq="D")
    data = {"date": dates}
    for col in ForecastAvailabilityGate.CORE_METEOROLOGICAL_FEATURES:
        data[col] = np.random.randn(len(dates))

    df = pd.DataFrame(data)

    report = ForecastAvailabilityGate.evaluate(df, block_id="UP_LKO_BKT", reference_date=now)
    assert report.data_freshness == DataFreshnessStatus.FRESH.value
    assert report.operational_allowed is True
    assert report.features_available == 19


def test_forecast_availability_missing_features():
    dates = pd.date_range("2024-06-01", "2024-09-30", freq="D")
    # Missing temperature and teleconnections
    df = pd.DataFrame({
        "date": dates,
        "rainfall_1d": [1.0] * len(dates)
    })

    report = ForecastAvailabilityGate.evaluate(df, block_id="UP_LKO_BKT")
    assert report.features_available < 19
    assert report.feature_coverage_pct < 100.0
    assert report.operational_allowed is False


def test_forecast_availability_empty():
    df = pd.DataFrame()
    report = ForecastAvailabilityGate.evaluate(df, block_id="UP_LKO_BKT")
    assert report.data_freshness == DataFreshnessStatus.MISSING.value
    assert report.operational_allowed is False
    assert report.features_available == 0
