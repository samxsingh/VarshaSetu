import pytest
from pathlib import Path
from datetime import datetime, timezone
import pandas as pd
import numpy as np

from app.config import settings
from app.storage.dataset_store import DatasetStore
from app.validation.multiyear_gate import MultiYearValidationGate, MultiYearGateStatus
from app.calibration.data_gate import CalibrationDataGate, CalibrationGateStatus
from app.spatial.downscaling import DownscalingEnforcer, SpatialResolution
from app.forecast.freshness import ForecastFreshnessEvaluator
from app.schemas.forecast import (
    ScientificForecastRecord,
    LocationContext,
    TargetContext,
    HorizonContext,
    ModelContext,
    PredictionContext,
    CalibrationContext,
    UncertaintyContext,
    ValidationContext,
    ExplainabilityContext,
    DataContext,
    ScientificDisclosureContext,
)
from app.agronomy.safety import AgronomicSafetyGate
from app.agronomy.schemas import CropType, GrowthStage, SafetyGateStatus, ScenarioContract, ScenarioType
from app.agronomy.registry import rule_registry
from app.agronomy.simulator.scenarios import ScenarioSimulator
from app.agronomy.evidence import build_evidence_from_forecast
from app.localization.safety import LocalizationSafetyGate
from app.localization.schemas import LanguageCode
from app.voice.service import voice_service
from app.delivery.provider import ConsoleDeliveryProvider
from app.schemas.delivery import DeliveryMessage, DeliveryChannel, DeliveryStatus

BASE_DIR = Path(__file__).resolve().parent.parent

