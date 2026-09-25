"""
VarshaSetu - Scientific Event Detector (Phase 4F)
Evaluates scientific forecast outputs against meteorological target definitions.
Enforces non-causal descriptions, operational safety gating, and strict separation
from agronomic recommendations.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from ..schemas.forecast import ScientificForecastRecord
from ..schemas.events import (
    EventType,
    EventSeverity,
    EventState,
    ScientificEventRecord,
)
from .deduplication import compute_event_dedup_hash


class EventDetector:
    """
    Detects meteorological risk events directly from calibrated scientific forecasts.
    """

    @classmethod
    def evaluate_forecast(
        cls,
        forecast: ScientificForecastRecord,
        detected_at: Optional[str] = None
    ) -> List[ScientificEventRecord]:
        """
        Evaluates a single forecast record and returns any qualifying events.
        """
        now_str = detected_at or datetime.now(timezone.utc).isoformat()
        events: List[ScientificEventRecord] = []

        prob = forecast.prediction.probability
        target_type = forecast.target.target_type
        horizon_days = forecast.horizon.horizon_days
        block_id = forecast.location.block_id

        # Operational status strictly inherits from Phase 4E forecast gate
        operational_status = forecast.scientific_disclosure.status
        data_freshness = forecast.data.freshness_status
        validation_status = forecast.validation.validation_status

        # ------------------------------------------------------------------
        # 1. HEAVY_RAIN / EXTREME_RAIN
        # ------------------------------------------------------------------
        if target_type == "HEAVY_RAIN" and prob is not None:
            # IMD Heavy Rain is >= 64.5 mm / 24h
            if prob >= 0.30:
                severity = EventSeverity.INFO
                if prob >= 0.75:
                    severity = EventSeverity.WARNING
                elif prob >= 0.50:
                    severity = EventSeverity.WATCH

                ev_type = EventType.HEAVY_RAIN_RISK
                threshold_val = forecast.target.threshold or 64.5

                # Check if this qualifies as extreme rain risk (e.g. >= 204.5mm or very high prob)
                if prob >= 0.85:
                    ev_type = EventType.EXTREME_RAIN_RISK
                    severity = EventSeverity.CRITICAL

                dedup_hash = compute_event_dedup_hash(
                    block_id=block_id,
                    event_type=ev_type,
                    target_type=target_type,
                    horizon_days=horizon_days,
                    threshold=threshold_val,
                    valid_from=forecast.valid_from,
                    valid_until=forecast.valid_until,
                )

                desc = (
                    f"Diagnostic scientific detection: {prob*100:.1f}% probability of 24-hour rainfall "
                    f"exceeding {threshold_val} mm over the {forecast.horizon.horizon_label}. "
                    f"Non-operational diagnostic guidance based on {data_freshness} observation data."
                )

                events.append(
                    ScientificEventRecord(
                        event_type=ev_type,
                        forecast_id=forecast.forecast_id,
                        block_id=block_id,
                        detected_at=now_str,
                        valid_from=forecast.valid_from,
                        valid_until=forecast.valid_until,
                        probability=prob,
                        threshold=threshold_val,
                        unit="mm",
                        severity=severity,
                        confidence_status=forecast.calibration.status,
                        operational_status=operational_status,
                        data_freshness=data_freshness,
                        validation_status=validation_status,
                        explanation_reference=forecast.explainability.shap_artifact_id or f"exp_{forecast.forecast_id}",
                        state=EventState.DETECTED,
                        description=desc,
                        deduplication_hash=dedup_hash,
                        metadata={
                            "model_id": forecast.model.model_id,
                            "dataset_fingerprint": forecast.model.dataset_fingerprint,
                            "uncertainty_interval": [
                                forecast.uncertainty.lower_bound,
                                forecast.uncertainty.upper_bound,
                            ],
                        },
                    )
                )

        # ------------------------------------------------------------------
        # 2. DRY_SPELL
        # ------------------------------------------------------------------
        elif target_type == "DRY_SPELL" and prob is not None:
            # Prolonged dry spell: >= 5 consecutive dry days
            if prob >= 0.35:
                severity = EventSeverity.INFO
                if prob >= 0.70:
                    severity = EventSeverity.WARNING
                elif prob >= 0.50:
                    severity = EventSeverity.WATCH

                ev_type = EventType.DRY_SPELL_RISK
                threshold_val = forecast.target.threshold or 5.0

                dedup_hash = compute_event_dedup_hash(
                    block_id=block_id,
                    event_type=ev_type,
                    target_type=target_type,
                    horizon_days=horizon_days,
                    threshold=threshold_val,
                    valid_from=forecast.valid_from,
                    valid_until=forecast.valid_until,
                )

                desc = (
                    f"Diagnostic scientific detection: {prob*100:.1f}% probability of dry spell "
                    f"(≥{threshold_val:.0f} consecutive dry days) across the {forecast.horizon.horizon_label}. "
                    f"Data is {data_freshness}; diagnostic evaluation only."
                )

                events.append(
                    ScientificEventRecord(
                        event_type=ev_type,
                        forecast_id=forecast.forecast_id,
                        block_id=block_id,
                        detected_at=now_str,
                        valid_from=forecast.valid_from,
                        valid_until=forecast.valid_until,
                        probability=prob,
                        threshold=threshold_val,
                        unit="days",
                        severity=severity,
                        confidence_status=forecast.calibration.status,
                        operational_status=operational_status,
                        data_freshness=data_freshness,
                        validation_status=validation_status,
                        explanation_reference=forecast.explainability.shap_artifact_id or f"exp_{forecast.forecast_id}",
                        state=EventState.DETECTED,
                        description=desc,
                        deduplication_hash=dedup_hash,
                        metadata={
                            "model_id": forecast.model.model_id,
                            "dataset_fingerprint": forecast.model.dataset_fingerprint,
                        },
                    )
                )

        # ------------------------------------------------------------------
        # 3. MONSOON_ONSET
        # ------------------------------------------------------------------
        elif target_type == "MONSOON_ONSET" and prob is not None:
            if prob >= 0.40:
                severity = EventSeverity.WATCH if prob >= 0.60 else EventSeverity.INFO
                ev_type = EventType.MONSOON_ONSET_RISK
                threshold_val = 1.0

                dedup_hash = compute_event_dedup_hash(
                    block_id=block_id,
                    event_type=ev_type,
                    target_type=target_type,
                    horizon_days=horizon_days,
                    threshold=threshold_val,
                    valid_from=forecast.valid_from,
                    valid_until=forecast.valid_until,
                )

                desc = (
                    f"Diagnostic scientific detection: {prob*100:.1f}% probability of monsoon onset surge "
                    f"satisfying synoptic transition criteria over {forecast.horizon.horizon_label}."
                )

                events.append(
                    ScientificEventRecord(
                        event_type=ev_type,
                        forecast_id=forecast.forecast_id,
                        block_id=block_id,
                        detected_at=now_str,
                        valid_from=forecast.valid_from,
                        valid_until=forecast.valid_until,
                        probability=prob,
                        threshold=threshold_val,
                        unit="transition",
                        severity=severity,
                        confidence_status=forecast.calibration.status,
                        operational_status=operational_status,
                        data_freshness=data_freshness,
                        validation_status=validation_status,
                        explanation_reference=forecast.explainability.shap_artifact_id or f"exp_{forecast.forecast_id}",
                        state=EventState.DETECTED,
                        description=desc,
                        deduplication_hash=dedup_hash,
                        metadata={"model_id": forecast.model.model_id},
                    )
                )

        # ------------------------------------------------------------------
        # 4. FALSE_ONSET
        # ------------------------------------------------------------------
        elif target_type == "FALSE_ONSET" and prob is not None:
            if prob >= 0.35:
                severity = EventSeverity.WARNING if prob >= 0.60 else EventSeverity.WATCH
                ev_type = EventType.FALSE_ONSET_RISK
                threshold_val = 1.0

                dedup_hash = compute_event_dedup_hash(
                    block_id=block_id,
                    event_type=ev_type,
                    target_type=target_type,
                    horizon_days=horizon_days,
                    threshold=threshold_val,
                    valid_from=forecast.valid_from,
                    valid_until=forecast.valid_until,
                )

                desc = (
                    f"Diagnostic scientific detection: {prob*100:.1f}% probability of false onset "
                    f"(precipitation surge followed by multi-week break period)."
                )

                events.append(
                    ScientificEventRecord(
                        event_type=ev_type,
                        forecast_id=forecast.forecast_id,
                        block_id=block_id,
                        detected_at=now_str,
                        valid_from=forecast.valid_from,
                        valid_until=forecast.valid_until,
                        probability=prob,
                        threshold=threshold_val,
                        unit="risk",
                        severity=severity,
                        confidence_status=forecast.calibration.status,
                        operational_status=operational_status,
                        data_freshness=data_freshness,
                        validation_status=validation_status,
                        explanation_reference=forecast.explainability.shap_artifact_id or f"exp_{forecast.forecast_id}",
                        state=EventState.DETECTED,
                        description=desc,
                        deduplication_hash=dedup_hash,
                        metadata={"model_id": forecast.model.model_id},
                    )
                )

        # ------------------------------------------------------------------
        # 5. RAINFALL_ANOMALY
        # ------------------------------------------------------------------
        elif target_type == "RAINFALL_ANOMALY":
            val = forecast.prediction.predicted_value
            if val is not None and abs(val) >= 20.0:  # Departure >= 20mm
                severity = EventSeverity.WATCH if abs(val) >= 50.0 else EventSeverity.INFO
                ev_type = EventType.RAINFALL_ANOMALY
                threshold_val = 20.0

                dedup_hash = compute_event_dedup_hash(
                    block_id=block_id,
                    event_type=ev_type,
                    target_type=target_type,
                    horizon_days=horizon_days,
                    threshold=threshold_val,
                    valid_from=forecast.valid_from,
                    valid_until=forecast.valid_until,
                )

                desc = (
                    f"Diagnostic scientific detection: Expected precipitation departure of {val:+.1f} mm "
                    f"relative to seasonal climatology over {forecast.horizon.horizon_label}."
                )

                events.append(
                    ScientificEventRecord(
                        event_type=ev_type,
                        forecast_id=forecast.forecast_id,
                        block_id=block_id,
                        detected_at=now_str,
                        valid_from=forecast.valid_from,
                        valid_until=forecast.valid_until,
                        probability=prob if prob is not None else 0.5,
                        threshold=threshold_val,
                        unit="mm",
                        severity=severity,
                        confidence_status=forecast.calibration.status,
                        operational_status=operational_status,
                        data_freshness=data_freshness,
                        validation_status=validation_status,
                        explanation_reference=forecast.explainability.shap_artifact_id or f"exp_{forecast.forecast_id}",
                        state=EventState.DETECTED,
                        description=desc,
                        deduplication_hash=dedup_hash,
                        metadata={"predicted_departure": val},
                    )
                )

        return events
