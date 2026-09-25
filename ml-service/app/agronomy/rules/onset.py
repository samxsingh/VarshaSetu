"""
VarshaSetu - Monsoon Onset & False Onset Agronomic Rules (Phase 5A)
Deterministic rules evaluating onset surge and false onset break conditions.
Does NOT issue imperative sowing directives.
"""

from typing import List
from app.agronomy.schemas import (
    AgronomicRule,
    CropType,
    GrowthStage,
    AdvisorySeverity,
    AdvisoryCategory,
)

ONSET_RULES: List[AgronomicRule] = [
    AgronomicRule(
        rule_id="AGRO_MONSOON_ONSET_INFO_001",
        rule_version="1.0",
        name="Monsoon Onset Progression Indicator",
        description="Identifies fulfillment of atmospheric onset surge criteria (>=25 mm over 3 days with >=2 rainy days).",
        target="MONSOON_ONSET",
        applicable_crop=CropType.GENERAL,
        applicable_stages=[GrowthStage.PRE_SOWING, GrowthStage.SOWING, GrowthStage.ALL],
        required_inputs=[
            "onset_probability",
            "forecast_horizon",
        ],
        thresholds={
            "probability_threshold": 0.50,
            "cumulative_3d_rain_mm": 25.0,
            "min_rainy_days": 2,
        },
        priority=60,
        severity=AdvisorySeverity.INFO,
        category=AdvisoryCategory.MONSOON_STATUS,
        advisory_template=(
            "Monsoon onset surge indicator active for the {horizon_days}-day window ({probability_pct}% model signal). "
            "Atmospheric signals indicate potential onset rainfall criteria fulfillment."
        ),
        explanation_template=(
            "Monsoon onset probability ({probability_pct}%) meets the 50.0% evaluation threshold. "
            "Signals reflect zonal wind reversal and sustained convective moisture flux over the block."
        ),
        enabled=True,
        scientific_source="IMD Onset Definition Adapted for Central/Northern Agro-Climatic Zones",
        provenance="VarshaSetu Phase 4A Target Definitions",
        diagnostic_only=True,
    ),
    AgronomicRule(
        rule_id="AGRO_FALSE_ONSET_RISK_001",
        rule_version="1.0",
        name="False Onset Hiatus Risk Indicator",
        description="Identifies risk of an initial onset rainfall surge followed by an immediate >=7 day dry break.",
        target="FALSE_ONSET",
        applicable_crop=CropType.GENERAL,
        applicable_stages=[GrowthStage.PRE_SOWING, GrowthStage.SOWING, GrowthStage.GERMINATION, GrowthStage.ALL],
        required_inputs=[
            "false_onset_probability",
            "forecast_horizon",
        ],
        thresholds={
            "probability_threshold": 0.40,
            "dry_break_days": 7,
        },
        priority=75,
        severity=AdvisorySeverity.WATCH,
        category=AdvisoryCategory.MONSOON_STATUS,
        advisory_template=(
            "False onset break risk indicator detected for the {horizon_days}-day window ({probability_pct}% probability). "
            "Initial convective burst may be followed by a prolonged dry hiatus."
        ),
        explanation_template=(
            "False onset risk index is elevated ({probability_pct}%). "
            "Teleconnection indices (MJO suppressed phase or positive pressure anomalies) suggest an onset stall."
        ),
        enabled=True,
        scientific_source="Webster & Fasullo (2003) Monsoon Hiatus & False Onset Dynamics",
        provenance="VarshaSetu Phase 4A / Phase 4F Alignment",
        diagnostic_only=True,
    ),
]
