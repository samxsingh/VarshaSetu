"""
VarshaSetu - Forecast Lifecycle Manager (Phase 4F)
Orchestrates forecast lifecycle tracking, immutable transition logging,
and state queries.
"""

from typing import Dict, Any, List, Optional
from pathlib import Path
import json
import os
from datetime import datetime, timezone

from .state_machine import ForecastStateMachine, InvalidLifecycleTransitionError
from ..schemas.lifecycle import (
    ForecastLifecycleState,
    LifecycleTransitionRecord,
    ForecastLifecycleSummary,
)


class ForecastLifecycleManager:
    """
    Manages lifecycle states and audit trails for scientific forecasts.
    """

    DEFAULT_STORAGE_DIR = Path(__file__).parent.parent.parent / "artifacts" / "lifecycle"

    # In-memory index of forecast_id -> current state & transition history
    _state_cache: Dict[str, ForecastLifecycleState] = {}
    _history_cache: Dict[str, List[LifecycleTransitionRecord]] = {}

    @classmethod
    def get_storage_dir(cls) -> Path:
        cls.DEFAULT_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        return cls.DEFAULT_STORAGE_DIR

    @classmethod
    def _get_history_file(cls, forecast_id: str) -> Path:
        return cls.get_storage_dir() / f"lifecycle_{forecast_id}.json"

    @classmethod
    def _load_history(cls, forecast_id: str) -> List[LifecycleTransitionRecord]:
        if forecast_id in cls._history_cache:
            return cls._history_cache[forecast_id]

        file_path = cls._get_history_file(forecast_id)
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    records = [LifecycleTransitionRecord(**r) for r in data.get("transitions", [])]
                    cls._history_cache[forecast_id] = records
                    if records:
                        cls._state_cache[forecast_id] = records[-1].new_status
                    return records
            except Exception:
                pass

        return []

    @classmethod
    def _save_history(cls, forecast_id: str, transitions: List[LifecycleTransitionRecord]) -> None:
        file_path = cls._get_history_file(forecast_id)
        payload = {
            "forecast_id": forecast_id,
            "current_status": transitions[-1].new_status.value if transitions else ForecastLifecycleState.ACTIVE.value,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "transitions": [t.model_dump(mode="json") for t in transitions],
        }
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

    @classmethod
    def initialize_forecast(
        cls,
        forecast_id: str,
        model_version: str = "1.0.0",
        dataset_fingerprint: str = "3fec50c2ef89dbfc",
        auto_activate: bool = True,
        actor: str = "SYSTEM"
    ) -> ForecastLifecycleState:
        """
        Initializes a newly generated forecast in the lifecycle system.
        """
        history = cls._load_history(forecast_id)
        if history:
            return history[-1].new_status

        # 1. Initial GENERATED record
        t1 = LifecycleTransitionRecord(
            forecast_id=forecast_id,
            previous_status=ForecastLifecycleState.GENERATED,
            new_status=ForecastLifecycleState.GENERATED,
            reason="Forecast product initial generation",
            model_version=model_version,
            dataset_fingerprint=dataset_fingerprint,
            actor=actor,
        )
        history = [t1]

        # 2. Auto-activate if requested
        if auto_activate:
            t2 = LifecycleTransitionRecord(
                forecast_id=forecast_id,
                previous_status=ForecastLifecycleState.GENERATED,
                new_status=ForecastLifecycleState.ACTIVE,
                reason="Automatic activation upon passing initial gates",
                model_version=model_version,
                dataset_fingerprint=dataset_fingerprint,
                actor=actor,
            )
            history.append(t2)

        cls._history_cache[forecast_id] = history
        current_state = history[-1].new_status
        cls._state_cache[forecast_id] = current_state
        cls._save_history(forecast_id, history)
        return current_state

    @classmethod
    def transition(
        cls,
        forecast_id: str,
        target_status: ForecastLifecycleState,
        reason: str,
        actor: str = "SYSTEM",
        model_version: str = "1.0.0",
        dataset_fingerprint: str = "3fec50c2ef89dbfc",
        metadata: Optional[Dict[str, Any]] = None
    ) -> LifecycleTransitionRecord:
        """
        Executes a deterministic state transition on a forecast.
        Rejects illegal transitions and behaves idempotently if already in target state.
        """
        history = cls._load_history(forecast_id)
        if not history:
            # Initialize as active first if transitioning an existing legacy record
            cls.initialize_forecast(forecast_id, model_version, dataset_fingerprint, auto_activate=True, actor=actor)
            history = cls._load_history(forecast_id)

        current_status = history[-1].new_status

        # Idempotent no-op
        if current_status == target_status:
            return history[-1]

        # Validate legal transition
        ForecastStateMachine.validate_transition(current_status, target_status)

        # Append new transition
        record = LifecycleTransitionRecord(
            forecast_id=forecast_id,
            previous_status=current_status,
            new_status=target_status,
            reason=reason,
            model_version=model_version,
            dataset_fingerprint=dataset_fingerprint,
            actor=actor,
            metadata=metadata or {},
        )

        history.append(record)
        cls._history_cache[forecast_id] = history
        cls._state_cache[forecast_id] = target_status
        cls._save_history(forecast_id, history)
        return record

    @classmethod
    def get_state(cls, forecast_id: str) -> ForecastLifecycleState:
        """Retrieves the current lifecycle state of a forecast."""
        if forecast_id in cls._state_cache:
            return cls._state_cache[forecast_id]
        history = cls._load_history(forecast_id)
        if history:
            return history[-1].new_status
        # Default for historical unindexed records is ACTIVE until verified or expired
        return ForecastLifecycleState.ACTIVE

    @classmethod
    def get_summary(cls, forecast_id: str) -> ForecastLifecycleSummary:
        """Retrieves complete lifecycle summary and history audit trail."""
        history = cls._load_history(forecast_id)
        if not history:
            cls.initialize_forecast(forecast_id)
            history = cls._load_history(forecast_id)

        return ForecastLifecycleSummary(
            forecast_id=forecast_id,
            current_status=history[-1].new_status if history else ForecastLifecycleState.ACTIVE,
            created_at=history[0].timestamp if history else datetime.now(timezone.utc).isoformat(),
            last_updated_at=history[-1].timestamp if history else datetime.now(timezone.utc).isoformat(),
            transitions_count=len(history),
            history=history,
        )

    @classmethod
    def list_forecasts_by_state(cls, state: ForecastLifecycleState) -> List[str]:
        """Lists forecast IDs currently in a given lifecycle state."""
        storage_dir = cls.get_storage_dir()
        result = []
        for file in storage_dir.glob("lifecycle_*.json"):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data.get("current_status") == state.value:
                        result.append(data.get("forecast_id"))
            except Exception:
                continue
        return result
