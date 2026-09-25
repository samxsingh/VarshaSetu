"""
VarshaSetu - Deterministic Forecast State Machine (Phase 4F)
Enforces valid state transitions and rejects illegal mutations.
"""

from typing import Set, Dict
from ..schemas.lifecycle import ForecastLifecycleState


class InvalidLifecycleTransitionError(ValueError):
    """Raised when an illegal forecast lifecycle transition is attempted."""
    pass


class ForecastStateMachine:
    """
    Validates and governs lifecycle state transitions for scientific forecasts.
    """

    VALID_TRANSITIONS: Dict[ForecastLifecycleState, Set[ForecastLifecycleState]] = {
        ForecastLifecycleState.GENERATED: {
            ForecastLifecycleState.ACTIVE,
            ForecastLifecycleState.REJECTED,
        },
        ForecastLifecycleState.ACTIVE: {
            ForecastLifecycleState.EXPIRING,
            ForecastLifecycleState.EXPIRED,
            ForecastLifecycleState.SUPERSEDED,
            ForecastLifecycleState.REJECTED,
        },
        ForecastLifecycleState.EXPIRING: {
            ForecastLifecycleState.EXPIRED,
            ForecastLifecycleState.SUPERSEDED,
            ForecastLifecycleState.REJECTED,
        },
        ForecastLifecycleState.EXPIRED: {
            ForecastLifecycleState.VERIFIED,
        },
        ForecastLifecycleState.SUPERSEDED: {
            ForecastLifecycleState.EXPIRED,
            ForecastLifecycleState.VERIFIED,
        },
        ForecastLifecycleState.VERIFIED: set(),  # Terminal state
        ForecastLifecycleState.REJECTED: set(),  # Terminal state
    }

    @classmethod
    def can_transition(cls, current: ForecastLifecycleState, target: ForecastLifecycleState) -> bool:
        """Checks if a transition from current to target state is legally permissible."""
        if current == target:
            return True  # Idempotent no-op
        allowed = cls.VALID_TRANSITIONS.get(current, set())
        return target in allowed

    @classmethod
    def validate_transition(cls, current: ForecastLifecycleState, target: ForecastLifecycleState) -> None:
        """Validates transition and raises InvalidLifecycleTransitionError if prohibited."""
        if not cls.can_transition(current, target):
            raise InvalidLifecycleTransitionError(
                f"Prohibited forecast lifecycle transition: cannot move from "
                f"'{current.value}' to '{target.value}'. Allowed transitions: "
                f"{[s.value for s in cls.VALID_TRANSITIONS.get(current, set())]}"
            )
