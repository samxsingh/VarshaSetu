# VarshaSetu (वर्षासेतु) — Phase 7B: Decision Support Workspace

## 1. Executive Summary & Purpose
Phase 7B establishes the **Decision Support Workspace** for VarshaSetu (वर्षासेतु), building directly on top of the Phase 7A Operational Intelligence Signal Layer. The Decision Support Workspace empowers all four operational personas—**Farmer**, **Field Officer**, **Government**, and **Climate Analyst**—to inspect operational anomalies with full scientific traceability.

Rather than presenting isolated signals or black-box alarms, the workspace creates an unbroken decision path:
```
SIGNAL → CONTEXT → EVIDENCE → INTERPRETATION → OPERATIONAL NEXT STEP
```

Crucially, this phase adheres to VarshaSetu's core scientific ethics:
- **Zero Fabrication**: When telemetry or model explanations are missing, explicit placeholders (`"NOT AVAILABLE"`, `"PROVENANCE NOT AVAILABLE"`, `"MODEL EXPLANATION NOT AVAILABLE"`) are rendered.
- **Strict Triad Separation**: Event Likelihood (Probability), Statistical Reliability (Confidence), and Operational Mode (Availability) are never conflated into a single misleading percentage.
- **Scientific Guardrails**: Single-season boundaries and `DIAGNOSTIC_ONLY` operational gates are prominently enforced, preventing automated execution of field commands without multi-year hindcast validation.

---

## 2. Architecture & Data Flow
The architecture preserves the established MERN baseline and non-negotiable gateway isolation:
```
React 18 + Vite (DecisionSupportWorkspace Modal / Drawer)
   │
   │ Axios REST (`GET /api/v1/operations/signals/:signalId/context`)
   │ Socket.IO Realtime (`operational_signal` event updates)
   ▼
Node.js 20+ Express Gateway (Authoritative Authentication, RBAC, Spatial Validation)
   │
   ├──────────────────────────────┬──────────────────────────────┐
   ▼                              ▼                              ▼
MongoDB (Mongoose)          ML Gateway (HTTP)             Local In-Memory Cache
- Operational Signals       - Model Explanations (SHAP)   - Aggregated Telemetry
- Provenance Ledgers        - Validation Gates
- User Access Controls
                                  │
                                  ▼
                     Python FastAPI ML Computation
                     (Tree downscalers, calibration, isotonic models)
```

**Key Architectural Rules:**
1. React never communicates directly with FastAPI.
2. Express remains the authoritative API and RBAC enforcement point.
3. Express verifies block-level and district-level geographical access permissions before returning decision support contexts.

---

## 3. API Specifications

### `GET /api/v1/operations/signals/:signalId/context`
Retrieves comprehensive evidence, location context, scientific metrics, SHAP feature contributions, and next inspection suggestions for an operational anomaly signal.

- **Authentication**: Bearer JWT (`Authorization: Bearer <token>`)
- **Authorization**:
  - `ADMIN`, `CLIMATE_ANALYST`, `GOVERNMENT`, `FIELD_OFFICER`: Full access within authorized blocks.
  - `FARMER`: Restricted to signals in their assigned block; internal technical metrics (e.g. `MODEL_STATUS`) return `403 Forbidden`.
