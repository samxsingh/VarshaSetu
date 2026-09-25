"""
Tests for Multi-Year Stability Analysis.
Verifies distribution statistics, IQR calculation, degraded year detection,
and graceful handling of limited observation seasons.
"""

import pytest
from app.evaluation.stability import StabilityAnalyzer
from app.hindcasting.schemas import YearlyStabilityReport


def test_distribution_stats_calculation():
    vals = [0.10, 0.12, 0.11, 0.14, 0.09, 0.15, 0.11]
    stats = StabilityAnalyzer.calculate_distribution_stats(vals, "brier_score")

    assert stats.count == 7
    assert stats.mean is not None
    assert stats.median is not None
    assert stats.std is not None
    assert stats.iqr is not None
    assert stats.min == 0.09
    assert stats.max == 0.15


def test_stability_analysis_with_degraded_year():
    reports = [
        YearlyStabilityReport(year=2018, sample_count=100, brier_score=0.10, brier_skill_score=0.15),
        YearlyStabilityReport(year=2019, sample_count=100, brier_score=0.11, brier_skill_score=0.14),
        YearlyStabilityReport(year=2020, sample_count=100, brier_score=0.10, brier_skill_score=0.16),
        YearlyStabilityReport(year=2021, sample_count=100, brier_score=0.35, brier_skill_score=-0.40),  # Anomaly / degraded
        YearlyStabilityReport(year=2022, sample_count=100, brier_score=0.10, brier_skill_score=0.15),
    ]

    analysis = StabilityAnalyzer.analyze_stability(
        yearly_reports=reports,
        target_name="HEAVY_RAIN",
        horizon_days=7,
        model_id="xgboost"
    )

    assert analysis.total_years == 5
    assert 2021 in analysis.degraded_years
    assert "brier_score" in analysis.distribution_stats


def test_stability_insufficient_seasons():
    reports = [
        YearlyStabilityReport(year=2024, sample_count=122, brier_score=0.12, brier_skill_score=0.10)
    ]

    analysis = StabilityAnalyzer.analyze_stability(
        yearly_reports=reports,
        target_name="HEAVY_RAIN",
        horizon_days=7,
        model_id="xgboost"
    )

    assert analysis.total_years == 1
    assert analysis.stability_status == "INSUFFICIENT_SEASONS"
    assert "require >= 3 observation seasons" in analysis.notes
