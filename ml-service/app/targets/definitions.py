from dataclasses import dataclass
from typing import Optional, List, Tuple
from enum import Enum
from pydantic import BaseModel, Field

class RainfallAnomalyCategory(str, Enum):
    VERY_DEFICIENT = "VERY_DEFICIENT"  # < -60%
    DEFICIENT = "DEFICIENT"            # -59% to -20%
    NORMAL = "NORMAL"                  # -19% to +19%
    EXCESS = "EXCESS"                  # +20% to +59%
    HIGHLY_EXCESS = "HIGHLY_EXCESS"    # >= +60%

@dataclass(frozen=True)
class TargetConfiguration:
    """Configurable thresholds for scientific target engineering."""
    # Daily rainfall classification thresholds (IMD meteorological conventions)
    RAINY_DAY_THRESHOLD_MM: float = 2.5       # IMD standard definition of a 'Rainy Day'
    DRY_DAY_THRESHOLD_MM: float = 1.0         # Configurable dry day threshold (< 1.0 mm)
    HEAVY_RAIN_THRESHOLD_MM: float = 64.5     # IMD Heavy Rainfall threshold (>= 64.5 mm / 24h)
    VERY_HEAVY_RAIN_THRESHOLD_MM: float = 115.5  # IMD Very Heavy Rainfall (>= 115.5 mm / 24h)
    EXTREME_RAIN_THRESHOLD_MM: float = 204.5     # IMD Extremely Heavy Rainfall (>= 204.5 mm / 24h)

    # Monsoon Onset configuration
    ONSET_MIN_ACCUMULATED_MM: float = 25.0    # Minimum accumulated rain over onset window
    ONSET_QUALIFYING_DAYS: int = 2            # Number of rainy days (>= 2.5mm) in onset spell
    ONSET_WINDOW_DAYS: int = 3                # Period over which onset rain must persist
    ONSET_SEASON_START_MONTH: int = 6         # June 1
    ONSET_SEASON_START_DAY: int = 1
    ONSET_SEASON_END_MONTH: int = 7           # July 15
    ONSET_SEASON_END_DAY: int = 15

    # False Onset configuration
    FALSE_ONSET_DRY_DAYS_HIATUS: int = 7      # Dry days (rain < 1.0mm) following trigger
    FALSE_ONSET_EVALUATION_WINDOW: int = 14   # Horizon after trigger to audit dry hiatus

    # Dry Spell / Break Monsoon configuration
    DRY_SPELL_MIN_DAYS: int = 5               # Minimum consecutive dry days for dry spell
    BREAK_MONSOON_MIN_DAYS: int = 10          # Consecutive dry days during July-Aug for break candidate

target_config = TargetConfiguration()

class OnsetTargetResult(BaseModel):
    onset_observed: int = Field(description="1 if onset occurred on or before date, 0 otherwise")
    onset_date: Optional[str] = Field(default=None, description="ISO Date of confirmed onset")
    accumulated_rain_mm: float
    qualifying_days_count: int
    scientific_note: str

class FalseOnsetTargetResult(BaseModel):
    false_onset_observed: int = Field(description="1 if false onset occurred, 0 otherwise")
    false_onset_date: Optional[str] = Field(default=None, description="ISO Date of false onset event")
    dry_spell_days_after: int
    risk_context: str

class DrySpellTargetResult(BaseModel):
    dry_spell_active: int = Field(description="1 if currently in dry spell (>= 5 consecutive dry days), 0 otherwise")
    duration_days: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    break_monsoon_candidate: int = Field(description="1 if dry spell >= 10 days in core monsoon season, 0 otherwise")
    status_label: str

class HeavyRainTargetResult(BaseModel):
    heavy_rain_observed: int = Field(description="1 if daily rainfall >= 64.5 mm, 0 otherwise")
    rainfall_amount_mm: float
    category: str
    threshold_mm: float

class RainfallAnomalyTargetResult(BaseModel):
    observed_mm: float
    climatology_mm: float
    absolute_anomaly_mm: float
    percentage_departure: float
    category: RainfallAnomalyCategory
    insufficient_climatology: bool = False
