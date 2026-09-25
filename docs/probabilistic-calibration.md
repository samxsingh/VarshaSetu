# VarshaSetu (वर्षासेतु) — Probabilistic Calibration, Model Validation & Scientific Reliability (Phase 4C)

## 1. Executive Summary & Scientific Scope

In meteorological downscaling and agricultural decision support, **raw predicted probabilities cannot be directly operationalized**. Standard machine learning algorithms (including gradient-boosted trees such as XGBoost and LightGBM) optimize scoring rules that frequently yield uncalibrated confidence estimates. In agricultural contexts:
- An overconfident prediction of heavy rainfall ($>64.5\text{ mm}$) can cause farmers to cancel necessary sowing or spraying operations prematurely.
- An underconfident prediction can leave crops vulnerable to severe waterlogging, pest outbreaks, or washouts.

**Phase 4C** establishes the scientific calibration and validation engine for VarshaSetu. It implements rigorous post-hoc calibration algorithms, reliability diagram generation, Expected Calibration Error (ECE), Murphy (1973) Brier score decomposition, and continuous residual uncertainty estimation, all protected by strict **Data Sufficiency Gatekeepers**.

### Strict Scope Boundary
- **Phases 1A through 4C**: COMPLETED.
- **Phase 4D**: COMPLETED.
- **Phase 4E, Phase 4F & Phase 5**: **NOT STARTED**. Farmer-facing advisory generation, WhatsApp/SMS distribution, voice synthesis (Bhashini), and production agronomic rule triggers are strictly isolated to subsequent phases.

---

## 2. Scientific Calibration Methodologies

VarshaSetu implements two canonical calibration paradigms evaluated via chronological cross-validation:

### 2.1 Platt Scaling (Sigmoid / Logistic Calibration)
Platt scaling maps raw uncalibrated scores or logits $f(x)$ to calibrated probabilities via a univariate logistic function:
$$P(y=1 \mid f) = \frac{1}{1 + \exp(A \cdot f(x) + B)}$$
Parameters $A$ and $B$ are estimated on the validation fold by minimizing cross-entropy (negative log-likelihood) using L-BFGS-B:
$$\min_{A, B} -\sum_{i=1}^{N_{val}} \left[ y_i \ln p_i + (1 - y_i) \ln(1 - p_i) \right]$$

**Suitability**: Parametric, low-variance, resistant to overfitting on modest sample sizes ($100 \le N < 1000$).

### 2.2 Isotonic Regression (Non-Parametric Step-Function)
Isotonic calibration fits a non-parametric isotonic (monotonically non-decreasing) step function using the Pool Adjacent Violators Algorithm (PAVA):
$$\min_{\hat{y}} \sum_{i=1}^{N_{val}} (y_i - \hat{y}_i)^2 \quad \text{subject to } \hat{y}_i \le \hat{y}_j \text{ whenever } f(x_i) \le f(x_j)$$

**Suitability**: Non-parametric, capable of correcting arbitrary non-monotonic distortions, but requires large sample sizes ($N \ge 1000$) to avoid severe step-like overfitting.

### 2.3 Chronological Expanding-Window Validation
To respect the **arrow of time** in atmospheric processes, cross-validation for calibration parameters does not use randomized K-Fold splits. Instead, it utilizes **expanding-window chronological folds**:
- Fold 1: Train on $[t_0, t_k]$, Calibrate/Validate on $[t_{k+1}, t_{k+m}]$
- Fold 2: Train on $[t_0, t_{k+m}]$, Calibrate/Validate on $[t_{k+m+1}, t_{k+2m}]$
This guarantees that calibration parameters are never fit on future meteorological states.

---

## 3. Reliability Verification & Error Decompositions

### 3.1 10-Bin Empirical Reliability Diagrams
Predicted probabilities are partitioned into 10 uniform intervals $B_m = (\frac{m-1}{10}, \frac{m}{10}]$ for $m \in \{1, \dots, 10\}$. For each bin $m$:
$$\bar{p}_m = \frac{1}{|B_m|} \sum_{i \in B_m} \hat{p}_i, \qquad \bar{o}_m = \frac{1}{|B_m|} \sum_{i \in B_m} y_i$$
- **Perfect Calibration**: $\bar{o}_m = \bar{p}_m$ (points lie exactly on the $45^\circ$ diagonal).
- **Empty Bins**: Bins with zero samples ($|B_m| = 0$) are preserved as `None` or omitted from error summations—they are **never** filled with synthetic interpolations.

### 3.2 Calibration Error Metrics
- **Expected Calibration Error (ECE)**: Weighted average difference between predicted confidence and empirical frequency:
  $$\text{ECE} = \sum_{m=1}^{M} \frac{|B_m|}{N} \left| \bar{o}_m - \bar{p}_m \right|$$
- **Maximum Calibration Error (MCE)**: Worst-case deviation across all populated bins:
  $$\text{MCE} = \max_{m: |B_m| > 0} \left| \bar{o}_m - \bar{p}_m \right|$$

### 3.3 Murphy (1973) Brier Score Decomposition
The classic quadratic error metric, Brier Score (BS), is mathematically decomposed into three physically meaningful atmospheric verification terms:
$$\text{BS} = \frac{1}{N} \sum_{i=1}^N (\hat{p}_i - y_i)^2 \approx \text{REL} - \text{RES} + \text{UNC}$$

