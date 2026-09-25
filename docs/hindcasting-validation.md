# VarshaSetu (वर्षासेतु) — Multi-Year Validation, Hindcasting & Forecast Skill Evaluation (Phase 4D)

## 1. Executive Summary & Scientific Scope

Operational weather forecasting systems require rigorous retrospective verification across multiple historical seasons—a process known in meteorology as **hindcasting** (or retrospective out-of-sample backtesting). In agro-meteorological decision support, evaluating models solely on a single season or random cross-validation splits can produce dangerously optimistic skill estimates. Atmospheric teleconnections (e.g., El Niño–Southern Oscillation / ENSO, Indian Ocean Dipole / IOD) and intra-seasonal oscillations (e.g., Madden-Julian Oscillation / MJO) vary dramatically across years, creating substantial inter-annual variability in forecast accuracy.

**Phase 4D** implements VarshaSetu's complete multi-year validation, walk-forward expanding window hindcasting, and forecast skill evaluation framework. It provides:
1. **MultiYearValidationGate**: Gating mechanism enforcing minimum data requirements ($\ge 5$ complete seasons, event counts, missingness thresholds) before operational validation certification is granted.
2. **Chronological Walk-Forward Backtesting**: Expanding-window folds guaranteeing strict temporal causality with zero future information leakage:
   $$\max(\text{train\_date}) < \min(\text{val\_date}) < \min(\text{test\_date})$$
3. **Multi-Horizon Evaluation Matrix**: Automated evaluation across 1-day, 3-day, 7-day, 14-day, 21-day, and 30-day forecast horizons for all operational targets.
4. **Inter-Annual Performance Stability**: Quantifies cross-season variance and detects degraded seasons using robust distribution statistics (median, IQR, min/max).
5. **Feature Distribution Drift Detection**: Audits Population Stability Index (PSI) and two-sample Kolmogorov-Smirnov (KS) test statistics to identify distribution shifts across early vs. late monsoon periods.
6. **Feature Coverage & Provenance Auditing**: Verifies observational continuity and source provenance across all meteorological variables.
7. **Immutable Reproducibility Artifacts**: Deterministic JSON manifests with SHA-256 dataset fingerprints.

### Strict Scope Boundary
- **Phases 1A through 4C**: COMPLETED.
- **Phase 4D**: COMPLETED.
- **Phase 4E, Phase 4F & Phase 5**: **NOT STARTED**. Agronomic decision rules, farmer-facing final advisories, What-If simulation engine, voice synthesis (Bhashini), and SMS/WhatsApp distribution channels belong to subsequent phases and have NOT been implemented.

---

## 2. Scientific Data Reality & Multi-Year Validation Gate

### 2.1 The Data Sufficiency Criteria
For a meteorological model to be certified for operational deployment under VarshaSetu's scientific framework, it must pass the `MultiYearValidationGate` under the following criteria:

| Gate Criterion | Requirement | Rationale | Kharif 2024 Archive Status |
| :--- | :--- | :--- | :--- |
| **Observation Years** | $\ge 5$ distinct years | Captures ENSO / IOD phase variations across cycles | **1 Year (2024)** — FAILED |
| **Complete Seasons** | $\ge 5$ complete seasons | Avoids truncation artifacts and incomplete monsoon cycles | **1 Season (2024)** — FAILED |
| **Observation Count** | $\ge 600$ total records | Sufficient statistical power for extreme event tails | **122 Records** — FAILED |
| **Target Event Balance** | $\ge 30$ pos / neg events | Ensures non-degenerate ROC-AUC and Brier skill scores | **Varies by target** — PARTIAL |
| **Missingness Threshold** | $\le 5.0\%$ missingness | Guarantees temporal continuity without excessive imputation | **0.0% missing** — PASSED |
| **Temporal Duplication** | 0 duplicate timestamps | Prevents duplicate weighting in loss functions | **0 duplicates** — PASSED |
| **Schema Consistency** | 19 core features present | Ensures feature space alignment across years | **19/19 present** — PASSED |
| **Block Coverage** | $\ge 1$ target block | Ensures localized geographical anchoring | **UP_LKO_BKT** — PASSED |

