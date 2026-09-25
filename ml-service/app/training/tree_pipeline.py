"""
VarshaSetu - Tree Ensemble Training & Multi-Model Benchmark Pipeline
Orchestrates chronological training, leakage verification, XGBoost/LightGBM modeling,
probability calibration, SHAP explainability, and multi-paradigm benchmarking
(Climatology vs Linear Baseline vs XGBoost vs LightGBM) on identical test slices.
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np

from ..config import settings
from ..features.engineer import FeatureEngineer
from ..training.splitter import ChronologicalSplitter, DatasetSplits
from ..training.leakage import LeakageAuditor
from ..training.data_availability import DataAvailabilityAuditor, DataAvailabilityReport, AvailabilityStatus
from ..baselines.climatology import ClimatologyEngine
from ..models.baseline.logistic import BaselineLogisticModel
from ..models.baseline.regression import BaselineRegressionModel
from ..models.tree.config import TreeModelConfig
from ..models.tree.metadata import TreeModelMetadata
from ..models.tree.xgboost_model import XGBoostTreeModel
from ..models.tree.lightgbm_model import LightGBMTreeModel
from ..models.calibration import ProbabilityCalibrator
from ..spatial.features import compute_spatial_features
from ..spatial.downscaling import DownscalingEnforcer, SpatialResolution
from ..explainability.shap_explainer import TreeShapExplainer
from ..explainability.schemas import ModelGlobalExplainabilityReport, ShapExplanationReport
from ..evaluation.benchmark import MultiModelBenchmarkComparator, MultiModelBenchmarkReport
from ..experiments.registry import ExperimentRegistry, ExperimentRecord


class TreeTrainingPipeline:
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
    def load_feature_matrix(cls, block_id: str = "UP_LKO_BKT") -> Tuple[pd.DataFrame, DataAvailabilityReport]:
        weather_path = settings.PROCESSED_DATA_DIR / "weather_lucknow_observations.parquet"
        enso_path = settings.PROCESSED_DATA_DIR / "climate_enso_nino34.parquet"
        iod_path = settings.PROCESSED_DATA_DIR / "climate_iod_dmi.parquet"
        mjo_path = settings.PROCESSED_DATA_DIR / "climate_mjo_rmm.parquet"

        if not weather_path.exists():
            raise FileNotFoundError(f"Weather dataset not found at {weather_path}.")

        weather_df = pd.read_parquet(weather_path)
        enso_df = pd.read_parquet(enso_path) if enso_path.exists() else None
        iod_df = pd.read_parquet(iod_path) if iod_path.exists() else None
        mjo_df = pd.read_parquet(mjo_path) if mjo_path.exists() else None

        # Data availability audit on raw weather observations
        auditor = DataAvailabilityAuditor()
        audit_report = auditor.audit(weather_df, date_col="date", spatial_col="block_id")

        # Generate causal features
        df_features = FeatureEngineer.generate_features(
            weather_df=weather_df,
            enso_df=enso_df,
            iod_df=iod_df,
            mjo_df=mjo_df,
            include_targets=True
        )

        # Inject spatial coordinates for block
        try:
            sp_feats = compute_spatial_features(block_id)
            for k, v in sp_feats.items():
                df_features[k] = v
        except Exception:
            pass

        return df_features, audit_report

    @classmethod
    def run_benchmark(
        cls,
        target_name: str = "HEAVY_RAIN",
        horizon_days: int = 7,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
        block_id: str = "UP_LKO_BKT"
    ) -> Dict[str, Any]:
        """
        Runs comprehensive multi-paradigm benchmark:
        Climatology vs Linear Baseline vs XGBoost vs LightGBM.
        """
        df_features, audit_report = cls.load_feature_matrix(block_id=block_id)

        is_classification = target_name.upper() in ["HEAVY_RAIN", "DRY_SPELL", "MONSOON_SURGE", "WET_DAY"]
        task_type = "classification" if is_classification else "regression"

        if target_name.upper() in ["RAINFALL_AMOUNT", "RAIN_SUM", "CUMULATIVE_RAINFALL"]:
            target_col = f"target_rain_sum_{horizon_days}d"
        elif target_name.upper() in ["HEAVY_RAIN", "DRY_SPELL", "MONSOON_SURGE"]:
            target_col = f"target_{target_name.lower()}_{horizon_days}d"
        else:
            target_col = f"target_{target_name.lower()}_{horizon_days}d"

        if target_col not in df_features.columns:
            raise ValueError(f"Target column '{target_col}' not found in feature matrix.")

        # Drop trailing unobservable rows
        valid_df = df_features.dropna(subset=[target_col]).reset_index(drop=True)

        # Chronological splits
        splits: DatasetSplits = ChronologicalSplitter.split_by_ratio(
            valid_df, train_ratio=train_ratio, val_ratio=val_ratio, test_ratio=test_ratio
        )

        # Features list
        spatial_cols = [c for c in valid_df.columns if c.startswith("spatial_")]
        avail_features = [c for c in cls.FEATURE_COLS if c in valid_df.columns] + spatial_cols

        # Verify zero leakage
        LeakageAuditor.audit_chronological_splits(splits.train, splits.val, splits.test, date_col="date")
        LeakageAuditor.audit_feature_matrix_for_target_leakage(avail_features, target_col)

        X_train = splits.train[avail_features]
        y_train = splits.train[target_col]
        X_val = splits.val[avail_features]
        y_val = splits.val[target_col]
        X_test = splits.test[avail_features]
        y_test = splits.test[target_col]

        eval_period = f"{splits.test_dates[0]} to {splits.test_dates[1]}"
        predictions_map: Dict[str, Dict[str, Any]] = {}

        # -------------------------------------------------------------
        # 1. Climatological Baseline
        # -------------------------------------------------------------
        clim_res = ClimatologyEngine.get_target_climatology(
            splits.train, target_name=target_name, horizon_days=horizon_days
        )
        if is_classification:
            clim_prob = clim_res.baseline_probability if clim_res.baseline_probability is not None else 0.0
            predictions_map["climatology"] = {
                "name": "Historical Climatology Frequency",
                "prob": clim_prob,
                "is_calibrated": True
            }
        else:
            clim_val = clim_res.baseline_expected_value if clim_res.baseline_expected_value is not None else 0.0
            predictions_map["climatology"] = {
                "name": "Historical Climatology Mean",
                "pred": clim_val,
                "is_calibrated": True
            }

        # -------------------------------------------------------------
        # 2. Phase 4A Linear/Logistic Baseline
        # -------------------------------------------------------------
        if is_classification:
            linear_model = BaselineLogisticModel(target_name=target_name, horizon_days=horizon_days, l2_penalty=0.1)
            linear_model.fit(X_train, y_train, training_period=f"{splits.train_dates[0]} to {splits.train_dates[1]}")
            raw_val_prob = linear_model.predict_proba(X_val)
            raw_test_prob = linear_model.predict_proba(X_test)

            calibrator = ProbabilityCalibrator(method="PLATT_SCALING")
            calibrator.fit(raw_val_prob, y_val.values)
            if calibrator.is_fitted:
                cal_test_prob = np.array([calibrator.calibrate(p).calibrated_probability for p in raw_test_prob])
            else:
                cal_test_prob = raw_test_prob

            predictions_map["baseline_logistic"] = {
                "name": "Phase 4A Regularized Logistic Regression",
                "prob": cal_test_prob,
                "is_calibrated": calibrator.is_fitted
            }
        else:
            regr_model = BaselineRegressionModel(target_name=target_name, horizon_days=horizon_days, alpha=1.0)
            regr_model.fit(X_train, y_train, training_period=f"{splits.train_dates[0]} to {splits.train_dates[1]}")
            regr_pred = regr_model.predict(X_test)
            predictions_map["baseline_ridge"] = {
                "name": "Phase 4A Ridge Regression Baseline",
                "pred": regr_pred,
                "is_calibrated": False
            }

        # -------------------------------------------------------------
        # 3. XGBoost Ensemble
        # -------------------------------------------------------------
        xgb_cfg = TreeModelConfig(
            model_type="xgboost",
            task_type=task_type,
            n_estimators=50,
            max_depth=3,
            learning_rate=0.03,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.0
        )
        xgb_model = XGBoostTreeModel(
            config=xgb_cfg,
            target_name=target_name,
            model_id=f"xgboost_{target_name.lower()}_{horizon_days}d"
        )
        xgb_model.fit(X_train, y_train, X_val, y_val)

        if is_classification:
            xgb_val_prob = xgb_model.predict_proba(X_val)[:, 1]
            xgb_test_prob = xgb_model.predict_proba(X_test)[:, 1]

            xgb_calibrator = ProbabilityCalibrator(method="PLATT_SCALING")
            xgb_calibrator.fit(xgb_val_prob, y_val.values)
            if xgb_calibrator.is_fitted:
                xgb_final_prob = np.array([xgb_calibrator.calibrate(p).calibrated_probability for p in xgb_test_prob])
            else:
                xgb_final_prob = xgb_test_prob

            predictions_map["xgboost"] = {
                "name": "XGBoost Gradient Boosted Trees",
                "prob": xgb_final_prob,
                "is_calibrated": xgb_calibrator.is_fitted
            }
        else:
            xgb_test_pred = xgb_model.predict(X_test)
            predictions_map["xgboost"] = {
                "name": "XGBoost Regressor Trees",
                "pred": xgb_test_pred,
                "is_calibrated": False
            }

        # -------------------------------------------------------------
        # 4. LightGBM Ensemble
        # -------------------------------------------------------------
        lgb_cfg = TreeModelConfig(
            model_type="lightgbm",
            task_type=task_type,
            n_estimators=50,
            max_depth=3,
            learning_rate=0.03,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.0
        )
        lgb_model = LightGBMTreeModel(
            config=lgb_cfg,
            target_name=target_name,
            model_id=f"lightgbm_{target_name.lower()}_{horizon_days}d"
        )
        lgb_model.fit(X_train, y_train, X_val, y_val)

        if is_classification:
            lgb_val_prob = lgb_model.predict_proba(X_val)[:, 1]
            lgb_test_prob = lgb_model.predict_proba(X_test)[:, 1]

            lgb_calibrator = ProbabilityCalibrator(method="PLATT_SCALING")
            lgb_calibrator.fit(lgb_val_prob, y_val.values)
            if lgb_calibrator.is_fitted:
                lgb_final_prob = np.array([lgb_calibrator.calibrate(p).calibrated_probability for p in lgb_test_prob])
            else:
                lgb_final_prob = lgb_test_prob

            predictions_map["lightgbm"] = {
                "name": "LightGBM Gradient Boosted Trees",
                "prob": lgb_final_prob,
                "is_calibrated": lgb_calibrator.is_fitted
            }
        else:
            lgb_test_pred = lgb_model.predict(X_test)
            predictions_map["lightgbm"] = {
                "name": "LightGBM Regressor Trees",
                "pred": lgb_test_pred,
                "is_calibrated": False
            }

        # -------------------------------------------------------------
        # 5. Multi-Model Benchmark Evaluation
        # -------------------------------------------------------------
        if is_classification:
            benchmark_report = MultiModelBenchmarkComparator.evaluate_classification(
                target_name=target_name,
                horizon_days=horizon_days,
                evaluation_period=eval_period,
                y_true=y_test.values,
                predictions_map=predictions_map
            )
        else:
            benchmark_report = MultiModelBenchmarkComparator.evaluate_regression(
                target_name=target_name,
                horizon_days=horizon_days,
                evaluation_period=eval_period,
                y_true=y_test.values,
                predictions_map=predictions_map
            )

        # -------------------------------------------------------------
        # 6. SHAP Explainability for Tree Ensembles
        # -------------------------------------------------------------
        xgb_global_exp = TreeShapExplainer.explain_global(xgb_model, X_test)
        xgb_sample_exp = TreeShapExplainer.explain_sample(xgb_model, X_test, sample_index=0)

        lgb_global_exp = TreeShapExplainer.explain_global(lgb_model, X_test)
        lgb_sample_exp = TreeShapExplainer.explain_sample(lgb_model, X_test, sample_index=0)

        # Save SHAP artifacts
        exp_dir = settings.ARTIFACTS_DIR / "explanations"
        exp_dir.mkdir(parents=True, exist_ok=True)
        with open(exp_dir / f"{xgb_model.model_id}_global.json", "w") as f:
            f.write(xgb_global_exp.model_dump_json(indent=2))
        with open(exp_dir / f"{lgb_model.model_id}_global.json", "w") as f:
            f.write(lgb_global_exp.model_dump_json(indent=2))

        # -------------------------------------------------------------
        # 7. Spatial Resolution Attribution
        # -------------------------------------------------------------
        downscaling_meta = DownscalingEnforcer.attribute_resolution(
            block_id=block_id,
            lat=26.9749,
            lon=80.9276,
            has_panchayat_station=False
        )

        # -------------------------------------------------------------
        # 8. Save Models & Register Experiment
        # -------------------------------------------------------------
        models_dir = settings.ARTIFACTS_DIR / "models"
        models_dir.mkdir(parents=True, exist_ok=True)

        xgb_model.metadata = TreeModelMetadata(
            model_id=xgb_model.model_id,
            target_name=target_name,
            model_type="xgboost",
            task_type=task_type,
            status="trained",
            config=xgb_cfg,
            feature_names=avail_features,
            target_event_count=int(y_train.sum()) if is_classification else len(y_train),
            train_sample_count=len(X_train),
            val_sample_count=len(X_val),
            test_sample_count=len(X_test),
            is_calibrated=predictions_map["xgboost"].get("is_calibrated", False),
            feature_importances=xgb_model.get_feature_importances(),
            model_path=str(models_dir / f"{xgb_model.model_id}.joblib"),
            data_availability_status=audit_report.status.value
        )
        xgb_model.save(str(models_dir / f"{xgb_model.model_id}.joblib"))

        lgb_model.metadata = TreeModelMetadata(
            model_id=lgb_model.model_id,
            target_name=target_name,
            model_type="lightgbm",
            task_type=task_type,
            status="trained",
            config=lgb_cfg,
            feature_names=avail_features,
            target_event_count=int(y_train.sum()) if is_classification else len(y_train),
            train_sample_count=len(X_train),
            val_sample_count=len(X_val),
            test_sample_count=len(X_test),
            is_calibrated=predictions_map["lightgbm"].get("is_calibrated", False),
            feature_importances=lgb_model.get_feature_importances(),
            model_path=str(models_dir / f"{lgb_model.model_id}.joblib"),
            data_availability_status=audit_report.status.value
        )
        lgb_model.save(str(models_dir / f"{lgb_model.model_id}.joblib"))

        # Register experiment
        val_period = f"{splits.val_dates[0]} to {splits.val_dates[1]}"
        ExperimentRegistry.record_experiment(
            model_name="TreeEnsembleBenchmark",
            target_name=target_name,
            horizon_days=horizon_days,
            training_period=f"{splits.train_dates[0]} to {splits.train_dates[1]}",
            validation_period=val_period,
            test_period=eval_period,
            geography=block_id,
            metrics={
                "climatology_val": benchmark_report.climatology_reference_val,
                "models_evaluated": len(benchmark_report.models),
                "benchmark_results": [m.model_dump() for m in benchmark_report.models]
            },
            comparison_to_climatology={"status": "multi_model_benchmark_completed"},
            calibration_status="CALIBRATED" if predictions_map["xgboost"].get("is_calibrated") else "NOT_CALIBRATED",
            status="EVALUATED",
            notes=f"Audited status: {audit_report.status.value}. Evaluated on identical test partition."
        )

        return {
            "target_name": target_name,
            "horizon_days": horizon_days,
            "task_type": task_type,
            "data_availability": audit_report.model_dump(),
            "downscaling_resolution": downscaling_meta.model_dump(),
            "benchmark_report": benchmark_report.model_dump(),
            "shap_explainability": {
                "xgboost": {
                    "global": xgb_global_exp.model_dump(),
                    "sample": xgb_sample_exp.model_dump()
                },
                "lightgbm": {
                    "global": lgb_global_exp.model_dump(),
                    "sample": lgb_sample_exp.model_dump()
                }
            },
            "models_saved": [
                xgb_model.model_id,
                lgb_model.model_id
            ]
        }
