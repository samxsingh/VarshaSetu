"""
Tests for Feature Drift Detection.
Verifies PSI and KS test statistics on stable vs shifted feature distributions.
"""

import pytest
import numpy as np
import pandas as pd

from app.validation.drift import FeatureDriftDetector, DriftStatus


def test_psi_identical_distributions():
    ref = np.random.normal(30.0, 5.0, 200)
    comp = np.random.normal(30.0, 5.0, 200)

    psi = FeatureDriftDetector.calculate_psi(ref, comp)
    assert psi is not None
    assert psi < FeatureDriftDetector.PSI_THRESHOLD_MODERATE


def test_psi_shifted_distribution():
    ref = np.random.normal(30.0, 2.0, 200)
    comp = np.random.normal(45.0, 2.0, 200)  # Significant shift

    psi = FeatureDriftDetector.calculate_psi(ref, comp)
    assert psi is not None
    assert psi >= FeatureDriftDetector.PSI_THRESHOLD_SIGNIFICANT


def test_ks_test():
    ref = np.random.normal(0, 1, 100)
    comp = np.random.normal(5, 1, 100)

    stat, pval = FeatureDriftDetector.calculate_ks(ref, comp)
    assert stat is not None
    assert stat > 0.5
    assert pval is not None
    assert pval < 0.01


def test_evaluate_drift_dataframe():
    np.random.seed(42)
    df_ref = pd.DataFrame({
        "rainfall_1d": np.random.exponential(5.0, 100),
        "temperature_2m_max_c": np.random.normal(32.0, 2.0, 100),
    })
    df_comp = pd.DataFrame({
        "rainfall_1d": np.random.exponential(5.0, 100),
        "temperature_2m_max_c": np.random.normal(42.0, 2.0, 100),  # Extreme heatwave shift
    })

    rep = FeatureDriftDetector.evaluate_drift(
        df_reference=df_ref,
        df_comparison=df_comp,
        features=["rainfall_1d", "temperature_2m_max_c"]
    )

    assert rep.status == DriftStatus.SHIFT_DETECTED
    assert "temperature_2m_max_c" in rep.features_with_shift
