# VarshaSetu (वर्षासेतु) — Advanced What-If Scenario Analysis & Sensitivity Engine (Phase 5B)

## 1. Executive Summary & Scientific Purpose

VarshaSetu Phase 5B implements a scientifically bounded **What-If Scenario Analysis, Sensitivity Engine & Decision-Support Simulator**. Building on the foundational rules engine established in Phase 5A, Phase 5B upgrades scenario exploration from simple parameter offsets into a rigorous agro-meteorological sensitivity framework.

The primary objective of Phase 5B is to enable farmers, agricultural extension officers, and climate analysts to explore how operational interventions (such as sowing shifts or supplemental irrigation) and climate shocks (precipitation anomalies, timing shifts, convective concentration) perturb agro-meteorological risk indicators relative to an empirical baseline.

### Mandatory Scientific Boundary
- **Classification**: All scenario evaluations are strictly classified as `SCENARIO_INDICATOR_ONLY`.
- **Absolute Absence of Yield Predictions**: The engine models **meteorological and agro-meteorological sensitivity indicators only** (soil moisture stress exposure, waterlogging hazard, dry spell exposure). It does **NOT** predict crop yield, biomass production, quintals per hectare, or guaranteed harvest outcomes.
- **Zero Economic/Financial Optimization**: The engine strictly prohibits claims of revenue loss, rupee gains, or economic optimization.
- **Ground Anchor**: All evaluations are strictly tied to the verified historical Kharif 2024 meteorological baseline of **Bakshi Ka Talab, Lucknow (UP_LKO_BKT)**. Outputs are never labeled as `OBSERVED` or `GROUND_TRUTH`.

---

## 2. Scientific Ground Truth & Baseline Anchor

All scenario simulations are anchored to the single validated station in Uttar Pradesh:
- **Station ID**: `UP_LKO_BKT`
- **Station Location**: Bakshi Ka Talab, Lucknow District, Uttar Pradesh (Centroid: 26.98° N, 80.93° E, 128 m ASL)
- **Baseline Observation Window**: Kharif 2024 season (June 1, 2024 to September 30, 2024 — exactly 122 continuous daily records)
- **Baseline Features**: Daily precipitation (`rainfall_mm`), maximum temperature (`tmax_c`), minimum temperature (`tmin_c`), relative humidity, 7-day antecedent precipitation, consecutive dry days, and soil moisture stress index.
- **Dataset Fingerprint**: `3fec50c2ef89dbfc` (immutable SHA-256 slice hash).

Any scenario payload requesting simulation on non-anchor coordinates or synthesized blocks without verified Kharif 2024 ground truth is rejected by Check 16 (`INVALID_BASELINE_LOCATION`).

---

## 3. Controlled Scenario Types Catalog

Phase 5B provides exactly 6 controlled scenario exploration types. Arbitrary perturbations outside this catalog are rejected.

| Scenario Type | Identifier | Primary Parameter & Allowed Bounds | Evaluated Sensitivity Indicators | Max Perturbation Dimensions |
|---|---|---|---|---|
| **Sowing Date Shift** | `SOWING_DELAY` | `delay_days`: $[1, 21]$ days | `moisture_stress_pct`, `dry_spell_exposure_days`, `cumulative_rain_mm` | 1 |
| **Supplemental Irrigation** | `IRRIGATION_INTERVENTION` | `start_day`: $[1, 30]$ d, `frequency`: $[1, 7]$ d, `duration`: $[1, 5]$ d | `moisture_stress_pct`, `cumulative_rain_mm` | 3 |
| **Seasonal Rainfall Anomaly** | `SEASONAL_ANOMALY` | `rainfall_anomaly_pct`: $[-60.0\%, +60.0\%]$ | `cumulative_rain_mm`, `moisture_stress_pct`, `waterlogging_risk_pct` | 1 |
| **Monsoon Timing Shift** | `RAINFALL_TIMING_SHIFT` | `shift_days`: $[-14, +14]$ days | `dry_spell_exposure_days`, `moisture_stress_pct` | 2 |
| **Heavy Rain Concentration** | `HEAVY_RAIN_CONCENTRATION` | `concentration_factor`: $[1.0, 2.5]\times$, `window_days`: $[3, 14]$ d | `waterlogging_risk_pct`, `cumulative_rain_mm` | 2 |
| **Compound Multi-Hazard** | `COMBINED_SCENARIO` | `combined_types`: $[2, 3]$ distinct types from above | `moisture_stress_pct`, `waterlogging_risk_pct`, `dry_spell_exposure_days` | 3 |

