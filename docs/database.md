# VarshaSetu Database & PostGIS Geospatial Engine Documentation

---

### Database Overview
- **Database Engine:** PostgreSQL 16.x
- **Geospatial Extension:** PostGIS 3.4+ (with dual native & PL/pgSQL spatial compatibility fallback for high-portability environments)
- **Spatial Coordinate Reference System:** WGS 84 (`EPSG:4326`)
- **Primary Spatial Representation:** `geometry(MultiPolygon, 4326)`
- **Spatial Indexing:** GiST (`USING GIST (geometry)`)

---

## 1. Migration Architecture & Execution

Migrations are stored in `backend/src/db/migrations/` and executed sequentially by `backend/src/db/migrator.ts`. Applied migrations are recorded in the `_migrations` tracking table:

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Applied Migrations

| Migration | Name | Description |
| :--- | :--- | :--- |
| **`001`** | `001_extensions.sql` | Installs `uuid-ossp`, `pgcrypto`, and PostGIS/spatial compatibility layer. |
| **`002`** | `002_users_roles.sql` | Creates `users` table with password hashing and RBAC permissions. |
| **`003`** | `003_administrative_nodes.sql` | Creates administrative hierarchy (`states`, `districts`, `blocks`, `gram_panchayats`, `villages`). |
| **`004`** | `004_geographic_boundaries.sql` | Creates `geographic_boundaries` table with MultiPolygon geometry and GiST index. |
| **`005`** | `005_data_sources.sql` | Prepares ingestion metadata table for meteorological data sources. |
| **`006`** | `006_audit_logs.sql` | Creates security and operational `audit_logs` audit trail. |

**Command to run migrations:**
```bash
npm run migrate --prefix backend
```

---

## 2. Relational Entity Schema

### 2.1 Users & RBAC (`users`)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(32) NOT NULL CHECK (role IN ('FARMER', 'OFFICER', 'GOVERNMENT', 'ANALYST', 'ADMIN')),
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  preferred_language VARCHAR(10) DEFAULT 'hi',
  assigned_location_id UUID,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Geographic Hierarchy Tables
Relational parent-child cascading relationships establish the Indian administrative structure:
```text
states (UP)
  └── districts (Lucknow)
        └── blocks (Bakshi Ka Talab, Malihabad, Mohanlalganj, Sarojininagar, Gosainganj)
              └── gram_panchayats (Bhaisamau, Rampur, Mampur, Kamalpur)
                    └── villages (Bhaisamau Kalan, Bhaisamau Khurd)
```

Each table stores:
- `id`: Stable UUID primary key.
- `name`: Local administrative name.
- `code`: Official Local Government Directory (LGD) or Census identifier.
- `center_lat`, `center_lon`: Geographic centroid coordinates (EPSG:4326).
- `bbox`: JSON bounding box (`minLatitude`, `minLongitude`, `maxLatitude`, `maxLongitude`).

### 2.3 Geographic Boundaries (`geographic_boundaries`)
```sql
CREATE TABLE geographic_boundaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL,
  level VARCHAR(32) NOT NULL CHECK (level IN ('COUNTRY', 'STATE', 'DISTRICT', 'BLOCK', 'PANCHAYAT', 'VILLAGE')),
  geometry geometry NOT NULL,
  geometry_type VARCHAR(32) NOT NULL DEFAULT 'MultiPolygon',
  source VARCHAR(255) NOT NULL,
  source_version VARCHAR(100),
  is_demo BOOLEAN NOT NULL DEFAULT true,
  area_sq_km DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_boundaries_gist ON geographic_boundaries USING GIST (geometry);
```

### 2.4 Data Sources Infrastructure (`data_sources`)
Stores metadata and sync statuses for upcoming external climate feeds:
- `NOAA_CPC`: Niño 3.4 SST index.
- `BOM_AUSTRALIA`: Dipole Mode Index (DMI).
- `IMD`: Daily 0.25° gridded rainfall observations.
- `ECMWF_ERA5`: Agrometeorological reanalysis.

### 2.5 Audit Logs (`audit_logs`)
Captures all security-sensitive operations (login, registration, bulletin issuance, configuration changes) with user IDs, timestamps, and client IP addresses without logging passwords or sensitive tokens.

---

## 3. Critical GIS Data Integrity Policy

> [!CAUTION]
> **No Invented Authoritative Boundaries Policy:**
> - Demonstrator geometry provided in development seeds is explicitly flagged with `is_demo: true` and `source: 'DEMO / SYNTHETIC PILOT BOUNDARY (NON-AUTHORITATIVE)'`.
> - The application never presents synthetic polygons as official Survey of India or Census boundaries.
> - When spatial queries target unmapped rural areas, the API returns `boundaryAvailable: false` rather than fabricating coordinates.

---

## 4. Seeding Process

The seed runner `backend/src/db/seeds/demo_seed.ts` provisions:
1. Uttar Pradesh State (`code: 'UP'`).
2. Lucknow District (`code: 'UP_LKO'`).
3. 5 Demonstration Blocks: Bakshi Ka Talab, Malihabad, Mohanlalganj, Sarojininagar, Gosainganj.
4. 4 Gram Panchayats in BKT block.
5. 2 Demonstration Villages in Bhaisamau Gram Panchayat.
6. MultiPolygon boundary for Bakshi Ka Talab block.
7. 5 Demo users with bcrypt-encrypted passwords for each persona role.
8. External meteorological data source metadata.

**Command to run seeds:**
```bash
npm run seed --prefix backend
```

### Development Seed Credentials

| Role | Email / Phone | Password |
| :--- | :--- | :--- |
| **`FARMER`** | `+919876543210` / `ramesh.farmer@example.com` | `FarmerPassword123!` |
| **`OFFICER`** | `officer.lucknow@varshasetu.gov.in` | `OfficerPassword123!` |
| **`GOVERNMENT`** | `planner.up@varshasetu.gov.in` | `GovPassword123!` |
| **`ANALYST`** | `analyst.climate@varshasetu.gov.in` | `AnalystPassword123!` |
| **`ADMIN`** | `admin@varshasetu.gov.in` | `AdminPassword123!` |
