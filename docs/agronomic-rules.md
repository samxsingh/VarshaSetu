# VarshaSetu (वर्षासेतु) — Agronomic Rules Engine & Explainable Advisory Foundation
## Phase 5A Scientific Specification & Operational Architecture

---

### 1. Executive Summary & Purpose

Phase 5A establishes the **Agronomic Rules Engine and Explainable Advisory Foundation** for VarshaSetu (वर्षासेतु). It translates downscaled, Isotonic-calibrated meteorological forecast probabilities from Phases 4A–4F into crop-specific, stage-sensitive agro-meteorological situational awareness and risk indicators.

```
+-------------------------------------------------------------------------+
|                  Phase 4E/4F Calibrated Forecast Layer                  |
|    (HEAVY_RAIN, DRY_SPELL, MONSOON_ONSET, RAINFALL_ANOMALY, etc.)       |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|                Phase 5A Controlled Agronomic Rule Engine                |
|      (9 Registered Rules across 6 Controlled Kharif/Rabi Crops)         |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|               Deterministic Agronomic Safety Gate (13 Checks)            |
|       (Blocks imperative commands, yield claims, and uncalibrated data) |
+-------------------------------------------------------------------------+
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
+-----------------------------------+ +-----------------------------------+
| Scientific Advisory Delivery      | | What-If Scenario Sensitivity      |
| Mode: DIAGNOSTIC_ONLY             | | Classification: SCENARIO_INDICATOR|
| Output: Situational Awareness     | | Output: Water stress shift index  |
+-----------------------------------+ +-----------------------------------+
```

#### Core Invariants
1. **`ADVISORY_MODE = DIAGNOSTIC_ONLY`**: All advisories operate exclusively in diagnostic situational awareness mode.
2. **Zero Imperative Agricultural Commands**: Advisories notify of risks and atmospheric conditions, never prescribing dictatorial farming decisions (no "Do not sow", "Harvest immediately", or "Spray pesticide").
3. **Absence of Crop Yield Models**: VarshaSetu does not predict crop yields (kg/ha), financial revenue losses, or biomass accumulation.
4. **Historical Ground Anchor**: Single-station anchor at Bakshi Ka Talab (`UP_LKO_BKT`), evaluated against the 122-record Kharif 2024 meteorological profile.
5. **Deterministic Safety Gate**: 13 strict pre-release validation checks.

---

### 2. Scientific Grounding & Meteorological Foundation

Advisories are grounded in standardized meteorological criteria formulated by the India Meteorological Department (IMD) and Indian Council of Agricultural Research (ICAR) agromet advisories:

| Meteorological Hazard | Target Event | IMD Scientific Criteria | Operational Window |
|:----------------------|:-------------|:------------------------|:-------------------|
| **Heavy Rainfall** | `HEAVY_RAIN` | Daily precipitation $\ge 64.5\text{ mm} / 24\text{h}$ | 3-day to 7-day medium range |
| **Extreme Rainfall** | `EXTREME_RAIN` | Daily precipitation $\ge 204.5\text{ mm} / 24\text{h}$ | Convective alert |
| **Extended Dry Spell** | `DRY_SPELL` | Daily precipitation $< 2.5\text{ mm}$ for $\ge 5$ consecutive days | 7-day to 14-day medium range |
| **Monsoon Onset Surge** | `MONSOON_ONSET` | Cumulative rainfall $\ge 25\text{ mm}$ over 3 days | Onset transition window |
| **False Onset Break** | `MONSOON_ONSET` | Extended dry hiatus ($\ge 7\text{ dry days}$) post-initial surge | Sowing / germination window |
| **Rainfall Deficit Anomaly** | `RAINFALL_ANOMALY` | Cumulative precipitation $\le -50\%$ vs empirical climatology | Mid-season cumulative |
| **Rainfall Surplus Anomaly** | `RAINFALL_ANOMALY` | Cumulative precipitation $\ge +50\%$ vs empirical climatology | Mid-season cumulative |

---

### 3. Controlled Crop Registry