- **Response Format**:
```json
{
  "success": true,
  "data": {
    "signalId": "sig_evt_101",
    "signalType": "EVENT",
    "title": "WARNING: HEAVY RAIN RISK",
    "summary": "Expected 24h precipitation exceeds 64.5 mm threshold.",
    "severity": "WARNING",
    "location": {
      "blockId": "UP_LKO_BKT",
      "blockName": "Bakshi Ka Talab",
      "districtName": "Lucknow",
      "stateName": "Uttar Pradesh"
    },
    "timing": {
      "detectedAt": "2024-07-20T10:00:00.000Z",
      "validFrom": "2024-07-20T10:00:00.000Z",
      "validUntil": "2024-07-27T10:00:00.000Z"
    },
    "scientific": {
      "probability": 0.78,
      "confidenceStatus": "CALIBRATED",
      "validationStatus": "VALIDATED",
      "operationalStatus": "DIAGNOSTIC_ONLY",
      "dataFreshness": "HISTORICAL_ONLY",
      "modelReliabilityLabel": "Calibrated using Isotonic Regression"
    },
    "evidence": {
      "sourceReferences": [
        { "id": "evt-101", "type": "EVENT", "label": "Event Heavy Rain" }
      ],
      "provenanceAvailable": true,
      "provenanceDetails": { "hash": "0x4a9b2...", "pipeline": "IMD GFS Ensemble Downscaling" },
      "modelReference": {
        "modelId": "xgboost_heavy_rain_7d",
        "modelFamily": "XGBoost Extreme Event Downscaler",
        "modelVersion": "v2.1.0",
        "algorithm": "Gradient Boosted Decision Trees",
        "calibrationMethod": "Isotonic Regression",
        "ece": 0.042,
        "brierScore": 0.088
      },
      "observationReference": {
        "source": "IMD AWS Lucknow Station",
        "stationId": "AWS-42182",
        "stationName": "Lucknow Agromet Station",
        "variable": "Precipitation 24h Accumulated",
        "resolution": "Hourly Telemetry (~9 km)",
        "observationCount": 168
      },
      "explanation": {
        "available": true,
        "baseValue": 0.22,
        "contributions": [
          {
            "featureName": "convective_available_potential_energy_cape",
            "contribution": 0.35,
            "direction": "increases_risk",
            "description": "Elevated CAPE exceeding 2800 J/kg indicating atmospheric instability"
          }
        ],
        "nonCausalDisclaimer": "Features represent statistical correlation from calibrated ML downscaling, not proven causal drivers."
      },
      "dataHealth": {
        "available": true,
        "providerStatus": "HEALTHY",
        "lastSyncTime": "2024-07-20T09:45:00.000Z",
        "dataFreshness": "HISTORICAL_ONLY",
        "qualityState": "PASS",
        "pipelineStatus": "OPERATIONAL"
      }
    },
    "underlyingEntity": {
      "entityType": "EVENT",
      "entityId": "evt-101",
      "details": { "category": "PRECIPITATION", "thresholdMm": 64.5 }
    },
    "recommendedInspection": "Inspect local rain gauge telemetry and field drainage status.",
    "limitations": [
      "Single-season baseline (Monsoon 2024). Multi-year hindcasting validation pending.",
      "Operational status is strictly DIAGNOSTIC_ONLY."
    ],
    "nextInspections": [
      {
        "label": "Inspect Alert Stream",
        "actionType": "NAVIGATE",
        "target": "/alerts",
        "description": "Review live community and telemetry alert thresholds."
      },
      {
        "label": "Model Card & Registry",
        "actionType": "NAVIGATE",
        "target": "/models",
        "description": "Inspect model calibration curves and SHAP feature registry."
      }
    ]
  },
  "meta": {
    "requestId": "req-dsw-1",
    "timestamp": "2026-09-26T22:00:00.000Z",
    "dataMode": "DEMO"
  }
}
```

---

## 4. Data Structures & Contract Interfaces
Defined symmetrically across `backend/src/services/operational/operationalSignalTypes.ts` and `frontend/src/services/operationalService.ts`:
- `DecisionSupportContext`: Root payload containing signal metadata, location, scientific metrics, evidence chain, and navigation actions.
- `OperationalLocationContext`: Block, district, and state geographic attributes.
- `ScientificContext`: Probability, confidence status, operational status, data freshness, and model reliability.
- `EvidenceContext`: Backing source references, model specifications, observation metadata, and explanation attributions.
- `ExplanationContext`: SHAP feature contributions, base value, and non-causal disclosures.
- `NextInspectionAction`: Deterministic target URLs and descriptions.

---

## 5. Triad of Scientific Truth
A fundamental tenet of VarshaSetu is preventing the misleading conflation of statistical and operational concepts:
1. **Event Likelihood (Probability)**:
   - Evaluated as $P(E | X)$, the calibrated probability of a meteorological event occurring.
   - Example: `78%` for Heavy Rain.
   - If probability cannot be derived, `"NOT AVAILABLE"` is rendered.
2. **Statistical Reliability (Confidence)**:
   - Evaluated from validation curves, Platt scaling, and Expected Calibration Error (ECE).
   - Displayed as categorical or qualitative confidence (`CALIBRATED`, `PASS`, `UNVALIDATED`).
3. **Operational Mode (Availability)**:
   - Evaluated from administrative gates and hindcast coverage.
   - Values: `DIAGNOSTIC_ONLY`, `SIMULATION`, `OPERATIONAL`.
   - Never implies field deployment approval without multi-year hindcast passing.

---

## 6. Evidence Traceability Chain
The workspace visually displays the 4-step chain backing every signal:
1. **Backing Entity**: Type (`EVENT`, `FORECAST`, `ADVISORY`, `DATA_HEALTH`) and authoritative database ID.
2. **Model Pipeline**: Model family (e.g. `XGBoost Extreme Event Downscaler`), version (`v2.1.0`), calibration method, and error metrics.
3. **Ingestion Ground Truth**: Meteorological station name, sensor ID (`AWS-42182`), physical variable, observation count, and spatial resolution (~9 km).
4. **Provenance Ledger**: Verification seal (`VERIFIED` / `ARCHIVED`) with direct link to launch the `ProvenanceDrawer`.

---

## 7. Explainability & Scientific Interpretation
The workspace provides transparent model interpretability:
- **SHAP Feature Importance**: Lists top meteorological features driving the model prediction (e.g. `CAPE`, `relative_humidity_850hpa`, `wind_shear`).
- **Directional Indicators**: Visual indicators showing whether a feature increases or decreases risk.
- **Mandatory Non-Causal Disclosure**:
  > *"Features represent statistical correlation from calibrated ML downscaling, not proven causal drivers."*
