# VarshaSetu — Security Architecture & Hardening Report (Phase 6A)

## 1. Executive Summary

Phase 6A hardens the VarshaSetu platform across its three tiers:
1. **Frontend Web Client** (React 18 + Vite + Tailwind CSS + Lucide Icons)
2. **Backend API Gateway** (Node.js + Express + TypeScript + PostgreSQL/PostGIS)
3. **Machine Learning & Meteorological Microservice** (Python 3.11 + FastAPI + Scikit-Learn + XGBoost)

The platform enforces zero-trust parameter validation, cryptographic integrity, role-based access control, privilege escalation protection, rate limiting, and safe operational disclosures.

---

## 2. Authentication & Session Security

### 2.1 JSON Web Token (JWT) Lifecycle
- Tokens are signed with HMAC-SHA256 (`HS256`) using an environment-provided key (`JWT_SECRET`).
- Token claims include: `userId`, `role`, `permissions`, and `assignedLocationId`.
- Expiry is configured by default to 7 days (`JWT_EXPIRES_IN=7d`), validated on every authenticated request via `requireAuth` middleware.
- Client storage is managed in browser memory / secure storage with explicit logout revocation.

### 2.2 Password Hashing
- User credentials are encrypted using `bcryptjs` with salt round cost factor 10.
- Raw passwords and hashes are never exposed in API responses or log statements.

### 2.3 Privilege Escalation Rejection
- Self-registration (`POST /api/v1/auth/register`) strictly validates the requested role.
- If a user attempts to register an elevated role (`ADMIN`, `GOVERNMENT`, `OFFICER`, `ANALYST`) without administrator authorization, the gateway rejects the request with `403 FORBIDDEN` (`code: FORBIDDEN`, "Self-registration is restricted to FARMER role").
- Elevated role assignments must be provisioned directly by an administrator or seeded through audited migrations.

### 2.4 Production OTP Guard
- In development/demonstration environments, farmer convenience OTP bypass (`otp: "123456"`) is permitted.
- In production (`NODE_ENV === "production"`), hardcoded OTP bypass is strictly rejected with `401 UNAUTHORIZED` unless a live, verified SMS gateway provider is configured.

---

## 3. Role-Based Access Control (RBAC) Matrix

The system enforces granular authorization across 5 persona roles:

| Persona Role | Allowed Endpoints & Scopes | Unauthorized Access Behavior |
| :--- | :--- | :--- |
| **FARMER** | Advisory retrieval, What-If simulation, multilingual toggle, audio playback, personal read receipt | 403 Forbidden on administrative, officer broadcast, or raw model inspection endpoints |
| **OFFICER** | District and panchayat aggregations, block advisory review, safety gate status, bulletin broadcast simulation | 403 Forbidden on user management, model training, or data source deletion |
| **GOVERNMENT** | Spatial monsoon risk heatmaps, administrative provenance, validation gate audits, multi-block summaries | 403 Forbidden on raw model hyperparameter modification |
| **ANALYST** | Model comparison, SHAP feature attributions, hindcast folds, calibration curves, drift inspection | 403 Forbidden on user administration or production notification override |
| **ADMIN** | System health, database connection pool, user roles, data source registration, audit logs | Superuser permissions across all scopes |

---

## 4. Network, Payload & Header Hardening

### 4.1 Security Headers
The Express backend utilizes `helmet()` and FastAPI microservice implements `SecurityAndTracingMiddleware` to inject:
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing exploits.
- `X-Frame-Options: SAMEORIGIN` / `DENY`: Protects against clickjacking.
- `X-XSS-Protection: 1; mode=block`: Activates cross-site scripting filters.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`: Enforces HTTPS in production.

### 4.2 Cross-Origin Resource Sharing (CORS)
- CORS origin is environment-driven (`CORS_ORIGIN`).
- In production, wildcard `["*"]` origins are strictly prohibited.
- Backend and ML service validate incoming origin against configured domains (e.g. `http://localhost:5173,http://localhost:5001`).

### 4.3 Request Size & Payload Sanitization
- Body parsers enforce a strict `1MB` payload limit (`express.json({ limit: '1mb' })`).
- Malformed JSON payloads trigger clean `400 BAD_REQUEST` responses without leaking server stack traces.

### 4.4 Sliding-Window Rate Limiting
In-memory sliding-window rate limiters (`backend/src/middleware/rateLimitMiddleware.ts`) are deployed on sensitive endpoints:
- **Authentication (`/api/v1/auth/*`)**: 30 requests / minute.
- **Scenario Simulation (`/api/v1/agronomy/scenarios/*`)**: 60 requests / minute.
- **Voice Synthesis (`/api/v1/advisories/:id/synthesize`)**: 60 requests / minute.
- Returns `429 TOO_MANY_REQUESTS` with `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` headers.

---

## 5. Injection & Path Traversal Prevention

### 5.1 Parameterized SQL Queries
- All PostgreSQL database queries in `backend/src/repositories/` utilize strictly parameterized `$1, $2, ...` query placeholders.
- Zero raw string concatenation exists in database query construction.

### 5.2 Path Traversal Sanitization
- `DatasetStore` in `ml-service/app/storage/dataset_store.py` applies deterministic regex identifier validation (`^[a-zA-Z0-9_\-]+$`) on dataset and feature names before filesystem access.
- Characters like `../`, `..\\`, or absolute root paths are strictly rejected.

### 5.3 Internal Path Redaction
- System health endpoints (`GET /health`) report abstract storage status (`AVAILABLE` / `UNAVAILABLE`) rather than exposing server filesystem paths on disk.

---

## 6. Environment Startup Validation

- **Backend Gateway**: Validates environment variables with Zod at process bootstrap. In production mode (`NODE_ENV === "production"`), boot fails immediately if `JWT_SECRET` is left as the default development secret.
- **ML Microservice**: Validates storage paths, port bindings, database URL, and CORS configuration at startup.
