# VarshaSetu (वर्षासेतु) — Phase 5: Real-Time Operational Event Infrastructure

## Document Metadata
- **Status:** COMPLETED
- **Phase:** 5 (MERN Real-Time Event Infrastructure)
- **Architecture Principle:** ONE SCIENTIFIC LAYER → FOUR OPERATIONAL PERSPECTIVES
- **Perspectives:** Farmer, Field Officer, Government, Climate Analyst
- **Demonstration Anchor:** Lucknow District (`UP_LKO_BKT`), Kharif 2024
- **Operational Mode:** `DIAGNOSTIC_ONLY`

---

## 1. Architecture Overview

Phase 5 establishes the bidirectional, real-time operational synchronization layer of VarshaSetu. The real-time subsystem bridges backend state mutations (forecast generations, event detections, threshold exceedances, data ingestion updates, and advisory modifications) with the React/Vite operational client through Socket.IO WebSockets and fallback polling transports.

```
       +--------------------------------------------------------+
       |                  React 18 + Vite                       |
       |  (Farmer, Officer, Government, Climate Analyst, Admin)  |
       +----------------------------+---------------------------+
                     |              ^
                     | REST API     | WebSockets (WSS/WS)
                     | (/api/v1/*)  | (/socket.io/*)
                     v              |
       +--------------------------------------------------------+
       |            Node.js / Express API Gateway               |
       |         HTTP Server + Socket.IO Server Engine          |
       |  - JWT Authentication Middleware                       |
       |  - Authoritative Room Segmentation & RBAC Isolation    |
       |  - Payload Sanitization & DTO Serialization            |
       |  - RealtimeService Broadcaster                         |
       +----------------------------+---------------------------+
                     |              |
      Persist/Query  |              | Downstream ML Requests
                     v              v
       +--------------------+  +--------------------------------+
       | MongoDB + Mongoose |  |  FastAPI Scientific ML Service |
       | Database Records   |  |  (Standalone ML Algorithms)    |
       +--------------------+  +--------------------------------+
```

### Strict Non-Bypass Guarantees
1. **Frontend Isolation:** The React frontend communicates strictly with Express REST endpoints (`/api/v1/*`) and the Express Socket.IO server (`/socket.io/*`). Direct browser-to-FastAPI connections are forbidden by CORS and architectural boundaries.
2. **Authoritative State:** Real-time events are emitted exclusively following verified database persistence and authoritative validation in Express controllers.
3. **No ML in Node.js:** Algorithmic forecasting, SHAP explainability, Platt scaling, and tree models remain in FastAPI. Express orchestrates ingestion, persists records, and broadcasts standardized events.

---

## 2. Socket.IO Handshake & Authentication

The Socket.IO server is secured at the handshake layer via `socketAuthMiddleware`:

- **Token Discovery:** Examines `handshake.auth.token`, `handshake.headers.authorization` (`Bearer <token>`), and `handshake.query.token`.
- **JWT Verification:** Validates tokens using `verifyAuthToken()` against the system's `JWT_SECRET`.
- **Context Injection:** Attaches verified `userId`, `role`, `email`, and `assignedBlock` to `socket.data.user`.
- **Denial Behavior:** Handshakes with invalid, expired, or malformed credentials immediately emit `Authentication error: Invalid or expired token` and terminate the connection before room allocation or event listening.

---

## 3. Authoritative Room Segmentation & RBAC Isolation

To guarantee operational security, spatial data boundaries, and strict role isolation, clients cannot arbitrarily join rooms. Room allocation is verified via `canJoinRoom()` and automatically initialized via `getAutomaticRooms()`.

### Automatic Room Assignments
Upon verified handshake, sockets are auto-joined to:
1. `user:<userId>` — Private unicast channel for individual alerts and personal notifications.
2. `role:<role>` — Broad role multicast channel (`role:FARMER`, `role:OFFICER`, `role:GOVERNMENT`, `role:ANALYST`, `role:ADMIN`).
3. `system:announcements` — Global broadcast channel for critical platform maintenance announcements.
4. `block:<assignedBlock>` — Block centroid multicast channel (if the user has an assigned operational block, e.g. `UP_LKO_BKT`).

### RBAC Access Matrix for Custom Room Joins
| Room Type / Prefix | Allowed Roles | Authorization Rules |
| :--- | :--- | :--- |
| `user:<id>` | Self only, ADMIN | Users cannot snoop on other users' private queues. |
| `role:<role>` | Role match, ADMIN | Farmers cannot join `role:OFFICER` or `role:GOVERNMENT`. |
| `block:<id>` | FARMER, OFFICER, GOV, ANALYST, ADMIN | Farmers/Officers can only join authorized or assigned blocks. Admin/Government has universal access. |
| `system:announcements` | All authenticated | Universal listener channel. |
| `system:health` | ANALYST, ADMIN | Diagnostic telemetry restricted to technical roles. |

---

## 4. Real-Time Event Specifications & Schemas

