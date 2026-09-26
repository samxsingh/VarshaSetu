# VARSHASETU (वर्षासेतु) — Scientific ML Service Gateway Contract
**Phase 3 MERN Architecture Integration Specification**

---

## 1. Architectural Scope & Flow

VarshaSetu adheres strictly to the core product architectural principle:
```
ONE SCIENTIFIC LAYER → FOUR OPERATIONAL PERSPECTIVES
(Farmer | Field Officer | Government | Climate Analyst)
```

The system topology strictly forbids direct communication between the client layer and the scientific ML engine:

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
│  - Authentication & RBAC Enforcement                   │
│  - Audit Logging & Rate Limiting                       │
│  - Mongoose Persistence (Dual-Mode Mongo / Postgres)   │
│  - Resilient ML Gateway Service (Timeout, Abort)       │
└─────────────┬────────────────────────────┬─────────────┘
              │ Mongoose ORM               │ Resilient HTTP (AbortController)
              ▼                            ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     MongoDB Database      │  │ Python FastAPI ML Service│
│ - Users, Roles, Audits    │  │ - LightGBM & XGBoost    │
│ - Persisted Forecasts     │  │ - Platt & Isotonic Calib│
│ - Scenarios & Alerts      │  │ - Tree SHAP & Hindcast  │
└───────────────────────────┘  └─────────────────────────┘
```

**Architectural Rule**: Under no circumstances does the React frontend communicate directly with FastAPI on port 8000. Express acts as the single authoritative API, security, provenance, and data-enrichment layer.

---

## 2. Scientific Integrity & Ground Anchors

1. **Empirical Ground Anchor**:
   All observational training and validation data are strictly anchored to the empirical Kharif 2024 archive:
   - State: Uttar Pradesh (`UP`)
   - District: Lucknow (`UP_LKO`)
   - Block: Bakshi Ka Talab (`UP_LKO_BKT`)
   - Temporal Range: June 1, 2024 to September 30, 2024 (122 daily observational records)
2. **Operational Status (`DIAGNOSTIC_ONLY`)**:
   Because the dataset represents a single monsoon season, multi-year WMO climatology requirements are not satisfied. All forecast products must carry the classification `DIAGNOSTIC_ONLY` and `NOT OPERATIONAL`.
3. **Zero Fabrication**:
   - Probabilities must satisfy $P \in [0, 1]$.
   - Uncertainty percentiles must follow strict monotonicity: $P10 \le P50 \le P90$.
   - Yield or biomass quantitative projections are strictly prohibited and blocked at the scientific safety gate.
   - Any missing metric or unconfigured subsystem must return `"NOT CONFIGURED"` or `"NOT AVAILABLE IN CURRENT PIPELINE"`. Synthetic numerical filling is disallowed.
4. **Planning Horizon**:
   Default operational planning horizon is 7 days (`7d`). Supported horizons: `3d`, `7d`, `14d`.

---

## 3. FastAPI Endpoint Registry

The Node.js ML Gateway interfaces with the following microservice endpoints:

| Domain | Method | FastAPI Path | Parameters / Body | Purpose |
|---|---|---|---|---|
| **Health** | `GET` | `/health` | None | Overall ML microservice liveness and subsystem status |
| | `GET` | `/ready` | None | Readiness probe confirming model and dataset availability |
| | `GET` | `/version` | None | Service version and scientific commit metadata |
| | `GET` | `/metrics` | None | Prometheus telemetry metrics |
| **Data** | `GET` | `/data/status` | None | Ingestion and feature status summary |
| | `GET` | `/data/catalog` | None | Metadata catalog of meteorological datasets |
| | `GET` | `/data/features` | None | Listing of engineered features and completeness |
| **Forecasts** | `GET` | `/forecasts/status` | None | Operational status and active dataset |
| | `GET` | `/forecasts/availability` | `block_id` (query) | Feature coverage and data freshness |
| | `GET` | `/forecasts` | `target`, `horizon`, `block_id`, `status`, `limit` | Query generated scientific forecast records |
| | `GET` | `/forecasts/{id}` | `id` (path) | Retrieve individual scientific forecast record |
| | `POST` | `/forecasts/generate` | `ForecastGenerateRequest` JSON | Generate fresh calibrated forecast record with SHAP |
| | `GET` | `/forecasts/{id}/explanation` | `id` (path) | Top SHAP feature contributions and base value |
| | `GET` | `/forecasts/{id}/lifecycle` | `id` (path) | State transitions (DRAFT -> PUBLISHED -> EXPIRED) |
| | `POST` | `/forecasts/{id}/lifecycle/transition` | `LifecycleTransitionRequest` JSON | Authoritative lifecycle stage advancement |
| **Models** | `GET` | `/models/status` | None | Model registry status and supported architectures |
| | `GET` | `/models/registry` | None | List trained models, hyperparameters, and metrics |
| | `GET` | `/models/comparison` | None | Benchmark comparison against baseline climatology |
| | `GET` | `/models/{id}` | `id` (path) | Detailed model architecture and metadata |
| | `GET` | `/models/{id}/explanations` | `id` (path) | Model-level global feature importance |
| **Calibration** | `GET` | `/calibration/status` | None | Calibration gate status and methodology |
| | `GET` | `/calibration/models/{id}/reliability` | `id` (path) | Reliability diagram bins (confidence vs empirical accuracy) |
| | `GET` | `/calibration/comparison` | None | Brier score improvement comparison (Raw vs Platt vs Isotonic) |
| **Hindcasting** | `GET` | `/hindcasting/status` | None | Temporal split configuration and operational gate status |
| | `GET` | `/hindcasting/gate` | None | Gate status verifying multi-year validation |
| | `GET` | `/hindcasting/folds` | None | Temporal fold boundaries for cross-validation |
| | `GET` | `/hindcasting/results` | None | Historical fold evaluation metrics |
| | `GET` | `/hindcasting/stability` | None | Temporal stability across successive forecast windows |
| | `GET` | `/hindcasting/drift` | None | Feature and label drift indices |
| **Agronomy & Scenarios** | `GET` | `/agronomy/status` | None | Agronomic engine operational status |
| | `GET` | `/agronomy/rules` | None | Deterministic agronomic advisory decision rules |
| | `GET` | `/agronomy/crops` | None | Supported crop calendars and thresholds |
| | `GET` | `/agronomy/scenarios` | None | Catalog of registered what-if scenarios |
| | `POST` | `/agronomy/scenarios/run` | `ScenarioContract` JSON | Run what-if agronomic simulation |
| | `POST` | `/agronomy/scenarios/sensitivity` | `ScenarioContract` JSON | Multi-parameter perturbation sensitivity test |
| | `GET` | `/agronomy/scenarios/{id}/provenance` | `id` (path) | SHA-256 cryptographic provenance artifact |
| **Events** | `POST` | `/events/detect` | `EventDetectRequest` JSON | Deterministic threshold event detection |
| | `GET` | `/events` | `block_id`, `severity`, `status` | Query active weather anomaly events |
| | `POST` | `/events/{id}/acknowledge` | `id` (path) | Acknowledge active event |
| | `POST` | `/events/{id}/resolve` | `id` (path) | Resolve active event |

---

## 4. Authoritative Scientific Schemas

### 4.1. `ScientificForecastRecord` Schema
```typescript
interface ScientificForecastRecord {
  forecast_id: string;
  generated_at: string; // ISO 8601
  valid_from: string;    // YYYY-MM-DD
  valid_until: string;   // YYYY-MM-DD
  location: {
    state_id: string;
    district_id: string;
    block_id: string;
    latitude: number;
    longitude: number;
  };
  target: {
    name: 'heavy_rain' | 'dry_spell' | 'rainfall_amount';
    threshold_mm?: number;
    unit: string;
  };
  horizon: {
    days: number;
    label: string;
  };
  model: {
    model_id: string;
    algorithm: string;
    version: string;
  };
  prediction: {
    raw_probability: number;       // [0, 1]
    calibrated_probability: number;// [0, 1]
    expected_value_mm?: number;
    risk_category: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  };
  calibration: {
    method: 'PLATT_SCALING' | 'ISOTONIC_REGRESSION' | 'NONE';
    brier_score_raw?: number;
    brier_score_calibrated?: number;
    gate_passed: boolean;
  };
  uncertainty: {
    p10: number; // p10 <= p50 <= p90
    p50: number;
    p90: number;
    confidence_interval_pct: number;
  };
  validation: {
    operational_allowed: boolean;
    hindcast_validated: boolean;
    single_season_warning: boolean;
    status: 'DIAGNOSTIC_ONLY' | 'OPERATIONAL' | 'REJECTED';
  };
  explainability: {
    method: 'TREE_SHAP';
    base_value: number;
    top_features: Array<{
      feature_name: string;
      value: number;
      shap_value: number;
      contribution: 'INCREASES_RISK' | 'DECREASES_RISK';
    }>;
  };
  data: {
    dataset_name: string;
    season: string;
    observation_count: number;
    ground_anchor: string;
  };
  scientific_disclosure: string;
}
```

---

## 5. Gateway Resilience and Error Policies

1. **HTTP Client Timeout**: Configured to 5,000ms via `AbortController`.
2. **Error Translation Matrix**:
   - `ECONNREFUSED` / Network Error $\to$ `GatewayUnavailableError` (HTTP 503 Envelope, graceful diagnostic fallback).
   - `AbortError` / Timeout $\to$ `GatewayTimeoutError` (HTTP 504 Envelope).
   - HTTP 4xx $\to$ `GatewayBadRequestError` (Passes FastAPI error detail).
   - HTTP 5xx $\to$ `GatewayInternalError` (HTTP 502 Bad Gateway Envelope).
3. **Database Dual-Write & Persistence Sync**:
   Every generated scientific forecast is validated through Zod schema validation in Node.js and persisted to MongoDB via the Mongoose `Forecast` model for persistent queryability, caching, and audit logging.