---

## 4. Deterministic Sensitivity Engine & Perturbation Mathematics

The engine computes scenario responses deterministically from baseline metrics and physical perturbation functions **without machine learning curve fitting or synthetic extrapolation**.

### Mathematical Formulations

1. **Sowing Delay ($\Delta t$)**:
   Translates crop phenological stages into historically drier mid-monsoon intervals:
   $$\text{MoistureStress}_{\text{sim}} = \min(95.0, \text{MoistureStress}_{\text{base}} + (\Delta t \times 2.8\%))$$
   $$\text{DrySpellDays}_{\text{sim}} = \text{DrySpellDays}_{\text{base}} + \text{round}(\Delta t \times 0.25)$$

2. **Supplemental Irrigation ($N_{\text{events}}, d_{\text{dur}}$)**:
   Simulates stress attenuation from scheduled water supply:
   $$\Delta_{\text{alleviation}} = \min(45.0, N_{\text{events}} \times d_{\text{dur}} \times 7.5\%)$$
   $$\text{MoistureStress}_{\text{sim}} = \max(5.0, \text{MoistureStress}_{\text{base}} - \Delta_{\text{alleviation}})$$

3. **Seasonal Rainfall Anomaly ($\alpha$)**:
   Modulates cumulative precipitation volume while maintaining rainfall frequency:
   $$\text{Rainfall}_{\text{sim}} = \max(0.0, \text{Rainfall}_{\text{base}} \times (1.0 + \frac{\alpha}{100}))$$
   $$\text{WaterloggingRisk}_{\text{sim}} = \text{clamp}(0.0, 95.0, \text{WaterloggingRisk}_{\text{base}} + (\alpha \times 0.4\%))$$

4. **Monsoon Intra-Seasonal Timing Shift ($\tau$)**:
   Translates rainfall pulse vectors chronologically without altering total seasonal volume:
   $$\Delta_{\text{dry}} = \text{round}(|\tau| \times 0.35)$$
   $$\text{DrySpellDays}_{\text{sim}} = \text{DrySpellDays}_{\text{base}} + \Delta_{\text{dry}}$$

5. **Heavy Rain Concentration ($C$)**:
   Compresses rainfall volume into episodic convective pulses:
   $$\text{WaterloggingRisk}_{\text{sim}} = \min(95.0, \text{WaterloggingRisk}_{\text{base}} \times (1.0 + (C - 1.0) \times 0.75))$$

---

## 5. Agro-Meteorological Sensitivity Indicators

Four core agro-meteorological indicators are monitored and classified:

1. **Topsoil Moisture Stress (`moisture_stress_pct`)**:
   - Probability that root-zone available soil water falls below 50% field capacity during critical growth windows.
   - Categories: $\text{LOW} (< 25\%)$, $\text{MODERATE} [25\%, 50\%)$, $\text{HIGH} [50\%, 75\%)$, $\text{SEVERE} (\ge 75\%)$.
2. **Waterlogging & Drainage Risk (`waterlogging_risk_pct`)**:
   - Probability that effective rainfall exceeds topsoil infiltration rate for $\ge 48$ consecutive hours.
   - Categories: $\text{LOW} (< 20\%)$, $\text{MODERATE} [20\%, 40\%)$, $\text{HIGH} [40\%, 65\%)$, $\text{SEVERE} (\ge 65\%)$.
