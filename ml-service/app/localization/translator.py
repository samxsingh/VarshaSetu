"""
VarshaSetu - Advisory Localization Translator Engine (Phase 5C)
Transforms scientific advisories into rigorously vetted, localized products
using controlled templates and terminology dictionaries.
"""

import hashlib
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.localization.schemas import (
    LanguageCode,
    TranslationMethod,
    LocalizedAdvisory,
)
from app.localization.templates import (
    TEMPLATE_VERSION,
    STANDARD_DISCLOSURE_EN,
    STANDARD_DISCLOSURE_HI,
    HISTORICAL_LIMITATION_EN,
    HISTORICAL_LIMITATION_HI,
    get_template_for_rule,
)
from app.localization.terminology import TERMINOLOGY_VERSION
from app.localization.safety import (
    LocalizationSafetyGate,
    LocalizationSafetyViolation,
)


class AdvisoryTranslator:
    """Deterministic localization engine."""

    @staticmethod
    def compute_fingerprint(
        source_id: str,
        lang: LanguageCode,
        template_ver: str,
        terminology_ver: str,
        dedup_hash: str,
    ) -> str:
        """Computes deterministic 16-char SHA-256 localization fingerprint."""
        raw = f"{source_id}:{lang.value}:{template_ver}:{terminology_ver}:{dedup_hash}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]

    @classmethod
    def localize(
        cls,
        source_advisory: Dict[str, Any],
        target_lang: LanguageCode = LanguageCode.HI,
    ) -> LocalizedAdvisory:
        """
        Localizes an advisory dictionary into target language with safety verification.
        """
        adv_id = source_advisory.get("advisory_id", "UNKNOWN_ADV")
        evidence = source_advisory.get("evidence", {})
        triggered_rules = source_advisory.get("triggered_rules", [])
        rule_id = triggered_rules[0] if triggered_rules else "UNKNOWN_RULE"
        dedup_hash = source_advisory.get("dedup_hash", "UNKNOWN_HASH")

        # Extract values with safe defaults
        horizon_days = evidence.get("horizon_days", 7)
        prob = evidence.get("probability")
        if prob is not None:
            probability_pct = round(float(prob) * 100.0, 1)
            # If round to .0, format as int for cleaner string if desired, or keep .1
            if probability_pct.is_integer():
                probability_pct_str = str(int(probability_pct))
            else:
                probability_pct_str = str(probability_pct)
        else:
            probability_pct_str = "0"

        # Departure pct for anomaly rules
        departure_pct = 0.0
        # If departure is in features_summary or evidence
        if "departure_pct" in evidence:
            departure_pct = evidence["departure_pct"]
        departure_pct_str = str(abs(round(float(departure_pct), 1)))

        confidence_status = source_advisory.get("confidence_status", "NOT_OPERATIONALLY_CALIBRATED")
        if target_lang == LanguageCode.HI:
            conf_disp = "परिचालन स्तर पर अंशांकित नहीं" if confidence_status == "NOT_OPERATIONALLY_CALIBRATED" else confidence_status
        else:
            conf_disp = confidence_status

        # Retrieve template
        template = get_template_for_rule(rule_id, target_lang)

        # Interpolate variables safely
        fmt_args = {
            "horizon_days": horizon_days,
            "probability_pct": probability_pct_str,
            "departure_pct": departure_pct_str,
            "confidence_status": conf_disp,
        }

        title = template.get("title", "Advisory Risk Indicator").format(**fmt_args)
        summary = template.get("summary", "").format(**fmt_args)
        risk_indicator = template.get("risk_indicator", "").format(**fmt_args)
        what_it_means = template.get("what_it_means", "").format(**fmt_args)
        confidence_statement = template.get("confidence_statement", "").format(**fmt_args)

        disclosure = STANDARD_DISCLOSURE_HI if target_lang == LanguageCode.HI else STANDARD_DISCLOSURE_EN
        hist_limitation = HISTORICAL_LIMITATION_HI if target_lang == LanguageCode.HI else HISTORICAL_LIMITATION_EN

        fingerprint = cls.compute_fingerprint(
            source_id=adv_id,
            lang=target_lang,
            template_ver=TEMPLATE_VERSION,
            terminology_ver=TERMINOLOGY_VERSION,
            dedup_hash=dedup_hash,
        )

        localized = LocalizedAdvisory(
            advisory_id=f"LOC_{adv_id}_{target_lang.value}",
            source_advisory_id=adv_id,
            language=target_lang,
            title=title,
            summary=summary,
            risk_indicator=risk_indicator,
            what_it_means=what_it_means,
            evidence=evidence,
            confidence_statement=confidence_statement,
            disclosure=disclosure,
            historical_limitation_disclosure=hist_limitation,
            classification="DIAGNOSTIC_ONLY",
            translation_method=TranslationMethod.CONTROLLED_TEMPLATE,
            template_version=TEMPLATE_VERSION,
            terminology_version=TERMINOLOGY_VERSION,
            localization_fingerprint=fingerprint,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

        # Run safety gate
        passed, violations = LocalizationSafetyGate.validate_advisory(localized, evidence)
        if not passed:
            raise LocalizationSafetyViolation(
                f"Localization safety gate blocked advisory: {'; '.join(violations)}"
            )

        return localized
