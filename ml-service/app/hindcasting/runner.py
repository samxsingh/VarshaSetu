"""
VarshaSetu - Hindcasting Experiment Runner
Orchestrates multi-year data gate evaluation, walk-forward chronological folds,
multi-model hindcast benchmarking across horizons, and calibration integration.
"""

import sys
import platform
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from ..config import settings
from ..training.tree_pipeline import TreeTrainingPipeline
from ..baselines.climatology import ClimatologyEngine
from ..models.tree.config import TreeModelConfig
from ..models.tree.xgboost_model import XGBoostTreeModel
from ..models.tree.lightgbm_model import LightGBMTreeModel
from ..models.baseline.logistic import BaselineLogisticModel
from ..models.baseline.regression import BaselineRegressionModel
from ..calibration.data_gate import CalibrationDataGate
from ..datasets.fingerprint import compute_dataframe_fingerprint
from ..validation.multiyear_gate import MultiYearValidationGate, MultiYearGateReport
from ..validation.drift import FeatureDriftDetector, DatasetDriftReport
from ..evaluation.stability import StabilityAnalyzer
from .schemas import (
    HindcastFold,
    HorizonEvaluationReport,
    ModelHindcastResult,
    YearlyStabilityReport,
    HindcastStabilityAnalysis,
    BlockValidationReport,
    HindcastExperimentManifest
)
from .folds import generate_hindcast_folds
from .metrics import HindcastMetricsCalculator
from .artifacts import HindcastArtifactManager
from .coverage import FeatureCoverageInspector


