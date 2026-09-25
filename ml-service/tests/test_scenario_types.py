"""
Tests for Phase 5B Scenario Types.
Verifies all 6 scenario types execute deterministically, yielding structured
indicator deltas, classifications, and explanations.
"""

import pytest
from app.agronomy.schemas import (
    ScenarioContract,
    ScenarioType,
    CropType,
    GrowthStage,
    IndicatorSeverity,
)
from app.agronomy.simulator.scenarios import ScenarioSimulator


def test_sowing_delay_scenario():
    """Verifies SOWING_DELAY scenario perturbation and deltas."""
    contract = ScenarioContract(
        scenario_id="test_sow_delay_01",
        scenario_type=ScenarioType.SOWING_DELAY,
        delay_days=10,
        crop=CropType.PADDY,
        crop_stage=GrowthStage.VEGETATIVE,
    )
    result = ScenarioSimulator.simulate(contract)

    assert result.classification == "SCENARIO_INDICATOR_ONLY"
    assert result.scenario_type == ScenarioType.SOWING_DELAY
    assert len(result.deltas) >= 3

    # Check that sowing delay shifted moisture stress upward
    stress_delta = next((d for d in result.deltas if d.indicator_name == "moisture_stress_pct"), None)
    assert stress_delta is not None
    assert stress_delta.scenario_value > stress_delta.baseline_value
    assert stress_delta.direction in ["INCREASED", "UNCHANGED"]


def test_irrigation_intervention_scenario():
    """Verifies IRRIGATION_INTERVENTION scenario simulation."""
    contract = ScenarioContract(
        scenario_id="test_irrigation_01",
        scenario_type=ScenarioType.IRRIGATION_INTERVENTION,
        intervention_start_day=5,
        intervention_frequency=3,
        intervention_duration=2,
        crop=CropType.PADDY,
        crop_stage=GrowthStage.VEGETATIVE,
    )
    result = ScenarioSimulator.simulate(contract)

    assert result.classification == "SCENARIO_INDICATOR_ONLY"
    assert result.scenario_type == ScenarioType.IRRIGATION_INTERVENTION
    stress_delta = next((d for d in result.deltas if d.indicator_name == "moisture_stress_pct"), None)
    assert stress_delta is not None
    # Supplemental irrigation should decrease or maintain moisture stress
    assert stress_delta.scenario_value <= stress_delta.baseline_value


def test_seasonal_anomaly_scenario():
    """Verifies SEASONAL_ANOMALY (+/- 60% rainfall anomaly) simulation."""
    contract = ScenarioContract(
        scenario_id="test_anomaly_01",
        scenario_type=ScenarioType.SEASONAL_ANOMALY,
        rainfall_anomaly_pct=-30.0,
        crop=CropType.MAIZE,
        crop_stage=GrowthStage.VEGETATIVE,
    )
    result = ScenarioSimulator.simulate(contract)

    assert result.classification == "SCENARIO_INDICATOR_ONLY"
    assert result.scenario_type == ScenarioType.SEASONAL_ANOMALY
    rain_delta = next((d for d in result.deltas if d.indicator_name == "cumulative_rain_mm"), None)
    assert rain_delta is not None
    assert rain_delta.scenario_value < rain_delta.baseline_value
    assert rain_delta.direction == "DECREASED"


def test_rainfall_timing_shift_scenario():
    """Verifies RAINFALL_TIMING_SHIFT scenario simulation."""
    contract = ScenarioContract(
        scenario_id="test_timing_shift_01",
        scenario_type=ScenarioType.RAINFALL_TIMING_SHIFT,
        shift_days=7,
        crop=CropType.PADDY,
        crop_stage=GrowthStage.FLOWERING,
    )
    result = ScenarioSimulator.simulate(contract)

    assert result.classification == "SCENARIO_INDICATOR_ONLY"
    assert result.scenario_type == ScenarioType.RAINFALL_TIMING_SHIFT
    assert len(result.deltas) >= 2


def test_heavy_rain_concentration_scenario():
    """Verifies HEAVY_RAIN_CONCENTRATION scenario simulation."""
    contract = ScenarioContract(
        scenario_id="test_concentration_01",
        scenario_type=ScenarioType.HEAVY_RAIN_CONCENTRATION,
        concentration_factor=1.8,
        crop=CropType.PADDY,
        crop_stage=GrowthStage.VEGETATIVE,
    )
    result = ScenarioSimulator.simulate(contract)

    assert result.classification == "SCENARIO_INDICATOR_ONLY"
    assert result.scenario_type == ScenarioType.HEAVY_RAIN_CONCENTRATION
    waterlog_delta = next((d for d in result.deltas if d.indicator_name == "waterlogging_risk_pct"), None)
    assert waterlog_delta is not None
    assert waterlog_delta.scenario_value >= waterlog_delta.baseline_value


def test_combined_scenario():
    """Verifies COMBINED_SCENARIO (max 3 orthogonal dimensions) simulation."""
    contract = ScenarioContract(
        scenario_id="test_combined_01",
        scenario_type=ScenarioType.COMBINED_SCENARIO,
        combined_types=[ScenarioType.SOWING_DELAY, ScenarioType.SEASONAL_ANOMALY],
        delay_days=7,
        rainfall_anomaly_pct=-20.0,
        crop=CropType.PADDY,
        crop_stage=GrowthStage.VEGETATIVE,
    )
    result = ScenarioSimulator.simulate(contract)

    assert result.classification == "SCENARIO_INDICATOR_ONLY"
    assert result.scenario_type == ScenarioType.COMBINED_SCENARIO
    assert result.provenance is not None
    assert result.explanation is not None
    assert "NOT predict crop yields" in result.scientific_disclaimer