The registry is closed and controlled. No unvalidated crop species are admitted.

| Crop ID | Common Name | Scientific Name | Growth Stages Supported | Relevant Hazards | Operational Status |
|:--------|:------------|:----------------|:------------------------|:-----------------|:-------------------|
| `GENERAL` | General Agro-Met | All Agricultural Crops | `ALL` | All hazards | `INFORMATIONAL_ONLY` |
| `PADDY` | Paddy / Rice (धान) | *Oryza sativa* | `NURSERY_SOWING`, `VEGETATIVE`, `REPRODUCTIVE`, `MATURITY`, `HARVESTING`, `ALL` | Heavy rain, dry spell, flash flooding, false onset | `INFORMATIONAL_ONLY` |
| `MAIZE` | Maize (मक्का) | *Zea mays* | `NURSERY_SOWING`, `VEGETATIVE`, `REPRODUCTIVE`, `MATURITY`, `ALL` | Waterlogging, heavy rain, prolonged drought | `INFORMATIONAL_ONLY` |
| `WHEAT` | Wheat (गेहूं) | *Triticum aestivum* | `NURSERY_SOWING`, `VEGETATIVE`, `REPRODUCTIVE`, `MATURITY`, `ALL` | Unseasonal terminal heat, untimely winter rain | `INFORMATIONAL_ONLY` |
| `PULSES` | Pulses (दलहन) | *Fabaceae spp.* | `NURSERY_SOWING`, `VEGETATIVE`, `REPRODUCTIVE`, `MATURITY`, `ALL` | Excess moisture, root rot risk, prolonged drought | `INFORMATIONAL_ONLY` |
| `MUSTARD` | Mustard (सरसों) | *Brassica juncea* | `NURSERY_SOWING`, `VEGETATIVE`, `REPRODUCTIVE`, `MATURITY`, `ALL` | Heavy rainfall, cloudiness, late rain at maturity | `INFORMATIONAL_ONLY` |

---

### 4. Agronomic Rules Catalog

All 9 rules are implemented as pure, deterministic evaluators in `ml-service/app/agronomy/rules/`:

#### Rule 1: `AGRO_HEAVY_RAIN_INFO_001`
- **Target Event**: `HEAVY_RAIN`
- **Applicable Crops**: `GENERAL` (All Crops)
- **Applicable Growth Stages**: `ALL`
- **Severity**: `INFO`
- **Category**: `WEATHER_RISK`
- **Probability Threshold**: $p \ge 0.40$
- **Meteorological Threshold**: $\ge 64.5\text{ mm} / 24\text{h}$
- **Scientific Basis**: IMD threshold for heavy precipitation ($\ge 64.5\text{ mm}$).
- **Advisory Text**: "Statistical downscaling indicates an elevated probability ({prob:.1f}%) of localized heavy rainfall exceeding 64.5 mm within the upcoming forecast horizon. Farmers are encouraged to inspect surface drainage channels and monitor soil saturation."
- **Priority**: 10

#### Rule 2: `AGRO_PADDY_HEAVY_RAIN_HARVEST_001`
- **Target Event**: `HEAVY_RAIN`
- **Applicable Crops**: `PADDY`
- **Applicable Growth Stages**: `MATURITY`, `HARVESTING`
- **Severity**: `WATCH`
- **Category**: `WEATHER_RISK`
- **Probability Threshold**: $p \ge 0.45$
- **Meteorological Threshold**: $\ge 64.5\text{ mm} / 24\text{h}$
- **Scientific Basis**: Convective rainfall on mature paddy causes lodging, panicle sprouting, and delayed harvesting operations.
- **Advisory Text**: "Elevated heavy rainfall risk ({prob:.1f}%) identified during the maturity/harvesting phase of paddy. Wet soil conditions may complicate mechanical harvesting and increase lodging risk. Consider inspecting field bund outlets to drain excess water."
- **Priority**: 15

