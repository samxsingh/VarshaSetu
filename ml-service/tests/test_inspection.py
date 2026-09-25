import pytest
from app.inspection.inspector import DataInspector
from app.config import settings

class TestDataInspection:
    def test_inspect_processed_datasets(self):
        reports = DataInspector.inspect_all()
        assert len(reports) > 0
        assert "climate_mjo_rmm" in reports
        assert "weather_lucknow_observations" in reports

        rep_mjo = reports["climate_mjo_rmm"]
        assert rep_mjo.rows == 17876
        assert rep_mjo.duplicate_count == 0
        assert rep_mjo.missing_percentage == 0.0
        assert "GOOD" in rep_mjo.quality_summary

        rep_weather = reports["weather_lucknow_observations"]
        assert rep_weather.rows == 122
        assert rep_weather.geography_count >= 1
        assert rep_weather.temporal_frequency == "DAILY"
