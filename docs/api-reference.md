# VarshaSetu — Universal API Reference Manual (Phase 6F)

All endpoints follow standardized JSON envelopes:
- **Success:** `{ "success": true, "data": <payload>, "metadata"?: <meta> }`
- **Error:** `{ "success": false, "error": { "code": "<ERROR_CODE>", "message": "<description>", "details"?: {} } }`

---

## 1. Health & Unified Observability APIs

| Endpoint | Method | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/health` | GET | Public | Any | Root unified health check with 11 subsystem statuses and scientific integrity note. |
| `/ready` | GET | Public | Any | Readiness probe checking PostgreSQL and filesystem storage. Returns 200 or 503. |
| `/version` | GET | Public | Any | Semantic version, phase metadata (`PHASE_6_PRODUCTION_READY`), ground anchor. |
| `/metrics` | GET | Public | Any | Safe resource utilization metrics (memory RSS, database connection pool). |
| `/api/v1/health` | GET | Public | Any | Aliased backend gateway application health report. |
| `/api/v1/health/database` | GET | Public | Any | PostGIS extension version and database latency check. |

---

## 2. Authentication & Session APIs

| Endpoint | Method | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | POST | Public | Any | Self-registers a `FARMER` account. Rejects elevated roles with `403 FORBIDDEN`. (Rate limited: 30/min). |
| `/api/v1/auth/login` | POST | Public | Any | Authenticates via email/phone and password. Returns JWT token. (Rate limited: 30/min). |
| `/api/v1/auth/me` | GET | Required | Any | Returns profile and permissions of authenticated user. |
| `/api/v1/auth/logout` | POST | Required | Any | Client session invalidation. |

---

## 3. Geographic & Spatial APIs

| Endpoint | Method | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/geography/states` | GET | Public | Any | List active administrative states (`Uttar Pradesh`). |
| `/api/v1/geography/districts/:stateId` | GET | Public | Any | List districts in state (`Lucknow`). |
| `/api/v1/geography/blocks/:districtId` | GET | Public | Any | List blocks in district (`Bakshi Ka Talab`). |
| `/api/v1/geography/block/:blockId` | GET | Public | Any | Details and boundary metadata for administrative block. |

---

## 4. Meteorological Forecast & Explanation APIs

| Endpoint | Method | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/forecasts/targets` | GET | Public | Any | Controlled meteorological target catalogue (`HEAVY_RAIN`, `DRY_SPELL`, `RAINFALL_AMOUNT`). |
| `/api/v1/forecasts/horizons` | GET | Public | Any | Supported lead horizons (1, 3, 7, 14, 21, 30 days). |
| `/api/v1/forecasts/location/:blockId` | GET | Public | Any | Active forecast products for block in `DIAGNOSTIC_ONLY` mode. |
| `/api/v1/forecasts/generate` | POST | Public | Any | Computes or loads calibrated forecast record. (Rate limited: 60/min). |
| `/api/v1/forecasts/:id/explanation` | GET | Public | Any | Non-causal SHAP feature attributions and meteorological drivers. |
| `/api/v1/forecasts/process-expiry` | POST | Public | Any | Idempotent lifecycle sweep updating expired forecasts to `EXPIRED`. |

---

## 5. Agronomic Advisory & Evaluation APIs

| Endpoint | Method | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/agronomy/rules` | GET | Public | Any | 9 controlled rule definitions (sowing delay, drainage, fertilizer protection). |
| `/api/v1/agronomy/evaluate` | POST | Public | Any | Evaluates forecasts through 13 safety gate criteria and agronomic rules. |
| `/api/v1/agronomy/advisories` | GET | Public | Any | List generated advisories with crop type, growth stage, and severity. |
| `/api/v1/agronomy/advisories/:id` | GET | Public | Any | Retrieve advisory candidate with non-causal evidence payload. |

---

## 6. What-If Scenario Analysis APIs

| Endpoint | Method | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/agronomy/scenario-registry` | GET | Public | Any | List 6 controlled scenario types and valid parameter bounds. |
| `/api/v1/agronomy/scenarios/run` | POST | Required | Any | Simulates scenario counterfactuals (`SCENARIO_INDICATOR_ONLY`). (Rate limited: 60/min). |
| `/api/v1/agronomy/scenarios/compare` | POST | Required | Any | Side-by-side delta comparison against baseline forecast. (Rate limited: 60/min). |
| `/api/v1/agronomy/scenarios/sensitivity` | POST | Required | Any | Multi-step perturbation sweep across parameter increments. (Rate limited: 60/min). |
| `/api/v1/agronomy/scenarios/:id/provenance` | GET | Required | Any | SHA-256 parameter fingerprint, execution timestamp, and source forecast ID. |

---

## 7. Multilingual Delivery & Voice Accessibility APIs

| Endpoint | Method | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/localization/languages` | GET | Public | Any | Active delivery languages (`EN`: English, `HI`: हिन्दी). |
| `/api/v1/localization/terminology` | GET | Public | Any | Immutable 15-concept agro-meteorological glossary (Version 1.0.0). |
| `/api/v1/localization/advisories/:id/localized`| GET | Required | Any | Deterministic template-localized advisory with 14 safety gate checks. |
| `/api/v1/localization/advisories/:id/read` | POST | Required | Any | Records user read receipt / personal acknowledgement timestamp. |
| `/api/v1/voice/status` | GET | Public | Any | Voice subsystem status (`DEMO_ONLY`, Bhashini `NOT_CONFIGURED`). |
| `/api/v1/voice/advisories/:id/synthesize` | POST | Required | Any | Synthesizes local audio WAV tone and speech duration. (Rate limited: 60/min). |

---

## 8. Model Registry & Hindcasting APIs

| Endpoint | Method | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/models` | GET | Public | Any | Trained baseline and gradient-boosted tree ensemble models. |
| `/api/v1/models/hindcasting/status` | GET | Public | Any | Multi-year validation gate status (`BLOCKED_SINGLE_SEASON`). |
| `/api/v1/models/hindcasting/folds` | GET | Public | Any | Purged temporal cross-validation folds on Kharif 2024 archive. |
| `/api/v1/models/hindcasting/stability`| GET | Public | Any | Cross-fold score variance and metric stability report. |
| `/api/v1/models/hindcasting/drift` | GET | Public | Any | Kolmogorov-Smirnov distribution drift analysis between partitions. |
