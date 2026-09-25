"""
VarshaSetu - Forecast Operational Status Gate
Synthesizes model readiness, calibration gating, multi-year validation,
data freshness, and spatial resolution constraints into an authoritative operational verdict.
"""

from typing import Dict, Any, List, Optional, Tuple
from ..schemas.forecast import ForecastOperationalStatus, DataFreshnessStatus


class ForecastOperationalGateResult:
    def __init__(
        self,
        operational: bool,
        status: ForecastOperationalStatus,
        messages: List[str],
        gate_breakdown: Dict[str, Any]
    ):
        self.operational = operational
        self.status = status
        self.messages = messages
        self.gate_breakdown = gate_breakdown


class ForecastOperationalGate:
    """
    Evaluates multi-tier scientific gates to determine if a forecast can be certified as OPERATIONAL.
    Never weakens gates to fabricate operational status.
    """

    SUPPORTED_SPATIAL_RESOLUTIONS = ["BLOCK", "DISTRICT"]

    @classmethod
    def evaluate(
        cls,
        model_exists: bool,
        model_id: str,
        calibration_allowed: bool,
        validation_allowed: bool,
        freshness_status: str,
        spatial_resolution: str = "BLOCK",
        total_seasons: int = 1,
        target_name: str = "HEAVY_RAIN",
        horizon_days: int = 7
    ) -> ForecastOperationalGateResult:
        messages = []
        breakdown = {
            "model_ready": model_exists,
            "calibration_allowed": calibration_allowed,
            "validation_allowed": validation_allowed,
            "data_freshness": freshness_status,
            "spatial_resolution_supported": spatial_resolution in cls.SUPPORTED_SPATIAL_RESOLUTIONS,
            "total_seasons": total_seasons,
        }

        # 1. Spatial Resolution Check
        if spatial_resolution not in cls.SUPPORTED_SPATIAL_RESOLUTIONS:
            messages.append(
                f"Requested spatial resolution '{spatial_resolution}' exceeds scientific resolution bounds. "
                "Forecasts are bounded at BLOCK centroid level (~9 km gridded)."
            )
            return ForecastOperationalGateResult(
                operational=False,
                status=ForecastOperationalStatus.SPATIAL_LIMITATION,
                messages=messages,
                gate_breakdown=breakdown
            )

        # 2. Model Availability Check
        if not model_exists:
            messages.append(f"Model '{model_id}' is not trained or artifact is unavailable for {target_name} ({horizon_days}d).")
            return ForecastOperationalGateResult(
                operational=False,
                status=ForecastOperationalStatus.MODEL_UNAVAILABLE,
                messages=messages,
                gate_breakdown=breakdown
            )

        # 3. Data Freshness Check
        if freshness_status == DataFreshnessStatus.HISTORICAL_ONLY.value:
            messages.append(
                "Observational data is from historical archive (Kharif 2024, latest date 2024-09-30). "
                "Forecast product is retrospective and must be treated as DIAGNOSTIC_ONLY."
            )
        elif freshness_status == DataFreshnessStatus.STALE.value:
            messages.append("Input observations are stale (>48 hours old). Operational certification withheld.")
            return ForecastOperationalGateResult(
                operational=False,
                status=ForecastOperationalStatus.DATA_STALE,
                messages=messages,
                gate_breakdown=breakdown
            )

        # 4. Multi-Year Validation Gate Check (Phase 4D)
        if not validation_allowed or total_seasons < 5:
            messages.append(
                f"Multi-year validation gate is INSUFFICIENT_DATA ({total_seasons} season(s) available < 5 required). "
                "Operational forecast certification requires multi-season hindcast verification."
            )

        # 5. Calibration Gate Check (Phase 4C)
        if not calibration_allowed:
            messages.append(
                "Operational probability calibration is inactive due to sample size or event balance gatekeeper. "
                "Probabilities represent raw tree scores or diagnostic estimates."
            )

        # Final determination:
        # Operational is granted ONLY if model_exists AND validation_allowed AND calibration_allowed AND data is FRESH
        all_passed = (
            model_exists
            and validation_allowed
            and calibration_allowed
            and freshness_status == DataFreshnessStatus.FRESH.value
            and spatial_resolution in cls.SUPPORTED_SPATIAL_RESOLUTIONS
        )

        if all_passed:
            status = ForecastOperationalStatus.OPERATIONAL
            messages.append("All scientific, calibration, validation, and data freshness gates verified.")
        elif freshness_status == DataFreshnessStatus.HISTORICAL_ONLY.value:
            status = ForecastOperationalStatus.DIAGNOSTIC_ONLY
        elif total_seasons < 5:
            status = ForecastOperationalStatus.INSUFFICIENT_DATA
        elif not calibration_allowed:
            status = ForecastOperationalStatus.NOT_CALIBRATED
        else:
            status = ForecastOperationalStatus.DIAGNOSTIC_ONLY

        return ForecastOperationalGateResult(
            operational=all_passed,
            status=status,
            messages=messages,
            gate_breakdown=breakdown
        )
