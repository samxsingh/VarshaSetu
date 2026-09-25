# Product Requirements Document (PRD)
## VarshaSetu (वर्षासेतु)
*“From climate signals to confident farm decisions.”*

---

### Document Information
- **Product Name:** VarshaSetu
- **Category:** Hyperlocal Monsoon Intelligence & Agricultural Decision Support Platform
- **Document Version:** 1.0.0
- **Status:** Phase 1A Approved Specification
- **Initial Demo Reference Location:** Lucknow District, Uttar Pradesh, India (`DEFAULT_DEMO_LOCATION` configurable)

---

## 1. Executive Summary
VarshaSetu is a production-grade, hyperlocal monsoon intelligence and crop-specific decision support platform. Indian agriculture is inextricably bound to the Southwest and Northeast monsoons, with over 50% of the net cultivated area dependent on rainfed irrigation. While planetary climate phenomena (ENSO, IOD, MJO) govern seasonal moisture transport and continental dynamics, operational weather forecasts are frequently delivered at coarse regional grid resolutions (12–25 km) or broad district aggregates. This coarse granularity obscures critical block- and panchayat-scale microclimates, leading to catastrophic agricultural missteps: premature sowing during false onsets, unmitigated seedling mortality during early dry spells, or lost harvests due to localized cloudbursts.

VarshaSetu resolves this fundamental scale disconnect. It bridges the chasm between large-scale climate signals and village-level agronomic choices by translating downscaled probabilistic meteorological outlooks (7, 14, 21, and 30-day horizons) into actionable, crop-stage-specific advisories and interactive “what-if” decision simulations.

```
GLOBAL CLIMATE SIGNALS (ENSO, IOD, MJO)
         ↓
REGIONAL ATMOSPHERIC DATA (SST, MSLP, Wind, Humidity)
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
CONFIDENT FARMER ACTION (Voice / Visual / Multilingual)
```

---

## 2. Problem Statement
Smallholder and marginal farmers in India lack reliable, village-level, medium-range (7–30 day) probabilistic monsoon forecasts. Existing operational meteorological advisories suffer from three structural shortcomings:
1. **Resolution Mismatch:** Broad district forecasts fail to capture localized convective breaks, orographic rain shadows, and micro-watershed rainfall distributions across blocks and panchayats.
2. **Cognitive Inaccessibility:** Forecasts are either communicated in raw meteorological terminology (e.g., millimeters of anomalous precipitation, standard deviations, vorticity) that farmers cannot map to field operations, or oversimplified into deterministic "rain/no rain" icons that conceal uncertainty.
3. **Absence of Actionable Agronomic Decision Support:** Farmers do not merely need to know *if* it will rain; they need to know *what happens if they sow today versus next week*, *whether an initial wet surge is a false onset followed by a 15-day dry spell*, and *how to protect sensitive crop stages (germination, flowering, pod formation)*.

---

## 3. Problem Analysis
### 3.1 Climatological Complexity of the Indian Monsoon
The South Asian monsoon system is characterized by pronounced intraseasonal variability:
- **Active-Break Cycles:** The monsoon trough oscillates between the Indo-Gangetic plains (active phase) and the Himalayan foothills (break phase). A break lasting 10–20 days immediately following sowing leads to massive seedling desiccation.
- **False Onsets (Bogus Onsets):** Pre-monsoon vortex systems or transient Arabian Sea storms often deposit 40–60 mm of rain over 48 hours, prompting widespread sowing. When monsoon easterlies fail to sustain, the soil dries out before root systems establish, causing 100% crop loss.
- **Large-Scale Modulators:** Sea Surface Temperature anomalies in the Pacific (ENSO / Niño 3.4) and Indian Ocean (IOD / DMI), combined with the eastward propagation of equatorial convection (MJO phases 2–5), create distinct teleconnection patterns across Indian sub-regions.

