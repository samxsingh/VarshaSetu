"""
VarshaSetu - Event Engine Tests (Phase 4F)
Verifies meteorological risk detection, Phase 4A threshold adherence,
and DIAGNOSTIC_ONLY operational safety gating.
"""

from app.schemas.forecast import (
    ScientificForecastRecord,
    LocationContext,
    TargetContext,
    HorizonContext,
    ModelContext,
    PredictionContext,
    CalibrationContext,
    UncertaintyContext,
    ValidationContext,
    ExplainabilityContext,
    DataContext,
    ScientificDisclosureContext,
)
from app.schemas.events import EventType, EventSeverity, EventState
from app.events.detector import EventDetector
from app.events.manager import EventManager


def create_sample_forecast(target_type: str, prob: float, threshold: float = 64.5) -> ScientificForecastRecord:
    return ScientificForecastRecord(
        forecast_id=f"fc_test_{target_type.lower()}",
        generated_at="2026-09-25T12:00:00Z",
        valid_from="2024-09-15",
        valid_until="2024-09-21",
        location=LocationContext(
            state_id="UP",
            district_id="UP_LKO",
            block_id="UP_LKO_BKT",
            latitude=26.9749,
            longitude=80.9276,
            spatial_resolution="BLOCK",
        ),
        target=TargetContext(
            target_type=target_type,
            target_definition_version="v1.0-imd-kharif",
            threshold=threshold,
            unit="probability",
        ),
        horizon=HorizonContext(
            horizon_days=7,
            horizon_label="7-Day Medium-Range",
        ),
        model=ModelContext(
            model_id="xgboost",
            model_family="Gradient Boosted Decision Trees",
            model_version="1.0.0",
            training_period="2024-06-01 to 2024-07-31",
            dataset_fingerprint="3fec50c2ef89dbfc",
        ),
        prediction=PredictionContext(
            probability=prob,
            category="HIGH",
        ),
        calibration=CalibrationContext(
            status="CALIBRATED",
            calibrator_type="ISOTONIC",
        ),
        uncertainty=UncertaintyContext(
            status="CALCULATED",
            lower_bound=max(0.0, prob - 0.08),
            median=prob,
            upper_bound=min(1.0, prob + 0.08),
            method="BOOTSTRAP",
        ),
        validation=ValidationContext(
            validation_status="INSUFFICIENT_DATA",
            validation_years=[2024],
        ),
        explainability=ExplainabilityContext(
            status="EXPLAINED",
            top_features=[],
            shap_artifact_id="shap_art_test",
        ),
        data=DataContext(
            source_status="IMD_ERA5_INGESTED",
            freshness_status="HISTORICAL_ONLY",
            missingness=0.0,
            feature_coverage="19/19 complete",
        ),
        scientific_disclosure=ScientificDisclosureContext(
            status="DIAGNOSTIC_ONLY",
            messages=["Diagnostic forecast for block UP_LKO_BKT."],
        ),
    )


def test_heavy_rain_event_detection_and_gating():
    """Tests heavy rain risk detection with high probability."""
    fc = create_sample_forecast(target_type="HEAVY_RAIN", prob=0.78, threshold=64.5)
    events = EventDetector.evaluate_forecast(fc)

    assert len(events) == 1
    ev = events[0]
    assert ev.event_type == EventType.HEAVY_RAIN_RISK
    assert ev.severity == EventSeverity.WARNING
    assert ev.threshold == 64.5
    # Strict safety gate verification
    assert ev.operational_status == "DIAGNOSTIC_ONLY"
    assert ev.data_freshness == "HISTORICAL_ONLY"
    assert "diagnostic" in ev.description.lower()


def test_dry_spell_event_detection():
    """Tests dry spell risk detection with moderate probability."""
    fc = create_sample_forecast(target_type="DRY_SPELL", prob=0.55, threshold=5.0)
    events = EventDetector.evaluate_forecast(fc)

    assert len(events) == 1
    ev = events[0]
    assert ev.event_type == EventType.DRY_SPELL_RISK
    assert ev.severity == EventSeverity.WATCH
    assert ev.threshold == 5.0
    assert ev.operational_status == "DIAGNOSTIC_ONLY"


def test_event_manager_acknowledgement_and_resolution(tmp_path, monkeypatch):
    """Tests state transitions from DETECTED -> ACKNOWLEDGED -> RESOLVED."""
    monkeypatch.setattr(EventManager, "DEFAULT_STORAGE_DIR", tmp_path)

    fc = create_sample_forecast(target_type="HEAVY_RAIN", prob=0.65)
    res = EventManager.detect_events([fc])
    assert len(res.detected_events) == 1
    ev_id = res.detected_events[0].event_id

    # Acknowledge
    ack = EventManager.transition_event(
        event_id=ev_id,
        target_state=EventState.ACKNOWLEDGED,
        reason="Duty officer acknowledged warning",
        actor="OFFICER_LKO",
    )
    assert ack.state == EventState.ACKNOWLEDGED
    assert ack.acknowledged_by == "OFFICER_LKO"

    # Resolve
    res_ev = EventManager.transition_event(
        event_id=ev_id,
        target_state=EventState.RESOLVED,
        reason="Forecast period elapsed safely",
        actor="SYSTEM",
    )
    assert res_ev.state == EventState.RESOLVED
    assert res_ev.resolved_by == "SYSTEM"

    # Verify history
    history = EventManager.get_event_history(ev_id)
    assert len(history) >= 3
