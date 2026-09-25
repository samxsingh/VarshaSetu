"""
VarshaSetu - Scientific Dataset Catalog
Structured registry of all ingested and available meteorological and climate datasets.
Includes metadata, units, provider attribution, spatio-temporal resolution, and integrity digests.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field
import os
from .fingerprint import fingerprint_dataset, DatasetFingerprint


class DatasetMetadata(BaseModel):
    dataset_id: str
    name: str
    provider: str
    description: str
    variables: List[str]
    spatial_resolution: str
    temporal_resolution: str
    target_region: str
    relative_path: str
    units: Dict[str, str]
    is_climatology_baseline: bool = False
    qc_passed: bool = True
    fingerprint: Optional[DatasetFingerprint] = None


class DatasetCatalog:
    """
    Catalog of all scientific datasets available in VarshaSetu.
    """

    DEFAULT_DATASETS = {
        "climate_enso_nino34": DatasetMetadata(
            dataset_id="climate_enso_nino34",
            name="NOAA CPC Niño 3.4 Sea Surface Temperature Anomaly",
            provider="NOAA Climate Prediction Center (CPC)",
            description="Monthly sea surface temperature anomalies in the Niño 3.4 region (5N-5S, 170W-120W). Primary ENSO indicator.",
            variables=["nino34_anom", "nino34_sst"],
            spatial_resolution="Regional Box (5N-5S, 170W-120W)",
            temporal_resolution="Monthly",
            target_region="Equatorial Pacific",
            relative_path="ml-service/data/processed/climate_enso_nino34.parquet",
            units={"nino34_anom": "degC anomaly", "nino34_sst": "degC"}
        ),
        "climate_iod_dmi": DatasetMetadata(
            dataset_id="climate_iod_dmi",
            name="BoM Indian Ocean Dipole Dipole Mode Index",
            provider="Australian Bureau of Meteorology (BoM)",
            description="Monthly SST gradient between western equatorial Indian Ocean and southeastern equatorial Indian Ocean.",
            variables=["dmi", "iod_phase"],
            spatial_resolution="Gradient index (Dipole Mode Index)",
            temporal_resolution="Monthly",
            target_region="Indian Ocean Basin",
            relative_path="ml-service/data/processed/climate_iod_dmi.parquet",
            units={"dmi": "degC difference"}
        ),
        "climate_mjo_rmm": DatasetMetadata(
            dataset_id="climate_mjo_rmm",
            name="BoM Real-time Multivariate MJO (RMM1, RMM2)",
            provider="Australian Bureau of Meteorology (BoM)",
            description="Daily Wheeler-Hendon RMM indices tracking intra-seasonal tropical convective wave propagation.",
            variables=["rmm1", "rmm2", "phase", "amplitude"],
            spatial_resolution="Global Tropics (15S-15N)",
            temporal_resolution="Daily",
            target_region="Global Tropics / Indo-Pacific",
            relative_path="ml-service/data/processed/climate_mjo_rmm.parquet",
            units={"rmm1": "standardized", "rmm2": "standardized", "amplitude": "standardized"}
        ),
        "weather_lucknow_observations": DatasetMetadata(
            dataset_id="weather_lucknow_observations",
            name="Lucknow Kharif 2024 High-Resolution Weather Observations",
            provider="ERA5-Land Reanalysis (ECMWF Copernicus)",
            description="Daily surface meteorological observations for Bakshi Ka Talab block, Lucknow district, Kharif 2024 season.",
            variables=["rainfall", "temp_min", "temp_max", "temp_mean", "humidity", "wind_speed", "surface_pressure"],
            spatial_resolution="Block centroid (~9 km gridded)",
            temporal_resolution="Daily",
            target_region="Lucknow District, Uttar Pradesh (UP_LKO_BKT)",
            relative_path="ml-service/data/processed/weather_lucknow_observations.parquet",
            units={
                "rainfall": "mm/day",
                "temp_min": "degC",
                "temp_max": "degC",
                "temp_mean": "degC",
                "humidity": "%",
                "wind_speed": "m/s",
                "surface_pressure": "hPa"
            }
        ),
        "features_lucknow_monsoon_matrix": DatasetMetadata(
            dataset_id="features_lucknow_monsoon_matrix",
            name="Lucknow Kharif 2024 Merged Causal Feature Matrix",
            provider="VarshaSetu Phase 4A Feature Pipeline",
            description="Merged daily feature matrix combining local lag/rolling meteorological features with global climate teleconnections.",
            variables=["rainfall", "temp_min", "temp_max", "humidity", "nino34_anom", "dmi", "mjo_amplitude", "mjo_phase"],
            spatial_resolution="Block centroid (UP_LKO_BKT)",
            temporal_resolution="Daily",
            target_region="Lucknow District, Uttar Pradesh",
            relative_path="ml-service/data/features/features_lucknow_monsoon_matrix.parquet",
            units={"rainfall": "mm/day"}
        )
    }

    def __init__(self, base_dir: Optional[str] = None):
        if base_dir:
            self.base_dir = os.path.abspath(base_dir)
        else:
            # Look for project root
            curr = os.path.abspath(os.path.dirname(__file__))
            # curr is ml-service/app/datasets -> go up 3 levels to project root
            self.base_dir = os.path.abspath(os.path.join(curr, "..", "..", ".."))

    def list_datasets(self) -> List[DatasetMetadata]:
        results = []
        for d in self.DEFAULT_DATASETS.values():
            res = d.model_copy()
            full_path = os.path.join(self.base_dir, res.relative_path)
            if os.path.exists(full_path):
                try:
                    res.fingerprint = fingerprint_dataset(full_path)
                except Exception:
                    pass
            results.append(res)
        return results

    def get_dataset(self, dataset_id: str) -> Optional[DatasetMetadata]:
        meta = self.DEFAULT_DATASETS.get(dataset_id)
        if not meta:
            return None
        res = meta.model_copy()
        full_path = os.path.join(self.base_dir, res.relative_path)
        if os.path.exists(full_path):
            try:
                res.fingerprint = fingerprint_dataset(full_path)
            except Exception:
                pass
        return res
