# VarshaSetu — Deployment Readiness & Operations Guide (Phase 6L)

## 1. System Architecture Overview

VarshaSetu is composed of three interconnected, container-friendly service components:

```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
|           Farmer UI  |  Officer UI  |  Government Dashboard  |  Forecast Lab      |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ (HTTP / Port 5173)
+-----------------------------------------------------------------------------------+
|                        FRONTEND STATIC ASSETS / REVERSE PROXY                     |
|                                Vite SPA / Nginx                                   |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ (HTTP / Port 5001)
+-----------------------------------------------------------------------------------+
|                             BACKEND API GATEWAY                                   |
|               Node.js 20+ / Express / TypeScript / Helmet / RBAC                  |
+-----------------------------------------------------------------------------------+
                   │                                             │
                   ▼ (HTTP / Port 8000)                          ▼ (PostgreSQL / Port 5432)
+---------------------------------------+       +-----------------------------------+
|        ML & METEOROLOGICAL SERVICE    |       |        POSTGRESQL / POSTGIS       |
|    FastAPI / Scikit-Learn / XGBoost   |       |    11 Applied Schema Migrations   |
+---------------------------------------+       +-----------------------------------+
```

---

## 2. Infrastructure Requirements & Ports

| Component | Technology | Default Port | Internal Dependency | External Dependency |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | React 18 / Vite / TypeScript | `5173` | Backend (`:5001`) | None |
| **Backend** | Node.js 20+ / Express / TS | `5001` | ML Service (`:8000`), DB (`:5432`) | None |
| **ML Microservice** | Python 3.11 / FastAPI / XGBoost | `8000` | PostgreSQL (`:5432`) | None (air-gapped ready) |
| **Database** | PostgreSQL 16+ with PostGIS 3.4+ | `5432` | None | None |

---

## 3. Deployment Configuration Checklist

