# VarshaSetu Scientific Data Catalog
**Phase 3 — Real Climate & Weather Data Foundation**

---

## 1. Overview & Scientific Scope

VarshaSetu transforms global and regional meteorological observations into structured, quality-controlled, ML-ready feature matrices for hyperlocal monsoon intelligence. In Phase 3, the platform establishes its scientific data foundation across four core streams:

1. **Global Climate Teleconnection Indices (ENSO Niño 3.4 SST)**
2. **Equatorial Oceanic Teleconnections (Indian Ocean Dipole DMI)**
3. **Tropical Intraseasonal Oscillations (Wheeler-Hendon MJO RMM1/RMM2)**
4. **Surface Agrometeorological Observations & Reanalysis (ERA5-Land via Open-Meteo)**

All datasets are ingested with strict provenance tracking, stored as columnar Apache Parquet files with JSON sidecar metadata, and audited by a rigorous physical bounds quality control (QC) engine.

---

## 2. Ingested Data Streams & Provenance

| Feed Name | Provider | Native Cadence | Native Format | Variables Ingested | Target Resolution & Unit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Niño 3.4 SST Anomaly** | NOAA CPC / PSL | Monthly (1950–Present) | Fixed-width ASCII | Sea Surface Temp Anomaly ($^\circ\text{C}$) | Monthly, $^\circ\text{C}$ (Physical Bounds: -5.0 to +5.0) |
| **Dipole Mode Index (DMI)** | BoM Australia | Monthly (1870–Present) | ASCII text table | Dipole Mode Index ($^\circ\text{C}$) | Monthly, $^\circ\text{C}$ (Physical Bounds: -3.0 to +3.0) |
| **MJO RMM1 / RMM2** | BoM Australia | Daily (1974–Present) | Space-delimited ASCII | RMM1, RMM2, Phase (1–8), Amplitude | Daily, Dimensionless (Phase 1–8, Amp $\ge 0.0$) |
| **ERA5-Land Agromet** | Open-Meteo / ECMWF | Daily | JSON REST API | Precipitation, Max/Min/Mean Temp, Surface Pressure, Wind Speed | Daily ($0.1^\circ$ grid $\to$ Block Centroids): $\text{mm}$, $^\circ\text{C}$, $\text{hPa}$, $\text{m/s}$ |

---

## 3. Physical Bounds & Quality Control (QC) Matrix

Every record entering the VarshaSetu scientific pipeline is validated against strict thermodynamic and atmospheric sanity limits:

| Variable | Lower Bound | Upper Bound | Expected Units | Audit Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Precipitation (`precipitation_sum_mm`)** | $0.0\text{ mm}$ | $500.0\text{ mm/day}$ | $\text{mm/day}$ | Value $< 0$ flagged as BAD; $> 500$ flagged as WARNING |
| **Max Temperature (`temperature_2m_max_c`)** | $-10.0^\circ\text{C}$ | $+55.0^\circ\text{C}$ | $^\circ\text{C}$ | Outside bounds flagged as BAD |
| **Min Temperature (`temperature_2m_min_c`)** | $-15.0^\circ\text{C}$ | $+45.0^\circ\text{C}$ | $^\circ\text{C}$ | Must be $\le T_{\text{max}}$ |
| **Mean Temperature (`temperature_2m_mean_c`)** | $-15.0^\circ\text{C}$ | $+50.0^\circ\text{C}$ | $^\circ\text{C}$ | $T_{\text{min}} \le T_{\text{mean}} \le T_{\text{max}}$ |
| **Surface Pressure (`surface_pressure_hpa`)** | $850.0\text{ hPa}$ | $1050.0\text{ hPa}$ | $\text{hPa}$ | Outside bounds flagged as BAD |
| **Wind Speed 10m (`wind_speed_10m_mps`)** | $0.0\text{ m/s}$ | $60.0\text{ m/s}$ | $\text{m/s}$ | Negative values flagged as BAD |
| **ENSO Niño 3.4 Anomaly** | $-5.0^\circ\text{C}$ | $+5.0^\circ\text{C}$ | $^\circ\text{C}$ | Standardized anomaly |
| **IOD Dipole Mode Index** | $-3.0^\circ\text{C}$ | $+3.0^\circ\text{C}$ | $^\circ\text{C}$ | Standardized anomaly |
| **MJO Phase** | $1$ | $8$ | Integer | Convective active region indicator |
| **MJO Amplitude** | $0.0$ | $10.0$ | Dimensionless | $\sqrt{\text{RMM1}^2 + \text{RMM2}^2}$ |

