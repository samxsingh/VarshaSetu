"""
VarshaSetu - Deterministic Forecast Explanation & Scientific Disclosure Generator
Generates plain-language, scientifically grounded explanations of forecast outputs.
Reuses the established meteorological feature taxonomy and explicitly rejects causal claims.
"""

from typing import Dict, Any, List, Optional
from ..schemas.forecast import FeatureContributionItem


class ForecastExplanationGenerator:
    """
    Constructs deterministic scientific explanations and disclosure narratives.
    """

    FEATURE_TAXONOMY = {
        "rainfall_1d": ("Antecedent Moisture", "1-day antecedent rainfall"),
        "rainfall_3d": ("Antecedent Moisture", "3-day cumulative rainfall"),
        "rainfall_7d": ("Antecedent Moisture", "7-day cumulative rainfall"),
        "rainfall_14d": ("Antecedent Moisture", "14-day cumulative rainfall"),
        "rainy_days_7d": ("Antecedent Moisture", "Rainy days in past 7 days"),
        "consecutive_dry_days": ("Antecedent Moisture", "Consecutive dry days count"),
        "consecutive_wet_days": ("Antecedent Moisture", "Consecutive wet days count"),
        "temperature_2m_max_c": ("Thermodynamics", "Maximum surface temperature"),
        "temperature_2m_min_c": ("Thermodynamics", "Minimum surface temperature"),
        "diurnal_temp_range_c": ("Thermodynamics", "Diurnal temperature range"),
        "surface_pressure_hpa": ("Synoptic Pressure", "Surface barometric pressure"),
        "wind_speed_10m_mps": ("Boundary Layer Wind", "Near-surface wind speed"),
        "mjo_amplitude": ("Climate Teleconnections", "MJO tropical convective amplitude"),
        "mjo_phase": ("Climate Teleconnections", "MJO convective phase location"),
        "nino34_anomaly": ("Climate Teleconnections", "NOAA Niño 3.4 SST anomaly"),
        "iod_dmi": ("Climate Teleconnections", "BoM Indian Ocean Dipole index"),
        "day_of_year": ("Seasonality", "Calendar day of the year"),
        "sin_doy": ("Seasonality", "Annual monsoon harmonic (sine)"),
        "cos_doy": ("Seasonality", "Annual monsoon harmonic (cosine)")
    }

    @classmethod
    def format_feature_item(
        cls,
        feature_name: str,
        shap_val: float,
        feature_val: float,
        is_classification: bool = True
    ) -> FeatureContributionItem:
        category, human_name = cls.FEATURE_TAXONOMY.get(
            feature_name, ("Meteorological Feature", feature_name.replace("_", " ").title())
        )

        direction = "elevates" if shap_val > 0 else "suppresses" if shap_val < 0 else "neutral"
        magnitude = abs(round(float(shap_val), 4))

        if is_classification:
            desc = (
                f"{human_name} ({feature_val:.1f}) {direction} the predicted event probability "
                f"by a model contribution of {magnitude:.3f} log-odds."
            )
        else:
            desc = (
                f"{human_name} ({feature_val:.1f}) {direction} expected rainfall magnitude "
                f"by an estimated feature contribution of {magnitude:.2f} mm."
            )

        return FeatureContributionItem(
            feature=feature_name,
            category=category,
            shap_value=round(float(shap_val), 4),
            direction=direction,
            magnitude=magnitude,
            description=desc
        )

    @classmethod
    def generate_narrative(
        cls,
        target_name: str,
        horizon_days: int,
        prediction_val: Optional[float],
        probability: Optional[float],
        top_features: List[FeatureContributionItem],
        validation_status: str,
        calibration_status: str,
        data_freshness: str,
        block_id: str = "UP_LKO_BKT"
    ) -> str:
        lines = []

        # 1. Primary statement
        if probability is not None:
            pct = round(probability * 100, 1)
            lines.append(
                f"This forecast estimates a {pct}% likelihood of {target_name.replace('_', ' ').lower()} "
                f"for block {block_id} across a {horizon_days}-day lead horizon."
            )
        elif prediction_val is not None:
            lines.append(
                f"This forecast estimates an expected {prediction_val:.1f} mm of rainfall "
                f"for block {block_id} across a {horizon_days}-day lead horizon."
            )
        else:
            lines.append(
                f"Forecast generated for {target_name} ({horizon_days}-day horizon) for block {block_id}."
            )

        # 2. Key contributing evidence
        if top_features:
            elevating = [f.feature for f in top_features if f.direction == "elevates"][:2]
            suppressing = [f.feature for f in top_features if f.direction == "suppresses"][:2]

            evidence_parts = []
            if elevating:
                elev_names = ", ".join(cls.FEATURE_TAXONOMY.get(e, ("", e))[1] for e in elevating)
                evidence_parts.append(f"Recent conditions elevating model output: {elev_names}.")
            if suppressing:
                supp_names = ", ".join(cls.FEATURE_TAXONOMY.get(s, ("", s))[1] for s in suppressing)
                evidence_parts.append(f"Factors dampening model output: {supp_names}.")

            if evidence_parts:
                lines.append(" ".join(evidence_parts))

        # 3. Scientific disclosures
        lines.append(
            f"Validation Status: {validation_status}. Calibration: {calibration_status}. "
            f"Data Source Freshness: {data_freshness}."
        )

        lines.append(
            "Spatial Resolution: Block centroid level (~9 km gridded). "
            "Micro-scale village variations within the block cannot be resolved."
        )

        return "\n\n".join(lines)

    @classmethod
    def get_scientific_limitations(
        cls,
        validation_status: str,
        calibration_status: str,
        data_freshness: str,
        spatial_resolution: str = "BLOCK"
    ) -> List[str]:
        limitations = [
            f"Spatial resolution bounded at {spatial_resolution} level; localized convective micro-bursts are unresolvable.",
            "Feature attributions reflect statistical model contributions, not physical or agronomic causality.",
        ]

        if data_freshness == "HISTORICAL_ONLY":
            limitations.append(
                "Input dataset is retrospective (Kharif 2024 archive). Forecast reflects historical conditions, NOT current live weather."
            )

        if validation_status == "INSUFFICIENT_DATA":
            limitations.append(
                "Historical record spans 1 season (<5 seasons required). Multi-year operational skill certification is scientifically gated."
            )

        if calibration_status != "CALIBRATED":
            limitations.append(
                "Probabilities are uncalibrated empirical scores due to sample size constraints on operational calibrators."
            )

        return limitations
