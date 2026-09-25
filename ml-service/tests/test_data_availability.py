"""
Tests for Data Availability Auditor
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from app.training.data_availability import DataAvailabilityAuditor, AvailabilityStatus


def test_empty_dataset_audit():
    auditor = DataAvailabilityAuditor()
    report = auditor.audit(pd.DataFrame())
    assert report.status == AvailabilityStatus.INSUFFICIENT_DATA
    assert report.has_30_year_climatology is False


def test_partial_single_season_audit():
    auditor = DataAvailabilityAuditor()
    # 122 days dataset (e.g. Kharif 2024)
    dates = [datetime(2024, 6, 1) + timedelta(days=i) for i in range(122)]
    df = pd.DataFrame({
        "date": dates,
        "rainfall": np.random.uniform(0, 30, 122),
        "temp_min": np.random.uniform(22, 28, 122),
        "temp_max": np.random.uniform(30, 38, 122),
        "humidity": np.random.uniform(50, 95, 122),
        "block_id": ["UP_LKO_BKT"] * 122,
        "is_wet_day": np.random.choice([0, 1], 122, p=[0.7, 0.3])
    })

    report = auditor.audit(df, date_col="date", spatial_col="block_id")
    assert report.status == AvailabilityStatus.PARTIAL
    assert report.has_30_year_climatology is False
    assert report.spatial_resolution_level == "BLOCK"
    assert len(report.warnings) > 0  # Warns about lack of 30-year span


def test_insufficient_samples_audit():
    auditor = DataAvailabilityAuditor()
    # Only 15 days
    dates = [datetime(2024, 6, 1) + timedelta(days=i) for i in range(15)]
    df = pd.DataFrame({
        "date": dates,
        "rainfall": np.random.uniform(0, 10, 15),
        "block_id": ["UP_LKO_BKT"] * 15
    })
    report = auditor.audit(df, date_col="date")
    assert report.status == AvailabilityStatus.INSUFFICIENT_DATA
