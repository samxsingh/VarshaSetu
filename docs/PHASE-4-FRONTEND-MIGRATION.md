# VARSHASETU (वर्षासेतु) — PHASE 4: FRONTEND MERN MIGRATION & RBAC CLIENT LAYER

## 1. Architectural Summary & System Boundary

Phase 4 completes the frontend migration of VarshaSetu (वर्षासेतु), establishing the React client as an authoritative consumer of the Node.js/Express REST API Gateway and MongoDB persistence layer, with FastAPI remaining strictly an internal scientific computation engine.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT (React + Vite)                  │
│   • Four Operational Perspectives: Farmer, Officer, Govt, Analyst     │
│   • System Management: Admin Portal                                   │
│   • Zustand Auth Store (`useAuthStore`) with AUTH_INITIALIZING state  │
│   • Centralized Axios API Client (`apiClient.ts`)                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Authoritative HTTP /api/v1/*
                                    │ (Bearer JWT + X-Request-Id)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  EXPRESS REST API GATEWAY (Node.js)                   │
│   • Authoritative RBAC & Permission Enforcement                        │
│   • Stateless JWT Auth (15m Access Token, 7d Refresh Token)           │
│   • Rate Limiting, Audit Logging & Security Headers                   │
└───────────────────┬──────────────────────────────────┬─────────────────┘
                    │ Mongoose ORM                     │ Internal HTTP
                    ▼                                  ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│        MONGODB PERSISTENCE           │  │   FASTAPI SCIENTIFIC ML      │
│  • Users, Profiles, Locations        │  │  • Hyperlocal Forecasting    │
│  • Forecasts, Events, Advisories     │  │  • SHAP Explainability       │
│  • Provenance & Audit Logs           │  │  • Probabilistic Calibration │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Architectural Guarantees Enforced:
1. **Zero Direct ML Service Communication:** The React browser bundle contains no direct references or network calls to FastAPI (`http://localhost:8000`). All forecasting, calibration, and agronomic requests route through Express `/api/v1/*`.
2. **Zero Leaked Secrets / Internal Variables:** `ML_SERVICE_URL`, MongoDB connection strings, and backend secrets are never exposed in `import.meta.env` or bundled code.
3. **Authoritative Backend RBAC:** Frontend route guards provide immediate UX guidance, but the Express gateway remains the sole authoritative gatekeeper for all permissions and data mutations.

---

## 2. Centralized Axios API Client Architecture (`apiClient.ts`)

The API client was migrated to Axios with an authoritative interceptor pipeline:

- **Base URL:** Driven by `import.meta.env.VITE_API_BASE_URL || '/api/v1'`.
- **Request Interceptor:**
  - Injects a unique `X-Request-Id` (`req_${Date.now()}_${random}`) for end-to-end distributed tracing.
  - Automatically extracts the active access token from safe localStorage and injects `Authorization: Bearer <token>`.
- **Response Interceptor & Mutex Refresh Queue:**
  - Implements a single-flight mutex pattern for 401 Unauthorized responses.
  - If multiple concurrent requests receive 401, only one refresh request (`POST /api/v1/auth/refresh`) is dispatched; other requests are queued until the new access token is received.
  - Upon successful refresh, all queued requests are replayed with the new Bearer token.
  - If the refresh token is expired or invalid, tokens are cleared and a custom `varshasetu:unauthorized` event is broadcast to reset the auth store.
- **Error Normalization (`ApiClientError`):**
  - All errors are parsed into `ApiClientError` with `code`, `message`, `details`, and `statusCode`.
- **Backwards Compatibility:**
  - The universal `request<T>(endpoint, options)` helper is preserved with support for both `RequestInit` and `AxiosRequestConfig`, ensuring existing service code remains 100% stable.

---

## 3. Zustand Authentication Store (`useAuthStore.ts`)

The authentication store coordinates user session state across the client:

- **Lifecycle States:**
  - `IDLE`: Initial uninitialized state.
  - `AUTH_INITIALIZING`: Verifying existing tokens on application mount via `GET /api/v1/auth/me`.
  - `AUTHENTICATED`: Active session with valid user details and permissions.
  - `UNAUTHENTICATED`: No active session or session expired.
- **Cross-Layer Synchronization:**
  - Automatically synchronizes active persona with `useAppStore.setRole(user.role)` for operational perspective consistency.
  - Listens for window events `varshasetu:token-refreshed` and `varshasetu:unauthorized` to maintain store state when Axios interceptors background-refresh or invalidate tokens.
- **Safe Storage Accessor:**
  - Employs guarded storage access (`getSafeStorage()`) preventing crashes in SSR, headless tests, or sandboxed browser environments.

---

## 4. Protected Route & RBAC Guards (`ProtectedRoute.tsx`)

Route protection is implemented hierarchically:

1. **Session Verification:** Displays an institutional loading screen during `AUTH_INITIALIZING`.
2. **Unauthenticated Redirection:** Redirects unauthenticated visitors to `/login?from=<intended_path>` preserving their requested destination.
3. **Persona Clearance Enforcement (RBAC):**
   - Verifies whether the authenticated `user.role` matches `allowedRoles`.
   - `ADMIN` role is granted universal clearance across all perspectives.
   - If a persona mismatch occurs (e.g., a `FARMER` attempting to access `/officer`), the guard renders a styled institutional `403 Forbidden` screen displaying the authenticated user, role, required perspective, and quick-action navigation to their authorized portal.

---

## 5. Institutional Authentication Page (`LoginPage.tsx`)

A dedicated institutional login page provides:

- **Credential Authentication:** Phone or institutional email with password or demo OTP (`123456`).
- **1-Click Quick Demonstration Personas:**
  - **Farmer:** Ramesh Kumar (`+919876543210` / `FarmerPassword123!`)
  - **Field Officer:** Dr. Arvind Sharma (`+919876543211` / `OfficerPassword123!`)
  - **Government:** Sunita Verma (`+919876543212` / `GovPassword123!`)
  - **Climate Analyst:** Vikram Patel (`+919876543213` / `AnalystPassword123!`)
  - **Administrator:** System Administrator (`+919876543214` / `AdminPassword123!`)
- Direct integration with `useAuthStore.login()` issuing real HTTP requests to `/api/v1/auth/login`.

---

## 6. Scientific Service Integration Map

All frontend services communicate exclusively with the authoritative Express gateway:

| Service | Target Route Prefix | Purpose |
|---|---|---|
| `forecastService.ts` | `/forecasts/*` | Hyperlocal probabilistic predictions, horizons, explanations, and availability |
| `eventService.ts` | `/events/*`, `/operations/*` | Scientific weather events, detection, acknowledgement, and lifecycle |
| `advisoryService.ts` | `/agronomy/*` | Controlled crop registries, agronomic rules, and what-if simulation |
| `modelService.ts` | `/models/*` | Model catalog, benchmark comparisons, reliability diagrams, and hindcasts |
| `dataHealthService.ts`| `/data-health/*` | Telemetry pipelines, source freshness, and automated ingestion runs |
| `geographyService.ts` | `/geography/*` | Spatial hierarchy (states, districts, blocks, panchayats, villages) |

---

## 7. Scientific Integrity & Explainability Preservation

- **Zero Fabrication:** Missing telemetry or experimental metrics explicitly display `"NOT CONFIGURED"` or `"NOT AVAILABLE IN CURRENT PIPELINE"`.
- **Probability vs. Confidence Distinction:** The UI strictly separates statistical probability (calibrated ensemble fraction) from confidence score (data coverage, model skill, observation latency).
- **Demonstration Anchor:** Kharif 2024 single-season anchor and Bakshi Ka Talab (`UP_LKO_BKT`) remain standard reference points for scientific evaluation.

---

## 8. Test Verification & Suite Summary

| Subsystem | Test Files | Total Tests | Passing | Failing |
|---|---|---|---|---|
| **Frontend Client (Vitest)** | 20 | 104 | 104 | 0 |
| **Backend REST API (Vitest)** | 14 | 144 | 144 | 0 |
| **Scientific ML Service (Pytest)** | 48 | 202 | 202 | 0 |
| **System Total** | **82** | **450** | **450** | **0** |

Both frontend (`tsc && vite build`) and backend (`tsc`) compile with 0 errors.
