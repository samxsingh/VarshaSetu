# VARSHASETU (वर्षासेतु) — MERN MIGRATION
## PHASE 0: COMPLETE REPOSITORY AUDIT & MIGRATION BLUEPRINT

> **Status:** AUDIT COMPLETE & ARCHITECTURE LOCKED  
> **Author:** Lead Software Architect & Scientific Systems Engineer  
> **Reference Architecture:** `ONE SCIENTIFIC LAYER → FOUR OPERATIONAL PERSPECTIVES`  
> **Rule:** ZERO code modifications in Phase 0. Strictly comprehensive repository audit and deterministic migration planning.

---

## 1. Current Architecture

The existing VarshaSetu application is a production-grade agro-meteorological intelligence and decision-support system. It operates across three distinct tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT PRESENTATION TIER (React 18)                  │
│   • Vite, TypeScript, Tailwind CSS, React Router v6, Zustand, i18next  │
│   • Neo-Brutalist Climate Intelligence Editorial Theme                 │
│   • Leaflet GIS Maps, Recharts / Custom Canvas Visualizations          │
│   • Phase 9 Scientific Evidence & Provenance Ledger System             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (/api/v1)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                APPLICATION GATEWAY TIER (Node.js + Express)            │
│   • Express 4, TypeScript (tsx runtime), Zod Schemas                   │
│   • JWT Auth & Fine-Grained Role-Based Access Control (RBAC)           │
│   • Security Middlewares (Helmet, CORS, Rate Limiters, Request Logger) │
│   • 10 Database Repositories querying PostgreSQL via `pg.Pool`         │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ SQL / PostGIS                  │ HTTP (fetch)
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       DATABASE PERSISTENCE TIER      │  │     SCIENTIFIC ML TIER       │
│ • PostgreSQL 16 + PostGIS 3.4        │  │ • Python 3.11 + FastAPI      │
│ • 24 Relational Tables               │  │ • LightGBM, XGBoost, Scikit  │
│ • 11 Sequential Migrations           │  │ • Platt & Isotonic Calibrator│
│ • Spatial MultiPolygons & GiST Indx  │  │ • SHAP TreeExplainer         │
│ • JSONB Audit & Metric Payloads      │  │ • Climatology Baselines      │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Current Technology Stack Breakdown:
- **Frontend:** React 18.3.1, TypeScript 5.6.3, Vite 5.4.11, Tailwind CSS 3.4.15, Zustand 5.0.2, React Router 6.28.0, Lucide React, i18next 24.0.5, Vitest 2.1.8.
- **Backend:** Node.js >=20.0.0, Express 4.21.2, TypeScript 5.6.3, `pg` 8.13.1, Zod 3.23.8, JWT 9.0.2, bcryptjs 2.4.3, Helmet 8.0.0, Morgan 1.10.0, Vitest 2.1.8.
- **ML Service:** Python 3.11, FastAPI 0.115.0, Uvicorn, LightGBM, XGBoost, Scikit-learn, SHAP, NumPy, Pandas, NetCDF4, Pytest 8.3.3.
- **Persistence:** PostgreSQL 16 + PostGIS 3.4 (with fallback polyfill geometry functions).

---

## 2. Target MERN Architecture

The target architecture transitions the persistence layer to MongoDB while solidifying Node/Express as the authoritative Application Gateway, preserving the Python FastAPI service as the dedicated mathematical and scientific computation core:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND TIER (React + Vite)                      │
│   • React 18 + Vite (Production Optimized Bundle)                      │
│   • Tailwind CSS (Approved Climate Intelligence Theme Intact)          │
│   • React Router v6 (Authoritative Protected Route Guards)             │
│   • Zustand (Synchronized Cross-Role & Horizon Stores)                 │
│   • Axios (Centralized API Client with Request/Response Interceptors)   │
│   • Leaflet + GeoJSON (High-Performance Spatial Choropleths)           │
│   • Scientific Visualizations (Phase 7 Triad + Phase 9 Trust Layer)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST + WebSocket (Socket.IO)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               BACKEND APPLICATION SERVER (Node.js + Express)           │
│   • Node.js 20+ / Express REST API Gateway                             │
│   • MongoDB ODM via Mongoose (Strict Typing, Virtuals, Middleware)     │
│   • JWT Session Authentication + Authoritative RBAC Middleware         │
│   • Socket.IO Server for real-time telemetry, alert events & ingestion │
│   • Circuit Breaker & Resilient HTTP Client for ML Service Proxying    │
│   • GeoJSON Spatial Query Engine (2dsphere index optimizations)        │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ Mongoose ODM                   │ Internal HTTP (Keep-Alive)
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│         PERSISTENCE (MongoDB)        │  │     SCIENTIFIC ML TIER       │
│ • MongoDB 7.0+ (Replica Set / Atlas) │  │ • Existing Python FastAPI    │
│ • 16 Optimized Collections           │  │ • Retained as pure scientific│
│ • GeoJSON 2dsphere Spatial Indexes   │  │   compute & inference engine │
│ • Embedded Subdocuments for Audits   │  │ • Zero MongoDB requirement in│
│ • Schema Validation & Compound Indx  │  │   Python (Stateless Compute) │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Architectural Principles:
1. **Express as Application Gateway:** The frontend never communicates directly with FastAPI. Express enforces authentication, RBAC, parameter sanitization, rate limiting, and persistence.
2. **Stateless Scientific ML Engine:** Python FastAPI focuses solely on compute-heavy operations (XGBoost/LightGBM inference, Platt/Isotonic calibration, SHAP values, Brier score calculations, NetCDF slicing). Express passes parameters and stores output models and audit logs in MongoDB.
3. **Mongoose Model Layer:** Raw SQL strings in `backend/src/repositories` are replaced with Mongoose Schemas with built-in validation, type safety, and lifecycle hooks.
4. **GeoJSON Native Spatial Engine:** PostGIS `MultiPolygon` and `ST_Contains` are mapped to GeoJSON standard features and MongoDB `$geoIntersects` queries indexed via `2dsphere`.

---

## 3. Complete Route Inventory

### A. Canonical Frontend Routes & Personas

