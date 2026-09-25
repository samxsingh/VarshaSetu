from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import psycopg2
import pandas as pd

from .config import settings
from .ingestion.pipeline import IngestionPipeline
from .storage.dataset_store import DatasetStore
from .schemas.ingestion import IngestionRunResult

app = FastAPI(
    title="VarshaSetu Scientific Data & Meteorological Service",
    description="Scientific Data Foundation & Ingestion Engine for Hyperlocal Monsoon Intelligence",
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def get_health() -> Dict[str, Any]:
    """Microservice health and telemetry."""
    db_connected = False
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT 1;")
        cur.close()
        conn.close()
        db_connected = True
    except Exception:
        db_connected = False

    return {
        "status": "ok",
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "database_connected": db_connected,
        "storage": {
            "raw_dir": str(settings.RAW_DATA_DIR),
            "processed_dir": str(settings.PROCESSED_DATA_DIR),
            "features_dir": str(settings.FEATURE_DATA_DIR),
        },
    }

@app.get("/data/status")
def get_data_status() -> Dict[str, Any]:
    """Data freshness and ingestion status."""
    datasets = DatasetStore.list_available_datasets()
    return {
        "total_datasets": len(datasets),
        "freshness": "FRESH" if len(datasets) > 0 else "UNKNOWN",
        "datasets": datasets,
        "evaluated_at": datetime.utcnow().isoformat(),
    }

@app.get("/data/catalog")
def get_data_catalog() -> Dict[str, Any]:
    """Scientific data catalog with provenance, variables, units, and licenses."""
    datasets = DatasetStore.list_available_datasets()
    return {
        "service": settings.SERVICE_NAME,
        "catalog_version": "1.0.0",
        "datasets": datasets,
    }

@app.get("/data/features")
def get_derived_features(block_code: str = "UP_LKO_BKT", limit: int = 30) -> Dict[str, Any]:
    """Fetch recent ML-ready derived features for an administrative block."""
    df = DatasetStore.load_features("features_lucknow_monsoon_matrix")
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="Derived features dataset not found. Please trigger ingestion first.")
    
    subset = df.tail(limit).to_dict(orient="records")
    return {
        "block_code": block_code,
        "record_count": len(subset),
        "records": subset,
    }

@app.post("/ingestion/run")
async def trigger_ingestion(pipeline: str = Query("all", enum=["enso", "iod", "mjo", "weather", "all"])) -> Dict[str, Any]:
    """Run data ingestion pipelines for climate teleconnections and weather."""
    if pipeline == "enso":
        res = await IngestionPipeline.run_enso_pipeline()
        return {"status": "completed", "results": [res.model_dump(mode="json")]}
    elif pipeline == "iod":
        res = await IngestionPipeline.run_iod_pipeline()
        return {"status": "completed", "results": [res.model_dump(mode="json")]}
    elif pipeline == "mjo":
        res = await IngestionPipeline.run_mjo_pipeline()
        return {"status": "completed", "results": [res.model_dump(mode="json")]}
    elif pipeline == "weather":
        res = await IngestionPipeline.run_weather_and_features_pipeline()
        return {"status": "completed", "results": [res.model_dump(mode="json")]}
    else:
        results = await IngestionPipeline.run_all_pipelines()
        return {"status": "completed", "results": [r.model_dump(mode="json") for r in results]}

# ====================================================================
# PHASE 4A & 4B — SCIENTIFIC ML, TREE DOWNSCALING & EXPLAINABILITY
# ====================================================================

import joblib
from pydantic import BaseModel, Field
from .inspection.inspector import DataInspector
from .experiments.registry import ExperimentRegistry
from .training.pipeline import BaselineTrainingPipeline
from .training.tree_pipeline import TreeTrainingPipeline
from .datasets.catalog import DatasetCatalog
from .explainability.shap_explainer import TreeShapExplainer
from .models.tree.xgboost_model import XGBoostTreeModel
from .models.tree.lightgbm_model import LightGBMTreeModel

dataset_catalog = DatasetCatalog()


class TrainModelRequest(BaseModel):
    target_name: str = "HEAVY_RAIN"
    horizon_days: int = 7
    block_id: str = "UP_LKO_BKT"


class ExplainSampleRequest(BaseModel):
    sample_index: int = 0
    top_k: int = 5


@app.get("/inspection/datasets")
def inspect_all_datasets() -> Dict[str, Any]:
    """Inspect all Phase 3 processed and engineered datasets."""
    reports = DataInspector.inspect_all()
    return {
        "status": "success",
        "datasets": {k: v.model_dump(mode="json") for k, v in reports.items()}
    }


@app.get("/datasets/catalog")
def get_scientific_dataset_catalog() -> Dict[str, Any]:
    """Scientific dataset catalog with SHA256 fingerprints, resolution, and variables."""
    datasets = dataset_catalog.list_datasets()
    return {
        "status": "success",
        "total_datasets": len(datasets),
        "catalog": [d.model_dump(mode="json") for d in datasets]
    }


@app.get("/models/status")
def get_models_status() -> Dict[str, Any]:
    """Model operational readiness and Phase 4B tree downscaling registry status."""
    experiments = ExperimentRegistry.list_experiments()
    models_dir = settings.ARTIFACTS_DIR / "models"
    available_models = [f.stem for f in models_dir.glob("*.joblib")] if models_dir.exists() else []

    return {
        "service": settings.SERVICE_NAME,
        "phase": "PHASE_4B_OPERATIONAL_DOWNSCALING_STAGE",
        "operational_status": "DOWNSCALING_BENCHMARK_ACTIVE",
        "spatial_resolution_supported": "BLOCK",
        "supported_blocks": ["UP_LKO_BKT"],
        "data_availability_status": "PARTIAL",
        "data_availability_notes": (
            "Model training utilizes Kharif 2024 (122 daily records) reanalysis data. "
            "Does not satisfy 30-year WMO climatology requirements. "
            "Downscaling resolution is block-scale centroid (~9km). Panchayat microclimate claims disabled."
        ),
        "supported_model_families": [
            "Climatology Frequency / Mean Baseline",
            "Phase 4A Regularized Linear/Logistic Baseline",
            "XGBoost Gradient Boosted Trees",
            "LightGBM Gradient Boosted Trees"
        ],
        "available_model_artifacts": available_models,
        "total_experiments_recorded": len(experiments),
        "latest_experiment": experiments[0].model_dump(mode="json") if experiments else None
    }


