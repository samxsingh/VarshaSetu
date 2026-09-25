# VarshaSetu REST API Specification (v1)

---

### Overview & Base URL
- **Base URL:** `http://localhost:5001/api/v1`
- **Protocol:** HTTP/1.1 over TLS (HTTPS in production)
- **Content-Type:** `application/json`
- **Authentication:** Standard HTTP Bearer Token (`Authorization: Bearer <jwt_token>`)
- **Version:** `v1`

---

## 1. Standard API Envelopes

### 1.1 Success Response Envelope
All successful requests return HTTP status 200 (or 201 for created resources) and follow this JSON structure:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### 1.2 Error Response Envelope
All error responses adhere to standard HTTP status codes (`400`, `401`, `403`, `404`, `409`, `500`) with error codes:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "lat": "Latitude must be between -90 and 90"
    }
  }
}
```

---

## 2. Health & Telemetry Endpoints

### 2.1 Application Health
- **Endpoint:** `GET /api/v1/health`
- **Auth:** None (Public)
- **Response Example (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "varshasetu-backend",
    "version": "1.0.0",
    "environment": "development",
    "timestamp": "2026-09-25T08:12:41.000Z",
    "uptimeSeconds": 142
  }
}
```

### 2.2 Database & PostGIS Health
- **Endpoint:** `GET /api/v1/health/database`
- **Auth:** None (Public)
- **Response Example (200 OK):**
```json
{
  "success": true,
  "data": {
    "postgres": true,
    "postgis": true,
    "postgisVersion": "3.4.2-compatibility-mode",
    "postgisMode": "compatibility",
    "databaseName": "varshasetu",
    "latencyMs": 2
  }
}
```

---

## 3. Authentication Endpoints

### 3.1 User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Auth:** None (Public)
- **Request Body (Phone + Password or OTP):**
```json
{
  "phoneNumber": "+919876543210",
  "password": "FarmerPassword123!"
}
```
- **Response Example (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "e44d567c-1793-4a18-9742-fa3f2c5d414a",
      "role": "FARMER",
      "fullName": "Ramesh Kumar",
      "phoneNumber": "+919876543210",
      "email": "ramesh.farmer@example.com",
      "preferredLanguage": "hi",
      "permissions": [
        "farmer:profile:read",
        "farmer:profile:write",
        "farmer:advisory:read",
        "farmer:simulator:execute"
      ],
      "isActive": true,
      "createdAt": "2026-09-25T08:08:17.000Z",
      "updatedAt": "2026-09-25T08:12:41.000Z"
    }
  }
}
```

### 3.2 User Registration
- **Endpoint:** `POST /api/v1/auth/register`
- **Auth:** None (Public)
- **Request Body:**
```json
{
  "fullName": "Suresh Patel",
  "phoneNumber": "+919876500001",
  "email": "suresh@example.com",
  "password": "SecurePassword123!",
  "role": "FARMER",
  "preferredLanguage": "hi"
}
```
- **Response (201 Created):** Returns user entity and JWT token.

### 3.3 Get Current Authenticated User
- **Endpoint:** `GET /api/v1/auth/me`
- **Auth:** Required (`Bearer <token>`)
- **Response (200 OK):** Returns the authenticated `UserEntity`.

### 3.4 User Logout
- **Endpoint:** `POST /api/v1/auth/logout`
- **Auth:** Required (`Bearer <token>`)
- **Response (200 OK):** Client discards JWT token from storage.

---

## 4. Geography & Geospatial Endpoints

### 4.1 List States
- **Endpoint:** `GET /api/v1/geography/states`
- **Auth:** None (Public)
- **Response (200 OK):** Array of `StateEntity` items.

### 4.2 List Districts
- **Endpoint:** `GET /api/v1/geography/districts?stateId=<uuid>&page=1&limit=20`
- **Auth:** None (Public)
- **Response (200 OK):** Paginated array of `DistrictEntity` items.

### 4.3 List Blocks
- **Endpoint:** `GET /api/v1/geography/blocks?districtId=<uuid>&page=1&limit=20`
- **Auth:** None (Public)
- **Response (200 OK):** Paginated array of `BlockEntity` items (e.g. Bakshi Ka Talab, Malihabad, Mohanlalganj, Sarojininagar, Gosainganj).

### 4.4 List Gram Panchayats
- **Endpoint:** `GET /api/v1/geography/panchayats?blockId=<uuid>&page=1&limit=20`
- **Auth:** None (Public)
- **Response (200 OK):** Paginated array of `PanchayatEntity` items (e.g. Bhaisamau, Rampur, Mampur, Kamalpur).

### 4.5 List Villages
- **Endpoint:** `GET /api/v1/geography/villages?panchayatId=<uuid>&page=1&limit=20`
- **Auth:** None (Public)
- **Response (200 OK):** Paginated array of `VillageEntity` items.

### 4.6 Spatial Point-in-Polygon Resolution
- **Endpoint:** `GET /api/v1/geography/resolve-point?lat=26.9749&lon=80.9276`
- **Auth:** None (Public)
- **Parameters:**
  - `lat`: Floating point latitude between -90 and 90.
  - `lon`: Floating point longitude between -180 and 180.
- **Response Inside Polygon (200 OK):**
```json
{
  "success": true,
  "data": {
    "matched": true,
    "boundaryAvailable": true,
    "isDemoBoundary": true,
    "source": "DEMO / SYNTHETIC PILOT BOUNDARY (NON-AUTHORITATIVE)",
    "sourceVersion": "PHASE-2-PILOT-v1",
    "block": {
      "id": "e44d567c-1793-4a18-9742-fa3f2c5d414a",
      "code": "UP_LKO_BKT",
      "name": "Bakshi Ka Talab",
      "level": "BLOCK",
      "districtId": "b0fc76e7-383d-4dbd-a164-e252006050da",
      "blockCode": "UP_LKO_BKT",
      "centerCoordinates": {
        "latitude": 26.9749,
        "longitude": 80.9276
      }
    },
    "coordinates": {
      "latitude": 26.9749,
      "longitude": 80.9276
    }
  }
}
```
- **Response Outside Boundaries (200 OK):**
```json
{
  "success": true,
  "data": {
    "matched": false,
    "boundaryAvailable": false,
    "message": "No authoritative or demo boundary contains these coordinates.",
    "coordinates": {
      "latitude": 5.0,
      "longitude": 75.0
    },
    "defaultDemoLocation": {
      "state": "Uttar Pradesh",
      "district": "Lucknow",
      "block": "Bakshi Ka Talab",
      "latitude": 26.9749,
      "longitude": 80.9276
    }
  }
}
```

---

## 5. Role-Based Access Control (RBAC) Specification

| Role | Domain Scope | Example Endpoints Allowed |
| :--- | :--- | :--- |
| **`FARMER`** | Own profile, farm location, crop advisory, what-if simulator | `/auth/me`, `/geography/*` |
| **`OFFICER`** | Multi-panchayat monitoring, bulletins, spatial risk maps | `/auth/me`, `/geography/*` |
| **`GOVERNMENT`** | Regional indicators, forecast provenance, audit trail | `/auth/me`, `/geography/*` |
| **`ANALYST`** | Model registry, hindcasting, feature calibration | `/analyst/model-inspect` |
| **`ADMIN`** | User management, system health, audit logs, configuration | `/admin/system-status` |