| Route | Persona / Domain | Component / View | Layout | Current Status | Guard Required |
|---|---|---|---|---|---|
| `/` | Public | `LandingPage` | `RootLayout` | Active | None |
| `/about` | Public | `AboutPage` | `RootLayout` | Active | None |
| `/how-it-works` | Public | `HowItWorksPage` | `RootLayout` | Active | None |
| `/auth` | Public / Auth | `AuthModal` / `AuthPage` | `RootLayout` | Target Dedicated | None |
| `/select-role` | Public / Onboarding | `RoleGatewaySection` / View | `RootLayout` | Target Dedicated | None |
| `/farmer` | Farmer | Redirect → `/farmer/dashboard` | `FarmerLayout` | Active | `requireRole(['FARMER', 'ADMIN'])` |
| `/farmer/dashboard` | Farmer | `FarmerDashboardPage` | `FarmerLayout` | Active | `requireRole(['FARMER', 'ADMIN'])` |
| `/farmer/onboarding` | Farmer | `FarmerOnboardingPage` | `FarmerLayout` | Active | `requireRole(['FARMER', 'ADMIN'])` |
| `/farmer/forecast` | Farmer | `FarmerForecastPage` | `FarmerLayout` | Active | `requireRole(['FARMER', 'ADMIN'])` |
| `/farmer/advisory` | Farmer | `FarmerAdvisoryPage` | `FarmerLayout` | Active | `requireRole(['FARMER', 'ADMIN'])` |
| `/farmer/advisories` | Farmer | Redirect → `/farmer/advisory` | `FarmerLayout` | Active (Alias) | `requireRole(['FARMER', 'ADMIN'])` |
| `/farmer/what-if` | Farmer | `FarmerWhatIfPage` | `FarmerLayout` | Active | `requireRole(['FARMER', 'ADMIN'])` |
| `/farmer/crop-planning`| Farmer | `FarmerProfilePage` (Crop Spec) | `FarmerLayout` | Target Route | `requireRole(['FARMER', 'ADMIN'])` |
| `/farmer/profile` | Farmer | `FarmerProfilePage` | `FarmerLayout` | Active | `requireRole(['FARMER', 'ADMIN'])` |
| `/officer` | Field Officer | `OfficerDashboardPage` | `OfficerLayout` | Active | `requireRole(['OFFICER', 'ADMIN'])` |
| `/officer/map` | Field Officer | `OfficerMapPage` | `OfficerLayout` | Active | `requireRole(['OFFICER', 'ADMIN'])` |
| `/officer/forecast` | Field Officer | `OfficerForecastPage` | `OfficerLayout` | Active | `requireRole(['OFFICER', 'ADMIN'])` |
| `/officer/advisory` | Field Officer | Redirect → `/officer/advisories`| `OfficerLayout` | Target Alias | `requireRole(['OFFICER', 'ADMIN'])` |
| `/officer/advisories` | Field Officer | `OfficerAdvisoriesPage` | `OfficerLayout` | Active | `requireRole(['OFFICER', 'ADMIN'])` |
| `/officer/alerts` | Field Officer | `AlertCenterPage` (Officer view)| `OfficerLayout` | Target Alias | `requireRole(['OFFICER', 'ADMIN'])` |
| `/officer/crops` | Field Officer | `OfficerCropsPage` | `OfficerLayout` | Active | `requireRole(['OFFICER', 'ADMIN'])` |
| `/officer/field-inspection` | Field Officer | `OfficerMapPage` (Inspection) | `OfficerLayout` | Target Route | `requireRole(['OFFICER', 'ADMIN'])` |
| `/officer/farmer-directory` | Field Officer | `OfficerDashboardPage` (Registry)| `OfficerLayout` | Target Route | `requireRole(['OFFICER', 'ADMIN'])` |
| `/gov` | Government | Redirect → `/government/command-center` | `RootLayout` | Target Alias | `requireRole(['GOVERNMENT', 'ADMIN'])` |
| `/government` | Government | Redirect → `/government/command-center` | `RootLayout` | Active (Alias) | `requireRole(['GOVERNMENT', 'ADMIN'])` |
| `/government/command-center` | Government | `GovernmentDashboardPage` | `RootLayout` | Active | `requireRole(['GOVERNMENT', 'ADMIN'])` |
| `/gov/regional-matrix` | Government | `GovernmentDashboardPage#signals` | `RootLayout` | Target Anchor | `requireRole(['GOVERNMENT', 'ADMIN'])` |
| `/gov/policy-simulator` | Government | `GovernmentDashboardPage#agronomy` | `RootLayout` | Target Anchor | `requireRole(['GOVERNMENT', 'ADMIN'])` |
| `/gov/bulletins` | Government | `GovernmentDashboardPage#advisories` | `RootLayout` | Target Anchor | `requireRole(['GOVERNMENT', 'ADMIN'])` |
| `/analyst` | Climate Analyst | `AnalystOverviewPage` | `AnalystLayout` | Active | `requireRole(['ANALYST', 'ADMIN'])` |
| `/analyst/forecast-lab`| Climate Analyst | `ForecastLabPage` | `AnalystLayout` | Active | `requireRole(['ANALYST', 'ADMIN'])` |
| `/forecast-lab` | Climate Analyst | Redirect → `/analyst/forecast-lab` | `RootLayout` | Active (Alias) | `requireRole(['ANALYST', 'ADMIN'])` |
| `/analyst/models` | Climate Analyst | `ModelsPage` | `AnalystLayout` | Active | `requireRole(['ANALYST', 'ADMIN'])` |
| `/analyst/data-health` | Climate Analyst | `DataHealthPage` | `AnalystLayout` | Active | `requireRole(['ANALYST', 'ADMIN'])` |
| `/analyst/alerts` | Climate Analyst | `AlertCenterPage` | `AnalystLayout` | Active | `requireRole(['ANALYST', 'ADMIN'])` |
| `/admin` | System Admin | `AdminDashboardPage` | `RootLayout` | Active | `requireRole(['ADMIN'])` |
| `*` | Any | `NotFoundPage` | `RootLayout` | Active | None |

---

## 4. Complete API Inventory

The Node.js Express API provides **58 distinct endpoints** mounted under `/api/v1`:

### 1. Health & Telemetry (`/api/v1/health`)
- `GET /api/v1/health` — Public. Service health, uptime, memory, version.
- `GET /api/v1/health/ready` — Public. Readiness probe checking MongoDB and ML Service.
- `GET /api/v1/health/version` — Public. Git commit SHA and semantic version.
- `GET /api/v1/health/metrics` — Public. System process metrics, memory usage.
- `GET /api/v1/health/database` — Public. MongoDB connection and ping latency.

### 2. Authentication & Profile (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Public. Rate limited (10/15m). Validated with Zod `registerSchema`. Returns JWT + User entity.
- `POST /api/v1/auth/login` — Public. Rate limited (10/15m). Validated with Zod `loginSchema`. Returns JWT + User entity.
- `GET /api/v1/auth/me` — Protected (`requireAuth`). Returns current authenticated user record.
- `POST /api/v1/auth/logout` — Protected (`requireAuth`). Clears session / logs audit event.

### 3. Administrative Geography & Spatial Resolution (`/api/v1/geography`)
- `GET /api/v1/geography/states` — Public. Lists Indian administrative states.
- `GET /api/v1/geography/states/:id` — Public. Fetches specific state by UUID/ID.
- `GET /api/v1/geography/districts` — Public. Query: `stateId`, `limit`, `offset`.
- `GET /api/v1/geography/districts/:id` — Public. Fetches district details.
- `GET /api/v1/geography/blocks` — Public. Query: `districtId`, `limit`, `offset`.
- `GET /api/v1/geography/blocks/:id` — Public. Fetches block center coordinates and bbox.
- `GET /api/v1/geography/panchayats` — Public. Query: `blockId`, `limit`, `offset`.
- `GET /api/v1/geography/panchayats/:id` — Public. Fetches gram panchayat.
- `GET /api/v1/geography/villages` — Public. Query: `panchayatId`, `limit`, `offset`.
- `GET /api/v1/geography/villages/:id` — Public. Fetches village.
- `GET /api/v1/geography/resolve-point` — Public. Query: `lat`, `lon`. Geospatial point-in-polygon resolution returning enclosing block and boundary.

### 4. Data Health & Ingestion Pipeline (`/api/v1/data-health`)
- `GET /api/v1/data-health` — Protected (`requireAuth`). Ingestion stats, freshness, active sources.
- `GET /api/v1/data-health/sources` — Protected. Configured meteorological sources (IMD, ECMWF, GFS, etc.).
- `GET /api/v1/data-health/runs` — Protected. Paginated ingestion execution logs.
- `GET /api/v1/data-health/runs/:id` — Protected. Detailed quality score report for an ingestion batch.
- `POST /api/v1/data-health/trigger` — Protected (`requireRole(['ADMIN', 'ANALYST'])`). Triggers ingestion job.

