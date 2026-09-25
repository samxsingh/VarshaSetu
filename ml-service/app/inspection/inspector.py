from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from pydantic import BaseModel, Field
from ..config import settings

class ColumnStats(BaseModel):
    name: str
    dtype: str
    null_count: int
    null_percentage: float
    min_value: Optional[str] = None
    max_value: Optional[str] = None

class DatasetInspectionReport(BaseModel):
    dataset_name: str
    file_path: str
    rows: int
    columns: int
    column_names: List[str]
    date_min: Optional[str] = None
    date_max: Optional[str] = None
    temporal_frequency: Optional[str] = None
    duplicate_count: int
    missing_percentage: float
    geography_count: int
    geographies: List[str] = Field(default_factory=list)
    quality_summary: Dict[str, int] = Field(default_factory=dict)
    column_details: List[ColumnStats] = Field(default_factory=list)

class DataInspector:
    """Machine-readable and programmatic data inspection utility for VarshaSetu meteorological datasets."""

    @classmethod
    def inspect_file(cls, file_path: Path) -> DatasetInspectionReport:
        if not file_path.exists():
            raise FileNotFoundError(f"Dataset file not found: {file_path}")

        df = pd.read_parquet(file_path)
        rows, cols = df.shape

        # Date range & temporal frequency
        date_min = None
        date_max = None
        temporal_freq = None
        if "date" in df.columns:
            date_col = pd.to_datetime(df["date"])
            date_min = str(date_col.min().date())
            date_max = str(date_col.max().date())
            if len(date_col.unique()) > 1:
                diffs = date_col.drop_duplicates().sort_values().diff().dropna()
                median_days = diffs.dt.total_seconds().median() / 86400
                if median_days >= 25:
                    temporal_freq = "MONTHLY"
                elif median_days >= 6:
                    temporal_freq = "WEEKLY"
                elif median_days >= 0.8:
                    temporal_freq = "DAILY"
                else:
                    temporal_freq = "SUBDAILY"

        # Duplicate count
        duplicate_count = int(df.duplicated().sum())

        # Missing values
        total_cells = rows * cols
        null_cells = int(df.isnull().sum().sum())
        missing_pct = round((null_cells / total_cells * 100) if total_cells > 0 else 0.0, 2)

        # Geographies
        geos: List[str] = []
        if "block_name" in df.columns:
            geos = [str(b) for b in df["block_name"].dropna().unique().tolist()]
        elif "block_code" in df.columns:
            geos = [str(b) for b in df["block_code"].dropna().unique().tolist()]
        elif "latitude" in df.columns and "longitude" in df.columns:
            pts = df[["latitude", "longitude"]].drop_duplicates()
            geos = [f"{row.latitude:.4f},{row.longitude:.4f}" for row in pts.itertuples()]

        # Quality flags
        quality_counts: Dict[str, int] = {}
        if "quality_flag" in df.columns:
            quality_counts = {str(k): int(v) for k, v in df["quality_flag"].value_counts().items()}

        # Detailed column stats
        column_details: List[ColumnStats] = []
        for col in df.columns:
            null_cnt = int(df[col].isnull().sum())
            null_p = round((null_cnt / rows * 100) if rows > 0 else 0.0, 2)
            valid_vals = df[col].dropna()
            min_val = str(valid_vals.min()) if not valid_vals.empty else None
            max_val = str(valid_vals.max()) if not valid_vals.empty else None

            column_details.append(
                ColumnStats(
                    name=str(col),
                    dtype=str(df[col].dtype),
                    null_count=null_cnt,
                    null_percentage=null_p,
                    min_value=min_val,
                    max_value=max_val,
                )
            )

        return DatasetInspectionReport(
            dataset_name=file_path.stem,
            file_path=str(file_path),
            rows=rows,
            columns=cols,
            column_names=[str(c) for c in df.columns.tolist()],
            date_min=date_min,
            date_max=date_max,
            temporal_frequency=temporal_freq,
            duplicate_count=duplicate_count,
            missing_percentage=missing_pct,
            geography_count=len(geos),
            geographies=geos,
            quality_summary=quality_counts,
            column_details=column_details,
        )

    @classmethod
    def inspect_all(cls) -> Dict[str, DatasetInspectionReport]:
        reports = {}
        # Processed datasets
        for p in settings.PROCESSED_DATA_DIR.glob("*.parquet"):
            reports[p.stem] = cls.inspect_file(p)
        # Feature datasets
        for p in settings.FEATURE_DATA_DIR.glob("*.parquet"):
            reports[p.stem] = cls.inspect_file(p)
        return reports
