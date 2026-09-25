"""
VarshaSetu - Agronomic Safety Gate (Phase 5A)
Deterministic verification gatekeeper ensuring zero unvetted, ungrounded,
or invalid forecasts generate agronomic advisories.
"""

from typing import Tuple, Optional, Dict, Any
from app.agronomy.schemas import (
    AgronomicRule,
    CropType,
    GrowthStage,
    BlockedAdvisoryResponse,
    SafetyGateStatus,
)


class AgronomicSafetyGate:
    """Evaluates 13 mandatory safety checks prior to advisory generation."""

    @staticmethod
    def evaluate(
        forecast: Any,
        rule: AgronomicRule,
        crop: CropType,
        crop_stage: GrowthStage,
    ) -> Tuple[SafetyGateStatus, Optional[BlockedAdvisoryResponse]]:
        """
        Runs the 13 safety checks.
        Returns (SafetyGateStatus.PASSED, None) if all checks pass.
        Returns (SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse) if any check fails.
        """
        # 1. Forecast exists
        if forecast is None:
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="MISSING_FORECAST",
                message="Cannot generate advisory: forecast payload is null or missing.",
            )

        # Helper to extract properties from either dict or Pydantic model
        def get_prop(obj, path, default=None):
            curr = obj
            for part in path.split("."):
                if curr is None:
                    return default
                if isinstance(curr, dict):
                    curr = curr.get(part, default)
                else:
                    curr = getattr(curr, part, default)
            return curr

        # 2. Forecast is internally valid (has forecast_id and valid window)
        fc_id = get_prop(forecast, "forecast_id")
        valid_from = get_prop(forecast, "valid_from")
        valid_until = get_prop(forecast, "valid_until")
        if not fc_id or not valid_from or not valid_until:
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="INVALID_FORECAST_STRUCTURE",
                message=f"Forecast {fc_id or 'unknown'} lacks mandatory temporal validity bounds (valid_from/valid_until).",
            )

        # 3. Forecast has a valid horizon
        horizon_days = get_prop(forecast, "horizon.horizon_days")
        if horizon_days is None or horizon_days not in [1, 3, 7, 14, 21, 30]:
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="INVALID_HORIZON",
                message=f"Forecast horizon {horizon_days} is invalid or unsupported.",
            )

        # 4. Location is known
        block_id = get_prop(forecast, "location.block_id")
        if not block_id:
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="UNKNOWN_LOCATION",
                message="Forecast lacks a validated administrative block identifier.",
            )

        # 5. Spatial resolution is known
        resolution = get_prop(forecast, "location.spatial_resolution")
        if not resolution:
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="UNKNOWN_SPATIAL_RESOLUTION",
                message="Spatial resolution bounds are undefined in the forecast metadata.",
            )

        # 6. Data freshness is known
        freshness = get_prop(forecast, "data.freshness_status")
        if not freshness:
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="UNKNOWN_DATA_FRESHNESS",
                message="Input observational data freshness status is missing.",
            )

        # 7. Model status is known
        model_id = get_prop(forecast, "model.model_id")
        if not model_id:
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="UNKNOWN_MODEL_SOURCE",
                message="Generating model identity and lineage fingerprint are missing.",
            )

        # 8. Calibration status is known
        calib_status = get_prop(forecast, "calibration.status")
        if not calib_status:
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="UNKNOWN_CALIBRATION_STATUS",
                message="Probabilistic calibration verification status is absent.",
            )

        # 9. Validation status is known
        val_status = get_prop(forecast, "validation.validation_status")
        if not val_status:
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="UNKNOWN_VALIDATION_STATUS",
                message="Multi-year hindcast validation status is absent.",
            )

        # 10. Uncertainty is available where required (for point rainfall amount targets)
        target_type = get_prop(forecast, "target.target_type", "")
        if target_type == "RAINFALL_AMOUNT":
            unc_status = get_prop(forecast, "uncertainty.status")
            if unc_status != "CALCULATED":
                return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                    reason_code="UNCERTAINTY_UNAVAILABLE",
                    message="Continuous rainfall forecasts require calculated uncertainty intervals for advisory generation.",
                )

        # 11. Scientific disclosure is present
        disc_status = get_prop(forecast, "scientific_disclosure.status")
        if not disc_status:
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="MISSING_SCIENTIFIC_DISCLOSURE",
                message="Forecast record omits mandatory scientific disclosure metadata.",
            )

        # 12. Rule is applicable to crop/stage
        crop_match = (
            rule.applicable_crop == CropType.GENERAL
            or rule.applicable_crop == crop
            or (isinstance(rule.applicable_crop, str) and (rule.applicable_crop == "GENERAL" or rule.applicable_crop == crop.value))
        )
        stage_match = (
            crop_stage == GrowthStage.ALL
            or GrowthStage.ALL in rule.applicable_stages
            or crop_stage in rule.applicable_stages
        )
        if not (crop_match and stage_match):
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="RULE_INAPPLICABLE_TO_CONTEXT",
                message=f"Rule {rule.rule_id} is not applicable to crop {crop.value} at stage {crop_stage.value}.",
            )

        # 13. Required evidence exists
        prob = get_prop(forecast, "prediction.probability")
        point_val = get_prop(forecast, "prediction.predicted_value")
        if prob is None and point_val is None:
            return SafetyGateStatus.BLOCKED, BlockedAdvisoryResponse(
                reason_code="MISSING_PREDICTION_EVIDENCE",
                message="Forecast prediction contains neither probability nor predicted value metric.",
            )

        return SafetyGateStatus.PASSED, None