### 3.2 Sociotechnical Constraints of the Farmer
- **Digital Literacy Gradient:** Many farmers, particularly elder primary decision-makers, have limited comfort with text-dense dashboards.
- **Language Diversity:** Agricultural vocabularies differ markedly across states and agro-ecological zones (e.g., Hindi dialects in UP/Bihar vs Marathi vs Telugu).
- **Asymmetric Risk Profiles:** A medium-scale farmer with tubewell irrigation can tolerate a 10-day dry spell; a rainfed marginal farmer cultivating pulses on sandy loam risks total financial ruin.

---

## 4. Product Vision
To establish the national benchmark for climate-resilient agriculture by delivering **explainable, probabilistic, hyperlocal monsoon intelligence** that empowers every farmer, extension officer, and policymaker to transform complex planetary signals into timely, risk-calibrated decisions.

---

## 5. Goals
1. **Hyperlocal Precision:** Provide probabilistic forecasts calibrated down to the Block and Panchayat administrative levels.
2. **Four Critical Targets:** Accurately estimate likelihood for (1) Monsoon Onset Date & Window, (2) Dry Spells / Break Monsoon Conditions, (3) Heavy Rainfall Events, and (4) Cumulative Rainfall Anomalies.
3. **Medium-Range Horizons:** Deliver calibrated probability distributions across 7-day, 14-day, 21-day, and 30-day timeframes.
4. **Actionable Crop Advisory:** Map climate outlooks through an agronomic rules engine across major Kharif and Rabi crops (Paddy, Maize, Soybean, Pulses, Cotton, Groundnut, Millets).
5. **Interactive What-If Simulation:** Enable farmers and officers to compare scenarios (e.g., "Sow Now" vs "Wait 7 Days") with transparent risk assessments.
6. **Scientific Rigor & Zero Hallucination:** Maintain complete data provenance, evaluate all ML models against strong climatological baselines, and enforce strict separation between verified real data and simulated demo data.
7. **Inclusive Access:** Deliver mobile-first, multilingual (initially Hindi & English), and voice-ready interfaces tailored for high-contrast accessibility and low-friction progressive onboarding.

---

## 6. Non-Goals
1. **Generic Weather Application:** VarshaSetu will not serve as a generic consumer 24-hour hourly temperature/umbrella app.
2. **Unbounded Generative AI Chatbot:** VarshaSetu will not provide an unconstrained LLM chat interface that invents unverified agronomic or meteorological claims. LLMs are strictly bounded to summarization, language localization, and voice transcription/synthesis.
3. **Purely Deterministic Point Forecasts:** The platform will never present single deterministic numbers (e.g., "Exactly 23.4 mm will fall on Day 18") for 14–30 day projections without probability bands and uncertainty margins.
4. **Proprietary Hardware Sensor Sales:** VarshaSetu is a software and data intelligence platform; it does not manufacture or mandate custom in-situ IoT sensor hardware.
5. **Real-time Severe Cyclone Radar Tracking:** Real-time Doppler storm-chasing is delegated to specialized disaster management authorities; VarshaSetu focuses on medium-range monsoon dynamics and agricultural advisory.

---

## 7. Target Users
1. **Farmers:** Primary producers seeking sowing dates, dry-spell warnings, irrigation timing, and crop protection.
2. **Agriculture Officers (KVK / Block Development Officers):** Field extension personnel monitoring block/panchayat risk maps and issuing regional advisories.
3. **Government / Meteorological Officers:** District magistrates, state disaster management authorities, and IMD collaborators tracking aggregate climate health and forecast validation.
4. **Climate & Data Analysts:** Agronomists, researchers, and data scientists inspecting model performance, feature attributions, and hindcast benchmarks.
5. **System Administrators:** IT operators managing user roles, data source pipelines, audit logs, and infrastructure health.

---

## 8. User Personas
### Persona 1: Ram Lakhan (Marginal Rainfed Farmer)
- **Age:** 52
- **Location:** Village Bhaisamau, Block Bakshi Ka Talab, District Lucknow, UP
- **Landholding:** 2.5 Acres, Rainfed
- **Crops:** Paddy (Basmati/Swarna), Pigeonpea (Arhar)
- **Pain Point:** In 2023, sowed paddy nursery after early June rains; monsoon stalled for 18 days; seedlings died; had to re-purchase seed and hire tractor twice.
- **Tech Behavior:** Uses WhatsApp and YouTube on an entry-level Android smartphone; prefers Hindi voice notes over reading dense text.

