"""
VarshaSetu - Forecast Lifecycle Unit Tests (Phase 4F)
Verifies deterministic state transitions, prohibited transition rejections,
and lifecycle audit trails.
"""

import pytest
from app.schemas.lifecycle import ForecastLifecycleState
from app.lifecycle.state_machine import ForecastStateMachine, InvalidLifecycleTransitionError
from app.lifecycle.manager import ForecastLifecycleManager


def test_forecast_state_machine_valid_transitions():
    """Verifies permissible lifecycle transitions."""
    assert ForecastStateMachine.can_transition(ForecastLifecycleState.GENERATED, ForecastLifecycleState.ACTIVE)
    assert ForecastStateMachine.can_transition(ForecastLifecycleState.ACTIVE, ForecastLifecycleState.EXPIRING)
    assert ForecastStateMachine.can_transition(ForecastLifecycleState.ACTIVE, ForecastLifecycleState.EXPIRED)
    assert ForecastStateMachine.can_transition(ForecastLifecycleState.EXPIRING, ForecastLifecycleState.EXPIRED)
    assert ForecastStateMachine.can_transition(ForecastLifecycleState.EXPIRED, ForecastLifecycleState.VERIFIED)
    assert ForecastStateMachine.can_transition(ForecastLifecycleState.ACTIVE, ForecastLifecycleState.SUPERSEDED)


def test_forecast_state_machine_prohibited_transitions():
    """Verifies prohibited lifecycle transitions throw InvalidLifecycleTransitionError."""
    # Cannot go backward from EXPIRED to ACTIVE
    assert not ForecastStateMachine.can_transition(ForecastLifecycleState.EXPIRED, ForecastLifecycleState.ACTIVE)
    with pytest.raises(InvalidLifecycleTransitionError):
        ForecastStateMachine.validate_transition(ForecastLifecycleState.EXPIRED, ForecastLifecycleState.ACTIVE)

    # Cannot transition terminal VERIFIED state
    assert not ForecastStateMachine.can_transition(ForecastLifecycleState.VERIFIED, ForecastLifecycleState.GENERATED)
    with pytest.raises(InvalidLifecycleTransitionError):
        ForecastStateMachine.validate_transition(ForecastLifecycleState.VERIFIED, ForecastLifecycleState.GENERATED)


def test_lifecycle_manager_initialization_and_transitions(tmp_path, monkeypatch):
    """Tests ForecastLifecycleManager initialization, transition recording, and history query."""
    monkeypatch.setattr(ForecastLifecycleManager, "DEFAULT_STORAGE_DIR", tmp_path)
    test_id = "fc_test_lifecycle_001"

    # Initialize
    state = ForecastLifecycleManager.initialize_forecast(
        forecast_id=test_id,
        model_version="1.0.0",
        dataset_fingerprint="3fec50c2ef89dbfc",
        auto_activate=True,
    )
    assert state == ForecastLifecycleState.ACTIVE
    assert ForecastLifecycleManager.get_state(test_id) == ForecastLifecycleState.ACTIVE

    # Transition to EXPIRING
    t1 = ForecastLifecycleManager.transition(
        forecast_id=test_id,
        target_status=ForecastLifecycleState.EXPIRING,
        reason="Lead window approaching final 24h",
        actor="TEST_USER",
    )
    assert t1.previous_status == ForecastLifecycleState.ACTIVE
    assert t1.new_status == ForecastLifecycleState.EXPIRING
    assert ForecastLifecycleManager.get_state(test_id) == ForecastLifecycleState.EXPIRING

    # Transition to EXPIRED
    t2 = ForecastLifecycleManager.transition(
        forecast_id=test_id,
        target_status=ForecastLifecycleState.EXPIRED,
        reason="Forecast validity window passed",
    )
    assert t2.new_status == ForecastLifecycleState.EXPIRED

    # Idempotent re-transition to EXPIRED should return existing
    t_idempotent = ForecastLifecycleManager.transition(
        forecast_id=test_id,
        target_status=ForecastLifecycleState.EXPIRED,
        reason="Redundant check",
    )
    assert t_idempotent.new_status == ForecastLifecycleState.EXPIRED

    # Verify history
    summary = ForecastLifecycleManager.get_summary(test_id)
    assert summary.forecast_id == test_id
    assert summary.current_status == ForecastLifecycleState.EXPIRED
    assert summary.transitions_count >= 3
