"""
Tests for Phase 4E ForecastExplanationGenerator.
Verifies plain-language explanations, domain category mapping,
and absence of agronomic decisions or causal claims.
"""

from app.forecast.disclosure import ForecastExplanationGenerator


def test_format_feature_item():
    item = ForecastExplanationGenerator.format_feature_item(
        feature_name="rainfall_3d",
        shap_val=0.045,
        feature_val=15.2,
        is_classification=True
    )

    assert item.feature == "rainfall_3d"
    assert item.category == "Antecedent Moisture"
    assert item.direction == "elevates"
    assert item.magnitude == 0.045
    assert "elevates the predicted event probability" in item.description
    assert "cause" not in item.description.lower()  # Non-causal check


def test_generate_narrative_no_agronomic_advice():
    item1 = ForecastExplanationGenerator.format_feature_item("rainfall_3d", 0.05, 12.0, True)
    item2 = ForecastExplanationGenerator.format_feature_item("surface_pressure_hpa", -0.03, 1008.0, True)

    narrative = ForecastExplanationGenerator.generate_narrative(
        target_name="HEAVY_RAIN",
        horizon_days=7,
        prediction_val=None,
        probability=0.28,
        top_features=[item1, item2],
        validation_status="INSUFFICIENT_DATA",
        calibration_status="NOT_CALIBRATED",
        data_freshness="HISTORICAL_ONLY",
        block_id="UP_LKO_BKT"
    )

    assert "28.0% likelihood of heavy rain" in narrative
    assert "Validation Status: INSUFFICIENT_DATA" in narrative
    assert "Spatial Resolution: Block centroid level" in narrative

    # Strict negative checks: No agronomic decision advice in meteorological layer!
    assert "sow" not in narrative.lower()
    assert "spray" not in narrative.lower()
    assert "irrigate" not in narrative.lower()
    assert "harvest" not in narrative.lower()


def test_scientific_limitations():
    limits = ForecastExplanationGenerator.get_scientific_limitations(
        validation_status="INSUFFICIENT_DATA",
        calibration_status="NOT_CALIBRATED",
        data_freshness="HISTORICAL_ONLY",
        spatial_resolution="BLOCK"
    )

    assert len(limits) >= 4
    assert any("statistical model contributions" in l for l in limits)
    assert any("retrospective" in l for l in limits)