@app.get("/models/registry")
def get_model_registry() -> Dict[str, Any]:
    """Returns all serialized tree models and their provenance metadata."""
    models_dir = settings.ARTIFACTS_DIR / "models"
    if not models_dir.exists():
        return {"total_models": 0, "models": []}

    registered = []
    for f in sorted(models_dir.glob("*.joblib")):
        try:
            data = joblib.load(f)
            meta = data.get("metadata") or {}
            cal_info = meta.get("calibration") or {
                "status": "INSUFFICIENT_DATA",
                "method": "NONE",
                "fitted": False,
                "sampleCount": 0,
                "validationPeriod": "N/A",
                "testPeriod": "N/A",
                "metrics": {}
            }
            registered.append({
                "model_id": data.get("model_id", f.stem),
                "target_name": data.get("target_name", "unknown"),
                "model_type": data.get("config", {}).get("model_type", "unknown"),
                "task_type": data.get("config", {}).get("task_type", "classification"),
                "feature_count": len(data.get("feature_names", [])),
                "is_calibrated": meta.get("is_calibrated", False),
                "calibration": cal_info,
                "status": meta.get("status", "trained"),
                "created_at": meta.get("created_at"),
                "data_availability_status": meta.get("data_availability_status", "PARTIAL"),
                "model_path": str(f)
            })
        except Exception:
            pass

    return {
        "status": "success",
        "total_models": len(registered),
        "models": registered
    }


@app.get("/models/comparison")
def get_latest_comparison(target: str = "HEAVY_RAIN", horizon_days: int = 7) -> Dict[str, Any]:
    """
    Returns multi-model benchmark comparison report:
    Climatology vs Baseline Logistic/Ridge vs XGBoost vs LightGBM on identical test slice.
    """
    res = TreeTrainingPipeline.run_benchmark(
        target_name=target,
        horizon_days=horizon_days,
        block_id="UP_LKO_BKT"
    )
    return {
        "status": "success",
        "benchmark_report": res["benchmark_report"],
        "data_availability": res["data_availability"],
        "downscaling_resolution": res["downscaling_resolution"]
    }


@app.get("/models/{model_id}")
def get_model_details(model_id: str) -> Dict[str, Any]:
    """Retrieves metadata, hyperparameters, and feature importances for a specific model."""
    model_path = settings.ARTIFACTS_DIR / "models" / f"{model_id}.joblib"
    if not model_path.exists():
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")

    data = joblib.load(model_path)
    return {
        "model_id": data.get("model_id"),
        "target_name": data.get("target_name"),
        "config": data.get("config"),
        "feature_names": data.get("feature_names"),
        "metadata": data.get("metadata")
    }


@app.get("/models/{model_id}/explanations")
def get_model_explanations(model_id: str) -> Dict[str, Any]:
    """Retrieves global SHAP feature importances and domain driver rankings for a model."""
    exp_path = settings.ARTIFACTS_DIR / "explanations" / f"{model_id}_global.json"
    if not exp_path.exists():
        # Fallback: check if model exists and compute on-the-fly
        model_file = settings.ARTIFACTS_DIR / "models" / f"{model_id}.joblib"
        if not model_file.exists():
            raise HTTPException(status_code=404, detail=f"Explanations for '{model_id}' not found.")
        
        # Load and compute
        if "xgboost" in model_id.lower():
            model = XGBoostTreeModel.load(str(model_file))
        else:
            model = LightGBMTreeModel.load(str(model_file))

        df_feat, _ = TreeTrainingPipeline.load_feature_matrix()
        avail_features = model.feature_names
        X = df_feat[avail_features].dropna()
        rep = TreeShapExplainer.explain_global(model, X.tail(20))
        return rep.model_dump(mode="json")

    with open(exp_path, "r") as f:
        data = json.load(f)
    return data


@app.post("/models/train")
def train_tree_downscaling_model(req: TrainModelRequest) -> Dict[str, Any]:
    """Triggers end-to-end multi-model benchmark and downscaling training pipeline."""
    res = TreeTrainingPipeline.run_benchmark(
        target_name=req.target_name,
        horizon_days=req.horizon_days,
        block_id=req.block_id
    )
    return {
        "status": "success",
        "result": res
    }


@app.post("/models/{model_id}/explain")
def explain_model_prediction(model_id: str, req: ExplainSampleRequest) -> Dict[str, Any]:
    """Computes sample-level SHAP explanation for a given sample index."""
    model_file = settings.ARTIFACTS_DIR / "models" / f"{model_id}.joblib"
    if not model_file.exists():
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")

    if "xgboost" in model_id.lower():
        model = XGBoostTreeModel.load(str(model_file))
    else:
        model = LightGBMTreeModel.load(str(model_file))

    df_feat, _ = TreeTrainingPipeline.load_feature_matrix()
    avail_features = model.feature_names
    X = df_feat[avail_features].dropna()

    if req.sample_index >= len(X):
        req.sample_index = len(X) - 1

    sample_exp = TreeShapExplainer.explain_sample(
        model=model,
        X_sample=X,
        sample_index=req.sample_index,
        top_k=req.top_k
    )
    return sample_exp.model_dump(mode="json")


@app.get("/models/experiments")
def list_experiments() -> Dict[str, Any]:
    """List all recorded ML baseline and tree benchmark experiments."""
    experiments = ExperimentRegistry.list_experiments()
    return {
        "total": len(experiments),
        "experiments": [e.model_dump(mode="json") for e in experiments]
    }


@app.get("/models/experiments/{exp_id}")
def get_experiment_by_id(exp_id: str) -> Dict[str, Any]:
    """Retrieve full manifest and metrics for a specific experiment."""
    exp = ExperimentRegistry.get_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail=f"Experiment '{exp_id}' not found.")
    return exp.model_dump(mode="json")


