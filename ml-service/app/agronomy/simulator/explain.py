"""
VarshaSetu - Scenario Explanation Engine (Phase 5B)
Generates explainable, non-causal meteorological attribution for scenario perturbations.
Strictly distinguishes baseline observations from hypothetical scenario inputs.
"""

from typing import Dict, Any, List
from app.agronomy.schemas import (
    ScenarioType,
    ScenarioContract,
    ScenarioExplanation,
    IndicatorDelta,
)


class ScenarioExplanationEngine:
    """Produces structured non-causal explanations for scenario perturbations."""

    @classmethod
    def generate_explanation(
        cls,
        contract: ScenarioContract,
        deltas: List[IndicatorDelta],
        simulated_metrics: Dict[str, Any],
    ) -> ScenarioExplanation:
        scenario_type = contract.scenario_type
        params = contract.parameters or {}

        # 1. Baseline description
        baseline_desc = (
            "Historical Kharif 2024 meteorological observation sequence for Bakshi Ka Talab "
            "(UP_LKO_BKT, 122 daily records from June 1 to September 30, 2024)."
        )

        # 2. Perturbations applied
        perturbations: List[str] = []
        meteorological_drivers: List[str] = []
        assumptions: List[str] = []

        if scenario_type == ScenarioType.SOWING_DELAY:
            days = contract.delay_days if contract.delay_days is not None else params.get("delay_days", 7)
            perturbations.append(f"Calendar sowing window shifted forward by +{days} days.")
            meteorological_drivers.append(
                f"Shift in the reference rainfall accumulation window by {days} days relative to peak monsoon surge."
            )
            assumptions.append(
                "Soil moisture dynamics during the delay period reflect historical daily evaporation rates."
            )

        elif scenario_type == ScenarioType.IRRIGATION_INTERVENTION:
            start = contract.intervention_start_day if contract.intervention_start_day is not None else params.get("intervention_start_day", 5)
            freq = contract.intervention_frequency if contract.intervention_frequency is not None else params.get("intervention_frequency", 3)
            dur = contract.intervention_duration if contract.intervention_duration is not None else params.get("intervention_duration", 1)
            perturbations.append(f"Supplemental irrigation simulated starting day {start}, frequency every {freq} days, duration {dur} days.")
            meteorological_drivers.append("Synthetic moisture replenishment introduced during precipitation hiatus intervals.")
            assumptions.append("Adequate irrigation water delivery capacity is available at the field level.")

        elif scenario_type == ScenarioType.SEASONAL_ANOMALY:
            pct = contract.rainfall_anomaly_pct if contract.rainfall_anomaly_pct is not None else params.get("rainfall_anomaly_pct", -20.0)
            sign = "+" if pct > 0 else ""
            perturbations.append(f"Cumulative seasonal rainfall scaled by {sign}{pct:.1f}% across all event days.")
            meteorological_drivers.append(f"Monsoon broad-scale precipitation suppression/enhancement factor of {sign}{pct:.1f}%.")
            assumptions.append("Rainfall event temporal distribution shape remains identical to historical observations.")

        elif scenario_type == ScenarioType.RAINFALL_TIMING_SHIFT:
            shift = contract.shift_days if contract.shift_days is not None else params.get("shift_days", 7)
            sign = "+" if shift > 0 else ""
            perturbations.append(f"Rainfall event sequence shifted by {sign}{shift} days within active horizon.")
            meteorological_drivers.append(f"Chronological translation of precipitation pulses by {sign}{shift} days.")
            assumptions.append("Total cumulative rainfall across the complete seasonal cycle is strictly conserved.")

        elif scenario_type == ScenarioType.HEAVY_RAIN_CONCENTRATION:
            factor = contract.concentration_factor if contract.concentration_factor is not None else params.get("concentration_factor", 1.5)
            win = contract.window_days if contract.window_days is not None else params.get("window_days", 7)
            perturbations.append(f"Rainfall concentrated by {factor:.2f}x into a compressed {win}-day window.")
            meteorological_drivers.append("Episodic convective clustering increasing peak 24-hour rainfall intensity.")
            assumptions.append("Total precipitation within the window is conserved via reduction on surrounding days.")

        elif scenario_type == ScenarioType.COMBINED_SCENARIO:
            combined = contract.combined_types or params.get("combined_types", [])
            types_str = ", ".join([str(t) for t in combined])
            perturbations.append(f"Combined multi-dimensional perturbations: {types_str}.")
            meteorological_drivers.append("Compound atmospheric perturbations acting concurrently on soil moisture balance.")
            assumptions.append("Perturbation interaction effects are evaluated additively without nonlinear physical feedback.")

        # Legacy Phase 5A perturbations
        if contract.additional_dry_days > 0:
            perturbations.append(f"Additional dry hiatus of {contract.additional_dry_days} consecutive days.")
        if contract.rainfall_delta_mm != 0.0:
            sign = "+" if contract.rainfall_delta_mm > 0 else ""
            perturbations.append(f"Hypothetical rainfall adjustment of {sign}{contract.rainfall_delta_mm:.1f} mm.")

        # 3. Indicator shift summary
        shift_parts = []
        for d in deltas:
            direction_str = "increased" if d.absolute_delta > 0 else "decreased" if d.absolute_delta < 0 else "remained unchanged"
            shift_parts.append(
                f"{d.indicator_name.replace('_', ' ')} {direction_str} by {abs(d.absolute_delta):.1f} units "
                f"({d.baseline_category.value} -> {d.scenario_category.value})"
            )
        shift_summary = "; ".join(shift_parts) if shift_parts else "Indicators remained within baseline sensitivity envelope."

        # 4. Observed vs Simulated separation
        observed_vs_simulated = {
            "historical_baseline": "OBSERVED (Kharif 2024 Bakshi Ka Talab ground station record)",
            "scenario_inputs": "SIMULATED (Controlled hypothetical parameter adjustments)",
            "indicator_outputs": "DERIVED_INDICATOR (Deterministic agro-meteorological sensitivity indices)",
        }

        # 5. Non-causal phrasing enforcement
        non_causal_text = (
            "Under this scenario, altered precipitation timing and volume are statistically associated with "
            f"changed moisture availability for {contract.crop.value} at the {contract.crop_stage.value} stage. "
            "These indicators reflect sensitivity analysis rather than physical or agronomic guarantees."
        )

        return ScenarioExplanation(
            baseline_description=baseline_desc,
            perturbations_applied=perturbations,
            indicator_shift_summary=shift_summary,
            meteorological_drivers=meteorological_drivers,
            assumptions=assumptions,
            observed_vs_simulated=observed_vs_simulated,
            non_causal_statement=non_causal_text,
        )
