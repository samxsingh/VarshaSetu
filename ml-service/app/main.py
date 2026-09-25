from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from datetime import datetime
import psycopg2

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
            registered.append({
                "model_id": data.get("model_id", f.stem),
                "target_name": data.get("target_name", "unknown"),
                "model_type": data.get("config", {}).get("model_type", "unknown"),
                "task_type": data.get("config", {}).get("task_type", "classification"),
                "feature_count": len(data.get("feature_names", [])),
                "is_calibrated": meta.get("is_calibrated", False),
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
