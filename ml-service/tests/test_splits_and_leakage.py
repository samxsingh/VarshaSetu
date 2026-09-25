import pytest
import pandas as pd
import numpy as np
from app.training.splitter import ChronologicalSplitter
from app.training.leakage import LeakageAuditor, DataLeakageError
from app.validation.dataset_quality import DatasetQualityAuditor

class TestSplitsAndLeakage:
    def test_chronological_splits_integrity(self):
        dates = pd.date_range("2024-06-01", periods=100, freq="D")
        df = pd.DataFrame({
            "date": dates,
            "val": np.random.randn(100)
        })

        splits = ChronologicalSplitter.split_by_ratio(df, 0.70, 0.15, 0.15)
        assert splits.train_records == 70
        assert splits.val_records == 15
        assert splits.test_records == 15

        # Check temporal order: train < val < test
        assert pd.to_datetime(splits.train_dates[1]) < pd.to_datetime(splits.val_dates[0])
        assert pd.to_datetime(splits.val_dates[1]) < pd.to_datetime(splits.test_dates[0])

    def test_leakage_detector_raises_on_target_in_features(self):
        features = ["rainfall_1d", "temperature_2m_max_c", "target_heavy_rain_7d"]
        with pytest.raises(DataLeakageError, match="Target Leakage Detected"):
            LeakageAuditor.audit_feature_matrix_for_target_leakage(features, "target_heavy_rain_7d")

    def test_leakage_detector_raises_on_overlapping_splits(self):
        dates1 = pd.date_range("2024-06-01", periods=10, freq="D")
        dates2 = pd.date_range("2024-06-08", periods=10, freq="D")  # Overlaps dates1
        df1 = pd.DataFrame({"date": dates1})
        df2 = pd.DataFrame({"date": dates2})

        with pytest.raises(DataLeakageError, match="Data Leakage Detected"):
            LeakageAuditor.audit_chronological_splits(df1, df2)

    def test_dataset_quality_auditor(self):
        dates = pd.date_range("2024-06-01", periods=50, freq="D")
        df = pd.DataFrame({
            "date": dates,
            "feat1": np.random.randn(50),
            "target_val": np.random.choice([0, 1], size=50)
        })

        audit = DatasetQualityAuditor.audit_dataset(df, target_cols=["target_val"])
        assert audit.quality_status == "GOOD"
        assert audit.total_samples == 50
        assert audit.target_availability["target_val"] == 50
        assert audit.missing_cells_pct == 0.0
