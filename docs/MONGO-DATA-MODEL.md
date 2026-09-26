# VARSHASETU (वर्षासेतु) — MONGO DATA MODEL
## Phase 1 Persistence Layer & Mongoose Architecture Specification

> **Status:** Production Specification  
> **Target Engine:** MongoDB 7.0+ / Mongoose 8.x  
> **Core Principle:** `ONE SCIENTIFIC LAYER → FOUR OPERATIONAL PERSPECTIVES`

---

## 1. Collection Inventory

The VarshaSetu MongoDB database architecture establishes **16 core collections**:

| # | Collection Name | Mongoose Model | Primary Purpose | Key Fields | Indexes |
|---|---|---|---|---|---|
| 1 | `users` | `User` | Accounts, passwords, RBAC roles, permissions | `role`, `email`, `phoneNumber`, `passwordHash`, `permissions` | `email` (sparse, unique), `phoneNumber` (sparse, unique), `role` |
| 2 | `geography` | `Geography` | Administrative hierarchy (State, District, Block, Panchayat, Village) & vector boundaries | `code`, `level`, `center`, `boundary`, `parentId` | `code` (unique), `center` (`2dsphere`), `boundary` (`2dsphere`), `level`+`parentId` |
| 3 | `stations` | `Station` | Ground observation network (IMD AWS, Research Mesonet) | `stationCode`, `provider`, `location`, `sensors`, `status` | `stationCode` (unique), `location` (`2dsphere`), `provider`, `status` |
| 4 | `telemetry` | `Telemetry` | Ingested surface meteorological observations (rain, temp, humidity, wind) | `stationCode`, `observedAt`, `rainfallMm`, `temperatureC`, `qualityFlag` | `{ stationCode: 1, observedAt: -1 }` (compound) |
| 5 | `forecasts` | `Forecast` | Probabilistic forecasts with triad metrics & uncertainty spreads | `forecastId`, `blockCode`, `targetType`, `horizonDays`, `probability`, `uncertainty`, `climatology` | `forecastId` (unique), `{ blockCode: 1, horizonDays: 1, validFrom: -1 }` |
| 6 | `forecast_runs` | `ForecastRun` | Model inference execution batches & lifecycle transitions | `runId`, `modelVersion`, `datasetFingerprint`, `status`, `transitions` | `runId` (unique), `status`, `startedAt` |
| 7 | `events` | `Event` | Scientific risk alert events & state transition history | `eventId`, `eventType`, `forecastId`, `blockId`, `severity`, `state`, `transitions` | `eventId` (unique), `{ blockId: 1, state: 1, validFrom: -1 }`, `deduplicationHash` |
| 8 | `advisories` | `Advisory` | Calibrated crop advisories with embedded multilingual content & read receipts | `advisoryId`, `ruleId`, `blockId`, `cropType`, `localizations`, `readReceipts` | `advisoryId` (unique), `{ blockId: 1, cropType: 1, status: 1 }`, `deduplicationHash` |
| 9 | `crops` | `Crop` | Crop phenology profiles, growth stages, water/drought sensitivity thresholds | `cropId`, `name`, `season`, `stages`, `soilSuitability`, `rules` | `cropId` (unique), `season`, `isActive` |
| 10 | `scenarios` | `Scenario` | What-If decision simulation runs, response curves, comparative deltas | `scenarioId`, `blockId`, `cropType`, `scenarioType`, `deltas`, `sensitivities` | `scenarioId` (unique), `{ blockId: 1, cropType: 1, createdAt: -1 }` |
| 11 | `models` | `ScientificModel` | ML model registry, Platt/Isotonic calibration curves, hindcast folds | `modelId`, `target`, `horizonDays`, `architecture`, `calibration`, `validation` | `modelId` (unique), `{ target: 1, horizonDays: 1 }`, `status` |
| 12 | `provenance` | `Provenance` | Scientific Evidence Trust Layer ledger (WHAT, WHY, WHERE, HOW CONFIDENT) | `ledgerId`, `entityType`, `entityId`, `sourceProviders`, `verificationHash`, `ece`, `bss` | `ledgerId` (unique), `{ entityType: 1, entityId: 1 }` |
| 13 | `data_health` | `DataHealth` | Meteorological data providers, sync status, embedded ingestion reports | `sourceId`, `provider`, `status`, `runs` | `sourceId` (unique), `provider`, `status` |
| 14 | `notifications` | `Notification` | User alert channel preferences & simulated delivery dispatches | `userId`, `channels`, `minimumSeverity`, `deliveries` | `userId` (unique), `role` |
| 15 | `localizations` | `Localization` | Controlled agromet terminology dictionary & bilingual templates | `key`, `category`, `en`, `hi`, `scientificDefinition`, `farmerExplanation` | `key` (unique), `category` |
| 16 | `audit_logs` | `AuditLog` | Immutable system security and administrative actions log | `actor`, `role`, `action`, `resource`, `resourceId`, `metadata`, `createdAt` | `{ createdAt: -1 }`, `{ resource: 1, resourceId: 1, createdAt: -1 }` |

