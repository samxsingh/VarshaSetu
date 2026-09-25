"""
VarshaSetu - Event Intelligence & Alert Management Package (Phase 4F)
"""

from .detector import EventDetector
from .deduplication import EventDeduplicator, compute_event_dedup_hash
from .state_machine import EventStateMachine, InvalidEventStateTransitionError
from .manager import EventManager

__all__ = [
    "EventDetector",
    "EventDeduplicator",
    "compute_event_dedup_hash",
    "EventStateMachine",
    "InvalidEventStateTransitionError",
    "EventManager",
]
