"""
VarshaSetu - Probabilistic Calibration Pipeline
Orchestrates data sufficiency gate evaluation, walk-forward out-of-sample prediction,
Platt / Isotonic parameter fitting, reliability diagram generation,
Brier score decomposition, and reproducible artifact persistence.
"""

import os
import json
import hashlib
import sys
import platform
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score

from ..config import settings
from ..training.tree_pipeline import TreeTrainingPipeline
from ..training.splitter import ChronologicalSplitter, DatasetSplits
from ..training.leakage import LeakageAuditor
from ..baselines.climatology import ClimatologyEngine
from ..models.tree.config import TreeModelConfig
from ..models.tree.xgboost_model import XGBoostTreeModel
from ..models.tree.lightgbm_model import LightGBMTreeModel
from ..models.baseline.logistic import BaselineLogisticModel
from ..models.baseline.regression import BaselineRegressionModel
from ..datasets.fingerprint import fingerprint_dataset
from .schemas import (
    CalibrationGateStatus,
    CalibrationDataGateReport,
    ReliabilityReport,
    BrierDecompositionReport,
    CalibrationComparisonEntry,
    ContinuousUncertaintyReport,
    CalibrationArtifactManifest
)
from .data_gate import CalibrationDataGate
from .platt import PlattCalibrator
from .isotonic import IsotonicCalibrator
from .calibrator import ModelProbabilityCalibrator
from .reliability import ReliabilityAnalyzer
from .uncertainty import ContinuousUncertaintyEstimator