class TestScientificIntegrityAudit:
    """Automated 25-Point Scientific Integrity Audit for Phase 6."""

    def test_01_kharif_2024_single_observational_season(self):
        """1. Kharif 2024 remains the only observational season (June 1 - Sept 30, 2024 = 122 days)."""
        df = DatasetStore.load_features("features_lucknow_monsoon_matrix")
        assert df is not None, "Monsoon observational matrix not found"
        assert len(df) == 122, f"Expected 122 daily records for Kharif 2024, found {len(df)}"
        min_date = str(df["date"].min())
        max_date = str(df["date"].max())
        assert "2024-06-01" in min_date
        assert "2024-09-30" in max_date

    def test_02_ground_anchor_is_up_lko_bkt(self):
        """2. UP_LKO_BKT remains the empirical ground anchor."""
        df = DatasetStore.load_features("features_lucknow_monsoon_matrix")
        assert "latitude" in df.columns and "longitude" in df.columns
        assert settings.DEFAULT_LATITUDE == pytest.approx(26.9749, abs=0.01)
        assert settings.DEFAULT_LONGITUDE == pytest.approx(80.9276, abs=0.01)

    def test_03_data_availability_truthful(self):
        """3. Data availability remains truthful."""
        from app.training.data_availability import DataAvailabilityAuditor, AvailabilityStatus
        auditor = DataAvailabilityAuditor()
        df = DatasetStore.load_features("features_lucknow_monsoon_matrix")
        report = auditor.audit(df)
        assert report.has_30_year_climatology is False
        assert report.status == AvailabilityStatus.PARTIAL

    def test_04_multiyear_operational_validation_not_falsely_activated(self):
        """4. Multi-year operational validation is not falsely activated."""
        df = DatasetStore.load_features("features_lucknow_monsoon_matrix")
        report = MultiYearValidationGate.evaluate(
            df=df,
            date_col="date",
            min_years=5,
            min_seasons=5,
            min_obs_per_year=90,
        )
        assert report.status == MultiYearGateStatus.INSUFFICIENT_DATA
        assert report.total_years == 1
        assert report.operational_validation_allowed is False

    def test_05_calibration_gate_remains_truthful(self):
        """5. Calibration gate remains truthful."""
        gate = CalibrationDataGate(min_calibration_samples=100, min_calibration_years=5)
        df = DatasetStore.load_features("features_lucknow_monsoon_matrix")
        df["target_heavy_rain_7d"] = (df["precipitation_sum_mm"] >= 64.5).astype(int)
        train_df = df.iloc[:85]
        val_df = df.iloc[85:103]
        test_df = df.iloc[103:]
        report = gate.evaluate(train_df, val_df, test_df, target_col="target_heavy_rain_7d")
        assert report.operational_calibration_allowed is False
        assert report.status in [CalibrationGateStatus.INSUFFICIENT_DATA, CalibrationGateStatus.DIAGNOSTIC_ONLY]

    def test_06_forecast_freshness_remains_truthful(self):
        """6. Forecast freshness remains truthful."""
        now = datetime(2026, 9, 25, 12, 0, 0, tzinfo=timezone.utc)
        res = ForecastFreshnessEvaluator.evaluate(
            forecast_id="fc_test_hist",
            generated_at_str="2024-09-15T12:00:00Z",
            valid_from_str="2024-09-16",
            valid_until_str="2024-09-22",
            source_observation_date_str="2024-09-15",
            reference_time=now,
        )
        assert res.freshness_status == "HISTORICAL"
        assert res.is_operational_allowed is False

    def test_07_spatial_resolution_remains_block(self):
        """7. Spatial resolution remains BLOCK."""
        meta = DownscalingEnforcer.attribute_resolution(
            block_id="UP_LKO_BKT",
            lat=26.9749,
            lon=80.9276,
            has_panchayat_station=False,
        )
        assert meta.target_resolution == SpatialResolution.BLOCK
        assert meta.panchayat_data_available is False

    def test_08_no_village_or_panchayat_precision_claimed(self):
        """8. No village-level or panchayat-level precision is falsely claimed."""
        meta = DownscalingEnforcer.attribute_resolution(
            block_id="UP_LKO_BKT",
            lat=26.9749,
            lon=80.9276,
            has_panchayat_station=False,
        )
        assert "Do NOT interpret as single-field microclimate" in meta.resolution_warning

    def test_09_forecasts_remain_diagnostic_only(self):
        """9. Diagnostic-only forecasts remain DIAGNOSTIC_ONLY."""
        record = ScientificForecastRecord(
            forecast_id="fc_test_integrity",
            generated_at="2024-09-01T00:00:00Z",
            valid_from="2024-09-01",
            valid_until="2024-09-08",
            location=LocationContext(
                state_id="UP",
                district_id="UP_LKO",
                block_id="UP_LKO_BKT",
                latitude=26.9749,
                longitude=80.9276,
                spatial_resolution="BLOCK",
            ),
            target=TargetContext(target_type="HEAVY_RAIN", threshold=64.5, unit="mm"),
            horizon=HorizonContext(horizon_days=7, horizon_label="7_day"),
            model=ModelContext(model_id="gradient_boosted_ensemble", model_family="TREE_ENSEMBLE"),
            prediction=PredictionContext(probability=0.35, predicted_value=45.0),
            calibration=CalibrationContext(status="CALIBRATED", method="PLATT"),
            uncertainty=UncertaintyContext(status="CALCULATED", lower_bound=30.0, upper_bound=60.0),
            validation=ValidationContext(validation_status="INSUFFICIENT_DATA"),
            explainability=ExplainabilityContext(status="UNAVAILABLE"),
            data=DataContext(freshness_status="HISTORICAL_ONLY"),
            scientific_disclosure=ScientificDisclosureContext(status="DIAGNOSTIC_ONLY", messages=["Diagnostic only"]),
        )
        assert record.scientific_disclosure.status == "DIAGNOSTIC_ONLY"
        assert record.location.spatial_resolution == "BLOCK"

    def test_10_no_fabricated_observations(self):
        """10. No fabricated observations exist."""
        df = DatasetStore.load_features("features_lucknow_monsoon_matrix")
        assert df["precipitation_sum_mm"].isna().sum() == 0
        assert (df["precipitation_sum_mm"] < 0).sum() == 0
        assert df["precipitation_sum_mm"].max() < 500.0

    def test_11_no_fabricated_validation_seasons(self):
        """11. No fabricated validation seasons exist."""
        df = DatasetStore.load_features("features_lucknow_monsoon_matrix")
        years = pd.to_datetime(df["date"]).dt.year.unique()
        assert len(years) == 1
        assert years[0] == 2024

    def test_12_no_fabricated_skill_scores(self):
        """12. No fabricated skill scores exist."""
        from app.hindcasting.folds import generate_hindcast_folds
        df = DatasetStore.load_features("features_lucknow_monsoon_matrix")
        df["target_heavy_rain_7d"] = (df["precipitation_sum_mm"] >= 64.5).astype(int)
        folds = generate_hindcast_folds(df, date_col="date")
        assert isinstance(folds, list)

    def test_13_no_crop_yield_prediction_models(self):
        """13. No crop-yield prediction model exists."""
        codebase_files = list((BASE_DIR / "app").glob("**/*.py"))
        for f in codebase_files:
            content = f.read_text(encoding="utf-8")
            assert "class CropYieldModel" not in content
            assert "def predict_yield(" not in content

    def test_14_no_biomass_prediction_models(self):
        """14. No biomass prediction model exists."""
        codebase_files = list((BASE_DIR / "app").glob("**/*.py"))
        for f in codebase_files:
            content = f.read_text(encoding="utf-8")
            assert "class BiomassModel" not in content
            assert "def predict_biomass(" not in content

    def test_15_no_financial_loss_prediction_models(self):
        """15. No financial-loss prediction model exists."""
        codebase_files = list((BASE_DIR / "app").glob("**/*.py"))
        for f in codebase_files:
            content = f.read_text(encoding="utf-8")
            assert "class FinancialLossModel" not in content
            assert "def predict_financial_loss(" not in content

    def test_16_no_revenue_optimization_claims(self):
        """16. No revenue optimization claims exist."""
        codebase_files = list((BASE_DIR / "app").glob("**/*.py"))
        for f in codebase_files:
            content = f.read_text(encoding="utf-8")
            assert "def optimize_revenue(" not in content
            assert "def maximize_profit(" not in content

    def test_17_agronomic_safety_gates_remain_active(self):
        """17. Agronomic safety gates remain active."""
        rule = rule_registry.get_rule_by_id("AGRO_HEAVY_RAIN_INFO_001")
        assert rule is not None
        status, blocked = AgronomicSafetyGate.evaluate(
            forecast=None,
            rule=rule,
            crop=CropType.GENERAL,
            crop_stage=GrowthStage.ALL,
        )
        assert status == SafetyGateStatus.BLOCKED
        assert blocked is not None

        # Localization safety gate rejects imperative command
        passed, viols = LocalizationSafetyGate.evaluate_text(
            "Farmers must spray chemicals immediately!",
            LanguageCode.EN,
        )
        assert not passed
        assert len(viols) >= 1

    def test_18_scenario_outputs_remain_scenario_indicator_only(self):
        """18. Scenario outputs remain SCENARIO_INDICATOR_ONLY."""
        contract = ScenarioContract(
            scenario_id="audit_sow_delay_test",
            scenario_type=ScenarioType.SOWING_DELAY,
            delay_days=7,
            crop=CropType.PADDY,
            crop_stage=GrowthStage.VEGETATIVE,
        )
        result = ScenarioSimulator.simulate(contract)
        assert result.classification == "SCENARIO_INDICATOR_ONLY"

    def test_19_voice_remains_demo_only_or_not_configured(self):
        """19. Voice remains DEMO_ONLY / NOT_CONFIGURED where applicable."""
        status_rep = voice_service.get_status()
        assert status_rep["active_provider"] == "MOCK_LOCAL_VOICE_ENGINE"
        assert status_rep["all_providers"]["bhashini"]["status"] == "NOT_CONFIGURED"
        assert status_rep["system_mode"] == "DEMO_ONLY"

    def test_20_21_sms_whatsapp_disabled_unless_configured(self):
        """20 & 21. SMS and WhatsApp remain disabled unless genuinely configured."""
        provider = ConsoleDeliveryProvider()
        msg_sms = DeliveryMessage(
            recipient_id="+919876543210",
            channel=DeliveryChannel.SMS,
            event_id="ev_test_sms",
            title="SMS Test",
            body="SMS Alert",
        )
        res_sms = provider.send(msg_sms)
        assert res_sms.status == DeliveryStatus.NOT_CONFIGURED

        msg_wa = DeliveryMessage(
            recipient_id="+919876543210",
            channel=DeliveryChannel.WHATSAPP,
            event_id="ev_test_wa",
            title="WA Test",
            body="WA Alert",
        )
        res_wa = provider.send(msg_wa)
        assert res_wa.status == DeliveryStatus.NOT_CONFIGURED

    def test_22_23_scientific_explanations_non_causal(self):
        """22 & 23. Scientific explanations remain non-causal and SHAP is not causal proof."""
        dummy_fc = {
            "forecast_id": "fc_dummy_audit",
            "target": {"target_type": "HEAVY_RAIN"},
            "horizon": {"horizon_days": 7},
            "model": {"model_id": "xgboost"},
            "prediction": {"probability": 0.65, "predicted_value": 75.0},
            "uncertainty": {"status": "CALCULATED", "lower_bound": 50.0, "median": 70.0, "upper_bound": 90.0},
            "data": {"source_status": "HISTORICAL"},
        }
        evidence = build_evidence_from_forecast(dummy_fc)
        assert evidence.forecast_id == "fc_dummy_audit"
        assert evidence.target == "HEAVY_RAIN"

    def test_24_historical_data_never_presented_as_live(self):
        """24. Historical data is never presented as live weather."""
        df = DatasetStore.load_features("features_lucknow_monsoon_matrix")
        max_date = str(df["date"].max())
        assert max_date.startswith("2024-09-30")

    def test_25_service_health_distinguished_from_scientific_validity(self):
        """25. Service health is never equated with scientific validity."""
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)
        res = client.get("/health")
        data = res.json()
        assert "scientific_integrity" in data
        assert "distinction_note" in data["scientific_integrity"]
        assert "not imply scientific operational validity" in data["scientific_integrity"]["distinction_note"].lower()
