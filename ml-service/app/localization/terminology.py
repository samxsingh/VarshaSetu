"""
VarshaSetu - Controlled Terminology Catalog (Phase 5C)
Maintains an immutable, versioned bilingual vocabulary for agro-meteorological
concepts to ensure zero semantic distortion across language conversions.
"""

from typing import Dict, List, Optional
from app.localization.schemas import TerminologyCatalogEntry, LanguageCode

TERMINOLOGY_VERSION = "1.0.0"

_CATALOG: Dict[str, TerminologyCatalogEntry] = {
    "HEAVY_RAIN": TerminologyCatalogEntry(
        term_key="HEAVY_RAIN",
        category="METEOROLOGICAL_HAZARD",
        en="Heavy Rainfall (>=64.5 mm / 24h)",
        hi="भारी वर्षा (>=64.5 मिमी / 24 घंटे)",
        definition="Precipitation exceeding the IMD heavy rainfall standard threshold in a single 24h interval."
    ),
    "DRY_SPELL": TerminologyCatalogEntry(
        term_key="DRY_SPELL",
        category="METEOROLOGICAL_HAZARD",
        en="Dry Spell (>=5 consecutive dry days)",
        hi="शुष्क अवधि (लगातार 5 या अधिक सूखे दिन)",
        definition="Sustained interval of consecutive days receiving less than 1.0 mm precipitation."
    ),
    "EXTREME_RAIN": TerminologyCatalogEntry(
        term_key="EXTREME_RAIN",
        category="METEOROLOGICAL_HAZARD",
        en="Extreme Rainfall (>=204.5 mm / 24h)",
        hi="अत्यधिक वर्षा (>=204.5 मिमी / 24 घंटे)",
        definition="Precipitation exceeding the IMD extreme rainfall threshold causing inundation risk."
    ),
    "MONSOON_ONSET": TerminologyCatalogEntry(
        term_key="MONSOON_ONSET",
        category="METEOROLOGICAL_FEATURE",
        en="Monsoon Onset Progression",
        hi="मानसून प्रारंभ प्रगति",
        definition="Progression of the southwest monsoon precipitation criteria over the regional block."
    ),
    "FALSE_ONSET": TerminologyCatalogEntry(
        term_key="FALSE_ONSET",
        category="METEOROLOGICAL_FEATURE",
        en="False Onset Hiatus Risk",
        hi="असत्य मानसून प्रारंभ व शुष्क विराम जोखिम",
        definition="Early isolated rainfall event followed by an extended multi-day precipitation hiatus."
    ),
    "RAINFALL_DEFICIT": TerminologyCatalogEntry(
        term_key="RAINFALL_DEFICIT",
        category="CLIMATIC_ANOMALY",
        en="Substantial Rainfall Deficit",
        hi="उल्लेखनीय वर्षा कमी",
        definition="Cumulative precipitation departure of 50% or more below historical climatological normals."
    ),
    "RAINFALL_SURPLUS": TerminologyCatalogEntry(
        term_key="RAINFALL_SURPLUS",
        category="CLIMATIC_ANOMALY",
        en="Substantial Rainfall Surplus",
        hi="उल्लेखनीय वर्षा आधिक्य",
        definition="Cumulative precipitation departure of 50% or more above historical climatological normals."
    ),
    "WATERLOGGING": TerminologyCatalogEntry(
        term_key="WATERLOGGING",
        category="FIELD_RISK",
        en="Field Waterlogging Risk",
        hi="खेत में जलभराव का जोखिम",
        definition="Risk of surface water pooling in agricultural plots following high precipitation."
    ),
    "SOIL_MOISTURE_STRESS": TerminologyCatalogEntry(
        term_key="SOIL_MOISTURE_STRESS",
        category="FIELD_RISK",
        en="Soil Moisture Stress",
        hi="मृदा नमी तनाव",
        definition="Root-zone moisture deficit arising from elevated evapotranspiration and absent precipitation."
    ),
    "FORECAST_PROBABILITY": TerminologyCatalogEntry(
        term_key="FORECAST_PROBABILITY",
        category="SCIENTIFIC_METRIC",
        en="Forecast Probability",
        hi="पूर्वानुमान संभावना",
        definition="Calibrated probabilistic estimate produced by downscaled gradient-boosted ensembles."
    ),
    "CALIBRATED_PROBABILITY": TerminologyCatalogEntry(
        term_key="CALIBRATED_PROBABILITY",
        category="SCIENTIFIC_METRIC",
        en="Calibrated Probability",
        hi="अंशांकित संभावना",
        definition="Empirically aligned probability reflecting historical observation frequencies."
    ),
    "HISTORICAL_BASELINE": TerminologyCatalogEntry(
        term_key="HISTORICAL_BASELINE",
        category="SCIENTIFIC_METRIC",
        en="Historical Climatological Baseline",
        hi="ऐतिहासिक जलवायु आधार रेखा",
        definition="Long-term multi-decade empirical observation distribution for the geographical block."
    ),
    "DIAGNOSTIC_ONLY": TerminologyCatalogEntry(
        term_key="DIAGNOSTIC_ONLY",
        category="GOVERNANCE_DISCLOSURE",
        en="Diagnostic Only — Informational Risk Indicator",
        hi="केवल नैदानिक — सूचनात्मक जोखिम सूचक",
        definition="Classification indicating non-actionable, scientific informational monitoring status."
    ),
    "HISTORICAL_LIMITATION": TerminologyCatalogEntry(
        term_key="HISTORICAL_LIMITATION",
        category="GOVERNANCE_DISCLOSURE",
        en="Single-Season Historical Anchor (UP_LKO_BKT, Kharif 2024)",
        hi="एकल-सत्र ऐतिहासिक आधार (बख्शी का तालाब, खरीफ 2024)",
        definition="Ground observational limitation to a single 122-day Kharif season in Lucknow district."
    ),
    "CROP_PADDY": TerminologyCatalogEntry(
        term_key="CROP_PADDY",
        category="AGRONOMY_CROP",
        en="Paddy (Rice)",
        hi="धान (चावल)",
        definition="Oryza sativa cultivated primarily during the Kharif monsoon season."
    ),
    "CROP_WHEAT": TerminologyCatalogEntry(
        term_key="CROP_WHEAT",
        category="AGRONOMY_CROP",
        en="Wheat",
        hi="गेहूं",
        definition="Triticum aestivum cultivated primarily during the Rabi season."
    ),
    "CROP_MAIZE": TerminologyCatalogEntry(
        term_key="CROP_MAIZE",
        category="AGRONOMY_CROP",
        en="Maize",
        hi="मक्का",
        definition="Zea mays cultivated across diversified cropping systems."
    ),
    "CROP_PULSES": TerminologyCatalogEntry(
        term_key="CROP_PULSES",
        category="AGRONOMY_CROP",
        en="Pulses / Legumes",
        hi="दलहन / दालें",
        definition="Leguminous nitrogen-fixing crops sensitive to prolonged waterlogging."
    ),
    "CROP_MUSTARD": TerminologyCatalogEntry(
        term_key="CROP_MUSTARD",
        category="AGRONOMY_CROP",
        en="Mustard / Oilseeds",
        hi="सरसों / तिलहन",
        definition="Oilseed crops cultivated during post-monsoon and Rabi intervals."
    ),
    "STAGE_SOWING": TerminologyCatalogEntry(
        term_key="STAGE_SOWING",
        category="CROP_STAGE",
        en="Sowing / Transplanting Stage",
        hi="बोआई / रोपाई अवस्था",
        definition="Initial crop establishment period in the field."
    ),
    "STAGE_VEGETATIVE": TerminologyCatalogEntry(
        term_key="STAGE_VEGETATIVE",
        category="CROP_STAGE",
        en="Vegetative Growth / Tillering Stage",
        hi="वानस्पतिक वृद्धि / कल्ले फूटने की अवस्था",
        definition="Canopy development and stem elongation phase."
    ),
    "STAGE_FLOWERING": TerminologyCatalogEntry(
        term_key="STAGE_FLOWERING",
        category="CROP_STAGE",
        en="Flowering / Heading Stage",
        hi="फूल आने की अवस्था",
        definition="Reproductive phase critical for pollination and seed setting."
    ),
    "STAGE_MATURITY": TerminologyCatalogEntry(
        term_key="STAGE_MATURITY",
        category="CROP_STAGE",
        en="Maturity / Ripening Stage",
        hi="परिपक्वता / दाना पकने की अवस्था",
        definition="Grain moisture loss and maturation stage prior to harvest."
    ),
    "STAGE_HARVEST": TerminologyCatalogEntry(
        term_key="STAGE_HARVEST",
        category="CROP_STAGE",
        en="Harvest Window",
        hi="कटाई की अवधि",
        definition="Period of crop cutting, threshing, and field clearance."
    ),
    "SEVERITY_INFO": TerminologyCatalogEntry(
        term_key="SEVERITY_INFO",
        category="SEVERITY_TIER",
        en="Informational Indicator",
        hi="सूचनात्मक सूचक",
        definition="Routine baseline meteorological state requiring awareness."
    ),
    "SEVERITY_WATCH": TerminologyCatalogEntry(
        term_key="SEVERITY_WATCH",
        category="SEVERITY_TIER",
        en="Meteorological Watch",
        hi="मौसम निगरानी",
        definition="Elevated potential for noteworthy atmospheric development."
    ),
    "SEVERITY_ELEVATED": TerminologyCatalogEntry(
        term_key="SEVERITY_ELEVATED",
        category="SEVERITY_TIER",
        en="Elevated Watch",
        hi="सतर्कता निगरानी",
        definition="High confidence hazard signal crossing defined agro-meteorological watch criteria."
    ),
    "SEVERITY_HIGH": TerminologyCatalogEntry(
        term_key="SEVERITY_HIGH",
        category="SEVERITY_TIER",
        en="High Hazard Indicator",
        hi="उच्च जोखिम सूचक",
        definition="Extreme meteorological anomaly signal with widespread potential impact."
    ),
}


class TerminologyCatalog:
    """Read-only access to controlled terminology."""

    @staticmethod
    def get_term(term_key: str, lang: LanguageCode = LanguageCode.EN) -> str:
        """Retrieves localized display term or defaults to key."""
        entry = _CATALOG.get(term_key)
        if not entry:
            return term_key
        return entry.hi if lang == LanguageCode.HI else entry.en

    @staticmethod
    def get_entry(term_key: str) -> Optional[TerminologyCatalogEntry]:
        """Retrieves catalog entry object."""
        return _CATALOG.get(term_key)

    @staticmethod
    def get_all_entries() -> List[TerminologyCatalogEntry]:
        """Lists all registered terminology entries."""
        return list(_CATALOG.values())

    @staticmethod
    def get_version() -> str:
        """Returns catalog semantic version."""
        return TERMINOLOGY_VERSION
