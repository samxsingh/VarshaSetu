"""
VarshaSetu - Rainfall Anomaly Agronomic Rules (Phase 5A)
Deterministic rules evaluating precipitation departures from 30-year climatological normal.
"""

from typing import List
from app.agronomy.schemas import (
    AgronomicRule,
    CropType,
    GrowthStage,
    AdvisorySeverity,
    AdvisoryCategory,
)

ANOMALY_RULES: List[AgronomicRule] = [
    AgronomicRule(
        rule_id="AGRO_RAINFALL_DEFICIT_ANOMALY_001",
        rule_version="1.0",
        name="Substantial Rainfall Deficit Indicator",
        description="Identifies cumulative rainfall departure <= -50% below climatological normal for the horizon.",
        target="RAINFALL_ANOMALY",
        applicable_crop=CropType.GENERAL,
        applicable_stages=[GrowthStage.ALL],
        required_inputs=[
            "percentage_departure",
            "climatological_normal_mm",
            "forecast_horizon",
        ],
        thresholds={
            "deficit_departure_pct": -50.0,
        },
        priority=65,
        severity=AdvisorySeverity.WATCH,
        category=AdvisoryCategory.RAINFALL_ANOMALY,
        advisory_template=(
            "Substantial rainfall deficit indicator for the {horizon_days}-day window. "
            "Forecast precipitation departure is {departure_pct}% relative to historical climatological normals."
        ),
        explanation_template=(
            "Precipitation projection exhibits a negative anomaly departure ({departure_pct}%) exceeding the -50.0% watch boundary. "
            "Suggests sub-normal cumulative rainfall for the planning period."
        ),
        enabled=True,
        scientific_source="IMD Climatological Anomaly Categorization (Large Deficient <= -50%)",
        provenance="VarshaSetu Phase 4A / Phase 4E Alignment",
        diagnostic_only=True,
    ),
    AgronomicRule(
        rule_id="AGRO_RAINFALL_SURPLUS_ANOMALY_001",
        rule_version="1.0",
        name="Substantial Rainfall Surplus Indicator",
        description="Identifies cumulative rainfall departure >= +50% above climatological normal for the horizon.",
        target="RAINFALL_ANOMALY",
        applicable_crop=CropType.GENERAL,
        applicable_stages=[GrowthStage.ALL],
        required_inputs=[
            "percentage_departure",
            "climatological_normal_mm",
            "forecast_horizon",
        ],
        thresholds={
            "surplus_departure_pct": 50.0,
        },
        priority=65,
        severity=AdvisorySeverity.WATCH,
        category=AdvisoryCategory.RAINFALL_ANOMALY,
        advisory_template=(
            "Substantial rainfall surplus indicator for the {horizon_days}-day window. "
            "Forecast precipitation departure is +{departure_pct}% relative to historical climatological normals."
        ),
        explanation_template=(
            "Precipitation projection exhibits a positive anomaly departure (+{departure_pct}%) exceeding the +50.0% watch boundary. "
            "Indicates potential for significant soil saturation."
        ),
        enabled=True,
        scientific_source="IMD Climatological Anomaly Categorization (Large Excess >= +50%)",
        provenance="VarshaSetu Phase 4A / Phase 4E Alignment",
        diagnostic_only=True,
    ),
]
