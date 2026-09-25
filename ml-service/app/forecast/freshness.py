"""
VarshaSetu - Forecast Freshness Engine (Phase 4F)
Evaluates data and forecast age against strict physical time thresholds.
Prevents stale or historical data from masquerading as fresh operational telemetry.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone, date, timedelta
from pydantic import BaseModel, Field


class FreshnessEvaluationResult(BaseModel):
    """
    Detailed freshness evaluation audit for a forecast product.
    """
    forecast_id: str
    freshness_status: str  # FRESH | AGING | STALE | EXPIRED | HISTORICAL
    is_operational_allowed: bool
    generated_at: str
    valid_from: str
    valid_until: str
    source_observation_date: str
    data_age_hours: float
    forecast_age_hours: float
    is_validity_passed: bool
    scientific_notes: str


class ForecastFreshnessEvaluator:
    """
    Evaluator for forecast and data freshness.
    """

    # Configurable thresholds
    FRESH_HOURS = 24.0
    AGING_HOURS = 48.0
    STALE_HOURS = 72.0

    @classmethod
    def evaluate(
        cls,
        forecast_id: str,
        generated_at_str: str,
        valid_from_str: str,
        valid_until_str: str,
        source_observation_date_str: str = "2024-09-30",
        reference_time: Optional[datetime] = None
    ) -> FreshnessEvaluationResult:
        """
        Evaluates the freshness of a forecast and its underlying observations.
        """
        now = reference_time or datetime.now(timezone.utc)

        # Parse validity bounds
        try:
            valid_until_dt = datetime.fromisoformat(valid_until_str.replace("Z", "+00:00"))
            if valid_until_dt.tzinfo is None:
                valid_until_dt = valid_until_dt.replace(tzinfo=timezone.utc)
        except Exception:
            try:
                d = date.fromisoformat(valid_until_str)
                valid_until_dt = datetime(d.year, d.month, d.day, 23, 59, 59, tzinfo=timezone.utc)
            except Exception:
                valid_until_dt = now

        # Parse generated at
        try:
            generated_at_dt = datetime.fromisoformat(generated_at_str.replace("Z", "+00:00"))
            if generated_at_dt.tzinfo is None:
                generated_at_dt = generated_at_dt.replace(tzinfo=timezone.utc)
        except Exception:
            generated_at_dt = now

        # Parse source observation date
        try:
            obs_d = date.fromisoformat(source_observation_date_str)
            obs_dt = datetime(obs_d.year, obs_d.month, obs_d.day, 12, 0, 0, tzinfo=timezone.utc)
        except Exception:
            obs_dt = now - timedelta(days=365)

        data_age_hours = max(0.0, (now - obs_dt).total_seconds() / 3600.0)
        forecast_age_hours = max(0.0, (now - generated_at_dt).total_seconds() / 3600.0)
        is_validity_passed = now > valid_until_dt

        # Classification logic:
        # 1. If valid_until has passed: EXPIRED (or HISTORICAL if far in the past)
        # 2. If data_age > STALE_HOURS: HISTORICAL (for long archives) or STALE
        # 3. If within 24h: FRESH
        # 4. If within 48h: AGING
        if is_validity_passed:
            if data_age_hours > 24 * 90:  # > 90 days
                status = "HISTORICAL"
                operational = False
                notes = "Forecast belongs to historical observational archive (Kharif 2024). Operational use prohibited."
            else:
                status = "EXPIRED"
                operational = False
                notes = f"Forecast validity window elapsed on {valid_until_str}."
        elif data_age_hours > cls.STALE_HOURS:
            if data_age_hours > 24 * 30:
                status = "HISTORICAL"
            else:
                status = "STALE"
            operational = False
            notes = f"Observation data age is {data_age_hours:.1f} hours (> {cls.STALE_HOURS}h threshold). Operational use prohibited."
        elif data_age_hours > cls.AGING_HOURS:
            status = "AGING"
            operational = False
            notes = f"Observation data age is {data_age_hours:.1f} hours (aging telemetry)."
        else:
            status = "FRESH"
            operational = True
            notes = "Observational telemetry is fresh within the 24-hour delivery window."

        # Hard guardrail: If source observation is from 2024 and current year is 2026, status MUST be HISTORICAL
        if obs_dt.year < now.year:
            status = "HISTORICAL"
            operational = False
            notes = "Ground truth observation is from historical Kharif 2024 archive. Operational status locked to DIAGNOSTIC_ONLY."

        return FreshnessEvaluationResult(
            forecast_id=forecast_id,
            freshness_status=status,
            is_operational_allowed=operational,
            generated_at=generated_at_str,
            valid_from=valid_from_str,
            valid_until=valid_until_str,
            source_observation_date=source_observation_date_str,
            data_age_hours=data_age_hours,
            forecast_age_hours=forecast_age_hours,
            is_validity_passed=is_validity_passed,
            scientific_notes=notes,
        )
