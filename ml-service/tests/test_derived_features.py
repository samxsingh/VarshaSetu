import pandas as pd
from app.processing.derived_features import DerivedFeatureCalculator

def test_rolling_sums_and_consecutive_spells():
    # 10 days of rainfall
    precip_values = [0.0, 0.0, 0.5, 15.0, 25.0, 0.0, 0.0, 0.0, 70.0, 0.0]
    df = pd.DataFrame({
        "date": pd.date_range("2024-06-01", periods=10, freq="D"),
        "precipitation_sum_mm": precip_values,
    })

    featured_df = DerivedFeatureCalculator.compute_all_monsoon_features(
        df,
        dry_threshold_mm=1.0,
        heavy_threshold_mm=64.5
    )

    # 1. Check 7-day rolling sum on day 7 (index 6): sum of days 0..6: 0+0+0.5+15+25+0+0 = 40.5
    assert featured_df["rain_7d_sum_mm"].iloc[6] == 40.5

    # 2. Check dry days detection: 0.0, 0.0, 0.5 are < 1.0 mm -> dry
    assert featured_df["is_dry_day"].iloc[0] == True
    assert featured_df["is_dry_day"].iloc[1] == True
    assert featured_df["is_dry_day"].iloc[2] == True
    assert featured_df["is_dry_day"].iloc[3] == False  # 15.0 mm is wet

    # 3. Consecutive dry days tracking
    # Day 0: 1, Day 1: 2, Day 2: 3, Day 3: 0 (wet), Day 4: 0 (wet), Day 5: 1, Day 6: 2, Day 7: 3, Day 8: 0 (heavy rain 70mm), Day 9: 1
    assert featured_df["consecutive_dry_days"].iloc[2] == 3
    assert featured_df["consecutive_dry_days"].iloc[3] == 0
    assert featured_df["consecutive_dry_days"].iloc[7] == 3

    # 4. Heavy rain detection
    assert featured_df["is_heavy_rain_event"].iloc[8] == True  # 70.0 mm >= 64.5 mm
    assert featured_df["is_heavy_rain_event"].iloc[3] == False  # 15.0 mm < 64.5 mm

    # 5. Anomaly departure exists
    assert "rain_anomaly_mm" in featured_df.columns
    assert "rain_departure_pct" in featured_df.columns