---

## 2. PostgreSQL → MongoDB Mapping

The 24 normalized PostgreSQL tables established in migrations 001–011 are consolidated into 16 MongoDB collections, leveraging document embedding for 1:1 and tightly coupled 1:N relations:

```
PostgreSQL Table                            MongoDB Collection & Strategy
──────────────────────────────────────────────────────────────────────────────────────────
users                                   ──► users (Root Document)
states, districts, blocks,              ──► geography (Root Document with parentId reference)
  gram_panchayats, villages
geographic_boundaries                   ──► geography.boundary (Embedded GeoJSON MultiPolygon)
data_sources                            ──► data_health (Root Document)
audit_logs                              ──► audit_logs (Immutable Root Document)
data_ingestion_runs,                    ──► data_health.runs (Embedded Subdocuments with
  data_quality_reports                        nested qualityReport subdocument)
forecast_lifecycle_events               ──► forecast_runs.transitions (Embedded Subdocuments)
forecast_events                         ──► events (Root Document)
forecast_event_transitions              ──► events.transitions (Embedded Subdocuments)
notification_preferences                ──► notifications (Root Document)
notification_deliveries                 ──► notifications.deliveries (Embedded Subdocuments)
agronomic_advisories                    ──► advisories (Root Document)
localized_advisories                    ──► advisories.localizations (Embedded Subdocuments)
advisory_reads                          ──► advisories.readReceipts (Embedded Subdocuments)
agronomic_rule_evaluations              ──► advisories.evidence (Embedded Evaluation Metadata)
scenario_runs                           ──► scenarios (Root Document)
scenario_comparisons                    ──► scenarios.deltas & envelope (Embedded Subdocuments)
scenario_sensitivities                  ──► scenarios.sensitivities (Embedded Subdocuments)
voice_synthesis_logs                    ──► audit_logs (Standardized Action Log: 'VOICE_SYNTHESIS')
```

---

## 3. Embedding Strategy

Subdocuments are embedded where data has bounded cardinality and is naturally owned by its parent:
1. **Advisory Localizations:** Each advisory contains exactly 2 translations (`EN`, `HI`). Embedding eliminates an expensive relational join on every advisory fetch.
2. **Advisory Read Receipts:** Recorded when farmers/officers view advisories. Bound to small arrays per advisory or referenced to User.
3. **Event State Transitions:** An alert event transitions between `DETECTED → ACKNOWLEDGED → RESOLVED` (maximum 3–5 transitions). Embedded in `events.transitions`.
4. **Forecast Lifecycle Events:** Model status changes (`PENDING → RUNNING → SUCCESS`) are embedded directly in `forecast_runs.transitions`.
5. **Scenario Deltas & Curves:** Sensitivity response curve points ($N = 10–20$ discrete steps) and comparative deltas are embedded directly inside `scenarios.sensitivities`.
6. **Ingestion Quality Reports:** Quality metrics (missing records, valid records, quality score) are embedded directly inside `data_health.runs[i].qualityReport`.

---

## 4. Referencing Strategy

Explicit `ObjectId` referencing is used for loose coupling and high-cardinality entities:
1. `User.assignedLocationId` references `Geography._id` (enables scoping farmer/officer data to blocks/districts).
2. `Geography.parentId` references `Geography._id` (enables recursive administrative hierarchy lookups).
3. `Station.blockId` references `Geography._id` (links physical stations to administrative units).
4. `Forecast.provenanceId` references `Provenance._id` (allows multiple forecasts to share standardized provenance ledgers).
5. `Forecast.runId` references `ForecastRun._id` (links forecasts to batch generation jobs).
6. `Scenario.userId` references `User._id` (links simulation runs to executing researchers).

