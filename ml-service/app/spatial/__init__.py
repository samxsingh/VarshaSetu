"""
VarshaSetu Spatial Module
"""

from .features import REFERENCE_CENTROIDS, SpatialPoint, compute_spatial_features, haversine_distance_km
from .pooling import BlockObservation, aggregate_district_mean
from .downscaling import SpatialResolution, DownscalingMetadata, DownscalingEnforcer

__all__ = [
    "REFERENCE_CENTROIDS",
    "SpatialPoint",
    "compute_spatial_features",
    "haversine_distance_km",
    "BlockObservation",
    "aggregate_district_mean",
    "SpatialResolution",
    "DownscalingMetadata",
    "DownscalingEnforcer"
]