### 3.1 Environment Templates
Copy and configure environment files before startup:
```bash
# Backend
cp backend/.env.example backend/.env

# ML Service
cp ml-service/.env.example ml-service/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3.2 Production Secret Requirements
- In production (`NODE_ENV=production`), `JWT_SECRET` in `backend/.env` **must** be set to a secure, random string $\ge 32$ characters. Startup will fail if the development default is detected.
- `CORS_ORIGIN` must explicitly define permitted hostnames (no wildcard `*`).

### 3.3 Optional External Integrations
All third-party services and APIs are strictly optional. Missing credentials default safely to `NOT_CONFIGURED` or `DEMO_ONLY` and never crash service startup.

| Provider | Purpose | Environment Variables | Default Status |
| :--- | :--- | :--- | :--- |
| **OpenWeather** | Live surface meteorological data | `OPENWEATHER_API_KEY` | Disabled (`ENABLE_EXTERNAL_WEATHER=false`) |
| **WeatherAPI** | Secondary surface meteorological data | `WEATHERAPI_KEY` | Disabled (`ENABLE_EXTERNAL_WEATHER=false`) |
| **Tomorrow.io** | High-resolution precipitation nowcasting | `TOMORROW_IO_API_KEY` | Disabled (`ENABLE_EXTERNAL_WEATHER=false`) |
| **Meteomatics** | High-precision agro-weather API | `METEOMATICS_USERNAME`, `METEOMATICS_PASSWORD` | Disabled (`ENABLE_EXTERNAL_WEATHER=false`) |
| **Copernicus CDS** | ERA5 climate reanalysis & hindcasting | `CDS_API_URL`, `CDS_API_KEY` | Disabled (`ENABLE_CDS_DATA=false`) |
| **NASA Earthdata** | Satellite precipitation (IMERG/GPM) | `NASA_EARTHDATA_USERNAME`, `NASA_EARTHDATA_PASSWORD`, `NASA_EARTHDATA_TOKEN` | Disabled |
| **Sentinel Hub** | Satellite multispectral remote sensing | `SENTINEL_HUB_CLIENT_ID`, `SENTINEL_HUB_CLIENT_SECRET` | Disabled (`ENABLE_SATELLITE_DATA=false`) |
| **Google Earth Engine** | Planetary-scale geospatial analysis | `GOOGLE_EARTH_ENGINE_PROJECT`, `GOOGLE_EARTH_ENGINE_SERVICE_ACCOUNT`, `GOOGLE_EARTH_ENGINE_PRIVATE_KEY` | Disabled (`ENABLE_SATELLITE_DATA=false`) |
| **Bhashini** | Indic language translation & voice pipelines | `BHASHINI_API_BASE_URL`, `BHASHINI_API_KEY`, `BHASHINI_USER_ID`, `BHASHINI_PIPELINE_ID` | `NOT_CONFIGURED` (`ENABLE_BHASHINI=false`) |
| **Google Cloud TTS** | Cloud neural text-to-speech fallback | `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS` | `DEMO_ONLY` (`ENABLE_EXTERNAL_VOICE=false`) |
| **Azure Speech** | Cognitive Services neural speech fallback | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | `DEMO_ONLY` (`ENABLE_EXTERNAL_VOICE=false`) |
| **ElevenLabs** | Multilingual generative voice fallback | `ELEVENLABS_API_KEY` | `DEMO_ONLY` (`ENABLE_EXTERNAL_VOICE=false`) |
| **Twilio SMS** | Outbound SMS alert dispatch | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | `NOT_CONFIGURED` (`ENABLE_SMS=false`) |
| **Twilio WhatsApp** | Outbound WhatsApp messaging | `TWILIO_WHATSAPP_FROM` | `NOT_CONFIGURED` (`ENABLE_WHATSAPP=false`) |
| **Meta WhatsApp** | Cloud API for direct WhatsApp dispatch | `META_WHATSAPP_ACCESS_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID`, `META_WHATSAPP_BUSINESS_ACCOUNT_ID`, `META_WHATSAPP_API_VERSION` | `NOT_CONFIGURED` (`ENABLE_WHATSAPP=false`) |
| **SMTP / Resend / SendGrid** | Transactional email delivery | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `RESEND_API_KEY`, `SENDGRID_API_KEY` | `NOT_CONFIGURED` (`ENABLE_EMAIL=false`) |
| **Mapbox** | Optional vector tiles (OSM is default) | `MAPBOX_ACCESS_TOKEN`, `VITE_MAPBOX_PUBLIC_TOKEN` | Fallback (Leaflet/OSM active) |
| **Google Maps** | Map rendering & geocoding alternative | `GOOGLE_MAPS_API_KEY` | Fallback |
| **Nominatim** | OpenStreetMap reverse geocoding | `NOMINATIM_BASE_URL` | Active default (`https://nominatim.openstreetmap.org`) |
| **OpenAI / Gemini / Anthropic** | Auxiliary explanation formatting (Placeholders) | `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY` | Disabled (`ENABLE_EXTERNAL_LLM=false`) |
| **Sentry / OpenTelemetry** | APM monitoring & distributed tracing | `SENTRY_DSN`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME` | Disabled |


---

## 4. Database Setup & Migration Execution

1. **Verify PostgreSQL & PostGIS Extension:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
2. **Execute Migrations Deterministically:**
   ```bash
   cd backend
   npm run migrate
   ```
   *Migrations 001 through 011 will be validated and applied sequentially.*

3. **Optional Seed Data:**
   ```bash
   npm run seed
   ```

---

## 5. Build & Startup Commands

### 5.1 Python ML Microservice
```bash
cd ml-service
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run Unit & Scientific Integrity Suite
pytest

# Launch Production ASGI Server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 5.2 Backend Gateway
```bash
cd backend
npm install
npm run build
npm test

# Launch Production Node Process
NODE_ENV=production node dist/backend/src/server.js
```

### 5.3 Frontend Client
```bash
cd frontend
npm install
npm run build

# Preview Production Build (or serve dist/ via Nginx)
npm run preview -- --host 0.0.0.0 --port 5173
```

---

## 6. Health & Readiness Probes

Configuring container orchestrators (e.g. Kubernetes, Docker Compose healthchecks):

### Liveness Probe
- **Backend**: `GET http://localhost:5001/health`
- **ML Service**: `GET http://localhost:8000/health`
- Expects `HTTP 200` with JSON `{ "status": "ok", "health_classification": "HEALTHY" }`.

### Readiness Probe
- **Backend**: `GET http://localhost:5001/ready`
- **ML Service**: `GET http://localhost:8000/ready`
- Expects `HTTP 200` with JSON `{ "ready": true, "dependencies": { ... } }`.
- Returns `HTTP 503` if PostgreSQL or storage directory is unreachable.

---

## 7. Rollback & Backup Considerations

1. **PostgreSQL Snapshots:**
   Execute regular database dumps:
   ```bash
   pg_dump -Fc -v --host=localhost --username=postgres varshasetu > varshasetu_backup_$(date +%Y%m%d).dump
   ```
2. **Deterministic Artifact Store:**
   The `ml-service/artifacts/` directory contains immutable JSON contracts for calibration, hindcast runs, and scenario analysis. Backup this directory alongside database snapshots.
