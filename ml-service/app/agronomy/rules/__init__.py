"""
Agronomic rules package exports.
"""

from app.agronomy.rules.heavy_rain import HEAVY_RAIN_RULES
from app.agronomy.rules.extreme_rain import EXTREME_RAIN_RULES
from app.agronomy.rules.dry_spell import DRY_SPELL_RULES
from app.agronomy.rules.onset import ONSET_RULES
from app.agronomy.rules.anomaly import ANOMALY_RULES

ALL_RULES = (
    HEAVY_RAIN_RULES
    + EXTREME_RAIN_RULES
    + DRY_SPELL_RULES
    + ONSET_RULES
    + ANOMALY_RULES
)
