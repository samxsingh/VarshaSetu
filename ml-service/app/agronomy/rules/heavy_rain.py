"""
VarshaSetu - Heavy Rainfall Agronomic Rules (Phase 5A)
Deterministic, informational rules evaluating IMD heavy rainfall threshold (64.5 mm/24h).
"""

from typing import List
from app.agronomy.schemas import (
    AgronomicRule,
    CropType,
    GrowthStage,
    AdvisorySeverity,
    AdvisoryCategory,
)

HEAVY_RAIN_RULES: List[AgronomicRule] = [
    AgronomicRule(
        rule_id="AGRO_HEAVY_RAIN_INFO_001",
        rule_version="1.0",
        name="Heavy Rainfall Risk Indicator",
        description="Identifies elevated risk of 24h precipitation exceeding the IMD heavy rain threshold (>=64.5 mm).",
        target="HEAVY_RAIN",
        applicable_crop=CropType.GENERAL,
        applicable_stages=[GrowthStage.ALL],
        required_inputs=[
            "rainfall_probability",
            "point_estimate",
            "forecast_horizon",
            "uncertainty",
        ],
        thresholds={
            "probability_threshold": 0.40,
            "rainfall_amount_threshold_mm": 64.5,
        },
        priority=80,
        severity=AdvisorySeverity.WATCH,
        category=AdvisoryCategory.WEATHER_RISK,
        advisory_template=(
            "Heavy rainfall risk indicator detected for the {horizon_days}-day forecast window. "
            "Model forecasts indicate a {probability_pct}% calibrated probability of 24h rainfall exceeding 64.5 mm."
        ),
        explanation_template=(
            "Heavy rainfall probability ({probability_pct}%) meets or exceeds the informational watch threshold (40.0%). "
            "Historical baseline and gradient boosted model signals reflect elevated moisture convergence."
        ),
        enabled=True,
        scientific_source="IMD Heavy Rainfall Standard Criteria (>= 64.5 mm / 24h)",
        provenance="VarshaSetu Phase 4A Target Definitions & Phase 4E Forecast Products",
        diagnostic_only=True,
    ),
    AgronomicRule(
        rule_id="AGRO_PADDY_HEAVY_RAIN_HARVEST_001",
        rule_version="1.0",
        name="Paddy Harvest Stage Heavy Rain Watch",
        description="Informational risk notification for paddy at maturity/harvest stage when heavy precipitation is anticipated.",
        target="HEAVY_RAIN",
        applicable_crop=CropType.PADDY,
        applicable_stages=[GrowthStage.MATURITY, GrowthStage.HARVEST],
        required_inputs=[
            "rainfall_probability",
            "point_estimate",
            "forecast_horizon",
        ],
        thresholds={
            "probability_threshold": 0.35,
            "rainfall_amount_threshold_mm": 50.0,
        },
        priority=85,
        severity=AdvisorySeverity.ELEVATED,
        category=AdvisoryCategory.FIELD_CONDITION,
        advisory_template=(
            "Paddy maturity/harvest window heavy precipitation indicator. "
            "Forecast models project a {probability_pct}% chance of significant rainfall during the {horizon_days}-day window."
        ),
        explanation_template=(
            "Mature paddy crops are sensitive to lodging and grain shattering if exposed to severe rainfall. "
            "Observed forecast probability ({probability_pct}%) meets watch criteria for harvest stages."
        ),
        enabled=True,
        scientific_source="ICAR Kharif Paddy Agro-Meteorological Guidelines",
        provenance="VarshaSetu Phase 4A / 4E Meteorological Alignment",
        diagnostic_only=True,
    ),
]