### Persona 2: Dr. Sunita Verma (Block Agriculture Officer)
- **Age:** 38
- **Location:** KVK (Krishi Vigyan Kendra), Malihabad Block, Lucknow
- **Responsibilities:** 42 Gram Panchayats, 18,000 registered farmers
- **Pain Point:** Overwhelmed by generic district PDF bulletins that advise "farmers in Lucknow to begin land preparation" when northern blocks are parched and southern riverine blocks are already saturated.
- **Tech Behavior:** Uses desktop monitor in the office and tablet in the field; needs clear heatmaps and instant bulletin broadcast tools.

### Persona 3: Vikramaditya Das (Climate & Data Scientist)
- **Age:** 31
- **Location:** State Remote Sensing / Climate Analytics Center
- **Responsibilities:** Validating downscaling accuracy, evaluating Brier skill scores against ERA5 and IMD gridded reanalysis, monitoring feature drift.
- **Tech Behavior:** Power user of Python, PostGIS, Jupyter, and REST APIs; requires raw probability distributions, confusion matrices, and model provenance metadata.

---

## 9. User Journeys
### 9.1 Farmer Journey: Sowing Timing Decision
1. **Progressive Onboarding:** Farmer selects village location (or allows GPS lock), indicates crop (Paddy), and specifies current stage (Land Preparation).
2. **Glanceable Risk Card:** Mobile screen prominently shows: *"Monsoon Onset Outlook: Moderate probability (65%) of sustained rainfall between June 28–July 3. Caution: 40% risk of 7-day dry hiatus immediately following."*
3. **Advisory Action:** Clear recommendation card: *"Hold nursery sowing until June 27. Ensure community tubewell access if sowing early."*
4. **Interactive What-If Simulation:** Farmer taps *"What if I sow now vs wait 7 days?"* -> Simulator reveals that waiting 7 days reduces moisture stress risk from 58% to 18%.
5. **Voice Playback:** Taps audio icon to hear the advisory read aloud in clear Hindi.

### 9.2 Agriculture Officer Journey: Panchayat Risk Assessment
1. **Login & Dashboard:** Officer opens desktop command portal filtered to assigned district/blocks.
2. **Choropleth Risk Map:** Map renders blocks color-coded by 14-day dry-spell probability (Red: >70%, Amber: 40–70%, Green: <40%).
3. **Panchayat Drill-Down:** Clicks on a specific panchayat with 6,000 acres under soybean; inspects soil moisture index and rainfall anomaly projection (-35%).
4. **Targeted Advisory Broadcast:** Generates and publishes a localized agronomic bulletin advising farmers to create broadbed furrows and conserve soil moisture.

---

## 10. Core Features
| Feature Module | Key Capability | Primary Persona |
| :--- | :--- | :--- |
| **Hyperlocal Forecast Engine** | Probabilistic onset, break, heavy rain, and anomaly predictions at 7, 14, 21, and 30-day horizons. | All Users |
| **Progressive Farmer Onboarding** | 3-step zero-friction intake (Location -> Crop -> Stage) with skippable progressive enrichment. | Farmer |
| **Explainable Advisory Engine** | Deterministic agronomic rule matches linking climate targets to specific crop stages. | Farmer, Officer |
| **What-If Decision Simulator** | Comparative evaluation of management choices (sowing dates, irrigation, crop substitution). | Farmer, Officer |
| **Spatial Risk GIS Map** | PostGIS-backed administrative choropleths and anomaly contours with layer toggles. | Officer, Government |
| **Model Transparency & Provenance** | Tracking data sources, model versions, Brier scores, and climatology baselines. | Analyst, Government |
| **Multilingual & Voice Interface** | Localized UI in Hindi & English, ready for future Bhashini integration. | Farmer |
| **System & Data Quality Monitor** | Real-time observability of ingestion pipelines, freshness states, and audit trails. | Administrator |

---

