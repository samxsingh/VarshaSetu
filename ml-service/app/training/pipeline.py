import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from ..config import settings
from ..features.engineer import FeatureEngineer
from ..features.registry import FEATURE_REGISTRY
from ..validation.dataset_quality import DatasetQualityAuditor, TrainingDatasetQualityAudit
from ..training.splitter import ChronologicalSplitter, DatasetSplits
from ..training.leakage import LeakageAuditor
from ..baselines.climatology import ClimatologyEngine, ClimatologyBaselineResult
from ..models.baseline.logistic import BaselineLogisticModel
from ..models.baseline.regression import BaselineRegressionModel
from ..models.calibration import ProbabilityCalibrator
from ..evaluation.metrics import MetricsEvaluator, BinaryEvaluationReport, ContinuousEvaluationReport
from ..evaluation.comparison import BaselineComparator, BaselineComparisonReport
from ..experiments.registry import ExperimentRegistry, ExperimentRecord

class BaselineTrainingPipeline:
    """
    End-to-End Baseline Training, Evaluation, and Comparison Pipeline.
    Orchestrates causal dataset preparation, baseline modeling, climatological skill comparison,
    and experiment registration.
    """

    FEATURE_COLS = [
        "rainfall_1d", "rainfall_3d", "rainfall_7d", "rainfall_14d",
        "rainy_days_7d", "consecutive_dry_days", "consecutive_wet_days",
        "temperature_2m_max_c", "temperature_2m_min_c", "diurnal_temp_range_c",
        "surface_pressure_hpa", "wind_speed_10m_mps",
        "mjo_amplitude", "mjo_phase",
        "nino34_anomaly", "iod_dmi",
        "day_of_year", "sin_doy", "cos_doy"
    ]

    @classmethod
    def load_clean_dataset(cls) -> pd.DataFrame:
        """Load and merge Phase 3 processed datasets into a unified feature matrix."""
        weather_path = settings.PROCESSED_DATA_DIR / "weather_lucknow_observations.parquet"
        enso_path = settings.PROCESSED_DATA_DIR / "climate_enso_nino34.parquet"
        iod_path = settings.PROCESSED_DATA_DIR / "climate_iod_dmi.parquet"
        mjo_path = settings.PROCESSED_DATA_DIR / "climate_mjo_rmm.parquet"

        if not weather_path.exists():
            raise FileNotFoundError(f"Weather dataset not found at {weather_path}. Ingestion required.")

        weather_df = pd.read_parquet(weather_path)
        enso_df = pd.read_parquet(enso_path) if enso_path.exists() else None
        iod_df = pd.read_parquet(iod_path) if iod_path.exists() else None
        mjo_df = pd.read_parquet(mjo_path) if mjo_path.exists() else None

        df_features = FeatureEngineer.generate_features(
            weather_df=weather_df,
            enso_df=enso_df,
            iod_df=iod_df,
            mjo_df=mjo_df,
            include_targets=True
        )
        return df_features

    @classmethod
    def run_binary_baseline(
        cls,
        target_name: str = "HEAVY_RAIN",
        horizon_days: int = 7,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15
    ) -> Dict[str, Any]:
        """Train and evaluate a Logistic Regression baseline against Climatology."""
        df = cls.load_clean_dataset()
        target_col = f"target_{target_name.lower()}_{horizon_days}d"

        if target_col not in df.columns:
            raise ValueError(f"Target column '{target_col}' not found in engineered dataset.")

        # Drop trailing rows where future target cannot be observed
        valid_df = df.dropna(subset=[target_col]).reset_index(drop=True)

        # Audit dataset quality
        quality_audit = DatasetQualityAuditor.audit_dataset(
            valid_df,
            dataset_name=f"lucknow_{target_name.lower()}_{horizon_days}d",
            feature_cols=[c for c in cls.FEATURE_COLS if c in valid_df.columns],
            target_cols=[target_col]
        )

        # Chronological splits
        splits: DatasetSplits = ChronologicalSplitter.split_by_ratio(
            valid_df, train_ratio=train_ratio, val_ratio=val_ratio, test_ratio=test_ratio
        )

        # Available feature columns
        avail_features = [c for c in cls.FEATURE_COLS if c in valid_df.columns]

        # Audit feature matrix for target leakage
        LeakageAuditor.audit_feature_matrix_for_target_leakage(avail_features, target_col)

        X_train = splits.train[avail_features]
        y_train = splits.train[target_col]
        X_val = splits.val[avail_features]
        y_val = splits.val[target_col]
        X_test = splits.test[avail_features]
        y_test = splits.test[target_col]

        # 1. Climatological Baseline
        clim_res = ClimatologyEngine.get_target_climatology(
            splits.train, target_name=target_name, horizon_days=horizon_days
        )
        clim_prob = clim_res.baseline_probability if clim_res.baseline_probability is not None else 0.0

        # 2. Train Logistic Regression Model
        model = BaselineLogisticModel(
            target_name=target_name,
            horizon_days=horizon_days,
            l2_penalty=0.1
        )
        model.fit(X_train, y_train, training_period=f"{splits.train_dates[0]} to {splits.train_dates[1]}")

        # 3. Validation Evaluation & Calibration
        val_probs = model.predict_proba(X_val)
        val_eval = MetricsEvaluator.evaluate_binary(
            y_true=y_val.to_numpy(),
            y_prob=val_probs,
            evaluation_period=f"{splits.val_dates[0]} to {splits.val_dates[1]}"
        )

        # Fit probability calibrator
        calibrator = ProbabilityCalibrator(method="PLATT_SCALING")
        calibrator.fit(val_probs, y_val.to_numpy())

        # 4. Test Evaluation
        test_probs = model.predict_proba(X_test)
        test_eval = MetricsEvaluator.evaluate_binary(
            y_true=y_test.to_numpy(),
            y_prob=test_probs,
            evaluation_period=f"{splits.test_dates[0]} to {splits.test_dates[1]}"
        )

        # 5. Skill Comparison vs Climatology on Test Set
        comparison = BaselineComparator.compare_binary(
            y_true=y_test.to_numpy(),
            model_prob=test_probs,
            climatology_prob=clim_prob,
            model_name=f"LogisticRegressionBaseline_{target_name}",
            target_name=target_name,
            horizon_days=horizon_days,
            evaluation_period=f"{splits.test_dates[0]} to {splits.test_dates[1]}"
        )

        # 6. Save Model Metadata
        model_meta = model.get_metadata()
        meta_file = settings.METRICS_DIR / f"{model_meta.model_id}_metadata.json"
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(model_meta.model_dump(mode="json"), f, indent=2)

        # 7. Record Experiment
        exp_record = ExperimentRegistry.record_experiment(
            model_name="LogisticRegressionBaseline",
            target_name=target_name,
            horizon_days=horizon_days,
            training_period=f"{splits.train_dates[0]} to {splits.train_dates[1]}",
            validation_period=f"{splits.val_dates[0]} to {splits.val_dates[1]}",
            test_period=f"{splits.test_dates[0]} to {splits.test_dates[1]}",
            metrics={
                "validation": val_eval.model_dump(mode="json"),
                "test": test_eval.model_dump(mode="json")
            },
            comparison_to_climatology=comparison.model_dump(mode="json"),
            calibration_status=calibrator.status,
            geography="UP_LKO_BKT",
            status="EVALUATED",
            notes=calibrator.notes
        )

        return {
            "experiment_id": exp_record.experiment_id,
            "target": target_name,
            "horizon_days": horizon_days,
            "quality_audit": quality_audit.model_dump(mode="json"),
            "climatology_baseline": clim_res.model_dump(mode="json"),
            "model_metadata": model_meta.model_dump(mode="json"),
            "validation_metrics": val_eval.model_dump(mode="json"),
            "test_metrics": test_eval.model_dump(mode="json"),
            "comparison": comparison.model_dump(mode="json"),
            "calibration_status": calibrator.status
        }

    @classmethod
    def run_continuous_baseline(
        cls,
        target_name: str = "rainfall_amount",
        horizon_days: int = 7,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15
    ) -> Dict[str, Any]:
        """Train and evaluate Ridge Regression continuous baseline against Climatology."""
        df = cls.load_clean_dataset()
        target_col = f"target_rain_sum_{horizon_days}d"

        if target_col not in df.columns:
            raise ValueError(f"Target column '{target_col}' not found in engineered dataset.")

        valid_df = df.dropna(subset=[target_col]).reset_index(drop=True)

        splits: DatasetSplits = ChronologicalSplitter.split_by_ratio(
            valid_df, train_ratio=train_ratio, val_ratio=val_ratio, test_ratio=test_ratio
        )

        avail_features = [c for c in cls.FEATURE_COLS if c in valid_df.columns]
        LeakageAuditor.audit_feature_matrix_for_target_leakage(avail_features, target_col)

        X_train = splits.train[avail_features]
        y_train = splits.train[target_col]
        X_val = splits.val[avail_features]
        y_val = splits.val[target_col]
        X_test = splits.test[avail_features]
        y_test = splits.test[target_col]

        # Climatology Baseline
        clim_res = ClimatologyEngine.get_target_climatology(
            splits.train, target_name="RAINFALL_ANOMALY", horizon_days=horizon_days
        )
        clim_exp = clim_res.baseline_expected_value if clim_res.baseline_expected_value is not None else 0.0

        # Train Ridge Regression
        model = BaselineRegressionModel(
            target_name=target_name,
            horizon_days=horizon_days,
            alpha=1.0,
            non_negative=True
        )
        model.fit(X_train, y_train, training_period=f"{splits.train_dates[0]} to {splits.train_dates[1]}")

        test_preds = model.predict(X_test)
        test_eval = MetricsEvaluator.evaluate_continuous(
            y_true=y_test.to_numpy(),
            y_pred=test_preds,
            evaluation_period=f"{splits.test_dates[0]} to {splits.test_dates[1]}"
        )

        comparison = BaselineComparator.compare_continuous(
            y_true=y_test.to_numpy(),
            model_pred=test_preds,
            climatology_val=clim_exp,
            model_name=f"RidgeRegressionBaseline_{target_name}",
            target_name=target_name,
            horizon_days=horizon_days,
            evaluation_period=f"{splits.test_dates[0]} to {splits.test_dates[1]}"
        )

        model_meta = model.get_metadata()
        exp_record = ExperimentRegistry.record_experiment(
            model_name="RidgeRegressionBaseline",
            target_name=target_name,
            horizon_days=horizon_days,
            training_period=f"{splits.train_dates[0]} to {splits.train_dates[1]}",
            validation_period=f"{splits.val_dates[0]} to {splits.val_dates[1]}",
            test_period=f"{splits.test_dates[0]} to {splits.test_dates[1]}",
            metrics={"test": test_eval.model_dump(mode="json")},
            comparison_to_climatology=comparison.model_dump(mode="json"),
            calibration_status="NOT_APPLICABLE",
            geography="UP_LKO_BKT",
            status="EVALUATED"
        )

        return {
            "experiment_id": exp_record.experiment_id,
            "target": target_name,
            "horizon_days": horizon_days,
            "climatology_baseline": clim_res.model_dump(mode="json"),
            "model_metadata": model_meta.model_dump(mode="json"),
            "test_metrics": test_eval.model_dump(mode="json"),
            "comparison": comparison.model_dump(mode="json")
        }
