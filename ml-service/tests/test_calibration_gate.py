"""
Tests for Calibration Data Gate (Phase 4C)
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from app.calibration.schemas import CalibrationGateStatus
from app.calibration.data_gate import CalibrationDataGate


def test_insufficient_dataset_blocks_operational_calibration():
    gate = CalibrationDataGate(min_calibration_samples=100, min_calibration_years=5)
    # Kharif single-season sample (122 days)
    dates = [datetime(2024, 6, 1) + timedelta(days=i) for i in range(122)]
    df = pd.DataFrame({
        "date": dates,
        "target_heavy_rain_7d": np.random.choice([0, 1], size=122, p=[0.85, 0.15])
    })
    train_df = df.iloc[:85]
    val_df = df.iloc[85:103]
    test_df = df.iloc[103:]

    report = gate.evaluate(train_df, val_df, test_df, target_col="target_heavy_rain_7d")

    assert report.operational_calibration_allowed is False
    assert report.status in [CalibrationGateStatus.INSUFFICIENT_DATA, CalibrationGateStatus.DIAGNOSTIC_ONLY]
    assert any("does not satisfy multi-year requirement" in f for f in report.failed_checks)


def test_sufficient_multi_year_dataset_passes():
    gate = CalibrationDataGate(
        min_calibration_samples=60,
        min_calibration_positive=10,
        min_calibration_negative=10,
        min_calibration_years=3,
        min_test_samples=20
    )
    # 5 years of daily data (approx 1800 days)
    dates = [datetime(2019, 1, 1) + timedelta(days=i) for i in range(1800)]
    df = pd.DataFrame({
        "date": dates,
        "target_heavy_rain_7d": np.random.choice([0, 1], size=1800, p=[0.7, 0.3])
    })
    train_df = df.iloc[:1200]
    val_df = df.iloc[1200:1500]
    test_df = df.iloc[1500:]

    report = gate.evaluate(train_df, val_df, test_df, target_col="target_heavy_rain_7d")

    assert report.operational_calibration_allowed is True
    assert report.status == CalibrationGateStatus.PASSED
    assert len(report.failed_checks) == 0


def test_missingness_fails_data_gate():
    gate = CalibrationDataGate(max_missingness_ratio=0.10)
    dates = [datetime(2024, 1, 1) + timedelta(days=i) for i in range(100)]
    targets = [1, 0, np.nan, np.nan, np.nan, 0, 1, np.nan, 0, 1] * 10
    df = pd.DataFrame({"date": dates, "target": targets})
    train_df = df.iloc[:70]
    val_df = df.iloc[70:85]
    test_df = df.iloc[85:]

    report = gate.evaluate(train_df, val_df, test_df, target_col="target")
    assert any("High target missingness" in f for f in report.failed_checks)
