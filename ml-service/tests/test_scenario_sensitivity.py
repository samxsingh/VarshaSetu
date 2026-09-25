"""
Tests for Phase 5B Scenario Sensitivity Analysis & Response Curves.
Verifies deterministic sensitivity curves, envelope aggregation, and baseline-vs-scenario deltas.
"""

import pytest
from app.agronomy.schemas import (
    ScenarioContract,
    ScenarioType,
    CropType,
    GrowthStage,
)
from app.agronomy.simulator.scenarios import ScenarioSimulator


def test_sensitivity_response_curves():
    """Verifies that sensitivity analysis produces deterministic curves across test parameter steps."""
    contract = ScenarioContract(
        scenario_id="sens_test_01",
        scenario_type=ScenarioType.SOWING_DELAY,
        delay_days=7,
        crop=CropType.PADDY,
        crop_stage=GrowthStage.VEGETATIVE,
    )
    sens_result = ScenarioSimulator.sensitivity(contract)

    assert sens_result.parameter_name == "delay_days"
    assert sens_result.parameter_range == [1.0, 21.0]
    assert len(sens_result.curve_points) >= 5

    # Check response curves monotonic trend for moisture stress
    stress_points = [
        pt.indicator_values["moisture_stress_pct"]
        for pt in sens_result.curve_points
        if "moisture_stress_pct" in pt.indicator_values
    ]
    assert len(stress_points) >= 4
    # With higher delay, moisture stress should not decrease
    for i in range(len(stress_points) - 1):
        assert stress_points[i+1] >= stress_points[i]


def test_scenario_envelope():
    """Verifies scenario envelope computing min, max, median, and baseline across variations."""
    contract = ScenarioContract(
        scenario_id="envelope_test_01",
        scenario_type=ScenarioType.SEASONAL_ANOMALY,
        rainfall_anomaly_pct=15.0,
        crop=CropType.PADDY,
        crop_stage=GrowthStage.VEGETATIVE,
    )
    result = ScenarioSimulator.simulate(contract)
    assert result.envelope is not None
    assert result.envelope.indicator_name == "moisture_stress_pct"
    assert result.envelope.min_value <= result.envelope.max_value
    assert result.envelope.baseline_value > 0


def test_scenario_comparison():
    """Verifies ScenarioSimulator.compare produces full delta breakdowns and explanation."""
    contract = ScenarioContract(
        scenario_id="comp_test_01",
        scenario_type=ScenarioType.HEAVY_RAIN_CONCENTRATION,
        concentration_factor=2.0,
        crop=CropType.PADDY,
        crop_stage=GrowthStage.VEGETATIVE,
    )
    comparison = ScenarioSimulator.compare(contract)

    assert comparison.scenario_id == "comp_test_01"
    assert comparison.baseline_reference == "Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)"
    assert len(comparison.deltas) >= 3
    for d in comparison.deltas:
        assert d.direction in ["INCREASED", "DECREASED", "UNCHANGED"]
        assert isinstance(d.relative_delta_pct, float)
    assert comparison.explanation is not None
    assert comparison.provenance is not None
    assert len(comparison.provenance.parameter_hash) == 64
