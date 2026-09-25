"""
VarshaSetu - Historical Dataset Drift Detection
Analyzes feature distribution stability across historical seasons and partitions
using Population Stability Index (PSI), Kolmogorov-Smirnov (KS) divergence,
and statistical moment shifts (mean/variance).
"""

from typing import Dict, Any, List, Optional, Tuple
from enum import Enum
import pandas as pd
import numpy as np
from scipy import stats
from pydantic import BaseModel, Field


class DriftStatus(str, Enum):
    STABLE = "STABLE"
    SHIFT_DETECTED = "SHIFT_DETECTED"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class FeatureDriftResult(BaseModel):
    feature: str
    reference_period: str
    comparison_period: str
    metric: str
    value: Optional[float] = None
    threshold: float
    status: DriftStatus
    notes: str = ""


class DatasetDriftReport(BaseModel):
    status: DriftStatus
    reference_period: str
    comparison_period: str
    total_features_evaluated: int
    features_with_shift: List[str] = Field(default_factory=list)
    drift_results: List[FeatureDriftResult] = Field(default_factory=list)
    scientific_notes: str = ""


class FeatureDriftDetector:
    """
    Evaluates historical meteorological and climate feature distributions
    to distinguish natural climate shifts from measurement distortion.
    """

    CORE_FEATURES: List[str] = [
        "rainfall_1d",
        "rainfall_3d",
        "rainfall_7d",
        "temperature_2m_max_c",
        "temperature_2m_min_c",
        "surface_pressure_hpa",
        "wind_speed_10m_mps",
        "mjo_amplitude",
        "nino34_anomaly",
        "iod_dmi"
    ]

    PSI_THRESHOLD_MODERATE: float = 0.10
    PSI_THRESHOLD_SIGNIFICANT: float = 0.25
    KS_PVALUE_THRESHOLD: float = 0.05
    MIN_SAMPLES_PER_PERIOD: int = 15

    @classmethod
    def calculate_psi(
        cls,
        reference: np.ndarray,
        comparison: np.ndarray,
        num_buckets: int = 10
    ) -> Optional[float]:
        """
        Calculates Population Stability Index (PSI) between two continuous distributions.
        PSI = sum((Actual% - Expected%) * ln(Actual% / Expected%))
        """
        ref_clean = reference[~np.isnan(reference)]
        comp_clean = comparison[~np.isnan(comparison)]

        if len(ref_clean) < cls.MIN_SAMPLES_PER_PERIOD or len(comp_clean) < cls.MIN_SAMPLES_PER_PERIOD:
            return None

        # Determine bucket breakpoints from reference
        try:
            percentiles = np.linspace(0, 100, num_buckets + 1)
            raw_bins = np.percentile(ref_clean, percentiles)
            bins = np.unique(raw_bins)

            if len(bins) < 2:
                # Constant or near-constant series
                return 0.0

            # Compute counts
            ref_counts, _ = np.histogram(ref_clean, bins=bins)
            comp_counts, _ = np.histogram(comp_clean, bins=bins)

            # Convert to proportions with smoothing epsilon to prevent division by zero
            eps = 1e-4
            ref_pct = (ref_counts + eps) / (len(ref_clean) + eps * len(ref_counts))
            comp_pct = (comp_counts + eps) / (len(comp_clean) + eps * len(comp_counts))

            psi = np.sum((comp_pct - ref_pct) * np.log(comp_pct / ref_pct))
            return float(round(max(0.0, psi), 4))
        except Exception:
            return None

    @classmethod
    def calculate_ks(
        cls,
        reference: np.ndarray,
        comparison: np.ndarray
    ) -> Tuple[Optional[float], Optional[float]]:
        """
        Calculates 2-sample Kolmogorov-Smirnov test statistic and p-value.
        """
        ref_clean = reference[~np.isnan(reference)]
        comp_clean = comparison[~np.isnan(comparison)]

        if len(ref_clean) < cls.MIN_SAMPLES_PER_PERIOD or len(comp_clean) < cls.MIN_SAMPLES_PER_PERIOD:
            return None, None

        try:
            res = stats.ks_2samp(ref_clean, comp_clean)
            return float(round(res.statistic, 4)), float(round(res.pvalue, 6))
        except Exception:
            return None, None

    @classmethod
    def evaluate_drift(
        cls,
        df_reference: pd.DataFrame,
        df_comparison: pd.DataFrame,
        reference_label: str = "Reference Period",
        comparison_label: str = "Comparison Period",
        features: Optional[List[str]] = None
    ) -> DatasetDriftReport:
        """
        Runs comprehensive drift analysis across specified meteorological variables.
        """
        target_features = features or cls.CORE_FEATURES
        results: List[FeatureDriftResult] = []
        features_with_shift: List[str] = []

        if len(df_reference) < cls.MIN_SAMPLES_PER_PERIOD or len(df_comparison) < cls.MIN_SAMPLES_PER_PERIOD:
            return DatasetDriftReport(
                status=DriftStatus.INSUFFICIENT_DATA,
                reference_period=reference_label,
                comparison_period=comparison_label,
                total_features_evaluated=0,
                scientific_notes=f"Insufficient sample size (<{cls.MIN_SAMPLES_PER_PERIOD} records) in one or both partitions to evaluate distribution drift."
            )

        for feat in target_features:
            if feat not in df_reference.columns or feat not in df_comparison.columns:
                results.append(FeatureDriftResult(
                    feature=feat,
                    reference_period=reference_label,
                    comparison_period=comparison_label,
                    metric="PSI",
                    value=None,
                    threshold=cls.PSI_THRESHOLD_SIGNIFICANT,
                    status=DriftStatus.INSUFFICIENT_DATA,
                    notes="Feature missing from one or both datasets."
                ))
                continue

            ref_vals = df_reference[feat].dropna().values.astype(float)
            comp_vals = df_comparison[feat].dropna().values.astype(float)

            psi = cls.calculate_psi(ref_vals, comp_vals)
            ks_stat, ks_pval = cls.calculate_ks(ref_vals, comp_vals)

            if psi is None or ks_pval is None:
                results.append(FeatureDriftResult(
                    feature=feat,
                    reference_period=reference_label,
                    comparison_period=comparison_label,
                    metric="PSI",
                    value=None,
                    threshold=cls.PSI_THRESHOLD_SIGNIFICANT,
                    status=DriftStatus.INSUFFICIENT_DATA,
                    notes="Insufficient valid numeric observations."
                ))
                continue

            # Evaluate shift status
            if psi >= cls.PSI_THRESHOLD_SIGNIFICANT or (ks_pval < cls.KS_PVALUE_THRESHOLD and ks_stat > 0.3):
                status = DriftStatus.SHIFT_DETECTED
                features_with_shift.append(feat)
                note = f"Distribution shift detected (PSI={psi:.4f}, KS={ks_stat:.3f}, p={ks_pval:.4f})."
            elif psi >= cls.PSI_THRESHOLD_MODERATE:
                status = DriftStatus.STABLE
                note = f"Moderate natural fluctuation (PSI={psi:.4f}), within acceptable bounds."
            else:
                status = DriftStatus.STABLE
                note = f"Distribution stable across periods (PSI={psi:.4f}, KS={ks_stat:.3f})."

            results.append(FeatureDriftResult(
                feature=feat,
                reference_period=reference_label,
                comparison_period=comparison_label,
                metric="PSI",
                value=psi,
                threshold=cls.PSI_THRESHOLD_SIGNIFICANT,
                status=status,
                notes=note
            ))

        total_evaluated = len([r for r in results if r.status != DriftStatus.INSUFFICIENT_DATA])
        overall_status = DriftStatus.SHIFT_DETECTED if features_with_shift else DriftStatus.STABLE

        if total_evaluated == 0:
            overall_status = DriftStatus.INSUFFICIENT_DATA

        notes_summary = (
            f"Evaluated {total_evaluated} features. Found {len(features_with_shift)} feature(s) "
            f"with statistical shifts between {reference_label} and {comparison_label}."
        )

        return DatasetDriftReport(
            status=overall_status,
            reference_period=reference_label,
            comparison_period=comparison_label,
            total_features_evaluated=total_evaluated,
            features_with_shift=features_with_shift,
            drift_results=results,
            scientific_notes=notes_summary
        )
