import pytest
import pandas as pd
import numpy as np
from app.targets.definitions import target_config, RainfallAnomalyCategory
from app.targets.onset import MonsoonOnsetDetector
from app.targets.false_onset import FalseOnsetDetector
from app.targets.dry_spell import DrySpellDetector
from app.targets.heavy_rain import HeavyRainDetector
from app.targets.anomaly import RainfallAnomalyCalculator

class TestTargetDefinitions:
    def test_monsoon_onset_detection_triggered(self):
        # 10 days in June: Day 5, 6, 7 have heavy rain satisfying onset
        dates = pd.date_range("2024-06-01", periods=10, freq="D")
        rain = [0.0, 0.5, 0.0, 1.0, 15.0, 12.0, 5.0, 0.0, 0.0, 0.0]
        df = pd.DataFrame({"date": dates, "precipitation_sum_mm": rain})

        onset_dt = MonsoonOnsetDetector.detect_onset_date(df, year=2024)
        assert onset_dt == "2024-06-05"

    def test_monsoon_onset_insufficient_rainfall(self):
        dates = pd.date_range("2024-06-01", periods=10, freq="D")
        rain = [0.5, 1.0, 0.2, 0.0, 2.0, 1.5, 0.0, 0.0, 1.0, 0.0]
        df = pd.DataFrame({"date": dates, "precipitation_sum_mm": rain})

        onset_dt = MonsoonOnsetDetector.detect_onset_date(df, year=2024)
        assert onset_dt is None

    def test_false_onset_detection(self):
        # Onset on June 5 (15mm + 12mm), followed by 8 dry days (<1.0mm)
        dates = pd.date_range("2024-06-01", periods=20, freq="D")
        rain = [0.0, 0.0, 0.0, 0.0, 15.0, 15.0] + [0.0] * 8 + [5.0] * 6
        df = pd.DataFrame({"date": dates, "precipitation_sum_mm": rain})

        res = FalseOnsetDetector.detect_false_onset(df, year=2024)
        assert res.false_onset_observed == 1
        assert res.false_onset_date == "2024-06-05"
        assert res.dry_spell_days_after >= 7

    def test_dry_spell_detection(self):
        dates = pd.date_range("2024-07-01", periods=15, freq="D")
        # 6 dry days in July (>= 5 qualifies as dry spell)
        rain = [10.0, 5.0] + [0.0] * 6 + [20.0] * 7
        df = pd.DataFrame({"date": dates, "precipitation_sum_mm": rain})

        spells = DrySpellDetector.audit_dry_spells(df)
        assert len(spells) == 1
        assert spells[0].dry_spell_active == 1
        assert spells[0].duration_days == 6
        assert spells[0].start_date == "2024-07-03"
        assert spells[0].end_date == "2024-07-08"

    def test_heavy_rain_categorization(self):
        res_heavy = HeavyRainDetector.evaluate_record(75.2)
        assert res_heavy.heavy_rain_observed == 1
        assert res_heavy.category == "HEAVY_RAIN"

        res_very_heavy = HeavyRainDetector.evaluate_record(130.0)
        assert res_very_heavy.heavy_rain_observed == 1
        assert res_very_heavy.category == "VERY_HEAVY_RAIN"

        res_light = HeavyRainDetector.evaluate_record(12.5)
        assert res_light.heavy_rain_observed == 0
        assert res_light.category == "MODERATE_OR_LIGHT_RAIN"

    def test_rainfall_anomaly_calculation(self):
        # Observed: 120mm, Climatology: 100mm -> +20% departure (EXCESS)
        res = RainfallAnomalyCalculator.calculate_departure(120.0, 100.0)
        assert res.percentage_departure == 20.0
        assert res.category == RainfallAnomalyCategory.EXCESS
        assert res.insufficient_climatology is False

        # Zero climatology handling
        res_zero = RainfallAnomalyCalculator.calculate_departure(5.0, 0.0)
        assert res_zero.insufficient_climatology is True