3. **Cumulative Seasonal Precipitation (`cumulative_rain_mm`)**:
   - Aggregate precipitation volume over the evaluation horizon.
   - Categories: Deficit ($< 400$ mm), Normal ($[400, 750]$ mm), Surplus ($> 750$ mm).
4. **Dry Spell Hiatus Exposure (`dry_spell_exposure_days`)**:
   - Number of consecutive rain-free days ($< 2.5$ mm/day) during vegetative or reproductive phases.
   - Categories: $\text{LOW} (< 5$ d), $\text{MODERATE} [5, 8)$ d, $\text{HIGH} [8, 12)$ d, $\text{SEVERE} (\ge 12$ d).

---

## 6. Quantitative Delta Evaluation Methodology

Every scenario output produces an array of `IndicatorDelta` objects:
- **Baseline Value**: Empirical benchmark from Kharif 2024 anchor data.
- **Scenario Value**: Deterministically perturbed scenario indicator.
- **Absolute Delta**: $\Delta_{\text{abs}} = V_{\text{sim}} - V_{\text{base}}$.
- **Relative Delta %**: $\Delta_{\text{rel}} = \frac{V_{\text{sim}} - V_{\text{base}}}{V_{\text{base}}} \times 100\%$.
- **Direction**: `INCREASED` ($\Delta_{\text{abs}} > 0.05$), `DECREASED` ($\Delta_{\text{abs}} < -0.05$), or `UNCHANGED`.
- **Severity Transition**: Baseline severity tier vs Scenario severity tier.
- **Scientific Interpretation**: Explains the biophysical mechanism of the shift.

---

## 7. Scenario Envelopes & Bounded Ranges

For each scenario type, the engine evaluates a `ScenarioEnvelope` representing the response range:
- **Minimum Value ($V_{\min}$)**: Lower bound of the sensitivity response under extreme favorable perturbation.
- **Maximum Value ($V_{\max}$)**: Upper bound of the sensitivity response under extreme adverse perturbation.
- **Baseline Value ($V_{\text{base}}$)**: Empirical ground truth benchmark.
- **Median Envelope ($V_{\text{med}}$)**: Central tendency across the allowable parameter spectrum.
- **Origin Labels**: All envelope values carry distinct data origin tags (`OBSERVED`, `BASELINE`, `SCENARIO`, `DERIVED_INDICATOR`).

---

## 8. Non-Causal Explainability & Attribution

Each simulated scenario is accompanied by a structured `ScenarioExplanation` object containing:
1. **Baseline Description**: Kharif 2024 meteorological profile for Bakshi Ka Talab.
2. **Perturbations Applied**: List of applied scenario parameter adjustments.
3. **Indicator Shift Summary**: Plain-language synthesis of primary indicator movements.
4. **Meteorological Drivers**: Meteorological drivers behind the shifts (monsoon trough position, convective pulses, dry spell length).
5. **Assumptions**: Specific operational assumptions (soil texture, uniform infiltration).
6. **Mandatory Non-Causal Statement**:
   > *"Statistical associations reflect historical analog shifts under defined scenario perturbations. Outputs evaluate sensitivity indicators rather than physical or causal guarantees."*

---

## 9. Cryptographic Lineage & Reproducibility

Every scenario execution computes an immutable cryptographic provenance record:
- **Dataset Fingerprint**: SHA-256 fingerprint of the baseline station dataset (`3fec50c2ef89dbfc`).
- **Parameter Hash**: Deterministic SHA-256 hash of sorted input parameters.
- **Lineage Fingerprint**: Combined SHA-256 hash guaranteeing identical inputs yield identical outputs.
- **Artifact Persistence**: Immutable JSON storage under `artifacts/scenarios/{scenario_id}.json`.
- **Engine Version**: `1.0.0` (Scenario Version: `5B.1.0`).

---

## 10. Agronomic Safety Gate & Boundary Enforcement (Checks 14–21)

The Phase 5B `AgronomicSafetyGate.evaluate_scenario()` enforces 8 strict safety checks before any simulation is executed:

