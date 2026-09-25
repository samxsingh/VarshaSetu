"""
VarshaSetu - Alert Event State Machine (Phase 4F)
Governs deterministic state transitions for scientific alert events.
No state transition may delete the original event record.
"""

from typing import Set, Dict
from ..schemas.events import EventState


class InvalidEventStateTransitionError(ValueError):
    """Raised when an illegal event state transition is attempted."""
    pass


class EventStateMachine:
    """
    State machine governing alert event lifecycle transitions.
    """

    VALID_TRANSITIONS: Dict[EventState, Set[EventState]] = {
        EventState.DETECTED: {
            EventState.ACKNOWLEDGED,
            EventState.UPDATED,
            EventState.SUPPRESSED,
            EventState.RESOLVED,
            EventState.EXPIRED,
        },
        EventState.ACKNOWLEDGED: {
            EventState.UPDATED,
            EventState.RESOLVED,
            EventState.EXPIRED,
            EventState.SUPPRESSED,
        },
        EventState.UPDATED: {
            EventState.ACKNOWLEDGED,
            EventState.RESOLVED,
            EventState.EXPIRED,
            EventState.SUPPRESSED,
        },
        EventState.SUPPRESSED: {
            EventState.UPDATED,
            EventState.EXPIRED,
            EventState.RESOLVED,
        },
        EventState.RESOLVED: {
            EventState.EXPIRED,
        },
        EventState.EXPIRED: set(),  # Terminal state
    }

    @classmethod
    def can_transition(cls, current: EventState, target: EventState) -> bool:
        """Checks if a transition from current to target state is permissible."""
        if current == target:
            return True  # Idempotent
        allowed = cls.VALID_TRANSITIONS.get(current, set())
        return target in allowed

    @classmethod
    def validate_transition(cls, current: EventState, target: EventState) -> None:
        """Validates transition and raises error if prohibited."""
        if not cls.can_transition(current, target):
            raise InvalidEventStateTransitionError(
                f"Prohibited event state transition: cannot move from "
                f"'{current.value}' to '{target.value}'. Allowed transitions: "
                f"{[s.value for s in cls.VALID_TRANSITIONS.get(current, set())]}"
            )
