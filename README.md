# VarshaSetu (वर्षासेतु)
> *“From climate signals to confident farm decisions.”*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Phase 2 Complete](https://img.shields.io/badge/Status-Phase%202%20Complete-teal.svg)](#roadmap)
[![Language: TypeScript & Python](https://img.shields.io/badge/Stack-TypeScript%20%7C%20Python-slate.svg)](#technology-stack)

---

## 1. Project Overview

**VarshaSetu** is a production-oriented, hyperlocal monsoon intelligence and agricultural decision-support platform designed for Indian smallholder and rainfed farmers, extension officers, and agricultural planners.

Operating at the critical block and gram panchayat scale, VarshaSetu bridges the gap between planetary climate modulators (El Niño-Southern Oscillation, Indian Ocean Dipole, Madden-Julian Oscillation) and village-level farm decisions. Rather than presenting generic daily weather forecasts or raw meteorological charts, VarshaSetu delivers **calibrated, probabilistic medium-range (7–30 day) forecasts** translated into **crop-stage-specific agronomic advice** and **interactive "what-if" risk simulations**.

---

## 2. Quickstart & Local Development

### Prerequisites
- Node.js 20+ LTS
- PostgreSQL 16+ (with PostGIS or compatibility layer)

### Backend Setup (Node.js / Express / PostGIS)
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Run database migrations (creates 6 relational tables + PostGIS spatial layer)
npm run migrate

# Seed demonstration data (Lucknow district hierarchy, demo boundary, 5 persona users)
npm run seed

# Run backend test suite (24 tests: health, geography, spatial GIS, auth, RBAC)
npm test

# Start development server on port 5001
npm run dev
```

### Frontend Setup (React 18 / Vite / Tailwind)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run unit tests (7 tests: components, banners, selectors)
npm test

# Start frontend dev server on port 5173
npm run dev
```

---

## 3. Comprehensive Documentation

- **[Product Requirements (PRD)](docs/PRD.md):** 28 sections detailing user personas, 4 forecast targets, and agronomic logic.
- **[System Architecture](docs/architecture.md):** 23 sections covering data flows, PostGIS schemas, ML ensemble architecture, and security.
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
- **Phase 1B:** Interactive Frontend UI Development (Beginner-friendly farmer view, officer command portal, Tailwind theme tokens, Stitch MCP wireframing).
- **Phase 2:** Node/Express Backend Core, PostgreSQL/PostGIS migrations, administrative boundary seeding, and RBAC authentication.
- **Phase 3:** Data Ingestion & Quality Monitoring (NOAA, BoM, IMD/ERA5 adapters).
- **Phase 4:** Python FastAPI ML microservice, Climatology baseline, and XGBoost/LightGBM downscaling.
- **Phase 5:** Agronomic Rules Engine & What-If Decision Simulator.
- **Phase 6:** Voice capabilities, Bhashini multilingual translation, and broadcast distribution.

---

## 9. Core Design & Product Principles

1. **Beginner-First UX:** "Complex intelligence underneath. Simple decisions on top."
2. **Scientific Transparency:** No fabricated forecast confidence. No fake data presented as real.
3. **Configurable Reference Locations:** Never write `if location === "Lucknow"`; use configuration.
4. **Deterministic Agronomy:** Machine learning models forecast weather and probabilities; agronomic rules guide recommendations. LLMs only aid in language translation and voice synthesis.
5. **Calibrated Probabilities:** Store probabilities as floats `[0.0, 1.0]`. Convert to percentages solely in presentation layers.