#### Rule 3: `AGRO_EXTREME_RAIN_ALERT_001`
- **Target Event**: `EXTREME_RAIN`
- **Applicable Crops**: `GENERAL` (All Crops)
- **Applicable Growth Stages**: `ALL`
- **Severity**: `HIGH`
- **Category**: `WEATHER_RISK`
- **Probability Threshold**: $p \ge 0.85$
- **Meteorological Threshold**: $\ge 204.5\text{ mm} / 24\text{h}$
- **Scientific Basis**: IMD threshold for extremely heavy precipitation ($\ge 204.5\text{ mm}$).
- **Advisory Text**: "High probability ({prob:.1f}%) of extremely heavy rainfall exceeding 204.5 mm detected. High risk of severe waterlogging and flash inundation across agricultural lowlands. Prioritize personal safety and monitor local district disaster management bulletins."
- **Priority**: 50

#### Rule 4: `AGRO_DRY_SPELL_INFO_001`
- **Target Event**: `DRY_SPELL`
- **Applicable Crops**: `GENERAL` (All Crops)
- **Applicable Growth Stages**: `ALL`
- **Severity**: `INFO`
- **Category**: `WATER_STRESS`
- **Probability Threshold**: $p \ge 0.45$
- **Meteorological Threshold**: $\ge 5$ consecutive dry days ($< 2.5\text{ mm}$)
- **Scientific Basis**: IMD definition of a dry spell in monsoon regions ($\ge 5$ consecutive days with $< 2.5\text{ mm}$).
- **Advisory Text**: "Downscaling models project a {prob:.1f}% probability of an extended dry spell (5 or more consecutive days with < 2.5 mm rainfall). Soil moisture levels may decline. Observational planning for supplemental irrigation access is advised."
- **Priority**: 10

#### Rule 5: `AGRO_PADDY_DRY_SPELL_VEGETATIVE_001`
- **Target Event**: `DRY_SPELL`
- **Applicable Crops**: `PADDY`
- **Applicable Growth Stages**: `VEGETATIVE`
- **Severity**: `WATCH`
- **Category**: `WATER_STRESS`
- **Probability Threshold**: $p \ge 0.45$
- **Meteorological Threshold**: $\ge 5$ consecutive dry days ($< 2.5\text{ mm}$)
- **Scientific Basis**: Rice at vegetative tillering requires shallow standing water or near-saturation to sustain root aeration and tiller development.
- **Advisory Text**: "Extended dry hiatus ({prob:.1f}% probability) indicated during vegetative tillering in paddy. Tillering stands are sensitive to topsoil drying. Check canal water rotation schedules or prepare groundwater tubewells for life-saving supplemental irrigation."
- **Priority**: 15

#### Rule 6: `AGRO_MONSOON_ONSET_INFO_001`
- **Target Event**: `MONSOON_ONSET`
- **Applicable Crops**: `GENERAL` (All Crops)
- **Applicable Growth Stages**: `NURSERY_SOWING`
- **Severity**: `INFO`
- **Category**: `MONSOON_STATUS`
- **Probability Threshold**: $p \ge 0.50$
- **Meteorological Threshold**: $\ge 25\text{ mm}$ over 3 consecutive days
- **Scientific Basis**: Standard agro-meteorological onset surge criteria.
- **Advisory Text**: "Favorable monsoon onset surge probability ({prob:.1f}%) detected over the upcoming forecast horizon. Soil moisture conditions are transitioning toward sowing readiness. Nursery bed preparation can be aligned with observational rain arrival."
- **Priority**: 20

#### Rule 7: `AGRO_FALSE_ONSET_RISK_001`
- **Target Event**: `MONSOON_ONSET`
- **Applicable Crops**: `GENERAL` (All Crops)
- **Applicable Growth Stages**: `NURSERY_SOWING`
- **Severity**: `WATCH`
- **Category**: `MONSOON_STATUS`
- **Probability Threshold**: $p \ge 0.50$
- **Meteorological Threshold**: $\ge 7$ dry days post-surge
- **Scientific Basis**: A false onset occurs when an early monsoon pulse triggers direct seeding followed by an immediate multi-week hiatus, desiccating emergent seedlings.
- **Advisory Text**: "Models indicate risk ({prob:.1f}%) of a false onset hiatus: an initial rainfall surge followed by an extended dry pause. Rainfed direct seeding carries increased desiccation risk. Ensure irrigation backup is available before commencing large-scale field sowing."
- **Priority**: 25

