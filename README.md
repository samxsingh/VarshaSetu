# VarshaSetu (वर्षासेतु)
> *“From climate signals to confident farm decisions.”*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Phase 4B Complete](https://img.shields.io/badge/Status-Phase%204B%20Complete-emerald.svg)](#roadmap)
[![Stack: TypeScript & Python](https://img.shields.io/badge/Stack-TypeScript%20%7C%20Python%203.11-slate.svg)](#technology-stack)

---

## 1. Project Overview

**VarshaSetu** is a production-oriented, hyperlocal monsoon intelligence and agricultural decision-support platform designed for Indian smallholder and rainfed farmers, extension officers, and agricultural planners.

Operating at the critical block and gram panchayat scale, VarshaSetu bridges the gap between planetary climate modulators (El Niño-Southern Oscillation, Indian Ocean Dipole, Madden-Julian Oscillation) and village-level farm decisions. Rather than presenting generic daily weather forecasts or raw meteorological charts, VarshaSetu delivers **calibrated, probabilistic medium-range (7–30 day) forecasts** translated into **crop-stage-specific agronomic advice** and **interactive "what-if" risk simulations**.

---

## 2. Quickstart & Local Development

### Prerequisites
- Node.js 20+ LTS
- Python 3.11+
- PostgreSQL 16+ (with PostGIS extension)

### 1. Backend Core (Node.js / Express / PostGIS)
```bash
cd backend
npm install
npm run migrate   # Applies 7 migrations (geography, auth, sources, ingestion)
npm run seed      # Seeds demonstration administrative hierarchy & demo users
npm test          # Runs 35 API, RBAC, and model benchmark tests
npm run dev       # Starts backend API on http://localhost:5001
```

### 2. Meteorological ML & Ingestion Service (Python 3.11 / FastAPI)
```bash
cd ml-service
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pytest            # Runs 36 provider, tree ensemble, and SHAP explainability tests
uvicorn app.main:app --port 8000 --reload  # Starts ML service on http://localhost:8000
```

### 3. Frontend Web Shell (React 18 / Vite / Tailwind)
```bash
cd frontend
npm install
npm test          # Runs 9 UI, accessibility, and analyst benchmark tests
npm run dev       # Starts Vite dev server on http://localhost:5173
```

---

## 3. Comprehensive Documentation

- **[Product Requirements (PRD)](docs/PRD.md):** 28 sections detailing user personas, 4 forecast targets, and agronomic logic.
- **[System Architecture](docs/architecture.md):** 23 sections covering data flows, PostGIS schemas, ML ensemble architecture, and security.
- **[ML Downscaling & Tree Ensembles](docs/ml-downscaling.md):** XGBoost/LightGBM ensembles, spatial downscaling guardrails, multi-model benchmarking, and SHAP explainability.
- **[Scientific Data Catalog](docs/scientific-data-catalog.md):** Specification of ENSO, IOD, MJO, and ERA5-Land variables, physical bounds QC, and derived features.
- **[Data Pipeline Architecture](docs/data-pipeline.md):** End-to-end ingestion lifecycle, retry policies, Parquet storage, and PostgreSQL tracking.
- **[Provider Integration Guide](docs/provider-integration.md):** Connection contracts, parsing protocols, and rate-limiting resilience for NOAA, BoM, and Open-Meteo.
- **[Design System Guidelines](docs/design-system.md):** Color tokens, typography, accessibility (WCAG AA), and component hierarchy.
- **[REST API Specification](docs/api.md):** Complete `/api/v1` endpoint guide with request/response schemas and examples.
- **[Database & Geospatial Engine](docs/database.md):** PostgreSQL/PostGIS schemas, spatial indexing, migrations, and seed credentials.
- **[Project Progress Tracker](docs/progress.md):** Up-to-date roadmap, phase milestones, and completed features.

---

## 2. Core Problem Being Solved

1. **The Spatial Resolution Gap:** Planetary and regional climate models produce outputs at 12–25 km resolutions or district-wide aggregates. This misses localized microclimates, rain shadows, and convective break patterns across blocks and panchayats.
2. **False Onsets & Break Monsoons:** A premature rain surge followed by a 15-day dry spell (break monsoon) desiccates newly germinated seeds, causing devastating financial loss for rainfed farmers.
3. **Lack of Agronomic Context:** Farmers do not need raw rainfall millimeters; they need to know whether to sow now or wait 7 days, how to prepare for prolonged dry spells, and when to conserve supplemental irrigation.

---

## 3. Product Architecture Overview

```
GLOBAL CLIMATE SIGNALS (ENSO, IOD, MJO)
         ↓
REGIONAL ATMOSPHERIC DATA (SST, MSLP, Winds, Humidity)
         ↓
HISTORICAL WEATHER & HIGH-RES CLIMATOLOGY
         ↓
SPATIAL & STATISTICAL DOWNSCALING (PostGIS + ML Pipelines)
         ↓
BLOCK / PANCHAYAT PROBABILISTIC FORECAST (7, 14, 21, 30 Days)
         ↓
EXPLAINABLE AGRONOMIC RULE INFERENCE ENGINE
         ↓
LOCALIZED CROP ADVISORY & WHAT-IF SIMULATOR
         ↓
FARMER DECISION SUPPORT (Mobile PWA / Voice / Multilingual)
```

---

## 4. Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript (Strict Mode)
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Custom editorial/scientific design system)
- **State Management:** `@tanstack/react-query` & `zustand`
- **Routing:** React Router v6
- **Localization:** `react-i18next` (Initial support: Hindi & English)
- **Icons:** `lucide-react`

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js with TypeScript
- **Validation:** Zod
- **Authentication & RBAC:** Stateless JWT with server-enforced role permissions
- **Background Jobs:** BullMQ + Redis

### Geospatial & Database
- **Primary Database:** PostgreSQL 16
- **Spatial Engine:** PostGIS 3.4 (`GEOMETRY(MultiPolygon, 4326)`, GiST spatial indexing)
- **Caching Layer:** Redis 7.2

### Machine Learning & Analytics
- **Language & Runtime:** Python 3.11+
- **API Framework:** FastAPI with Uvicorn
- **Scientific Stack:** NumPy, pandas, xarray, scikit-learn, XGBoost, LightGBM
- **Evaluation Standards:** Brier Skill Score (BSS), Isotonic Probability Calibration, Climatology Benchmarking

---

## 5. Repository Structure

```
VarshaSetu/
├── .env.example                # Environment configuration template
├── .gitignore                  # Git exclusion rules
├── README.md                   # Project overview & developer guide
├── docs/                       # Comprehensive specifications
│   ├── PRD.md                  # Product Requirements Document (28 sections)
│   ├── architecture.md         # Technical Architecture Document (23 sections)
│   └── progress.md             # Phase progress & milestones
├── shared/                     # Cross-tier TypeScript interfaces & contracts
│   └── types/
│       ├── core.ts             # API response envelopes, DataMode, statuses
│       ├── geography.ts        # Hierarchy: State->District->Block->Panchayat
│       ├── climate.ts          # ENSO, IOD, MJO signals & observations
│       ├── forecast.ts         # Probabilistic outlooks & 4 forecast targets
│       ├── advisory.ts         # Crops, growth stages, what-if simulations
│       ├── auth.ts             # RBAC roles & permissions
│       └── index.ts            # Unified barrel export
├── frontend/                   # React frontend application (Phase 1B+)
├── backend/                    # Express.js API microservice (Phase 2+)
├── ml-service/                 # FastAPI ML inference engine (Phase 4+)
├── tests/                      # Integration and contract test suites
└── scripts/                    # Database seeding and migration utilities
```

---

## 6. Environment Configuration

Copy the example environment template to create your local `.env`:

```bash
cp .env.example .env
```

Key environment parameters:
- `DEFAULT_DEMO_LOCATION`: JSON object configuring the fallback demo geography (default: Lucknow District, Uttar Pradesh). *Notice: Business logic contains zero hardcoded location strings.*
- `DATA_MODE`: Set to `DEMO` for development simulation mode or `REAL` for verified observational feeds.
- `DATABASE_URL`: Connection string for PostgreSQL with PostGIS extension.
- `REDIS_URL`: Connection string for Redis instance.
- `ML_SERVICE_URL`: URL of the FastAPI scientific downscaling service.

---

## 7. Developer Quickstart

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x or pnpm >= 9.x
- Python >= 3.11
- Docker & Docker Compose (optional for local PostgreSQL/PostGIS and Redis)

### Initial Setup
1. Clone the repository and enter the directory:
   ```bash
   cd /path/to/VarshaSetu
   ```
2. Verify shared contracts and types:
   ```bash
   ls -la shared/types
   ```
3. Read the foundational documentation:
   - [Product Requirements Document (PRD)](docs/PRD.md)
   - [Technical Architecture Specification](docs/architecture.md)
   - [Milestone Progress Tracker](docs/progress.md)

---

## 8. Development Roadmap

- **Phase 1A (Complete):** Product specification, technical architecture, shared contracts, environment configuration, and clean scaffolding.
- **Phase 1B (Complete):** Interactive Frontend UI Development (Farmer view, officer command portal, Tailwind theme tokens, Stitch MCP wireframing).
- **Phase 1C (Complete):** Frontend refinement, UX validation, WCAG accessibility hardening, and typed API service layer.
- **Phase 2 (Complete):** Node/Express Backend Core, PostgreSQL/PostGIS migrations, administrative boundary seeding, and RBAC authentication.
- **Phase 3 (Complete):** Real Climate + Weather Data Ingestion (NOAA ENSO, BoM IOD/MJO, Open-Meteo ERA5-Land), QC bounds validation, and Parquet feature storage.
- **Phase 4 (Pending):** Python FastAPI ML downscaling microservice, Climatology baseline, and XGBoost/LightGBM downscaling.
- **Phase 5 (Pending):** Agronomic Rules Engine & What-If Decision Simulator.
- **Phase 6 (Pending):** Voice capabilities, Bhashini multilingual translation, and broadcast distribution.

---

## 9. Core Design & Product Principles

1. **Beginner-First UX:** "Complex intelligence underneath. Simple decisions on top."
2. **Scientific Transparency:** No fabricated forecast confidence. No fake data presented as real.
3. **Configurable Reference Locations:** Never write `if location === "Lucknow"`; use configuration.
4. **Deterministic Agronomy:** Machine learning models forecast weather and probabilities; agronomic rules guide recommendations. LLMs only aid in language translation and voice synthesis.
5. **Calibrated Probabilities:** Store probabilities as floats `[0.0, 1.0]`. Convert to percentages solely in presentation layers.
