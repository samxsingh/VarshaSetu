"""
Tests for Phase 4E ForecastVerifier.
Verifies retrospective matching against observations, pending states,
and error/skill calculation.
"""

import pandas as pd
from app.forecast.verification import ForecastVerifier
from app.forecast.generator import ForecastGenerator
from app.schemas.forecast import ForecastGenerateRequest


def test_verification_pending_when_observation_future():
    req = ForecastGenerateRequest(target_name="HEAVY_RAIN", horizon_days=7)
    record = ForecastGenerator.generate(req)

    # DataFrame that ends before valid_until date
    df_obs = pd.DataFrame({
        "date": ["2024-06-01", "2024-06-02"],
        "precipitation_sum_mm": [0.0, 10.0]
    })

    result = ForecastVerifier.verify(record, df_obs)
    assert result.verification_status == "PENDING"
    assert "not yet in the observational record" in result.notes


def test_verification_hit_calculation():
    req = ForecastGenerateRequest(target_name="HEAVY_RAIN", horizon_days=7)
    record = ForecastGenerator.generate(req)

    valid_until_date = record.valid_until[:10]

    # Create matching observation with heavy rain (≥64.5mm)
    df_obs = pd.DataFrame({
        "date": [valid_until_date],
        "precipitation_sum_mm": [82.5]
    })

    result = ForecastVerifier.verify(record, df_obs)
    assert result.verification_status == "VERIFIED"
    assert result.observed_event is True
    assert result.error_metric is not None
    assert "brier_score" in result.skill_details
    assert "contingency_outcome" in result.skill_details


def test_verification_continuous_rainfall():
    req = ForecastGenerateRequest(target_name="RAINFALL_AMOUNT", horizon_days=7)
    record = ForecastGenerator.generate(req)

    valid_until_date = record.valid_until[:10]

    df_obs = pd.DataFrame({
        "date": [valid_until_date],
        "precipitation_sum_mm": [12.0]
    })

    result = ForecastVerifier.verify(record, df_obs)
    assert result.verification_status == "VERIFIED"
    assert result.observation_value == 12.0
    assert result.error_metric is not None
    assert "absolute_error_mm" in result.skill_details