| Component | Mathematical Definition | Physical Interpretation | Desirable Direction |
| :--- | :--- | :--- | :--- |
| **Reliability (REL)** | $\sum_{m=1}^M \frac{\|B_m\|}{N} (\bar{p}_m - \bar{o}_m)^2$ | Direct calibration error. Measures how close empirical frequency is to forecast probability. | **Minimize** ($\to 0$) |
| **Resolution (RES)** | $\sum_{m=1}^M \frac{\|B_m\|}{N} (\bar{o}_m - \bar{o})^2$ | Discriminative capacity. Measures how much bin frequencies differ from the climatological mean $\bar{o}$. | **Maximize** |
| **Uncertainty (UNC)** | $\bar{o} (1 - \bar{o})$ | Inherent variance of the climate system. Independent of the model. | Property of nature |

VarshaSetu's pipeline explicitly verifies the mathematical identity $(|\text{BS} - (\text{REL} - \text{RES} + \text{UNC})| < 0.05)$ and flags any discrepancy.

### 3.4 Continuous Residual Uncertainty Estimation
For regression targets (e.g., quantitative precipitation, temperature extremes), probabilistic bounds are modeled from the empirical residual distribution $e_i = y_i - \hat{y}_i$:
- Quantile Bounds: $P_{10}$ (10th percentile), $P_{50}$ (median), $P_{90}$ (90th percentile).
- Guardrail: Sample sizes $< 20$ return `status: INSUFFICIENT_DATA` rather than publishing unstable parametric intervals.

---

## 4. Scientific Honesty & The Data Sufficiency Gatekeeper

### 4.1 Engineering Guardrail Thresholds
To prevent premature or fraudulent operational deployment, `CalibrationDataGate` enforces strict non-negotiable criteria before any calibrator can be marked operational:

| Gate Rule | Threshold | Rationale |
| :--- | :--- | :--- |
| `min_calibration_samples` | $\ge 100$ | Logistic and isotonic regressions overfit drastically on small validation sets. |
| `min_calibration_positive` | $\ge 30$ | Rare extreme weather events (e.g., heavy downpours) require sufficient positive observations. |
| `min_calibration_negative` | $\ge 30$ | Sufficient non-event observations to anchor baseline probabilities. |
| `min_calibration_years` | $\ge 5$ seasons | Monsoonal interannual variability (ENSO, IOD) cannot be calibrated from a single monsoon. |
| `min_test_samples` | $\ge 30$ | Minimum sample count required for statistically meaningful test evaluation. |

### 4.2 Observational Reality: Kharif 2024 Dataset
Under the current single-season observation set (Bakshi Ka Talab Block, Lucknow, June 1 – September 30, 2024 = 122 daily records):
- **Validation Partition**: $18$ daily records.
- **Positive Heavy Rain Events ($>64.5\text{ mm}$)**: $0$ events in the validation partition.
- **Multi-Year Coverage**: Single year ($2024$).

### 4.3 Honest System Behavior
1. **Gate Status**: `CalibrationDataGate` strictly returns **`INSUFFICIENT_DATA`**.
2. **Operational Status**: `operational_calibration_active: false`.
3. **Calibrator Selection**: `active_calibrator_type: "NONE"`.
4. **Analyst Presentation**: Calibration diagrams and Brier decompositions are flagged as **`DIAGNOSTIC_ONLY`**.
5. **No Synthetic Manipulation**: Zero fabricated calibration curves, zero invented multi-year metrics.

---

## 5. System Integration & API Endpoints

### 5.1 ML Service Calibration Endpoints
- `GET /calibration/status`: Global calibration engine status and data gate rules.
- `GET /calibration/models`: Lists model calibration metadata and operational status.
- `GET /calibration/models/{model_id}`: Detailed calibration parameters (Platt A/B weights, sample sizes).
- `GET /calibration/models/{model_id}/reliability`: 10-bin reliability diagram points, ECE, MCE, and Murphy Brier decomposition.
- `GET /calibration/comparison`: Multi-model raw vs calibrated comparison across evaluated benchmarks.
- `POST /calibration/run`: Triggers chronological calibration pipeline and artifact persistence.

### 5.2 Backend Proxy Endpoints
- `GET /api/v1/models/calibration/status`
- `GET /api/v1/models/calibration/comparison`
- `GET /api/v1/models/calibration/:id`
- `GET /api/v1/models/calibration/:id/reliability`
- `POST /api/v1/models/calibration/run`

### 5.3 UI Analyst Diagnostic View
- **Operational Calibration Status Badge**: Clearly displays `Operational Calibration Inactive (GATE STATUS: INSUFFICIENT_DATA)`.
- **SVG Reliability Diagram**: Plots empirical bin points against the perfect calibration diagonal with sample size $N$ annotations.
- **Brier Decomposition Card**: Displays Murphy (1973) partition ($\text{BS} \approx \text{REL} - \text{RES} + \text{UNC}$) with identity verification.
- **Raw vs Calibrated Benchmark Table**: Discloses raw Brier, calibrated Brier, ECE, and diagnostic status for every benchmarked model.