@app.post("/models/baselines/train")
def train_baseline_models(target: str = Query("ALL", enum=["HEAVY_RAIN", "DRY_SPELL", "RAINFALL_AMOUNT", "ALL"])) -> Dict[str, Any]:
    """Trigger baseline model training and evaluation against climatology."""
    results = []
    if target in ["HEAVY_RAIN", "ALL"]:
        results.append(BaselineTrainingPipeline.run_binary_baseline(target_name="HEAVY_RAIN", horizon_days=7))
    if target in ["DRY_SPELL", "ALL"]:
        results.append(BaselineTrainingPipeline.run_binary_baseline(target_name="DRY_SPELL", horizon_days=7))
    if target in ["RAINFALL_AMOUNT", "ALL"]:
        results.append(BaselineTrainingPipeline.run_continuous_baseline(target_name="rainfall_amount", horizon_days=7))

    return {
        "status": "success",
        "experiments_completed": len(results),
        "results": results
    }


# ====================================================================
# PHASE 4C — PROBABILISTIC CALIBRATION & RELIABILITY ENDPOINTS
# ====================================================================

from .calibration.schemas import (
    CalibrationGateStatus,
    CalibrationDataGateReport,
    ReliabilityReport,
    CalibrationComparisonEntry,
    ContinuousUncertaintyReport
)
from .calibration.data_gate import CalibrationDataGate
from .calibration.reliability import ReliabilityAnalyzer
from .calibration.pipeline import CalibrationPipeline


class RunCalibrationRequest(BaseModel):
    target_name: str = "HEAVY_RAIN"
    horizon_days: int = 7
    calibration_method: str = "PLATT"
    block_id: str = "UP_LKO_BKT"


class ValidateCalibrationRequest(BaseModel):
    target_name: str = "HEAVY_RAIN"
    horizon_days: int = 7
    block_id: str = "UP_LKO_BKT"


@app.get("/calibration/status")
def get_calibration_status() -> Dict[str, Any]:
    """Calibration operational readiness, data gate status, and data limitation disclosures."""
    calib_dir = settings.ARTIFACTS_DIR / "calibration"
    artifacts = [f.stem for f in calib_dir.glob("*.json")] if calib_dir.exists() else []

    return {
        "service": settings.SERVICE_NAME,
        "phase": "PHASE_4C_CALIBRATION_STAGE",
        "calibration_status": "INSUFFICIENT_DATA",
        "operational_calibration_active": False,
        "message": (
            "Probabilistic calibration is INACTIVE for operational deployment. "
            "Kharif 2024 (122 daily records) does not satisfy the multi-year statistical threshold "
            "(min 100 validation samples, min 30/30 class balance, min 5 years). "
            "Diagnostics and walk-forward evaluations remain available in diagnostic-only mode."
        ),
        "engineering_guardrails": {
            "min_calibration_samples": 100,
            "min_calibration_positive": 30,
            "min_calibration_negative": 30,
            "min_calibration_years": 5,
            "min_test_samples": 30,
            "note": "Engineering guardrails for statistical stability; not universal physical laws."
        },
        "available_calibration_artifacts": len(artifacts),
        "supported_methods": ["PLATT_SCALING", "ISOTONIC_REGRESSION"]
    }


@app.get("/calibration/models")
def get_calibration_models() -> Dict[str, Any]:
    """Returns all models with their calibration status, method, and reliability metrics."""
    models_dir = settings.ARTIFACTS_DIR / "models"
    if not models_dir.exists():
        return {"total_models": 0, "models": []}

    registered = []
    for f in sorted(models_dir.glob("*.joblib")):
        try:
            data = joblib.load(f)
            meta = data.get("metadata") or {}
            cal_info = meta.get("calibration") or {
                "status": "INSUFFICIENT_DATA",
                "method": "NONE",
                "fitted": False,
                "sampleCount": 0,
                "validationPeriod": "N/A",
                "testPeriod": "N/A",
                "metrics": {}
            }
            registered.append({
                "model_id": data.get("model_id", f.stem),
                "target_name": data.get("target_name", "unknown"),
                "task_type": data.get("config", {}).get("task_type", "classification"),
                "calibration": cal_info
            })
        except Exception:
            pass

    return {
        "status": "success",
        "total_models": len(registered),
        "models": registered
    }


@app.get("/calibration/models/{model_id}")
def get_model_calibration_details(model_id: str) -> Dict[str, Any]:
    """Retrieves specific model calibration parameters, state, and validation period."""
    model_path = settings.ARTIFACTS_DIR / "models" / f"{model_id}.joblib"
    if not model_path.exists():
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")

    data = joblib.load(model_path)
    meta = data.get("metadata") or {}
    cal_info = meta.get("calibration") or {
        "status": "INSUFFICIENT_DATA",
        "method": "NONE",
        "fitted": False,
        "sampleCount": 0,
        "validationPeriod": "N/A",
        "testPeriod": "N/A",
        "metrics": {}
    }
    return {
        "model_id": data.get("model_id"),
        "target_name": data.get("target_name"),
        "calibration": cal_info
    }


@app.get("/calibration/models/{model_id}/reliability")
def get_model_reliability_diagram(model_id: str) -> Dict[str, Any]:
    """Retrieves probability reliability bins, ECE, MCE, and Brier decomposition for a model."""
    calib_dir = settings.ARTIFACTS_DIR / "calibration"
    # Find newest artifact matching model target or compute on-the-fly
    matching = sorted(calib_dir.glob("*.json"), reverse=True) if calib_dir.exists() else []

    if matching:
        with open(matching[0], "r") as f:
            artifact = json.load(f)
            return {
                "model_id": model_id,
                "target_name": artifact.get("target_name", "HEAVY_RAIN"),
                "calibration_status": artifact.get("calibration_status", "INSUFFICIENT_DATA"),
                "expected_calibration_error": artifact.get("ece", 0.0),
                "maximum_calibration_error": artifact.get("mce", 0.0),
                "brier_score": artifact.get("brier_score", 0.0),
                "log_loss": artifact.get("log_loss", 0.0),
                "bins": artifact.get("reliability_bins", []),
                "brier_decomposition": artifact.get("brier_decomposition"),
                "diagnostic_only": True
            }

    # On-the-fly run if no artifact exists yet
    res = CalibrationPipeline.run_calibration(target_name="HEAVY_RAIN", horizon_days=7)
    rel_key = "xgboost" if "xgboost" in model_id.lower() else ("lightgbm" if "lightgbm" in model_id.lower() else "baseline_logistic")
    rel_rep = res["reliability_reports"].get(rel_key) or list(res["reliability_reports"].values())[0]

    return {
        "model_id": model_id,
        "target_name": res["target_name"],
        "calibration_status": res["data_gate"]["status"],
        "expected_calibration_error": rel_rep["expected_calibration_error"],
        "maximum_calibration_error": rel_rep["maximum_calibration_error"],
        "brier_score": rel_rep["brier_score"],
        "log_loss": rel_rep["log_loss"],
        "bins": rel_rep["bins"],
        "brier_decomposition": res["brier_decompositions"].get(rel_key),
        "diagnostic_only": True
    }


