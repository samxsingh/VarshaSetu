# VarshaSetu (वर्षासेतु) — Operational Downscaling & Gradient-Boosted Ensembles (Phase 4B)

## 1. Executive Summary & Scientific Scope

Phase 4B upgrades the VarshaSetu scientific forecasting foundation from linear baselines (Phase 4A) to operational gradient-boosted tree ensembles (**XGBoost** and **LightGBM**) integrated with **SHAP Tree Explainability** and rigorous spatial downscaling constraints.

### Strict Scope Boundary
- **Phase 1A, 1B, 1C, Phase 2, Phase 3, Phase 4A**: COMPLETED.
- **Phase 4B**: COMPLETED.
- **Phase 5**: **NOT STARTED**. Farmer-facing final advisory engines, WhatsApp/SMS distribution, voice synthesis (Bhashini), and production agronomic rule triggers belong strictly to future phases.

---

## 2. Real Data Availability & Empirical Constraints

VarshaSetu adheres strictly to scientific honesty. The platform refuses to simulate synthetic 30-year histories or claim false micro-scale resolution:

| Attribute | Current Observational Reality | Operational Governance |
| :--- | :--- | :--- |
| **Temporal Coverage** | Kharif 2024 (June 1, 2024 – September 30, 2024) = 122 daily records | Marked as `PARTIAL` status by `DataAvailabilityAuditor`. Standard 30-year WMO climatology requirements are explicitly flagged as unfulfilled. |
| **Spatial Resolution** | Bakshi Ka Talab Block Centroid (`UP_LKO_BKT`: 26.9749°N, 80.9276°E, ~9 km gridded) | `DownscalingEnforcer` strictly attributes forecasts to `BLOCK` resolution. Micro-station village/panchayat claims are rejected. |
| **Teleconnections** | NOAA Niño 3.4 SST Anomaly, BoM Indian Ocean Dipole DMI, BoM MJO (RMM1, RMM2) | Ingested via Phase 3 with causal lag alignment (1-month and 3/7/14-day lags) to eliminate future leakage. |

---

## 3. Tree Ensemble Architecture

### Model Paradigms Implemented
1. **XGBoost Tree Ensemble (`XGBoostTreeModel`)**:
   - Depth-wise tree growth with exact greedy split enumeration.
   - Regularization: L1 penalty (`reg_alpha = 0.1`) and L2 penalty (`reg_lambda = 1.0`).
   - Shallow tree depth (`max_depth = 3`) and conservative learning rate (`0.03`) prevent memorization of single-season samples.
2. **LightGBM Leaf-Wise Tree Ensemble (`LightGBMTreeModel`)**:
   - Best-first leaf-wise growth with histogram binning.
   - Dynamic `min_child_samples` adaptation to support regional sample sizes safely without underflow.
   - L1/L2 penalties and subsampling (`0.8`).

### Multi-Model Benchmark Schema
Every target is evaluated against all four paradigms on the **EXACT SAME CHRONOLOGICAL TEST SLICE** (`train_ratio=0.70`, `val_ratio=0.15`, `test_ratio=0.15`):
$$\text{Brier Skill Score (BSS)} = 1 - \frac{\text{BS}_{\text{model}}}{\text{BS}_{\text{climatology}}}$$
$$\text{MAE Skill Score (MSS)} = 1 - \frac{\text{MAE}_{\text{model}}}{\text{MAE}_{\text{climatology}}}$$

| Benchmark Model | Target Task | Primary Evaluator | Calibration |
| :--- | :--- | :--- | :--- |
| **Historical Climatology** | Classification / Regression | Empirical Frequency / Mean | Uncalibrated Reference |
| **Phase 4A Regularized Linear** | Logistic / Ridge Regression | L2 Regularized Baseline | Platt / Isotonic |
| **XGBoost Ensembles** | XGBClassifier / XGBRegressor | Log-loss / RMSE Early Stopping | Platt Scaling Guardrails |
| **LightGBM Ensembles** | LGBMClassifier / LGBMRegressor | Log-loss / RMSE Early Stopping | Platt Scaling Guardrails |

---

## 4. SHAP Tree Explainability Engine

Model trust is established via exact Shapley additive explanations computed with `shap.TreeExplainer`:
$$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i$$

### Meteorological Categorization
Feature attributions are mapped into physical domain categories:
- **Antecedent Soil & Surface Moisture**: `rainfall_1d`, `rainfall_3d`, `rainfall_7d`, `rainy_days_7d`, `consecutive_dry_days`.
- **Global Climate Teleconnections**: `nino34_anomaly`, `iod_dmi`, `mjo_amplitude`, `mjo_phase`.
- **Atmospheric Thermodynamics**: `temperature_2m_max_c`, `temperature_2m_min_c`, `diurnal_temp_range_c`.
- **Synoptic Dynamics**: `surface_pressure_hpa`, `wind_speed_10m_mps`.
- **Astronomical Seasonality**: `day_of_year`, `sin_doy`, `cos_doy`.
- **Topography & Coordinates**: `spatial_latitude`, `spatial_longitude`, `spatial_elevation_m`, `spatial_dist_to_district_km`.

---

## 5. API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/models/status` | `GET` | Returns operational readiness disclosure, spatial resolution (`BLOCK`), and data availability status (`PARTIAL`). |
| `/api/v1/models/registry` | `GET` | Lists all trained model artifacts, task types, feature counts, and calibration flags. |
| `/api/v1/models/comparison` | `GET` | Runs multi-model benchmark on identical test partition across Climatology, Baselines, XGBoost, and LightGBM. |
| `/api/v1/models/datasets` | `GET` | Provides scientific catalog of ingested datasets with SHA256 integrity checksums. |
| `/api/v1/models/:id` | `GET` | Retrieves full model metadata, configuration, and feature importances. |
| `/api/v1/models/:id/explanations`| `GET` | Retrieves global SHAP feature importances and domain driver rankings. |
| `/api/v1/models/train` | `POST` | Triggers downscaling training pipeline and model persistence. |
| `/api/v1/models/:id/explain` | `POST` | Generates sample-level SHAP explanation report. |