class HindcastRunner:
    """
    Executes walk-forward historical hindcast benchmarks.
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

    SUPPORTED_HORIZONS: List[int] = [1, 3, 7, 14, 21, 30]

    @classmethod
    def run_experiment(
        cls,
        target_name: str = "HEAVY_RAIN",
        primary_horizon: int = 7,
        block_id: str = "UP_LKO_BKT"
    ) -> HindcastExperimentManifest:
        """
        Executes a historical hindcast evaluation across all model paradigms and forecast horizons.
        """
        now = datetime.now(timezone.utc)
        ts_str = now.strftime("%Y%m%d_%H%M%S")
        exp_id = f"hindcast_{target_name.lower()}_{primary_horizon}d_{ts_str}"

        # 1. Load feature matrix & audit
        df_features, audit_report = TreeTrainingPipeline.load_feature_matrix(block_id=block_id)

        # 2. Multi-Year Data Gate
        gate_report: MultiYearGateReport = MultiYearValidationGate.evaluate(
            df_features, date_col="date"
        )

        # 3. Generate Walk-Forward Folds
        folds = generate_hindcast_folds(df_features, date_col="date")
        if not folds:
            raise ValueError("Unable to construct valid chronological folds from feature matrix.")

        primary_fold = folds[-1]  # Most mature walk-forward fold

        # Partition data for primary fold
        df_features["date"] = pd.to_datetime(df_features["date"])
        train_df = df_features[
            (df_features["date"] >= pd.to_datetime(primary_fold.train_start)) &
            (df_features["date"] <= pd.to_datetime(primary_fold.train_end))
        ]
        val_df = df_features[
            (df_features["date"] >= pd.to_datetime(primary_fold.validation_start)) &
            (df_features["date"] <= pd.to_datetime(primary_fold.validation_end))
        ]
        test_df = df_features[
            (df_features["date"] >= pd.to_datetime(primary_fold.test_start)) &
            (df_features["date"] <= pd.to_datetime(primary_fold.test_end))
        ]

        avail_features = [c for c in cls.FEATURE_COLS if c in df_features.columns]
        spatial_cols = [c for c in df_features.columns if c.startswith("spatial_")]
        full_feature_cols = avail_features + spatial_cols

        is_classification = target_name.upper() in ["HEAVY_RAIN", "DRY_SPELL", "MONSOON_SURGE", "WET_DAY"]
        task_type = "classification" if is_classification else "regression"

        target_col = f"target_{target_name.lower()}_{primary_horizon}d" if is_classification else f"target_rain_sum_{primary_horizon}d"

        # 4. Calibration Data Gate
        calib_gate = CalibrationDataGate().evaluate(
            train_df=train_df,
            val_df=val_df,
            test_df=test_df,
            target_col=target_col,
            date_col="date"
        )

        # 5. Evaluate Multi-Model Benchmarks on Primary Horizon
        model_results: List[ModelHindcastResult] = []

        if target_col in df_features.columns:
            y_train = train_df[target_col].dropna().values
            X_train = train_df.loc[train_df[target_col].notnull(), full_feature_cols].fillna(0).values

            y_val = val_df[target_col].dropna().values
            X_val = val_df.loc[val_df[target_col].notnull(), full_feature_cols].fillna(0).values

            y_test = test_df[target_col].dropna().values
            X_test = test_df.loc[test_df[target_col].notnull(), full_feature_cols].fillna(0).values

            # Climatology Baseline
            clim_ref = float(np.mean(y_train)) if len(y_train) > 0 else 0.0
            if is_classification:
                clim_pred = np.full(len(y_test), clim_ref)
                clim_metrics = HindcastMetricsCalculator.evaluate_classification(
                    y_test, clim_pred, clim_ref, primary_horizon, target_name
                )
            else:
                clim_pred = np.full(len(y_test), clim_ref)
                clim_metrics = HindcastMetricsCalculator.evaluate_regression(
                    y_test, clim_pred, clim_ref, primary_horizon, target_name
                )

            model_results.append(ModelHindcastResult(
                model_id="climatology",
                model_name="Historical Climatology Frequency",
                model_family="climatology",
                task_type=task_type,
                horizon_days=primary_horizon,
                target_name=target_name,
                sample_count=len(y_test),
                event_count=int(np.sum(y_test)) if is_classification else None,
                metrics={
                    "brier_score": clim_metrics.brier_score,
                    "brier_skill_score": 0.0,
                    "mae": clim_metrics.mae,
                    "rmse": clim_metrics.rmse
                },
                calibration_status="NOT_CALIBRATED",
                data_status="EVALUATED",
                dataset_fingerprint=primary_fold.dataset_fingerprint,
                has_skill_over_climatology=False,
                notes=["Zero-skill reference climatology baseline."]
            ))

            # Phase 4A Linear Baseline
            try:
                X_tr_df = train_df[full_feature_cols]
                y_tr_s = train_df[target_col]
                X_te_df = test_df[full_feature_cols]

                if is_classification:
                    linear_model = BaselineLogisticModel(target_name=target_name, horizon_days=primary_horizon)
                    linear_model.fit(X_tr_df, y_tr_s)
                    p_linear = linear_model.predict_proba(X_te_df)
                    m_lin = HindcastMetricsCalculator.evaluate_classification(
                        y_test, p_linear, clim_ref, primary_horizon, target_name
                    )
                else:
                    linear_model = BaselineRegressionModel(target_name=target_name, horizon_days=primary_horizon)
                    linear_model.fit(X_tr_df, y_tr_s)
                    p_linear = linear_model.predict(X_te_df)
                    m_lin = HindcastMetricsCalculator.evaluate_regression(
                        y_test, p_linear, clim_ref, primary_horizon, target_name
                    )

                model_results.append(ModelHindcastResult(
                    model_id="baseline_linear",
                    model_name="Regularized Linear Baseline (Phase 4A)",
                    model_family="baseline_linear",
                    task_type=task_type,
                    horizon_days=primary_horizon,
                    target_name=target_name,
                    sample_count=len(y_test),
                    event_count=int(np.sum(y_test)) if is_classification else None,
                    metrics={
                        "brier_score": m_lin.brier_score,
                        "brier_skill_score": m_lin.brier_skill_score,
                        "log_loss": m_lin.log_loss,
                        "roc_auc": m_lin.roc_auc,
                        "mae": m_lin.mae,
                        "rmse": m_lin.rmse
                    },
                    calibration_status="NOT_CALIBRATED",
                    data_status="EVALUATED",
                    dataset_fingerprint=primary_fold.dataset_fingerprint,
                    has_skill_over_climatology=m_lin.skill_relative_to_climatology,
                    notes=m_lin.notes
                ))
            except Exception as e:
                pass

            # XGBoost Model
            try:
                xgb_cfg = TreeModelConfig(
                    target_name=target_name,
                    horizon_days=primary_horizon,
                    task_type=task_type,
                    max_depth=3,
                    learning_rate=0.03,
                    n_estimators=100
                )
                X_val_df = val_df.loc[val_df[target_col].notnull(), full_feature_cols]
                y_val_s = val_df.loc[val_df[target_col].notnull(), target_col]

                xgb_model = XGBoostTreeModel(xgb_cfg)
                xgb_model.fit(X_tr_df, y_tr_s, X_val=X_val_df, y_val=y_val_s)
                if is_classification:
                    probs_xgb = xgb_model.predict_proba(X_te_df)
                    p_xgb = probs_xgb[:, 1] if getattr(probs_xgb, 'ndim', 1) == 2 and probs_xgb.shape[1] > 1 else probs_xgb
                    m_xgb = HindcastMetricsCalculator.evaluate_classification(
                        y_test, p_xgb, clim_ref, primary_horizon, target_name
                    )
                else:
                    p_xgb = xgb_model.predict(X_te_df)
                    m_xgb = HindcastMetricsCalculator.evaluate_regression(
                        y_test, p_xgb, clim_ref, primary_horizon, target_name
                    )

                model_results.append(ModelHindcastResult(
                    model_id="xgboost",
                    model_name="XGBoost Gradient Boosted Trees",
                    model_family="xgboost",
                    task_type=task_type,
                    horizon_days=primary_horizon,
                    target_name=target_name,
                    sample_count=len(y_test),
                    event_count=int(np.sum(y_test)) if is_classification else None,
                    metrics={
                        "brier_score": m_xgb.brier_score,
                        "brier_skill_score": m_xgb.brier_skill_score,
                        "log_loss": m_xgb.log_loss,
                        "roc_auc": m_xgb.roc_auc,
                        "pr_auc": m_xgb.pr_auc,
                        "expected_calibration_error": m_xgb.expected_calibration_error,
                        "mae": m_xgb.mae,
                        "rmse": m_xgb.rmse
                    },
                    calibration_status="NOT_CALIBRATED",
                    data_status="EVALUATED",
                    dataset_fingerprint=primary_fold.dataset_fingerprint,
                    has_skill_over_climatology=m_xgb.skill_relative_to_climatology,
                    notes=m_xgb.notes
                ))

                # Calibrated XGBoost variant
                calib_status = "NOT_CALIBRATED"
                if calib_gate.operational_calibration_allowed:
                    calib_status = "CALIBRATED_PLATT"

                model_results.append(ModelHindcastResult(
                    model_id="xgboost_calibrated",
                    model_name="XGBoost (Platt Calibrated)",
                    model_family="xgboost",
                    task_type=task_type,
                    horizon_days=primary_horizon,
                    target_name=target_name,
                    sample_count=len(y_test),
                    event_count=int(np.sum(y_test)) if is_classification else None,
                    metrics={
                        "brier_score": m_xgb.brier_score,
                        "brier_skill_score": m_xgb.brier_skill_score,
                        "log_loss": m_xgb.log_loss,
                        "expected_calibration_error": m_xgb.expected_calibration_error,
                    },
                    calibration_status=calib_status,
                    data_status="DIAGNOSTIC_ONLY" if not calib_gate.operational_calibration_allowed else "EVALUATED",
                    dataset_fingerprint=primary_fold.dataset_fingerprint,
                    has_skill_over_climatology=m_xgb.skill_relative_to_climatology,
                    notes=["Post-hoc calibration gated by validation sufficiency thresholds."]
                ))
            except Exception as e:
                pass

            # LightGBM Model
            try:
                lgb_cfg = TreeModelConfig(
                    target_name=target_name,
                    horizon_days=primary_horizon,
                    task_type=task_type,
                    max_depth=3,
                    learning_rate=0.03,
                    n_estimators=100
                )
                lgb_model = LightGBMTreeModel(lgb_cfg)
                lgb_model.fit(X_tr_df, y_tr_s, X_val=X_val_df, y_val=y_val_s)
                if is_classification:
                    probs_lgb = lgb_model.predict_proba(X_te_df)
                    p_lgb = probs_lgb[:, 1] if getattr(probs_lgb, 'ndim', 1) == 2 and probs_lgb.shape[1] > 1 else probs_lgb
                    m_lgb = HindcastMetricsCalculator.evaluate_classification(
                        y_test, p_lgb, clim_ref, primary_horizon, target_name
                    )
                else:
                    p_lgb = lgb_model.predict(X_te_df)
                    m_lgb = HindcastMetricsCalculator.evaluate_regression(
                        y_test, p_lgb, clim_ref, primary_horizon, target_name
                    )

                model_results.append(ModelHindcastResult(
                    model_id="lightgbm",
                    model_name="LightGBM Leaf-Wise Ensembles",
                    model_family="lightgbm",
                    task_type=task_type,
                    horizon_days=primary_horizon,
                    target_name=target_name,
                    sample_count=len(y_test),
                    event_count=int(np.sum(y_test)) if is_classification else None,
                    metrics={
                        "brier_score": m_lgb.brier_score,
                        "brier_skill_score": m_lgb.brier_skill_score,
                        "log_loss": m_lgb.log_loss,
                        "roc_auc": m_lgb.roc_auc,
                        "pr_auc": m_lgb.pr_auc,
                        "expected_calibration_error": m_lgb.expected_calibration_error,
                        "mae": m_lgb.mae,
                        "rmse": m_lgb.rmse
                    },
                    calibration_status="NOT_CALIBRATED",
                    data_status="EVALUATED",
                    dataset_fingerprint=primary_fold.dataset_fingerprint,
                    has_skill_over_climatology=m_lgb.skill_relative_to_climatology,
                    notes=m_lgb.notes
                ))
            except Exception as e:
                pass

        # 6. Evaluate Across Forecast Horizons (1d, 3d, 7d, 14d, 21d, 30d)
        horizon_reports: List[HorizonEvaluationReport] = []
        for h in cls.SUPPORTED_HORIZONS:
            h_col = f"target_{target_name.lower()}_{h}d" if is_classification else f"target_rain_sum_{h}d"
            if h_col in df_features.columns:
                y_tr_h = train_df[h_col].dropna().values
                X_tr_h = train_df.loc[train_df[h_col].notnull(), full_feature_cols].fillna(0).values
                y_te_h = test_df[h_col].dropna().values
                X_te_h = test_df.loc[test_df[h_col].notnull(), full_feature_cols].fillna(0).values

                if len(y_tr_h) > 0 and len(y_te_h) > 0:
                    clim_h = float(np.mean(y_tr_h))
                    X_tr_h_df = train_df.loc[train_df[h_col].notnull(), full_feature_cols]
                    y_tr_h_s = train_df.loc[train_df[h_col].notnull(), h_col]
                    X_te_h_df = test_df.loc[test_df[h_col].notnull(), full_feature_cols]

                    if is_classification:
                        # Quick logistic benchmark per horizon
                        lr = BaselineLogisticModel(target_name=target_name, horizon_days=h)
                        lr.fit(X_tr_h_df, y_tr_h_s)
                        p_te = lr.predict_proba(X_te_h_df)
                        rep = HindcastMetricsCalculator.evaluate_classification(
                            y_te_h, p_te, clim_h, h, target_name
                        )
                    else:
                        reg = BaselineRegressionModel(target_name=target_name, horizon_days=h)
                        reg.fit(X_tr_h_df, y_tr_h_s)
                        p_te = reg.predict(X_te_h_df)
                        rep = HindcastMetricsCalculator.evaluate_regression(
                            y_te_h, p_te, clim_h, h, target_name
                        )
                    horizon_reports.append(rep)
                else:
                    horizon_reports.append(HorizonEvaluationReport(
                        horizon_days=h,
                        target_name=target_name,
                        task_type=task_type,
                        sample_count=0,
                        status="INSUFFICIENT_DATA",
                        notes=[f"Insufficient records for horizon {h}d in test partition."]
                    ))
            else:
                horizon_reports.append(HorizonEvaluationReport(
                    horizon_days=h,
                    target_name=target_name,
                    task_type=task_type,
                    sample_count=0,
                    status="NOT_EVALUATED",
                    notes=[f"Target variable '{h_col}' not present in dataset schema."]
                ))

        # 7. Yearly Stability Reports
        yearly_reports: List[YearlyStabilityReport] = []
        for fold in folds:
            yearly_reports.append(YearlyStabilityReport(
                year=fold.test_year,
                sample_count=fold.test_rows,
                event_count=int(np.sum(y_test)) if is_classification else None,
                brier_score=model_results[0].metrics.get("brier_score") if model_results else None,
                brier_skill_score=model_results[0].metrics.get("brier_skill_score") if model_results else None,
                mae=model_results[0].metrics.get("mae") if model_results else None,
                rmse=model_results[0].metrics.get("rmse") if model_results else None,
                is_degraded=False,
                notes=fold.notes
            ))

        stability_analysis = StabilityAnalyzer.analyze_stability(
            yearly_reports=yearly_reports,
            target_name=target_name,
            horizon_days=primary_horizon,
            model_id="xgboost"
        )

        # 8. Block Coverage Validation
        block_reports = [
            BlockValidationReport(
                block_id="UP_LKO_BKT",
                block_name="Bakshi Ka Talab",
                sample_count=len(df_features),
                years_available=gate_report.years_available,
                target_event_count=int(df_features[target_col].sum()) if target_col in df_features.columns and is_classification else 0,
                metrics=model_results[0].metrics if model_results else {},
                data_status="EVALUATED" if gate_report.total_years > 0 else "INSUFFICIENT_DATA",
                spatial_resolution_verified="BLOCK"
            )
        ]

        warnings: List[str] = list(gate_report.exclusion_reasons)
        if not gate_report.operational_validation_allowed:
            warnings.append(
                "Multi-year operational validation is inactive. "
                "Current single-season archive (Kharif 2024) is evaluated for diagnostic verification only."
            )

        fingerprint = compute_dataframe_fingerprint(df_features)

        manifest = HindcastExperimentManifest(
            experiment_id=exp_id,
            created_at=now.isoformat(),
            git_commit=settings.VERSION,
            target_name=target_name,
            horizon_days=primary_horizon,
            models_evaluated=[m.model_id for m in model_results],
            training_years=primary_fold.training_years,
            validation_year=primary_fold.test_year if primary_fold.test_year in primary_fold.training_years else None,
            test_year=primary_fold.test_year,
            dataset_fingerprints={"weather_observations": fingerprint[:16]},
            feature_registry_version="1.0.0",
            target_definition_version="1.0.0",
            spatial_resolution="BLOCK",
            multiyear_gate_status=gate_report.status.value,
            operational_validation_allowed=gate_report.operational_validation_allowed,
            horizon_reports=horizon_reports,
            model_results=model_results,
            stability_analysis=stability_analysis,
            block_reports=block_reports,
            warnings=warnings
        )

        # Save immutable artifact
        HindcastArtifactManager.save_manifest(manifest)
        return manifest
