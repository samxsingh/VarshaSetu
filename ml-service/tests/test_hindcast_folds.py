"""
Tests for Walk-Forward Hindcasting Fold Generator.
Verifies temporal ordering, zero future leakage, and deterministic fold definitions.
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from app.hindcasting.folds import generate_hindcast_folds


def create_test_timeseries(num_years: int = 4, days_per_year: int = 120) -> pd.DataFrame:
    records = []
    base_year = 2020
    for y in range(num_years):
        yr = base_year + y
        st = datetime(yr, 6, 1)
        for d in range(days_per_year):
            dt = st + timedelta(days=d)
            records.append({
                "date": dt,
                "rainfall_1d": float(d % 10),
                "target_heavy_rain_7d": 1 if d % 7 == 0 else 0
            })
    return pd.DataFrame(records)


def test_multiyear_folds_temporal_integrity():
    df = create_test_timeseries(num_years=4, days_per_year=100)
    folds = generate_hindcast_folds(df, date_col="date")

    assert len(folds) >= 2
    for fold in folds:
        train_start = pd.to_datetime(fold.train_start)
        train_end = pd.to_datetime(fold.train_end)
        val_start = pd.to_datetime(fold.validation_start)
        val_end = pd.to_datetime(fold.validation_end)
        test_start = pd.to_datetime(fold.test_start)
        test_end = pd.to_datetime(fold.test_end)

        # Zero leakage assertion
        assert train_start <= train_end
        assert train_end < val_start
        assert val_start <= val_end
        assert val_end < test_start
        assert test_start <= test_end

        # Folds must have positive record counts
        assert fold.training_rows > 0
        assert fold.validation_rows > 0
        assert fold.test_rows > 0
        assert len(fold.dataset_fingerprint) > 0


def test_single_season_diagnostic_folds():
    # 122 days for Kharif single-season
    df = create_test_timeseries(num_years=1, days_per_year=122)
    folds = generate_hindcast_folds(df, date_col="date")

    assert len(folds) >= 1
    for fold in folds:
        train_end = pd.to_datetime(fold.train_end)
        val_start = pd.to_datetime(fold.validation_start)
        val_end = pd.to_datetime(fold.validation_end)
        test_start = pd.to_datetime(fold.test_start)

        assert train_end < val_start
        assert val_end < test_start
        assert fold.test_year == 2020


def test_empty_dataframe_folds():
    folds = generate_hindcast_folds(pd.DataFrame())
    assert folds == []
