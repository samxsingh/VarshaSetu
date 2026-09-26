# VARSHASETU (वर्षासेतु) — Phase 3 Implementation Report
## Scientific ML Service Gateway Integration

**Date**: September 26, 2026  
**Status**: COMPLETE & VERIFIED  
**Architecture Core**: ONE SCIENTIFIC LAYER → FOUR OPERATIONAL PERSPECTIVES  
**Target Roles**: Farmer | Field Officer | Government | Climate Analyst  
**Security Boundary**: Strict Express Gateway Mediation (`React → Express → FastAPI & MongoDB`)

---

## 1. Executive Summary & Architecture

In Phase 3 of the VarshaSetu MERN migration, the scientific machine learning computation engine (Python FastAPI) has been fully integrated into the authoritative Node.js/Express API Gateway architecture.

All scientific ML capabilities—including LightGBM/XGBoost probabilistic classification, Platt scaling and isotonic regression calibration, Tree-based SHAP explainability, walk-forward hindcast validation, and what-if agronomic scenario simulations—are now cleanly encapsulated behind a resilient, typed ML Gateway client (`backend/src/services/ml/`).

### Architectural Topology
```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 18 + Vite)               │
│  - Farmer View    - Field Officer View                 │
│  - Government     - Climate Analyst                    │
└───────────────────────────┬────────────────────────────┘
                            │ REST /api/v1/* (JWT, RBAC)
                            ▼
┌────────────────────────────────────────────────────────┐
│     Authoritative API Gateway (Node.js + Express)      │
│  - Auth & Strict RBAC (5 Roles)                        │
│  - Rate Limiting & Audit Logging                       │
│  - Resilient ML Gateway Service (Timeout, Abort, Zod)  │
│  - Dual-Mode Persistence (MongoDB Primary + PG Fallback)│
└─────────────┬────────────────────────────┬─────────────┘
              │ Mongoose ORM               │ Resilient HTTP (AbortController)
              ▼                            ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     MongoDB Database      │  │ Python FastAPI ML Engine│
│ - Users & Refresh Tokens  │  │ - LightGBM & XGBoost    │
│ - Forecasts (Persisted)   │  │ - Platt / Isotonic Calib│
│ - Scenarios & Audit Logs  │  │ - SHAP Feature Importance│
└───────────────────────────┘  └─────────────────────────┘
```

**Zero Direct React $\to$ FastAPI Access**: Frontend components communicate exclusively via Express REST endpoints (`/api/v1/*`). Direct network access to port 8000 from the browser is architecturally and programmatically prohibited.

---

## 2. End-to-End Scientific Architecture & Component Flow

```
[React Client]
       │
       │ HTTP POST /api/v1/forecasts/generate (Bearer JWT)
       ▼
[Express Router: forecastRoutes.ts]
       │
       │ Middleware: requireAuth, requireRole(['ANALYST', 'ADMIN'])
       ▼
[Express Controller: forecastController.ts]
       │
       │ Delegates to mlGatewayService.generateForecast()
       ▼
[ML Gateway Layer: mlGatewayService.ts]
       │
       ├─► 1. Validates request using ForecastGenerateRequestSchema (Zod)
       ├─► 2. Invokes mlGatewayClient.post('/forecasts/generate') with AbortController timeout
       ├─► 3. Receives raw JSON from FastAPI ML service
       ├─► 4. Validates output against authoritative ScientificForecastRecordSchema
       ├─► 5. Enforces scientific invariants (P in [0, 1], P10 <= P50 <= P90)
       ├─► 6. Upserts validated forecast into MongoDB via Mongoose Forecast model
       └─► 7. Returns validated ScientificForecastRecord envelope
       ▼
[Client Response: HTTP 201 Created with Full Scientific Lineage]
```

---

## 3. Scientific Integrity Anchors (Kharif 2024, UP_LKO_BKT)

