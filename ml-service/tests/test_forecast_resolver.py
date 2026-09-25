"""
Tests for Phase 4E ForecastModelResolver.
Verifies model resolution for targets, horizons, preferences, and baseline fallbacks.
"""

from app.forecast.resolver import ForecastModelResolver


def test_resolve_default_model_heavy_rain():
    # Should resolve XGBoost if artifact exists, or fallback gracefully
    container = ForecastModelResolver.resolve_model(
        target_name="HEAVY_RAIN",
        horizon_days=7,
        block_id="UP_LKO_BKT"
    )

    assert container is not None
    assert container.model_id in ("xgboost", "lightgbm", "baseline_linear")
    assert container.model_version is not None
    assert len(container.dataset_fingerprint) > 0


def test_resolve_explicit_model_preference():
    container = ForecastModelResolver.resolve_model(
        target_name="HEAVY_RAIN",
        horizon_days=7,
        block_id="UP_LKO_BKT",
        preferred_model_id="baseline_linear"
    )

    assert container is not None
    assert container.model_id == "baseline_linear"
    assert "Logistic" in container.model_name or "Linear" in container.model_name


def test_resolve_climatology():
    container = ForecastModelResolver.resolve_model(
        target_name="HEAVY_RAIN",
        horizon_days=7,
        block_id="UP_LKO_BKT",
        preferred_model_id="climatology"
    )

    assert container is not None
    assert container.model_id == "climatology"
    assert "Climatological" in container.model_name


def test_resolve_rainfall_amount_regression():
    container = ForecastModelResolver.resolve_model(
        target_name="RAINFALL_AMOUNT",
        horizon_days=7,
        block_id="UP_LKO_BKT"
    )

    assert container is not None
    assert container.model_id in ("xgboost", "lightgbm", "baseline_linear")


def test_list_available_models():
    models = ForecastModelResolver.list_available_models(
        target_name="HEAVY_RAIN",
        horizon_days=7
    )

    assert len(models) >= 2
    model_ids = [m["model_id"] for m in models]
    assert "baseline_linear" in model_ids
    assert "climatology" in model_ids
