"""
VarshaSetu - Hindcasting Artifact Manager
Handles immutable serialization and retrieval of hindcast experiment manifests
under artifacts/hindcasts/.
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from ..config import settings
from .schemas import HindcastExperimentManifest


class HindcastArtifactManager:
    """
    Manages immutable JSON records for historical hindcast evaluations.
    """

    ARTIFACT_DIR: Path = settings.ARTIFACTS_DIR / "hindcasts"

    @classmethod
    def get_artifact_dir(cls) -> Path:
        cls.ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
        return cls.ARTIFACT_DIR

    @classmethod
    def save_manifest(cls, manifest: HindcastExperimentManifest) -> Path:
        """
        Saves experiment manifest as an immutable JSON file.
        """
        dir_path = cls.get_artifact_dir()
        file_path = dir_path / f"{manifest.experiment_id}.json"

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(manifest.model_dump_json(indent=2))

        return file_path

    @classmethod
    def load_manifest(cls, experiment_id: str) -> Optional[HindcastExperimentManifest]:
        """
        Loads manifest by experiment_id or filename.
        """
        dir_path = cls.get_artifact_dir()
        filename = experiment_id if experiment_id.endswith(".json") else f"{experiment_id}.json"
        file_path = dir_path / filename

        if not file_path.exists():
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return HindcastExperimentManifest(**data)

    @classmethod
    def list_manifests(cls) -> List[Dict[str, Any]]:
        """
        Lists summary metadata for all saved hindcast experiments.
        """
        dir_path = cls.get_artifact_dir()
        manifests: List[Dict[str, Any]] = []

        for p in sorted(dir_path.glob("*.json"), reverse=True):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    manifests.append({
                        "experiment_id": data.get("experiment_id"),
                        "created_at": data.get("created_at"),
                        "target_name": data.get("target_name"),
                        "horizon_days": data.get("horizon_days"),
                        "models_evaluated": data.get("models_evaluated", []),
                        "multiyear_gate_status": data.get("multiyear_gate_status"),
                        "operational_validation_allowed": data.get("operational_validation_allowed", False),
                        "file_path": str(p)
                    })
            except Exception:
                continue

        return manifests
