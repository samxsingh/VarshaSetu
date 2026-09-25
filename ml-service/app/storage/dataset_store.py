import json
from pathlib import Path
from typing import Optional, Dict, Any, List
import pandas as pd
from ..schemas.provenance import ProvenanceMetadata
from ..config import settings

class DatasetStore:
    @classmethod
    def save_processed(cls, dataset_name: str, df: pd.DataFrame, metadata: ProvenanceMetadata) -> Path:
        """Save normalized dataset as Apache Parquet with sidecar provenance metadata."""
        parquet_path = settings.PROCESSED_DATA_DIR / f"{dataset_name}.parquet"
        meta_path = settings.PROCESSED_DATA_DIR / f"{dataset_name}_meta.json"
        
        # Save Parquet
        df.to_parquet(parquet_path, engine="pyarrow", index=False)
        
        # Save JSON metadata sidecar
        meta_dict = metadata.model_dump(mode="json")
        meta_dict["num_records"] = len(df)
        meta_dict["columns"] = list(df.columns)
        meta_path.write_text(json.dumps(meta_dict, indent=2, default=str), encoding="utf-8")
        
        return parquet_path

    @classmethod
    def save_features(cls, feature_set_name: str, df: pd.DataFrame, metadata: ProvenanceMetadata) -> Path:
        """Save ML-ready feature dataset for consumption by Phase 4."""
        parquet_path = settings.FEATURE_DATA_DIR / f"{feature_set_name}.parquet"
        meta_path = settings.FEATURE_DATA_DIR / f"{feature_set_name}_meta.json"
        
        df.to_parquet(parquet_path, engine="pyarrow", index=False)
        
        meta_dict = metadata.model_dump(mode="json")
        meta_dict["num_records"] = len(df)
        meta_dict["feature_columns"] = list(df.columns)
        meta_path.write_text(json.dumps(meta_dict, indent=2, default=str), encoding="utf-8")
        
        return parquet_path

    @classmethod
    def load_processed(cls, dataset_name: str) -> Optional[pd.DataFrame]:
        parquet_path = settings.PROCESSED_DATA_DIR / f"{dataset_name}.parquet"
        if not parquet_path.exists():
            return None
        return pd.read_parquet(parquet_path, engine="pyarrow")

    @classmethod
    def load_features(cls, feature_set_name: str) -> Optional[pd.DataFrame]:
        parquet_path = settings.FEATURE_DATA_DIR / f"{feature_set_name}.parquet"
        if not parquet_path.exists():
            return None
        return pd.read_parquet(parquet_path, engine="pyarrow")

    @classmethod
    def list_available_datasets(cls) -> List[Dict[str, Any]]:
        """List all stored Parquet datasets and their sidecar metadata."""
        results = []
        for meta_file in settings.PROCESSED_DATA_DIR.glob("*_meta.json"):
            try:
                data = json.loads(meta_file.read_text(encoding="utf-8"))
                results.append(data)
            except Exception:
                continue
        for meta_file in settings.FEATURE_DATA_DIR.glob("*_meta.json"):
            try:
                data = json.loads(meta_file.read_text(encoding="utf-8"))
                data["is_feature_set"] = True
                results.append(data)
            except Exception:
                continue
        return results
