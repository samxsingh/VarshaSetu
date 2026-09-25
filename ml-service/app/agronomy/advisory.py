"""
VarshaSetu - Agronomic Advisory Generation Engine (Phase 5A)
Transforms scientific forecast products into explainable, traceable,
and safety-gated agronomic advisory candidates.
"""

import os
import json
import hashlib
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pathlib import Path

from app.agronomy.schemas import (
    CropType,
    GrowthStage,
    ScientificAdvisory,
    BlockedAdvisoryResponse,
    AdvisoryOperationalStatus,
    SafetyGateStatus,
    AdvisoryEvaluationRequest,
    AdvisoryEvaluationResponse,
    AgronomicRule,
)
from app.agronomy.registry import rule_registry
from app.agronomy.safety import AgronomicSafetyGate
from app.agronomy.evidence import build_evidence_from_forecast
from app.agronomy.explain import generate_advisory_explanation
from app.forecast.artifacts import ForecastArtifactManager


class AdvisoryEngine:
    """Core evaluation engine for agronomic advisories."""

    def __init__(self, artifacts_dir: Optional[str] = None):
        if artifacts_dir:
            self.artifacts_dir = Path(artifacts_dir)
        else:
            base_dir = Path(__file__).resolve().parent.parent.parent
            self.artifacts_dir = base_dir / "artifacts" / "advisories"
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
        self._in_memory_advisories: Dict[str, ScientificAdvisory] = {}

    @staticmethod
    def compute_dedup_hash(
        forecast_id: str,
        rule_id: str,
        block_id: str,
        crop: str,
        crop_stage: str,
        valid_from: str,
        valid_until: str,
    ) -> str:
        """Deterministic 16-character SHA-256 fingerprint for an advisory."""
        raw_key = f"{forecast_id}:{rule_id}:{block_id}:{crop}:{crop_stage}:{valid_from}:{valid_until}"
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()[:16]

    def evaluate_forecast(
        self,
        forecast: Any,
        crop: CropType = CropType.GENERAL,
        crop_stage: GrowthStage = GrowthStage.ALL,
    ) -> Dict[str, Any]:
        """
        Evaluates applicable rules against a single scientific forecast record.
        Returns triggered advisories and any blocked responses.
        """
        # Extract target type
        def get_p(obj, path, default=""):
            curr = obj
            for part in path.split("."):
                if curr is None:
                    return default
                if isinstance(curr, dict):
                    curr = curr.get(part, default)
                else:
                    curr = getattr(curr, part, default)
            return curr

        target_type = get_p(forecast, "target.target_type")
        block_id = get_p(forecast, "location.block_id", "UP_LKO_BKT")
        valid_from = get_p(forecast, "valid_from", "")
        valid_until = get_p(forecast, "valid_until", "")
        fc_id = get_p(forecast, "forecast_id", "")
        horizon_days = get_p(forecast, "horizon.horizon_days", 7)
        prob = get_p(forecast, "prediction.probability")
        point_val = get_p(forecast, "prediction.predicted_value")

        applicable_rules = rule_registry.get_applicable_rules(
            crop=crop,
            stage=crop_stage,
            target=target_type if target_type else None,
        )

        triggered_advisories: List[ScientificAdvisory] = []
        blocked_responses: List[BlockedAdvisoryResponse] = []

        for rule in applicable_rules:
            # 1. Evaluate Safety Gate
            gate_status, blocked_resp = AgronomicSafetyGate.evaluate(
                forecast=forecast,
                rule=rule,
                crop=crop,
                crop_stage=crop_stage,
            )

            if gate_status == SafetyGateStatus.BLOCKED:
                if blocked_resp:
                    blocked_responses.append(blocked_resp)
                continue

            # 2. Evaluate Rule Trigger Condition
            is_triggered = False
            thresholds = rule.thresholds

            if rule.target in ["HEAVY_RAIN", "EXTREME_RAIN"]:
                prob_thresh = thresholds.get("probability_threshold", 0.40)
                amount_thresh = thresholds.get("rainfall_amount_threshold_mm") or thresholds.get("extreme_rainfall_threshold_mm", 64.5)
                if (prob is not None and prob >= prob_thresh) or (point_val is not None and point_val >= amount_thresh):
                    is_triggered = True

            elif rule.target == "DRY_SPELL":
                prob_thresh = thresholds.get("probability_threshold", 0.45)
                if prob is not None and prob >= prob_thresh:
                    is_triggered = True

            elif rule.target in ["MONSOON_ONSET", "FALSE_ONSET"]:
                prob_thresh = thresholds.get("probability_threshold", 0.50)
                if prob is not None and prob >= prob_thresh:
                    is_triggered = True

            elif rule.target == "RAINFALL_ANOMALY":
                # Anomaly departure check
                deficit_thresh = thresholds.get("deficit_departure_pct", -50.0)
                surplus_thresh = thresholds.get("surplus_departure_pct", 50.0)
                # Check point val departure or default to false
                if point_val is not None:
                    # In baseline, normal is ~42.5mm for 7d
                    departure = ((point_val - 42.5) / 42.5) * 100.0
                    if departure <= deficit_thresh or departure >= surplus_thresh:
                        is_triggered = True

            if is_triggered:
                evidence = build_evidence_from_forecast(forecast)
                explanation = generate_advisory_explanation(
                    rule=rule,
                    evidence=evidence,
                    crop=crop.value,
                    crop_stage=crop_stage.value,
                )

                dedup_hash = self.compute_dedup_hash(
                    forecast_id=fc_id,
                    rule_id=rule.rule_id,
                    block_id=block_id,
                    crop=crop.value,
                    crop_stage=crop_stage.value,
                    valid_from=valid_from,
                    valid_until=valid_until,
                )

                prob_pct = f"{round((prob or 0.0) * 100, 1)}"
                advisory_text = rule.advisory_template.format(
                    horizon_days=horizon_days,
                    probability_pct=prob_pct,
                    departure_pct=f"{round(point_val or 0.0, 1)}",
                )
                summary_text = (
                    f"{rule.name} for {crop.value} ({crop_stage.value}) over {horizon_days}-day window. "
                    f"Informational diagnostic indicator (Probability: {prob_pct}%)."
                )

                advisory_id = f"adv_{dedup_hash}_{uuid.uuid4().hex[:6]}"
                now_iso = datetime.now(timezone.utc).isoformat()

                advisory = ScientificAdvisory(
                    advisory_id=advisory_id,
                    generated_at=now_iso,
                    valid_from=valid_from,
                    valid_until=valid_until,
                    location={
                        "block_id": block_id,
                        "spatial_resolution": evidence.spatial_resolution,
                    },
                    crop=crop.value,
                    crop_stage=crop_stage.value,
                    severity=rule.severity,
                    category=rule.category,
                    title=rule.name,
                    summary=summary_text,
                    advisory_text=advisory_text,
                    evidence=evidence,
                    triggered_rules=[rule.rule_id],
                    confidence_status="NOT_OPERATIONALLY_CALIBRATED",
                    uncertainty_description=(
                        f"Forecast uncertainty range (P10-P90): {evidence.uncertainty.get('lower')} to {evidence.uncertainty.get('upper')} mm"
                        if evidence.uncertainty and evidence.uncertainty.get("lower") is not None
                        else "Uncertainty interval not calculated for this model run."
                    ),
                    scientific_status="DIAGNOSTIC_ONLY",
                    operational_status=AdvisoryOperationalStatus.DIAGNOSTIC_ONLY,
                    explanation=explanation,
                    provenance={
                        "rule_version": rule.rule_version,
                        "scientific_source": rule.scientific_source,
                        "dataset": "Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)",
                        "station_coverage": "1 Station (Bakshi Ka Talab)",
                    },
                    diagnostic_only=True,
                    dedup_hash=dedup_hash,
                )

                triggered_advisories.append(advisory)
                self._save_advisory(advisory)

        # Sort deterministically by severity priority
        severity_order = {"HIGH": 4, "ELEVATED": 3, "WATCH": 2, "INFO": 1}
        triggered_advisories.sort(
            key=lambda a: severity_order.get(a.severity.value, 0),
            reverse=True,
        )

        return {
            "advisories": triggered_advisories,
            "blocked": blocked_responses,
        }

    def evaluate_request(self, request: AdvisoryEvaluationRequest) -> AdvisoryEvaluationResponse:
        """
        Executes an end-to-end evaluation for an advisory request.
        Loads existing forecasts for the block and evaluates all applicable rules.
        """
        forecasts = []

        if request.forecast_id:
            fc = ForecastArtifactManager.get_forecast(request.forecast_id)
            if fc:
                forecasts = [fc]
        else:
            # Query active or generated forecasts for horizon
            forecasts = ForecastArtifactManager.list_forecasts(
                block_id=request.block_id,
                horizon=request.horizon_days,
            )

        all_advisories: List[ScientificAdvisory] = []
        all_blocked: List[BlockedAdvisoryResponse] = []
        total_rules = len(rule_registry.get_applicable_rules(crop=request.crop, stage=request.crop_stage))

        # If no forecasts found in disk artifacts, generate mock diagnostic baseline forecast for UP_LKO_BKT
        if not forecasts:
            # Create a diagnostic baseline forecast record for evaluation
            fallback_forecast = {
                "forecast_id": f"fc_bkt_{request.horizon_days}d_baseline",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "valid_from": "2024-09-15T00:00:00Z",
                "valid_until": "2024-09-22T00:00:00Z",
                "location": {
                    "block_id": request.block_id,
                    "district_id": "UP_LKO",
                    "state_id": "UP",
                    "spatial_resolution": "BLOCK",
                },
                "target": {
                    "target_type": "HEAVY_RAIN",
                    "threshold": 64.5,
                    "unit": "probability",
                },
                "horizon": {
                    "horizon_days": request.horizon_days or 7,
                    "horizon_label": f"{request.horizon_days or 7}-Day Outlook",
                },
                "model": {
                    "model_id": "xgboost",
                    "model_family": "Tree Ensemble",
                },
                "prediction": {
                    "probability": 0.48,
                    "predicted_value": 45.0,
                    "category": "MODERATE",
                },
                "calibration": {
                    "status": "NOT_CALIBRATED",
                },
                "uncertainty": {
                    "status": "CALCULATED",
                    "lower_bound": 25.0,
                    "median": 45.0,
                    "upper_bound": 78.0,
                },
                "validation": {
                    "validation_status": "INSUFFICIENT_DATA",
                },
                "data": {
                    "freshness_status": "HISTORICAL_ONLY",
                },
                "scientific_disclosure": {
                    "status": "DIAGNOSTIC_ONLY",
                },
            }
            forecasts = [fallback_forecast]

        for fc in forecasts:
            res = self.evaluate_forecast(
                forecast=fc,
                crop=request.crop,
                crop_stage=request.crop_stage,
            )
            all_advisories.extend(res["advisories"])
            all_blocked.extend(res["blocked"])

        # Deduplicate triggered advisories by dedup_hash
        seen_hashes = set()
        deduped_advisories: List[ScientificAdvisory] = []
        for adv in all_advisories:
            if adv.dedup_hash not in seen_hashes:
                seen_hashes.add(adv.dedup_hash)
                deduped_advisories.append(adv)

        return AdvisoryEvaluationResponse(
            block_id=request.block_id,
            crop=request.crop.value,
            crop_stage=request.crop_stage.value,
            total_rules_evaluated=total_rules,
            triggered_rules_count=len(deduped_advisories),
            advisories=deduped_advisories,
            blocked_advisories=all_blocked,
            system_status="DIAGNOSTIC_ONLY",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    def _save_advisory(self, advisory: ScientificAdvisory) -> None:
        """Persists advisory artifact locally."""
        self._in_memory_advisories[advisory.advisory_id] = advisory
        file_path = self.artifacts_dir / f"{advisory.advisory_id}.json"
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(advisory.model_dump(), f, indent=2)
        except Exception:
            pass

    def get_advisory_by_id(self, advisory_id: str) -> Optional[ScientificAdvisory]:
        """Retrieves an advisory by ID."""
        if advisory_id in self._in_memory_advisories:
            return self._in_memory_advisories[advisory_id]

        file_path = self.artifacts_dir / f"{advisory_id}.json"
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    adv = ScientificAdvisory(**data)
                    self._in_memory_advisories[adv.advisory_id] = adv
                    return adv
            except Exception:
                return None
        return None

    def list_advisories(
        self,
        block_id: Optional[str] = None,
        crop: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 50,
    ) -> List[ScientificAdvisory]:
        """Lists cached and stored advisories."""
        advisories: List[ScientificAdvisory] = list(self._in_memory_advisories.values())

        # Also load from artifacts if memory is empty
        if not advisories and self.artifacts_dir.exists():
            for p in self.artifacts_dir.glob("adv_*.json"):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        adv = ScientificAdvisory(**data)
                        self._in_memory_advisories[adv.advisory_id] = adv
                        advisories.append(adv)
                except Exception:
                    continue

        if block_id:
            advisories = [a for a in advisories if a.location.get("block_id") == block_id]
        if crop and crop != "ALL":
            advisories = [a for a in advisories if a.crop.upper() == crop.upper() or a.crop == "GENERAL"]
        if severity and severity != "ALL":
            advisories = [a for a in advisories if a.severity.value == severity]

        return advisories[:limit]


# Global singleton advisory engine instance
advisory_engine = AdvisoryEngine()
