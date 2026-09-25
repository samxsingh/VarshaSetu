import math
from typing import Dict, Any, List, Optional
import pandas as pd

LUCKNOW_DEMO_BLOCKS = [
    {"code": "UP_LKO_BKT", "name": "Bakshi Ka Talab", "lat": 26.9749, "lon": 80.9276},
    {"code": "UP_LKO_MAL", "name": "Malihabad", "lat": 26.9214, "lon": 80.7126},
    {"code": "UP_LKO_MOH", "name": "Mohanlalganj", "lat": 26.6749, "lon": 80.9982},
    {"code": "UP_LKO_SAR", "name": "Sarojininagar", "lat": 26.7490, "lon": 80.8654},
    {"code": "UP_LKO_GOS", "name": "Gosainganj", "lat": 26.7725, "lon": 81.1219},
]

class AdministrativeSpatialAligner:
    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Great-circle distance between two decimal degree points on Earth."""
        r = 6371.0  # Earth radius km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return r * c

    @classmethod
    def assign_nearest_block(cls, lat: float, lon: float) -> Dict[str, Any]:
        """Find closest administrative block centroid in Lucknow District."""
        best_block = LUCKNOW_DEMO_BLOCKS[0]
        min_dist = float("inf")

        for b in LUCKNOW_DEMO_BLOCKS:
            dist = cls.haversine_distance_km(lat, lon, b["lat"], b["lon"])
            if dist < min_dist:
                min_dist = dist
                best_block = b

        return {
            "block_code": best_block["code"],
            "block_name": best_block["name"],
            "centroid_lat": best_block["lat"],
            "centroid_lon": best_block["lon"],
            "distance_km": round(min_dist, 2),
        }

    @classmethod
    def align_weather_to_blocks(cls, df: pd.DataFrame, default_block_code: str = "UP_LKO_BKT") -> pd.DataFrame:
        """Attach administrative block identification to gridded observation DataFrame."""
        if df.empty:
            return df

        df = df.copy()
        if "latitude" in df.columns and "longitude" in df.columns:
            first_lat = float(df["latitude"].iloc[0])
            first_lon = float(df["longitude"].iloc[0])
            block_info = cls.assign_nearest_block(first_lat, first_lon)
            df["block_code"] = block_info["block_code"]
            df["block_name"] = block_info["block_name"]
            df["spatial_alignment_method"] = "NEAREST_GRID_CENTROID"
        else:
            df["block_code"] = default_block_code
            df["block_name"] = "Bakshi Ka Talab"
            df["spatial_alignment_method"] = "CONFIGURED_PILOT_DEFAULT"

        return df