### 2.2 Operational Validation Gate Evaluation
On the current historical archive (Bakshi Ka Talab, Kharif 2024: June 1 to September 30, 2024, 122 daily records), the gate strictly evaluates as:
```json
{
  "status": "INSUFFICIENT_DATA",
  "operational_validation_allowed": false,
  "total_years": 1,
  "required_years": 5,
  "exclusion_reasons": [
    "Available observation years (1) is less than the required minimum (5 seasons)."
  ]
}
```
**Scientific Honesty Commitment**: Under no circumstances does the system bypass this gate or fabricate synthetic historical seasons. When data is insufficient, operational multi-year validation is declared **INACTIVE**, and within-season diagnostic expanding backtests are presented with explicit scientific disclosures.

---

## 3. Walk-Forward Expanding Window Folds

### 3.1 Temporal Partitioning Strategy
Random K-Fold cross-validation destroys the temporal order of meteorological data, leading to severe lookahead leakage due to atmospheric autocorrelation. VarshaSetu enforces walk-forward expanding window folds.

For a multi-year archive, the training window expands year-by-year while the test window steps forward by one season:
- **Fold 1**: Train on $[Y_1, \dots, Y_k]$, Validate on $[Y_{k+1}]$, Test on $[Y_{k+2}]$
- **Fold 2**: Train on $[Y_1, \dots, Y_{k+1}]$, Validate on $[Y_{k+2}]$, Test on $[Y_{k+3}]$

For the single-season Kharif 2024 archive, diagnostic within-season expanding folds are generated:
- **Fold 1 (Early Season)**:
  - Training: `2024-06-01` to `2024-06-30` (30 days)
  - Validation: `2024-07-01` to `2024-07-20` (20 days)
  - Test: `2024-07-21` to `2024-08-10` (21 days)
  - Cutoff: `2024-06-30`
- **Fold 2 (Mid/Late Season)**:
  - Training: `2024-06-01` to `2024-07-31` (61 days)
  - Validation: `2024-08-01` to `2024-08-30` (30 days)
  - Test: `2024-08-31` to `2024-09-30` (31 days)
  - Cutoff: `2024-07-31`

### 3.2 Temporal Leakage Assertion
Every fold strictly asserts:
$$\max(\text{train\_dates}) < \min(\text{val\_dates}) < \min(\text{test\_dates})$$
Features for any fold are computed exclusively from data available prior to the `feature_cutoff` timestamp.

---

## 4. Multi-Horizon Forecast Skill Evaluation

Hindcast backtests evaluate performance across six operational time horizons:
1. **1-Day Horizon (Nowcast / Immediate)**
2. **3-Day Horizon (Short-Range Advisory)**
3. **7-Day Horizon (Medium-Range Weekly Planning)**
4. **14-Day Horizon (Sub-seasonal Bi-weekly Outlook)**
5. **21-Day Horizon (Extended-Range Outlook)**
6. **30-Day Horizon (Monthly Trend)**

### 4.1 Target Definitions Evaluated
- **`HEAVY_RAIN`**: Binary classification indicator for daily rainfall $\ge 64.5\text{ mm}$ (IMD heavy rainfall threshold).
- **`DRY_SPELL`**: Binary indicator for $\ge 3$ consecutive days with rainfall $< 2.5\text{ mm}$.
- **`MONSOON_ONSET`**: Binary indicator for regional monsoon arrival criteria.
- **`DAILY_RAINFALL`**: Continuous quantitative rainfall prediction (mm/day).

### 4.2 Probabilistic & Quantitative Metrics

#### Brier Score (BS)
Measures the mean squared error of probability forecasts:
$$\text{BS} = \frac{1}{N} \sum_{i=1}^N (p_i - y_i)^2$$

#### Brier Skill Score (BSS) vs. Climatology
Quantifies the percentage improvement of the model over the empirical climatological baseline:
$$\text{BSS} = 1 - \frac{\text{BS}_{\text{model}}}{\text{BS}_{\text{climatology}}}$$
- $\text{BSS} > 0$: Model outperforms historical climatology.
- $\text{BSS} \le 0$: Model provides zero or negative predictive value relative to baseline.

