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
# PHASE 4A — SCIENTIFIC ML & BASELINE FORECASTING ENDPOINTS
# ====================================================================

from .inspection.inspector import DataInspector
from .experiments.registry import ExperimentRegistry
from .training.pipeline import BaselineTrainingPipeline

@app.get("/inspection/datasets")
def inspect_all_datasets() -> Dict[str, Any]:
    """Inspect all Phase 3 processed and engineered datasets."""
    reports = DataInspector.inspect_all()
    return {
        "status": "success",
        "datasets": {k: v.model_dump(mode="json") for k, v in reports.items()}
    }

@app.get("/models/status")
def get_models_status() -> Dict[str, Any]:
    """Model operational readiness and Phase 4A baseline registry status."""
    experiments = ExperimentRegistry.list_experiments()
    return {
        "service": settings.SERVICE_NAME,
        "phase": "PHASE_4A_BASELINE_STAGE",
        "operational_status": "BASELINE_EVALUATION_ACTIVE",
        "operational_inference_available": False,
        "message": "Forecast models are in Phase 4A baseline evaluation stage. Operational downscaling pending Phase 4B.",
        "active_baselines": [
            "LogisticRegressionBaseline (HEAVY_RAIN 7d, 14d)",
            "LogisticRegressionBaseline (DRY_SPELL 7d, 14d)",
            "RidgeRegressionBaseline (RAINFALL_AMOUNT 7d, 14d)"
        ],
        "total_experiments_recorded": len(experiments),
        "latest_experiment": experiments[0].model_dump(mode="json") if experiments else None
    }

@app.get("/models/experiments")
def list_experiments() -> Dict[str, Any]:
    """List all recorded ML baseline experiments with metrics and climatology comparisons."""
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
