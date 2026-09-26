# VarshaSetu (वर्षासेतु)
> *From climate signals to confident farm decisions.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: 473 Passing](https://img.shields.io/badge/Tests-473%20Passing-brightgreen.svg)](#testing)
[![Stack: MERN + Python FastAPI](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20MongoDB%20%7C%20FastAPI-0E7490.svg)](#technology-stack)
[![Architecture: One Scientific Layer](https://img.shields.io/badge/Architecture-One%20Scientific%20Layer-102A43.svg)](#core-architecture)

---

## Overview

**VarshaSetu (वर्षासेतु)** is an agro-meteorological intelligence and scientific decision-support platform designed to bridge the operational gap between planetary atmospheric science and village-level farm management. 

Operating at block and gram panchayat resolutions across India, VarshaSetu translates medium-range (7–30 day) probabilistic precipitation and monsoon signals into actionable, crop-phenology-specific advisories, ground-truth field inspection workflows, regional policy matrices, and multi-year hindcast validation laboratories.

---

## Problem

Smallholder rainfed farmers face extreme climate volatility during the critical Indian Kharif and Rabi seasons. Conventional weather forecasts suffer from several operational shortcomings:
1. **Binary Determinism:** Treating rainfall as a certain binary event rather than a calibrated probabilistic distribution leads to false security or premature panic during sowing and transplanting.
2. **Spatial Misalignment:** Synoptic district-level bulletins overlook micro-climatic block and panchayat topographical variances.
3. **Decoupled Agronomy:** Meteorological numbers (e.g. "65mm rain") are presented without phenological context (e.g. what 65mm means for 14-day transplanted paddy seedlings versus flowering mustard).
4. **Lack of Explainability & Lineage:** Black-box predictions offer farmers and agricultural extension officers no inspectable provenance, calibration reliability, or uncertainty bounds.

---

## Solution

VarshaSetu solves this by establishing a unified scientific data pipeline that couples multi-model atmospheric downscaling with agronomic safety gates:
- **Calibrated Probabilistic Forecasting:** Converts raw ensembles into reliable probabilities ($P(\text{event})$) with explicit uncertainty spreads ($P_{10}–P_{90}$) and climatological reference baselines.
- **Crop-Stage Risk Sensitivity:** Automatically maps predicted moisture anomalies against critical phenological growth stages (nursery, tillering, flowering, maturity).
- **Interactive "What-If" Decision Simulation:** Equips farmers to test operational decisions—such as delaying sowing by 7–14 days or adjusting irrigation—before committing capital in the field.
- **End-to-End Scientific Trust Layer:** Discloses observational provenance (IMD AWS, INSAT-3DR, ERA5 Reanalysis), model architecture, Expected Calibration Error (ECE), and verification hashes on every advisory card.

---

## Core Architecture

VarshaSetu follows the architectural principle:

$$\text{ONE SCIENTIFIC LAYER} \longrightarrow \text{FOUR OPERATIONAL PERSPECTIVES}$$

The unified scientific intelligence layer computes probabilistic forecasts, atmospheric feature attributions, and agronomic risk gates once. Four tailored operational perspectives then project this single source of truth according to user needs:

```
                      ┌───────────────────────────────────────┐
                      │        ONE SCIENTIFIC LAYER           │
                      │  • Calibrated Multi-Model Ensembles   │
                      │  • Platt & Isotonic ECE Reliability   │
                      │  • SHAP Local Feature Attribution     │
                      │  • Multi-Year Cross-Validation Folds  │
                      └───────────────────┬───────────────────┘
                                          │
            ┌───────────────────┬─────────┴─────────┬───────────────────┐
            ▼                   ▼                   ▼                   ▼
    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
    │ 1. FARMER     │   │ 2. OFFICER    │   │ 3. GOVERNMENT │   │ 4. ANALYST    │
    │ Panchayat-lvl │   │ Block cluster │   │ Statewide GIS │   │ Probabilistic │
    │ advisories in │   │ heatmaps, KVK │   │ risk matrices,│   │ forecast lab, │
    │ Hindi/English,│   │ agromet draft │   │ departures &  │   │ reliability   │
    │ What-If sowing│   │ bulletins,    │   │ contingency   │   │ diagrams,     │
    │ simulators.   │   │ inspections.  │   │ planning.     │   │ model drift.  │
    └───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘
```

---

## Key Capabilities

### 1. Farmer Perspective
- **Calibrated 7–30 Day Forecasts:** Block-level precipitation risk, dry-spell onset hazard, and temperature anomaly curves.
- **Crop-Specific Advisories:** Dynamic recommendations for Paddy, Maize, Mustard, Wheat, and Potato across nursery, transplanting, tillering, and harvesting stages.
- **Interactive What-If Simulator:** Scenario simulator evaluating the agronomic impact of shifting sowing dates by $+7$ to $+21$ days.
- **Bilingual & Voice Accessibility:** Full Hindi and English translation with speech synthesis fallback.

### 2. Field Officer Perspective
- **Spatial Block Monitoring:** Geospatial GIS choropleth layers across administrative block boundaries.
- **Agromet Advisory Bulletins:** Authoring, validating, and broadcasting localized agromet bulletins for block distribution.
- **Ground Truth Inspections:** Geo-tagged field observation logs linking farmer reports to automated weather station readings.

### 3. Government Perspective
- **Regional Risk Matrix:** Unified multi-block status grid tracking rainfall departures and spatial moisture anomalies.
- **Disaster Mitigation Oversight:** Early watch/warning indicators for prolonged monsoon breaks and waterlogging hazards.
- **Operational Health Telemetry:** Real-time visibility into AWS sensor uptime, data freshness, and regional ingestion status.

### 4. Climate Analyst Perspective
- **Probabilistic Forecast Lab:** Interactive model inference generator for custom coordinates, horizons, and risk thresholds.
- **Calibration & Reliability Benchmarks:** Comparative curves for Platt Scaling, Isotonic Regression, Expected Calibration Error ($ECE$), and Brier Skill Scores ($BSS$).
- **Model Explainability (SHAP):** Non-causal feature attributions identifying moisture convergence, synoptic wind vorticity, and thermodynamic instability contributions.
- **Multi-Year Hindcast Validation:** Temporal cross-validation splits ($2014–2024$) verifying stability and detecting covariate drift.

---

## Scientific Evidence & Explainability

VarshaSetu is built on transparency and scientific accountability, answering four core questions across every interface:

| Question | Scientific Evidence Metric | Implementation Component |
|---|---|---|
| **WHAT** is the system showing? | Event probability ($P(\text{event})$), confidence tier (`HIGH/MED/LOW`), uncertainty spread ($P_{10}–P_{90}$), climatology normal deviation. | `ConfidenceIndicator` |
| **WHY** is it showing this signal? | Domain-grouped atmospheric drivers (Moisture, Synoptic Wind, Instability, Antecedent Rain) with SHAP attribution weights. Non-causal diagnostic disclosure. | `SignalExplanation` |
| **WHERE** did the data come from? | Observational lineage: IMD AWS stations, INSAT-3DR satellite, ERA5 reanalysis, spatial resolution ($5.5\text{ km}$), pipeline latency, SHA-256 verification hash. | `ProvenanceDrawer` |
| **HOW CONFIDENT** should you be? | Model architecture, calibration method (Isotonic / Platt), Expected Calibration Error ($ECE$), Brier Skill Score ($BSS$), holdout sample size ($N$). | `ScientificEvidencePanel` |

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT PRESENTATION TIER (React 18)                  │
│   • Vite, TypeScript, Tailwind CSS, React Router v6, Zustand, i18next  │
│   • Neo-Brutalist Climate Intelligence Editorial Theme                 │
│   • Leaflet GIS Maps, Phase 7 Triad & Phase 9 Trust Components         │
│   • Real-Time Socket.IO Client with Auto-Reconnection & Status Badges  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST (/api/v1) & WSS (/socket.io)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               APPLICATION GATEWAY TIER (Node.js + Express)             │
│   • Express REST API Gateway & Socket.IO Real-Time Server Engine       │
│   • Authoritative Role-Based Access Control (RBAC) & Handshake Auth    │
│   • Authoritative Room Segmentation (user, role, block, system)        │
│   • Mongoose 8.x ODM with GeoJSON 2dsphere Spatial Indexing            │
│   • Security Hardening (Helmet, Rate Limiting, Zod Request Validation) │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ Mongoose ODM                   │ Internal HTTP (Keep-Alive)
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│         PERSISTENCE (MongoDB)        │  │     SCIENTIFIC ML TIER       │
│ • MongoDB 7.0+ Persistence           │  │ • Python 3.11 + FastAPI      │
│ • 16 Optimized Collections           │  │ • LightGBM, XGBoost, Scikit  │
│ • GeoJSON 2dsphere Spatial Queries   │  │ • Platt & Isotonic Calibrator│
│ • Embedded Subdocuments for Audits   │  │ • SHAP TreeExplainer Core    │
│ • Zero Data Fabrication Defaults     │  │ • Multi-Year Hindcast Folds  │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

---

## Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Zustand, Axios, Socket.IO Client, Leaflet, Lucide React, i18next, Vitest.
- **Backend:** Node.js (>=20.0.0), Express, Socket.IO Server, TypeScript, Mongoose (MongoDB ODM), Zod, JSON Web Tokens (JWT), bcryptjs, Helmet, Morgan, Vitest.
- **Database:** MongoDB 7.0+ (GeoJSON `2dsphere` spatial indexing, document embedding, schema validation).
- **Scientific ML Microservice:** Python 3.11, FastAPI, Uvicorn, LightGBM, XGBoost, Scikit-learn, SHAP, NumPy, Pandas, NetCDF4, Pytest.
- **Maps & Visualization:** Leaflet GIS with GeoJSON choropleth layers, custom SVG uncertainty bands, and probability density curves.
- **Security & Authorization:** Cryptographic JWT tokens, bcrypt password hashing, granular RBAC middlewares, Socket handshake auth, and Helmet HTTP protections.

---

## Application Structure

```
VarshaSetu/
├── backend/                     # Node.js Express Application Server
│   ├── src/
│   │   ├── config/              # Database connection & environment configuration
│   │   ├── controllers/         # Express controllers (auth, forecast, advisory, etc.)
│   │   ├── db/
│   │   │   ├── migrations/      # Historical PostgreSQL migration reference files
│   │   │   └── seeds/           # MongoDB development seed script (mongoSeed.ts)
│   │   ├── middleware/          # requireAuth, requireRole, rateLimit, error handling
│   │   ├── models/              # 16 Mongoose Schemas (User, Geography, Forecast, etc.)
│   │   ├── realtime/            # Socket.IO server, handshake auth, room segmentation, events
│   │   ├── repositories/        # Persistence repositories
│   │   ├── routes/              # Express API route modules (/api/v1/*)
│   │   └── server.ts            # Application bootstrap with Socket.IO attachment
│   └── tests/                   # Backend Vitest integration & unit test suites (154 tests)
│
├── frontend/                    # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/          # Modular components (ui, viz, maps, landing, personas, realtime)
│   │   ├── layouts/             # RootLayout, FarmerLayout, OfficerLayout, AnalystLayout
│   │   ├── pages/               # Persona pages (public, farmer, officer, gov, analyst)
│   │   ├── services/            # Frontend API client, socketClient singleton & domain services
│   │   ├── stores/              # Zustand stores (useAppStore, useFarmerStore, useRealtimeStore)
│   │   └── tests/               # Frontend Vitest suites (117 tests)
│   └── vite.config.ts
│
├── ml-service/                  # Scientific Python FastAPI Microservice (202 tests)
│   ├── app/
│   │   ├── agronomy/            # Phenological rules & advisory generator
│   │   ├── calibration/         # Platt Scaling & Isotonic Regression engines
│   │   ├── forecast/            # Multi-target probability ensemble generator
│   │   ├── hindcasting/         # Multi-year temporal cross-validation folds
│   │   └── main.py              # FastAPI microservice endpoints
│   └── tests/                   # Pytest scientific test suites
│
├── docs/                        # Complete technical architecture specifications
├── .env.example                 # Environment configuration template
└── README.md                    # Project documentation
```

---

## Installation

### Prerequisites
- **Node.js:** v20.0.0 or higher
- **Python:** v3.11.0 or higher
- **MongoDB:** v7.0 or higher (local daemon or MongoDB Atlas)

### Setup Commands

```bash
# Clone the repository
git clone https://github.com/samxsingh/VarshaSetu.git
cd VarshaSetu

# 1. Install Backend Dependencies
cd backend
npm install

# 2. Install Frontend Dependencies
cd ../frontend
npm install

# 3. Setup Python ML Environment
cd ../ml-service
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

---

## Environment Variables

Copy `.env.example` to `.env` in both `backend/` and `ml-service/`:

```bash
# Backend Environment Configuration (backend/.env)
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/varshasetu
MONGODB_DB_NAME=varshasetu
JWT_SECRET=your_secure_development_jwt_secret_key_32chars!
FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000

# Frontend Configuration (frontend/.env)
VITE_API_BASE_URL=http://localhost:5001/api/v1

# ML Service Configuration (ml-service/.env)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/varshasetu
FASTAPI_PORT=8000
ENVIRONMENT=development
```

---

## Running Locally

To run all tiers concurrently for local development:

```bash
# Terminal 1: MongoDB Service (if running locally)
mongod --dbpath /path/to/data/db

# Terminal 2: Node.js Express Gateway Server
cd backend
npm run seed:mongo   # Ingests Lucknow BKT demonstration hierarchy, stations & models
npm run dev          # Starts on http://localhost:5001

# Terminal 3: Python FastAPI Scientific Service
cd ml-service
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 4: React Vite Frontend Portal
cd frontend
npm run dev          # Starts on http://localhost:5173
```

---

## API Architecture

The Node.js Express server acts as the authoritative application gateway mounted under `/api/v1`. The frontend communicates exclusively with Express, which proxies compute workloads to FastAPI:

- `/api/v1/auth` — Registration, JWT login, profile fetching, logout.
- `/api/v1/geography` — Administrative hierarchy and GeoJSON `$geoIntersects` point-in-polygon resolution.
- `/api/v1/forecasts` — Calibrated probabilistic forecast queries and generation.
- `/api/v1/events` — Detection, lifecycle state transitions, and alert center feeds.
- `/api/v1/advisories` — Crop phenology advisory evaluations, dismissals, and multilingual deliveries.
- `/api/v1/agronomy/scenarios` — What-If sensitivity runs, parameter response curves, and comparative deltas.
- `/api/v1/models` — ML registry, Platt/Isotonic calibration curves, and hindcast stability metrics.
- `/api/v1/data-health` — Observational sensor health, provider statuses, and ingestion quality logs.

---

## Database Architecture

The persistence tier utilizes **16 Mongoose collections** with strict schema validation:

1. `users` — Authentication credentials, role enums, permission scopes.
2. `geography` — Administrative hierarchy and GeoJSON MultiPolygon boundaries with `2dsphere` indexes.
3. `stations` — Automatic Weather Stations (AWS) with GeoJSON Point coordinates.
4. `telemetry` — Ingested surface meteorological time-series observations.
5. `forecasts` — Calibrated forecasts with triad indicators and uncertainty intervals.
6. `forecast_runs` — Forecast generation jobs and lifecycle transitions.
7. `events` — Scientific risk alert events with transition audit history.
8. `advisories` — Agronomic advisories with embedded bilingual translations.
9. `crops` — Crop phenology definitions and growth stage sensitivities.
10. `scenarios` — What-If decision simulation runs, response curves, and deltas.
11. `models` — Machine learning model registry, ECE scores, and calibration curves.
12. `provenance` — Immutable evidence ledger detailing data lineage and hashes.
13. `data_health` — External meteorological providers and data quality reports.
14. `notifications` — Multi-channel notification preferences and simulated delivery logs.
15. `localizations` — Agromet dictionary and bilingual template catalog.
16. `audit_logs` — Immutable regulatory security and operational action logs.

---

## Scientific Methodology

1. **Probabilistic Calibration:** Raw multi-model ensemble probabilities are calibrated against a 10-year IMD ground-truth holdout using Platt Scaling and Isotonic Regression, minimizing Expected Calibration Error ($ECE \le 0.038$).
2. **Uncertainty Quantification:** Rather than a point estimate, forecasts compute explicit non-parametric quantile spreads ($P_{10}$, $P_{50}$, $P_{90}$) and climatological baseline departures.
3. **Multi-Year Hindcasting:** Models are evaluated across temporal leave-one-year-out cross-validation folds ($2014–2024$), calculating Brier Skill Scores ($BSS$) relative to climatological reference baselines.
4. **SHAP Feature Attribution:** TreeExplainer SHAP values disclose local atmospheric contributions accompanied by non-causal diagnostic disclaimers.

---

## Data Integrity

VarshaSetu adheres to a strict **Zero-Fabrication Policy**:
- Missing or unobserved sensor telemetry strictly defaults to `null` or explicit status indicators: `"NOT CONFIGURED"` or `"NOT AVAILABLE IN CURRENT PIPELINE"`.
- The system **never** replaces unmeasured parameters with zero, false, or simulated approximations without transparent labeling.
- All pilot demonstration records are explicitly tagged: `isDemo: true`, `operationalStatus: "DIAGNOSTIC_ONLY"`.

---

## Security

- **Authentication:** Stateless JSON Web Tokens (JWT) with configurable expiration and secure signature algorithms.
- **Password Security:** Passwords hashed with `bcryptjs` (salt rounds $\ge 10$).
- **Role-Based Access Control (RBAC):** Authoritative backend verification (`requireAuth`, `requireRole`, `requirePermission`) across all five personas.
- **Defense in Depth:** Helmet security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`), request rate limiting on authentication and simulation routes, and strict Zod request validation.

---

## Testing

VarshaSetu maintains a comprehensive test suite across all three tiers:

```bash
# Run Backend Tests (154 Tests Passing across 15 suites)
cd backend
npm test -- --run

# Run Frontend Tests (117 Tests Passing across 21 suites)
cd frontend
npm test -- --run

# Run ML Service Tests (202 Tests Passing)
cd ml-service
source venv/bin/activate
pytest
```

**Total Automated Coverage:** **473 Automated Tests (100% Passing)** across the repository.

---

## Project Status

- [x] **Global Visual Theme & Editorial System** — Neo-brutalist climate intelligence design system with accessible contrast and touch targets.
- [x] **Scientific Visualization Framework** — Phase 7 triad metrics, uncertainty spreads, and timeline instrumentation.
- [x] **Evidence & Explainability Trust Layer** — Phase 9 WHAT, WHY, WHERE, and HOW CONFIDENT ledger and slide-out provenance drawers.
- [x] **Repository Audit & Migration Blueprint (Phase 0)** — Complete architectural audit (`docs/MERN-MIGRATION-AUDIT.md`).
- [x] **MongoDB Persistence Layer (Phase 1)** — 16 Mongoose models, GeoJSON 2dsphere indexing, controlled seed pipeline, and unit tests (`docs/MONGO-DATA-MODEL.md`).
- [x] **Node.js/Express API Gateway & RBAC (Phase 2)** — Authoritative REST API gateway with 5-role RBAC (`docs/PHASE-2-API-MIGRATION.md`).
- [x] **Scientific ML Service Gateway (Phase 3)** — Express gateway proxy to Python FastAPI ML computation engine (`docs/PHASE-3-ML-GATEWAY.md`).
- [x] **Frontend MERN Integration (Phase 4)** — React/Vite migration with Axios API client, Zustand stores, and full persona alignment (`docs/PHASE-4-FRONTEND-MIGRATION.md`).
- [x] **Real-Time Operational Infrastructure (Phase 5)** — Socket.IO bidirectional event sync, room segmentation, and reactive telemetry (`docs/PHASE-5-REALTIME.md`).

---

## Roadmap

- **Expanded Agro-Climatic Zones:** Scaling boundary definitions and station mesonets beyond Uttar Pradesh to Maharashtra, Karnataka, and Punjab.
- **Direct IMD AWS Integration:** Transitioning from historical Kharif reanalysis to automated real-time IMD API ingestion pipelines.
- **Edge Deployment & PWA Offline Sync:** Offline-first caching of block advisory cards for remote village connectivity.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
