"""
VarshaSetu - Non-Causal Agronomic Explainability Generator (Phase 5A)
Generates transparent, non-causal explanations detailing why an advisory was triggered.
Strictly prohibits causal assertions ("caused the rainfall") in favor of
statistical model-associated signals.
"""

from typing import Dict, Any, List, Optional
from app.agronomy.schemas import AgronomicRule, AdvisoryEvidence


def generate_advisory_explanation(
    rule: AgronomicRule,
    evidence: AdvisoryEvidence,
    crop: str,
    crop_stage: str,
) -> Dict[str, Any]:
    """
    Synthesizes a structured explanation for an advisory candidate.
    Distinguishes statistical model signals from causal agronomic drivers.
    """
    why_items: List[str] = [
        f"Meteorological forecast probability or value met the threshold criteria for rule {rule.rule_id}.",
        f"Forecast lead horizon: {evidence.horizon_days} days.",
        f"Spatial granularity: {evidence.spatial_resolution} centroid.",
        f"Observational record freshness: {evidence.data_freshness}.",
        f"Hindcast validation state: {evidence.validation_status} (single-season record).",
        "Operational status: DIAGNOSTIC_ONLY (operational agricultural broadcasting inactive).",
    ]

    what_triggered = {
        "rule_id": rule.rule_id,
        "rule_name": rule.name,
        "description": rule.description,
        "target": rule.target,
        "thresholds": rule.thresholds,
        "crop_context": f"{crop} ({crop_stage})",
        "scientific_source": rule.scientific_source,
    }

    supporting_evidence: Dict[str, Any] = {
        "model_id": evidence.source,
        "forecast_id": evidence.forecast_id,
        "target_type": evidence.target,
        "horizon_days": evidence.horizon_days,
        "forecast_probability": evidence.probability,
        "point_estimate_mm": evidence.point_estimate,
        "uncertainty_range": evidence.uncertainty,
    }

    # Format model signals / SHAP contributions with non-causal language
    model_signals: List[Dict[str, Any]] = []
    if evidence.features_summary:
        for feat in evidence.features_summary[:3]:
            feat_name = feat.get("feature", "unknown_feature")
            shap_val = feat.get("shap_value", 0.0)
            desc = feat.get("description", f"Statistical correlation identified with {feat_name}")
            model_signals.append({
                "signal_name": feat_name,
                "statistical_direction": "elevates_predicted_risk" if shap_val > 0 else "suppresses_predicted_risk",
                "non_causal_description": (
                    f"Model-associated signal: {desc}. "
                    "Note: Indicates statistical correlation with historical patterns, not causal meteorological determinism."
                ),
            })
    supporting_evidence["model_associated_signals"] = model_signals

    return {
        "why_this_advisory_exists": why_items,
        "what_triggered_it": what_triggered,
        "supporting_evidence": supporting_evidence,
        "transparency_note": (
            "This advisory is deterministically generated from scientific forecast outputs. "
            "It conveys informational risk and excludes imperative agronomic mandates."
        ),
    }
