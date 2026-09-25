"""
VarshaSetu - Historical Dataset Expansion Pathways
Defines automated pathways for expanding short-term observations (e.g., Kharif 2024)
into multi-decade historical archives (ERA5-Land 1950-present, IMD gridded rainfall).
Provides schema validation and monotonic date verification for joined archives.
"""

from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np


class HistoricalExpansionPathway(BaseModel):
    pathway_id: str
    name: str
    target_provider: str
    expected_variables: List[str]
    start_year: int
    end_year: int
    resolution: str
    documentation_url: str
    status: str = "CONFIGURED"  # CONFIGURED, DOWNLOADING, INGESTED, VERIFIED


class MultiYearValidationResult(BaseModel):
    valid: bool
    total_records: int
    earliest_date: str
    latest_date: str
    gap_count: int
    duplicate_count: int
    missing_variables: List[str]
    warnings: List[str] = Field(default_factory=list)


AVAILABLE_PATHWAYS = [
    HistoricalExpansionPathway(
        pathway_id="era5_land_daily_historical",
        name="ECMWF ERA5-Land Multi-Decadal Historical Surface Archive",
        target_provider="ECMWF Copernicus Climate Change Service (C3S)",
        expected_variables=["rainfall", "temp_min", "temp_max", "temp_mean", "humidity", "wind_speed", "surface_pressure"],
        start_year=1980,
        end_year=2024,
        resolution="0.1 deg (~9 km gridded)",
        documentation_url="https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land",
        status="CONFIGURED"
    ),
    HistoricalExpansionPathway(
        pathway_id="imd_gridded_rainfall_025",
        name="IMD High Resolution Daily Gridded Rainfall (0.25° x 0.25°)",
        target_provider="India Meteorological Department (IMD Pune)",
        expected_variables=["rainfall"],
        start_year=1901,
        end_year=2024,
        resolution="0.25 deg (~25 km gridded)",
        documentation_url="https://imdpune.gov.in/cmpg/Griddata/Rainfall_25_Bin.html",
        status="CONFIGURED"
    )
]


def validate_and_merge_multi_year(
    slices: List[pd.DataFrame],
    required_variables: List[str],
    date_col: str = "date"
) -> Tuple[MultiYearValidationResult, pd.DataFrame]:
    """
    Validates and merges multi-year slice DataFrames into a unified continuous time series.
    """
    warnings = []
    if not slices:
        return MultiYearValidationResult(
            valid=False,
            total_records=0,
            earliest_date="",
            latest_date="",
            gap_count=0,
            duplicate_count=0,
            missing_variables=required_variables,
            warnings=["No data slices provided for merge."]
        ), pd.DataFrame()

    merged = pd.concat(slices, ignore_index=True)
    if date_col not in merged.columns:
        return MultiYearValidationResult(
            valid=False,
            total_records=len(merged),
            earliest_date="",
            latest_date="",
            gap_count=0,
            duplicate_count=0,
            missing_variables=required_variables,
            warnings=[f"Date column '{date_col}' missing from concatenated dataset."]
        ), merged

    merged[date_col] = pd.to_datetime(merged[date_col])
    merged = merged.sort_values(by=date_col)

    # Check duplicates
    dups = int(merged.duplicated(subset=[date_col]).sum())
    if dups > 0:
        warnings.append(f"Found {dups} duplicate date records. Dropping duplicates keeping first.")
        merged = merged.drop_duplicates(subset=[date_col], keep="first")

    # Missing variables
    missing_vars = [v for v in required_variables if v not in merged.columns]
    if missing_vars:
        warnings.append(f"Missing required variables: {missing_vars}")

    # Check date continuity
    earliest = merged[date_col].min()
    latest = merged[date_col].max()
    expected_days = (latest - earliest).days + 1
    actual_days = merged[date_col].nunique()
    gap_count = max(0, expected_days - actual_days)
    if gap_count > 0:
        warnings.append(f"Detected {gap_count} missing days across the time-span.")

    valid = (len(missing_vars) == 0 and gap_count < 0.1 * expected_days)

    res = MultiYearValidationResult(
        valid=valid,
        total_records=len(merged),
        earliest_date=str(earliest.date()),
        latest_date=str(latest.date()),
        gap_count=gap_count,
        duplicate_count=dups,
        missing_variables=missing_vars,
        warnings=warnings
    )
    return res, merged


Tuple_Result = tuple[MultiYearValidationResult, pd.DataFrame]
