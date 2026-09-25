import json
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from ..config import settings

class ExperimentRecord(BaseModel):
    experiment_id: str
    model_name: str
    model_version: str
    feature_set_version: str
    target_name: str
    target_version: str
    horizon_days: int
    training_period: str
    validation_period: str
    test_period: str
    geography: str
    created_at: str
    metrics: Dict[str, Any]
    comparison_to_climatology: Optional[Dict[str, Any]] = None
    calibration_status: str = "NOT_CALIBRATED"
    dataset_version: str = "1.0.0"
    git_commit: Optional[str] = None
    status: str = "EVALUATED"
    notes: Optional[str] = None

class ExperimentRegistry:
    """
    Reproducible ML Experiment Registry for Baseline & Future Downscaling Models.
    Persists experiment run manifests, hyperparameter configs, and evaluation metrics.
    """

    @classmethod
    def _get_git_commit(cls) -> Optional[str]:
        try:
            res = subprocess.run(
                ["git", "rev-parse", "--short", "HEAD"],
                capture_output=True,
                text=True,
                cwd=str(settings.BASE_DIR)
            )
            if res.returncode == 0:
                return res.stdout.strip()
        except Exception:
            pass
        return None

    @classmethod
    def record_experiment(
        cls,
        model_name: str,
        target_name: str,
        horizon_days: int,
        training_period: str,
        validation_period: str,
        test_period: str,
        metrics: Dict[str, Any],
        comparison_to_climatology: Optional[Dict[str, Any]] = None,
        calibration_status: str = "NOT_CALIBRATED",
        geography: str = "UP_LKO_BKT",
        status: str = "EVALUATED",
        notes: Optional[str] = None
    ) -> ExperimentRecord:
        exp_id = f"exp_{target_name.lower()}_{horizon_days}d_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        git_hash = cls._get_git_commit()

        record = ExperimentRecord(
            experiment_id=exp_id,
            model_name=model_name,
            model_version="1.0.0-baseline",
            feature_set_version="1.0.0",
            target_name=target_name,
            target_version="1.0.0",
            horizon_days=horizon_days,
            training_period=training_period,
            validation_period=validation_period,
            test_period=test_period,
            geography=geography,
            created_at=datetime.utcnow().isoformat(),
            metrics=metrics,
            comparison_to_climatology=comparison_to_climatology,
            calibration_status=calibration_status,
            dataset_version="1.0.0",
            git_commit=git_hash,
            status=status,
            notes=notes
        )

        out_path = settings.EXPERIMENTS_DIR / f"{exp_id}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(record.model_dump(mode="json"), f, indent=2)

        return record

    @classmethod
    def list_experiments(cls) -> List[ExperimentRecord]:
        experiments = []
        for p in sorted(settings.EXPERIMENTS_DIR.glob("exp_*.json"), reverse=True):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    experiments.append(ExperimentRecord(**data))
            except Exception:
                continue
        return experiments

    @classmethod
    def get_experiment(cls, exp_id: str) -> Optional[ExperimentRecord]:
        p = settings.EXPERIMENTS_DIR / f"{exp_id}.json"
        if not p.exists():
            return None
        with open(p, "r", encoding="utf-8") as f:
            data = json.load(f)
            return ExperimentRecord(**data)