### 5. ML Models, Calibration & Hindcasting (`/api/v1/models`)
- `GET /api/v1/models/status` — Protected. Model deployment status, active weights, disclosures.
- `GET /api/v1/models/registry` — Protected. Catalog of available model architectures.
- `GET /api/v1/models/comparison` — Protected. Query: `target`, `horizon_days`. Baseline vs LightGBM benchmark.
- `GET /api/v1/models/datasets` — Protected. Datasets catalog, checksums, features list.
- `GET /api/v1/models/calibration/status` — Protected. ECE score, calibration curve metrics.
- `GET /api/v1/models/calibration/comparison` — Protected. Platt Scaling vs Isotonic Regression vs Raw.
- `POST /api/v1/models/calibration/run` — Protected (`requireRole(['ADMIN', 'ANALYST'])`). Runs calibration.
- `GET /api/v1/models/calibration/:id/reliability` — Protected. Reliability diagram bins.
- `GET /api/v1/models/calibration/:id` — Protected. Calibration parameters and ECE.
- `GET /api/v1/models/hindcasting/status` — Protected. Multi-year hindcast status.
- `GET /api/v1/models/hindcasting/gate` — Protected. Verification safety gate checks.
- `GET /api/v1/models/hindcasting/folds` — Protected. Temporal cross-validation splits.
- `GET /api/v1/models/hindcasting/results` — Protected. Query: `target`, `horizon_days`. Brier skill score & ROC-AUC.
- `GET /api/v1/models/hindcasting/results/:experimentId` — Protected. Experiment metrics.
- `GET /api/v1/models/hindcasting/stability` — Protected. Year-over-year skill stability.
- `GET /api/v1/models/hindcasting/drift` — Protected. Concept/covariate drift tracking.
- `GET /api/v1/models/hindcasting/coverage` — Protected. Spatial station coverage metrics.
- `POST /api/v1/models/hindcasting/run` — Protected (`requireRole(['ADMIN', 'ANALYST'])`). Triggers hindcast.
- `GET /api/v1/models/experiments` — Protected. List training experiments.
- `GET /api/v1/models/experiments/:id` — Protected. Single experiment details.
- `POST /api/v1/models/baselines/train` — Protected (`requireRole(['ADMIN', 'ANALYST'])`). Climatology training.
- `POST /api/v1/models/train` — Protected (`requireRole(['ADMIN', 'ANALYST'])`). Train LightGBM model.
- `GET /api/v1/models/:id` — Protected. Model metadata and hyperparameters.
- `GET /api/v1/models/:id/explanations` — Protected. Global SHAP feature importances.
- `POST /api/v1/models/:id/explain` — Protected. Local feature attribution for specific instance.

### 6. Forecast Operations (`/api/v1/forecasts`)
- `GET /api/v1/forecasts/status` — Public/Protected. Operational mode (`DIAGNOSTIC_ONLY`), pipeline health.
- `GET /api/v1/forecasts/availability` — Public/Protected. Query: `block_id`. Available dates and targets.
- `GET /api/v1/forecasts/targets` — Public/Protected. Valid prediction targets (Heavy Rain, Dry Spell, Onset, etc.).
- `GET /api/v1/forecasts/horizons` — Public/Protected. Valid horizons (7, 14, 21, 30 days).
- `GET /api/v1/forecasts/history` — Protected. Historical immutable forecast ledger.
- `GET /api/v1/forecasts/location/:blockId` — Protected. All active forecasts for a block.
- `GET /api/v1/forecasts` — Protected. Filtered forecast query.
- `POST /api/v1/forecasts/generate` — Protected (`requireRole(['ADMIN', 'OFFICER', 'ANALYST'])`). Triggers inference.
- `POST /api/v1/forecasts/process-expiry` — Protected (`requireRole(['ADMIN'])`). Sweeps expired forecasts.
- `GET /api/v1/forecasts/:id/explanation` — Protected. SHAP values, atmospheric signal contributions.
- `GET /api/v1/forecasts/:id` — Protected. Full forecast record with confidence intervals.

### 7. Scientific Events & Lifecycle (`/api/v1/events`)
- `POST /api/v1/events/detect` — Protected (`requireRole(['ADMIN', 'OFFICER', 'ANALYST'])`). Evaluates thresholds.
- `GET /api/v1/events` — Protected. List active meteorological risk events.
- `GET /api/v1/events/:id/history` — Protected. Lifecycle state transitions audit.
- `GET /api/v1/events/:id` — Protected. Single event record.
- `POST /api/v1/events/:id/acknowledge` — Protected (`requireRole(['ADMIN', 'OFFICER', 'ANALYST'])`). Acknowledges event.
- `POST /api/v1/events/:id/resolve` — Protected (`requireRole(['ADMIN', 'OFFICER', 'ANALYST'])`). Resolves event.

### 8. Notifications & Preferences (`/api/v1/notifications`)
- `GET /api/v1/notifications/status` — Protected. In-app, SMS, Voice channel operational status.
- `GET /api/v1/notifications/preferences` — Protected. User's alert preference settings.
- `PUT /api/v1/notifications/preferences` — Protected. Updates user channels and severity thresholds.

### 9. Operational Monitoring (`/api/v1/operations`)
- `GET /api/v1/operations/status` — Protected. Consolidated system telemetry and data freshness report.

### 10. Agronomic Advisories (`/api/v1/agronomy` & `/api/v1/advisories`)
- `GET /api/v1/agronomy/status` — Public/Protected. Agronomic rule engine status.
- `GET /api/v1/agronomy/rules` — Protected. Controlled rule catalog (sowing, irrigation, pest, fertilizer).
- `GET /api/v1/agronomy/rules/:id` — Protected. Rule details and thresholds.
- `GET /api/v1/agronomy/crops` — Protected. Crop phenology definitions (Paddy, Maize, Mustard, etc.).
- `GET /api/v1/agronomy/crops/:id` — Protected. Phenological growth stage parameters.
- `POST /api/v1/agronomy/evaluate` — Protected (`requireRole(['ADMIN', 'OFFICER', 'ANALYST'])`). Evaluates rules.
- `POST /api/v1/agronomy/generate` — Protected (`requireRole(['ADMIN', 'OFFICER', 'ANALYST'])`). Generates advisories.
- `POST /api/v1/agronomy/simulate` — Protected. Sensitivity simulation.
- `GET /api/v1/agronomy/languages` — Public/Protected. Supported languages (EN, HI).
- `GET /api/v1/agronomy/terminology` — Public/Protected. Controlled terminology glossary.
- `POST /api/v1/agronomy/localize` — Protected. Deterministic translation generator.
- `GET /api/v1/agronomy/voice/status` — Protected. Voice synthesis provider status.
- `GET /api/v1/advisories` — Protected. List generated advisories for user's block.
- `GET /api/v1/advisories/:id` — Protected. Single advisory record.
- `POST /api/v1/advisories/:id/dismiss` — Protected. Farmer/Officer dismiss action.
- `GET /api/v1/advisories/:id/localized` — Protected. Language-specific advisory content.
- `POST /api/v1/advisories/:id/read` — Protected. Records user read acknowledgement.
- `POST /api/v1/advisories/:id/voice` — Protected. Synthesizes voice audio payload.

### 11. What-If Scenario Analysis (`/api/v1/agronomy/scenarios`)
- `GET /api/v1/agronomy/scenarios/registry` — Protected. Available scenario types (`SOWING_DELAY`, etc.).
- `GET /api/v1/agronomy/scenarios` — Protected. List user scenario evaluations.
- `POST /api/v1/agronomy/scenarios/run` — Protected. Executes parameter sensitivity run.
- `POST /api/v1/agronomy/scenarios/compare` — Protected. Multi-scenario comparative run.
- `POST /api/v1/agronomy/scenarios/sensitivity` — Protected. Parameter response curves.
- `GET /api/v1/agronomy/scenarios/:id` — Protected. Scenario run results.
- `GET /api/v1/agronomy/scenarios/:id/sensitivity` — Protected. Sensitivity data.
- `GET /api/v1/agronomy/scenarios/:id/explanation` — Protected. Scientific narrative.
- `GET /api/v1/agronomy/scenarios/:id/provenance` — Protected. Data lineage and calibration ledger.