#### Rule 8: `AGRO_RAINFALL_DEFICIT_ANOMALY_001`
- **Target Event**: `RAINFALL_ANOMALY`
- **Applicable Crops**: `GENERAL` (All Crops)
- **Applicable Growth Stages**: `ALL`
- **Severity**: `WATCH`
- **Category**: `RAINFALL_ANOMALY`
- **Probability Threshold**: $p \ge 0.45$
- **Meteorological Threshold**: $\le -50\%$ cumulative deviation vs historical baseline
- **Scientific Basis**: Large negative cumulative rainfall anomalies indicate agricultural drought onset and groundwater depletion.
- **Advisory Text**: "Large cumulative rainfall deficit ({prob:.1f}% probability of <= -50% anomaly) projected across the reference window. Extended moisture stress may develop. Planning water-saving measures and mulch conservation is recommended."
- **Priority**: 15

#### Rule 9: `AGRO_RAINFALL_SURPLUS_ANOMALY_001`
- **Target Event**: `RAINFALL_ANOMALY`
- **Applicable Crops**: `GENERAL` (All Crops)
- **Applicable Growth Stages**: `ALL`
- **Severity**: `WATCH`
- **Category**: `RAINFALL_ANOMALY`
- **Probability Threshold**: $p \ge 0.50$
- **Meteorological Threshold**: $\ge +50\%$ cumulative deviation vs historical baseline
- **Scientific Basis**: Large positive cumulative anomalies saturate soil profiles and trigger waterlogging in low-lying alluvial plains.
- **Advisory Text**: "Significant cumulative rainfall surplus ({prob:.1f}% probability of >= +50% anomaly) projected across the reference window. Saturated field profiles may reduce root aeration and hinder inter-cultivation machinery access."
- **Priority**: 15

---

### 5. Deterministic Safety Gate Architecture

The `AgronomicSafetyGate` executes 13 pre-release checks on every advisory candidate:

| Check # | Check Name | Evaluation Criteria | Mitigation / Rejection Behavior |
|:--------|:-----------|:--------------------|:--------------------------------|
| 1 | `VALIDATION_DATA_FRESHNESS` | Enforces `HISTORICAL_ONLY` (Kharif 2024 single-season archive). Rejects unanchored live claims. | Advisory blocked with `HISTORICAL_ONLY_ENFORCED`. |
| 2 | `OPERATIONAL_STATUS_CHECK` | Advisory mode must be strictly `DIAGNOSTIC_ONLY`. Operational execution disallowed. | Advisory blocked with `DIAGNOSTIC_MODE_ENFORCED`. |
| 3 | `PROBABILITY_RANGE_CHECK` | Calibrated probability must be bounded in $[0.0, 1.0]$. | Advisory blocked if probability $< 0.0$ or $> 1.0$. |
| 4 | `CONFIDENCE_INTERVAL_CHECK` | Parametric or empirical CI must be defined ($CI_{lower} \le p \le CI_{upper}$). | Advisory blocked if CI is missing or inverted. |
| 5 | `IMPERATIVE_COMMAND_FILTER` | Scans advisory headline and text for imperative verbs (`do not`, `must spray`, `harvest immediately`, etc.). | Advisory blocked with `IMPERATIVE_COMMAND_BLOCKED`. |
| 6 | `YIELD_CLAIM_FILTER` | Scans for yield predictions (`yield loss`, `quintals per acre`, `production reduction`). | Advisory blocked with `YIELD_CLAIM_BLOCKED`. |
| 7 | `REVENUE_LOSS_FILTER` | Scans for financial loss assertions (`rupees loss`, `₹`, `$`). | Advisory blocked with `REVENUE_CLAIM_BLOCKED`. |
| 8 | `PESTICIDE_BRAND_FILTER` | Scans for commercial agrochemical or pesticide brand names. | Advisory blocked with `COMMERCIAL_BRAND_BLOCKED`. |
| 9 | `WEATHER_HAZARD_THRESHOLD` | Forecast probability must meet or exceed rule's declared threshold. | Advisory suppressed (condition not met). |
| 10 | `STATION_COVERAGE_CHECK` | Verifies station anchor corresponds to validated centroid (`UP_LKO_BKT`). | Provisional warning attached if outside validated block. |
| 11 | `SINGLE_SEASON_CAVEAT` | Enforces mandatory scientific caveat disclosing single-season Kharif 2024 limitations. | Advisory blocked if caveat is omitted. |
| 12 | `DEDUPLICATION_HASH_CHECK` | Verifies SHA-256 deduplication hash integrity. | Advisory blocked if hash mismatch detected. |
| 13 | `NON_CAUSAL_ATTRIBUTION` | Scans explanation for causal assertions (`caused by`, `due to global warming`). Enforces non-causal statistical correlation language. | Advisory blocked with `CAUSAL_LANGUAGE_BLOCKED`. |

