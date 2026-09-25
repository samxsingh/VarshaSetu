from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class FeatureDefinition(BaseModel):
    name: str
    source: str
    unit: str
    description: str
    lag: str
    temporal_resolution: str
    scientific_rationale: str

FEATURE_REGISTRY: Dict[str, FeatureDefinition] = {
    # 1. Rainfall Antecedent Features
    "rainfall_1d": FeatureDefinition(
        name="rainfall_1d",
        source="ERA5-Land / Surface Met",
        unit="mm/day",
        description="Daily precipitation sum on day t",
        lag="0d",
        temporal_resolution="DAILY",
        scientific_rationale="Immediate local soil moisture and hydrological response."
    ),
    "rainfall_3d": FeatureDefinition(
        name="rainfall_3d",
        source="ERA5-Land / Surface Met",
        unit="mm",
        description="Cumulative precipitation over the past 3 days (t-2 to t)",
        lag="3d rolling",
        temporal_resolution="DAILY",
        scientific_rationale="Captures short-term convective spell intensity."
    ),
    "rainfall_7d": FeatureDefinition(
        name="rainfall_7d",
        source="ERA5-Land / Surface Met",
        unit="mm",
        description="Cumulative precipitation over the past 7 days (t-6 to t)",
        lag="7d rolling",
        temporal_resolution="DAILY",
        scientific_rationale="Primary standard agrometeorological weekly rainfall indicator."
    ),
    "rainfall_14d": FeatureDefinition(
        name="rainfall_14d",
        source="ERA5-Land / Surface Met",
        unit="mm",
        description="Cumulative precipitation over the past 14 days (t-13 to t)",
        lag="14d rolling",
        temporal_resolution="DAILY",
        scientific_rationale="Fortnightly moisture balance index for root-zone saturation."
    ),
    "rainy_days_7d": FeatureDefinition(
        name="rainy_days_7d",
        source="ERA5-Land / Surface Met",
        unit="count (days)",
        description="Count of rainy days (>= 2.5mm) in past 7 days",
        lag="7d rolling",
        temporal_resolution="DAILY",
        scientific_rationale="Differentiates continuous light rain from single erratic deluge."
    ),
    "consecutive_dry_days": FeatureDefinition(
        name="consecutive_dry_days",
        source="ERA5-Land / Surface Met",
        unit="count (days)",
        description="Current consecutive days with rainfall < 1.0mm",
        lag="0d running",
        temporal_resolution="DAILY",
        scientific_rationale="Direct driver for Kharif agricultural drought and dry spell risk."
    ),
    "consecutive_wet_days": FeatureDefinition(
        name="consecutive_wet_days",
        source="ERA5-Land / Surface Met",
        unit="count (days)",
        description="Current consecutive days with rainfall >= 1.0mm",
        lag="0d running",
        temporal_resolution="DAILY",
        scientific_rationale="Direct driver for waterlogging, root asphyxiation, and foliar disease."
    ),

    # 2. Thermal & Thermodynamic Features
    "temperature_2m_max_c": FeatureDefinition(
        name="temperature_2m_max_c",
        source="ERA5-Land / Surface Met",
        unit="°C",
        description="Daily maximum 2-meter air temperature",
        lag="0d",
        temporal_resolution="DAILY",
        scientific_rationale="Drives atmospheric vapor pressure deficit and evapotranspiration."
    ),
    "temperature_2m_min_c": FeatureDefinition(
        name="temperature_2m_min_c",
        source="ERA5-Land / Surface Met",
        unit="°C",
        description="Daily minimum 2-meter air temperature",
        lag="0d",
        temporal_resolution="DAILY",
        scientific_rationale="Indicates nocturnal cooling and boundary layer stability."
    ),
    "diurnal_temp_range_c": FeatureDefinition(
        name="diurnal_temp_range_c",
        source="Derived (Tmax - Tmin)",
        unit="°C",
        description="Diurnal temperature range (Tmax - Tmin)",
        lag="0d",
        temporal_resolution="DAILY",
        scientific_rationale="High DTR correlates with clear skies, subsidence, and break monsoon."
    ),

    # 3. Atmospheric Circulation
    "surface_pressure_hpa": FeatureDefinition(
        name="surface_pressure_hpa",
        source="ERA5-Land / Surface Met",
        unit="hPa",
        description="Surface atmospheric pressure",
        lag="0d",
        temporal_resolution="DAILY",
        scientific_rationale="Monsoon trough oscillations: lower pressure correlates with trough passage."
    ),
    "wind_speed_10m_mps": FeatureDefinition(
        name="wind_speed_10m_mps",
        source="ERA5-Land / Surface Met",
        unit="m/s",
        description="10-meter wind speed magnitude",
        lag="0d",
        temporal_resolution="DAILY",
        scientific_rationale="Monsoon low-level jet strength and convective shearing."
    ),

    # 4. Planetary Teleconnections (Lags respect source cadence)
    "nino34_anomaly": FeatureDefinition(
        name="nino34_anomaly",
        source="NOAA CPC",
        unit="°C",
        description="Niño 3.4 SST Anomaly Index for current observation month",
        lag="0m",
        temporal_resolution="MONTHLY",
        scientific_rationale="Global ENSO phase: positive values (El Niño) suppress ISMR."
    ),
    "nino34_lag_1m": FeatureDefinition(
        name="nino34_lag_1m",
        source="NOAA CPC",
        unit="°C",
        description="Niño 3.4 SST Anomaly lagged by 1 month",
        lag="1 month",
        temporal_resolution="MONTHLY",
        scientific_rationale="Captures oceanic memory and persistence of ENSO state."
    ),
    "iod_dmi": FeatureDefinition(
        name="iod_dmi",
        source="BoM Australia",
        unit="°C",
        description="Dipole Mode Index for current observation month",
        lag="0m",
        temporal_resolution="MONTHLY",
        scientific_rationale="Positive IOD enhances Indian summer monsoon rainfall."
    ),
    "iod_dmi_lag_1m": FeatureDefinition(
        name="iod_dmi_lag_1m",
        source="BoM Australia",
        unit="°C",
        description="Dipole Mode Index lagged by 1 month",
        lag="1 month",
        temporal_resolution="MONTHLY",
        scientific_rationale="Lagged equatorial Indian Ocean SST gradient impact."
    ),
    "mjo_amplitude": FeatureDefinition(
        name="mjo_amplitude",
        source="BoM Australia",
        unit="dimensionless",
        description="Wheeler-Hendon MJO Amplitude (sqrt(RMM1^2 + RMM2^2))",
        lag="0d",
        temporal_resolution="DAILY",
        scientific_rationale="Amplitude > 1.0 indicates active tropical intraseasonal convection."
    ),
    "mjo_phase": FeatureDefinition(
        name="mjo_phase",
        source="BoM Australia",
        unit="integer (1-8)",
        description="Madden-Julian Oscillation geographic octant phase",
        lag="0d",
        temporal_resolution="DAILY",
        scientific_rationale="Phases 1-3 indicate convective suppression over northern India."
    ),
    "mjo_amplitude_lag_7d": FeatureDefinition(
        name="mjo_amplitude_lag_7d",
        source="BoM Australia",
        unit="dimensionless",
        description="MJO amplitude lagged by 7 days",
        lag="7 days",
        temporal_resolution="DAILY",
        scientific_rationale="Intraseasonal wave propagation memory."
    ),

    # 5. Temporal & Seasonal Cycles
    "day_of_year": FeatureDefinition(
        name="day_of_year",
        source="Calendar",
        unit="day (1-366)",
        description="Calendar day of the year",
        lag="0d",
        temporal_resolution="DAILY",
        scientific_rationale="Monsoonal solar insolation and seasonal progression cycle."
    ),
    "sin_doy": FeatureDefinition(
        name="sin_doy",
        source="Calendar (Derived)",
        unit="[-1, 1]",
        description="Sine transformation of day of year: sin(2*pi*doy/365.25)",
        lag="0d",
        temporal_resolution="DAILY",
        scientific_rationale="Smooth harmonic seasonal cycle representation."
    ),
    "cos_doy": FeatureDefinition(
        name="cos_doy",
        source="Calendar (Derived)",
        unit="[-1, 1]",
        description="Cosine transformation of day of year: cos(2*pi*doy/365.25)",
        lag="0d",
        temporal_resolution="DAILY",
        scientific_rationale="Smooth harmonic seasonal cycle representation."
    ),
}
