"""
Unit tests for Multilingual Advisory Schemas and Terminology Catalog (Phase 5C).
"""

import pytest
from app.localization.schemas import (
    LanguageCode,
    TranslationMethod,
    LocalizedAdvisory,
    TerminologyCatalogEntry,
    AdvisoryLocalizationRequest,
)
from app.localization.terminology import TerminologyCatalog, TERMINOLOGY_VERSION


def test_language_code_and_translation_methods():
    assert LanguageCode.EN == "EN"
    assert LanguageCode.HI == "HI"
    assert TranslationMethod.CONTROLLED_TEMPLATE == "CONTROLLED_TEMPLATE"
    assert TranslationMethod.DIRECT_LOOKUP == "DIRECT_LOOKUP"


def test_terminology_catalog_integrity():
    assert TerminologyCatalog.get_version() == TERMINOLOGY_VERSION
    entries = TerminologyCatalog.get_all_entries()
    assert len(entries) >= 15

    # Check key terms exist and have non-empty bilingual values
    heavy_rain = TerminologyCatalog.get_entry("HEAVY_RAIN")
    assert heavy_rain is not None
    assert "भारी वर्षा" in heavy_rain.hi
    assert "Heavy Rainfall" in heavy_rain.en

    dry_spell = TerminologyCatalog.get_entry("DRY_SPELL")
    assert dry_spell is not None
    assert "शुष्क अवधि" in dry_spell.hi

    diagnostic = TerminologyCatalog.get_entry("DIAGNOSTIC_ONLY")
    assert diagnostic is not None
    assert "केवल नैदानिक" in diagnostic.hi

    historical_lim = TerminologyCatalog.get_entry("HISTORICAL_LIMITATION")
    assert historical_lim is not None
    assert "बख्शी का तालाब" in historical_lim.hi


def test_localized_advisory_contract():
    adv = LocalizedAdvisory(
        advisory_id="LOC_TEST_HI",
        source_advisory_id="SRC_TEST_001",
        language=LanguageCode.HI,
        title="भारी वर्षा जोखिम सूचक",
        summary="आगामी 7 दिनों के लिए भारी वर्षा जोखिम सूचक।",
        risk_indicator="निगरानी: 24 घंटे में 64.5 मिमी से अधिक वर्षा।",
        what_it_means="खेतों में जलभराव की स्थिति बन सकती है।",
        evidence={"target": "HEAVY_RAIN", "horizon_days": 7, "probability": 0.45},
        confidence_statement="अंशांकित मॉडल संकेत।",
        disclosure="सूचना: यह एक सूचनात्मक कृषि-जलवायु जोखिम सूचक है।",
        historical_limitation_disclosure="एकल-सत्र ऐतिहासिक आधार (बख्शी का तालाब, खरीफ 2024)।",
        classification="DIAGNOSTIC_ONLY",
        translation_method=TranslationMethod.CONTROLLED_TEMPLATE,
        template_version="1.0.0",
        terminology_version=TERMINOLOGY_VERSION,
        localization_fingerprint="abc123hash",
    )
    assert adv.language == LanguageCode.HI
    assert adv.classification == "DIAGNOSTIC_ONLY"
    assert adv.translation_method == TranslationMethod.CONTROLLED_TEMPLATE
