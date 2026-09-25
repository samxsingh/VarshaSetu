"""
VarshaSetu - Advanced What-If Scenario Simulator & Sensitivity Engine (Phase 5B)
Translates controlled meteorological and agro-climatic perturbations into
bounded sensitivity indicators, envelopes, and comparative delta analyses.
Strictly disclaims crop yield, biomass, and economic claims (SCENARIO_INDICATOR_ONLY).
"""

import uuid
import math
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone

from app.agronomy.schemas import (
    CropType,
    GrowthStage,
    ScenarioType,
    IndicatorSeverity,
    HazardApplicability,
    IndicatorDelta,
    ScenarioEnvelope,
    SensitivityPoint,
    SensitivityAnalysisResult,
    ScenarioProvenance,
    ScenarioExplanation,
    ScenarioContract,
    ScenarioComparison,
    ScenarioResult,
    ScenarioRegistryItem,
    SafetyGateStatus,
)
from app.agronomy.safety import AgronomicSafetyGate
from app.agronomy.simulator.provenance import ScenarioProvenanceEngine
from app.agronomy.simulator.explain import ScenarioExplanationEngine


class ScenarioSimulator:
    """
    Deterministic Scenario Engine & Sensitivity Analyzer.
    Provides decision support indicators without physical forecasting or yield modeling.
    """

    @classmethod
    def get_registry(cls) -> List[ScenarioRegistryItem]:
        """Returns the controlled catalog of supported scenario types and parameter bounds."""
        return [
            ScenarioRegistryItem(
                scenario_type=ScenarioType.SOWING_DELAY,
                display_name="Sowing Date Shift",
                description="Simulates the effect of delaying the calendar sowing window relative to the monsoon onset.",
                allowed_parameters={
                    "delay_days": {"type": "int", "min": 1, "max": 21, "default": 7, "unit": "days"}
                },
                evaluated_indicators=[
                    "moisture_stress_exposure",
                    "dry_spell_risk_days",
                    "heavy_rain_exposure_prob",
                    "effective_precipitation_mm",
                ],
                max_dimensions=1,
            ),
            ScenarioRegistryItem(
                scenario_type=ScenarioType.IRRIGATION_INTERVENTION,
                display_name="Supplemental Irrigation Intervention",
                description="Explores moisture stress alleviation under simulated supplemental irrigation schedules.",
                allowed_parameters={
                    "intervention_start_day": {"type": "int", "min": 1, "max": 30, "default": 5, "unit": "day_of_horizon"},
                    "intervention_frequency": {"type": "int", "min": 1, "max": 7, "default": 3, "unit": "days"},
                    "intervention_duration": {"type": "int", "min": 1, "max": 5, "default": 1, "unit": "days"},
                },
                evaluated_indicators=[
                    "moisture_stress_exposure",
                    "dry_spell_alleviation_pct",
                    "irrigation_dependency_index",
                ],
                max_dimensions=3,
            ),
            ScenarioRegistryItem(
                scenario_type=ScenarioType.SEASONAL_ANOMALY,
                display_name="Seasonal Rainfall Anomaly Perturbation",
                description="Evaluates agro-meteorological sensitivity under broad-scale precipitation surplus or deficit shifts.",
                allowed_parameters={
                    "rainfall_anomaly_pct": {"type": "float", "min": -60.0, "max": 60.0, "default": -20.0, "unit": "%"}
                },
                evaluated_indicators=[
                    "cumulative_rainfall_departure_pct",
                    "waterlogging_exposure",
                    "soil_saturation_index",
                    "deficit_stress_level",
                ],
                max_dimensions=1,
            ),
            ScenarioRegistryItem(
                scenario_type=ScenarioType.RAINFALL_TIMING_SHIFT,
                display_name="Rainfall Timing Translation",
                description="Shifts the chronological occurrence of precipitation pulses while conserving total seasonal volume.",
                allowed_parameters={
                    "shift_days": {"type": "int", "min": -14, "max": 14, "default": 7, "unit": "days"},
                    "rainfall_window": {"type": "int", "min": 3, "max": 30, "default": 7, "unit": "days"},
                },
                evaluated_indicators=[
                    "timing_sensitivity_index",
                    "critical_phase_moisture_exposure",
                    "dry_window_overlap_days",
                ],
                max_dimensions=2,
            ),
            ScenarioRegistryItem(
                scenario_type=ScenarioType.HEAVY_RAIN_CONCENTRATION,
                display_name="Heavy Rain Episodic Concentration",
                description="Compresses seasonal rainfall volume into high-intensity convective episodes without altering total volume.",
                allowed_parameters={
                    "concentration_factor": {"type": "float", "min": 1.0, "max": 2.5, "default": 1.5, "unit": "multiplier"},
                    "window_days": {"type": "int", "min": 3, "max": 14, "default": 7, "unit": "days"},
                },
                evaluated_indicators=[
                    "peak_daily_intensity_mm",
                    "waterlogging_risk_index",
                    "runoff_coefficient_indicator",
                ],
                max_dimensions=2,
            ),
            ScenarioRegistryItem(
                scenario_type=ScenarioType.COMBINED_SCENARIO,
                display_name="Multi-Variable Compound Scenario",
                description="Evaluates compound multi-hazard sensitivity by combining up to 3 compatible perturbation dimensions.",
                allowed_parameters={
                    "combined_types": {"type": "list", "max_items": 3, "allowed": ["SOWING_DELAY", "SEASONAL_ANOMALY", "RAINFALL_TIMING_SHIFT"]},
                    "delay_days": {"type": "int", "min": 1, "max": 21, "default": 7},
                    "rainfall_anomaly_pct": {"type": "float", "min": -60.0, "max": 60.0, "default": -20.0},
                },
                evaluated_indicators=[
                    "compound_risk_index",
                    "moisture_stress_exposure",
                    "waterlogging_risk_index",
                ],
                max_dimensions=3,
            ),
        ]

    @classmethod
    def _evaluate_applicability(cls, scenario_type: ScenarioType, crop: CropType, stage: GrowthStage) -> HazardApplicability:
        """Determines whether the scenario perturbation is agronomically relevant to context."""
        if crop == CropType.GENERAL or stage == GrowthStage.ALL:
            return HazardApplicability.APPLICABLE

        # Sowing delay is only relevant during pre-sowing, sowing, germination, vegetative
        if scenario_type == ScenarioType.SOWING_DELAY:
            if stage in [GrowthStage.MATURITY, GrowthStage.HARVEST]:
                return HazardApplicability.NOT_APPLICABLE

        return HazardApplicability.APPLICABLE

    @classmethod
    def _categorize_value(cls, val: float, thresholds: Tuple[float, float, float]) -> IndicatorSeverity:
        """Categorizes continuous indicator into LOW, MODERATE, HIGH, SEVERE."""
        low_t, mod_t, high_t = thresholds
        if val < low_t:
            return IndicatorSeverity.LOW
        elif val < mod_t:
            return IndicatorSeverity.MODERATE
        elif val < high_t:
            return IndicatorSeverity.HIGH
        else:
            return IndicatorSeverity.SEVERE

    @classmethod
    def _compute_deltas(
        cls,
        contract: ScenarioContract,
        baseline_metrics: Dict[str, float],
        simulated_metrics: Dict[str, float],
    ) -> List[IndicatorDelta]:
        """Calculates quantitative deltas and category shifts for each indicator."""
        deltas: List[IndicatorDelta] = []

        threshold_map = {
            "moisture_stress_pct": (25.0, 50.0, 75.0),
            "waterlogging_risk_pct": (20.0, 45.0, 70.0),
            "dry_spell_exposure_days": (3.0, 5.0, 8.0),
            "heavy_rain_prob": (0.25, 0.45, 0.70),
            "peak_daily_rain_mm": (35.5, 64.5, 115.5),
            "cumulative_rain_mm": (30.0, 60.0, 120.0),
        }

        for metric, base_val in baseline_metrics.items():
            if metric in simulated_metrics:
                sim_val = simulated_metrics[metric]
                abs_delta = round(sim_val - base_val, 2)
                rel_delta = round((abs_delta / base_val) * 100.0, 1) if base_val != 0 else None
                direction = "INCREASED" if abs_delta > 0.05 else "DECREASED" if abs_delta < -0.05 else "UNCHANGED"

                thresh = threshold_map.get(metric, (25.0, 50.0, 75.0))
                base_cat = cls._categorize_value(base_val, thresh)
                sim_cat = cls._categorize_value(sim_val, thresh)

                label = metric.replace("_", " ").title()
                if direction == "INCREASED":
                    interp = f"{label} shifted higher (+{abs_delta}) under this scenario ({base_cat.value} -> {sim_cat.value})."
                elif direction == "DECREASED":
                    interp = f"{label} shifted lower ({abs_delta}) under this scenario ({base_cat.value} -> {sim_cat.value})."
                else:
                    interp = f"{label} remained stable at baseline level ({sim_cat.value})."

                deltas.append(
                    IndicatorDelta(
                        indicator_name=metric,
                        baseline_value=round(base_val, 2),
                        scenario_value=round(sim_val, 2),
                        absolute_delta=abs_delta,
                        relative_delta_pct=rel_delta,
                        baseline_category=base_cat,
                        scenario_category=sim_cat,
                        direction=direction,
                        scientific_interpretation=interp,
                    )
                )

        return deltas

    @classmethod
    def _compute_simulated_values(
        cls,
        contract: ScenarioContract,
        baseline_metrics: Dict[str, float],
    ) -> Dict[str, float]:
        """Calculates simulated indicators based on scenario type and perturbation bounds."""
        sim = dict(baseline_metrics)
        stype = contract.scenario_type
        params = contract.parameters or {}

        if stype == ScenarioType.SOWING_DELAY:
            delay = contract.delay_days if contract.delay_days is not None else params.get("delay_days", 7)
            # Delaying sowing shifts moisture stress up as topsoil dries in hiatuses
            sim["moisture_stress_pct"] = min(95.0, baseline_metrics["moisture_stress_pct"] + (delay * 2.8))
            sim["dry_spell_exposure_days"] = min(15.0, baseline_metrics["dry_spell_exposure_days"] + (delay * 0.4))
            sim["waterlogging_risk_pct"] = max(5.0, baseline_metrics["waterlogging_risk_pct"] - (delay * 0.9))

        elif stype == ScenarioType.IRRIGATION_INTERVENTION:
            freq = contract.intervention_frequency if contract.intervention_frequency is not None else params.get("intervention_frequency", 3)
            # Supplemental watering alleviates moisture stress
            alleviation = (8 - freq) * 5.5
            sim["moisture_stress_pct"] = max(5.0, baseline_metrics["moisture_stress_pct"] - alleviation)
            sim["dry_spell_exposure_days"] = max(0.0, baseline_metrics["dry_spell_exposure_days"] - (alleviation / 8.0))

        elif stype == ScenarioType.SEASONAL_ANOMALY:
            pct = contract.rainfall_anomaly_pct if contract.rainfall_anomaly_pct is not None else params.get("rainfall_anomaly_pct", -20.0)
            multiplier = 1.0 + (pct / 100.0)
            sim["cumulative_rain_mm"] = max(0.0, baseline_metrics["cumulative_rain_mm"] * multiplier)
            if pct < 0:
                sim["moisture_stress_pct"] = min(95.0, baseline_metrics["moisture_stress_pct"] + abs(pct) * 0.75)
                sim["waterlogging_risk_pct"] = max(5.0, baseline_metrics["waterlogging_risk_pct"] - abs(pct) * 0.5)
            else:
                sim["moisture_stress_pct"] = max(5.0, baseline_metrics["moisture_stress_pct"] - pct * 0.4)
                sim["waterlogging_risk_pct"] = min(95.0, baseline_metrics["waterlogging_risk_pct"] + pct * 0.8)

        elif stype == ScenarioType.RAINFALL_TIMING_SHIFT:
            shift = contract.shift_days if contract.shift_days is not None else params.get("shift_days", 7)
            # Timing shift moves rainfall pulses; shifts dryness window
            sim["dry_spell_exposure_days"] = min(14.0, max(1.0, baseline_metrics["dry_spell_exposure_days"] + (abs(shift) * 0.35)))
            sim["moisture_stress_pct"] = min(90.0, max(10.0, baseline_metrics["moisture_stress_pct"] + (shift * 1.5)))

        elif stype == ScenarioType.HEAVY_RAIN_CONCENTRATION:
            conc = contract.concentration_factor if contract.concentration_factor is not None else params.get("concentration_factor", 1.5)
            sim["peak_daily_rain_mm"] = baseline_metrics["peak_daily_rain_mm"] * conc
            sim["waterlogging_risk_pct"] = min(95.0, baseline_metrics["waterlogging_risk_pct"] * conc)
            sim["heavy_rain_prob"] = min(0.95, baseline_metrics["heavy_rain_prob"] * conc)

        elif stype == ScenarioType.COMBINED_SCENARIO:
            delay = contract.delay_days if contract.delay_days is not None else params.get("delay_days", 5)
            pct = contract.rainfall_anomaly_pct if contract.rainfall_anomaly_pct is not None else params.get("rainfall_anomaly_pct", -15.0)
            sim["moisture_stress_pct"] = min(95.0, baseline_metrics["moisture_stress_pct"] + (delay * 2.2) + abs(pct) * 0.6)
            sim["cumulative_rain_mm"] = max(0.0, baseline_metrics["cumulative_rain_mm"] * (1.0 + pct / 100.0))

        # Legacy Phase 5A adjustments
        if contract.additional_dry_days > 0:
            sim["dry_spell_exposure_days"] = min(15.0, sim["dry_spell_exposure_days"] + contract.additional_dry_days)
            sim["moisture_stress_pct"] = min(95.0, sim["moisture_stress_pct"] + (contract.additional_dry_days * 3.5))
        if contract.rainfall_delta_mm != 0.0:
            sim["cumulative_rain_mm"] = max(0.0, sim["cumulative_rain_mm"] + contract.rainfall_delta_mm)
            if contract.rainfall_delta_mm > 0:
                sim["waterlogging_risk_pct"] = min(95.0, sim["waterlogging_risk_pct"] + (contract.rainfall_delta_mm * 0.4))
            else:
                sim["moisture_stress_pct"] = min(95.0, sim["moisture_stress_pct"] + abs(contract.rainfall_delta_mm) * 0.4)

        return sim

    @classmethod
    def simulate(cls, contract: ScenarioContract, baseline_forecast: Optional[Any] = None) -> ScenarioResult:
        """
        Executes a complete scenario simulation with safety gate validation,
        deterministic delta calculations, envelope modeling, and provenance hashing.
        """
        # Safety Gate Validation (Checks 14-21)
        status, blocked = AgronomicSafetyGate.evaluate_scenario(contract, baseline_forecast)
        if status == SafetyGateStatus.BLOCKED and blocked is not None:
            raise ValueError(f"Safety Gate Rejected Scenario [{blocked.reason_code}]: {blocked.message}")

        scenario_id = contract.scenario_id or f"sim_{contract.scenario_type.value.lower()}_{uuid.uuid4().hex[:8]}"
        base_fc_id = contract.base_forecast_id or "fc_kharif2024_anchor"

        # Baseline conditions derived from Bakshi Ka Talab Kharif 2024
        baseline_metrics = {
            "moisture_stress_pct": 32.0,
            "waterlogging_risk_pct": 24.0,
            "dry_spell_exposure_days": 4.0,
            "heavy_rain_prob": 0.35,
            "peak_daily_rain_mm": 52.0,
            "cumulative_rain_mm": 68.5,
        }

        # Override baseline from forecast payload if provided
        if baseline_forecast:
            if isinstance(baseline_forecast, dict):
                pred = baseline_forecast.get("prediction", {})
                if pred.get("predicted_value"):
                    baseline_metrics["cumulative_rain_mm"] = float(pred["predicted_value"])
                if pred.get("probability"):
                    baseline_metrics["heavy_rain_prob"] = float(pred["probability"])

        simulated_metrics = cls._compute_simulated_values(contract, baseline_metrics)
        applicability = cls._evaluate_applicability(contract.scenario_type, contract.crop, contract.crop_stage)
        deltas = cls._compute_deltas(contract, baseline_metrics, simulated_metrics)
        envelope = cls.get_envelope(contract, baseline_forecast)
        explanation = ScenarioExplanationEngine.generate_explanation(contract, deltas, simulated_metrics)
        provenance = ScenarioProvenanceEngine.compute_provenance(
            scenario_id=scenario_id,
            scenario_type=contract.scenario_type.value,
            base_forecast_id=base_fc_id,
            parameters=contract.parameters or contract.dict(include={
                "delay_days", "intervention_start_day", "intervention_frequency",
                "rainfall_anomaly_pct", "shift_days", "concentration_factor",
            }),
        )

        # Legacy risk indicators for Phase 5A test compatibility
        risk_indicators = []
        if (contract.additional_dry_days or 0) >= 5:
            risk_indicators.append({
                "hazard": "DRY_SPELL_SENSITIVITY",
                "severity": "HIGH",
                "indicator_text": f"Simulated +{contract.additional_dry_days} additional dry days elevates moisture deficit sensitivity.",
            })
        for d in deltas:
            h_name = d.indicator_name.upper() + "_SENSITIVITY"
            if d.indicator_name == "dry_spell_exposure_days":
                h_name = "DRY_SPELL_SENSITIVITY"
            if d.scenario_category in [IndicatorSeverity.HIGH, IndicatorSeverity.SEVERE]:
                if not any(r["hazard"] == h_name for r in risk_indicators):
                    risk_indicators.append({
                        "hazard": h_name,
                        "severity": d.scenario_category.value,
                        "indicator_text": d.scientific_interpretation,
                    })
        if not risk_indicators:
            risk_indicators.append({
                "hazard": "NORMAL_SENSITIVITY_RANGE",
                "severity": "INFO",
                "indicator_text": "Hypothetical adjustments remain within normal exploratory baseline bounds.",
            })

        result = ScenarioResult(
            scenario_id=scenario_id,
            scenario_type=contract.scenario_type,
            classification="SCENARIO_INDICATOR_ONLY",
            block_id=contract.block_id,
            crop=contract.crop.value,
            crop_stage=contract.crop_stage.value,
            applicability=applicability,
            inputs=contract.dict(),
            baseline_summary={k: round(v, 2) for k, v in baseline_metrics.items()},
            simulated_summary={k: round(v, 2) for k, v in simulated_metrics.items()},
            hypothetical_risk_indicators=risk_indicators,
            deltas=deltas,
            envelope=envelope,
            explanation=explanation,
            provenance=provenance,
            scientific_disclaimer=(
                "This scenario evaluates meteorological and agro-meteorological sensitivity indicators only. "
                "It does NOT predict crop yields, biomass production, revenue, or guaranteed agronomic outcomes."
            ),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

        # Immutable artifact save
        ScenarioProvenanceEngine.save_artifact(scenario_id, result.dict())
        return result

    @classmethod
    def compare(cls, contract: ScenarioContract, baseline_forecast: Optional[Any] = None) -> ScenarioComparison:
        """Generates a dedicated baseline vs scenario comparative report."""
        sim_res = cls.simulate(contract, baseline_forecast)
        return ScenarioComparison(
            scenario_id=sim_res.scenario_id,
            baseline_reference="Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)",
            scenario_type=contract.scenario_type,
            crop=contract.crop.value,
            crop_stage=contract.crop_stage.value,
            applicability=sim_res.applicability,
            deltas=sim_res.deltas,
            envelope=sim_res.envelope,
            explanation=sim_res.explanation,
            provenance=sim_res.provenance,
            scientific_disclaimer=sim_res.scientific_disclaimer,
        )

    @classmethod
    def sensitivity(cls, contract: ScenarioContract, baseline_forecast: Optional[Any] = None) -> SensitivityAnalysisResult:
        """
        Runs bounded deterministic parameter variations to compute indicator response curves
        without machine learning model fitting.
        """
        stype = contract.scenario_type
        param_name = "delay_days"
        param_range = [1.0, 21.0]
        test_values = [0.0, 3.0, 7.0, 10.0, 14.0, 21.0]

        if stype == ScenarioType.SOWING_DELAY:
            param_name = "delay_days"
            param_range = [1.0, 21.0]
            test_values = [0.0, 3.0, 7.0, 10.0, 14.0, 21.0]
        elif stype == ScenarioType.SEASONAL_ANOMALY:
            param_name = "rainfall_anomaly_pct"
            param_range = [-60.0, 60.0]
            test_values = [-60.0, -40.0, -20.0, 0.0, 20.0, 40.0, 60.0]
        elif stype == ScenarioType.RAINFALL_TIMING_SHIFT:
            param_name = "shift_days"
            param_range = [-14.0, 14.0]
            test_values = [-14.0, -7.0, -3.0, 0.0, 3.0, 7.0, 14.0]
        elif stype == ScenarioType.HEAVY_RAIN_CONCENTRATION:
            param_name = "concentration_factor"
            param_range = [1.0, 2.5]
            test_values = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5]
        elif stype == ScenarioType.IRRIGATION_INTERVENTION:
            param_name = "intervention_frequency"
            param_range = [1.0, 7.0]
            test_values = [1.0, 2.0, 3.0, 5.0, 7.0]

        points: List[SensitivityPoint] = []
        base_stress = 32.0

        for val in test_values:
            # Clone contract with iterated parameter
            sub_contract = contract.copy(deep=True)
            if stype == ScenarioType.SOWING_DELAY:
                sub_contract.delay_days = int(val) if val > 0 else 1
            elif stype == ScenarioType.SEASONAL_ANOMALY:
                sub_contract.rainfall_anomaly_pct = float(val)
            elif stype == ScenarioType.RAINFALL_TIMING_SHIFT:
                sub_contract.shift_days = int(val)
            elif stype == ScenarioType.HEAVY_RAIN_CONCENTRATION:
                sub_contract.concentration_factor = float(val)
            elif stype == ScenarioType.IRRIGATION_INTERVENTION:
                sub_contract.intervention_frequency = int(val)

            sim_vals = cls._compute_simulated_values(sub_contract, {
                "moisture_stress_pct": 32.0,
                "waterlogging_risk_pct": 24.0,
                "dry_spell_exposure_days": 4.0,
                "heavy_rain_prob": 0.35,
                "peak_daily_rain_mm": 52.0,
                "cumulative_rain_mm": 68.5,
            })

            categories = {
                k: cls._categorize_value(v, (25.0, 50.0, 75.0)) for k, v in sim_vals.items()
            }
            deltas = {k: round(v - 32.0, 2) for k, v in sim_vals.items()}

            points.append(
                SensitivityPoint(
                    parameter_value=val,
                    parameter_label=f"{param_name} = {val}",
                    indicator_values={k: round(v, 2) for k, v in sim_vals.items()},
                    indicator_categories=categories,
                    deltas=deltas,
                )
            )

        envelope = cls.get_envelope(contract, baseline_forecast)
        return SensitivityAnalysisResult(
            scenario_id=contract.scenario_id or f"sens_{uuid.uuid4().hex[:8]}",
            scenario_type=stype,
            parameter_name=param_name,
            parameter_range=param_range,
            curve_points=points,
            envelope=envelope,
            scientific_notes=[
                f"Evaluated {len(points)} bounded parameter steps across range [{param_range[0]}, {param_range[1]}].",
                "Response curve is purely deterministic; no machine learning or yield curve fitting is applied.",
            ],
        )

    @classmethod
    def get_envelope(cls, contract: ScenarioContract, baseline_forecast: Optional[Any] = None) -> ScenarioEnvelope:
        """Computes the bounded indicator envelope (min, max, baseline, median) for moisture stress."""
        base_val = 32.0
        # Envelope bounds based on scenario range
        if contract.scenario_type == ScenarioType.SOWING_DELAY:
            min_val = 32.0
            max_val = min_val + (21 * 2.8)  # ~90.8%
            median_val = min_val + (10 * 2.8)
        elif contract.scenario_type == ScenarioType.SEASONAL_ANOMALY:
            min_val = max(5.0, base_val - 24.0)
            max_val = min(95.0, base_val + 45.0)
            median_val = base_val
        elif contract.scenario_type == ScenarioType.IRRIGATION_INTERVENTION:
            min_val = max(5.0, base_val - 35.0)
            max_val = base_val
            median_val = base_val - 17.5
        else:
            min_val = 20.0
            max_val = 75.0
            median_val = 32.0

        thresh = (25.0, 50.0, 75.0)
        return ScenarioEnvelope(
            indicator_name="moisture_stress_pct",
            min_value=round(min_val, 1),
            max_value=round(max_val, 1),
            baseline_value=round(base_val, 1),
            median_value=round(median_val, 1),
            min_category=cls._categorize_value(min_val, thresh),
            max_category=cls._categorize_value(max_val, thresh),
            baseline_category=cls._categorize_value(base_val, thresh),
            median_category=cls._categorize_value(median_val, thresh),
            data_origin_labels={
                "observed": "OBSERVED (Kharif 2024 UP_LKO_BKT)",
                "baseline": "BASELINE (Reference meteorological sequence)",
                "scenario": "SCENARIO (Controlled perturbation)",
                "derived": "DERIVED_INDICATOR (Deterministic sensitivity index)",
            },
        )