All messages over the Socket.IO transport use strict, sanitized DTO schemas (`backend/src/realtime/types.ts`) preventing internal infrastructure leakage (e.g., MongoDB `_id`, DB connection strings, FastAPI URLs).

### Core Real-Time Events
1. `event:created` & `event:updated` (`ScientificEventDTO`):
   - `eventId`, `eventType`, `forecastId`, `blockId`, `detectedAt`, `validFrom`, `validUntil`, `probability`, `threshold`, `unit`, `severity`, `confidenceStatus`, `operationalStatus`, `dataFreshness`, `validationStatus`, `explanationReference`, `state`, `description`, `deduplicationHash`.
2. `event:acknowledged` (`ScientificEventDTO`):
   - Emitted when an extension officer or administrator acknowledges an operational event. Contains `acknowledgedBy` and `acknowledgedAt`.
3. `event:resolved` (`ScientificEventDTO`):
   - Emitted when an operational event transition is resolved. Contains `resolvedBy` and `resolvedAt`.
4. `forecast:updated` (`ForecastUpdatedDTO`):
   - Emitted when a new multi-horizon forecast (7d, 14d, 21d, 30d) is computed. Contains `forecastId`, `blockId`, `targetType`, `horizonDays`, `validFrom`, `validUntil`, `probability`, `predictedValue`, `unit`, `severity`, `confidenceStatus`, `modelId`, `modelVersion`, `generatedAt`.
5. `advisory:updated` (`AdvisoryUpdatedDTO`):
   - Emitted when crop advisories are updated or dismissed.
6. `data_health:updated` (`DataHealthUpdatedDTO`):
   - Emitted upon data pipeline ingestion or sync runs. Contains `status` (`HEALTHY`, `DEGRADED`, `UNHEALTHY`, `NO_DATA`), `datasetName`, `recordsProcessed`, `lastSyncTime`, `message`.
7. `notification:new` (`InAppNotificationDTO`):
   - Unicast delivered to `user:<userId>` containing `deliveryId`, `title`, `body`, `severity`, `timestamp`, `isRead`.

---

## 5. Express Controller Event Emission Pipeline

Controllers trigger real-time emissions via the singleton `realtimeService`:

- **`eventController.ts`**:
  - `detectEvents()`: Detects threshold exceedances, generates records in MongoDB, and triggers `realtimeService.emitEventCreated()` or `emitEventUpdated()` targeted to `block:<blockId>`, `role:OFFICER`, and `role:GOVERNMENT`.
  - `acknowledgeEvent()`: Updates state in MongoDB and emits `realtimeService.emitEventAcknowledged()`.
  - `resolveEvent()`: Updates state in MongoDB and emits `realtimeService.emitEventResolved()`.
- **`forecastController.ts`**:
  - `generateForecast()`: Persists forecast records and dispatches `realtimeService.emitForecastUpdated()` to `block:<blockId>`, `role:ANALYST`, and `role:GOVERNMENT`.
- **`dataHealthController.ts`**:
  - `triggerIngestion()`: Dispatches `realtimeService.emitDataHealthUpdated()` to `role:ANALYST` and `system:health`.
- **`advisoryController.ts`**:
  - `dismissAdvisory()`: Dispatches `realtimeService.emitAdvisoryUpdated()`.
- **`notificationController.ts`**:
  - `simulateAlert()`: Saves notification record and dispatches unicast `realtimeService.emitNotification()` to `user:<userId>`.

---

## 6. Frontend Client Lifecycle & Auto-Reconnection Strategy

The frontend Socket.IO client (`frontend/src/services/socketClient.ts`) provides resilient connection lifecycle management:

- **Transport Strategy:** Prefers `websocket` transport with automatic fallback to HTTP long-polling if WebSockets are obstructed by restrictive enterprise firewalls.
- **Exponential Backoff:** Configured with 10 retry attempts, initial delay of 1,000ms, maximum delay of 10,000ms, and a 20,000ms connection timeout.
- **Store Synchronization:** All socket lifecycle events (`connect`, `disconnect`, `connect_error`, `reconnect_attempt`) immediately update the Zustand store `useRealtimeStore`.
- **Session Continuity:** Connected automatically by `useAuthStore` upon token acquisition (`login`, `register`, `initAuth`, `token-refreshed`) and disconnected on `logout` or `varshasetu:unauthorized`.

---

## 7. Zustand Real-Time State Management (`useRealtimeStore`)

`useRealtimeStore` provides centralized reactive state:
- `connectionStatus`: `'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR'`
- `unreadEventCount`: Number of unread alerts, drives the navbar badge counter.
- `recentEvents`: Ring-buffer capped at 50 events with strict deduplication on `eventId` or `deduplicationHash`.
- `recentNotifications`: Ring-buffer capped at 30 notifications with deduplication on `id`/`deliveryId`.
- `recentForecastUpdates`: Ring-buffer capped at 20 forecast snapshots.
- `latestDataHealth`: Live pipeline status object.

---

## 8. Perspective Real-Time Adaptation

All four operational perspectives react smoothly to live data without layout shifts:

