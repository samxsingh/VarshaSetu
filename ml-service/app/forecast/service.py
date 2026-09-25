"""
VarshaSetu - Forecast Service Orchestrator
High-level service coordinating forecast generation, caching, retrieval,
target/horizon registries, and explanatory interfaces.
"""

from typing import Dict, Any, List, Optional
import pandas as pd

from ..schemas.forecast import (
    ScientificForecastRecord,
    ForecastGenerateRequest,
    ForecastStatusResponse,
    ForecastAvailabilityResponse,
    ForecastListResponse,
    ForecastExplanationResponse,
    ForecastHistoryResponse,
    TargetListResponse,
    HorizonListResponse,
    ForecastTargetItem,
    ForecastHorizonItem
)
from ..training.tree_pipeline import TreeTrainingPipeline
from .generator import ForecastGenerator
from .artifacts import ForecastArtifactManager
from .availability import ForecastAvailabilityGate
from .disclosure import ForecastExplanationGenerator


class ForecastService:
    """
    Orchestration service for the VarshaSetu scientific forecast product layer.
    """

    SUPPORTED_TARGETS = [
        ForecastTargetItem(
            target_type="HEAVY_RAIN",
            name="Heavy Rainfall Event",
            description="Probability of 24-hour rainfall exceeding the IMD heavy rain threshold (≥64.5 mm)",
            unit="probability",
            threshold=64.5,
            category="Extreme Hydrometeorology",
            version="v1.0-imd-kharif"
        ),
        ForecastTargetItem(
            target_type="DRY_SPELL",
            name="Prolonged Dry Spell",
            description="Probability of consecutive dry days (daily rainfall < 2.5 mm for ≥3 days)",
            unit="probability",
            threshold=2.5,
            category="Agronomic Moisture Stress",
            version="v1.0-imd-kharif"
        ),
        ForecastTargetItem(
            target_type="MONSOON_ONSET",
            name="Monsoon Onset Surge",
            description="Probability of synoptic monsoon transition satisfying IMD regional rainfall criteria",
            unit="probability",
            threshold=1.0,
            category="Seasonal Synoptic Transition",
            version="v1.0-imd-kharif"
        ),
        ForecastTargetItem(
            target_type="FALSE_ONSET",
            name="False Onset Risk",
            description="Risk of early rainfall surge followed by an immediate multi-week break period",
            unit="probability",
            threshold=1.0,
            category="Risk Vulnerability",
            version="v1.0-imd-kharif"
        ),
        ForecastTargetItem(
            target_type="RAINFALL_AMOUNT",
            name="Cumulative Rainfall Amount",
            description="Expected cumulative precipitation over the forecast horizon",
            unit="mm",
            threshold=None,
            category="Quantitative Precipitation",
            version="v1.0-imd-kharif"
        ),
        ForecastTargetItem(
            target_type="RAINFALL_ANOMALY",
            name="Rainfall Departure Anomaly",
            description="Departure from 30-year WMO empirical climatological normals",
            unit="mm",
            threshold=0.0,
            category="Climate Anomaly",
            version="v1.0-imd-kharif"
        ),
    ]

    SUPPORTED_HORIZONS = [
        ForecastHorizonItem(
            horizon_days=1,
            horizon_label="1-Day Nowcast",
            description="Short-term immediate outlook for immediate field tasks",
            meteorological_scale="Micro-alpha / Meso-gamma",
            uncertainty_supported=True
        ),
        ForecastHorizonItem(
            horizon_days=3,
            horizon_label="3-Day Short-Range",
            description="Short-range outlook for tactical spraying and fertilizer decisions",
            meteorological_scale="Meso-beta synoptic",
            uncertainty_supported=True
        ),
        ForecastHorizonItem(
            horizon_days=7,
            horizon_label="7-Day Medium-Range",
            description="Primary operational weekly planning horizon for sowing and irrigation",
            meteorological_scale="Synoptic planetary wave",
            uncertainty_supported=True
        ),
        ForecastHorizonItem(
            horizon_days=14,
            horizon_label="14-Day Bi-Weekly",
            description="Sub-seasonal outlook for crop growth-stage monitoring",
            meteorological_scale="Sub-seasonal intra-monsoon",
            uncertainty_supported=True
        ),
        ForecastHorizonItem(
            horizon_days=21,
            horizon_label="21-Day Extended",
            description="Extended-range transition tracking driven by MJO wave passage",
            meteorological_scale="Intra-seasonal tropical oscillation",
            uncertainty_supported=False
        ),
        ForecastHorizonItem(
            horizon_days=30,
            horizon_label="30-Day Monthly",
            description="Monthly climate anomaly outlook modulated by ENSO and IOD states",
            meteorological_scale="Planetary climate teleconnection",
            uncertainty_supported=False
        ),
    ]

    @classmethod
    def get_status(cls) -> ForecastStatusResponse:
        total_fc = len(ForecastArtifactManager.list_forecasts(limit=500))
        return ForecastStatusResponse(
            service="varshasetu-forecast-engine",
            phase="PHASE_4E_OPERATIONAL_FORECAST_STAGE",
            operational_forecast_allowed=False,
            system_status="DIAGNOSTIC_ONLY",
            active_dataset="Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)",
            total_records=122,
            total_forecasts_generated=total_fc,
            message="Operational forecast product layer active with multi-gate validation and SHAP explainability.",
            scientific_disclosure=(
                "Historical ground observations currently reflect Kharif 2024 (1 season). "
                "Forecast products operate in DIAGNOSTIC_ONLY mode with full scientific lineage."
            )
        )

    @classmethod
    def get_availability(cls, block_id: str = "UP_LKO_BKT") -> ForecastAvailabilityResponse:
        df_features, _ = TreeTrainingPipeline.load_feature_matrix(block_id=block_id)
        return ForecastAvailabilityGate.evaluate(df_features, block_id=block_id)

    @classmethod
    def list_forecasts(
        cls,
        target: Optional[str] = None,
        horizon: Optional[int] = None,
        block_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> ForecastListResponse:
        records = ForecastArtifactManager.list_forecasts(
            target=target, horizon=horizon, block_id=block_id, status=status, limit=limit
        )

        # If empty on initial launch, generate baseline forecast for HEAVY_RAIN and RAINFALL_AMOUNT
        if not records:
            req_heavy = ForecastGenerateRequest(target_name="HEAVY_RAIN", horizon_days=7, block_id=block_id or "UP_LKO_BKT")
            req_amount = ForecastGenerateRequest(target_name="RAINFALL_AMOUNT", horizon_days=7, block_id=block_id or "UP_LKO_BKT")
            fc1 = ForecastGenerator.generate(req_heavy)
            fc2 = ForecastGenerator.generate(req_amount)
            records = [fc1, fc2]

        return ForecastListResponse(
            total_forecasts=len(records),
            forecasts=records
        )

    @classmethod
    def get_forecast(cls, forecast_id: str) -> Optional[ScientificForecastRecord]:
        return ForecastArtifactManager.get_forecast(forecast_id)

    @classmethod
    def get_explanation(cls, forecast_id: str) -> Optional[ForecastExplanationResponse]:
        record = ForecastArtifactManager.get_forecast(forecast_id)
        if not record:
            return None

        narrative = ForecastExplanationGenerator.generate_narrative(
            target_name=record.target.target_type,
            horizon_days=record.horizon.horizon_days,
            prediction_val=record.prediction.predicted_value,
            probability=record.prediction.probability,
            top_features=record.explainability.top_features,
            validation_status=record.validation.validation_status,
            calibration_status=record.calibration.status,
            data_freshness=record.data.freshness_status,
            block_id=record.location.block_id
        )

        evidence = {
            feat.feature: {
                "category": feat.category,
                "shap_value": feat.shap_value,
                "direction": feat.direction,
                "magnitude": feat.magnitude
            }
            for feat in record.explainability.top_features
        }

        return ForecastExplanationResponse(
            forecast_id=record.forecast_id,
            target_name=record.target.target_type,
            horizon_days=record.horizon.horizon_days,
            model_id=record.model.model_id,
            model_name=record.model.model_family,
            explainability_status=record.explainability.status,
            top_features=record.explainability.top_features,
            evidence_summary=evidence,
            deterministic_narrative=narrative,
            scientific_limitations=record.scientific_disclosure.messages
        )

    @classmethod
    def get_location_forecasts(cls, block_id: str = "UP_LKO_BKT") -> List[ScientificForecastRecord]:
        existing = ForecastArtifactManager.list_forecasts(block_id=block_id, limit=20)
        if existing:
            return existing

        # Generate standard portfolio for location
        results = []
        for target in ["HEAVY_RAIN", "DRY_SPELL", "RAINFALL_AMOUNT"]:
            req = ForecastGenerateRequest(target_name=target, horizon_days=7, block_id=block_id)
            results.append(ForecastGenerator.generate(req))
        return results

    @classmethod
    def generate_forecast(cls, request: ForecastGenerateRequest) -> ScientificForecastRecord:
        return ForecastGenerator.generate(request)

    @classmethod
    def get_history(cls, limit: int = 100) -> ForecastHistoryResponse:
        items = ForecastArtifactManager.get_history(limit=limit)
        return ForecastHistoryResponse(total=len(items), history=items)

    @classmethod
    def get_targets(cls) -> TargetListResponse:
        return TargetListResponse(targets=cls.SUPPORTED_TARGETS)

    @classmethod
    def get_horizons(cls) -> HorizonListResponse:
        return HorizonListResponse(horizons=cls.SUPPORTED_HORIZONS)