## 11. Farmer Experience
- **Guiding Axiom:** *"Complex intelligence underneath. Simple decisions on top."*
- **Visual Design:** Warm ivory background (`#FAF7F2`), deep slate text (`#0F172A`), teal affirmative accents (`#0D9488`), amber caution indicators (`#B45309`).
- **Cognitive Load Reduction:** No raw equations, p-values, or obscure acronyms (ENSO/IOD/MJO) exposed to farmers.
- **Visual Cues:** High-contrast cards, meaningful micro-icons, color-coded risk badges with accompanying text labels (never color alone).
- **Offline & Low-Bandwidth Consideration:** Progressive Web App (PWA) friendly caching, lightweight vector graphics, minimal payload sizes.

---

## 12. Officer Experience
- **Overview Command Center:** Multi-column desktop layout optimized for rapid spatial scanning across 30–50 Panchayats.
- **Aggregation & Sorting:** Sort blocks and panchayats by composite risk index, rainfall deficit severity, or false onset vulnerability.
- **Export & Dissemination:** One-click generation of printable bulletins and standardized SMS/WhatsApp broadcast templates.
- **Field Reporting:** Capability to cross-validate model outputs against ground observations reported by Kisan Mitras.

---

## 13. Government & Met Experience
- **Statewide Climate Teleconnections:** Macro-views correlating Pacific/Indian Ocean SSTs and MJO tracking with state-level rainfall departure.
- **Early Warning Alerts:** Automatic escalation of high-probability agricultural drought (>21 consecutive dry days) or excess rainfall disaster risks.
- **Audit & Compliance:** Complete historical traceability of every issued forecast run and advisory for inter-departmental accountability.

---

## 14. Analyst Experience
- **Hindcasting & Backtesting Benchmarks:** Historical verification against IMD 0.25° gridded daily rainfall and ERA5 reanalysis from 1980–present.
- **Probabilistic Metrics:** Brier Skill Score (BSS), Reliability Curves, Continuous Ranked Probability Score (CRPS), and ROC-AUC for binary onset/break classification.
- **Feature Attribution:** SHAP (SHapley Additive exPlanations) values indicating the relative weight of MJO phase vs Nino 3.4 vs local humidity in generating the forecast.

---

## 15. Forecast Requirements
### 15.1 Target Definitions
1. **Monsoon Onset:**
   - Operational definition: Sustained rainfall >= 2.5 mm/day over 3 consecutive days accompanied by a persistent reversal of low-level winds (westerlies) and elevated moisture depth.
   - Outputs: Probabilistic onset window (start date, end date, median date, probability of occurrence within horizon, and false-onset risk score).
2. **Dry Spell / Break Monsoon:**
   - Operational definition: A period of >= 5 consecutive dry days (daily rain < 2.5 mm) during the active monsoon season over the target agricultural zone.
   - Outputs: Probability of break occurrence, expected duration, and projected revival date.
3. **Heavy Rain Event:**
   - Operational definition: 24-hour localized rainfall exceeding 64.5 mm (IMD heavy category) or 115.5 mm (very heavy category).
   - Outputs: 7-day and 14-day event probability, anticipated peak 24h intensity window.
4. **Rainfall Anomaly:**
   - Operational definition: Percentage departure from the 30-year local climatological normal.
   - Categories: Large Deficit (< -60%), Deficit (-59% to -20%), Normal (-19% to +19%), Excess (+20% to +59%), Large Excess (>= +60%).

### 15.2 Horizon & Probability Standards
- Forecasts must be issued for **7, 14, 21, and 30-day horizons**.
- All probabilities must be stored as normalized floating-point numbers between `0.000` and `1.000`.
- Every forecast must compute an associated **uncertainty margin** (e.g., `±0.07`) and compare directly against the **historical climatological baseline frequency**.

---

## 16. GIS & Geospatial Requirements
1. **Administrative Boundary Hierarchy:**
   `India (Country) -> State -> District -> Block -> Panchayat -> Village`
2. **Spatial Indexing & Storage:**
   All administrative boundary polygons stored in PostGIS utilizing `GEOMETRY(MultiPolygon, 4326)` with spatial GiST indexes.
