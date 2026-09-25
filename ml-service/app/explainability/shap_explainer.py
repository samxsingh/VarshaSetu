"""
VarshaSetu - Tree SHAP Explainer
Computes feature attributions using SHAP TreeExplainer for XGBoost and LightGBM models.
Maps attributions to domain-specific meteorological categories and generates causal summaries.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
import shap

from .schemas import (
    ShapFeatureContribution,
    ShapExplanationReport,
    GlobalFeatureImportance,
    ModelGlobalExplainabilityReport
)
from ..models.tree.base import BaseTreeModel


class TreeShapExplainer:
    CATEGORY_MAPPING = {
        "nino34_anomaly": "teleconnection",
        "nino34_anom": "teleconnection",
        "iod_dmi": "teleconnection",
        "mjo_amplitude": "teleconnection",
        "mjo_phase": "teleconnection",
        "rmm1": "teleconnection",
        "rmm2": "teleconnection",
        "rainfall_1d": "moisture_antecedent",
        "rainfall_3d": "moisture_antecedent",
        "rainfall_7d": "moisture_antecedent",
        "rainfall_14d": "moisture_antecedent",
        "rainy_days_7d": "moisture_antecedent",
        "consecutive_dry_days": "moisture_antecedent",
        "consecutive_wet_days": "moisture_antecedent",
        "humidity": "atmospheric_moisture",
        "temperature_2m_max_c": "thermodynamics",
        "temperature_2m_min_c": "thermodynamics",
        "diurnal_temp_range_c": "thermodynamics",
        "surface_pressure_hpa": "synoptic_pressure",
        "wind_speed_10m_mps": "boundary_layer_wind",
        "day_of_year": "seasonality",
        "sin_doy": "seasonality",
        "cos_doy": "seasonality",
        "spatial_latitude": "spatial",
        "spatial_longitude": "spatial",
        "spatial_elevation_m": "spatial",
        "spatial_dist_to_district_km": "spatial"
    }

    @classmethod
    def get_category(cls, feature_name: str) -> str:
        for k, v in cls.CATEGORY_MAPPING.items():
            if k in feature_name:
                return v
        return "meteorological"

    @classmethod
    def generate_human_explanation(cls, feature_name: str, val: float, shap_val: float, is_classification: bool) -> str:
        cat = cls.get_category(feature_name)
        direction_word = "elevates" if shap_val > 0 else "suppresses"
        impact_word = "event probability" if is_classification else "expected magnitude"

        if cat == "teleconnection":
            return f"Global climate teleconnection ({feature_name} = {val:.2f}) {direction_word} {impact_word} by {abs(shap_val):.3f} log-odds."
        elif cat == "moisture_antecedent":
            return f"Prior moisture condition ({feature_name} = {val:.1f}) {direction_word} {impact_word} by {abs(shap_val):.3f}."
        elif cat == "thermodynamics":
            return f"Thermal state ({feature_name} = {val:.1f}°C) {direction_word} atmospheric instability impact by {abs(shap_val):.3f}."
        elif cat == "synoptic_pressure":
            return f"Surface pressure anomaly ({feature_name} = {val:.1f} hPa) {direction_word} convective likelihood by {abs(shap_val):.3f}."
        else:
            return f"Feature '{feature_name}' ({val:.2f}) contributes {shap_val:+.3f} to model output."

    @classmethod
    def explain_sample(
        cls,
        model: BaseTreeModel,
        X_sample: pd.DataFrame,
        sample_index: int = 0,
        top_k: int = 5
    ) -> ShapExplanationReport:
        if model.estimator is None:
            raise ValueError("Model must be fitted before computing SHAP explanations.")

        # Ensure correct column ordering
        X_aligned = X_sample[model.feature_names]

        explainer = shap.TreeExplainer(model.estimator)
        shap_vals = explainer.shap_values(X_aligned)

        # Handle various SHAP return structures
        if isinstance(shap_vals, list):
            shap_vals = shap_vals[1] if len(shap_vals) > 1 else shap_vals[0]
        if hasattr(shap_vals, "ndim") and shap_vals.ndim == 3:
            shap_vals = shap_vals[:, :, 1]

        base_val = explainer.expected_value
        if isinstance(base_val, (list, np.ndarray)):
            base_val = float(base_val[1] if len(base_val) > 1 else base_val[0])
        else:
            base_val = float(base_val)

        sample_row = X_aligned.iloc[sample_index]
        sample_shap = shap_vals[sample_index]
        is_classif = (model.config.task_type == "classification")

        pred_val = float(model.predict_proba(X_aligned)[sample_index][1]) if is_classif else float(model.predict(X_aligned)[sample_index])

        contributions: List[ShapFeatureContribution] = []
        for feat, feat_val, s_val in zip(model.feature_names, sample_row, sample_shap):
            f_val = float(feat_val)
            s_val = float(s_val)

            if is_classif:
                direction = "increases_risk" if s_val > 0.001 else ("decreases_risk" if s_val < -0.001 else "neutral")
            else:
                direction = "increases_rainfall" if s_val > 0.001 else ("decreases_rainfall" if s_val < -0.001 else "neutral")

            cat = cls.get_category(feat)
            exp_text = cls.generate_human_explanation(feat, f_val, s_val, is_classif)

            contributions.append(ShapFeatureContribution(
                feature_name=feat,
                feature_value=round(f_val, 4),
                shap_value=round(s_val, 4),
                direction=direction,
                meteorological_category=cat,
                human_explanation=exp_text
            ))

        # Sort by absolute SHAP impact
        sorted_contribs = sorted(contributions, key=lambda c: abs(c.shap_value), reverse=True)
        top_contribs = sorted_contribs[:top_k]

        top_names = [f"{c.feature_name} ({c.shap_value:+.2f})" for c in top_contribs[:3]]
        summary = (
            f"Prediction of {pred_val:.2f} (base expected: {base_val:.2f}) is primarily driven by: "
            f"{', '.join(top_names)}."
        )

        return ShapExplanationReport(
            model_id=model.model_id,
            target_name=model.target_name,
            sample_index=sample_index,
            base_value=round(base_val, 4),
            prediction_value=round(pred_val, 4),
            top_contributions=top_contribs,
            scientific_summary=summary,
            all_contributions=sorted_contribs
        )

    @classmethod
    def explain_global(
        cls,
        model: BaseTreeModel,
        X: pd.DataFrame
    ) -> ModelGlobalExplainabilityReport:
        if model.estimator is None:
            raise ValueError("Model must be fitted before computing SHAP explanations.")

        X_aligned = X[model.feature_names]
        explainer = shap.TreeExplainer(model.estimator)
        shap_vals = explainer.shap_values(X_aligned)

        if isinstance(shap_vals, list):
            shap_vals = shap_vals[1] if len(shap_vals) > 1 else shap_vals[0]
        if hasattr(shap_vals, "ndim") and shap_vals.ndim == 3:
            shap_vals = shap_vals[:, :, 1]

        mean_abs = np.mean(np.abs(shap_vals), axis=0)
        tot_impact = float(np.sum(mean_abs)) if float(np.sum(mean_abs)) > 0 else 1.0

        global_list: List[GlobalFeatureImportance] = []
        teleconnection_impact = 0.0

        for feat, impact in zip(model.feature_names, mean_abs):
            pct = round((float(impact) / tot_impact) * 100, 2)
            cat = cls.get_category(feat)
            if cat == "teleconnection":
                teleconnection_impact += pct

            global_list.append(GlobalFeatureImportance(
                feature_name=feat,
                mean_abs_shap=round(float(impact), 5),
                relative_importance_pct=pct,
                meteorological_category=cat
            ))

        global_list = sorted(global_list, key=lambda g: g.mean_abs_shap, reverse=True)

        top_driver = global_list[0].feature_name if global_list else "None"
        sec_driver = global_list[1].feature_name if len(global_list) > 1 else "None"

        return ModelGlobalExplainabilityReport(
            model_id=model.model_id,
            target_name=model.target_name,
            sample_count_evaluated=len(X),
            global_importances=global_list,
            top_driver=top_driver,
            secondary_driver=sec_driver,
            teleconnection_importance_pct=round(teleconnection_impact, 2)
        )
