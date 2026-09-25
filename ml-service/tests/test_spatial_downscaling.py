"""
Tests for Spatial Downscaling and Resolution Enforcement
"""

import pytest
from app.spatial.features import compute_spatial_features, haversine_distance_km
from app.spatial.downscaling import DownscalingEnforcer, SpatialResolution
from app.spatial.pooling import BlockObservation, aggregate_district_mean


def test_haversine_and_spatial_features():
    d = haversine_distance_km(26.8467, 80.9462, 26.9749, 80.9276)
    assert 10.0 < d < 20.0  # Approx 14.3 km between Lucknow and Bakshi Ka Talab

    feats = compute_spatial_features("UP_LKO_BKT")
    assert "spatial_latitude" in feats
    assert "spatial_longitude" in feats
    assert "spatial_dist_to_district_km" in feats
    assert feats["spatial_dist_to_district_km"] > 0


def test_downscaling_enforcement_truthfulness():
    # Without panchayat micro-stations, downscaling MUST be block-level
    meta_block = DownscalingEnforcer.attribute_resolution(
        block_id="UP_LKO_BKT",
        lat=26.9749,
        lon=80.9276,
        has_panchayat_station=False
    )
    assert meta_block.target_resolution == SpatialResolution.BLOCK
    assert meta_block.panchayat_data_available is False
    assert "Do NOT interpret as single-field microclimate" in meta_block.resolution_warning

    # With panchayat micro-station
    meta_panchayat = DownscalingEnforcer.attribute_resolution(
        block_id="UP_LKO_BKT",
        lat=26.9749,
        lon=80.9276,
        has_panchayat_station=True
    )
    assert meta_panchayat.target_resolution == SpatialResolution.PANCHAYAT
    assert meta_panchayat.resolution_warning is None


def test_district_mean_pooling():
    obs = [
        BlockObservation(block_id="BKT", rainfall_val=10.0, weight=1.0),
        BlockObservation(block_id="MAL", rainfall_val=20.0, weight=1.0),
        BlockObservation(block_id="SAR", rainfall_val=30.0, weight=2.0),
    ]
    res = aggregate_district_mean(obs)
    # (10*1 + 20*1 + 30*2) / 4 = 90 / 4 = 22.5
    assert res["mean"] == 22.5
    assert res["min"] == 10.0
    assert res["max"] == 30.0
    assert res["total_blocks"] == 3
