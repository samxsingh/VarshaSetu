"""
Unit tests for Deterministic Bilingual Templates and Translation (Phase 5C).
"""

import pytest
from app.localization.schemas import LanguageCode
from app.localization.templates import get_template_for_rule, TEMPLATE_VERSION
from app.localization.translator import AdvisoryTranslator


def test_templates_coverage():
    rules_to_test = [
        "AGRO_HEAVY_RAIN_INFO_001",
        "AGRO_PADDY_HEAVY_RAIN_HARVEST_001",
        "AGRO_DRY_SPELL_INFO_001",
        "AGRO_PADDY_DRY_SPELL_VEGETATIVE_001",
        "AGRO_EXTREME_RAIN_ALERT_001",
        "AGRO_MONSOON_ONSET_INFO_001",
        "AGRO_FALSE_ONSET_RISK_001",
        "AGRO_RAINFALL_DEFICIT_ANOMALY_001",
        "AGRO_RAINFALL_SURPLUS_ANOMALY_001",
    ]

    for rid in rules_to_test:
        tmpl_en = get_template_for_rule(rid, LanguageCode.EN)
        tmpl_hi = get_template_for_rule(rid, LanguageCode.HI)

        assert "title" in tmpl_en and len(tmpl_en["title"]) > 0
        assert "summary" in tmpl_en and "{horizon_days}" in tmpl_en["summary"]
        assert "title" in tmpl_hi and len(tmpl_hi["title"]) > 0
        assert "summary" in tmpl_hi and "{horizon_days}" in tmpl_hi["summary"]


def test_translator_interpolation_and_fingerprint():
    source_adv = {
        "advisory_id": "ADV_BKT_HR_001",
        "triggered_rules": ["AGRO_HEAVY_RAIN_INFO_001"],
        "dedup_hash": "deadbeef12345678",
        "confidence_status": "HISTORICALLY_CALIBRATED",
        "evidence": {
            "target": "HEAVY_RAIN",
            "horizon_days": 7,
            "probability": 0.48,
        },
    }

    # Test Hindi localization
    loc_hi = AdvisoryTranslator.localize(source_adv, LanguageCode.HI)
    assert loc_hi.language == LanguageCode.HI
    assert "भारी वर्षा जोखिम सूचक" in loc_hi.title
    assert "7 दिनों" in loc_hi.summary
    assert "48" in loc_hi.summary
    assert "64.5" in loc_hi.summary
    assert loc_hi.classification == "DIAGNOSTIC_ONLY"
    assert len(loc_hi.localization_fingerprint) == 16

    # Test English localization
    loc_en = AdvisoryTranslator.localize(source_adv, LanguageCode.EN)
    assert loc_en.language == LanguageCode.EN
    assert "Heavy Rainfall Risk Indicator" in loc_en.title
    assert "7-day" in loc_en.summary
    assert "48" in loc_en.summary
    assert loc_en.localization_fingerprint != loc_hi.localization_fingerprint