3. **Spatial Queries:**
   - Fast point-in-polygon resolution (GPS coordinate to specific Panchayat/Block in < 25ms).
   - Spatial aggregations (average rainfall deficit across all panchayats within a district).
4. **Vector Tile & GeoJSON Delivery:**
   Dynamic generation of GeoJSON and Mapbox Vector Tiles (MVT) for fast client-side rendering.

---

## 17. Agricultural Advisory Requirements
1. **Supported Crops (Configurable Catalog):**
   - **Cereals:** Paddy (Oryza sativa), Maize (Zea mays), Millets (Pearl Millet / Bajra, Sorghum / Jowar, Finger Millet / Ragi).
   - **Legumes / Pulses:** Pigeonpea (Arhar / Tur), Greengram (Moong), Blackgram (Urad), Chickpea.
   - **Oilseeds:** Soybean (Glycine max), Groundnut (Arachis hypogaea).
   - **Commercial:** Cotton (Gossypium).
2. **Crop Growth Stages:**
   - Land Preparation
   - Nursery / Sowing / Germination
   - Vegetative (Tillering, Branching)
   - Flowering / Tasseling / Reproductive
   - Grain Filling / Pod Formation
   - Maturity / Physiological Ripening / Harvesting
3. **Explainable Agronomic Rule Architecture:**
   - Advisory outputs must derive from explicit agronomic rules mapped against forecast metrics, soil types, and irrigation capacity.
   - No black-box generative guessing for critical recommendations. Every advisory item links directly to an underlying rule ID and rationale.

---

## 18. What-If Decision Simulator Requirements
1. **Comparative Scenarios:**
   - **Sowing Date Optimization:** Evaluate projected moisture adequacy and germination risk for "Sowing Today", "Sowing in +7 Days", or "Sowing in +14 Days".
   - **Irrigation Conservation:** Compare soil moisture trajectory between applying supplemental tubewell irrigation today versus holding off in anticipation of projected rainfall revival.
   - **Crop / Variety Substitution:** Assess risk differential between long-duration paddy versus short-duration millets or pulses in the event of a delayed monsoon onset.
2. **Scientific Disclaimer:**
   Every simulation output must explicitly display: *"Model-based agronomic estimate for advisory purposes, not a yield or weather guarantee."*

---

## 19. Multilingual Requirements
1. **Initial Support:** English (`en`) and Hindi (`hi`).
2. **Extensible Architecture:** Designed for future rollout of Marathi, Telugu, Kannada, Tamil, Odia, Bengali, and Gujarati.
3. **Frontend Localization:** Implemented via `react-i18next` with structured JSON translation namespaces (`common`, `farmer`, `officer`, `crops`, `weather`).
4. **Bhashini Contract Readiness:** System contracts defined for future integration with the Government of India’s Bhashini ecosystem (Automatic Speech Recognition, Neural Machine Translation, Text-to-Speech).

---

## 20. Voice Interface Requirements
1. **Focused Interaction Scope:** Strictly restricted to agricultural monsoon intents:
   - Check local forecast and rainfall onset timing.
   - Inquire about dry spell or heavy rain risk.
   - Get crop-specific advice for current growth stage.
   - Trigger what-if sowing comparison.
2. **Audio Feedback:** Synthesized text-to-speech audio player on mobile cards for illiterate or visually challenged farmers.

---

## 21. Data Requirements
1. **Global Climate Teleconnections:**
   - Oceanic Niño Index (ONI) & Niño 3.4 SST anomalies.
   - Dipole Mode Index (DMI) for the Indian Ocean Dipole.
   - Real-time Multivariate MJO (RMM1, RMM2) indices and phase tracking.
2. **Regional Meteorological Observations:**
   - Daily maximum/minimum temperature, rainfall accumulation, relative humidity, surface pressure, 10m zonal/meridional winds.
3. **Data Quality & Hygiene:**
   - Automated detection of missing values, negative precipitation, physically impossible temperatures, schema mismatches, and timestamp drift.
   - Freshness tagging: `FRESH`, `AGING`, `STALE`, `UNAVAILABLE`.
