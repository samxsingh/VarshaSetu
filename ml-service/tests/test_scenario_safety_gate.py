"""
Tests for Phase 5B Agronomic Safety Gate Scenario Checks (Checks 14-21).
Verifies that out-of-bounds parameters, invalid combinations, yield claims,
and economic claims are strictly blocked.
"""

import pytest
from app.agronomy.schemas import (
    ScenarioContract,
    ScenarioType,
    CropType,
    GrowthStage,
    SafetyGateStatus,
)
from app.agronomy.safety import AgronomicSafetyGate


def test_check_14_parameter_range_bounds():
    """Check 14: Verifies parameters exceeding scientific bounds are blocked."""
    # Sowing delay > 21 days
    contract = ScenarioContract(
        scenario_id="invalid_delay",
        scenario_type=ScenarioType.SOWING_DELAY,
        delay_days=30,  # Max allowed is 21
    )
    status, block = AgronomicSafetyGate.evaluate_scenario(contract)
    assert status == SafetyGateStatus.BLOCKED
    assert block.reason_code == "PARAMETER_OUT_OF_BOUNDS"

    # Rainfall anomaly > 60%
    contract = ScenarioContract(
        scenario_id="invalid_anomaly",
        scenario_type=ScenarioType.SEASONAL_ANOMALY,
        rainfall_anomaly_pct=75.0,  # Max allowed is 60.0
    )
    status, block = AgronomicSafetyGate.evaluate_scenario(contract)
    assert status == SafetyGateStatus.BLOCKED
    assert block.reason_code == "PARAMETER_OUT_OF_BOUNDS"


def test_check_15_scenario_combination_check():
    """Check 15: Verifies COMBINED_SCENARIO cannot have > 3 types or < 2 types."""
    # Single type marked as combined
    contract = ScenarioContract(
        scenario_id="invalid_combo_1",
        scenario_type=ScenarioType.COMBINED_SCENARIO,
        combined_types=[ScenarioType.SOWING_DELAY],
    )
    status, block = AgronomicSafetyGate.evaluate_scenario(contract)
    assert status == SafetyGateStatus.BLOCKED
    assert block.reason_code == "INVALID_SCENARIO_COMBINATION"

    # 4 types in combined
    contract = ScenarioContract(
        scenario_id="invalid_combo_4",
        scenario_type=ScenarioType.COMBINED_SCENARIO,
        combined_types=[
            ScenarioType.SOWING_DELAY,
            ScenarioType.SEASONAL_ANOMALY,
            ScenarioType.RAINFALL_TIMING_SHIFT,
            ScenarioType.HEAVY_RAIN_CONCENTRATION,
        ],
    )
    status, block = AgronomicSafetyGate.evaluate_scenario(contract)
    assert status == SafetyGateStatus.BLOCKED
    assert block.reason_code == "INVALID_SCENARIO_COMBINATION"


def test_check_16_baseline_integrity_check():
    """Check 16: Non-ground anchor block IDs are blocked."""
    contract = ScenarioContract(
        scenario_id="invalid_block",
        scenario_type=ScenarioType.SOWING_DELAY,
        delay_days=5,
        block_id="MAH_PUN_PUN01",
    )
    status, block = AgronomicSafetyGate.evaluate_scenario(contract)
    assert status == SafetyGateStatus.BLOCKED
    assert block.reason_code == "INVALID_BASELINE_LOCATION"


def test_check_17_observation_scenario_separation_check():
    """Check 17: Scenario payloads claiming OBSERVED classification are blocked."""
    contract = ScenarioContract(
        scenario_id="test_sep",
        scenario_type=ScenarioType.SOWING_DELAY,
        delay_days=5,
    )
    status, block = AgronomicSafetyGate.evaluate_scenario(
        contract,
        raw_payload={"classification": "OBSERVED"},
    )
    assert status == SafetyGateStatus.BLOCKED
    assert block.reason_code == "INVALID_CLASSIFICATION"


def test_check_18_yield_model_absence_check():
    """Check 18: Claims of crop yield, yield loss, biomass are strictly blocked."""
    contract = ScenarioContract(
        scenario_id="test_yield",
        scenario_type=ScenarioType.SOWING_DELAY,
        delay_days=5,
        parameters={"expected_crop_yield_loss_pct": 25.0},
    )
    status, block = AgronomicSafetyGate.evaluate_scenario(
        contract,
        raw_payload={"expected_yield": "15 quintals"},
    )
    assert status == SafetyGateStatus.BLOCKED
    assert block.reason_code == "PROHIBITED_YIELD_PREDICTION_CLAIM"


def test_check_19_economic_claim_check():
    """Check 19: Claims of revenue, profit, or rupee losses are strictly blocked."""
    contract = ScenarioContract(
        scenario_id="test_econ",
        scenario_type=ScenarioType.SOWING_DELAY,
        delay_days=5,
        parameters={"financial_loss_in_rupees": 5000},
    )
    status, block = AgronomicSafetyGate.evaluate_scenario(
        contract,
        raw_payload={"revenue_impact": "-₹10000"},
    )
    assert status == SafetyGateStatus.BLOCKED
    assert block.reason_code == "PROHIBITED_ECONOMIC_CLAIM"


def test_valid_scenario_passes_safety_gate():
    """Verifies that a valid Kharif 2024 scenario passes all checks."""
    contract = ScenarioContract(
        scenario_id="valid_scenario_01",
        scenario_type=ScenarioType.SOWING_DELAY,
        delay_days=7,
        block_id="UP_LKO_BKT",
        crop=CropType.PADDY,
        crop_stage=GrowthStage.VEGETATIVE,
    )
    status, block = AgronomicSafetyGate.evaluate_scenario(contract)
    assert status == SafetyGateStatus.PASSED
    assert block is None