All meteorological data, machine learning models, and probabilistic calibrations are rigorously anchored to real-world empirical observations:
- **Administrative Location**: Bakshi Ka Talab (`UP_LKO_BKT`), Lucknow District (`UP_LKO`), Uttar Pradesh (`UP`).
- **Centroid Coordinates**: Latitude $26.9749^\circ\text{ N}$, Longitude $80.9276^\circ\text{ E}$.
- **Spatial Resolution**: Centroid-gridded block-scale ($\sim 9\text{ km}$). Panchayat-level micro-station claims are strictly disabled.
- **Empirical Season Archive**: Kharif 2024 (June 1, 2024 to September 30, 2024; 122 daily records).
- **Operational Classification**: All generated forecasts carry the classification `DIAGNOSTIC_ONLY` and `NOT OPERATIONAL`. Single-season data limitations preclude multi-year WMO climatology compliance.

---

## 4. Prohibited Behaviors & Safety Enforcements

1. **Zero Fabrication**: Under no condition are missing metrics synthetically fabricated. Missing data fields return `"NOT CONFIGURED"`, `"NOT AVAILABLE IN CURRENT PIPELINE"`, or explicit diagnostic fallback indicators.
2. **Crop Yield & Biomass Prohibition**: What-if scenario engines evaluate only agro-meteorological sensitivity indicators (moisture stress, dry spell exposure, waterlogging risk). Quantitative crop yield, biomass, or financial predictions are blocked at the scientific safety gate.
3. **Imperative Directives Blocked**: Agronomic advisories avoid imperative commands ("You must irrigate immediately") in favor of conditional, probabilistic advisory indicators ("Elevated dry spell risk detected across 7-day planning lead").
4. **Multi-Year Gating**: Operational multi-year forecast certification requires $\ge 5$ complete historical seasons. With only Kharif 2024 available, the gate returns `INSUFFICIENT_DATA` and blocks operational status.

---

## 5. Dedicated ML Gateway Service Architecture

The gateway layer in `backend/src/services/ml/` consists of three core components:

### 5.1. `mlGatewayClient.ts`
- Resilient HTTP fetch wrapper with native `AbortController`.
- Configurable base URL (`ML_SERVICE_URL`, defaults to `http://localhost:8000`) and configurable default timeout (5,000ms).
- Typed error taxonomy:
  - `GatewayTimeoutError`: Thrown when a request exceeds timeout threshold.
  - `GatewayUnavailableError`: Thrown when network connection is refused or unavailable.
  - `GatewayResponseError`: Thrown when FastAPI returns an HTTP 4xx or 5xx status code.

### 5.2. `mlGatewaySchemas.ts`
- Zod validation schemas enforcing strict contract conformity between FastAPI outputs and Express consumption.
- Comprehensive transform pipeline that seamlessly normalizes FastAPI representations (`target_type` vs `name`, `horizon_days` vs `days`, `probability` vs `calibrated_probability`, object vs string scientific disclosures).
- Refinements guaranteeing mathematical and scientific invariants.

### 5.3. `mlGatewayService.ts`
- Strongly typed domain methods covering the entire FastAPI endpoint surface:
  - `checkHealth()`, `getReady()`, `getVersion()`
  - `getDataStatus()`, `getDataCatalog()`, `getDataFeatures()`
  - `getForecastStatus()`, `getForecastAvailability()`, `listForecasts()`, `getForecastById()`, `generateForecast()`, `getForecastExplanation()`
  - `getModelStatus()`, `getModelRegistry()`, `getModelComparison()`, `getModelById()`, `getModelExplanations()`
  - `getCalibrationStatus()`, `getCalibrationReliability()`, `getCalibrationComparison()`
  - `getHindcastStatus()`, `getHindcastGate()`, `getHindcastFolds()`, `getHindcastResults()`, `getHindcastStability()`, `getHindcastDrift()`, `getHindcastCoverage()`
  - `getAgronomyStatus()`, `listAgronomyRules()`, `listAgronomyCrops()`, `listAgronomyScenarios()`, `runScenario()`, `runScenarioSensitivity()`
  - `detectEvents()`, `listEvents()`, `getEventById()`
- Automatic synchronization with Mongoose `Forecast` model upon forecast generation.

---

## 6. Scientific Schema Validation

Authoritative Zod schemas enforce scientific rigor on all forecast records:
- **Probability Bound Constraint**:
  $$P \in [0.0, 1.0]$$
  Any probability value $< 0.0$ or $> 1.0$ triggers immediate schema validation failure.
