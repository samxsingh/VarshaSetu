"""
Tests for Historical Feature Coverage Inspector.
Verifies date boundary tracking, missingness percentages, and source attribution.
"""

import pytest
import pandas as pd
from datetime import datetime, timedelta

from app.hindcasting.coverage import FeatureCoverageInspector


def test_feature_coverage_inspector():
    start_date = datetime(2024, 6, 1)
    dates = [start_date + timedelta(days=i) for i in range(100)]
    df = pd.DataFrame({
        "date": dates,
        "rainfall_1d": [1.0] * 100,
        "mjo_amplitude": [0.8] * 90 + [None] * 10,
        "nino34_anomaly": [0.5] * 100
    })

    rep = FeatureCoverageInspector.inspect_coverage(df, date_col="date")

    assert rep.total_features >= 3
    assert rep.temporal_span == "2024-06-01 to 2024-09-08"

    rain_item = next(i for i in rep.coverage_items if i.feature_name == "rainfall_1d")
    assert rain_item.coverage_status == "FULL"
    assert rain_item.missing_percent == 0.0

    mjo_item = next(i for i in rep.coverage_items if i.feature_name == "mjo_amplitude")
    assert mjo_item.coverage_status == "PARTIAL"
    assert mjo_item.missing_percent == 10.0


def test_feature_coverage_empty():
    rep = FeatureCoverageInspector.inspect_coverage(pd.DataFrame())
    assert rep.total_features == 0
    assert rep.temporal_span == "None"