---

### 6. Evidence & Scientific Traceability

Every generated advisory includes a typed `AdvisoryEvidence` contract establishing direct mathematical provenance:
- **`forecast_id`**: Originating forecast record from Phase 4E/4F.
- **`calibrated_probability`**: Isotonic-calibrated probability.
- **`confidence_interval_lower` / `confidence_interval_upper`**: 90% confidence bounds.
- **`hindcast_brier_skill_score`**: Historical fold validation skill score.
- **`isotonic_ece`**: Expected Calibration Error ($ECE \le 0.05$).
- **`validation_status`**: Declared validation state (`SINGLE_STATION_VALIDATED`).
- **`station_coverage`**: Centroid station identifier (`UP_LKO_BKT`).

---

### 7. Non-Causal Advisory Phrasing Protocol

VarshaSetu strictly separates **statistical correlation** from **causal physical attribution**:

| Category | Forbidden Phrasing | Permitted Non-Causal Phrasing |
|:---------|:-------------------|:------------------------------|
| **Rainfall Risk** | "A depression will hit the block and flood your fields." | "Statistical downscaling indicates an elevated probability (58.4%) of rainfall exceeding 64.5 mm." |
| **Dry Spells** | "Monsoon has failed because of El Niño." | "Model-associated features indicate an extended dry hiatus (>= 5 consecutive days with < 2.5 mm)." |
| **Field Directives** | "Do not sow paddy this week. Wait until July 2." | "Favorable monsoon onset surge probability (50.0%) detected. Rainfed sowing carries increased moisture sensitivity." |
| **Crop Interventions**| "Spray systemic fungicide immediately to prevent blast." | "Prolonged wet conditions create environment statistically associated with fungal foliar pathogens." |

---

### 8. What-If Scenario Simulator Foundation

The What-If Simulator enables farmers, officers, and analysts to explore the sensitivity of crop-weather risk profiles under hypothetical parameter shifts:

```
Parameters:
  - Sowing Date Offset (e.g. +7 days, +14 days)
  - Supplemental Irrigation Scheduling
  - Seasonal Rainfall Anomaly (-60% to +60%)
          │
          ▼
   Scenario Simulator
          │
          ▼
Outputs:
  - Risk Shift Indicator: REDUCED_RISK | NEUTRAL_CHANGE | ELEVATED_RISK
  - Water Stress Shift Percentage (+/- %)
  - Waterlogging Risk Shift Percentage (+/- %)
  - Classification: SCENARIO_INDICATOR_ONLY
  - Explicit Absence of Yield Models Notice
```

---

### 9. Deduplication & Advisory Lifecycle Management

To prevent alert fatigue and duplicate notifications:
- **Deterministic Deduplication Hash**: SHA-256 computed over `(forecast_id, rule_id, crop_type, growth_stage, valid_from, valid_until)`.
- If an active advisory exists with an identical deduplication hash, re-evaluation updates the existing record rather than creating a duplicate.
- **Lifecycle States**: `ACTIVE` $\rightarrow$ `DISMISSED` | `EXPIRED` | `SUPERSEDED`.

