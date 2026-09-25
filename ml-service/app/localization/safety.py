"""
VarshaSetu - Localization Safety Gate (Phase 5C)
Guarantees semantic purity, scientific consistency, and strict prohibition of
imperative directives, yield predictions, and financial claims across all localized advisories.
"""

import re
from typing import Dict, Any, List, Tuple
from app.localization.schemas import LocalizedAdvisory, LanguageCode

FORBIDDEN_IMPERATIVE_EN = [
    r"\bspray\b",
    r"\bapply\b",
    r"\bsow\b",
    r"\bplant\b",
    r"\bharvest now\b",
    r"\bdo not sow\b",
    r"\birrigate immediately\b",
    r"\bbuy\b",
    r"\bsell\b",
    r"\bguarantee\b",
    r"\bmust\b",
]

FORBIDDEN_IMPERATIVE_HI = [
    r"छिड़काव करें",
    r"खाद डालें",
    r"बोआई करें",
    r"बोआई न करें",
    r"तुरंत सिंचाई करें",
    r"फसल काटें",
    r"दवा डालें",
    r"गारंटी",
    r"खरीदें",
    r"बेचें",
    r"अवश्य करें",
]

FORBIDDEN_YIELD_EN = [
    r"\byield\b",
    r"\bbiomass\b",
    r"\bproduction loss\b",
    r"\btonnes per hectare\b",
    r"\bquintal\b",
    r"\bcrop loss\b",
]

FORBIDDEN_YIELD_HI = [
    r"उपज",
    r"पैदावार",
    r"उत्पादन हानि",
    r"क्विंटल",
    r"फसल नुकसान",
    r"बायोमास",
]

FORBIDDEN_FINANCIAL_EN = [
    r"\brevenue\b",
    r"\bprofit\b",
    r"\bmonetary loss\b",
    r"\brupees\b",
    r"\binr\b",
    r"₹",
    r"\$",
]

FORBIDDEN_FINANCIAL_HI = [
    r"रुपये",
    r"मुनाफा",
    r"आमदनी",
    r"वित्तीय हानि",
    r"₹",
    r"पैसा",
]


class LocalizationSafetyViolation(Exception):
    """Raised when localized text violates agronomic safety boundaries."""
    pass


class LocalizationSafetyGate:
    """Enforces safety, non-prescriptiveness, and numerical fidelity."""

    @staticmethod
    def _extract_numbers(text: str) -> List[float]:
        """Extracts floating point and integer numbers from text."""
        # Find occurrences like 64.5, 50, 5, 204.5, etc.
        raw_matches = re.findall(r"[-+]?\d*\.?\d+", text)
        numbers = []
        for m in raw_matches:
            try:
                val = float(m)
                numbers.append(round(val, 2))
            except ValueError:
                continue
        return numbers

    @classmethod
    def evaluate_text(
        cls,
        text: str,
        language: LanguageCode,
    ) -> Tuple[bool, List[str]]:
        """Scans single text block for forbidden words."""
        violations = []

        # 1. Imperatives
        imp_patterns = FORBIDDEN_IMPERATIVE_HI if language == LanguageCode.HI else FORBIDDEN_IMPERATIVE_EN
        for pat in imp_patterns:
            if re.search(pat, text, re.IGNORECASE):
                violations.append(f"Forbidden imperative term detected: '{pat}'")

        # 2. Yield/biomass
        yield_patterns = FORBIDDEN_YIELD_HI if language == LanguageCode.HI else FORBIDDEN_YIELD_EN
        for pat in yield_patterns:
            if re.search(pat, text, re.IGNORECASE):
                violations.append(f"Forbidden yield/biomass claim detected: '{pat}'")

        # 3. Financial/revenue
        fin_patterns = FORBIDDEN_FINANCIAL_HI if language == LanguageCode.HI else FORBIDDEN_FINANCIAL_EN
        for pat in fin_patterns:
            if re.search(pat, text, re.IGNORECASE):
                violations.append(f"Forbidden financial/revenue claim detected: '{pat}'")

        return len(violations) == 0, violations

    @classmethod
    def verify_numerical_fidelity(
        cls,
        source_evidence: Dict[str, Any],
        localized_advisory: LocalizedAdvisory,
    ) -> Tuple[bool, List[str]]:
        """Verifies that all quantitative metrics in evidence are accurately reflected."""
        discrepancies = []

        # Check probability if present
        source_prob = source_evidence.get("probability")
        if source_prob is not None:
            expected_pct = round(float(source_prob) * 100.0, 1)
            # Find in title or summary or what_it_means
            combined_text = f"{localized_advisory.summary} {localized_advisory.what_it_means}"
            nums = cls._extract_numbers(combined_text)
            # Match either expected_pct or int(expected_pct)
            if expected_pct not in nums and float(int(expected_pct)) not in nums:
                discrepancies.append(
                    f"Probability mismatch: source indicates {expected_pct}%, but value was not preserved in localized text."
                )

        # Check horizon_days
        horizon = source_evidence.get("horizon_days")
        if horizon is not None:
            combined_text = f"{localized_advisory.summary} {localized_advisory.what_it_means}"
            nums = cls._extract_numbers(combined_text)
            if float(horizon) not in nums:
                discrepancies.append(
                    f"Horizon mismatch: source indicates {horizon} days, but value was missing in localized text."
                )

        return len(discrepancies) == 0, discrepancies

    @classmethod
    def validate_advisory(
        cls,
        localized_advisory: LocalizedAdvisory,
        source_evidence: Dict[str, Any],
    ) -> Tuple[bool, List[str]]:
        """Runs full safety gate over localized advisory."""
        all_violations = []

        fields_to_check = [
            localized_advisory.title,
            localized_advisory.summary,
            localized_advisory.risk_indicator,
            localized_advisory.what_it_means,
            localized_advisory.confidence_statement,
        ]

        for content in fields_to_check:
            ok, viols = cls.evaluate_text(content, localized_advisory.language)
            if not ok:
                all_violations.extend(viols)

        num_ok, num_viols = cls.verify_numerical_fidelity(source_evidence, localized_advisory)
        if not num_ok:
            all_violations.extend(num_viols)

        return len(all_violations) == 0, all_violations
