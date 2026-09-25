"""
VarshaSetu - Alert Deduplication Tests (Phase 4F)
Verifies hash generation, cooldown periods, and update vs suppress behaviors.
"""

from app.schemas.events import EventType
from app.events.deduplication import compute_event_dedup_hash, EventDeduplicator


def test_event_deduplication_hash_determinism():
    """Verifies that identical event parameters generate identical hashes."""
    h1 = compute_event_dedup_hash(
        block_id="UP_LKO_BKT",
        event_type=EventType.HEAVY_RAIN_RISK,
        target_type="HEAVY_RAIN",
        horizon_days=7,
        threshold=64.5,
        valid_from="2024-09-15",
        valid_until="2024-09-21",
    )
    h2 = compute_event_dedup_hash(
        block_id="UP_LKO_BKT",
        event_type=EventType.HEAVY_RAIN_RISK,
        target_type="HEAVY_RAIN",
        horizon_days=7,
        threshold=64.5,
        valid_from="2024-09-15",
        valid_until="2024-09-21",
    )
    assert h1 == h2
    assert len(h1) == 16


def test_event_deduplicator_cooldown_and_suppression():
    """Tests that repeat detections within cooldown with identical probabilities are suppressed."""
    existing_event = {
        "event_id": "ev_test_1234",
        "detected_at": "2026-09-25T10:00:00Z",
        "probability": 0.65,
        "state": "DETECTED",
    }

    # Same probability within 2 hours -> SUPPRESS
    action, target_id = EventDeduplicator.evaluate_deduplication(
        dedup_hash="hash123",
        detected_at_str="2026-09-25T12:00:00Z",
        new_probability=0.65,
        existing_event=existing_event,
        cooldown_hours=24,
    )
    assert action == "SUPPRESS"
    assert target_id == "ev_test_1234"


def test_event_deduplicator_probability_update():
    """Tests that shifted probability triggers UPDATE rather than CREATE."""
    existing_event = {
        "event_id": "ev_test_1234",
        "detected_at": "2026-09-25T10:00:00Z",
        "probability": 0.50,
        "state": "DETECTED",
    }

    # Probability jumped to 0.75 -> UPDATE
    action, target_id = EventDeduplicator.evaluate_deduplication(
        dedup_hash="hash123",
        detected_at_str="2026-09-25T14:00:00Z",
        new_probability=0.75,
        existing_event=existing_event,
        cooldown_hours=24,
    )
    assert action == "UPDATE"
    assert target_id == "ev_test_1234"
