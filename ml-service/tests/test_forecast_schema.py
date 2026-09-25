"""
Tests for Phase 4E ScientificForecastRecord and product schemas.
Verifies contract completeness, validation rules, non-nullable disclosures,
and backward-compatible properties.
"""

import pytest
from app.schemas.forecast import (
    ScientificForecastRecord,
    LocationContext,
    TargetContext,
    HorizonContext,
    ModelContext,
    PredictionContext,
    CalibrationContext,
    UncertaintyContext,
    ValidationContext,
    ExplainabilityContext,
    DataContext,
    ScientificDisclosureContext,
    ForecastOperationalStatus,
    DataFreshnessStatus,
    ForecastGenerateRequest,
    ForecastStatusResponse,
    ForecastAvailabilityResponse
)


def test_scientific_forecast_record_contract():
    record = ScientificForecastRecord(
        forecast_id="fc_heavy_rain_7d_test_001",
        generated_at="2026-09-25T15:00:00Z",
        valid_from="2024-10-01",
        valid_until="2024-10-07",
        location=LocationContext(
            state_id="UP",
            district_id="UP_LKO",
            block_id="UP_LKO_BKT",
            latitude=26.9749,
            longitude=80.9276,
            spatial_resolution="BLOCK"
        ),
        target=TargetContext(
            target_type="HEAVY_RAIN",
            target_definition_version="v1.0-imd-kharif",
            threshold=64.5,
            unit="probability"
        ),
        horizon=HorizonContext(
            horizon_days=7,
            horizon_label="7-Day Medium-Range Outlook"
        ),
        model=ModelContext(
            model_id="xgboost",
            model_family="Gradient Boosted Decision Trees",
            model_version="1.0.0",
            training_period="2024-06-01 to 2024-07-31",
            dataset_fingerprint="3fec50c2ef89dbfc"
        ),
        prediction=PredictionContext(
            probability=0.245,
            predicted_value=None,
            category="MODERATE"
        ),
        calibration=CalibrationContext(
            status="NOT_CALIBRATED",
            calibrator_type="NONE"
        ),
        uncertainty=UncertaintyContext(
            status="NOT_AVAILABLE",
            method="NONE"
        ),
        validation=ValidationContext(
            validation_status="INSUFFICIENT_DATA",
            validation_years=[2024],
            hindcast_experiment_id="hindcast_test_exp"
        ),
        explainability=ExplainabilityContext(
            status="UNAVAILABLE",
            top_features=[]
        ),
        data=DataContext(
            source_status="IMD_ERA5_INGESTED",
            freshness_status="HISTORICAL_ONLY",
            missingness=0.0,
            feature_coverage="19/19 features complete"
        ),
        scientific_disclosure=ScientificDisclosureContext(
            status="DIAGNOSTIC_ONLY",
            messages=["Diagnostic forecast based on Kharif 2024 record."]
        )
    )

    assert record.forecast_id == "fc_heavy_rain_7d_test_001"
    assert record.location.block_id == "UP_LKO_BKT"
    assert record.geography == "UP_LKO_BKT"  # Property check
    assert record.target_name == "HEAVY_RAIN"  # Property check
    assert record.horizon_days == 7  # Property check
    assert record.prediction.probability == 0.245
    assert record.scientific_disclosure.status == "DIAGNOSTIC_ONLY"
    assert len(record.scientific_disclosure.messages) > 0


def test_forecast_generate_request_defaults():
    req = ForecastGenerateRequest()
    assert req.target_name == "HEAVY_RAIN"
    assert req.horizon_days == 7
    assert req.block_id == "UP_LKO_BKT"
    assert req.model_id is None
