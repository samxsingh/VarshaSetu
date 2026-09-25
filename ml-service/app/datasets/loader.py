"""
VarshaSetu - Dataset Loader
Safe, validated data loader for parquet and csv datasets registered in DatasetCatalog.
"""

import os
from typing import Optional, Tuple
import pandas as pd
from .catalog import DatasetCatalog, DatasetMetadata
from .fingerprint import fingerprint_dataset, DatasetFingerprint


class DatasetLoader:
    def __init__(self, catalog: Optional[DatasetCatalog] = None):
        self.catalog = catalog or DatasetCatalog()

    def load(self, dataset_id: str, verify_checksum: bool = False) -> Tuple[pd.DataFrame, DatasetMetadata]:
        meta = self.catalog.get_dataset(dataset_id)
        if not meta:
            raise KeyError(f"Dataset '{dataset_id}' not found in catalog.")

        full_path = os.path.join(self.catalog.base_dir, meta.relative_path)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"File for dataset '{dataset_id}' not found at {full_path}")

        if verify_checksum and meta.fingerprint:
            current_fp = fingerprint_dataset(full_path)
            if current_fp.sha256_checksum != meta.fingerprint.sha256_checksum:
                raise ValueError(
                    f"Checksum mismatch for '{dataset_id}': expected {meta.fingerprint.sha256_checksum}, got {current_fp.sha256_checksum}"
                )

        if full_path.endswith(".parquet"):
            df = pd.read_parquet(full_path)
        elif full_path.endswith(".csv"):
            df = pd.read_csv(full_path)
        else:
            raise ValueError(f"Unsupported format: {full_path}")

        # Ensure date format is standardized if present
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"])

        return df, meta
