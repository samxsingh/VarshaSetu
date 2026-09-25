"""
VarshaSetu - Hindcasting & Multi-Year Validation Package
"""

from .schemas import (
    HindcastFold,
    HorizonEvaluationReport,
    ModelHindcastResult,
    YearlyStabilityReport,
    StabilityDistributionStats,
    HindcastStabilityAnalysis,
    FeatureCoverageItem,
    FeatureCoverageReport,
    BlockValidationReport,
    HindcastExperimentManifest
)
from .folds import generate_hindcast_folds
from .metrics import HindcastMetricsCalculator
from .artifacts import HindcastArtifactManager
from .runner import HindcastRunner
from .coverage import FeatureCoverageInspector

__all__ = [
    "HindcastFold",
    "HorizonEvaluationReport",
    "ModelHindcastResult",
    "YearlyStabilityReport",
    "StabilityDistributionStats",
    "HindcastStabilityAnalysis",
    "FeatureCoverageItem",
    "FeatureCoverageReport",
    "BlockValidationReport",
    "HindcastExperimentManifest",
    "generate_hindcast_folds",
    "HindcastMetricsCalculator",
    "HindcastArtifactManager",
    "HindcastRunner",
    "FeatureCoverageInspector"
]