- **Fail-Safe**: If SHAP attributions are missing, `"MODEL EXPLANATION NOT AVAILABLE"` is displayed without hallucinating features.

---

## 8. Operational Gating & Scientific Guardrails
- **Single-Season Baseline**: Prominently notes that all data reflects Monsoon 2024. Multi-year hindcasting validation is marked as pending.
- **Automated Agronomic Disablement**: Under `DIAGNOSTIC_ONLY` status, advisory deployment buttons and irrigation pump actuators are locked.
- **Explicit Limitations**: Section 5 of the modal enumerates platform caveats to maintain institutional trust.

---

## 9. Persona Tailoring Matrix

| Persona | Technical Level | Model Reliability View | Explainability (SHAP) | Access Boundary |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer** | High-level actionable | Plain-language ("Calibrated & Verified") | Hidden by default (prevents clutter) | Assigned Block only (`UP_LKO_BKT`) |
| **Field Officer** | Operational | ECE + Brier scores accessible | Visible with non-causal guidance | Assigned District / Block |
| **Government** | Administrative | Summary confidence & spatial reach | Visible summary | State / District scope |
| **Climate Analyst** | Research & QA | Full raw metrics (ECE, Brier, Curves) | Complete feature breakdown & weights | Unrestricted system-wide |

---

## 10. Deterministic Next Inspection Actions
Rather than open-ended queries or automated decision loops, the workspace offers predefined inspection routes:
- **Inspect Alert Stream** (`/alerts`): Telemetry triggers and threshold exceedances.
- **Forecast Verification Lab** (`/forecast-lab`): Ensemble spread and historical comparisons.
- **Model Card & Registry** (`/models`): Calibration curves and hyperparameter specifications.
- **Telemetry & Station Health** (`/data-health`): Ingestion status, missingness, and latency.
- **Operational Advisories** (`/advisories`): Published bulletin logs and distribution status.

---

## 11. Provenance Drawer Integration
- Clicking *"View Full Provenance Ledger →"* opens the integrated `ProvenanceDrawer` modal overlay.
- Inspects cryptographic provenance seals, input dataset hashes, processing pipeline timestamps, and model versioning logs without leaving the workspace.

---

## 12. Realtime Reactivity & Socket.IO Telemetry
- The workspace integrates with `useRealtimeStore`.
- If an incoming Socket.IO packet updates the active signal (`signalId`) while the workspace is open, an unobtrusive banner alerts the user:
  > *"Signal updated just now via Socket.IO. Review latest evidence."*
- Includes a 1-click **Refresh Evidence** action that updates state without interrupting the user's inspection flow.

---

## 13. Accessibility & UX Design
- **WCAG 2.1 AA Compliant**: High contrast typography, clear status color coding, and readable focus outlines.
- **Modal Semantics**: `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="decision-workspace-title"`.
- **Keyboard Navigation**: Pressing `Escape` immediately closes the workspace; body scrolling is locked while modal is open.
- **Visual Theme**: Styled according to VarshaSetu's *Climate Intelligence Editorial* design language (slate backgrounds, subtle emerald and amber accents, crisp typography).

---

## 14. Verification & Testing Matrix

### Backend Integration Tests (`backend/tests/integration/operational_signals.test.ts`)
- `GET /api/v1/operations/signals/:signalId/context`:
  - 200 OK with complete context, location, timing, scientific metrics, and evidence chain.
  - 401 Unauthorized when unauthenticated.
  - 404 Not Found for non-existent signal ID.
  - Returns SHAP explanation with non-causal disclaimer.
  - 403 Forbidden for FARMER on internal system signals (`MODEL_STATUS`).
  - Farmer tailored view omits technical ECE/Brier scores while providing human-readable reliability.
  - Full access for Officer, Government, and Admin roles.
- **Total Backend Tests**: 185 / 185 passed.

### Frontend Unit & Component Tests (`frontend/src/tests/DecisionSupportWorkspace.test.tsx`)
- Renders workspace modal with signal details and scientific status trio.
- Displays evidence chain with model and observation references.
- Displays SHAP feature contributions and non-causal disclaimer.
- Handles missing explanation gracefully (`MODEL EXPLANATION NOT AVAILABLE`).
- Handles missing provenance gracefully (`PROVENANCE NOT AVAILABLE`).
- Renders Farmer tailored view without raw ECE and Brier stats.
- Renders deterministic next inspection navigation buttons.
- Notifies user when realtime socket updates arrive for active signal.
- Closes on Escape key press and Close button click.
- **Total Frontend Tests**: 133 / 133 passed.

### Python ML Service Tests (`ml-service/tests/*`)
- All 202 ML service tests pass.

---

## 15. Production Readiness & Next Phase Roadmap
- **Production Builds**: Backend and Frontend production builds compile with zero errors (`tsc` + Vite).
- **Zero Fabrication**: Confirmed that all missing fields return honest fallbacks without artificial numbers.
- **Status**: Phase 7B is complete, verified, and locked. Ready for Phase 7C (Automated Operational Workflows & Notification Orchestration).
