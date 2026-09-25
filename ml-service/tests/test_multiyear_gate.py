"""
Tests for MultiYearValidationGate in VarshaSetu.
Verifies data sufficiency rules, complete season counts, event balance,
and scientific honesty on single-season Kharif 2024 archive.
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from app.validation.multiyear_gate import (
    MultiYearValidationGate,
    MultiYearGateStatus,
    MultiYearGateReport
)


def create_synthetic_multiyear_df(num_years: int = 5, days_per_year: int = 120) -> pd.DataFrame:
    records = []
    base_year = 2018
    for y_offset in range(num_years):
        year = base_year + y_offset
        start_date = datetime(year, 6, 1)
        for d in range(days_per_year):
            dt = start_date + timedelta(days=d)
            records.append({
                "date": dt,
                "block_id": "UP_LKO_BKT",
                "rainfall_1d": np.random.exponential(5.0),
                "temperature_2m_max_c": np.random.normal(32.0, 3.0),
                "temperature_2m_min_c": np.random.normal(24.0, 2.0),
                "surface_pressure_hpa": np.random.normal(1005.0, 4.0),
                "wind_speed_10m_mps": np.random.uniform(1.0, 8.0),
                "target_heavy_rain_7d": 1 if np.random.rand() > 0.8 else 0,
                "target_dry_spell_7d": 1 if np.random.rand() > 0.85 else 0,
            })
    return pd.DataFrame(records)


def test_multiyear_gate_sufficient():
    df = create_synthetic_multiyear_df(num_years=5, days_per_year=100)
    report = MultiYearValidationGate.evaluate(
        df=df,
        date_col="date",
        min_years=5,
        min_seasons=5,
        min_obs_per_year=90
    )

    assert report.status == MultiYearGateStatus.SUFFICIENT
    assert report.total_years == 5
    assert len(report.complete_seasons) == 5
    assert report.operational_validation_allowed is True
    assert report.schema_consistent is True


def test_multiyear_gate_insufficient_single_season():
    # 122 days for 2024 (Kharif single-season observation reality)
    df = create_synthetic_multiyear_df(num_years=1, days_per_year=122)
    report = MultiYearValidationGate.evaluate(
        df=df,
        date_col="date",
        min_years=5,
        min_seasons=5,
        min_obs_per_year=90
    )

    assert report.status == MultiYearGateStatus.INSUFFICIENT_DATA
    assert report.total_years == 1
    assert report.operational_validation_allowed is False
    assert len(report.exclusion_reasons) > 0
    assert "Current observational archive contains only 1 season(s)" in report.scientific_notes


def test_multiyear_gate_partial_status():
    df = create_synthetic_multiyear_df(num_years=2, days_per_year=100)
    report = MultiYearValidationGate.evaluate(
        df=df,
        date_col="date",
        min_years=5,
        min_seasons=5,
        min_obs_per_year=90
    )

    assert report.status == MultiYearGateStatus.PARTIAL
    assert report.total_years == 2
    assert report.operational_validation_allowed is False
    assert "suitable only for exploratory historical diagnostic checks" in report.scientific_notes


def test_multiyear_gate_missing_required_columns():
    df = create_synthetic_multiyear_df(num_years=5, days_per_year=100)
    df = df.drop(columns=["wind_speed_10m_mps", "surface_pressure_hpa"])

    report = MultiYearValidationGate.evaluate(df=df, date_col="date")
    assert report.schema_consistent is False
    assert report.operational_validation_allowed is False
    assert any("Missing core meteorological variables" in r for r in report.exclusion_reasons)


def test_multiyear_gate_empty_dataset():
    empty_df = pd.DataFrame()
    report = MultiYearValidationGate.evaluate(df=empty_df)
    assert report.status == MultiYearGateStatus.INSUFFICIENT_DATA
    assert report.operational_validation_allowed is False
    assert report.total_years == 0
