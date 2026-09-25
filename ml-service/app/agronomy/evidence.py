"""
VarshaSetu - Agronomic Evidence Construction (Phase 5A)
Extracts and structures traceable scientific evidence from ScientificForecastRecords
into typed AdvisoryEvidence objects.
"""

from typing import Optional, Dict, Any, List
from app.agronomy.schemas import AdvisoryEvidence


def build_evidence_from_forecast(forecast: Any) -> AdvisoryEvidence:
    """
    Extracts traceable evidence from a ScientificForecastRecord (or dict equivalent).
    Ensures zero fabricated uncertainty or probability metrics.
    """
    if isinstance(forecast, dict):
        fc_id = forecast.get("forecast_id", "fc_unknown")
        target_dict = forecast.get("target", {})
        target = target_dict.get("target_type") if isinstance(target_dict, dict) else str(target_dict)
        
        horizon_dict = forecast.get("horizon", {})
        horizon_days = horizon_dict.get("horizon_days", 7) if isinstance(horizon_dict, dict) else 7

        model_dict = forecast.get("model", {})
        model_source = model_dict.get("model_id", "BASELINE") if isinstance(model_dict, dict) else "BASELINE"

        pred_dict = forecast.get("prediction", {})
        prob = pred_dict.get("probability") if isinstance(pred_dict, dict) else None
        point_est = pred_dict.get("predicted_value") if isinstance(pred_dict, dict) else None

        unc_dict = forecast.get("uncertainty", {})
        uncertainty = None
        if isinstance(unc_dict, dict) and unc_dict.get("status") == "CALCULATED":
            uncertainty = {
                "lower": unc_dict.get("lower_bound"),
                "median": unc_dict.get("median"),
                "upper": unc_dict.get("upper_bound"),
            }

        data_dict = forecast.get("data", {})
        freshness = data_dict.get("freshness_status", "HISTORICAL_ONLY") if isinstance(data_dict, dict) else "HISTORICAL_ONLY"

        val_dict = forecast.get("validation", {})
        val_status = val_dict.get("validation_status", "INSUFFICIENT_DATA") if isinstance(val_dict, dict) else "INSUFFICIENT_DATA"

        loc_dict = forecast.get("location", {})
        res = loc_dict.get("spatial_resolution", "BLOCK") if isinstance(loc_dict, dict) else "BLOCK"

        expl_dict = forecast.get("explainability", {})
        features_summary = None
        if isinstance(expl_dict, dict) and expl_dict.get("top_features"):
            features_summary = expl_dict.get("top_features")

    else:
        # Pydantic ScientificForecastRecord object
        fc_id = getattr(forecast, "forecast_id", "fc_unknown")
        target = getattr(forecast.target, "target_type", "UNKNOWN")
        horizon_days = getattr(forecast.horizon, "horizon_days", 7)
        model_source = getattr(forecast.model, "model_id", "BASELINE")
        prob = getattr(forecast.prediction, "probability", None)
        point_est = getattr(forecast.prediction, "predicted_value", None)
        
        uncertainty = None
        unc = getattr(forecast, "uncertainty", None)
        if unc and getattr(unc, "status", None) == "CALCULATED":
            uncertainty = {
                "lower": getattr(unc, "lower_bound", None),
                "median": getattr(unc, "median", None),
                "upper": getattr(unc, "upper_bound", None),
            }

        data_obj = getattr(forecast, "data", None)
        freshness = getattr(data_obj, "freshness_status", "HISTORICAL_ONLY") if data_obj else "HISTORICAL_ONLY"

        val_obj = getattr(forecast, "validation", None)
        val_status = getattr(val_obj, "validation_status", "INSUFFICIENT_DATA") if val_obj else "INSUFFICIENT_DATA"

        loc_obj = getattr(forecast, "location", None)
        res = getattr(loc_obj, "spatial_resolution", "BLOCK") if loc_obj else "BLOCK"

        expl_obj = getattr(forecast, "explainability", None)
        features_summary = getattr(expl_obj, "top_features", None) if expl_obj else None

    return AdvisoryEvidence(
        source=str(model_source),
        forecast_id=str(fc_id),
        target=str(target),
        horizon_days=int(horizon_days),
        probability=float(prob) if prob is not None else None,
        point_estimate=float(point_est) if point_est is not None else None,
        uncertainty=uncertainty,
        data_freshness=str(freshness),
        validation_status=str(val_status),
        spatial_resolution=str(res),
        features_summary=features_summary,
    )
