from pydantic import BaseModel, Field
from datetime import date
from typing import Optional
from .ingestion import QualityFlag

class EnsoRecord(BaseModel):
    date: date
    nino34_sst: float
    anomaly: float
    baseline: str = "1991-2020 Climatology (NOAA CPC/PSL)"
    enso_phase: str  # "EL_NINO", "LA_NINA", "NEUTRAL" (Derived only if >= +0.5 / <= -0.5 threshold met)
    source: str
    quality_flag: QualityFlag = QualityFlag.GOOD

class IodRecord(BaseModel):
    date: date
    dmi_value: float  # Dipole Mode Index (Western Indian Ocean - Eastern Indian Ocean anomaly)
    iod_phase: str   # "POSITIVE", "NEGATIVE", "NEUTRAL"
    baseline: str = "BoM Australia DMI standard"
    source: str
    quality_flag: QualityFlag = QualityFlag.GOOD

class MjoRecord(BaseModel):
    date: date
    rmm1: float
    rmm2: float
    amplitude: float = Field(..., ge=0.0)  # sqrt(RMM1^2 + RMM2^2)
    phase: int = Field(..., ge=1, le=8)     # Wheeler-Hendon Phase 1-8
    source: str
    quality_flag: QualityFlag = QualityFlag.GOOD
