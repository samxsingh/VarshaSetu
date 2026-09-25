"""
VarshaSetu - Dry Spell Agronomic Rules (Phase 5A)
Deterministic rules evaluating the dry spell threshold (>=5 consecutive dry days <1.0 mm).
"""

from typing import List
from app.agronomy.schemas import (
    AgronomicRule,
    CropType,
    GrowthStage,
    AdvisorySeverity,
    AdvisoryCategory,
)

DRY_SPELL_RULES: List[AgronomicRule] = [
    AgronomicRule(
        rule_id="AGRO_DRY_SPELL_INFO_001",
        rule_version="1.0",
        name="Dry Spell Risk Indicator",
        description="Identifies risk of sustained dry spell of 5 or more consecutive days with precipitation <1.0 mm.",
        target="DRY_SPELL",
        applicable_crop=CropType.GENERAL,
        applicable_stages=[GrowthStage.ALL],
        required_inputs=[
            "dry_spell_probability",
            "forecast_horizon",
        ],
        thresholds={
            "probability_threshold": 0.45,
            "consecutive_dry_days_threshold": 5,
        },
        priority=70,
        severity=AdvisorySeverity.WATCH,
        category=AdvisoryCategory.WATER_STRESS,
        advisory_template=(
            "Dry-spell risk indicator detected for the {horizon_days}-day forecast window. "
            "Forecast models project a {probability_pct}% calibrated probability of >=5 consecutive dry days."
        ),
        explanation_template=(
            "Dry spell probability ({probability_pct}%) meets or exceeds the 45.0% watch threshold. "
            "Antecedent soil moisture depletion is possible during prolonged dry intervals."
        ),
        enabled=True,
        scientific_source="IMD / Agricultural Drought Classification Criteria (>= 5 dry days < 1.0mm)",
        provenance="VarshaSetu Phase 4A Target Definitions",
        diagnostic_only=True,
    ),
    AgronomicRule(
        rule_id="AGRO_PADDY_DRY_SPELL_VEGETATIVE_001",
        rule_version="1.0",
        name="Paddy Vegetative Stage Moisture Watch",
        description="Dry spell watch for paddy crops during tillering and vegetative growth when moisture demand is elevated.",
        target="DRY_SPELL",
        applicable_crop=CropType.PADDY,
        applicable_stages=[GrowthStage.GERMINATION, GrowthStage.VEGETATIVE],
        required_inputs=[
            "dry_spell_probability",
            "forecast_horizon",
        ],
        thresholds={
            "probability_threshold": 0.40,
            "consecutive_dry_days_threshold": 5,
        },
        priority=75,
        severity=AdvisorySeverity.ELEVATED,
        category=AdvisoryCategory.WATER_STRESS,
        advisory_template=(
            "Paddy vegetative stage dry interval indicator. "
            "Forecast models indicate an elevated ({probability_pct}%) probability of a 5+ day dry interval in the {horizon_days}-day window."
        ),
        explanation_template=(
            "Paddy tillering and canopy development are vulnerable to prolonged root-zone drying. "
            "Forecast models project a dry period exceeding 5 consecutive days."
        ),
        enabled=True,
        scientific_source="ICAR Kharif Rice Water Requirement Studies",
        provenance="VarshaSetu Phase 4A / 4E Alignment",
        diagnostic_only=True,
    ),
]