| Check # | Check Name | Rule & Validation Condition | Rejection Code |
|---|---|---|---|
| **14** | `SCENARIO_RANGE_CHECK` | Verifies parameters are within allowable scientific ranges | `PARAMETER_OUT_OF_BOUNDS` |
| **15** | `SCENARIO_COMBINATION_CHECK` | Enforces $\le 3$ simultaneous orthogonal dimensions, $\ge 2$ types | `INVALID_SCENARIO_COMBINATION` |
| **16** | `BASELINE_INTEGRITY_CHECK` | Anchored strictly to `UP_LKO_BKT` (Lucknow BKT) | `INVALID_BASELINE_LOCATION` |
| **17** | `OBSERVATION_SCENARIO_SEPARATION` | Rejects payloads attempting to label simulation as `OBSERVED` | `INVALID_CLASSIFICATION` |
| **18** | `YIELD_MODEL_ABSENCE_CHECK` | Scans for and blocks prohibited terms: `yield`, `biomass`, `harvest_output` | `PROHIBITED_YIELD_PREDICTION_CLAIM` |
| **19** | `ECONOMIC_CLAIM_CHECK` | Scans for and blocks prohibited terms: `revenue`, `profit`, `rupee_loss`, `₹`, `$` | `PROHIBITED_ECONOMIC_CLAIM` |
| **20** | `SCENARIO_REPRODUCIBILITY_CHECK` | Enforces deterministic coordinates, crop bindings, parameter hashes | `NON_REPRODUCIBLE_SCENARIO` |
| **21** | `SCENARIO_DISCLOSURE_CHECK` | Enforces mandatory scientific disclaimer on all responses | `MISSING_SCENARIO_DISCLOSURE` |

---

## 11. Strict Absence of Crop Yield & Economic Models

### Scientific Rationale
1. **Dynamic Crop Physiology vs Sensitivity Indicators**: True crop yield modeling requires calibrated dynamic crop growth simulations (e.g., DSSAT, APSIM, InfoCrop) requiring daily leaf area index, nitrogen dynamics, cultivar genetic coefficients, and soil profile chemistry. VarshaSetu does not possess multi-year soil chemical calibrations for UP_LKO_BKT.
2. **Economic Risk & Moral Hazard**: Predicting farmer revenue or monetary losses introduces extreme moral hazard, especially in rainfed Kharif tracts where market price fluctuations and local post-harvest losses dominate net farm income.
3. **Regulatory Integrity**: Government advisory platforms (ICAR/IMD) explicitly separate meteorological situational risk from crop production forecasts. VarshaSetu strictly maintains this scientific separation.

---

## 12. ML Service Architecture & Endpoints

Mounted in `ml-service/app/main.py`:
- `GET /agronomy/scenario-registry`: Controlled scenario catalog with parameter ranges.
- `GET /agronomy/scenarios`: Lists recently executed immutable scenario artifacts.
- `GET /agronomy/scenarios/{id}`: Retrieves full scenario result artifact.
- `POST /agronomy/scenarios/run`: Runs simulation with safety gate validation, returns deltas and envelopes.
- `POST /agronomy/scenarios/compare`: Returns dedicated baseline vs scenario comparative report.
- `POST /agronomy/scenarios/sensitivity`: Computes deterministic response curves across parameter steps.
- `GET /agronomy/scenarios/{id}/sensitivity`: Retrieves sensitivity curves for a scenario.
- `GET /agronomy/scenarios/{id}/explanation`: Retrieves non-causal explanation.
- `GET /agronomy/scenarios/{id}/provenance`: Retrieves cryptographic provenance hashes.
- `POST /agronomy/simulate`: Backward-compatible Phase 5A simulation endpoint.

---

## 13. Backend Gateway & Persistence Architecture

- **Database Migration**: `backend/src/db/migrations/010_scenario_analysis.sql`
  - Extends `scenario_runs` with `scenario_type`, `deltas`, `envelope`, `explanation`, `provenance`, and `scientific_disclaimer`.
  - Creates `scenario_comparisons` table for persisted comparative evaluations.
  - Creates `scenario_sensitivities` table for persisted parameter response curves.
