"""
Unit tests for Localization Safety Gate (Phase 5C).
"""

import pytest
from app.localization.schemas import LanguageCode, LocalizedAdvisory
from app.localization.safety import LocalizationSafetyGate, LocalizationSafetyViolation
from app.localization.translator import AdvisoryTranslator


def test_safety_gate_rejects_imperative_directives():
    # English imperative
    passed, viols = LocalizationSafetyGate.evaluate_text(
        "Farmers must spray pesticide immediately to prevent insect attack.",
        LanguageCode.EN,
    )
    assert not passed
    assert any("spray" in v.lower() for v in viols)

    # Hindi imperative
    passed_hi, viols_hi = LocalizationSafetyGate.evaluate_text(
        "किसान तुरंत खेत में खाद डालें और कीटनाशक का छिड़काव करें।",
        LanguageCode.HI,
    )
    assert not passed_hi
    assert len(viols_hi) >= 1


def test_safety_gate_rejects_yield_and_biomass():
    passed_en, viols_en = LocalizationSafetyGate.evaluate_text(
        "Expected paddy crop yield will drop by 4 tonnes per hectare.",
        LanguageCode.EN,
    )
    assert not passed_en
    assert any("yield" in v.lower() for v in viols_en)

    passed_hi, viols_hi = LocalizationSafetyGate.evaluate_text(
        "फसल की कुल उपज में भारी नुकसान की संभावना है।",
        LanguageCode.HI,
    )
    assert not passed_hi
    assert any("उपज" in v for v in viols_hi)


def test_safety_gate_rejects_financial_revenue():
    passed_en, viols_en = LocalizationSafetyGate.evaluate_text(
        "Total revenue loss estimated at 50000 rupees.",
        LanguageCode.EN,
    )
    assert not passed_en

    passed_hi, viols_hi = LocalizationSafetyGate.evaluate_text(
        "प्रति एकड़ 10000 रुपये का मुनाफा कम होगा।",
        LanguageCode.HI,
    )
    assert not passed_hi


def test_numerical_fidelity_check():
    source_evidence = {"horizon_days": 7, "probability": 0.55}

    # Advisory missing the probability
    bad_adv = LocalizedAdvisory(
        advisory_id="LOC_BAD",
        source_advisory_id="SRC_BAD",
        language=LanguageCode.HI,
        title="सूचक",
        summary="आगामी 7 दिनों के लिए सूचक सक्रिय है बिना किसी प्रतिशत के।",
        risk_indicator="निगरानी",
        what_it_means="विवरण",
        evidence=source_evidence,
        confidence_statement="अंशांकित",
        disclosure="सूचना",
        historical_limitation_disclosure="सीमा",
        classification="DIAGNOSTIC_ONLY",
        localization_fingerprint="abc",
    )

    passed, discrepancies = LocalizationSafetyGate.verify_numerical_fidelity(source_evidence, bad_adv)
    assert not passed
    assert any("Probability mismatch" in d for d in discrepancies)
