import pytest
import pandas as pd
from app.providers.noaa_enso import NoaaEnsoProvider
from app.providers.bom_iod import BomIodProvider
from app.providers.bom_mjo import BomMjoProvider
from app.providers.openmeteo_weather import OpenMeteoWeatherProvider
from app.schemas.ingestion import QualityFlag

@pytest.mark.asyncio
async def test_noaa_enso_provider():
    provider = NoaaEnsoProvider()
    raw = provider._get_fallback_text("test")
    
    # 1. Validation
    qc = provider.validate(raw)
    assert qc.total_records > 0
    assert qc.quality_flag in [QualityFlag.GOOD, QualityFlag.WARNING]
    
    # 2. Normalization
    df = provider.normalize(raw)
    assert not df.empty
    assert "nino34_sst" in df.columns
    assert "anomaly" in df.columns
    assert "enso_phase" in df.columns
    assert set(df["enso_phase"].unique()).issubset({"EL_NINO", "LA_NINA", "NEUTRAL"})
    
    # 3. Metadata
    meta = provider.get_metadata()
    assert meta.provider == "NOAA_CPC"
    assert meta.variable == "ENSO_SST_ANOMALY"

@pytest.mark.asyncio
async def test_bom_iod_provider():
    provider = BomIodProvider()
    raw = provider._get_fallback_text("test")
    
    qc = provider.validate(raw)
    assert qc.total_records > 0
    
    df = provider.normalize(raw)
    assert not df.empty
    assert "dmi_value" in df.columns
    assert "iod_phase" in df.columns
    assert set(df["iod_phase"].unique()).issubset({"POSITIVE", "NEGATIVE", "NEUTRAL"})

@pytest.mark.asyncio
async def test_bom_mjo_provider():
    provider = BomMjoProvider()
    raw = provider._get_fallback_text("test")
    
    qc = provider.validate(raw)
    assert qc.total_records > 0
    
    df = provider.normalize(raw)
    assert not df.empty
    assert "rmm1" in df.columns
    assert "rmm2" in df.columns
    assert "phase" in df.columns
    assert "amplitude" in df.columns
    assert df["phase"].min() >= 1
    assert df["phase"].max() <= 8
    assert (df["amplitude"] >= 0.0).all()

@pytest.mark.asyncio
async def test_openmeteo_weather_provider():
    provider = OpenMeteoWeatherProvider(lat=26.9749, lon=80.9276)
    raw = provider._get_fallback_payload("2024-06-01", "2024-06-30")
    
    qc = provider.validate(raw)
    assert qc.total_records == 30
    assert qc.quality_score >= 0.95
    
    df = provider.normalize(raw)
    assert len(df) == 30
    assert "precipitation_sum_mm" in df.columns
    assert (df["precipitation_sum_mm"] >= 0.0).all()
    assert "temperature_2m_max_c" in df.columns
    assert "temperature_2m_min_c" in df.columns
