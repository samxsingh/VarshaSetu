# VarshaSetu — Observability, Health & Telemetry Architecture (Phase 6C & 6D)

## 1. Overview

The VarshaSetu observability layer provides unified, machine-readable health metrics, readiness probes, version metadata, and end-to-end distributed request tracing across both the Backend Gateway and the Python ML Microservice.

A foundational architectural requirement in VarshaSetu is the **strict separation of Service Technical Health from Scientific Forecast Validity**.

---

## 2. Service Health vs. Scientific Forecast Validity

```
+-------------------------------------------------------------------------------+
|                        VARSHASETU PLATFORM STATUS                             |
+-------------------------------------------------------------------------------+
|  INFRASTRUCTURE STATUS: HEALTHY                                              |
|  - PostgreSQL/PostGIS: CONNECTED (2.1ms latency)                              |
|  - ML Service: REACHABLE (14.2ms latency)                                     |
|  - Backend HTTP Gateway: LISTENING (:5001)                                    |
|                                                                               |
|  SCIENTIFIC FORECAST STATUS: DIAGNOSTIC_ONLY                                  |
|  - Empirical Ground Anchor: UP_LKO_BKT (Bakshi Ka Talab, Lucknow)             |
|  - Observational Season: Kharif 2024 (122 daily records)                      |
|  - Multi-Year Operational Gate: BLOCKED_SINGLE_SEASON                         |
|  - Crop Yield / Biomass Prediction: PROHIBITED                                |
|  - Financial Loss Estimation: PROHIBITED                                      |
+-------------------------------------------------------------------------------+
```

> [!IMPORTANT]
> A technically healthy service (`status: "ok"`, HTTP 200) **never** implies scientifically operational forecasting. All meteorological forecasts and agronomic advisories operate strictly in `DIAGNOSTIC_ONLY` mode, anchored to the Kharif 2024 observational archive.

---

## 3. Observability Endpoints

Both the Backend Gateway (`:5001`) and the ML Microservice (`:8000`) expose standardized root and API observability routes:

### 3.1 `GET /health` (Comprehensive Health Envelope)
Returns unified subsystem health and scientific disclosures.

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "varshasetu-backend",
    "version": "1.0.0",
    "environment": "development",
    "timestamp": "2026-09-26T02:00:00.000Z",
    "uptimeSeconds": 1845,
    "health_classification": "HEALTHY",
    "subsystems": {
      "database": {
        "status": "HEALTHY",
        "details": { "postgres": true, "postgis": true, "connectionPoolSize": 20 }
      },
      "ml_service": {
        "status": "HEALTHY",
        "details": { "service": "varshasetu-ml-service", "endpoint": "http://localhost:8000" }
      },
      "forecast_engine": {
        "status": "DIAGNOSTIC_ONLY",
        "details": {
          "ground_anchor": "UP_LKO_BKT",
          "season": "Kharif 2024",
          "observational_records": 122,
          "spatial_resolution": "BLOCK"
        }
      },
      "calibration_engine": {
        "status": "HEALTHY",
        "details": { "platt_scaling": true, "isotonic_regression": true, "gate": "ENFORCED" }
      },
      "hindcast_validation": {
        "status": "HEALTHY",
        "details": { "multiyear_operational_gate": "BLOCKED_SINGLE_SEASON", "validated_season": "Kharif 2024" }
      },
      "agronomic_rules_engine": {
        "status": "HEALTHY",
        "details": { "rules_count": 9, "yield_biomass_projections": "DISABLED", "non_causal_disclosures": "ENFORCED" }
      },
      "scenario_engine": {
        "status": "HEALTHY",
        "details": { "mode": "SCENARIO_INDICATOR_ONLY", "yield_projections": "PROHIBITED" }
      },
      "localization_engine": {
        "status": "HEALTHY",
        "details": { "supported_languages": ["EN", "HI"], "method": "CONTROLLED_TEMPLATE", "safety_checks": 14 }
      },
      "voice_subsystem": {
        "status": "DEMO_ONLY",
        "details": { "provider": "MOCK_LOCAL_VOICE_ENGINE", "bhashini_gov_in": "NOT_CONFIGURED" }
      },
      "alert_lifecycle": {
        "status": "HEALTHY",
        "details": { "state_machine": "ACTIVE", "deduplication": "ACTIVE" }
      },
      "notification_delivery": {
        "status": "NOT_CONFIGURED",
        "details": { "sms": "NOT_CONFIGURED", "whatsapp": "NOT_CONFIGURED", "carrier_dispatch": "DISABLED" }
      }
    },
    "scientific_integrity": {
      "distinction_note": "Service technical uptime does NOT imply scientific operational validity. All forecasts operate strictly in DIAGNOSTIC_ONLY mode anchored to Kharif 2024 empirical archive.",
      "ground_anchor": "UP_LKO_BKT",
      "observational_season": "Kharif 2024",
      "records_count": 122,
      "single_season_constraint": true,
      "operational_forecast_active": false
    }
  }
}
```

### 3.2 `GET /ready` (Kubernetes / Container Readiness Probe)
Verifies database connectivity and storage directory readiness. Returns `200 OK` when ready, or `503 SERVICE_UNAVAILABLE` if a critical dependency has disconnected:
```json
{
  "success": true,
  "data": {
    "ready": true,
    "timestamp": "2026-09-26T02:00:00.000Z",
    "dependencies": {
      "database": "UP",
      "postgis": "UP"
    }
  }
}
```

### 3.3 `GET /version` (Semantic Version & Commit Metadata)
```json
{
  "success": true,
  "data": {
    "service": "varshasetu-backend",
    "version": "1.0.0",
    "phase": "PHASE_6_PRODUCTION_READY",
    "environment": "development",
    "git_commit": "d72d8de",
    "ground_anchor": "UP_LKO_BKT",
    "observational_season": "Kharif 2024",
    "status": "PRODUCTION_HARDENED"
  }
}
```

### 3.4 `GET /metrics` (Safe Resource & Telemetry Counters)
Returns memory usage (RSS, heap), database pool connection states (idle, active, waiting), uptime, and scientific mode without exposing sensitive keys or tokens.

---

## 4. Distributed Tracing & Correlation IDs

Every incoming HTTP request is assigned a unique UUID request identifier (`X-Request-Id`):
1. **Frontend**: Passes existing correlation header or receives new ID.
2. **Backend**: Captures or generates `X-Request-Id`, logs method, path, response code, and latency in milliseconds.
3. **ML Microservice**: `SecurityAndTracingMiddleware` captures `X-Request-Id` and attaches it to response headers and telemetry logs.

### Log Formatting Standard
```text
[2026-09-26T02:00:01.341Z] [536cb9d6] GET /api/v1/operations/status 200 (12ms)
```

Sensitive values (`password`, `jwt_secret`, `authorization`, `api_key`) are strictly redacted from log streams.