1. **Farmer Perspective (`FarmerForecastPage.tsx`):**
   - Automatically subscribes to `lastEventAt` to refresh forecasts and active warnings for `UP_LKO_BKT` when new predictions are generated.
   - Avoids overwhelming farmers with high-frequency raw telemetry; focuses on clear agronomic warnings.
2. **Field Officer Perspective (`OfficerForecastPage.tsx`, `OfficerDashboardPage.tsx`):**
   - Receives instant notifications when critical weather anomalies or drought risk windows are detected across their operational blocks.
   - Live synchronization of acknowledged/resolved status transitions.
3. **Government Perspective (`GovernmentDashboardPage.tsx`):**
   - Re-evaluates regional alert lifecycles and operational health indicators in real time when new events arrive from the field.
4. **Climate Analyst Perspective (`AlertCenterPage.tsx`, `DataHealthPage.tsx`):**
   - Live telemetry stream updates on data sync completion without manual browser refresh.
   - Event detection passes instantly update the analytical table and state transition timeline.

---

## 9. Visual Indicators & Notification Center UI

### `RealtimeStatusBadge.tsx`
- Accessible pill indicator displaying `LIVE` (pulsing green), `SYNCING` (cyan), `RETRYING` (amber), or `OFFLINE` (neutral gray).
- Configured with `role="status"` and `aria-live="polite"` for assistive technology.
- Includes manual reconnect button when disconnected.

### `NotificationDrawer.tsx`
- Header bell icon with unread count indicator badge.
- Floating dialog displaying recent operational alerts and scientific events.
- Filterable by `All`, `Events`, and `Alerts`.
- Allows bulk clearance and automatic read-receipt dispatch.

---

## 10. Scientific Honesty & Demonstration Guardrails

- **Zero Fabricated Telemetry:** Fields missing from ingestion pipelines default to `"NOT AVAILABLE IN CURRENT PIPELINE"` or `"NOT CONFIGURED"`.
- **Probability vs. Confidence:** Probabilities strictly denote meteorological likelihood (e.g., $P(\text{Heavy Rain}) = 78\%$), whereas confidence denotes calibration verification status (`PASS` / `FAIL` / `MARGINAL`).
- **Demonstration Anchor:** Explicitly displays `UP_LKO_BKT` (Lucknow District, Kharif 2024 single-season baseline) and `DIAGNOSTIC_ONLY` operational state.
- **No Commercial Contamination:** Zero marketplace, mandi, crop-selling, weighing, queue, or payment terminology.

---

## 11. Security, Payload Sanitization & Anti-Drift Architecture

- **No Secrets in Payloads:** Internal DB identifiers, JWT secrets, FastAPI backend IPs, and database schemas are stripped from socket DTOs.
- **Room Join Authorization:** Socket join requests are checked on the server side; clients cannot bypass RBAC to spy on unauthorized blocks or administrative channels.
- **Rate-Limiting Protection:** Sockets utilize message acknowledgment patterns and deduplication hashes to mitigate network flood attacks.

---

## 12. Integration Test Matrix & Verification Results

### Backend Test Matrix (`backend/tests/integration/socket_realtime.test.ts`)
- Rejection of unauthenticated socket connections (401 Handshake Error).
- Verification of valid JWT authentication and user context injection.
- Automatic joining of `user:<id>`, `role:<role>`, and assigned `block:<id>` rooms.
- RBAC enforcement against unauthorized role room joins.
- Broadcast of sanitized forecast updates across regional block rooms.
- Unicast delivery of private in-app notifications.
- **Result:** 10 / 10 tests passed. Total backend tests: **154 passing across 15 files**.

### Frontend Test Matrix (`frontend/src/tests/RealtimeIntegration.test.tsx`)
- Store connection status transitions and timestamp recording.
- Event deduplication on `eventId` and `deduplicationHash`.
- In-app notification counters and read-receipt marking.
- Forecast update store deduplication.
- Data health telemetry storage.
- `RealtimeStatusBadge` UI rendering for `LIVE`, `RETRYING`, and `OFFLINE` states.
- `NotificationDrawer` flyout toggle, badge rendering, category filtering, and item clearing.
- `socketClient` room join/leave interface.
- **Result:** 13 / 13 tests passed. Total frontend tests: **117 passing across 21 files**.

### Python Scientific ML Service (`ml-service/tests`)
- **Result:** 202 / 202 tests passed.

---

## 13. Deployment, Scaling & Reverse Proxy Considerations

1. **Vite Development Proxy:**
   ```typescript
   '/socket.io': {
     target: 'http://localhost:5001',
     ws: true,
     changeOrigin: true,
   }
   ```
2. **Production NGINX Configuration:**
   ```nginx
   location /socket.io/ {
     proxy_pass http://backend_upstream;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection "Upgrade";
     proxy_set_header Host $host;
   }
   ```
3. **Multi-Node Horizontal Scaling:**
   The Socket.IO server is architected to support `@socket.io/redis-adapter` for multi-instance deployments, allowing seamless inter-pod event pub/sub.