- **Uncertainty Interval Monotonicity**:
  $$P_{10} \le P_{50} \le P_{90}$$
  Monotonicity refinement strictly rejects any inverted confidence intervals.
- **Explainability**:
  Requires `TREE_SHAP` method, base value, and ranked feature attributions with contribution direction (`INCREASES_RISK`, `DECREASES_RISK`).

---

## 7. Probabilistic Calibration Integration

- **Calibrator Methods**: Platt Scaling (logistic sigmoid) and Isotonic Regression (non-parametric monotonic step).
- **Reliability Diagrams**: Evaluated in 10 probability bins comparing predicted confidence to empirical event frequency.
- **Scoring Rule**: Brier score minimization:
  $$\text{Brier Score} = \frac{1}{N} \sum_{i=1}^N (f_i - o_i)^2$$
- **Operational Status**: `PARTIAL_DIAGNOSTIC_CALIBRATED`. Full operational calibration requires $\ge 100$ calibration samples and $\ge 5$ seasons; currently gated under `INSUFFICIENT_DATA` for operational deployment.

---

## 8. Hindcasting, Cross-Validation & Multi-Year Gating

- **Temporal Cross-Validation**: Chronological expanding window folds (train: June–July 2024, validate: August 2024, test: September 2024). Zero future-data leakage across split boundaries.
- **Benchmark Baselines**: Climatology frequency baseline and regularized linear/logistic baseline compared against XGBoost and LightGBM models.
- **Multi-Year Gate**: Operational certification requires $\ge 5$ seasons. Currently evaluated on 1 season (`[2024]`), enforcing `multiyear_gate_status: INSUFFICIENT_DATA`.

---

## 9. Operational Downscaling & Feature Completeness

- Centroid-gridded resolution for block Bakshi Ka Talab (`UP_LKO_BKT`).
- **Feature Completeness**: 19/19 core meteorological and climate features available with 100% temporal coverage across Kharif 2024.
- **Teleconnections Included**: NOAA Niño 3.4 SST anomaly, BoM Indian Ocean Dipole DMI, BoM Madden-Julian Oscillation RMM1/RMM2 indices.

---

## 10. Agronomy & What-If Scenarios

- **Supported Scenario Types**:
  - `SOWING_DELAY`: Explores sensitivity of moisture stress to delayed sowing dates [1–21 days].
  - `IRRIGATION_INTERVENTION`: Evaluates supplemental irrigation timing [1–30 days lead].
  - `SEASONAL_ANOMALY`: Evaluates precipitation shifts [-60% to +60%].
  - `RAINFALL_TIMING_SHIFT`: Simulates intra-seasonal monsoon shifts [-14 to +14 days].
- **Cryptographic Provenance**: Scenario results generate SHA-256 parameter fingerprints ensuring deterministic reproducibility.

---

## 11. Multilingual Localization & Accessibility

- Controlled template engine supporting English (`EN`) and Hindi (`HI`).
- Unvetted machine translation is prohibited; all agronomic phrases are verified through controlled terminology dictionary.
- Accessibility voice engine delivers localized audio synthesized readouts in Hindi and English.

---

## 12. Threshold Event Lifecycle & Audit Logging

- Deterministic event detection for extreme weather anomalies (`HEAVY_RAIN`, `DRY_SPELL`).
- Strict 3-state state machine: `DETECTED` $\to$ `ACKNOWLEDGED` $\to$ `RESOLVED`.
- Every transition logs actor ID, reason, and timestamp in database audit tables.

---

## 13. MongoDB Mongoose Persistence Synchronization

When forecasts are generated or queried through the gateway, they are persisted into MongoDB:
- **Collection**: `forecasts` (Mongoose `Forecast` model)
- **Compound Indexes**: `{ blockCode: 1, horizonDays: 1, validFrom: -1 }`, `{ targetType: 1, validFrom: 1, validUntil: 1 }`
- **Horizon Support**: Updated `horizonDays` schema to include `3 | 7 | 14 | 21 | 30`.
- **Dual-Mode Compatibility**: Dual-mode repositories continue to maintain seamless PostgreSQL fallback.