- **Repository**: `backend/src/repositories/scenarioRepository.ts`
- **Controller**: `backend/src/controllers/scenarioController.ts` (proxies to ML Service with resilient fallback and audit persistence).
- **Routes & RBAC**: `backend/src/routes/scenarioRoutes.ts` mounted under `/api/v1/agronomy/scenarios` and `/api/v1/agronomy/scenario-registry`.

---

## 14. Frontend User Interfaces

1. **Farmer What-If Simulator (`FarmerWhatIfPage.tsx`)**:
   - Interactive Scenario Type Selection (6 scenario types with plain-language labels).
   - Bounded sliders and numeric steppers enforcing scientific parameter bounds.
   - Comprehensive Baseline vs Scenario Delta Comparison Table (absolute/relative deltas, direction icons, severity badges, interpretations).
   - Parameter Response Curves data cards showing step-wise indicator shifts.
   - Scenario Envelope card (Min, Max, Baseline, Median).
   - Non-Causal Explanation and Cryptographic Provenance badge.
   - Prominent `SCENARIO_INDICATOR_ONLY` disclaimer banner.
2. **Officer Advisories Page (`OfficerAdvisoriesPage.tsx`)**:
   - Added What-If Agro-Meteorological Sensitivity Monitor section allowing extension officers to inspect sensitivity response ranges for Bakshi Ka Talab without block rankings.
3. **Government Dashboard (`GovernmentDashboardPage.tsx`)**:
   - Added What-If Scenario Analysis & Sensitivity Engine capacity card highlighting 21 active safety checks and 6 controlled scenario types.
4. **Analyst Forecast Lab (`ForecastLabPage.tsx`)**:
   - Added Scenario Analysis Safety Checks (Checks 14–21) showcase and Controlled Scenario Types Catalog.

---

## 15. Verification Suite & Test Coverage

### 1. ML Service Test Suite (`ml-service/`)
- `tests/test_scenario_types.py`: All 6 scenario types verified.
- `tests/test_scenario_sensitivity.py`: Sensitivity response curves, envelopes, and deltas verified.
- `tests/test_scenario_safety_gate.py`: Checks 14–21 thoroughly verified (parameter bounds, combination limits, anchor integrity, yield claim filtering, economic claim filtering).
- `tests/test_scenario_api.py`: All 9 FastAPI endpoints verified.
- **Total ML Service Tests Passing**: **158 passed** across 48 test files.

### 2. Backend Gateway Test Suite (`backend/`)
- `tests/integration/scenarios.test.ts`: Integration tests for registry, simulation run, safety gate 422 rejections, comparison, and sensitivity endpoints.
- **Total Backend Tests Passing**: **80 passed** across 9 test files.
- TypeScript compilation: Clean (`tsc` passes with 0 errors).

### 3. Frontend Test Suite (`frontend/`)
- `src/tests/FarmerWhatIfPage.test.tsx`: Tests rendering of 6 tabs, parameter sliders, disclaimers, and tab switching.
- `src/tests/AdvisoryService.test.ts`: Tests `getScenarioRegistry`, `runScenario`, `compareScenario`, `runSensitivity`.
- **Total Frontend Tests Passing**: **52 passed** across 15 test files.
- Frontend build: Clean (`vite build` passes with 0 errors).

---

## 16. Operational Transition Prerequisites & Phase Boundaries

### Strict Phase 5B Completion Boundary
- **Phase 5B Status**: **COMPLETED**.
- **Phase 5C Status**: **NOT STARTED**.
- **Phase 6 Status**: **NOT STARTED**.
- No crop yield models were introduced.
- No revenue or financial prediction models were introduced.
- No automated SMS, WhatsApp, or Bhashini voice distribution was implemented.
- Operational mode remains strictly `DIAGNOSTIC_ONLY` and data freshness remains `HISTORICAL_ONLY` (Kharif 2024, `UP_LKO_BKT`).