#### Log Loss (Cross-Entropy)
Penalizes confidently incorrect probabilistic predictions:
$$\text{LogLoss} = -\frac{1}{N} \sum_{i=1}^N \left[ y_i \ln p_i + (1 - y_i) \ln(1 - p_i) \right]$$

#### Expected Calibration Error (ECE)
Evaluates reliability across 10 probability bins:
$$\text{ECE} = \sum_{m=1}^{10} \frac{|B_m|}{N} \left| \bar{o}_m - \bar{p}_m \right|$$

#### Discrimination Metrics (ROC-AUC & PR-AUC)
Measures the model's ability to discriminate between positive and negative events.
> [!IMPORTANT]
> **Single-Class Test Fold Guardrail**: If a test fold contains only negative (or only positive) observations (number of classes $< 2$), ROC-AUC and PR-AUC are mathematically undefined. The calculator strictly returns `None` (rendered as `N/A (single class)` or `null` in JSON), never substituting $0.0$, $0.5$, or fabricated values.

#### Continuous Regression Metrics
For `DAILY_RAINFALL`:
- **Mean Absolute Error (MAE)**: $\frac{1}{N} \sum |y_i - \hat{y}_i|$
- **Root Mean Squared Error (RMSE)**: $\sqrt{\frac{1}{N} \sum (y_i - \hat{y}_i)^2}$
- **Mean Skill Score (MSS)**: $1 - \frac{\text{MSE}_{\text{model}}}{\text{MSE}_{\text{mean\_climatology}}}$

---

## 5. Cross-Season Performance Stability

Atmospheric forecasting skill often fluctuates across years due to regime shifts in the monsoon circulation. VarshaSetu evaluates inter-annual stability through:
1. **Year-by-Year Metric Tracking**: Records Brier Score, BSS, MAE, and RMSE individually for each historical season.
2. **Distribution Statistics**: Computes non-parametric summary statistics:
   - `mean`, `median`, `std`, `min`, `max`, and `iqr` (Interquartile Range).
3. **Degraded Year Detection**: Flags any season where a model's skill drops by $> 25\%$ relative to its multi-year median.
4. **Data Gate Handling**: When the archive contains $< 3$ seasons, stability status is flagged as `INSUFFICIENT_SEASONS`, preventing premature variance conclusions.

---

## 6. Feature Distribution Drift Audit

Changes in measurement instruments, sensor degradation, land-use change, or intra-seasonal meteorological shifts can introduce feature drift. The drift audit compares early-season ($T_{\text{ref}}$: June–July) against late-season ($T_{\text{comp}}$: August–September) distributions.

### 6.1 Population Stability Index (PSI)
Features are partitioned into 10 quantiles based on the reference period:
$$\text{PSI} = \sum_{b=1}^{10} \left( \%_{\text{comp}, b} - \%_{\text{ref}, b} \right) \times \ln\left( \frac{\%_{\text{comp}, b} + \epsilon}{\%_{\text{ref}, b} + \epsilon} \right)$$
- $\text{PSI} < 0.10$: **NEGLIGIBLE** (Stable distribution, no action required).
- $0.10 \le \text{PSI} < 0.25$: **MODERATE** (Slight distribution shift, monitor).
- $\text{PSI} \ge 0.25$: **SIGNIFICANT** (Substantial drift, model retraining advised).

### 6.2 Kolmogorov-Smirnov (KS) Test
Performs a two-sample Kolmogorov-Smirnov test to detect non-parametric distribution divergence:
$$D = \sup_x \left| F_{\text{ref}}(x) - F_{\text{comp}}(x) \right|$$
Significant shift is identified when $D \ge 0.20$ and $p < 0.05$.

---

## 7. Feature Coverage & Provenance Inspection

Before hindcasting execution, all variables are inspected for temporal continuity:
- **Spatial Target**: Block UP_LKO_BKT (Bakshi Ka Talab, Lucknow, Uttar Pradesh).
- **Temporal Span**: 2024-06-01 to 2024-09-30 (122 calendar days).
- **Core Meteorological Features**: `rainfall`, `rainfall_lag1`, `rainfall_lag2`, `rainfall_lag3`, `rainfall_lag7`, `rainfall_roll7_mean`, `tmax`, `tmin`, `temp_mean`, `temp_range`, `rh_mean`, `wind_speed`, `surface_pressure`.
- **Climate Teleconnections**: `enso_nino34`, `iod_index`.
- **Data Continuity**: 100% complete daily observations (0 missing days, 0.0% missingness).

