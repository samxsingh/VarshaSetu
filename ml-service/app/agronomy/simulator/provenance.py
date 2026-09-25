"""
VarshaSetu - Scenario Provenance & Immutable Artifact Engine (Phase 5B)
Computes deterministic cryptographic hashes for scenario reproducibility
and manages immutable scenario artifact persistence.
"""

import os
import json
import hashlib
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.agronomy.schemas import ScenarioProvenance


ARTIFACTS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "artifacts",
    "scenarios",
)


class ScenarioProvenanceEngine:
    """Manages scenario lineage, deterministic fingerprints, and immutable storage."""

    ENGINE_VERSION = "1.0.0"
    SCENARIO_VERSION = "5B.1.0"
    DEFAULT_DATASET_FINGERPRINT = "3fec50c2ef89dbfc"  # Kharif 2024 archive fingerprint

    @classmethod
    def compute_provenance(
        cls,
        scenario_id: str,
        scenario_type: str,
        base_forecast_id: str,
        parameters: Dict[str, Any],
        dataset_fingerprint: Optional[str] = None,
    ) -> ScenarioProvenance:
        """Computes deterministic SHA-256 parameter and lineage hashes."""
        ds_fp = dataset_fingerprint or cls.DEFAULT_DATASET_FINGERPRINT
        
        # Canonical JSON for parameters
        canonical_params = json.dumps(parameters, sort_keys=True, default=str)
        param_hash = hashlib.sha256(canonical_params.encode("utf-8")).hexdigest()

        # Input feature hash combines forecast reference, scenario type, and block
        input_data = f"{ds_fp}:{base_forecast_id}:{scenario_type}:{param_hash}"
        input_hash = hashlib.sha256(input_data.encode("utf-8")).hexdigest()

        # Overall scenario fingerprint
        lineage_str = f"{input_hash}:{cls.ENGINE_VERSION}:{cls.SCENARIO_VERSION}"
        scenario_fp = hashlib.sha256(lineage_str.encode("utf-8")).hexdigest()

        return ScenarioProvenance(
            dataset_fingerprint=ds_fp,
            scenario_fingerprint=scenario_fp,
            engine_version=cls.ENGINE_VERSION,
            scenario_version=cls.SCENARIO_VERSION,
            created_at=datetime.now(timezone.utc).isoformat(),
            baseline_reference="Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)",
            parameter_hash=param_hash,
            input_feature_hash=input_hash,
        )

    @classmethod
    def save_artifact(cls, scenario_id: str, payload: Dict[str, Any]) -> str:
        """
        Saves scenario result as an immutable JSON artifact.
        Never overwrites existing files.
        """
        os.makedirs(ARTIFACTS_DIR, exist_ok=True)
        file_path = os.path.join(ARTIFACTS_DIR, f"{scenario_id}.json")

        if os.path.exists(file_path):
            # Already persisted, immutable
            return file_path

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, default=str)

        return file_path

    @classmethod
    def get_artifact(cls, scenario_id: str) -> Optional[Dict[str, Any]]:
        """Loads a stored immutable scenario artifact by ID."""
        file_path = os.path.join(ARTIFACTS_DIR, f"{scenario_id}.json")
        if not os.path.exists(file_path):
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    @classmethod
    def list_artifacts(cls, limit: int = 50) -> list:
        """Lists metadata of recently stored scenario artifacts."""
        if not os.path.exists(ARTIFACTS_DIR):
            return []

        artifacts = []
        for filename in sorted(os.listdir(ARTIFACTS_DIR), reverse=True):
            if filename.endswith(".json"):
                path = os.path.join(ARTIFACTS_DIR, filename)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        artifacts.append({
                            "scenario_id": data.get("scenario_id", filename.replace(".json", "")),
                            "scenario_type": data.get("scenario_type"),
                            "crop": data.get("crop"),
                            "crop_stage": data.get("crop_stage"),
                            "classification": data.get("classification", "SCENARIO_INDICATOR_ONLY"),
                            "timestamp": data.get("timestamp"),
                        })
                except Exception:
                    continue
            if len(artifacts) >= limit:
                break
        return artifacts
