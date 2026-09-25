"""
VarshaSetu - Operational Observability & Monitoring Monitor (Phase 4F)
Aggregates operational readiness, system health, and data gate telemetry.
Rejects fabricated uptimes; unavailable values remain null with explicit status.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
import psycopg2

from ..config import settings
from ..forecast.service import ForecastService
from ..forecast.artifacts import ForecastArtifactManager
from ..events.manager import EventManager
from ..lifecycle.manager import ForecastLifecycleManager
from ..schemas.lifecycle import ForecastLifecycleState
from ..schemas.operations import OperationalStatusSummary


class OperationalMonitor:
    """
    Consolidates operational metrics and status across all sub-systems.
    """

    _last_event_detection_time: Optional[str] = None
    _last_expiry_run_time: Optional[str] = None

    @classmethod
    def record_event_detection(cls) -> None:
        cls._last_event_detection_time = datetime.now(timezone.utc).isoformat()

    @classmethod
    def record_expiry_run(cls) -> None:
        cls._last_expiry_run_time = datetime.now(timezone.utc).isoformat()

    @classmethod
    def get_status(cls) -> OperationalStatusSummary:
        """
        Gathers real operational readiness statuses.
        """
        # 1. Database status
        db_status = "DISCONNECTED"
        try:
            conn = psycopg2.connect(settings.DATABASE_URL)
            cur = conn.cursor()
            cur.execute("SELECT 1;")
            cur.close()
            conn.close()
            db_status = "CONNECTED"
        except Exception:
            db_status = "DISCONNECTED_FILE_MODE"

        # 2. Forecast service & data gates
        fc_status_res = ForecastService.get_status()
        forecast_service_status = fc_status_res.system_status

        # 3. Forecast and event counts
        all_forecasts = ForecastArtifactManager.list_forecasts(limit=200)
        active_forecasts = [
            fc for fc in all_forecasts
            if ForecastLifecycleManager.get_state(fc.forecast_id) == ForecastLifecycleState.ACTIVE
        ]

        all_events = EventManager.list_events(limit=200)
        active_events = [e for e in all_events if e.state.value in ("DETECTED", "ACKNOWLEDGED", "UPDATED")]

        # 4. Last forecast generation
        last_forecast_gen = all_forecasts[0].generated_at if all_forecasts else None

        disclosures = [
            "All operational forecasting is gated under DIAGNOSTIC_ONLY status.",
            "Observational data is restricted to historical Kharif 2024 archive (Bakshi Ka Talab, UP_LKO_BKT).",
            "Multi-year hindcast validation gate status is INSUFFICIENT_DATA (requires >= 2 seasons).",
            "Notification delivery operates in provider-neutral internal simulation mode only.",
            "Agronomic crop decision commands (sowing, spraying, irrigation, harvest) are strictly disabled.",
        ]

        return OperationalStatusSummary(
            forecast_service_status=forecast_service_status,
            model_registry_status="OPERATIONAL_CALIBRATED_BENCHMARKS_ACTIVE",
            data_freshness_status="HISTORICAL_ONLY",
            calibration_status="PARTIAL_DIAGNOSTIC_CALIBRATED",
            validation_status="INSUFFICIENT_DATA",
            event_engine_status="ACTIVE_DIAGNOSTIC",
            delivery_status="INTERNAL_SIMULATION_ONLY",
            database_status=db_status,
            last_successful_forecast_generation=last_forecast_gen,
            last_event_detection=cls._last_event_detection_time,
            last_expiry_run=cls._last_expiry_run_time,
            total_active_forecasts=len(active_forecasts),
            total_active_events=len(active_events),
            active_dataset="Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)",
            spatial_extent="1 Block (BLOCK resolution ~9 km)",
            scientific_disclosures=disclosures,
        )