@app.get("/calibration/comparison")
def get_calibration_comparison(
    target: str = "HEAVY_RAIN",
    horizon_days: int = 7,
    method: str = "PLATT"
) -> Dict[str, Any]:
    """
    Returns multi-model calibration comparison (Raw vs Calibrated Brier, Log Loss, ECE, MCE, ROC-AUC)
    across all four paradigms on identical chronological test partition.
    """
    res = CalibrationPipeline.run_calibration(
        target_name=target,
        horizon_days=horizon_days,
        calibration_method=method,
        block_id="UP_LKO_BKT"
    )
    return {
        "status": "success",
        "data_gate": res["data_gate"],
        "comparison": res["comparison"],
        "uncertainty_reports": res["uncertainty_reports"],
        "artifact_saved": res["artifact_saved"]
    }


@app.post("/calibration/run")
def run_calibration_pipeline(req: RunCalibrationRequest) -> Dict[str, Any]:
    """
    Executes full calibration pipeline:
    1. Data gate evaluation
    2. Model fitting on train partition
    3. Calibration fitting on validation partition
    4. Evaluation on untouched test partition
    5. Saves reproducible artifact
    """
    res = CalibrationPipeline.run_calibration(
        target_name=req.target_name,
        horizon_days=req.horizon_days,
        calibration_method=req.calibration_method,
        block_id=req.block_id
    )
    return {
        "status": "success",
        "result": res
    }


@app.post("/calibration/validate")
def validate_calibration_gate(req: ValidateCalibrationRequest) -> Dict[str, Any]:
    """Evaluates data sufficiency gate for given target and horizon without modifying models."""
    df_features, _ = TreeTrainingPipeline.load_feature_matrix(block_id=req.block_id)
    target_col = f"target_{req.target_name.lower()}_{req.horizon_days}d"
    if target_col not in df_features.columns:
        target_col = f"target_rain_sum_{req.horizon_days}d"

    valid_df = df_features.dropna(subset=[target_col]).reset_index(drop=True)
    splits = ChronologicalSplitter.split_by_ratio(valid_df, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15)

    gate = CalibrationDataGate()
    gate_report = gate.evaluate(
        train_df=splits.train,
        val_df=splits.val,
        test_df=splits.test,
        target_col=target_col,
        date_col="date"
    )
    return {
        "status": "success",
        "data_gate": gate_report.model_dump()
    }


# ====================================================================
# PHASE 4D — MULTI-YEAR VALIDATION, HINDCASTING & STABILITY ENDPOINTS
# ====================================================================

from .validation.multiyear_gate import MultiYearValidationGate, MultiYearGateReport
from .validation.drift import FeatureDriftDetector, DatasetDriftReport
from .hindcasting.schemas import HindcastExperimentManifest
from .hindcasting.folds import generate_hindcast_folds
from .hindcasting.artifacts import HindcastArtifactManager
from .hindcasting.runner import HindcastRunner
from .hindcasting.coverage import FeatureCoverageInspector


class RunHindcastRequest(BaseModel):
    target_name: str = "HEAVY_RAIN"
    primary_horizon: int = 7
    block_id: str = "UP_LKO_BKT"


@app.get("/hindcasting/status")
def get_hindcasting_status() -> Dict[str, Any]:
    """
    Returns global hindcasting status, multi-year data gate evaluation,
    and scientific limitations disclosure.
    """
    df_features, _ = TreeTrainingPipeline.load_feature_matrix()
    gate_report = MultiYearValidationGate.evaluate(df_features)
    manifests = HindcastArtifactManager.list_manifests()

    return {
        "status": "success",
        "service": "varshasetu-hindcasting-engine",
        "phase": "PHASE_4D_MULTIYEAR_HINDCASTING_STAGE",
        "operational_validation_allowed": gate_report.operational_validation_allowed,
        "multiyear_gate_status": gate_report.status.value,
        "total_experiments_recorded": len(manifests),
        "years_available": gate_report.years_available,
        "complete_seasons": gate_report.complete_seasons,
        "message": "Multi-year validation engine active with walk-forward hindcasting and temporal drift audits.",
        "scientific_disclosure": "Historical hindcast validation reflects only the years and variables actually available to the system. Operational multi-year validation requires >=5 complete seasons."
    }


@app.get("/hindcasting/gate")
def get_multiyear_gate_report() -> Dict[str, Any]:
    """
    Evaluates multi-year data sufficiency gate against real observational archive.
    """
    df_features, _ = TreeTrainingPipeline.load_feature_matrix()
    gate_report = MultiYearValidationGate.evaluate(df_features)
    return {
        "status": "success",
        "gate_report": gate_report.model_dump(mode="json")
    }


@app.get("/hindcasting/folds")
def get_hindcast_folds() -> Dict[str, Any]:
    """
    Returns generated chronological walk-forward folds.
    """
    df_features, _ = TreeTrainingPipeline.load_feature_matrix()
    folds = generate_hindcast_folds(df_features)
    return {
        "status": "success",
        "total_folds": len(folds),
        "folds": [f.model_dump(mode="json") for f in folds]
    }


