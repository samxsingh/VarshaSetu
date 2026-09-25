"""
VarshaSetu - Extreme Rainfall Agronomic Rules (Phase 5A)
Deterministic rules evaluating the IMD extreme rainfall threshold (>=204.5 mm/24h).
"""

from typing import List
from app.agronomy.schemas import (
    AgronomicRule,
    CropType,
    GrowthStage,
    AdvisorySeverity,
    AdvisoryCategory,
)

EXTREME_RAIN_RULES: List[AgronomicRule] = [
    AgronomicRule(
        rule_id="AGRO_EXTREME_RAIN_ALERT_001",
        rule_version="1.0",
        name="Extreme Rainfall Hazard Indicator",
        description="Identifies high risk of extreme 24h precipitation exceeding the IMD catastrophic threshold (>=204.5 mm).",
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
            "probability_threshold": 0.85,
            "extreme_rainfall_threshold_mm": 204.5,
        },
        priority=100,  # Top priority
        severity=AdvisorySeverity.HIGH,
        category=AdvisoryCategory.WEATHER_RISK,
        advisory_template=(
            "Extreme rainfall risk indicator detected for the {horizon_days}-day horizon. "
            "Forecast models project conditions capable of exceeding the IMD extreme rainfall threshold (204.5 mm / 24h)."
        ),
        explanation_template=(
            "Model probability ({probability_pct}%) or point estimate indicates risk of catastrophic localized deluge. "
            "Severe waterlogging hazard for all agricultural blocks."
        ),
        enabled=True,
        scientific_source="IMD Extreme Rainfall Classification (>= 204.5 mm / 24h)",
        provenance="VarshaSetu Phase 4F Event Engine Thresholds",
        diagnostic_only=True,
    ),
]
