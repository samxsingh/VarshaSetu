"""
VarshaSetu - Operations Monitoring & Expiry Processor Tests (Phase 4F)
Verifies subsystem status aggregation and idempotent expiry processing.
"""

from datetime import datetime, timezone
from app.operations.expiry import ForecastExpiryProcessor
from app.operations.monitor import OperationalMonitor
from app.lifecycle.manager import ForecastLifecycleManager
from app.schemas.lifecycle import ForecastLifecycleState
from app.schemas.operations import OperationalStatusSummary


def test_forecast_expiry_processor_idempotence():
    """Verifies that running expiry processor repeatedly behaves idempotently."""
    res1 = ForecastExpiryProcessor.process_expiries()
    assert res1.processed_count >= 0

    res2 = ForecastExpiryProcessor.process_expiries()
    # On second immediate run, newly expired count should be 0
    assert res2.expired_count == 0


def test_operational_monitor_status():
    """Verifies aggregated operational monitoring payload."""
    status = OperationalMonitor.get_status()
    assert isinstance(status, OperationalStatusSummary)
    assert status.data_freshness_status == "HISTORICAL_ONLY"
    assert status.validation_status == "INSUFFICIENT_DATA"
    assert status.delivery_status == "INTERNAL_SIMULATION_ONLY"
    assert len(status.scientific_disclosures) >= 3
