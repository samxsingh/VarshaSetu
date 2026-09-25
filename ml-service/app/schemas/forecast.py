from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ScientificForecastRecord(BaseModel):
    """
    Standard scientific forecast output contract consumed by downstream services.
    Enforces explicit provenance, baseline comparisons, and calibration disclosures.
    """
    geography: str = Field(description="Administrative identifier (e.g., UP_LKO_BKT)")
    target: str = Field(description="Target: MONSOON_ONSET, DRY_SPELL_BREAK, HEAVY_RAIN, RAINFALL_ANOMALY")
    horizon_days: int = Field(description="Forecast horizon (7, 14, 21, or 30 days)")
    forecast_origin: str = Field(description="ISO Date of initialization / issue")
    valid_start: str = Field(description="ISO Date start of validity period")
    valid_end: str = Field(description="ISO Date end of validity period")
    
    probability: Optional[float] = Field(default=None, description="Model estimated probability [0.0, 1.0]")
    expected_value: Optional[float] = Field(default=None, description="Expected value for continuous targets (e.g. mm rain)")
    baseline_probability: Optional[float] = Field(default=None, description="Historical climatological baseline probability")
    baseline_expected_value: Optional[float] = Field(default=None, description="Historical climatological expectation")
    
    model_version: str = Field(default="1.0.0-baseline")
    calibration_status: str = Field(default="NOT_CALIBRATED")
    data_quality_status: str = Field(default="GOOD")
    provenance: Dict[str, Any] = Field(default_factory=dict)
    scientific_status: str = Field(default="BASELINE_STAGE")
    notes: Optional[str] = None