### 12. Multilingual & Voice Accessibility (`/api/v1/localization` & `/api/v1/voice`)
- `GET /api/v1/localization/languages` — Public. Controlled language registry.
- `GET /api/v1/localization/terminology` — Public. Agricultural and meteorological glossary.
- `POST /api/v1/localization/localize` — Protected. Template-based localization.
- `GET /api/v1/localization/advisories/:id/localized` — Protected. Localized advisory.
- `POST /api/v1/localization/advisories/:id/read` — Protected. Read receipts.
- `GET /api/v1/voice/status` — Protected. Bhashini / Web Speech API status.
- `POST /api/v1/voice/advisories/:id/synthesize` — Protected. Voice synthesis log & telemetry.

### 13. System Administration & RBAC Verification (`/api/v1/admin`)
- `GET /api/v1/admin/system-status` — Protected (`requireRole(['ADMIN'])`).
- `GET /api/v1/analyst/model-inspect` — Protected (`requirePermission(['analyst:models:read'])`).

---

## 5. Complete Database Inventory (Current PostgreSQL / PostGIS)

The existing PostgreSQL database schema encompasses **24 tables** established across 11 migrations:

| # | Table Name | Migration | Primary Purpose | Spatial / JSON Fields | Indexes |
|---|---|---|---|---|---|
| 1 | `users` | 002 | Accounts, roles, hashed passwords, assigned location | `permissions TEXT[]` | Role, phone, email |
| 2 | `states` | 003 | State administrative nodes | `bbox JSONB` | Unique code |
| 3 | `districts` | 003 | District administrative nodes | `bbox JSONB` | State ID, unique code |
| 4 | `blocks` | 003 | Block administrative nodes (focal forecast unit) | `bbox JSONB` | District ID, unique code |
| 5 | `gram_panchayats` | 003 | Panchayat administrative nodes | `bbox JSONB` | Block ID, unique code |
| 6 | `villages` | 003 | Village administrative nodes | `bbox JSONB` | Panchayat ID, unique code |
| 7 | `geographic_boundaries` | 004 | Vector boundary polygons | `geometry MultiPolygon` | Entity+Level, GiST spatial index |
| 8 | `data_sources` | 005 | Meteorological data provider metadata | None | Provider, status |
| 9 | `audit_logs` | 006 | System security and administrative actions | `metadata JSONB` | User, action, created_at |
| 10| `data_ingestion_runs` | 007 | Ingestion execution pipeline logs | `quality_summary JSONB`| Status, provider, created_at |
| 11| `data_quality_reports` | 007 | Missingness, outlier & quality metrics | `details JSONB` | Run ID |
| 12| `forecast_lifecycle_events`| 008 | Forecast state transition history | `metadata JSONB` | Forecast ID, new_status, created_at |
| 13| `forecast_events` | 008 | Scientific risk events (Heavy Rain, etc.) | `metadata JSONB` | Forecast ID, block, type, severity, state |
| 14| `forecast_event_transitions`| 008| Event state transitions audit | `metadata JSONB` | Event ID, created_at |
| 15| `notification_preferences`| 008| User notification channel configs | `event_types TEXT[]`, `channels TEXT[]` | User ID (Unique), role |
| 16| `notification_deliveries` | 008 | Simulated notification dispatch log | `details JSONB` | Event ID, recipient, status, channel |
| 17| `agronomic_advisories` | 009 | Calibrated crop advisories | `evidence JSONB` | Forecast ID, block, crop, rule, dedup |
| 18| `agronomic_rule_evaluations`| 009| Safety gate & rule execution audit | `blocked_reasons JSONB`| Forecast ID, block, crop |
| 19| `scenario_runs` | 009/010| What-If simulation outputs & curves | `parameters JSONB`, `results JSONB` | Scenario ID, block, crop, type |
| 20| `scenario_comparisons` | 010 | Multi-scenario comparative delta records | `deltas JSONB`, `envelope JSONB` | Scenario ID, type, created_at |
| 21| `scenario_sensitivities` | 010 | Parameter sensitivity response curves | `curve_points JSONB`, `envelope JSONB`| Scenario ID, type, created_at |
| 22| `localized_advisories` | 011 | Cached deterministic translations (EN/HI) | `evidence JSONB` | Advisory ID + Lang (Unique), fingerprint |
| 23| `advisory_reads` | 011 | Farmer/Officer read receipts | None | Advisory ID, user ID, read_at |
| 24| `voice_synthesis_logs` | 011 | Voice synthesis telemetry & latency | None | Advisory ID, requested_at |

---

## 6. PostgreSQL → MongoDB Mapping

In relational databases, normalization causes data fragmentation (e.g. separate tables for audit transitions, rule evaluations, and localized versions). In MongoDB, documents naturally embed lifecycle states, localized content, and telemetry subdocuments while referencing root administrative and user collections:

### Target MongoDB Collections (16 Collections):

```
PostgreSQL (24 Tables)                         MongoDB Target (16 Collections)
─────────────────────────────────────────────────────────────────────────────
users                                    ───►  users
states, districts, blocks,               ───►  administrative_nodes (hierarchical parent ref)
  gram_panchayats, villages
geographic_boundaries                    ───►  geographic_boundaries (GeoJSON + 2dsphere)
data_sources                             ───►  data_sources
audit_logs                               ───►  audit_logs
data_ingestion_runs,                     ───►  data_ingestion_runs (embeds quality report)
  data_quality_reports
forecast_lifecycle_events                ───►  forecasts (forecast collection + lifecycle subdocs)
forecast_events,                         ───►  forecast_events (embeds state transitions)
  forecast_event_transitions
notification_preferences                 ───►  notification_preferences
notification_deliveries                  ───►  notification_deliveries
agronomic_advisories,                    ───►  agronomic_advisories (embeds localized templates,
  localized_advisories, advisory_reads         read receipts, and evaluation metadata)
agronomic_rule_evaluations               ───►  agronomic_rule_evaluations (standalone audit)
scenario_runs, scenario_comparisons,     ───►  scenario_runs (embeds deltas, comparisons &
  scenario_sensitivities                       sensitivity curve points)
voice_synthesis_logs                     ───►  voice_synthesis_logs
```

### Detailed Schema Design & GeoJSON Specifications:

#### 1. `users`
- **Fields:** `_id` (ObjectId), `role` (`'FARMER'|'OFFICER'|'GOVERNMENT'|'ANALYST'|'ADMIN'`), `fullName` (String), `phoneNumber` (String, unique sparse), `email` (String, unique sparse), `passwordHash` (String), `preferredLanguage` (String, default `'hi'`), `assignedLocationId` (ObjectId ref), `permissions` ([String]), `isActive` (Boolean), `createdAt`, `updatedAt`.
- **Indexes:** `{ email: 1 }` (unique sparse), `{ phoneNumber: 1 }` (unique sparse), `{ role: 1 }`.

#### 2. `administrative_nodes`
- **Fields:** `_id` (ObjectId), `level` (`'STATE'|'DISTRICT'|'BLOCK'|'PANCHAYAT'|'VILLAGE'`), `name` (String), `code` (String, unique), `parentId` (ObjectId ref), `center`: `{ lat: Number, lon: Number }`, `bbox`: `[Number]`, `ancestors`: `[{ id: ObjectId, level: String, name: String }]`, `createdAt`.
- **Indexes:** `{ code: 1 }` (unique), `{ parentId: 1 }`, `{ level: 1 }`, `{ 'center.lat': 1, 'center.lon': 1 }`.

