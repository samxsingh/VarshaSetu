"""
VarshaSetu - Controlled Crop & Growth Stage Registry (Phase 5A)
Provides conservative metadata definitions for supported crops without
manufacturing unvalidated agronomic constants.
"""

from typing import Dict, List, Optional
from app.agronomy.schemas import CropType, GrowthStage, CropDefinition


CROP_REGISTRY: Dict[CropType, CropDefinition] = {
    CropType.GENERAL: CropDefinition(
        crop_id=CropType.GENERAL,
        display_name="General Agricultural Planning",
        supported_stages=[
            GrowthStage.ALL,
            GrowthStage.PRE_SOWING,
            GrowthStage.SOWING,
            GrowthStage.GERMINATION,
            GrowthStage.VEGETATIVE,
            GrowthStage.FLOWERING,
            GrowthStage.GRAIN_FILLING,
            GrowthStage.MATURITY,
            GrowthStage.HARVEST,
        ],
        relevant_weather_hazards=["HEAVY_RAIN", "DRY_SPELL", "EXTREME_RAIN", "MONSOON_ONSET", "FALSE_ONSET", "RAINFALL_ANOMALY"],
        status="INFORMATIONAL_ONLY",
        scientific_notes="Standard meteorological risk mapping for all rainfed crop systems in Indo-Gangetic Plains."
    ),
    CropType.PADDY: CropDefinition(
        crop_id=CropType.PADDY,
        display_name="Paddy / Rice (धान)",
        supported_stages=[
            GrowthStage.PRE_SOWING,
            GrowthStage.SOWING,
            GrowthStage.GERMINATION,
            GrowthStage.VEGETATIVE,
            GrowthStage.FLOWERING,
            GrowthStage.GRAIN_FILLING,
            GrowthStage.MATURITY,
            GrowthStage.HARVEST,
        ],
        relevant_weather_hazards=["HEAVY_RAIN", "DRY_SPELL", "FALSE_ONSET", "EXTREME_RAIN"],
        status="INFORMATIONAL_ONLY",
        scientific_notes="Primary Kharif season cereal in Uttar Pradesh. Highly sensitive to prolonged dry spells during vegetative/tillering and heavy rainfall during harvest."
    ),
    CropType.WHEAT: CropDefinition(
        crop_id=CropType.WHEAT,
        display_name="Wheat (गेहूं)",
        supported_stages=[
            GrowthStage.PRE_SOWING,
            GrowthStage.SOWING,
            GrowthStage.GERMINATION,
            GrowthStage.VEGETATIVE,
            GrowthStage.FLOWERING,
            GrowthStage.GRAIN_FILLING,
            GrowthStage.MATURITY,
            GrowthStage.HARVEST,
        ],
        relevant_weather_hazards=["RAINFALL_ANOMALY", "EXTREME_RAIN", "DRY_SPELL"],
        status="INFORMATIONAL_ONLY",
        scientific_notes="Rabi season staple cereal. Post-monsoon residual soil moisture informs pre-sowing planning."
    ),
    CropType.MAIZE: CropDefinition(
        crop_id=CropType.MAIZE,
        display_name="Maize / Corn (मक्का)",
        supported_stages=[
            GrowthStage.PRE_SOWING,
            GrowthStage.SOWING,
            GrowthStage.GERMINATION,
            GrowthStage.VEGETATIVE,
            GrowthStage.FLOWERING,
            GrowthStage.MATURITY,
            GrowthStage.HARVEST,
        ],
        relevant_weather_hazards=["HEAVY_RAIN", "DRY_SPELL", "EXTREME_RAIN"],
        status="INFORMATIONAL_ONLY",
        scientific_notes="Kharif coarse cereal sensitive to waterlogging (excess heavy rain) at seedling and flowering stages."
    ),
    CropType.PULSES: CropDefinition(
        crop_id=CropType.PULSES,
        display_name="Pulses / Arhar / Urad (दलहन)",
        supported_stages=[
            GrowthStage.PRE_SOWING,
            GrowthStage.SOWING,
            GrowthStage.GERMINATION,
            GrowthStage.VEGETATIVE,
            GrowthStage.FLOWERING,
            GrowthStage.MATURITY,
            GrowthStage.HARVEST,
        ],
        relevant_weather_hazards=["HEAVY_RAIN", "EXTREME_RAIN", "DRY_SPELL"],
        status="INFORMATIONAL_ONLY",
        scientific_notes="Leguminous rainfed crops highly intolerant of excessive waterlogging; susceptible to root rot during unseasonal heavy rainfall."
    ),
    CropType.MUSTARD: CropDefinition(
        crop_id=CropType.MUSTARD,
        display_name="Mustard / Oilseeds (सरसों)",
        supported_stages=[
            GrowthStage.PRE_SOWING,
            GrowthStage.SOWING,
            GrowthStage.GERMINATION,
            GrowthStage.VEGETATIVE,
            GrowthStage.FLOWERING,
            GrowthStage.MATURITY,
            GrowthStage.HARVEST,
        ],
        relevant_weather_hazards=["RAINFALL_ANOMALY", "HEAVY_RAIN"],
        status="INFORMATIONAL_ONLY",
        scientific_notes="Rabi oilseed requiring well-drained loamy soils; sensitive to heavy precipitation during flowering and pod development."
    ),
}


def get_all_crops() -> List[CropDefinition]:
    """Returns the complete list of registered crops."""
    return list(CROP_REGISTRY.values())


def get_crop(crop_id: str) -> Optional[CropDefinition]:
    """Retrieves a specific crop definition by identifier (case-insensitive)."""
    norm = crop_id.upper().strip()
    try:
        c_type = CropType(norm)
        return CROP_REGISTRY.get(c_type)
    except ValueError:
        return None
