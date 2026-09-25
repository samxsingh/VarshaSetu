from app.processing.spatial_join import AdministrativeSpatialAligner
import pandas as pd

def test_haversine_and_block_assignment():
    # Centroid of Bakshi Ka Talab: 26.9749, 80.9276
    match = AdministrativeSpatialAligner.assign_nearest_block(26.9750, 80.9280)
    assert match["block_code"] == "UP_LKO_BKT"
    assert match["block_name"] == "Bakshi Ka Talab"
    assert match["distance_km"] < 1.0

    # Near Malihabad: 26.9214, 80.7126
    match_mal = AdministrativeSpatialAligner.assign_nearest_block(26.9200, 80.7100)
    assert match_mal["block_code"] == "UP_LKO_MAL"
    assert match_mal["block_name"] == "Malihabad"

def test_align_weather_to_blocks():
    df = pd.DataFrame({
        "latitude": [26.9749, 26.9749],
        "longitude": [80.9276, 80.9276],
        "precipitation_sum_mm": [12.0, 0.0]
    })
    aligned = AdministrativeSpatialAligner.align_weather_to_blocks(df)
    assert "block_code" in aligned.columns
    assert aligned["block_code"].iloc[0] == "UP_LKO_BKT"
    assert aligned["block_name"].iloc[0] == "Bakshi Ka Talab"