#### 3. `geographic_boundaries` (Geospatial Core)
- **Fields:** `_id` (ObjectId), `entityId` (ObjectId ref `administrative_nodes`), `level` (String), `location`: `{ type: "MultiPolygon" | "Polygon", coordinates: [[[[Number]]]] }`, `source` (String), `sourceVersion` (String), `isDemo` (Boolean), `areaSqKm` (Number), `createdAt`.
- **Spatial Index:** `{ location: "2dsphere" }`.
- **Query Replacement for `ST_Contains`:**
  ```javascript
  // MongoDB Point-in-Polygon Query
  const boundary = await GeographicBoundary.findOne({
    level: 'BLOCK',
    location: {
      $geoIntersects: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude] // GeoJSON order: [lon, lat]
        }
      }
    }
  }).populate('entityId');
  ```

#### 4. `forecast_events` (Consolidates transitions)
- **Fields:** `_id` (ObjectId), `eventId` (String, unique), `eventType` (String), `forecastId` (String), `blockId` (String), `detectedAt` (Date), `validFrom` (Date), `validUntil` (Date), `probability` (Number), `threshold` (Number), `unit` (String), `severity` (String), `confidenceStatus` (String), `operationalStatus` (String), `dataFreshness` (String), `validationStatus` (String), `state` (`'DETECTED'|'ACKNOWLEDGED'|'RESOLVED'|'EXPIRED'|'SUPPRESSED'`), `description` (String), `deduplicationHash` (String), `acknowledgedBy` (String), `acknowledgedAt` (Date), `resolvedBy` (String), `resolvedAt` (Date), `transitions`: `[{ transitionId: String, previousState: String, newState: String, actor: String, reason: String, timestamp: Date }]`, `metadata`: Object.
- **Indexes:** `{ eventId: 1 }` (unique), `{ blockId: 1, validFrom: 1, validUntil: 1 }`, `{ deduplicationHash: 1 }`, `{ state: 1 }`.

#### 5. `agronomic_advisories` (Consolidates localized versions & reads)
- **Fields:** `_id` (ObjectId), `advisoryId` (String, unique), `ruleId` (String), `forecastId` (String), `blockId` (String), `cropType` (String), `growthStage` (String), `riskCategory` (String), `severity` (String), `actionRecommendation` (String), `scientificRationale` (String), `evidence`: Object, `safetyGatePassed` (Boolean), `status` (String), `deduplicationHash` (String), `localizations`: `[{ language: String, title: String, summary: String, riskIndicator: String, whatItMeans: String, confidenceStatement: String, disclosure: String, translationMethod: String, localizationFingerprint: String }]`, `readReceipts`: `[{ userId: ObjectId, language: String, deviceChannel: String, readAt: Date }]`, `createdAt`.
- **Indexes:** `{ advisoryId: 1 }` (unique), `{ blockId: 1, cropType: 1 }`, `{ deduplicationHash: 1 }`, `{ status: 1 }`.

#### 6. `scenario_runs` (Consolidates sensitivities & comparisons)
- **Fields:** `_id` (ObjectId), `scenarioId` (String, unique), `userId` (ObjectId ref), `blockId` (String), `cropType` (String), `growthStage` (String), `baselineForecastId` (String), `scenarioType` (String), `classification` (String), `scenarioParameters`: Object, `scenarioResults`: Object, `deltas`: [Object], `envelope`: Object, `explanation`: Object, `provenance`: Object, `sensitivities`: `[{ parameterName: String, parameterRange: Object, curvePoints: [Object], envelope: Object }]`, `scientificDisclaimer` (String), `createdAt`.
- **Indexes:** `{ scenarioId: 1 }` (unique), `{ blockId: 1, cropType: 1 }`, `{ scenarioType: 1 }`.

---

## 7. Authentication & RBAC Audit