---

### 10. REST API Specification

| Method | Endpoint | Access Role | Description |
|:-------|:---------|:------------|:------------|
| `GET` | `/api/v1/agronomy/status` | Public / All | Returns agronomic engine status, rule counts, and scientific disclosures |
| `GET` | `/api/v1/agronomy/rules` | Authenticated | Lists registered agronomic rules with optional filters (`target`, `crop`, `stage`) |
| `GET` | `/api/v1/agronomy/rules/:id` | Authenticated | Retrieves detailed specification for a single agronomic rule |
| `GET` | `/api/v1/agronomy/crops` | Authenticated | Retrieves controlled crop registry |
| `GET` | `/api/v1/agronomy/crops/:id` | Authenticated | Retrieves crop detail by ID |
| `POST` | `/api/v1/agronomy/evaluate` | Officer, Analyst, Admin | Evaluates candidate forecast against active agronomic rules and runs safety gate |
| `POST` | `/api/v1/agronomy/generate` | Officer, Analyst, Admin | Generates active advisories for a specified block and date |
| `GET` | `/api/v1/agronomy/advisories` | Authenticated | Lists advisories (farmers restricted to their assigned location) |
| `GET` | `/api/v1/agronomy/advisories/:id`| Authenticated | Retrieves a single scientific advisory |
| `POST` | `/api/v1/agronomy/simulate` | Authenticated | Runs a What-If sensitivity scenario simulation |
| `POST` | `/api/v1/agronomy/advisories/:id/dismiss` | Authenticated | Marks an advisory as dismissed |

---

### 11. Database Schema & Migration Specification

Implemented in `backend/src/db/migrations/009_agronomic_advisories.sql`:

1. **`agronomic_advisories`**: Stores generated scientific advisories, validated evidence JSONB, non-causal explanations JSONB, deduplication hash, and lifecycle status.
2. **`agronomic_rule_evaluations`**: Audit log of rule evaluations, recording safety gate pass/block results and blocked reasons.
3. **`scenario_runs`**: Persists What-If sensitivity simulations with `indicator_only_ack = true`.

---

### 12. Multi-Season Data Limitations & Single-Station Caveats

- **Single-Season Constraint**: Operational parameters reflect empirical observations from the Kharif 2024 archive (June 1 – September 30, 2024; 122 daily records).
- **Multi-Year Skill Status**: Multi-year verification remains classified as `INSUFFICIENT_DATA`. Multi-year hindcasting folds cannot be evaluated until historical multi-season archives are ingested.
- **Ground Anchor**: All downscaled rules are validated against the single station centroid of Bakshi Ka Talab (`UP_LKO_BKT`). Regional extrapolations across Malihabad, Mohanlalganj, Sarojini Nagar, Gosainganj, and Chinhat are provisional.

---

### 13. Security, RBAC & Access Control

- **Farmers**: Read access to advisories restricted to assigned block (`UP_LKO_BKT`). Full access to What-If simulator. Write/evaluate operations rejected with `403 FORBIDDEN`.
- **Extension Officers**: Read access across district blocks. Ability to trigger advisory generation and draft bulletins.
- **Analysts & Administrators**: Full access to rule registry, safety gate inspection, evaluation engine, and raw JSON artifacts.

---

### 14. Verification & Testing Matrix

| Suite | Component | Tests Passed | Status |
|:------|:----------|:-------------|:-------|
| `ml-service` | Schemas, Rules, Safety Gate, Advisory Engine, Simulator, API | 137 / 137 | **PASSED** |
| `backend` | Migrations, Repository, Controller, Routes, Integration Tests | 74 / 74 | **PASSED** |
| `frontend` | Advisory Service, Farmer Advisory Page, Farmer What-If Page, Officer Monitor | 52 / 52 | **PASSED** |
| **Total** | Full Phase 1A–5A End-to-End Regression Suite | **263 / 263** | **PASSED** |
