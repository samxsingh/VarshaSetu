"""
Tests for Phase 5A Advisory Engine, Explainability & Deduplication.
"""

import pytest
from app.agronomy.schemas import CropType, GrowthStage, AdvisoryEvaluationRequest
from app.agronomy.advisory import advisory_engine


@pytest.fixture
def mock_forecast():
    return {
        "forecast_id": "fc_test_heavy_001",
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
            "probability": 0.62,
            "predicted_value": 71.4,
        },
        "calibration": {
            "status": "NOT_CALIBRATED",
        },
        "uncertainty": {
            "status": "CALCULATED",
            "lower_bound": 42.1,
            "upper_bound": 96.2,
        },
        "validation": {
            "validation_status": "INSUFFICIENT_DATA",
        },
        "data": {
            "freshness_status": "HISTORICAL_ONLY",
        },
        "explainability": {
            "top_features": [
                {
                    "feature": "rainfall_3d",
                    "shap_value": 0.045,
                    "description": "3-day cumulative rainfall elevates event probability",
                }
            ]
        },
        "scientific_disclosure": {
            "status": "DIAGNOSTIC_ONLY",
        },
    }


def test_advisory_generation_contains_traceable_evidence(mock_forecast):
    """Verifies advisory contains complete, traceable evidence without gaps."""
    res = advisory_engine.evaluate_forecast(
        forecast=mock_forecast,
        crop=CropType.GENERAL,
        crop_stage=GrowthStage.ALL,
    )
    advisories = res["advisories"]
    assert len(advisories) >= 1
    adv = advisories[0]

    assert adv.evidence is not None
    assert adv.evidence.forecast_id == "fc_test_heavy_001"
    assert adv.evidence.probability == 0.62
    assert adv.evidence.point_estimate == 71.4
    assert adv.evidence.uncertainty == {"lower": 42.1, "median": None, "upper": 96.2}
    assert adv.evidence.data_freshness == "HISTORICAL_ONLY"
    assert adv.scientific_status == "DIAGNOSTIC_ONLY"
    assert adv.diagnostic_only is True


def test_advisory_explanation_is_non_causal(mock_forecast):
    """Verifies explanation wording avoids causal assertions."""
    res = advisory_engine.evaluate_forecast(
        forecast=mock_forecast,
        crop=CropType.GENERAL,
        crop_stage=GrowthStage.ALL,
    )
    adv = res["advisories"][0]
    explanation = adv.explanation

    assert "why_this_advisory_exists" in explanation
    assert "what_triggered_it" in explanation
    assert "supporting_evidence" in explanation

    # Check non-causal wording in signals
    signals = explanation["supporting_evidence"]["model_associated_signals"]
    assert len(signals) >= 1
    assert "not causal meteorological determinism" in signals[0]["non_causal_description"].lower()


def test_advisory_deduplication(mock_forecast):
    """Verifies deduplication hash is deterministic for identical conditions."""
    h1 = advisory_engine.compute_dedup_hash(
        forecast_id="fc_test_heavy_001",
        rule_id="AGRO_HEAVY_RAIN_INFO_001",
        block_id="UP_LKO_BKT",
        crop="GENERAL",
        crop_stage="ALL",
        valid_from="2024-09-15T00:00:00Z",
        valid_until="2024-09-22T00:00:00Z",
    )
    h2 = advisory_engine.compute_dedup_hash(
        forecast_id="fc_test_heavy_001",
        rule_id="AGRO_HEAVY_RAIN_INFO_001",
        block_id="UP_LKO_BKT",
        crop="GENERAL",
        crop_stage="ALL",
        valid_from="2024-09-15T00:00:00Z",
        valid_until="2024-09-22T00:00:00Z",
    )
    assert h1 == h2
    assert len(h1) == 16


def test_advisory_confidence_not_fabricated(mock_forecast):
    """Verifies confidence status remains explicitly uncalibrated/diagnostic."""
    res = advisory_engine.evaluate_forecast(
        forecast=mock_forecast,
        crop=CropType.GENERAL,
        crop_stage=GrowthStage.ALL,
    )
    adv = res["advisories"][0]
    assert adv.confidence_status == "NOT_OPERATIONALLY_CALIBRATED"