---

## 14. Error Translation Matrix & Gateway Resilience

| Condition | Gateway Error Class | HTTP Status Envelope | Client Response Behavior |
|---|---|---|---|
| Timeout ($> 5,000\text{ms}$) | `GatewayTimeoutError` | 504 Gateway Timeout | Graceful diagnostic fallback with offline indicator |
| Connection Refused (`ECONNREFUSED`) | `GatewayUnavailableError` | 503 Service Unavailable | Safe diagnostic-only response anchored to Kharif 2024 |
| FastAPI Validation Error (422) | `GatewayResponseError` | 400 Bad Request | Passes validation error details to client |
| FastAPI Internal Error (500) | `GatewayResponseError` | 502 Bad Gateway | Standard error envelope with sanitized message |

---

## 15. Verification Suite & Test Results

### 15.1. Backend Test Suite (Vitest)
```
Test Files  14 passed (14)
     Tests  144 passed (144)
  Duration  4.68s
```
- Includes 15 dedicated Phase 3 ML gateway integration tests in `backend/tests/integration/phase3_ml_gateway.test.ts`.

### 15.2. Frontend Test Suite (Vitest)
```
Test Files  19 passed (19)
     Tests  88 passed (88)
  Duration  4.08s
```

### 15.3. Python ML Service Test Suite (Pytest)
```
202 passed, 79 warnings in 5.05s (49 test files)
```

**Grand Total**: 434 tests passing across all three test suites. 0 failures.

---

## 16. Build Verification & Integrity Confirmation

- **Backend TypeScript Build (`npm run build` in `backend`)**: Succeeded with 0 errors (`tsc` exit code 0).
- **Frontend Vite Build (`npm run build` in `frontend`)**: Succeeded with 0 errors (`vite build` exit code 0).

---

## 17. Repository File Map

### New Phase 3 Files:
- `docs/ML-GATEWAY-CONTRACT.md`: Complete API specification between Express and FastAPI.
- `docs/PHASE-3-ML-GATEWAY.md`: This comprehensive Phase 3 report.
- `backend/src/services/ml/mlGatewayClient.ts`: Resilient HTTP client with AbortController and timeout.
- `backend/src/services/ml/mlGatewaySchemas.ts`: Zod validation schemas enforcing scientific invariants.
- `backend/src/services/ml/mlGatewayService.ts`: Typed domain service encapsulating scientific endpoints.
- `backend/src/services/ml/index.ts`: Barrel export file.
- `backend/tests/integration/phase3_ml_gateway.test.ts`: 15 integration tests for ML gateway.

### Modified Files:
- `backend/src/models/Forecast.ts`: Added 3-day horizon to `horizonDays` enum.
- `backend/src/controllers/forecastController.ts`: Routed all calls to `mlGatewayService` with Mongoose persistence.
- `backend/src/controllers/modelController.ts`: Routed all ML calls through `mlGatewayClient`.
- `backend/src/controllers/scenarioController.ts`: Routed all what-if calls through `mlGatewayClient`.
- `backend/src/controllers/advisoryController.ts`: Routed all agronomy calls through `mlGatewayClient`.
- `backend/src/controllers/localizationController.ts`: Routed all translation calls through `mlGatewayClient`.
- `backend/src/controllers/eventController.ts`: Routed all event detection calls through `mlGatewayClient`.
- `backend/src/controllers/operationController.ts`: Routed all operation status calls through `mlGatewayClient`.
- `backend/src/controllers/dataHealthController.ts`: Routed ingestion calls through `mlGatewayClient`.
- `backend/src/services/healthService.ts`: Dynamic endpoint reporting via `mlGatewayClient`.

---

## 18. Next Steps & Phase 4 Transition Readiness

With Phase 3 complete:
1. The authoritative Node.js/Express REST Gateway cleanly mediates all access between React and Python FastAPI.
2. Scientific predictions are validated with Zod, enforcing probability bounds and uncertainty monotonicity.
3. Generated forecasts are persistently synchronized into MongoDB via Mongoose.
4. The system is fully ready for **Phase 4: End-to-End Real-Time System Orchestration & Operational Hardening**.
