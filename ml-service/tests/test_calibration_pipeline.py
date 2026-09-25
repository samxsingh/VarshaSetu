"""
Tests for Calibration Pipeline and Walk-Forward Validation (Phase 4C)
"""

import pytest
import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from app.calibration.calibrator import ModelProbabilityCalibrator
from app.calibration.pipeline import CalibrationPipeline


def test_expanding_window_chronological_ordering():
    dates = [datetime(2024, 6, 1) + timedelta(days=i) for i in range(90)]
    df = pd.DataFrame({"date": dates, "val": np.arange(90)})

    folds = ModelProbabilityCalibrator.generate_expanding_folds(df, date_col="date", n_folds=3)

    assert len(folds) == 3
    for f in folds:
        train_end = pd.to_datetime(f["train_end"])
        val_start = pd.to_datetime(f["val_start"])
        # Strict temporal order: train < validation
        assert train_end < val_start
        assert f["train_count"] > 0
        assert f["val_count"] > 0


def test_calibration_pipeline_execution_and_artifact_integrity():
    res = CalibrationPipeline.run_calibration(
        target_name="HEAVY_RAIN",
        horizon_days=7,
        calibration_method="PLATT",
        block_id="UP_LKO_BKT"
    )

    assert "data_gate" in res
    assert "comparison" in res
    assert "reliability_reports" in res
    assert "artifact_saved" in res

    artifact_path = res["artifact_saved"]
    assert os.path.exists(artifact_path)

    with open(artifact_path, "r") as f:
        data = json.load(f)

    assert data["target_name"] == "HEAVY_RAIN"
    assert "dataset_fingerprint" in data
    assert "git_commit" in data
    assert "software_versions" in data
    assert len(data["reliability_bins"]) > 0