### Current Authentication Architecture:
- Stateless JWT issuance via `jsonwebtoken` with secret from `JWT_SECRET`.
- Passwords hashed with `bcryptjs` (salt rounds = 10).
- Express middleware [`requireAuth`](file:///Users/sameersingh/Desktop/VarshaSetu/backend/src/middleware/authMiddleware.ts) validates bearer token and fetches user from DB.
- Granular permissions checked via [`requirePermission`](file:///Users/sameersingh/Desktop/VarshaSetu/backend/src/middleware/rbacMiddleware.ts).
- Roles enforced via [`requireRole`](file:///Users/sameersingh/Desktop/VarshaSetu/backend/src/middleware/rbacMiddleware.ts).
- Client stores JWT in `localStorage` key `'varshasetu_token'`.

### Target RBAC Configuration:
Five authoritative personas with hierarchical permissions:

1. **FARMER:**
   - Permissions: `farmer:profile:read`, `farmer:profile:write`, `farmer:advisory:read`, `farmer:simulator:execute`.
   - Data Scoping: Strictly restricted to their assigned Block (`assignedLocationId`) and selected crop types. Cannot view raw model weights or trigger system ingestions.
2. **FIELD OFFICER:**
   - Permissions: `officer:district:read`, `officer:panchayat:read`, `officer:bulletin:broadcast`, `officer:risk_map:read`, `farmer:advisory:read`.
   - Data Scoping: Regional cluster of blocks within their jurisdiction. Authorized to draft bulletins and record field inspection logs.
3. **GOVERNMENT:**
   - Permissions: `gov:spatial_indicators:read`, `gov:forecast_provenance:read`, `gov:validation_reports:read`.
   - Data Scoping: Statewide district aggregation, departure indicators, policy simulations. Read-only for model weights, supervisory over bulletins.
4. **CLIMATE ANALYST:**
   - Permissions: `analyst:models:read`, `analyst:features:read`, `analyst:hindcasting:execute`, `analyst:validation:write`.
   - Data Scoping: Complete scientific telemetry, feature importance tables, calibration models, raw ingestion quality logs.
5. **ADMIN:**
   - Permissions: `admin:*` (Superuser wildcard). Complete access to user management, system configs, audit logs, and data ingestion triggers.

### Frontend Route Guards:
- Create a dedicated `<ProtectedRoute allowedRoles={[...]} />` wrapper around route definitions in React Router.
- Unauthenticated users attempting to access protected routes are redirected to `/auth` with the return URL preserved in state.
- Unauthorized users (wrong role) are redirected to their authorized portal or a dedicated 403 Forbidden screen.

---

## 8. ML Service Integration Plan

### Architecture Justification:
The Python FastAPI ML Service contains complex scientific logic:
- Multi-target gradient boosting models (`lightgbm`, `xgboost`).
- TreeExplainer SHAP calculations (`shap.TreeExplainer`).
- Platt scaling logistic calibration & isotonic regression (`scikit-learn`).
- Climatology rolling averages and multi-year cross-validation hindcast folds.
- NetCDF / ERA5 gridded reanalysis array processing (`numpy`, `pandas`).

**Rewriting these models in JavaScript is technically unjustified, error-prone, and violates scientific reproducibility.** 
The architecture preserves Python FastAPI as an independent compute service.

### Express API Gateway Proxy Pattern:
```
React Client ────► Express API Gateway ────► FastAPI ML Service
 (Axios)               (Port 5000)                (Port 8000)
                           │
                     MongoDB (Cache & Records)
```

1. **Client Isolation:** React never calls `http://localhost:8000` directly. All requests go to `/api/v1/*` on Express.
2. **Resilience & Timeouts:** Node.js uses an Axios client configured with a 15-second timeout and retry logic for ML inference endpoints.
3. **Graceful Fallbacks:** If the ML service is temporarily down or compiling artifacts, Express responds with deterministic fallback envelopes (e.g. `operational_status: "DIAGNOSTIC_ONLY"`, `data_freshness: "HISTORICAL_ONLY"`, `source: "ARCHIVED_BASELINE"`), preserving frontend functionality without crashing.
4. **MongoDB Persistence:** When FastAPI generates a forecast or scenario run, Express stores the resulting JSON artifact, hashes, and metadata in MongoDB for fast retrieval without re-running model inference.

---

## 9. Frontend Component Migration Map

All **68 frontend components** are mapped to their target roles and API dependencies:

| Component Category | Components Count | Key Components | Data Sources / APIs | Migration Action |
|---|---|---|---|---|
| **UI Primitives** | 11 | `Alert`, `Badge`, `Button`, `Card`, `EmptyState`, `Input`, `LoadingState`, `Modal`, `Progress`, `Select`, `Tabs` | Stateless / Pure UI | Retain exactly as-is. |
| **Common** | 5 | `Navbar`, `Footer`, `LanguageToggle`, `AudioBriefingBar`, `DemoBanner` | `useAppStore`, `authService` | Preserve neo-brutalist theme and i18n triggers. |
| **Visualization** | 12 | `ConfidenceIndicator`, `SignalExplanation`, `ProvenanceDrawer`, `ScientificEvidencePanel`, `ScientificChartFrame`, `ScientificLegend`, `ProbabilityBar`, `RiskDistribution`, `ForecastTimeline`, `SkillMetricCard`, `ConfidenceBand`, `DataQualityIndicator` | `forecastService`, `modelService` | Preserve all Phase 7/9 visualization props, SVG scales, and triad indicators. |
| **Maps** | 4 | `MapContainer`, `MapLayerControl`, `MapLegend`, `SelectedAreaPanel` | `geographyService`, Leaflet, GeoJSON boundaries | Upgrade to fetch GeoJSON from MongoDB `/geography/blocks` endpoint. |
| **Landing** | 6 | `RoleGatewaySection`, `DecisionPathwaysSection`, `TrustIntegritySection`, `ScientificGroundingSection`, `FinalCTASection`, `LandingFooter` | Static / `useAppStore` | Wire up buttons to new `/auth` and `/select-role` routes. |
| **Farmer** | 8 | `CropAdvisoryCard`, `FarmerHeader`, `FarmerPageHeader`, `MonsoonGlanceCard`, `ScientificDisclosure`, `ScientificStatusBadge`, `WhatIfPreviewCard`, `FarmerBottomNav` | `forecastService`, `advisoryService`, `useFarmerStore` | Connect to MongoDB-backed advisories and forecasts. |
| **Forecast** | 2 | `HorizonSelector`, `TargetRiskCard` | `forecastService`, `useFarmerStore`, `useOfficerStore` | Preserve 7/14/21/30 day horizon synchronization. |
| **Officer** | 4 | `BulletinModal`, `OfficerBottomNav`, `ScientificIntegrityStrip`, `SummaryStatCards` | `eventService`, `advisoryService`, `useOfficerStore` | Connect bulletin broadcasts to Express `/advisories/generate` and notification deliveries. |
| **Government** | 10 | `GovCommandHeader`, `GovIntelligenceStrip`, `GovRegionalMapWorkspace`, `GovRegionalSignalMatrix`, `GovForecastWorkspace`, `GovAgronomicRiskPanel`, `GovAdvisoryOversight`, `GovAlertLifecycle`, `GovScientificIntegrityPanel`, `GovSystemStatus` | `forecastService`, `eventService`, `advisoryService` | Ensure smooth scrolling anchor links and regional matrix provenance triggers. |
| **Analyst** | 6 | `CalibrationReliabilityPanel`, `ClimateSignalCard`, `HindcastSummaryPanel`, `ModelMetricCard`, `ProvenanceCard`, `AnalystBottomNav` | `modelService`, `dataHealthService` | Connect to model calibration and hindcast endpoints with zero data fabrication. |

---

## 10. State Management Migration Map

### Zustand Stores Audit:

#### 1. `useAppStore` ([`useAppStore.ts`](file:///Users/sameersingh/Desktop/VarshaSetu/frontend/src/stores/useAppStore.ts))
- **State:** `currentRole` (`UserRole`), `language` (`'en' | 'hi'`), `isAudioBriefingPlaying` (Boolean).
- **Actions:** `setRole`, `setLanguage`, `toggleAudioBriefing`.
- **Target Migration:** Integrate with real authentication state (`user: UserEntity | null`, `token: string | null`, `isAuthenticated: boolean`). Persist language and auth token in `localStorage`.

#### 2. `useFarmerStore` ([`useFarmerStore.ts`](file:///Users/sameersingh/Desktop/VarshaSetu/frontend/src/stores/useFarmerStore.ts))
- **State:** `location` (`LocationSelection`), `crop` (`CropType`), `stage` (`CropGrowthStage`), `horizon` (`ForecastHorizonDays`, default `7`), `irrigation` (`IrrigationFacility`), `soil` (`SoilType`), `farmSizeAcres` (Number), `onboardingStep` (Number), `hasCompletedOnboarding` (Boolean).
- **Default Location:** Lucknow (Bakshi Ka Talab, Bhaisamau, 26.9856°N, 80.9254°E).
- **Target Migration:** Preserve 7-day default horizon. Sync farmer profile settings with MongoDB user profile on updates.

#### 3. `useOfficerStore` ([`useOfficerStore.ts`](file:///Users/sameersingh/Desktop/VarshaSetu/frontend/src/stores/useOfficerStore.ts))
- **State:** `selectedDistrict` (`'Lucknow'`), `selectedBlock` (`'Bakshi Ka Talab'`), `selectedPanchayat` (`'Bhaisamau'`), `activeRiskLayer` (`RiskMapLayer`, default `'DRY_SPELL'`), `isBulletinModalOpen` (Boolean), `selectedHorizon` (`7 | 14 | 21 | 30`, default `7`).
- **Target Migration:** Maintain horizon synchronization with farmer store when officer inspects field profiles.

---

## 11. Visualization Migration Map (Phase 7 System)

The Phase 7 scientific instrumentation components must be preserved with strict interface contracts:

1. **`ScientificChartFrame`:** Structural outer container with neo-brutalist border (`#102A43`), high-contrast title, data source badge, uncertainty disclaimer, and export action.
2. **`ScientificLegend`:** Triad legend distinguishing Climatological Normal, Calibrated Model Probability, and Observation Reality.
3. **`ProbabilityBar`:** Continuous percentage bar ($0–100\%$) color-coded by meteorological risk thresholds ($<35\%$ Green `#3F7D58`, $35–65\%$ Amber `#D97706`, $>65\%$ Red/Storm `#0E7490`/`#2563EB`).
4. **`RiskDistribution`:** Probability density curve rendering P10, P50 (median), and P90 uncertainty spreads.
5. **`ForecastTimeline`:** Step timeline illustrating 7, 14, 21, and 30-day forecast trajectories with confidence shading bands.
6. **`SkillMetricCard`:** Metric tile displaying Brier Skill Score ($BSS$), ROC-AUC, Reliability ($ECE$), and sample size ($N$).
7. **`ConfidenceBand`:** Area fill rendering the confidence interval around median precipitation anomalies.
8. **`DataQualityIndicator`:** Visual status chip signaling sensor uptime, telemetry latency, and missingness flags.

---

## 12. Scientific Evidence Migration Map (Phase 9 System)

The Phase 9 Evidence, Explainability & Trust Layer must be carried over with zero data fabrication:

1. **`ConfidenceIndicator`:** Triad metric:
   - $P(\text{event})$ Event Risk Probability
   - Confidence Tier (`HIGH`, `MEDIUM`, `LOW` based on station density)
   - $P_{10} - P_{90}$ Uncertainty Spread
   - Historical Climatology Reference Baseline
   - Disclosure: *"Probability denotes event likelihood; Confidence denotes model stability & sample depth."*
2. **`SignalExplanation`:**
   - Atmospheric drivers: Moisture Convergence, Synoptic Wind, Thermodynamic Instability, Antecedent Precipitation.
   - Dual perspective: Technical Analyst Mode vs. Plain-Language Farmer Mode.
   - Non-Causal Diagnostic Disclaimer: *"Diagnostic correlations indicate statistical association, not confirmed physical causality."*
3. **`ProvenanceDrawer`:**
   - Slide-out ledger dialog (`role="dialog"`, `aria-modal="true"`, Esc key & backdrop dismiss).
   - Ingestion lineage: IMD AWS, INSAT-3DR, ERA5 Reanalysis, GFS 0.25°.
   - Active reporting AWS stations (Lucknow AMAUSI, Mohanlalganj AWS, Malihabad AWS).
   - Spatial resolution ($0.05^\circ \times 0.05^\circ \approx 5.5\text{ km}$), pipeline latency, SHA-256 verification hash.
4. **`ScientificEvidencePanel`:**
   - Unified WHAT, WHY, WHERE, and HOW CONFIDENT ledger embedded across all persona views.
   - Missing telemetry guardrail: Explicitly renders `"NOT CONFIGURED"` or `"NOT AVAILABLE IN CURRENT PIPELINE"`.

---

## 13. External Data Dependency Map

| Data Source | Provider | Variables | Resolution / Frequency | Actual Operational Status |
|---|---|---|---|---|
| **IMD Automatic Weather Stations (AWS)** | India Meteorological Department | Surface Rain, Temp, RH, Wind Speed | Station-level, Hourly | **ARCHIVED / SIMULATED** (Anchored to Kharif 2024 archive; Live API unconfigured) |
| **ERA5 Reanalysis** | ECMWF / Copernicus | Geopotential Height, Wind Vectors, 850hPa Moisture | $0.25^\circ \times 0.25^\circ$, Daily | **ARCHIVED** (2014–2024 verification baseline) |
| **INSAT-3DR Satellite** | ISRO / MOSDAC | Cloud Top Temp, Quantitative Precip Estimate | $4\text{ km}$, 30-min | **NOT CONFIGURED IN CURRENT PIPELINE** |
| **GFS 0.25°** | NOAA NCEP | Synoptic pressure fields, Total Precipitable Water | $0.25^\circ$, 6-hourly | **SIMULATED / DIAGNOSTIC** |
| **ENSO / ONI** | NOAA CPC | Niño 3.4 SST Anomalies | Planetary, Monthly | **ARCHIVED / DIAGNOSTIC** |
| **Indian Ocean Dipole (IOD / DMI)**| Australian BoM | Dipole Mode Index | Planetary, Weekly | **ARCHIVED / DIAGNOSTIC** |
| **Bhashini Voice Services** | Digital India / MeitY | Hindi Speech Synthesis (TTS) | On-demand REST | **NOT CONFIGURED** (Graceful fallback to Web Speech API) |

---

## 14. Accessibility Requirements (WCAG 2.1 AA)

1. **48px Minimum Touch Targets:** All interactive buttons, tabs, dropdowns, and drawer triggers must satisfy $\ge 48\text{px} \times 48\text{px}$ touch targets.
2. **Keyboard Focus Rings:** Explicit `:focus-visible` styling (`ring-2 ring-[#0E7490] ring-offset-2`).
3. **Screen Reader Landmarks:** Proper semantic tags (`<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`, `<dialog role="dialog">`).
4. **Dialog Accessibility:** Accessible modals/drawers (`ProvenanceDrawer`, `BulletinModal`) with `aria-modal="true"`, focus trapping, and `Escape` key close handlers.
5. **High Color Contrast:** All text must meet WCAG 2.1 AA contrast ratios ($\ge 4.5:1$ for normal text against `#F3F6F7` and `#FFFFFF`).
6. **Data Visualizations:** All charts, SVG diagrams, and risk bars must include `aria-label` or accessible text tables for screen reader users.
7. **Reduced Motion:** Support `prefers-reduced-motion: reduce` across all transitions and slide-out drawers.

---

## 15. Test Migration Strategy

### Current Repository Test Count: **382 Automated Tests**
- **Frontend Vitest Suite:** 19 test files, **88 tests (100% passing)**.
- **Backend Vitest Suite:** 11 test files, **92 tests (100% passing)**.
- **ML Service Pytest Suite:** 57 test files, **202 tests (100% passing)**.

### Target Test Suite Structure:
1. **Frontend Tests:** Remain 100% intact with Vitest + React Testing Library. Update API mock adapters to mock Axios instead of native `fetch`.
2. **Backend Tests:** Migrate integration tests from PostgreSQL mock to `mongodb-memory-server` in Vitest. Maintain 100% coverage across all 58 endpoints.
3. **ML Service Tests:** Remain untouched in Python Pytest.
4. **End-to-End Persona Verification:** Validate full user workflows (Farmer login → forecast inspection → advisory reading → What-If simulation).

---

## 16. Performance Risks & Mitigations

| Subsystem | Risk | Mitigation |
|---|---|---|
| **Geospatial Point-in-Polygon** | Latency on high-vertex MultiPolygons during block resolution. | Pre-index boundaries with MongoDB `2dsphere` indexes. Cache resolved blocks in memory. |
| **Leaflet GIS Map Rendering** | Heavy GeoJSON payloads causing DOM lag on mobile. | Simplify boundary polygon vertices with Douglas-Peucker algorithm ($<100\text{KB}$ per block boundary). |
| **ML Inference Latency** | LightGBM/SHAP execution exceeding HTTP request thresholds. | Pre-compute and cache daily forecast runs in MongoDB. Use asynchronous job queues for ad-hoc simulations. |
| **Duplicate API Requests** | React components re-fetching `/forecasts/status` on every render. | Implement client-side query caching or Zustand store memoization. |

---

## 17. Security Risks & Hardening

1. **Authentication:** Implement bcrypt password hashing with minimum 10 rounds. Enforce JWT expiration (24h) with secure signature algorithms.
2. **Rate Limiting:** Protect `/api/v1/auth/login` and `/api/v1/auth/register` with strict rate limits (10 req/15 min). Protect simulation endpoints with 30 req/min limits.
3. **Data Sanitization:** Sanitize all incoming request payloads using Zod schemas to prevent NoSQL query injection (e.g. `$where`, `$gt` injection attacks in MongoDB).
4. **Security Headers:** Enforce Helmet security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
5. **CORS:** Restrict allowed CORS origins to trusted frontend domains in production.

---

## 18. Migration Risk Classification

| Subsystem | Risk Level | Rationale | Contingency Plan |
|---|---|---|---|
| **PostgreSQL → MongoDB Migration** | **CRITICAL** | Transitioning 24 tables to MongoDB while preserving spatial queries and relational referential integrity. | Maintain dual-repository interface; validate with `mongodb-memory-server` tests before deprecating PostgreSQL. |
| **Geospatial Point-in-Polygon** | **HIGH** | PostGIS `ST_Contains` replaced with MongoDB `$geoIntersects`. | Implement robust GeoJSON validation; ensure coordinates follow `[longitude, latitude]` order. |
| **Authentication & RBAC** | **HIGH** | Transitioning to authoritative backend guards without breaking client session state. | Implement persistent JWT tokens with backwards-compatible payload claims. |
| **ML Service Communication** | **MEDIUM** | Network latency between Node.js gateway and Python FastAPI. | Configure HTTP keep-alive, connection pooling, and circuit breaker fallbacks. |
| **State Management Sync** | **LOW** | Maintaining 7-day default horizon across Zustand stores. | Retain existing store contracts and test suites. |
| **Frontend Visual System** | **LOW** | Design system already finalized and locked in Phase 9. | Zero modifications to CSS tokens, colors, or typography. |

---

## 19. Data Migration Strategy

### Step-by-Step Seed & Migration Pipeline:
1. **Schema Initialization:** Execute Mongoose connection script creating collections and `2dsphere` spatial indexes.
2. **Administrative Hierarchy Ingestion:** Seed Uttar Pradesh administrative hierarchy (State → Lucknow District → Bakshi Ka Talab / Mohanlalganj / Malihabad Blocks → Gram Panchayats → Villages).
3. **Geospatial Boundaries Conversion:** Ingest GeoJSON MultiPolygon boundary features into `geographic_boundaries` with `2dsphere` indexing.
4. **User & RBAC Seeding:** Seed default demo accounts across all 5 roles (`farmer@varshasetu.org`, `officer@varshasetu.org`, `gov@varshasetu.org`, `analyst@varshasetu.org`, `admin@varshasetu.org`) with hashed passwords.
5. **Scientific Archive Seeding:** Seed historical Kharif 2024 forecasts, calibrated advisories, and baseline datasets.

---

## 20. Target Directory Structure

```
VarshaSetu/
├── client/                     # Frontend Application (React 18 + Vite)
│   ├── src/
│   │   ├── components/         # 68 Audited Components (ui, common, viz, maps, personas)
│   │   ├── pages/              # Persona Pages (public, farmer, officer, gov, analyst, admin)
│   │   ├── layouts/            # RootLayout, FarmerLayout, OfficerLayout, AnalystLayout
│   │   ├── stores/             # useAppStore, useFarmerStore, useOfficerStore
│   │   ├── services/           # Axios API services (auth, forecast, advisory, model, geo)
│   │   ├── i18n/               # Multi-language translations (en.json, hi.json)
│   │   ├── types/              # Client-side TypeScript definitions
│   │   ├── index.css           # Neo-brutalist styling & Tailwind tokens
│   │   └── App.tsx             # React Router canonical routes & guards
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend API Gateway (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Environment, MongoDB connection, logger
│   │   ├── controllers/        # Express controllers (auth, forecast, advisory, geo, etc.)
│   │   ├── middleware/         # requireAuth, requireRole, rateLimit, errorMiddleware
│   │   ├── models/             # 16 Mongoose Schemas & 2dsphere Indexes
│   │   ├── routes/             # Express API routes (/api/v1/*)
│   │   ├── services/           # Gateway services & ML Service proxy client
│   │   ├── validators/         # Zod request payload schemas
│   │   ├── seeds/              # MongoDB administrative & demo seed scripts
│   │   └── app.ts              # Express application configuration
│   ├── package.json
│   └── tsconfig.json
│
├── ml-service/                 # Scientific Python Service (FastAPI)
│   ├── app/
│   │   ├── agronomy/           # Phenological rules & advisory generator
│   │   ├── calibration/        # Platt Scaling & Isotonic Regression
│   │   ├── hindcasting/        # Multi-year temporal cross-validation
│   │   ├── explainability/     # SHAP tree feature attribution
│   │   ├── forecast/           # Probability ensemble generation
│   │   └── main.py             # FastAPI endpoints (Port 8000)
│   └── requirements.txt
│
├── shared/                     # Shared TypeScript contracts & schemas
│   └── types/                  # UserRole, PermissionScope, ForecastRecord, etc.
│
├── docs/                       # Architectural specifications & audits
├── docker-compose.yml          # Container orchestration (Client, Server, Mongo, ML)
├── .env.example                # Unified environment variables template
└── README.md                   # Project documentation
```

---

## 21. Environment Variables Template

```bash
# ==============================================================================
# VARSHASETU — UNIFIED MERN ENVIRONMENT CONFIGURATION
# ==============================================================================

# Server (Node.js / Express)
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:5173

# Database (MongoDB)
MONGODB_URI=mongodb://localhost:27017/varshasetu
MONGODB_TEST_URI=mongodb://localhost:27017/varshasetu_test

# Authentication & Security
JWT_SECRET=super_secret_varshasetu_jwt_signing_key_min_32_chars!
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10

# Scientific ML Microservice Gateway
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT_MS=15000

# Client (Vite)
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_MODE=development
VITE_DEFAULT_LANGUAGE=hi

# Scientific Service (Python / FastAPI)
FASTAPI_PORT=8000
FASTAPI_HOST=0.0.0.0
SCIENTIFIC_MODE=DIAGNOSTIC_ONLY
MODEL_ARTIFACTS_DIR=artifacts
DATA_DIR=data
```

---

## 22. Dependency Changes

### Backend Dependencies to Add:
- `mongoose`: `^8.8.4` (MongoDB ODM with TypeScript support)
- `socket.io`: `^4.8.1` (Real-time alert events and ingestion streaming)
- `axios`: `^1.7.9` (HTTP client for resilient ML service proxying)

### Backend Dependencies to Remove (Post-Migration):
- `pg`: `^8.13.1` (PostgreSQL client)
- `@types/pg`: `^8.11.10`

### Frontend Dependencies to Add:
- `axios`: `^1.7.9` (Standardized HTTP client replacing raw `fetch`)
- `socket.io-client`: `^4.8.1` (Real-time alert event listeners)

---

## 23. Migration Execution Order (Phases 1–6)

```
Phase 0: Complete Repository Audit & Migration Blueprint [THIS PHASE - LOCKED]
   │
   ▼
Phase 1: MongoDB Database Layer & Mongoose Models
   • Implement 16 Mongoose models, GeoJSON 2dsphere indexes, and migration seed scripts.
   │
   ▼
Phase 2: Node.js Express Gateway & Authoritative RBAC
   • Replace PostgreSQL repositories with Mongoose services.
   • Implement secure JWT authentication and authoritative role middlewares.
   │
   ▼
Phase 3: Scientific ML Service Gateway Integration
   • Connect Express controllers to FastAPI ML microservice with circuit-breaker proxying.
   │
   ▼
Phase 4: Frontend API Layer & Protected Route Guards
   • Migrate frontend services to Axios with JWT interceptors.
   • Add `<ProtectedRoute />` guards for all 4 operational perspectives.
   │
   ▼
Phase 5: Real-Time Event System (Socket.IO) & Alerts
   • Implement real-time risk alerts and ingestion status broadcasting.
   │
   ▼
Phase 6: End-to-End Verification & Production Readiness
   • Verify 100% passing test suites across Client, Server, and ML service.
   • Clean production build and docker-compose deployment.
```

---

## 24. Rollback Strategy

1. **Dual Persistence Abstraction:** During initial migration steps, backend repositories maintain an abstraction layer capable of switching between MongoDB and PostgreSQL via configuration flag `PERSISTENCE_DRIVER=mongodb|postgres`.
2. **Zero In-Place Destruction:** Existing PostgreSQL schemas and migration files remain archived in `backend/src/db/migrations/` until Phase 6 sign-off.
3. **Git Checkpoint Isolation:** Each migration phase will be encapsulated in dedicated, discrete commits allowing immediate rollback if regressions occur.

---

## 25. Definition of Done for MERN Migration

The MERN migration will be declared complete when:
1. **Zero PostgreSQL Dependencies:** The backend runs without requiring PostgreSQL or PostGIS, with all data stored in MongoDB.
2. **100% Functional Parity:** All 4 operational perspectives (Farmer, Officer, Government, Analyst) operate seamlessly with identical UI and scientific behavior.
3. **100% Visualization Integrity:** All Phase 7 charts and Phase 9 scientific evidence panels render real MongoDB/ML data with zero regressions.
4. **100% Passing Tests:** All 382 automated tests (Frontend, Backend, ML) pass with zero errors.
5. **Zero Fabrication:** Unconfigured telemetry continues to display `"NOT CONFIGURED"` or `"NOT AVAILABLE IN CURRENT PIPELINE"`.
6. **Zero TypeScript / Build Errors:** Clean builds on both client and server.

---

**AUDIT COMPLETE & SIGNED OFF.**
