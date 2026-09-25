"""
VarshaSetu - What-If Scenario Simulator Foundation (Phase 5A)
Implements the exploratory scenario simulation contract.
Strictly disclaims yield predictions, classifying all outputs as SCENARIO_INDICATOR_ONLY.
"""

import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.agronomy.schemas import ScenarioContract, ScenarioResult


class ScenarioSimulator:
    """
    Evaluates sensitivity scenarios against baseline forecast conditions.
    Provides informational hazard sensitivity without manufacturing yield figures.
    """

    @staticmethod
    def simulate(contract: ScenarioContract, baseline_forecast: Optional[Any] = None) -> ScenarioResult:
        scenario_id = contract.scenario_id or f"sim_{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # Extract baseline metrics if forecast provided, else default baseline
        baseline_rain = 42.5
        baseline_prob = 0.25
        if baseline_forecast:
            if isinstance(baseline_forecast, dict):
                pred = baseline_forecast.get("prediction", {})
                baseline_rain = pred.get("predicted_value") or 42.5
                baseline_prob = pred.get("probability") or 0.25
            else:
                pred = getattr(baseline_forecast, "prediction", None)
                if pred:
                    baseline_rain = getattr(pred, "predicted_value", None) or 42.5
                    baseline_prob = getattr(pred, "probability", None) or 0.25

        simulated_rain = max(0.0, baseline_rain + contract.rainfall_delta_mm)
        simulated_prob = min(1.0, max(0.0, baseline_prob + (contract.rainfall_delta_mm / 100.0) * 0.3))

        baseline_summary = {
            "expected_rainfall_mm": round(baseline_rain, 1),
            "estimated_event_probability": round(baseline_prob, 3),
            "horizon_days": contract.horizon_days,
            "crop": contract.crop.value,
            "crop_stage": contract.crop_stage.value,
        }

        simulated_summary = {
            "hypothetical_rainfall_mm": round(simulated_rain, 1),
            "hypothetical_event_probability": round(simulated_prob, 3),
            "rainfall_delta_mm": contract.rainfall_delta_mm,
            "temperature_delta_c": contract.temperature_delta_c,
            "additional_dry_days": contract.additional_dry_days,
            "horizon_days": contract.horizon_days,
        }

        # Derive exploratory sensitivity indicators
        risk_indicators: List[Dict[str, Any]] = []

        if contract.additional_dry_days >= 5:
            risk_indicators.append({
                "hazard": "DRY_SPELL_SENSITIVITY",
                "severity": "WATCH",
                "indicator_text": (
                    f"Adding {contract.additional_dry_days} consecutive dry days shifts the moisture balance into "
                    f"prolonged dry spell territory for {contract.crop.value} at {contract.crop_stage.value}."
                ),
            })

        if simulated_rain >= 64.5:
            risk_indicators.append({
                "hazard": "WATERLOGGING_SENSITIVITY",
                "severity": "ELEVATED",
                "indicator_text": (
                    f"Simulated cumulative rainfall ({simulated_rain:.1f} mm) crosses the IMD heavy rainfall threshold (64.5 mm), "
                    f"highlighting surface drainage importance during {contract.crop_stage.value}."
                ),
            })

        if contract.temperature_delta_c >= 3.0:
            risk_indicators.append({
                "hazard": "THERMAL_STRESS_SENSITIVITY",
                "severity": "WATCH",
                "indicator_text": (
                    f"A hypothetical +{contract.temperature_delta_c:.1f}°C temperature elevation increases reference "
                    f"evapotranspiration rates, accelerating root-zone desiccation."
                ),
            })

        if not risk_indicators:
            risk_indicators.append({
                "hazard": "NORMAL_SENSITIVITY_RANGE",
                "severity": "INFO",
                "indicator_text": "Hypothetical adjustments remain within normal exploratory baseline bounds.",
            })

        return ScenarioResult(
            scenario_id=scenario_id,
            classification="SCENARIO_INDICATOR_ONLY",
            block_id=contract.block_id,
            crop=contract.crop.value,
            crop_stage=contract.crop_stage.value,
            inputs={
                "base_forecast_id": contract.base_forecast_id,
                "rainfall_delta_mm": contract.rainfall_delta_mm,
                "temperature_delta_c": contract.temperature_delta_c,
                "additional_dry_days": contract.additional_dry_days,
            },
            baseline_summary=baseline_summary,
            simulated_summary=simulated_summary,
            hypothetical_risk_indicators=risk_indicators,
            scientific_disclaimer=(
                "Scenario simulation provides exploratory meteorological sensitivity indicators only. "
                "It does NOT predict crop yields, germination rates, or economic outcomes."
            ),
            timestamp=now_iso,
        )
