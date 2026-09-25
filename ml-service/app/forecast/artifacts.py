"""
VarshaSetu - Forecast Artifact Manager
Persists and retrieves immutable scientific forecast records as JSON artifacts.
Never overwrites historical forecasts; provides deterministic indexing and retrieval.
"""

import os
import json
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from ..config import settings
from ..schemas.forecast import ScientificForecastRecord, ForecastHistoryItem


class ForecastArtifactManager:
    """
    Manages immutable JSON forecast records stored under ml-service/artifacts/forecasts/.
    """

    @classmethod
    def get_artifacts_dir(cls) -> Path:
        d = settings.ARTIFACTS_DIR / "forecasts"
        d.mkdir(parents=True, exist_ok=True)
        return d

    @classmethod
    def save_forecast(cls, record: ScientificForecastRecord) -> str:
        """
        Saves a scientific forecast record as an immutable JSON file.
        """
        artifacts_dir = cls.get_artifacts_dir()
        filename = f"{record.forecast_id}.json"
        filepath = artifacts_dir / filename

        # If file already exists, avoid overwriting by suffixing uuid
        if filepath.exists():
            unique_suffix = uuid.uuid4().hex[:6]
            filepath = artifacts_dir / f"{record.forecast_id}_{unique_suffix}.json"

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(record.model_dump(), f, indent=2, default=str)

        return str(filepath)

    @classmethod
    def get_forecast(cls, forecast_id: str) -> Optional[ScientificForecastRecord]:
        """
        Retrieves a forecast record by forecast_id.
        """
        artifacts_dir = cls.get_artifacts_dir()
        target_file = artifacts_dir / f"{forecast_id}.json"

        if target_file.exists():
            try:
                with open(target_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return ScientificForecastRecord(**data)
            except Exception:
                return None

        # Try prefix matching
        for f in artifacts_dir.glob(f"{forecast_id}*.json"):
            try:
                with open(f, "r", encoding="utf-8") as fp:
                    data = json.load(fp)
                return ScientificForecastRecord(**data)
            except Exception:
                continue

        return None

    @classmethod
    def list_forecasts(
        cls,
        target: Optional[str] = None,
        horizon: Optional[int] = None,
        block_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[ScientificForecastRecord]:
        """
        Lists stored forecast records matching optional filters.
        """
        artifacts_dir = cls.get_artifacts_dir()
        records: List[ScientificForecastRecord] = []

        files = sorted(artifacts_dir.glob("*.json"), key=os.path.getmtime, reverse=True)

        for f in files:
            if len(records) >= limit:
                break
            try:
                with open(f, "r", encoding="utf-8") as fp:
                    data = json.load(fp)
                rec = ScientificForecastRecord(**data)

                # Filter checks
                if target and rec.target.target_type.upper() != target.upper():
                    continue
                if horizon and rec.horizon.horizon_days != horizon:
                    continue
                if block_id and rec.location.block_id != block_id:
                    continue
                if status and rec.scientific_disclosure.status.upper() != status.upper():
                    continue

                records.append(rec)
            except Exception:
                continue

        return records

    @classmethod
    def get_history(cls, limit: int = 100) -> List[ForecastHistoryItem]:
        """
        Retrieves lightweight forecast history items for tracking and verification.
        """
        artifacts_dir = cls.get_artifacts_dir()
        items: List[ForecastHistoryItem] = []

        files = sorted(artifacts_dir.glob("*.json"), key=os.path.getmtime, reverse=True)

        for f in files:
            if len(items) >= limit:
                break
            try:
                with open(f, "r", encoding="utf-8") as fp:
                    data = json.load(fp)

                item = ForecastHistoryItem(
                    forecast_id=data.get("forecast_id", f.stem),
                    generated_at=data.get("generated_at", ""),
                    valid_from=data.get("valid_from", ""),
                    valid_until=data.get("valid_until", ""),
                    target_name=data.get("target", {}).get("target_type", "UNKNOWN"),
                    horizon_days=data.get("horizon", {}).get("horizon_days", 7),
                    model_id=data.get("model", {}).get("model_id", "unknown"),
                    model_version=data.get("model", {}).get("model_version", "1.0.0"),
                    dataset_fingerprint=data.get("model", {}).get("dataset_fingerprint", "unknown"),
                    probability=data.get("prediction", {}).get("probability"),
                    predicted_value=data.get("prediction", {}).get("predicted_value"),
                    status=data.get("scientific_disclosure", {}).get("status", "DIAGNOSTIC_ONLY"),
                    verification_status="PENDING",
                    verification_error=None
                )
                items.append(item)
            except Exception:
                continue

        return items
