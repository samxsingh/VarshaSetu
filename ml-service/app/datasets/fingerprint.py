"""
VarshaSetu - Dataset Fingerprinting
Calculates SHA256 checksums, content digests, and schema hashes to verify
dataset integrity and immutability across training runs.
"""

import hashlib
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel
import pandas as pd


class DatasetFingerprint(BaseModel):
    file_path: str
    file_size_bytes: int
    sha256_checksum: str
    row_count: int
    column_count: int
    column_names: list[str]
    earliest_date: Optional[str] = None
    latest_date: Optional[str] = None
    fingerprint_hash: str


def compute_file_sha256(file_path: str, chunk_size: int = 65536) -> str:
    """Computes SHA256 hash of a file on disk."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(chunk_size):
            hasher.update(chunk)
    return hasher.hexdigest()


def fingerprint_dataset(file_path: str, date_col: Optional[str] = "date") -> DatasetFingerprint:
    """
    Computes a comprehensive fingerprint for a parquet or csv file.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file does not exist: {file_path}")

    file_size = os.path.getsize(file_path)
    sha256 = compute_file_sha256(file_path)

    # Read schema/meta
    if file_path.endswith(".parquet"):
        df = pd.read_parquet(file_path)
    elif file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        raise ValueError(f"Unsupported dataset format: {file_path}")

    row_count = len(df)
    col_names = sorted(list(df.columns))
    col_count = len(col_names)

    earliest = None
    latest = None
    if date_col and date_col in df.columns and not df.empty:
        try:
            d_series = pd.to_datetime(df[date_col]).dropna()
            if not d_series.empty:
                earliest = str(d_series.min().date())
                latest = str(d_series.max().date())
        except Exception:
            pass

    # Unique digest incorporating content metrics
    summary_str = f"{sha256}:{row_count}:{','.join(col_names)}:{earliest}:{latest}"
    fingerprint_hash = hashlib.sha256(summary_str.encode("utf-8")).hexdigest()[:16]

    return DatasetFingerprint(
        file_path=os.path.abspath(file_path),
        file_size_bytes=file_size,
        sha256_checksum=sha256,
        row_count=row_count,
        column_count=col_count,
        column_names=col_names,
        earliest_date=earliest,
        latest_date=latest,
        fingerprint_hash=fingerprint_hash
    )


def compute_dataframe_fingerprint(df: pd.DataFrame) -> str:
    """
    Computes a deterministic content SHA256 digest for an in-memory DataFrame.
    """
    if df is None or len(df) == 0:
        return "empty_dataframe_0000000000000000"

    hasher = hashlib.sha256()
    hasher.update(str(df.shape).encode("utf-8"))
    hasher.update(",".join(sorted(df.columns)).encode("utf-8"))
    try:
        sample_str = f"{df.iloc[0].to_dict()}:{df.iloc[-1].to_dict()}"
        hasher.update(sample_str.encode("utf-8"))
    except Exception:
        pass
    return hasher.hexdigest()

