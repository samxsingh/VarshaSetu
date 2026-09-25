"""
Tests for Phase 5A What-If Scenario Simulator.
"""

import pytest
from app.agronomy.schemas import ScenarioContract, CropType, GrowthStage
from app.agronomy.simulator.scenarios import ScenarioSimulator


def test_scenario_simulation_contract():
    """Verifies that scenario output is strictly classified as SCENARIO_INDICATOR_ONLY."""
    contract = ScenarioContract(
        scenario_id="sim_test_001",
        rainfall_delta_mm=25.0,
        temperature_delta_c=2.0,
        additional_dry_days=6,
        crop=CropType.PADDY,
        crop_stage=GrowthStage.VEGETATIVE,
    )
    result = ScenarioSimulator.simulate(contract)

    assert result.classification == "SCENARIO_INDICATOR_ONLY"
    assert result.classification != "PREDICTED_YIELD"
    assert "NOT predict crop yields" in result.scientific_disclaimer
    assert len(result.hypothetical_risk_indicators) >= 1
    # Dry days >= 5 triggered dry spell sensitivity
    hazards = [r["hazard"] for r in result.hypothetical_risk_indicators]
    assert "DRY_SPELL_SENSITIVITY" in hazards