### QC Flags Lifecycle:
- `GOOD`: Clean, physiologically and physically plausible value passing all audits.
- `WARNING`: Value exceeds standard 99th percentile climatology (e.g. heavy rain $> 64.5\text{ mm}$) but is physically plausible.
- `BAD`: Violates physical reality (e.g. negative rainfall, $T_{\text{max}} < T_{\text{min}}$). Excluded from downstream modeling.
- `MISSING`: Data point absent from provider feed.
- `IMPUTED`: Gap-filled using spatial neighbor interpolation or linear spline.

---

## 4. Derived Agrometeorological Feature Matrix

For each block centroid, the raw daily observations are transformed into agrometeorological indicators required for agricultural decision support:

1. **Rolling Rainfall Aggregations:**
   $$P_{7d}(t) = \sum_{i=0}^6 P(t-i), \quad P_{14d}(t) = \sum_{i=0}^{13} P(t-i)$$
2. **IMD Standard Dry Day Indicator:**
   $$\text{is\_dry\_day}(t) = \begin{cases} 1 & \text{if } P(t) < 1.0\text{ mm} \\ 0 & \text{otherwise} \end{cases}$$
3. **IMD Heavy Rain Event Indicator:**
   $$\text{is\_heavy\_rain}(t) = \begin{cases} 1 & \text{if } P(t) \ge 64.5\text{ mm} \\ 0 & \text{otherwise} \end{cases}$$
4. **Spell Metrics:**
   - **Consecutive Dry Days ($CDD_t$):** Continuous days with rainfall $< 1.0\text{ mm}$ (critical for Kharif dry spell detection).
   - **Consecutive Wet Days ($CWD_t$):** Continuous days with rainfall $\ge 1.0\text{ mm}$ (waterlogging / fungal disease risk).
5. **Climatological Rainfall Departure:**
   $$\Delta P\% = \frac{P_{7d}(t) - N_{7d}}{N_{7d}} \times 100\%$$
   Categorized according to IMD conventions:
   - Excess ($\ge +20\%$)
   - Normal ($-19\%$ to $+19\%$)
   - Deficient ($-20\%$ to $-59\%$)
   - Large Deficient ($\le -60\%$)

---

## 5. Storage Architecture & Directory Layout

Columnar datasets and metadata sidecars are organized on disk under `ml-service/data/`:

```
ml-service/data/
├── raw/                                           # Immutable provider responses & cache
│   ├── NOAA_CPC_nina34_raw.txt
│   ├── BOM_AUSTRALIA_iod_dmi_raw.txt
│   ├── BOM_MJO_mjo_rmm_raw.txt
│   └── OPEN_METEO_ERA5_weather_26.9749_...json
├── processed/                                     # Cleaned & normalized Parquet tables
│   ├── climate_enso_nino34.parquet
│   ├── climate_enso_nino34_meta.json
│   ├── climate_iod_dmi.parquet
│   ├── climate_iod_dmi_meta.json
│   ├── climate_mjo_rmm.parquet
│   ├── climate_mjo_rmm_meta.json
│   ├── weather_lucknow_observations.parquet
│   └── weather_lucknow_observations_meta.json
└── features/                                      # ML-ready derived feature matrices
    ├── features_lucknow_monsoon_matrix.parquet
    └── features_lucknow_monsoon_matrix_meta.json
```

All metadata files retain full source URL, retrieval timestamp, schema hashes, native units, and temporal coverage.
