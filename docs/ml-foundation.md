# VarshaSetu ML Scientific Foundation & Baseline Forecasting Engine
**Phase 4A Technical Architecture & Scientific Guide**

---

## 1. Scientific Objectives & Guiding Principle

The core objective of Phase 4A is to transform the validated meteorological datasets assembled in Phase 3 into a scientifically sound, reproducible forecasting foundation and establish rigorous empirical baselines before introducing advanced machine learning ensembles.

VarshaSetu adheres strictly to the product principle:
> **"Complex intelligence underneath. Simple decisions on top."**

Scientific correctness and empirical transparency take precedence over impressive-looking output. Every baseline model output carries:
- Model version and algorithm identity
- Training, validation, and test periods
- Geographic identifier and resolution
- Precise target definition and threshold parameters
- Raw and calibrated probabilities (disclosed as `NOT_CALIBRATED` if sample size is insufficient)
- Formal skill score comparison against empirical climatology
- Cryptographic provenance and data quality status

---

## 2. Scientific Forecast Target Definitions

All forecasting targets are centralized under [`ml-service/app/targets/`](file:///Users/sameersingh/Desktop/VarshaSetu/ml-service/app/targets/):

### Target A — Monsoon Onset (`MonsoonOnsetDetector`)
- **Scientific Rationale:** Identifies the arrival of the Indian Summer Monsoon (ISMR) over the local block.
- **Criteria:** A multi-day rainfall surge within the Kharif onset window (June 1 – July 15) accumulating $\ge 25.0\text{ mm}$ over 3 consecutive days with at least 2 qualifying rainy days ($\ge 2.5\text{ mm}$, standard IMD rainy day definition).
- **Target Output:** `onset_observed` (0 or 1), `onset_date` (first qualifying rainy day of the burst). Forward targets: `target_onset_7d`, `target_onset_14d`.
- **Disclaimer:** Operational IMD onset classification combines rainfall with synoptic wind shear (850 hPa westerlies) and OLR.

### Target B — False Monsoon Onset (`FalseOnsetDetector`)
- **Scientific Rationale:** A premature rainfall surge that triggers farmer sowing, followed immediately by an extended dry spell that desiccates newly germinated seeds.
- **Criteria:** Candidate onset trigger satisfied, followed within 14 days by $\ge 7$ consecutive dry days (daily rain $< 1.0\text{ mm}$) before sustained monsoon establishment.
- **Target Output:** `false_onset_observed` (0 or 1), `false_onset_date`, `dry_spell_days_after`, `risk_context`. Forward target: `target_false_onset_14d`.

### Target C — Dry Spell / Break Monsoon (`DrySpellDetector`)
- **Scientific Rationale:** Protracted dry spells during the vegetative and reproductive crop stages induce moisture stress.
- **Criteria:**
  - **Ordinary Dry Spell:** $\ge 5$ consecutive dry days (daily rain $< 1.0\text{ mm}$).
  - **Candidate Break Monsoon:** $\ge 10$ consecutive dry days during core monsoon months (July–August).
- **Target Output:** `dry_spell_active` (0 or 1), `duration_days`, `start_date`, `end_date`, `break_monsoon_candidate`. Forward targets: `target_dry_spell_7d`, `target_dry_spell_14d`.

### Target D — Heavy Rainfall Event (`HeavyRainDetector`)
- **Scientific Rationale:** Identifies convective or synoptic downpours causing localized waterlogging, fertilizer leaching, and flash runoff.
- **Threshold Source:** India Meteorological Department (IMD) Agrometeorological Standard.
  - Moderate / Light: $\ge 2.5\text{ mm/day}$
  - Heavy: $\ge 64.5\text{ mm/24h}$
  - Very Heavy: $\ge 115.5\text{ mm/24h}$
  - Extremely Heavy: $\ge 204.5\text{ mm/24h}$
- **Target Output:** `is_heavy_rain_observed` (0 or 1), `rainfall_amount_mm`, `category`. Forward targets: `target_heavy_rain_7d`, `target_heavy_rain_14d`.

### Target E — Rainfall Departure & Anomaly (`RainfallAnomalyCalculator`)
- **Scientific Rationale:** Quantifies whether upcoming cumulative rainfall will exceed or fall short of the local historical normal.
- **Formulas:**
  $$\text{Absolute Anomaly} = P_{\text{obs}} - P_{\text{clim}}$$
  $$\text{Percentage Departure} = \frac{P_{\text{obs}} - P_{\text{clim}}}{P_{\text{clim}}} \times 100\%$$
- **Zero-Climatology Protection:** When $P_{\text{clim}} < 0.5\text{ mm}$, division by zero is prevented, clamping departure and setting `insufficient_climatology = True`.
- **Categories:**
  - `VERY_DEFICIENT`: $\le -60\%$
  - `DEFICIENT`: $-59\%$ to $-20\%$
  - `NORMAL`: $-19\%$ to $+19\%$
  - `EXCESS`: $+20\%$ to $+59\%$
  - `HIGHLY_EXCESS`: $\ge +60\%$

---

## 3. Feature Registry & Lag Specifications

Predictor features are formally cataloged in [`FEATURE_REGISTRY`](file:///Users/sameersingh/Desktop/VarshaSetu/ml-service/app/features/registry.py):

| Category | Feature Name | Native Unit | Transformation / Cadence | Scientific Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Antecedent Rain** | `rainfall_1d` | mm | Daily $P_t$ | Immediate surface moisture |
| | `rainfall_3d` | mm | 3-day rolling sum | Short-term convective memory |
| | `rainfall_7d` | mm | 7-day rolling sum | Weekly root-zone moisture |
| | `rainfall_14d` | mm | 14-day rolling sum | Fortnightly water balance |
| | `rainy_days_7d` | days | 7-day count of $P \ge 2.5\text{ mm}$ | Rain frequency vs intensity |
| | `consecutive_dry_days` | days | Running count ($P < 1.0\text{ mm}$) | Agricultural drought driver |
| | `consecutive_wet_days` | days | Running count ($P \ge 1.0\text{ mm}$) | Waterlogging & fungal pressure |
| **Thermodynamics** | `temperature_2m_max_c` | °C | Daily maximum | Vapor pressure deficit driver |
| | `temperature_2m_min_c` | °C | Daily minimum | Nocturnal boundary layer |
| | `diurnal_temp_range_c` | °C | $T_{\text{max}} - T_{\text{min}}$ | Cloud cover / break indicator |
| **Atmospheric** | `surface_pressure_hpa` | hPa | Daily mean | Monsoon trough oscillation |
| | `wind_speed_10m_mps` | m/s | Daily max | Low-level jet strength |
| **Teleconnections** | `nino34_anomaly` | °C | Monthly | Global ENSO phase |
| | `nino34_lag_1m` | °C | 1-month shift | Oceanic memory persistence |
| | `iod_dmi` | °C | Monthly | Indian Ocean Dipole state |
| | `iod_dmi_lag_1m` | °C | 1-month shift | Equatorial SST gradient memory |
| | `mjo_amplitude` | dimless | Daily ($\sqrt{\text{RMM1}^2 + \text{RMM2}^2}$) | Intraseasonal wave strength |
| | `mjo_phase` | 1–8 | Daily octant | Convective active region |
| | `mjo_amplitude_lag_7d` | dimless | 7-day shift | Intraseasonal wave propagation |
| **Temporal Cycles** | `day_of_year` | 1–366 | Calendar | Seasonal progression |
| | `sin_doy`, `cos_doy` | [-1, 1] | Harmonic encoding | Cyclical smooth representation |

---

## 4. Chronological Splitting & Leakage Prevention

**Golden Rule:** Random train/test splitting is strictly forbidden for time-series forecasting.

- **Splitter:** [`ChronologicalSplitter`](file:///Users/sameersingh/Desktop/VarshaSetu/ml-service/app/training/splitter.py) partitions data strictly forward in time:
  $$\text{TRAIN } (70\%) \longrightarrow \text{VALIDATION } (15\%) \longrightarrow \text{TEST } (15\%)$$
- **Leakage Auditor:** [`LeakageAuditor`](file:///Users/sameersingh/Desktop/VarshaSetu/ml-service/app/training/leakage.py) programmatically intercepts:
  1. **Temporal Inversion / Overlap:** Checks that $\max(\text{train\_date}) < \min(\text{val\_date}) < \min(\text{test\_date})$.
  2. **Target Leakage:** Verifies that no target column or forward-looking feature is present in predictor matrix $X$.
  3. **Preprocessing Leakage:** Normalization parameters (mean, standard deviation) are fitted strictly on the training partition and applied statelessly to validation and test.
  4. **Violation Handling:** Throws an explicit `DataLeakageError` that halts pipeline execution immediately.

---

## 5. Climatology Baseline & Skill Score Methodology

The first baseline against which every model must compete is empirical climatology ([`ClimatologyEngine`](file:///Users/sameersingh/Desktop/VarshaSetu/ml-service/app/baselines/climatology.py)).

- For binary targets, the climatological expectation is the historical event frequency:
  $$p_{\text{clim}} = \frac{1}{N_{\text{train}}} \sum_{i=1}^{N_{\text{train}}} y_i$$
- For continuous targets, the climatological expectation is the historical mean:
  $$\mu_{\text{clim}} = \frac{1}{N_{\text{train}}} \sum_{i=1}^{N_{\text{train}}} P_i$$

### Skill Score Quantification ([`BaselineComparator`](file:///Users/sameersingh/Desktop/VarshaSetu/ml-service/app/evaluation/comparison.py))
- **Brier Skill Score (BSS):**
  $$BSS = 1 - \frac{\text{Brier}_{\text{model}}}{\text{Brier}_{\text{climatology}}}$$
  - $BSS > 0$: Model provides positive forecast skill over historical climatology.
  - $BSS \le 0$: Model fails to improve over the naive historical baseline.
- **MAE Skill Score (MSS):**
  $$MSS = 1 - \frac{\text{MAE}_{\text{model}}}{\text{MAE}_{\text{climatology}}}$$

---

## 6. Baseline Statistical Models

1. **Penalized Logistic Regression ([`BaselineLogisticModel`](file:///Users/sameersingh/Desktop/VarshaSetu/ml-service/app/models/baseline/logistic.py)):**
   - Targets: `HEAVY_RAIN`, `DRY_SPELL`, `MONSOON_ONSET`.
   - $L_2$-regularized gradient descent with numerically stable sigmoid activation.
   - Outputs calibrated class probabilities $\hat{p} \in [0.0, 1.0]$.
2. **Ridge Regression ([`BaselineRegressionModel`](file:///Users/sameersingh/Desktop/VarshaSetu/ml-service/app/models/baseline/regression.py)):**
   - Target: `RAINFALL_AMOUNT` (cumulative 7d and 14d millimeters).
   - Closed-form regularized normal equation: $w = (X^T X + \alpha I)^{-1} X^T y$.
   - Non-negative physical constraint $\hat{y} = \max(0.0, \hat{y})$.

---

## 7. Probability Calibration Foundation ([`ProbabilityCalibrator`](file:///Users/sameersingh/Desktop/VarshaSetu/ml-service/app/models/calibration.py))

- Implements **Platt Scaling** (logistic sigmoid calibration on validation logits) and monotonic mapping.
- **Scientific Honesty Guardrail:** Calibration requires at least $N \ge 30$ validation samples and at least 5 positive and negative event occurrences.
- If sample count is insufficient, the system explicitly marks `calibration_status = "NOT_CALIBRATED"` and outputs the raw uncalibrated probability with full disclosure.

---

## 8. Experiment Registry & Reproducibility ([`ExperimentRegistry`](file:///Users/sameersingh/Desktop/VarshaSetu/ml-service/app/experiments/registry.py))

Every training run automatically generates a machine-readable JSON artifact under [`ml-service/artifacts/experiments/`](file:///Users/sameersingh/Desktop/VarshaSetu/ml-service/artifacts/experiments/):
```json
{
  "experiment_id": "exp_dry_spell_7d_20260925_092726",
  "model_name": "LogisticRegressionBaseline",
  "model_version": "1.0.0-baseline",
  "target_name": "DRY_SPELL",
  "horizon_days": 7,
  "training_period": "2024-06-01 to 2024-08-20",
  "validation_period": "2024-08-21 to 2024-09-08",
  "test_period": "2024-09-09 to 2024-09-24",
  "metrics": {
    "test": {
      "brier_score": 0.3347,
      "sample_count": 18
    }
  },
  "comparison_to_climatology": {
    "brier_skill_score": 0.0915,
    "has_skill_over_climatology": true,
    "scientific_summary": "Model demonstrates positive skill over historical climatology (BSS = +0.0915)..."
  },
  "calibration_status": "NOT_CALIBRATED",
  "git_commit": "e572419",
  "status": "EVALUATED"
}
```

---

## 9. Known Scientific Limitations & Assumptions

1. **Local Demonstration Period:** The current dataset spans the 2024 Kharif monsoon window (122 daily records for Lucknow). While sufficient for baseline architecture validation, multi-decadal reanalysis (1990–2024) is required for operational 30-year climatology.
2. **Atmospheric Circulation Indicators:** Onset currently uses agrometeorological multi-day rainfall burst logic; coupling with 850 hPa wind shear and Outgoing Longwave Radiation (OLR) is scheduled for Phase 4B.
3. **Linearity of Baselines:** Logistic and Ridge models serve as minimum-skill benchmarks; non-linear convective teleconnections require tree-based gradient boosting ensembles.

---

## 10. Scope Boundary: What Phase 4B Will Implement

> [!IMPORTANT]
> **Phase 4B was NOT started in this phase.**  
> When instructed, Phase 4B will introduce:
> - Multi-decadal ERA5-Land ingestion (1990–2024) for robust 30-year climatology normals.
> - Production Gradient Boosted Trees (LightGBM and XGBoost) for non-linear downscaling.
> - Hierarchical spatial pooling across district, block, and panchayat levels.
> - Isotonic and Platt probability calibration over full validation cohorts.
> - SHAP (Shapley Additive Explanations) feature contribution attribution for agricultural explainability.
