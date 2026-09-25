"""
VarshaSetu - Alert Event Manager (Phase 4F)
Coordinates event detection passes, deduplication, state transitions,
audit trails, and disk persistence.
"""

from typing import Dict, Any, List, Optional
from pathlib import Path
import json
from datetime import datetime, timezone

from .detector import EventDetector
from .deduplication import EventDeduplicator
from .state_machine import EventStateMachine, InvalidEventStateTransitionError
from ..schemas.forecast import ScientificForecastRecord
from ..schemas.events import (
    ScientificEventRecord,
    EventTransitionRecord,
    EventDetectionResponse,
    EventState,
    EventType,
    EventSeverity,
)


class EventManager:
    """
    Orchestrates alert event lifecycle, deduplication, and persistence.
    """

    DEFAULT_STORAGE_DIR = Path(__file__).parent.parent.parent / "artifacts" / "events"

    _events_cache: Dict[str, ScientificEventRecord] = {}
    _hash_to_id: Dict[str, str] = {}
    _transitions_cache: Dict[str, List[EventTransitionRecord]] = {}

    @classmethod
    def get_storage_dir(cls) -> Path:
        cls.DEFAULT_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        return cls.DEFAULT_STORAGE_DIR

    @classmethod
    def _get_event_file(cls, event_id: str) -> Path:
        return cls.get_storage_dir() / f"event_{event_id}.json"

    @classmethod
    def _load_all_persisted(cls) -> None:
        """Loads any saved events into in-memory cache."""
        storage = cls.get_storage_dir()
        for file in storage.glob("event_ev_*.json"):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    ev = ScientificEventRecord(**data["event"])
                    cls._events_cache[ev.event_id] = ev
                    cls._hash_to_id[ev.deduplication_hash] = ev.event_id
                    cls._transitions_cache[ev.event_id] = [
                        EventTransitionRecord(**t) for t in data.get("transitions", [])
                    ]
            except Exception:
                continue

    @classmethod
    def _save_event(cls, event: ScientificEventRecord, transitions: List[EventTransitionRecord]) -> None:
        file_path = cls._get_event_file(event.event_id)
        payload = {
            "event": event.model_dump(mode="json"),
            "transitions": [t.model_dump(mode="json") for t in transitions],
        }
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

    @classmethod
    def detect_events(
        cls,
        forecasts: List[ScientificForecastRecord],
        cooldown_hours: int = 24,
        actor: str = "SYSTEM"
    ) -> EventDetectionResponse:
        """
        Executes an event detection pass over a set of forecasts with deduplication and state management.
        """
        cls._load_all_persisted()

        detected: List[ScientificEventRecord] = []
        updated: List[ScientificEventRecord] = []
        suppressed_count = 0
        now_str = datetime.now(timezone.utc).isoformat()

        for fc in forecasts:
            candidate_events = EventDetector.evaluate_forecast(fc, detected_at=now_str)
            for cand in candidate_events:
                existing_id = cls._hash_to_id.get(cand.deduplication_hash)
                existing_ev = cls._events_cache.get(existing_id).model_dump(mode="json") if existing_id and existing_id in cls._events_cache else None

                action, target_id = EventDeduplicator.evaluate_deduplication(
                    dedup_hash=cand.deduplication_hash,
                    detected_at_str=now_str,
                    new_probability=cand.probability,
                    existing_event=existing_ev,
                    cooldown_hours=cooldown_hours,
                )

                if action == "CREATE":
                    # Initialize initial transition
                    trans = EventTransitionRecord(
                        event_id=cand.event_id,
                        previous_state=EventState.DETECTED,
                        new_state=EventState.DETECTED,
                        actor=actor,
                        reason="Initial scientific threshold detection",
                    )
                    transitions = [trans]
                    cls._events_cache[cand.event_id] = cand
                    cls._hash_to_id[cand.deduplication_hash] = cand.event_id
                    cls._transitions_cache[cand.event_id] = transitions
                    cls._save_event(cand, transitions)
                    detected.append(cand)

                elif action == "UPDATE" and target_id:
                    # Update existing event record
                    existing = cls._events_cache[target_id]
                    prev_state = existing.state

                    # Determine if state transition is allowed
                    target_state = EventState.UPDATED
                    if prev_state != EventState.UPDATED:
                        EventStateMachine.validate_transition(prev_state, target_state)

                    existing.probability = cand.probability
                    existing.severity = cand.severity
                    existing.state = target_state
                    existing.updated_at = now_str
                    existing.description = cand.description

                    trans = EventTransitionRecord(
                        event_id=target_id,
                        previous_state=prev_state,
                        new_state=target_state,
                        actor=actor,
                        reason=f"Event updated with latest forecast probability {cand.probability:.3f}",
                    )
                    cls._transitions_cache[target_id].append(trans)
                    cls._save_event(existing, cls._transitions_cache[target_id])
                    updated.append(existing)

                elif action == "SUPPRESS":
                    suppressed_count += 1

        summary = (
            f"Pass completed: {len(detected)} new events detected, "
            f"{len(updated)} updated, {suppressed_count} suppressed via cooldown. "
            f"Evaluated {len(forecasts)} forecasts."
        )

        return EventDetectionResponse(
            total_evaluated_forecasts=len(forecasts),
            detected_events=detected,
            updated_events=updated,
            suppressed_count=suppressed_count,
            operational_status="DIAGNOSTIC_ONLY",
            summary=summary,
        )

    @classmethod
    def transition_event(
        cls,
        event_id: str,
        target_state: EventState,
        reason: str,
        actor: str = "SYSTEM",
        metadata: Optional[Dict[str, Any]] = None
    ) -> ScientificEventRecord:
        """
        Transitions an event to a new lifecycle state (e.g. ACKNOWLEDGED or RESOLVED).
        """
        cls._load_all_persisted()
        event = cls._events_cache.get(event_id)
        if not event:
            raise KeyError(f"Event '{event_id}' not found.")

        current_state = event.state

        # Idempotent no-op
        if current_state == target_state:
            return event

        EventStateMachine.validate_transition(current_state, target_state)

        now_str = datetime.now(timezone.utc).isoformat()
        event.state = target_state
        event.updated_at = now_str

        if target_state == EventState.ACKNOWLEDGED:
            event.acknowledged_by = actor
            event.acknowledged_at = now_str
        elif target_state == EventState.RESOLVED:
            event.resolved_by = actor
            event.resolved_at = now_str

        trans = EventTransitionRecord(
            event_id=event_id,
            previous_state=current_state,
            new_state=target_state,
            actor=actor,
            reason=reason,
            metadata=metadata or {},
        )

        if event_id not in cls._transitions_cache:
            cls._transitions_cache[event_id] = []
        cls._transitions_cache[event_id].append(trans)

        cls._save_event(event, cls._transitions_cache[event_id])
        return event

    @classmethod
    def get_event(cls, event_id: str) -> Optional[ScientificEventRecord]:
        """Retrieves a single event record."""
        cls._load_all_persisted()
        return cls._events_cache.get(event_id)

    @classmethod
    def get_event_history(cls, event_id: str) -> List[EventTransitionRecord]:
        """Retrieves transition audit history for an event."""
        cls._load_all_persisted()
        return cls._transitions_cache.get(event_id, [])

    @classmethod
    def list_events(
        cls,
        block_id: Optional[str] = None,
        event_type: Optional[str] = None,
        severity: Optional[str] = None,
        state: Optional[str] = None,
        limit: int = 100
    ) -> List[ScientificEventRecord]:
        """Filterable listing of scientific events."""
        cls._load_all_persisted()
        events = list(cls._events_cache.values())

        if block_id:
            events = [e for e in events if e.block_id == block_id]
        if event_type:
            events = [e for e in events if e.event_type.value == event_type]
        if severity:
            events = [e for e in events if e.severity.value == severity]
        if state:
            events = [e for e in events if e.state.value == state]

        # Sort descending by detected_at
        events.sort(key=lambda e: e.detected_at, reverse=True)
        return events[:limit]