---

## 5. GeoJSON Model & PostGIS Replacement

PostgreSQL/PostGIS `geometry(MultiPolygon, 4322)` is replaced with native MongoDB GeoJSON specifications:

### GeoJSON Point Structure (Stations & Centroids):
```json
{
  "type": "Point",
  "coordinates": [80.9276, 26.9749]
}
```
*(Strict Rule: Order is always `[longitude, latitude]` per RFC 7946).*

### GeoJSON MultiPolygon Structure (Administrative Boundaries):
```json
{
  "type": "MultiPolygon",
  "coordinates": [
    [
      [
        [80.850, 26.920],
        [80.990, 26.920],
        [81.010, 27.050],
        [80.870, 27.050],
        [80.850, 26.920]
      ]
    ]
  ]
}
```

### Spatial Query Equivalents:

| PostGIS Query | MongoDB GeoJSON Query |
|---|---|
| `ST_Contains(boundary, ST_MakePoint(lon, lat))` | `Geography.findOne({ boundary: { $geoIntersects: { $geometry: { type: "Point", coordinates: [lon, lat] } } } })` |
| `ST_DWithin(geom, ST_MakePoint(lon, lat), dist)` | `Station.find({ location: { $near: { $geometry: { type: "Point", coordinates: [lon, lat] }, $maxDistance: dist } } })` |
| GiST Index | `{ boundary: "2dsphere" }`, `{ center: "2dsphere" }` |

---

## 6. Index Strategy

Every index is tied to a concrete access pattern identified during the Phase 0 audit:

1. **Geospatial Lookups:**
   - `geography.boundary`: `2dsphere` — Block boundary point-in-polygon resolution.
   - `geography.center`: `2dsphere` — Proximity map navigation.
   - `stations.location`: `2dsphere` — Nearest AWS weather station search.
2. **Time-Series Meteorological Retrieval:**
   - `telemetry`: `{ stationCode: 1, observedAt: -1 }` (compound) — Fast historical sensor lookups.
3. **Forecast & Alert Dissemination:**
   - `forecasts`: `{ blockCode: 1, horizonDays: 1, validFrom: -1 }` — Hyperlocal dashboard view.
   - `events`: `{ blockId: 1, state: 1, validFrom: -1 }` — Active alert banner queries.
   - `advisories`: `{ blockId: 1, cropType: 1, status: 1 }` — Persona crop advisory feed.
4. **Security & Identification:**
   - `users.email`: `{ email: 1 }` (unique, sparse) — Fast authentication.
   - `users.phoneNumber`: `{ phoneNumber: 1 }` (unique, sparse) — OTP / mobile login.
   - `audit_logs`: `{ createdAt: -1 }`, `{ resource: 1, resourceId: 1, createdAt: -1 }` — Regulatory audits.

---

## 7. Scientific Evidence & Explainability Model

The database directly stores the four core Phase 9 trust pillars:

1. **WHAT (Event Forecast):**
   - Stored in `Forecast` model: `probability` ($P(\text{event})$), `confidenceTier` (`HIGH|MEDIUM|LOW`), `uncertainty` (`p10`, `p50`, `p90`), and `climatology` (`normalValue`, `deviationPct`).
2. **WHY (Atmospheric Feature Drivers):**
   - Stored in `Advisory.evidence` and `Provenance.metadata`: domain-grouped contribution weights ($+0.32$ to $-0.08$) for Moisture, Synoptic Wind, Thermodynamic Instability, and Antecedent Rainfall.
   - Accompanied by mandatory disclaimer: *"Diagnostic correlations indicate statistical association, not confirmed physical causality."*
3. **WHERE (Observational Provenance):**
   - Stored in `Provenance` model: source providers (`IMD_AWS`, `ERA5`, `GFS`, `INSAT_3DR`), reporting station codes (`LKO_AMAUSI`, `LKO_BKT_AWS`), spatial resolution ($0.05^\circ \times 0.05^\circ$), ingestion latency, and SHA-256 dataset hash.
