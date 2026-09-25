from pydantic import BaseModel, Field
from datetime import date
from typing import Optional
from .ingestion import QualityFlag

class WeatherObservationRecord(BaseModel):
    date: date
    latitude: float
    longitude: float
    precipitation_sum_mm: float = Field(..., ge=0.0)
    temperature_2m_max_c: float
    temperature_2m_min_c: float
    temperature_2m_mean_c: float
    surface_pressure_hpa: Optional[float] = None
    wind_speed_10m_mps: Optional[float] = None
    relative_humidity_2m_pct: Optional[float] = None
    source: str
    quality_flag: QualityFlag = QualityFlag.GOOD

class DerivedFeaturesRecord(BaseModel):
    date: date
    block_id: str
    block_name: str
    latitude: float
    longitude: float
    daily_precip_mm: float = Field(..., ge=0.0)
    temp_max_c: float
    temp_min_c: float
    temp_mean_c: float
    
    # Rolling derived features
    rain_7d_sum_mm: float = Field(..., ge=0.0)
    rain_14d_sum_mm: float = Field(..., ge=0.0)
    consecutive_dry_days: int = Field(..., ge=0)
    consecutive_wet_days: int = Field(..., ge=0)
    is_dry_day: bool
    is_heavy_rain_event: bool  # >= 64.5 mm / 24h
    
    # Anomaly features
    climatological_normal_mm: Optional[float] = None
    rain_anomaly_mm: Optional[float] = None
    rain_departure_pct: Optional[float] = None
    
    # Ocean & planetary teleconnection alignment (joined by date)
    nino34_anomaly: Optional[float] = None
    iod_dmi: Optional[float] = None
    mjo_phase: Optional[int] = None
    mjo_amplitude: Optional[float] = None
    
    quality_flag: QualityFlag = QualityFlag.GOOD
