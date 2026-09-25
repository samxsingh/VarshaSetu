"""
VarshaSetu - Localization Module (Phase 5C)
"""

from app.localization.schemas import (
    LanguageCode,
    TranslationMethod,
    TerminologyCatalogEntry,
    LocalizedAdvisory,
    AdvisoryLocalizationRequest,
    AdvisoryLocalizationResponse,
    LanguageRegistryResponse,
)
from app.localization.terminology import TerminologyCatalog, TERMINOLOGY_VERSION
from app.localization.templates import TEMPLATE_VERSION, get_template_for_rule
from app.localization.safety import LocalizationSafetyGate, LocalizationSafetyViolation
from app.localization.translator import AdvisoryTranslator

__all__ = [
    "LanguageCode",
    "TranslationMethod",
    "TerminologyCatalogEntry",
    "LocalizedAdvisory",
    "AdvisoryLocalizationRequest",
    "AdvisoryLocalizationResponse",
    "LanguageRegistryResponse",
    "TerminologyCatalog",
    "TERMINOLOGY_VERSION",
    "TEMPLATE_VERSION",
    "get_template_for_rule",
    "LocalizationSafetyGate",
    "LocalizationSafetyViolation",
    "AdvisoryTranslator",
]