4. **Data Operating Modes:**
   - Strict dual-mode system: `REAL` vs `DEMO`.
   - Any simulated data must carry clear visual badges (`Demo / Simulated Data`).

---

## 22. Machine Learning Requirements
1. **Hybrid Architecture:**
   - Strong Climatology Baseline (30-year empirical distribution).
   - Statistical Baselines (Markov Chain, Logistic Regression).
   - Tree-based Ensembles (Random Forest, XGBoost, LightGBM) incorporating spatial lag features and global teleconnection indices.
2. **Probability Calibration:**
   - Outputs must undergo Platt scaling or Isotonic Regression to ensure predicted probabilities match empirical observation frequencies.
3. **Hindcast Validation:**
   - Strict time-series walk-forward validation (no future data leakage).

---

## 23. Security Requirements
1. **Stateless JWT Authentication:** Short-lived access tokens with secure refresh token rotation.
2. **Server-Side RBAC Enforcement:** Middleware verifying permissions per route; no relying on frontend client-side route guards alone.
3. **Data Protection:** Zero plain-text secrets; encrypted environment variable management; parameter-binding on all SQL/PostGIS queries.
4. **Rate Limiting & CORS:** Strict Origin controls and rate limiters on public and authenticated endpoints.
5. **Comprehensive Audit Logging:** Immutably record all administrative changes, bulletin broadcasts, and configuration updates.

---

## 24. Accessibility Requirements
1. **WCAG 2.1 AA Compliance:** Minimum color contrast ratio of 4.5:1 for standard text and 3:1 for large text and UI components.
2. **Keyboard Navigation & Screen Readers:** ARIA landmarks, semantic HTML5, screen-reader friendly data tables.
3. **Dynamic Font Scaling:** UI preserves layout integrity when system text size is increased up to 200%.

---

## 25. Performance Requirements
1. **API Latency:** 95th percentile response time < 150ms for cached hyperlocal forecast lookups; < 400ms for point-in-polygon spatial queries.
2. **Client Render Performance:** First Contentful Paint (FCP) < 1.2s; Lighthouse Performance Score >= 90.
3. **Payload Optimization:** Compressed JSON responses (< 25 KB for primary farmer forecast bundle).

---

## 26. Scalability Requirements
1. **Geographic Coverage:** Database and PostGIS schemas architected to index all 28 states, 8 UTs, 760+ districts, 7,000+ blocks, and 250,000+ gram panchayats across India.
2. **Horizontal Scaling:** Stateless Node/Express API servers and Python ML inference workers scalable behind a load balancer.
3. **Caching Layer:** Two-tier Redis caching (L1 in-memory application cache, L2 Redis cluster for pre-computed spatial and forecast aggregates).

---

## 27. Acceptance Criteria (Phase 1A Baseline)
- [x] Complete PRD addressing all 28 required sections documented with zero ambiguity.
- [x] Full architectural specification created covering system components, data schemas, API routes, security, and ML pipelines.
- [x] Repository inspected, initialized, and organized with clear separation of concerns.
- [x] Foundational shared type system established.
- [x] Zero production credentials or hard-coded secrets committed.
- [x] Explicit architectural isolation of `DEFAULT_DEMO_LOCATION` ensuring zero hard-coded location dependencies.

---

## 28. Future Scope (Post-Phase 1A Roadmap)
- **Phase 1B:** Interactive Frontend UI Development using Stitch MCP wireframing and design token alignment.
- **Phase 2:** Node/Express Backend Core, PostgreSQL/PostGIS migrations, administrative boundary seeding, and RBAC authentication service.
- **Phase 3:** Data Ingestion Pipeline & Quality Monitor connecting IMD/ERA5/NOAA data providers.
- **Phase 4:** Python FastAPI ML Microservice, Climatology Baseline, Feature Store, and XGBoost/LightGBM downscaling engine.
- **Phase 5:** Agronomic Rules Engine & What-If Simulator.
- **Phase 6:** Bhashini Multilingual Speech/Text Integration & WhatsApp/SMS dissemination gateway.
