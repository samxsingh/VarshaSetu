"""
Tests for Phase 5A Agronomic Rules & Applicability Filtering.
"""

import pytest
from app.agronomy.schemas import CropType, GrowthStage
from app.agronomy.registry import rule_registry


def test_rule_registry_loading():
    """Verifies all defined agronomic rules are loaded into the registry."""
    rules = rule_registry.get_all_rules()
    assert len(rules) >= 7
    rule_ids = {r.rule_id for r in rules}
    assert "AGRO_HEAVY_RAIN_INFO_001" in rule_ids
    assert "AGRO_EXTREME_RAIN_ALERT_001" in rule_ids
    assert "AGRO_DRY_SPELL_INFO_001" in rule_ids
    assert "AGRO_MONSOON_ONSET_INFO_001" in rule_ids
    assert "AGRO_FALSE_ONSET_RISK_001" in rule_ids
    assert "AGRO_RAINFALL_DEFICIT_ANOMALY_001" in rule_ids


def test_crop_applicability_filtering():
    """Verifies rules are correctly filtered by crop context."""
    # General rules apply to any crop
    wheat_rules = rule_registry.get_applicable_rules(crop=CropType.WHEAT, stage=GrowthStage.VEGETATIVE)
    assert any(r.rule_id == "AGRO_HEAVY_RAIN_INFO_001" for r in wheat_rules)
    assert not any(r.rule_id == "AGRO_PADDY_HEAVY_RAIN_HARVEST_001" for r in wheat_rules)

    # Paddy harvest stage includes paddy-specific harvest rule
    paddy_harvest_rules = rule_registry.get_applicable_rules(crop=CropType.PADDY, stage=GrowthStage.HARVEST)
    assert any(r.rule_id == "AGRO_PADDY_HEAVY_RAIN_HARVEST_001" for r in paddy_harvest_rules)


def test_growth_stage_filtering():
    """Verifies stage-specific rules do not activate at inappropriate growth stages."""
    # Paddy at SOWING should NOT trigger harvest rule
    paddy_sowing_rules = rule_registry.get_applicable_rules(crop=CropType.PADDY, stage=GrowthStage.SOWING)
    assert not any(r.rule_id == "AGRO_PADDY_HEAVY_RAIN_HARVEST_001" for r in paddy_sowing_rules)
    # But should include vegetative dry spell or general dry spell
    paddy_veg_rules = rule_registry.get_applicable_rules(crop=CropType.PADDY, stage=GrowthStage.VEGETATIVE)
    assert any(r.rule_id == "AGRO_PADDY_DRY_SPELL_VEGETATIVE_001" for r in paddy_veg_rules)


def test_deterministic_priority_ordering():
    """Verifies rules are sorted with extreme hazard taking highest priority."""
    rules = rule_registry.get_all_rules()
    priorities = [r.priority for r in rules]
    assert priorities == sorted(priorities, reverse=True)
    # Extreme rain is top priority (100)
    assert rules[0].rule_id == "AGRO_EXTREME_RAIN_ALERT_001"