@app.get("/hindcasting/results")
def get_latest_hindcast_results(target: str = "HEAVY_RAIN", horizon_days: int = 7) -> Dict[str, Any]:
    """
    Returns latest hindcast benchmark results across paradigms, horizons, and stability.
    """
    manifests = HindcastArtifactManager.list_manifests()
    matching = [m for m in manifests if m.get("target_name") == target and m.get("horizon_days") == horizon_days]

    if matching:
        exp = HindcastArtifactManager.load_manifest(matching[0]["experiment_id"])
        if exp:
            return {
                "status": "success",
                "experiment": exp.model_dump(mode="json")
            }

    # Generate deterministic hindcast run
    exp = HindcastRunner.run_experiment(target_name=target, primary_horizon=horizon_days)
    return {
        "status": "success",
        "experiment": exp.model_dump(mode="json")
    }


@app.get("/hindcasting/results/{experiment_id}")
def get_hindcast_result_by_id(experiment_id: str) -> Dict[str, Any]:
    """
    Retrieves full immutable manifest for a specific hindcast experiment.
    """
    exp = HindcastArtifactManager.load_manifest(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail=f"Hindcast experiment '{experiment_id}' not found.")
    return {
        "status": "success",
        "experiment": exp.model_dump(mode="json")
    }


@app.get("/hindcasting/stability")
def get_hindcast_stability(target: str = "HEAVY_RAIN", horizon_days: int = 7) -> Dict[str, Any]:
    """
    Returns year-by-year stability analysis and cross-season variability statistics.
    """
    manifests = HindcastArtifactManager.list_manifests()
    matching = [m for m in manifests if m.get("target_name") == target and m.get("horizon_days") == horizon_days]

    if matching:
        exp = HindcastArtifactManager.load_manifest(matching[0]["experiment_id"])
        if exp and exp.stability_analysis:
            return {
                "status": "success",
                "stability": exp.stability_analysis.model_dump(mode="json")
            }

    exp = HindcastRunner.run_experiment(target_name=target, primary_horizon=horizon_days)
    return {
        "status": "success",
        "stability": exp.stability_analysis.model_dump(mode="json") if exp.stability_analysis else None
    }


@app.get("/hindcasting/drift")
def get_feature_drift_report() -> Dict[str, Any]:
    """
    Runs historical feature distribution drift analysis (PSI, KS statistic, mean/variance).
    """
    df_features, _ = TreeTrainingPipeline.load_feature_matrix()
    n_mid = len(df_features) // 2
    df_ref = df_features.iloc[:n_mid]
    df_comp = df_features.iloc[n_mid:]

    ref_label = f"Early Season ({str(pd.to_datetime(df_ref['date']).min().date())} to {str(pd.to_datetime(df_ref['date']).max().date())})"
    comp_label = f"Late Season ({str(pd.to_datetime(df_comp['date']).min().date())} to {str(pd.to_datetime(df_comp['date']).max().date())})"

    drift = FeatureDriftDetector.evaluate_drift(
        df_reference=df_ref,
        df_comparison=df_comp,
        reference_label=ref_label,
        comparison_label=comp_label
    )
    return {
        "status": "success",
        "drift_report": drift.model_dump(mode="json")
    }


@app.get("/hindcasting/coverage")
def get_feature_coverage_report() -> Dict[str, Any]:
    """
    Returns historical feature availability across the timeline and missingness.
    """
    df_features, _ = TreeTrainingPipeline.load_feature_matrix()
    coverage = FeatureCoverageInspector.inspect_coverage(df_features)
    return {
        "status": "success",
        "coverage_report": coverage.model_dump(mode="json")
    }


@app.post("/hindcasting/run")
def run_hindcast_experiment(req: RunHindcastRequest) -> Dict[str, Any]:
    """
    Executes a historical hindcasting benchmark run across model paradigms and horizons.
    """
    exp = HindcastRunner.run_experiment(
        target_name=req.target_name,
        primary_horizon=req.primary_horizon,
        block_id=req.block_id
    )
    return {
        "status": "success",
        "experiment": exp.model_dump(mode="json")
    }


# ====================================================================
# PHASE 4E — OPERATIONAL FORECAST PRODUCTS & SCIENTIFIC EXPLAINABILITY
# ====================================================================

from .forecast import ForecastService
from .schemas.forecast import (
    ScientificForecastRecord,
    ForecastGenerateRequest,
    ForecastStatusResponse,
    ForecastAvailabilityResponse,
    ForecastListResponse,
    ForecastExplanationResponse,
    ForecastHistoryResponse,
    TargetListResponse,
    HorizonListResponse
)


@app.get("/forecasts/status")
def get_forecast_status() -> Dict[str, Any]:
    """Microservice operational forecasting readiness and status."""
    res = ForecastService.get_status()
    return res.model_dump(mode="json")


@app.get("/forecasts/availability")
def get_forecast_availability(block_id: str = "UP_LKO_BKT") -> Dict[str, Any]:
    """Data freshness, completeness, and update cadence report."""
    res = ForecastService.get_availability(block_id=block_id)
    return res.model_dump(mode="json")


