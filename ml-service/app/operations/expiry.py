"""
VarshaSetu - Forecast Expiry Processor (Phase 4F)
Idempotent processor that discovers active forecasts past their validity window
and transitions them to EXPIRED state without mutating original records.
"""

from typing import List, Optional
from datetime import datetime, timezone, date
from pathlib import Path
import json

from ..lifecycle.manager import ForecastLifecycleManager
from ..schemas.lifecycle import ForecastLifecycleState
from ..schemas.operations import ProcessExpiryResponse
from ..forecast.artifacts import ForecastArtifactManager


class ForecastExpiryProcessor:
    """
    Scans persisted forecasts and expires forecasts past their validity date.
    """

    @classmethod
    def process_expiries(cls, reference_time: Optional[datetime] = None) -> ProcessExpiryResponse:
        """
        Executes an idempotent expiry sweep across all stored forecast products.
        """
        now = reference_time or datetime.now(timezone.utc)
        all_forecasts = ForecastArtifactManager.list_forecasts(limit=500)

        expired_ids: List[str] = []
        processed_count = 0

        for fc in all_forecasts:
            processed_count += 1
            forecast_id = fc.forecast_id
            current_state = ForecastLifecycleManager.get_state(forecast_id)

            # Skip if already terminal or expired
            if current_state in (
                ForecastLifecycleState.EXPIRED,
                ForecastLifecycleState.VERIFIED,
                ForecastLifecycleState.REJECTED,
            ):
                continue

            # Check valid_until bound
            try:
                valid_until_str = fc.valid_until
                try:
                    dt = datetime.fromisoformat(valid_until_str.replace("Z", "+00:00"))
                except Exception:
                    d = date.fromisoformat(valid_until_str)
                    dt = datetime(d.year, d.month, d.day, 23, 59, 59, tzinfo=timezone.utc)

                if now > dt:
                    # Time has passed, transition to EXPIRED
                    ForecastLifecycleManager.transition(
                        forecast_id=forecast_id,
                        target_status=ForecastLifecycleState.EXPIRED,
                        reason=f"Automated expiry sweep: validity window passed on {valid_until_str}",
                        actor="EXPIRY_PROCESSOR",
                        model_version=fc.model.model_version,
                        dataset_fingerprint=fc.model.dataset_fingerprint,
                    )
                    expired_ids.append(forecast_id)
            except Exception:
                continue

        return ProcessExpiryResponse(
            processed_count=processed_count,
            expired_count=len(expired_ids),
            expired_forecast_ids=expired_ids,
            message=(
                f"Expiry sweep completed: evaluated {processed_count} forecasts, "
                f"transitioned {len(expired_ids)} to EXPIRED state."
            ),
        )