---

## 8. Models Compared in Hindcasting Benchmark

| Model Pipeline | Category | Features Used | Calibration Status |
| :--- | :--- | :--- | :--- |
| **Empirical Climatology** | Non-parametric Baseline | Day-of-year historical probabilities | Climatological reference |
| **Linear Baseline** | Logistic / Ridge Regression | Core meteorological lags | Uncalibrated baseline |
| **XGBoost Trees** | Gradient-Boosted Trees | All 19 meteorological & climate features | Raw tree probabilities |
| **LightGBM Trees** | Histogram Gradient-Boosted Trees | All 19 meteorological & climate features | Raw tree probabilities |
| **Calibrated XGBoost** | Platt Calibrated Ensemble | Same feature set + Platt sigmoid mapping | Calibrated if Gate passed; Diagnostic otherwise |

---

## 9. Reproducibility & Artifact Storage

Hindcast experiments generate immutable JSON artifacts stored in `ml-service/artifacts/hindcasts/`:
- Artifact naming: `hindcast_<target>_<horizon>d_<timestamp>_<uuid>.json`
- Each artifact records:
  - Complete configuration (target, horizon, models, spatial block)
  - Dataset SHA-256 fingerprint
  - Walk-forward fold boundaries and row counts
  - Per-model, per-fold evaluation metrics
  - Multi-year gate status and scientific disclosures

---

## 10. API Reference

### Microservice Endpoints (`ml-service` :8001)
- `GET /hindcasting/status`: Hindcasting engine health, phase metadata, and gate summary.
- `GET /hindcasting/gate`: Full MultiYearValidationGate evaluation report.
- `GET /hindcasting/folds`: Walk-forward expanding window folds with date boundaries.
- `GET /hindcasting/results`: Latest hindcasting benchmark results for target & horizon.
- `GET /hindcasting/results/{experiment_id}`: Retrieve specific immutable hindcast manifest.
- `GET /hindcasting/stability`: Cross-season stability and distribution statistics.
- `GET /hindcasting/drift`: Population Stability Index (PSI) and KS drift statistics.
- `GET /hindcasting/coverage`: Feature completeness and temporal provenance report.
- `POST /hindcasting/run`: Trigger asynchronous/synchronous hindcasting backtest.

### Backend Gateway Endpoints (`backend` :5001)
- `GET /api/v1/models/hindcasting/status`
- `GET /api/v1/models/hindcasting/gate`
- `GET /api/v1/models/hindcasting/folds`
- `GET /api/v1/models/hindcasting/results`
- `GET /api/v1/models/hindcasting/results/:experimentId`
- `GET /api/v1/models/hindcasting/stability`
- `GET /api/v1/models/hindcasting/drift`
- `GET /api/v1/models/hindcasting/coverage`
- `POST /api/v1/models/hindcasting/run`

---

## 11. Verification & Testing Summary

| Test Suite | Location | Tests | Status |
| :--- | :--- | :--- | :--- |
| **Multi-Year Validation Gate** | `ml-service/tests/test_multiyear_gate.py` | 5 | PASSED |
| **Walk-Forward Folds** | `ml-service/tests/test_hindcast_folds.py` | 5 | PASSED |
| **Hindcasting Runner & Metrics** | `ml-service/tests/test_hindcasting.py` | 5 | PASSED |
| **Season Stability Analyzer** | `ml-service/tests/test_stability.py` | 5 | PASSED |
| **Feature Drift Detector** | `ml-service/tests/test_drift.py` | 5 | PASSED |
| **Feature Coverage Inspector** | `ml-service/tests/test_feature_coverage.py` | 4 | PASSED |
| **Full ML Service Pytest Suite** | `ml-service/tests/` | **71** | **ALL PASSED** |
| **Backend Integration Suite** | `backend/tests/integration/` | **45** | **ALL PASSED** |
| **Frontend Component Suite** | `frontend/src/tests/` | **19** | **ALL PASSED** |

**Zero TypeScript or build errors** across `backend/` (`tsc`) and `frontend/` (`tsc && vite build`).