class CalibrationPipeline:
    """
    End-to-End Scientific Calibration and Validation Pipeline.
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
    def run_calibration(
        cls,
        target_name: str = "HEAVY_RAIN",
        horizon_days: int = 7,
        calibration_method: str = "PLATT",
        block_id: str = "UP_LKO_BKT",
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15
    ) -> Dict[str, Any]:
        """
        Executes complete calibration & reliability assessment on chronological partitions.
        """
        df_features, audit_report = TreeTrainingPipeline.load_feature_matrix(block_id=block_id)

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

        valid_df = df_features.dropna(subset=[target_col]).reset_index(drop=True)

        # Chronological forward partition
        splits: DatasetSplits = ChronologicalSplitter.split_by_ratio(
            valid_df, train_ratio=train_ratio, val_ratio=val_ratio, test_ratio=test_ratio
        )

        spatial_cols = [c for c in valid_df.columns if c.startswith("spatial_")]
        avail_features = [c for c in cls.FEATURE_COLS if c in valid_df.columns] + spatial_cols

        # Leakage verification
        LeakageAuditor.audit_chronological_splits(splits.train, splits.val, splits.test, date_col="date")
        LeakageAuditor.audit_feature_matrix_for_target_leakage(avail_features, target_col)

        # 1. Evaluate Data Gate
        gate = CalibrationDataGate()
        gate_report = gate.evaluate(
            train_df=splits.train,
            val_df=splits.val,
            test_df=splits.test,
            target_col=target_col,
            date_col="date"
        )

        X_train = splits.train[avail_features]
        y_train = splits.train[target_col]
        X_val = splits.val[avail_features]
        y_val = splits.val[target_col]
        X_test = splits.test[avail_features]
        y_test = splits.test[target_col]

        eval_period = f"{splits.test_dates[0]} to {splits.test_dates[1]}"
        cal_period = f"{splits.val_dates[0]} to {splits.val_dates[1]}"
        train_period = f"{splits.train_dates[0]} to {splits.train_dates[1]}"

        # Compute climatology reference
        clim_res = ClimatologyEngine.get_target_climatology(
            splits.train, target_name=target_name, horizon_days=horizon_days
        )
        if is_classification:
            clim_ref = clim_res.baseline_probability if clim_res.baseline_probability is not None else 0.0
            clim_brier = float(np.mean((np.full(len(y_test), clim_ref) - y_test.values) ** 2))
        else:
            clim_ref = clim_res.baseline_expected_value if clim_res.baseline_expected_value is not None else 0.0
            clim_brier = 0.0

        comparison_entries: List[CalibrationComparisonEntry] = []
        reliability_reports: Dict[str, ReliabilityReport] = {}
        brier_decompositions: Dict[str, BrierDecompositionReport] = {}
        uncertainty_reports: Dict[str, ContinuousUncertaintyReport] = {}

        # -------------------------------------------------------------
        # Classification Models Calibration
        # -------------------------------------------------------------
        if is_classification:
            models_to_evaluate = [
                ("baseline_logistic", "Phase 4A Logistic Baseline", BaselineLogisticModel(target_name=target_name, horizon_days=horizon_days, l2_penalty=0.1)),
                ("xgboost", "XGBoost Classifier Trees", XGBoostTreeModel(config=TreeModelConfig(model_type="xgboost", task_type="classification", n_estimators=50, max_depth=3), target_name=target_name)),
                ("lightgbm", "LightGBM Classifier Trees", LightGBMTreeModel(config=TreeModelConfig(model_type="lightgbm", task_type="classification", n_estimators=50, max_depth=3), target_name=target_name))
            ]

            for model_id, model_name, model_obj in models_to_evaluate:
                # 1. Fit on Train
                if isinstance(model_obj, (XGBoostTreeModel, LightGBMTreeModel)):
                    model_obj.fit(X_train, y_train, X_val, y_val)
                    val_raw_p = model_obj.predict_proba(X_val)[:, 1]
                    test_raw_p = model_obj.predict_proba(X_test)[:, 1]
                else:
                    model_obj.fit(X_train, y_train, training_period=train_period)
                    val_raw_p = model_obj.predict_proba(X_val)
                    test_raw_p = model_obj.predict_proba(X_test)

                # 2. Calibration Fitting on Validation Only
                method_upper = calibration_method.upper()
                calibrator = ModelProbabilityCalibrator(method=method_upper)

                # Operational vs Diagnostic status
                if gate_report.status == CalibrationGateStatus.PASSED:
                    calibrator.fit(val_raw_p, y_val.values)
                    test_cal_p = calibrator.predict(test_raw_p)
                    cal_status = "CALIBRATED"
                elif gate_report.status == CalibrationGateStatus.DIAGNOSTIC_ONLY:
                    calibrator.fit(val_raw_p, y_val.values)
                    test_cal_p = calibrator.predict(test_raw_p)
                    cal_status = "DIAGNOSTIC_ONLY"
                else:
                    test_cal_p = test_raw_p
                    cal_status = "INSUFFICIENT_DATA"

                # 3. Reliability Analysis (Raw & Calibrated)
                raw_rel = ReliabilityAnalyzer.compute_reliability(
                    y_true=y_test.values,
                    y_prob=test_raw_p,
                    model_id=f"{model_id}_raw",
                    target_name=target_name,
                    evaluation_period=eval_period,
                    diagnostic_only=(cal_status != "CALIBRATED")
                )
                cal_rel = ReliabilityAnalyzer.compute_reliability(
                    y_true=y_test.values,
                    y_prob=test_cal_p,
                    model_id=f"{model_id}_{method_upper.lower()}",
                    target_name=target_name,
                    evaluation_period=eval_period,
                    diagnostic_only=(cal_status != "CALIBRATED")
                )

                # 4. Brier Decomposition
                brier_decomp = ReliabilityAnalyzer.decompose_brier_score(
                    y_true=y_test.values,
                    y_prob=test_cal_p if cal_status in ["CALIBRATED", "DIAGNOSTIC_ONLY"] else test_raw_p
                )

                # 5. ROC-AUC
                has_two_classes = len(np.unique(y_test.values)) >= 2
                raw_auc = None
                cal_auc = None
                if has_two_classes:
                    try:
                        raw_auc = float(round(roc_auc_score(y_test.values, test_raw_p), 4))
                        cal_auc = float(round(roc_auc_score(y_test.values, test_cal_p), 4))
                    except Exception:
                        pass

                # Brier Skill Score calculation
                effective_brier = cal_rel.brier_score if cal_status in ["CALIBRATED", "DIAGNOSTIC_ONLY"] else raw_rel.brier_score
                bss_val, bss_status = ReliabilityAnalyzer.calculate_brier_skill_score(effective_brier, clim_brier)

                entry = CalibrationComparisonEntry(
                    model_id=model_id,
                    model_name=model_name,
                    target_name=target_name,
                    calibration_method=method_upper if cal_status in ["CALIBRATED", "DIAGNOSTIC_ONLY"] else "NONE",
                    calibration_status=cal_status,
                    raw_brier=raw_rel.brier_score,
                    calibrated_brier=cal_rel.brier_score if cal_status in ["CALIBRATED", "DIAGNOSTIC_ONLY"] else None,
                    raw_log_loss=raw_rel.log_loss,
                    calibrated_log_loss=cal_rel.log_loss if cal_status in ["CALIBRATED", "DIAGNOSTIC_ONLY"] else None,
                    raw_ece=raw_rel.expected_calibration_error,
                    calibrated_ece=cal_rel.expected_calibration_error if cal_status in ["CALIBRATED", "DIAGNOSTIC_ONLY"] else None,
                    raw_mce=raw_rel.maximum_calibration_error,
                    calibrated_mce=cal_rel.maximum_calibration_error if cal_status in ["CALIBRATED", "DIAGNOSTIC_ONLY"] else None,
                    raw_roc_auc=raw_auc,
                    calibrated_roc_auc=cal_auc if cal_status in ["CALIBRATED", "DIAGNOSTIC_ONLY"] else None,
                    sample_count=len(y_test),
                    positive_count=int(np.sum(y_test.values == 1)),
                    negative_count=int(np.sum(y_test.values == 0)),
                    training_years=gate_report.unique_years,
                    validation_years=gate_report.unique_years,
                    test_years=gate_report.unique_years,
                    bss_vs_climatology=bss_val,
                    bss_status=bss_status,
                    probabilities_clipped=raw_rel.probabilities_clipped or cal_rel.probabilities_clipped
                )

                comparison_entries.append(entry)
                reliability_reports[model_id] = cal_rel
                brier_decompositions[model_id] = brier_decomp

        # -------------------------------------------------------------
        # Regression Models Uncertainty
        # -------------------------------------------------------------
        else:
            models_to_evaluate = [
                ("baseline_ridge", "Phase 4A Ridge Baseline", BaselineRegressionModel(target_name=target_name, horizon_days=horizon_days, alpha=1.0)),
                ("xgboost", "XGBoost Regressor Trees", XGBoostTreeModel(config=TreeModelConfig(model_type="xgboost", task_type="regression", n_estimators=50, max_depth=3), target_name=target_name)),
                ("lightgbm", "LightGBM Regressor Trees", LightGBMTreeModel(config=TreeModelConfig(model_type="lightgbm", task_type="regression", n_estimators=50, max_depth=3), target_name=target_name))
            ]

            for model_id, model_name, model_obj in models_to_evaluate:
                if isinstance(model_obj, (XGBoostTreeModel, LightGBMTreeModel)):
                    model_obj.fit(X_train, y_train, X_val, y_val)
                    test_pred = model_obj.predict(X_test)
                else:
                    model_obj.fit(X_train, y_train, training_period=train_period)
                    test_pred = model_obj.predict(X_test)

                unc_report = ContinuousUncertaintyEstimator.estimate_uncertainty(
                    y_true=y_test.values,
                    y_pred=test_pred,
                    model_id=model_id,
                    target_name=target_name
                )
                uncertainty_reports[model_id] = unc_report

        # -------------------------------------------------------------
        # Artifact Persistence
        # -------------------------------------------------------------
        dataset_path = settings.PROCESSED_DATA_DIR / "weather_lucknow_observations.parquet"
        try:
            fp = fingerprint_dataset(str(dataset_path))
            ds_hash = fp.sha256_checksum
        except Exception:
            ds_hash = "unknown"

        schema_hash = hashlib.sha256(",".join(avail_features).encode("utf-8")).hexdigest()[:16]
        exp_id = f"calib_{target_name.lower()}_{horizon_days}d_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"

        artifact_dir = settings.ARTIFACTS_DIR / "calibration"
        artifact_dir.mkdir(parents=True, exist_ok=True)

        artifact_manifest = CalibrationArtifactManifest(
            experiment_id=exp_id,
            model_id=f"ensemble_{target_name.lower()}_{horizon_days}d",
            target_name=target_name,
            calibration_method=calibration_method.upper(),
            calibration_status=gate_report.status.value,
            dataset_fingerprint=ds_hash,
            feature_schema_hash=schema_hash,
            train_period=train_period,
            calibration_period=cal_period,
            test_period=eval_period,
            sample_counts={
                "train": len(X_train),
                "val": len(X_val),
                "test": len(X_test)
            },
            class_counts={
                "positive": gate_report.positive_class_count,
                "negative": gate_report.negative_class_count
            },
            calibration_parameters={"method": calibration_method.upper(), "epsilon": 1e-6},
            reliability_bins=reliability_reports["xgboost"].bins if "xgboost" in reliability_reports else [],
            ece=reliability_reports["xgboost"].expected_calibration_error if "xgboost" in reliability_reports else 0.0,
            mce=reliability_reports["xgboost"].maximum_calibration_error if "xgboost" in reliability_reports else 0.0,
            brier_score=reliability_reports["xgboost"].brier_score if "xgboost" in reliability_reports else 0.0,
            log_loss=reliability_reports["xgboost"].log_loss if "xgboost" in reliability_reports else 0.0,
            brier_decomposition=brier_decompositions.get("xgboost"),
            uncertainty_metadata=uncertainty_reports.get("xgboost"),
            software_versions={
                "python": platform.python_version(),
                "numpy": np.__version__,
                "pandas": pd.__version__
            },
            git_commit="6d05379",
            created_at=datetime.now(timezone.utc).isoformat()
        )

        artifact_file = artifact_dir / f"{exp_id}.json"
        with open(artifact_file, "w") as f:
            f.write(artifact_manifest.model_dump_json(indent=2))

        return {
            "target_name": target_name,
            "horizon_days": horizon_days,
            "task_type": task_type,
            "data_gate": gate_report.model_dump(),
            "comparison": [e.model_dump() for e in comparison_entries],
            "reliability_reports": {k: v.model_dump() for k, v in reliability_reports.items()},
            "brier_decompositions": {k: v.model_dump() for k, v in brier_decompositions.items()},
            "uncertainty_reports": {k: v.model_dump() for k, v in uncertainty_reports.items()},
            "artifact_saved": str(artifact_file)
        }
