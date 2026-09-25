"""
VarshaSetu - Multilingual Agronomic Localization Schemas (Phase 5C)
Defines strictly typed Pydantic models for controlled multilingual
translation, deterministic terminology mappings, and advisory localization.
"""

from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class LanguageCode(str, Enum):
    """Controlled language registry for farmer advisories."""
    EN = "EN"
    HI = "HI"


class TranslationMethod(str, Enum):
    """Deterministic translation method."""
    CONTROLLED_TEMPLATE = "CONTROLLED_TEMPLATE"
    DIRECT_LOOKUP = "DIRECT_LOOKUP"


class TerminologyCatalogEntry(BaseModel):
    """Single controlled entry in the agro-meteorological glossary."""
    term_key: str
    category: str
    en: str
    hi: str
    definition: str


class LocalizedAdvisory(BaseModel):
    """Strictly typed localized advisory product."""
    advisory_id: str
    source_advisory_id: str
    language: LanguageCode
    title: str
    summary: str
    risk_indicator: str
    what_it_means: str
    evidence: Dict[str, Any]
    confidence_statement: str
    disclosure: str
    historical_limitation_disclosure: str
    classification: str = "DIAGNOSTIC_ONLY"
    translation_method: TranslationMethod = TranslationMethod.CONTROLLED_TEMPLATE
    template_version: str = "1.0.0"
    terminology_version: str = "1.0.0"
    localization_fingerprint: str
    generated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AdvisoryLocalizationRequest(BaseModel):
    """Request payload to localize an existing or transient advisory."""
    advisory_id: Optional[str] = None
    target_language: LanguageCode = LanguageCode.HI
    advisory: Optional[Dict[str, Any]] = None


class AdvisoryLocalizationResponse(BaseModel):
    """Result of an advisory localization operation."""
    localized_advisory: LocalizedAdvisory
    safety_gate_status: str = "PASSED"
    numerical_drift_detected: bool = False
    imperative_terms_detected: List[str] = Field(default_factory=list)
    system_status: str = "DIAGNOSTIC_ONLY"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LanguageRegistryResponse(BaseModel):
    """Supported languages registry information."""
    supported_languages: List[Dict[str, str]]
    default_language: str = "EN"
    translation_engine: str = "CONTROLLED_DETERMINISTIC_TEMPLATES"
    disclaimer: str = (
        "Translations are governed by deterministic agronomic templates. "
        "Dynamic unvetted machine translations are prohibited."
    )