@app.get("/forecasts")
def list_forecasts(
    target: Optional[str] = None,
    horizon: Optional[int] = None,
    block_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """Lists generated and persisted scientific forecast records."""
    res = ForecastService.list_forecasts(
        target=target, horizon=horizon, block_id=block_id, status=status, limit=limit
    )
    return res.model_dump(mode="json")


@app.get("/forecasts/history")
def get_forecast_history(limit: int = 100) -> Dict[str, Any]:
    """Retrieves immutable forecast history records with verification statuses."""
    res = ForecastService.get_history(limit=limit)
    return res.model_dump(mode="json")


@app.get("/forecasts/targets")
def get_forecast_targets() -> Dict[str, Any]:
    """Lists supported forecast target definitions and versions."""
    res = ForecastService.get_targets()
    return res.model_dump(mode="json")


@app.get("/forecasts/horizons")
def get_forecast_horizons() -> Dict[str, Any]:
    """Lists supported forecast lead horizons and meteorological scales."""
    res = ForecastService.get_horizons()
    return res.model_dump(mode="json")


@app.get("/forecasts/location/{block_id}")
def get_location_forecasts(block_id: str = "UP_LKO_BKT") -> Dict[str, Any]:
    """Retrieves operational forecast product portfolio for an administrative block."""
    records = ForecastService.get_location_forecasts(block_id=block_id)
    return {
        "block_id": block_id,
        "total_forecasts": len(records),
        "forecasts": [r.model_dump(mode="json") for r in records]
    }


@app.get("/forecasts/{forecast_id}")
def get_forecast_by_id(forecast_id: str) -> Dict[str, Any]:
    """Retrieves a specific scientific forecast record by immutable identifier."""
    record = ForecastService.get_forecast(forecast_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Forecast '{forecast_id}' not found.")
    return record.model_dump(mode="json")


@app.get("/forecasts/{forecast_id}/explanation")
def get_forecast_explanation(forecast_id: str) -> Dict[str, Any]:
    """Retrieves SHAP feature attributions and deterministic narrative for a forecast."""
    exp = ForecastService.get_explanation(forecast_id)
    if not exp:
        raise HTTPException(status_code=404, detail=f"Forecast '{forecast_id}' not found.")
    return exp.model_dump(mode="json")


@app.post("/forecasts/generate", status_code=201)
def generate_forecast(req: ForecastGenerateRequest) -> Dict[str, Any]:
    """
    Generates a structured forecast product through the 19-step scientific pipeline.
    Validates data freshness, model eligibility, calibration gates, and uncertainty bounds.
    """
    record = ForecastService.generate_forecast(req)
    # Auto-register in lifecycle management
    ForecastLifecycleManager.initialize_forecast(
        forecast_id=record.forecast_id,
        model_version=record.model.model_version,
        dataset_fingerprint=record.model.dataset_fingerprint,
        auto_activate=True,
    )
    return record.model_dump(mode="json")


# ====================================================================
# PHASE 4F — FORECAST LIFECYCLE, EVENT INTELLIGENCE & PRODUCTION READINESS
# ====================================================================

from .lifecycle import ForecastLifecycleManager, InvalidLifecycleTransitionError
from .forecast.freshness import ForecastFreshnessEvaluator
from .events import EventManager
from .delivery import DeliveryRouter
from .operations import ForecastExpiryProcessor, OperationalMonitor
from .schemas.lifecycle import (
    ForecastLifecycleState,
    LifecycleTransitionRequest,
)
from .schemas.events import (
    EventState,
    EventDetectionRequest,
    EventActionRequest,
)
from .schemas.delivery import (
    DeliveryMessage,
)


@app.get("/forecasts/{forecast_id}/lifecycle")
def get_forecast_lifecycle(forecast_id: str) -> Dict[str, Any]:
    """Retrieves forecast lifecycle state and complete audit trail."""
    summary = ForecastLifecycleManager.get_summary(forecast_id)
    return summary.model_dump(mode="json")


@app.post("/forecasts/{forecast_id}/lifecycle/transition")
def transition_forecast_lifecycle(forecast_id: str, req: LifecycleTransitionRequest) -> Dict[str, Any]:
    """Transitions a forecast to a new lifecycle state with deterministic validation."""
    try:
        record = ForecastLifecycleManager.transition(
            forecast_id=forecast_id,
            target_status=req.target_status,
            reason=req.reason,
            actor=req.actor or "SYSTEM",
            metadata=req.metadata,
        )
        return record.model_dump(mode="json")
    except InvalidLifecycleTransitionError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/forecasts/{forecast_id}/freshness")
def evaluate_forecast_freshness(forecast_id: str) -> Dict[str, Any]:
    """Audits data age and forecast validity window."""
    record = ForecastService.get_forecast(forecast_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Forecast '{forecast_id}' not found.")

    res = ForecastFreshnessEvaluator.evaluate(
        forecast_id=forecast_id,
        generated_at_str=record.generated_at,
        valid_from_str=record.valid_from,
        valid_until_str=record.valid_until,
        source_observation_date_str="2024-09-30",
    )
    return res.model_dump(mode="json")


@app.post("/forecasts/process-expiry")
def process_forecast_expiries() -> Dict[str, Any]:
    """Idempotently discovers expired forecasts and marks them EXPIRED."""
    res = ForecastExpiryProcessor.process_expiries()
    OperationalMonitor.record_expiry_run()
    return res.model_dump(mode="json")


@app.post("/events/detect")
def detect_events(req: EventDetectionRequest) -> Dict[str, Any]:
    """
    Evaluates eligible forecasts against Phase 4A meteorological thresholds,
    applies operational gates, deduplicates, and persists detected events.
    """
    forecasts = ForecastService.get_location_forecasts(block_id=req.block_id or "UP_LKO_BKT")
    if req.target_types:
        forecasts = [f for f in forecasts if f.target.target_type in req.target_types]

    res = EventManager.detect_events(
        forecasts=forecasts,
        cooldown_hours=req.cooldown_hours,
        actor="SYSTEM",
    )
    OperationalMonitor.record_event_detection()
    return res.model_dump(mode="json")


@app.get("/events")
def list_events(
    block_id: Optional[str] = None,
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    state: Optional[str] = None,
    limit: int = 100,
) -> Dict[str, Any]:
    """Retrieves list of detected meteorological events."""
    events = EventManager.list_events(
        block_id=block_id,
        event_type=event_type,
        severity=severity,
        state=state,
        limit=limit,
    )
    return {
        "total_events": len(events),
        "events": [e.model_dump(mode="json") for e in events],
    }


@app.get("/events/{event_id}")
def get_event_by_id(event_id: str) -> Dict[str, Any]:
    """Retrieves a single detected event by identifier."""
    event = EventManager.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found.")
    return event.model_dump(mode="json")


@app.get("/events/{event_id}/history")
def get_event_history(event_id: str) -> Dict[str, Any]:
    """Retrieves lifecycle transition history for an event."""
    history = EventManager.get_event_history(event_id)
    return {
        "event_id": event_id,
        "history": [t.model_dump(mode="json") for t in history],
    }


@app.post("/events/{event_id}/acknowledge")
def acknowledge_event(event_id: str, req: EventActionRequest) -> Dict[str, Any]:
    """Acknowledges an active event without clearing underlying historical data."""
    try:
        updated = EventManager.transition_event(
            event_id=event_id,
            target_state=EventState.ACKNOWLEDGED,
            reason=req.reason,
            actor=req.actor,
            metadata=req.metadata,
        )
        return updated.model_dump(mode="json")
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/events/{event_id}/resolve")
def resolve_event(event_id: str, req: EventActionRequest) -> Dict[str, Any]:
    """Resolves an active event."""
    try:
        updated = EventManager.transition_event(
            event_id=event_id,
            target_state=EventState.RESOLVED,
            reason=req.reason,
            actor=req.actor,
            metadata=req.metadata,
        )
        return updated.model_dump(mode="json")
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/operations/status")
def get_operations_status() -> Dict[str, Any]:
    """Consolidated operational monitoring, subsystem telemetry, and safety disclosures."""
    summary = OperationalMonitor.get_status()
    return summary.model_dump(mode="json")


@app.post("/delivery/simulate")
def simulate_delivery(msg: DeliveryMessage) -> Dict[str, Any]:
    """Dispatches a simulated internal notification payload."""
    res = DeliveryRouter.dispatch(msg)
    return res.model_dump(mode="json")


# ====================================================================
# PHASE 5A — AGRONOMIC RULES ENGINE & EXPLAINABLE ADVISORY FOUNDATION
# ====================================================================

from .agronomy.schemas import (
    CropType,
    GrowthStage,
    AdvisoryEvaluationRequest,
    AdvisoryEvaluationResponse,
    ScenarioContract,
    ScenarioResult,
    ScientificAdvisory,
    ScenarioType,
    ScenarioComparison,
    SensitivityAnalysisResult,
    ScenarioRegistryItem,
)
from .agronomy.crops import get_all_crops, get_crop
from .agronomy.registry import rule_registry
from .agronomy.advisory import advisory_engine
from .agronomy.simulator.scenarios import ScenarioSimulator
from .agronomy.simulator.provenance import ScenarioProvenanceEngine
from .agronomy.safety import AgronomicSafetyGate
from .agronomy.schemas import SafetyGateStatus


@app.get("/agronomy/status")
def get_agronomy_status() -> Dict[str, Any]:
    """
    Returns agronomic engine operational status, active crop/rule counts,
    and mandatory scientific disclosures.
    """
    rules = rule_registry.get_all_rules()
    crops = get_all_crops()
    recent_advisories = advisory_engine.list_advisories(limit=10)

    return {
        "status": "active",
        "phase": "PHASE_5A_AGRONOMIC_RULES_FOUNDATION",
        "operational_mode": "DIAGNOSTIC_ONLY",
        "operational_advisory_allowed": False,
        "active_dataset": "Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)",
        "station_coverage": "1 Station (Bakshi Ka Talab centroid)",
        "total_registered_rules": len(rules),
        "total_supported_crops": len(crops),
        "total_active_advisories": len(recent_advisories),
        "safety_gate": {
            "status": "ENFORCING",
            "evaluated_checks_count": 13,
            "blocked_imperative_directives": True,
        },
        "scientific_disclosure": (
            "Agronomic intelligence products are currently based on historical Kharif 2024 observations. "
            "All advisories operate in informational diagnostic mode. Field-level crop interventions are not certified."
        ),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/agronomy/rules")
def list_agronomy_rules(
    target: Optional[str] = None,
    crop: Optional[str] = None,
    stage: Optional[str] = None,
) -> Dict[str, Any]:
    """Retrieves all registered agronomic rules with optional filters."""
    crop_enum = CropType(crop.upper()) if crop and crop.upper() in CropType.__members__ else None
    stage_enum = GrowthStage(stage.upper()) if stage and stage.upper() in GrowthStage.__members__ else None

    if crop_enum or stage_enum or target:
        rules = rule_registry.get_applicable_rules(
            crop=crop_enum or CropType.GENERAL,
            stage=stage_enum or GrowthStage.ALL,
            target=target,
        )
    else:
        rules = rule_registry.get_all_rules()

    return {
        "total_rules": len(rules),
        "rules": [r.model_dump(mode="json") for r in rules],
    }


@app.get("/agronomy/rules/{rule_id}")
def get_agronomy_rule(rule_id: str) -> Dict[str, Any]:
    """Retrieves metadata and thresholds for a specific agronomic rule."""
    rule = rule_registry.get_rule_by_id(rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail=f"Agronomic rule '{rule_id}' not found.")
    return rule.model_dump(mode="json")


@app.get("/agronomy/crops")
def list_agronomy_crops() -> Dict[str, Any]:
    """Retrieves the controlled vocabulary of supported crops and their growth stages."""
    crops = get_all_crops()
    return {
        "total_crops": len(crops),
        "crops": [c.model_dump(mode="json") for c in crops],
    }


@app.get("/agronomy/crops/{crop_id}")
def get_agronomy_crop(crop_id: str) -> Dict[str, Any]:
    """Retrieves metadata and supported growth stages for a specific crop."""
    crop = get_crop(crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_id}' not found in registry.")
    return crop.model_dump(mode="json")


@app.post("/agronomy/evaluate")
def evaluate_agronomic_advisories(req: AdvisoryEvaluationRequest) -> Dict[str, Any]:
    """
    Evaluates applicable agronomic rules against current or specified forecast products
    for a designated crop and growth stage. Enforces 13-point Safety Gate.
    """
    res = advisory_engine.evaluate_request(req)
    return res.model_dump(mode="json")


@app.post("/agronomy/advisories/generate")
def generate_agronomic_advisories(req: AdvisoryEvaluationRequest) -> Dict[str, Any]:
    """Alias endpoint for evaluating and generating agronomic advisories."""
    res = advisory_engine.evaluate_request(req)
    return res.model_dump(mode="json")


@app.get("/agronomy/advisories")
def list_agronomic_advisories(
    block_id: Optional[str] = None,
    crop: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 50,
) -> Dict[str, Any]:
    """Lists generated and cached agronomic advisories."""
    advisories = advisory_engine.list_advisories(
        block_id=block_id,
        crop=crop,
        severity=severity,
        limit=limit,
    )
    return {
        "total_advisories": len(advisories),
        "advisories": [a.model_dump(mode="json") for a in advisories],
    }


@app.get("/agronomy/advisories/{advisory_id}")
def get_agronomic_advisory(advisory_id: str) -> Dict[str, Any]:
    """Retrieves a specific agronomic advisory by identifier."""
    adv = advisory_engine.get_advisory_by_id(advisory_id)
    if not adv:
        raise HTTPException(status_code=404, detail=f"Advisory '{advisory_id}' not found.")
    return adv.model_dump(mode="json")


@app.post("/agronomy/simulate")
def simulate_agronomic_scenario(contract: ScenarioContract) -> Dict[str, Any]:
    """
    Executes a What-If sensitivity scenario (Phase 5A / 5B compatibility).
    Classified strictly as SCENARIO_INDICATOR_ONLY (not yield predictions).
    """
    try:
        res = ScenarioSimulator.simulate(contract)
        return res.model_dump(mode="json")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ====================================================================
# PHASE 5B — ADVANCED SCENARIO ANALYSIS, SENSITIVITY & COMPARISONS
# ====================================================================

@app.get("/agronomy/scenario-registry")
def get_scenario_registry() -> Dict[str, Any]:
    """Returns the controlled registry of supported scenario types and parameter bounds."""
    items = ScenarioSimulator.get_registry()
    return {
        "status": "active",
        "phase": "PHASE_5B_ADVANCED_SCENARIO_ANALYSIS",
        "classification": "SCENARIO_INDICATOR_ONLY",
        "total_scenario_types": len(items),
        "registry": [item.model_dump(mode="json") for item in items],
        "scientific_disclaimer": (
            "This scenario evaluates meteorological and agro-meteorological sensitivity indicators only. "
            "It does not predict crop yield, biomass production, revenue, or guaranteed agronomic outcomes."
        ),
    }


@app.get("/agronomy/scenarios")
def list_scenarios(limit: int = Query(default=20, ge=1, le=100)) -> Dict[str, Any]:
    """Lists recently persisted immutable scenario artifacts."""
    artifacts = ScenarioProvenanceEngine.list_artifacts(limit=limit)
    return {
        "total_scenarios": len(artifacts),
        "scenarios": artifacts,
    }


@app.get("/agronomy/scenarios/{scenario_id}")
def get_scenario_artifact(scenario_id: str) -> Dict[str, Any]:
    """Retrieves an immutable scenario result artifact by identifier."""
    data = ScenarioProvenanceEngine.get_artifact(scenario_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Scenario artifact '{scenario_id}' not found.")
    return data


@app.post("/agronomy/scenarios/run")
def run_scenario(contract: ScenarioContract) -> Dict[str, Any]:
    """Runs a single scenario simulation with delta and envelope analysis."""
    gate_status, blocked = AgronomicSafetyGate.evaluate_scenario(contract)
    if gate_status == SafetyGateStatus.BLOCKED and blocked:
        raise HTTPException(
            status_code=422,
            detail=f"Safety gate blocked scenario: {blocked.reason_code} - {blocked.message}",
        )
    try:
        res = ScenarioSimulator.simulate(contract)
        return res.model_dump(mode="json")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/agronomy/scenarios/compare")
def compare_scenario(contract: ScenarioContract) -> Dict[str, Any]:
    """Generates baseline vs scenario comparative delta evaluation."""
    gate_status, blocked = AgronomicSafetyGate.evaluate_scenario(contract)
    if gate_status == SafetyGateStatus.BLOCKED and blocked:
        raise HTTPException(
            status_code=422,
            detail=f"Safety gate blocked scenario: {blocked.reason_code} - {blocked.message}",
        )
    try:
        comparison = ScenarioSimulator.compare(contract)
        return comparison.model_dump(mode="json")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/agronomy/scenarios/sensitivity")
def run_scenario_sensitivity(contract: ScenarioContract) -> Dict[str, Any]:
    """Runs bounded deterministic sensitivity analysis across parameter intervals."""
    gate_status, blocked = AgronomicSafetyGate.evaluate_scenario(contract)
    if gate_status == SafetyGateStatus.BLOCKED and blocked:
        raise HTTPException(
            status_code=422,
            detail=f"Safety gate blocked scenario: {blocked.reason_code} - {blocked.message}",
        )
    try:
        sens = ScenarioSimulator.sensitivity(contract)
        return sens.model_dump(mode="json")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/agronomy/scenarios/{scenario_id}/sensitivity")
def get_scenario_sensitivity(scenario_id: str) -> Dict[str, Any]:
    """Retrieves sensitivity analysis for a scenario."""
    data = ScenarioProvenanceEngine.get_artifact(scenario_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Scenario artifact '{scenario_id}' not found.")
    # Re-evaluate sensitivity from saved contract
    contract = ScenarioContract(**data.get("inputs", {}))
    sens = ScenarioSimulator.sensitivity(contract)
    return sens.model_dump(mode="json")


@app.get("/agronomy/scenarios/{scenario_id}/explanation")
def get_scenario_explanation(scenario_id: str) -> Dict[str, Any]:
    """Retrieves non-causal explanation for a scenario."""
    data = ScenarioProvenanceEngine.get_artifact(scenario_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Scenario artifact '{scenario_id}' not found.")
    explanation = data.get("explanation")
    if not explanation:
        raise HTTPException(status_code=404, detail=f"Explanation for scenario '{scenario_id}' unavailable.")
    return explanation


@app.get("/agronomy/scenarios/{scenario_id}/provenance")
def get_scenario_provenance(scenario_id: str) -> Dict[str, Any]:
    """Retrieves cryptographic provenance metadata for scenario reproducibility."""
    data = ScenarioProvenanceEngine.get_artifact(scenario_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Scenario artifact '{scenario_id}' not found.")
    provenance = data.get("provenance")
    if not provenance:
        raise HTTPException(status_code=404, detail=f"Provenance for scenario '{scenario_id}' unavailable.")
    return provenance