4. **HOW CONFIDENT (Calibration & Validation):**
   - Stored in `ScientificModel` and `Provenance`: calibration method (`ISOTONIC` / `PLATT`), Expected Calibration Error ($ECE \le 0.038$), Brier Skill Score ($BSS \ge 0.241$), verification sample size ($N = 14,620$), and holdout validation folds.

---

## 8. Provenance Model

The `provenance` collection acts as an immutable scientific audit ledger. Every record contains:
- `ledgerId`: Unique identifier (e.g. `prov_kharif_2024_pilot_001`)
- `verificationHash`: Cryptographic fingerprint of the training/inference slice (`SHA-256: 8f4a1c0d5e2b9a7c...`)
- `operationalStatus`: Explicitly set to `'DIAGNOSTIC_ONLY'` or `'OPERATIONAL'`
- `nonCausalDisclaimer`: Mandatory attribution notice ensuring SHAP values are not misinterpreted as causal atmospheric physics.

---

## 9. Immutable Audit Log Model

The `audit_logs` collection tracks sensitive operations across all five personas:
- **Captured Actions:** `USER_REGISTER`, `USER_LOGIN`, `FORECAST_GENERATED`, `BULLETIN_BROADCAST`, `EVENT_ACKNOWLEDGED`, `EVENT_RESOLVED`, `WHAT_IF_SIMULATED`, `VOICE_SYNTHESIS_REQUESTED`.
- **Security Guarantee:** Timestamps are immutable (`timestamps: { createdAt: true, updatedAt: false }`).
- **Zero Credentials:** Passwords, JWT secrets, and bearer tokens are strictly omitted from `metadata`.

---

## 10. Seed Data Policy

1. **Explicit Execution:** Seeds must only execute when deliberately triggered via `npm run seed:mongo` (`tsx src/db/seeds/mongoSeed.ts`). Never run automatically on server boot.
2. **Pilot Demonstration Scope:** Lucknow District, Bakshi Ka Talab Block, Bhaisamau Gram Panchayat, Kharif 2024 season.
3. **Transparent Labeling:** All synthetic records must carry explicit metadata flags:
   - `isDemo: true`
   - `source: "DEMO / SYNTHETIC PILOT BOUNDARY (NON-AUTHORITATIVE)"`
   - `operationalStatus: "DIAGNOSTIC_ONLY"`
   - `dataFreshness: "ARCHIVED"`

---

## 11. Zero-Fabrication Policy

1. **Strict Null Defaults:** In `Telemetry`, unobserved physical quantities (`rainfallMm`, `temperatureC`, `relativeHumidityPct`, etc.) default to `null`. The system **never** defaults missing telemetry to `0.0`, `false`, or average values.
2. **Explicit Fallback Enums:** In `DataHealth` and `Notification`, unconfigured channels explicitly return `"NOT_CONFIGURED"`.
3. **No Synthetic Guarantees:** Disclosures clearly state when models operate on historical reanalysis rather than live telemetry.

---

## 12. Migration Risks & Mitigations

| Risk | Impact | Mongoose Mitigation Strategy |
|---|---|---|
| **Invalid GeoJSON Polygon Ring Order** | MongoDB `$geoIntersects` fails if polygon linear rings are unclosed or wound improperly. | Validation hook verifies coordinates length, winding order, and coordinate bounds $[-180, 180], [-90, 90]$. |
| **High Memory Usage on Large GeoJSON** | Slow query responses if full MultiPolygons are loaded in memory. | Keep boundary MultiPolygons in `geography` collection and project only `{ code: 1, name: 1, center: 1 }` in high-frequency list APIs. |
| **Sparse Index Collisions on Null Identifiers** | MongoDB unique index rejects multiple `null` values if not sparse. | `User.email` and `User.phoneNumber` schemas use `sparse: true` alongside `unique: true`. |
| **Schema Drift Between Python & Node** | Python ML service returns JSON keys with snake_case (`target_type`) while Node uses camelCase (`targetType`). | Mongoose models support both native fields and mapping transforms for seamless ML response ingestion. |

---

**DATA MODEL SPECIFICATION LOCKED & VERIFIED.**
