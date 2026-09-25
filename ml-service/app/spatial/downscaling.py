"""
VarshaSetu - Spatial Downscaling and Resolution Enforcement
Ensures resolution claims are factually aligned with underlying input data.
Prevents ungrounded claims of panchayat/field micro-scale precision when only block data exists.
"""

from typing import Dict, Any, List, Optional
from enum import Enum
from pydantic import BaseModel


class SpatialResolution(str, Enum):
    GLOBAL = "GLOBAL"               # ~1.0 - 2.5 deg (Teleconnection indices)
    REGIONAL = "REGIONAL"           # ~0.25 - 0.5 deg (IMD regional grid)
    DISTRICT = "DISTRICT"           # District aggregate (~25-50 km)
    BLOCK = "BLOCK"                 # Block centroid / ERA5-Land 0.1 deg (~9 km)
    PANCHAYAT = "PANCHAYAT"         # Village cluster micro-climate (< 3 km)


class DownscalingMetadata(BaseModel):
    source_resolution: SpatialResolution
    target_resolution: SpatialResolution
    block_id: str
    latitude: float
    longitude: float
    is_downscaled: bool
    downscaling_method: str
    panchayat_data_available: bool
    resolution_warning: Optional[str] = None


class DownscalingEnforcer:
    """
    Validates and enforces spatial attribution boundaries.
    """

    @classmethod
    def attribute_resolution(
        cls,
        block_id: str,
        lat: float,
        lon: float,
        has_panchayat_station: bool = False
    ) -> DownscalingMetadata:
        """
        Determines the maximum truthful resolution supported by observational feeds.
        """
        if has_panchayat_station:
            target_res = SpatialResolution.PANCHAYAT
            is_downscaled = True
            method = "Micro-station elevation and lapse-rate adjusted downscaling"
            warning = None
        else:
            # Observational feed is block centroid (ERA5-Land 0.1 deg / AWS block station)
            target_res = SpatialResolution.BLOCK
            is_downscaled = True
            method = "Regional-to-Block Bilinear Centroid Interpolation"
            warning = (
                f"Panchayat-level micro-station data not available for '{block_id}'. "
                f"Forecast represents block-scale ({target_res.value}) meteorological expectation. "
                "Do NOT interpret as single-field microclimate."
            )

        return DownscalingMetadata(
            source_resolution=SpatialResolution.REGIONAL,
            target_resolution=target_res,
            block_id=block_id,
            latitude=lat,
            longitude=lon,
            is_downscaled=is_downscaled,
            downscaling_method=method,
            panchayat_data_available=has_panchayat_station,
            resolution_warning=warning
        )
