"""
Tests for Phase 5A Agronomic Schemas & Controlled Vocabularies.
"""

import pytest
from app.agronomy.schemas import (
    CropType,
    GrowthStage,
    AdvisorySeverity,
    AdvisoryCategory,
    AdvisoryOperationalStatus,
    AgronomicRule,
    ScenarioContract,
    ScenarioResult,
)
from app.agronomy.crops import get_all_crops, get_crop


def test_crop_vocabulary_completeness():
    """Verifies all 6 required crops exist in registry."""
    crops = get_all_crops()
    assert len(crops) == 6
    crop_ids = {c.crop_id for c in crops}
    assert CropType.WHEAT in crop_ids
    assert CropType.PADDY in crop_ids
    assert CropType.MAIZE in crop_ids
    assert CropType.PULSES in crop_ids
    assert CropType.MUSTARD in crop_ids
    assert CropType.GENERAL in crop_ids


def test_crop_lookup():
    """Verifies case-insensitive crop lookup."""
    paddy = get_crop("paddy")
    assert paddy is not None
    assert paddy.crop_id == CropType.PADDY
    assert GrowthStage.VEGETATIVE in paddy.supported_stages
    assert paddy.status == "INFORMATIONAL_ONLY"

    invalid = get_crop("NON_EXISTENT_CROP")
    assert invalid is None


def test_scenario_contract_defaults():
    """Verifies scenario simulation contract default fields."""
    contract = ScenarioContract(block_id="UP_LKO_BKT")
    assert contract.rainfall_delta_mm == 0.0
    assert contract.crop == CropType.GENERAL
    assert contract.crop_stage == GrowthStage.VEGETATIVE
    assert contract.horizon_days == 7
