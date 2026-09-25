"""
VarshaSetu - Alert Deduplication & Cooldown Engine (Phase 4F)
Prevents duplicate alert generation across repeated forecast passes.
Enforces deterministic event identity hashes and configurable cooldown windows.
"""

from typing import Tuple, Optional, Dict
import hashlib
from datetime import datetime, timezone, timedelta
from ..schemas.events import EventType


def compute_event_dedup_hash(
    block_id: str,
    event_type: EventType,
    target_type: str,
    horizon_days: int,
    threshold: float,
    valid_from: str,
    valid_until: str,
) -> str:
    """
    Computes a deterministic SHA-256 hash defining unique event identity.
    """
    canonical_key = f"{block_id}:{event_type.value}:{target_type}:{horizon_days}:{threshold:.1f}:{valid_from}:{valid_until}"
    return hashlib.sha256(canonical_key.encode("utf-8")).hexdigest()[:16]


class EventDeduplicator:
    """
    Evaluates new event detections against active deduplication hashes.
    """

    @classmethod
    def evaluate_deduplication(
        cls,
        dedup_hash: str,
        detected_at_str: str,
        new_probability: float,
        existing_event: Optional[Dict] = None,
        cooldown_hours: int = 24
    ) -> Tuple[str, Optional[str]]:
        """
        Determines whether to CREATE, UPDATE, or SUPPRESS a detected event.
        Returns:
            Tuple[action, existing_event_id] where action is 'CREATE', 'UPDATE', or 'SUPPRESS'.
        """
        if not existing_event:
            return "CREATE", None

        # Check existing state
        state = existing_event.get("state")
        if state in ("RESOLVED", "EXPIRED"):
            # Previous event is closed; create new
            return "CREATE", None

        # Check cooldown time
        try:
            prev_time = datetime.fromisoformat(existing_event.get("detected_at", "").replace("Z", "+00:00"))
            curr_time = datetime.fromisoformat(detected_at_str.replace("Z", "+00:00"))
            hours_diff = (curr_time - prev_time).total_seconds() / 3600.0
        except Exception:
            hours_diff = 0.0

        prev_prob = existing_event.get("probability", 0.0)
        prob_delta = abs(new_probability - prev_prob)

        # If inside cooldown and probability is virtually identical: SUPPRESS
        if hours_diff < cooldown_hours and prob_delta < 0.03:
            return "SUPPRESS", existing_event.get("event_id")

        # If inside cooldown or within same validity window, but probability shifted: UPDATE
        return "UPDATE", existing_event.get("event_id")
