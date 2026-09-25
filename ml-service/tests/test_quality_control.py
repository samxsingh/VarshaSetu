import pandas as pd
from app.validation.quality_control import QualityController
from app.schemas.ingestion import QualityFlag

def test_quality_control_clean_data():
    df = pd.DataFrame({
        "date": pd.date_range("2024-06-01", periods=10, freq="D"),
        "precipitation_sum_mm": [0.0, 5.2, 12.4, 0.0, 0.0, 32.1, 75.0, 1.2, 0.0, 4.5],
        "temperature_2m_max_c": [35.0, 34.0, 31.0, 36.0, 37.0, 30.0, 28.0, 33.0, 35.0, 36.0]
    })
    clean_df, report = QualityController.audit_dataframe(df, "TEST_WEATHER")
    assert report.total_records == 10
    assert report.valid_records == 10
    assert report.outlier_records == 0
    assert report.quality_flag == QualityFlag.GOOD

def test_quality_control_detects_negative_rainfall_and_extreme_temp():
    df = pd.DataFrame({
        "date": pd.date_range("2024-06-01", periods=4, freq="D"),
        "precipitation_sum_mm": [10.0, -5.0, 20.0, 15.0],  # Negative precipitation is physically impossible
        "temperature_2m_max_c": [35.0, 34.0, 95.0, 32.0]   # 95°C is physically impossible surface temp
    })
    clean_df, report = QualityController.audit_dataframe(df, "TEST_ANOMALOUS")
    assert report.total_records == 4
    assert report.outlier_records == 2  # 2 rows with impossible values
    assert report.quality_flag in [QualityFlag.WARNING, QualityFlag.BAD]
    assert (clean_df.loc[clean_df["precipitation_sum_mm"] < 0, "quality_flag"] == QualityFlag.BAD.value).all()

def test_quality_control_deduplication():
    # Duplicate date row
    dates = pd.to_datetime(["2024-06-01", "2024-06-02", "2024-06-02", "2024-06-03"])
    df = pd.DataFrame({
        "date": dates,
        "precipitation_sum_mm": [5.0, 10.0, 10.0, 15.0],
        "temperature_2m_max_c": [32.0, 33.0, 33.0, 34.0]
    })
    clean_df, report = QualityController.audit_dataframe(df, "TEST_DUPES")
    assert len(clean_df) == 3
    assert report.details["deduplicated_records"] == 1
