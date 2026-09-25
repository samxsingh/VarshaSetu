"""
VarshaSetu - Agronomic Rule Registry (Phase 5A)
Central catalog of deterministic, peer-reviewed agronomic rules.
"""

from typing import List, Optional, Dict
from app.agronomy.schemas import AgronomicRule, CropType, GrowthStage
from app.agronomy.rules import ALL_RULES


class AgronomicRuleRegistry:
    """Manages the in-memory catalog of active agronomic rules."""

    def __init__(self, rules: Optional[List[AgronomicRule]] = None):
        self._rules: Dict[str, AgronomicRule] = {}
        rule_list = rules if rules is not None else ALL_RULES
        for r in rule_list:
            self._rules[r.rule_id] = r

    def get_all_rules(self, enabled_only: bool = True) -> List[AgronomicRule]:
        """Returns all registered rules, sorted deterministically by priority."""
        rules = list(self._rules.values())
        if enabled_only:
            rules = [r for r in rules if r.enabled]
        return sorted(rules, key=lambda x: x.priority, reverse=True)

    def get_rule_by_id(self, rule_id: str) -> Optional[AgronomicRule]:
        """Looks up a specific rule by its unique identifier."""
        return self._rules.get(rule_id)

    def get_rules_for_target(self, target: str, enabled_only: bool = True) -> List[AgronomicRule]:
        """Finds all rules applicable to a specific forecast target type."""
        all_r = self.get_all_rules(enabled_only=enabled_only)
        return [r for r in all_r if r.target.upper() == target.upper()]

    def get_applicable_rules(
        self,
        crop: CropType = CropType.GENERAL,
        stage: GrowthStage = GrowthStage.ALL,
        target: Optional[str] = None,
        enabled_only: bool = True,
    ) -> List[AgronomicRule]:
        """
        Retrieves all rules matching the provided crop context, growth stage, and optional target.
        General rules (applicable_crop == GENERAL) match any crop.
        GrowthStage.ALL matches any growth stage.
        """
        candidates = self.get_all_rules(enabled_only=enabled_only)
        matching: List[AgronomicRule] = []

        for r in candidates:
            # Target check
            if target and r.target.upper() != target.upper():
                continue

            # Crop check: rule matches if it targets GENERAL or the specific requested crop
            crop_matches = (
                r.applicable_crop == CropType.GENERAL
                or r.applicable_crop == crop
                or (isinstance(r.applicable_crop, str) and (r.applicable_crop == "GENERAL" or r.applicable_crop == crop.value))
            )
            if not crop_matches:
                continue

            # Growth stage check: rule matches if it applies to ALL or contains the requested stage
            stage_matches = (
                stage == GrowthStage.ALL
                or GrowthStage.ALL in r.applicable_stages
                or stage in r.applicable_stages
            )
            if not stage_matches:
                continue

            matching.append(r)

        return sorted(matching, key=lambda x: x.priority, reverse=True)


# Global singleton instance
rule_registry = AgronomicRuleRegistry()
