"""
VarshaSetu - Spatial Coordinates and Regional Features
Encodes geospatial block coordinates, elevations, and relative distances from district center.
"""

from typing import Dict, Any, Optional, Tuple
from pydantic import BaseModel
import numpy as np


class SpatialPoint(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    elevation_m: float
    parent_district: str
    level: str  # "DISTRICT", "BLOCK", "PANCHAYAT"


# Reference coordinates for Lucknow District and its Blocks
REFERENCE_CENTROIDS: Dict[str, SpatialPoint] = {
    "DISTRICT_LUCKNOW": SpatialPoint(
        id="UP_LKO",
        name="Lucknow District Centroid",
        latitude=26.8467,
        longitude=80.9462,
        elevation_m=123.0,
        parent_district="UP_LKO",
        level="DISTRICT"
    ),
    "UP_LKO_BKT": SpatialPoint(
        id="UP_LKO_BKT",
        name="Bakshi Ka Talab",
        latitude=26.9749,
        longitude=80.9276,
        elevation_m=124.0,
        parent_district="UP_LKO",
        level="BLOCK"
    ),
    "UP_LKO_SAR": SpatialPoint(
        id="UP_LKO_SAR",
        name="Sarojini Nagar",
        latitude=26.7490,
        longitude=80.8654,
        elevation_m=121.0,
        parent_district="UP_LKO",
        level="BLOCK"
    ),
    "UP_LKO_MAL": SpatialPoint(
        id="UP_LKO_MAL",
        name="Malihabad",
        latitude=26.9200,
        longitude=80.7100,
        elevation_m=128.0,
        parent_district="UP_LKO",
        level="BLOCK"
    ),
    "UP_LKO_MOH": SpatialPoint(
        id="UP_LKO_MOH",
        name="Mohanlalganj",
        latitude=26.6800,
        longitude=80.9900,
        elevation_m=119.0,
        parent_district="UP_LKO",
        level="BLOCK"
    )
}


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two points in km."""
    R = 6371.0  # Earth radius in km
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    a = np.sin(dphi / 2.0) ** 2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda / 2.0) ** 2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return float(R * c)


def compute_spatial_features(point_id: str) -> Dict[str, float]:
    """
    Computes spatial coordinate offsets and distance from the district reference point.
    """
    point = REFERENCE_CENTROIDS.get(point_id)
    if not point:
        raise KeyError(f"Unknown spatial point '{point_id}'")

    district_ref = REFERENCE_CENTROIDS["DISTRICT_LUCKNOW"]
    dist_km = haversine_distance_km(point.latitude, point.longitude, district_ref.latitude, district_ref.longitude)
    d_lat = point.latitude - district_ref.latitude
    d_lon = point.longitude - district_ref.longitude

    return {
        "spatial_latitude": point.latitude,
        "spatial_longitude": point.longitude,
        "spatial_elevation_m": point.elevation_m,
        "spatial_dist_to_district_km": round(dist_km, 3),
        "spatial_offset_lat": round(d_lat, 5),
        "spatial_offset_lon": round(d_lon, 5)
    }
