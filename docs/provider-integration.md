# VarshaSetu External Provider Integration Guide
**Phase 3 Meteorological & Climate Data Connectors**

---

## 1. Integrated External Providers

VarshaSetu integrates four primary meteorological data sources to build its scientific foundation:

```
Provider Summary:
1. NOAA Climate Prediction Center (CPC) / PSL
   - Dataset: Niño 3.4 Sea Surface Temperature (SST) Anomaly
   - URL: https://psl.noaa.gov/data/correlation/nina34.data

2. Bureau of Meteorology (BoM), Australia
   - Dataset: Indian Ocean Dipole (IOD) Dipole Mode Index (DMI)
   - URL: http://www.bom.gov.au/climate/enso/indices.shtml (dmi.clim.txt)

3. Bureau of Meteorology (BoM), Australia
   - Dataset: Real-time Multivariate MJO (RMM1, RMM2) Indices
   - URL: http://www.bom.gov.au/climate/mjo/graphics/rmm.74toRealtime.txt

4. Open-Meteo Weather Reanalysis API
   - Dataset: ECMWF ERA5-Land Surface Agrometeorological Reanalysis
   - URL: https://archive-api.open-meteo.com/v1/archive
```

---

## 2. Connector Specifications & Parser Contracts

### 2.1 NOAA CPC Niño 3.4 SST Connector (`NoaaEnsoProvider`)
- **Protocol:** HTTP GET
- **Source Format:** Multiline fixed-width ASCII table. First line contains starting and ending years; subsequent lines represent: `[Year, Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]`.
- **Missing Value Sentinel:** `-99.99`
- **Parsing Logic:**
  - Header line parsed for valid year bounds.
  - Missing value sentinels filtered or imputed.
  - Transformed into normalized records `[date: YYYY-MM-01, nino34_anomaly: float]`.
- **Physical Validation:** Sea surface temperature anomaly must fall within $[-5.0^\circ\text{C}, +5.0^\circ\text{C}]$.

### 2.2 BoM Indian Ocean Dipole Connector (`BomIodProvider`)
- **Protocol:** HTTP GET
- **Source Format:** Space-delimited ASCII table containing monthly DMI index values dating back to 1870.
- **Missing Value Sentinel:** `999.0` or `-999.0`
- **Parsing Logic:**
  - Whitespace-split table parsing with year and 12 monthly columns.
  - Normalized to `[date: YYYY-MM-01, dmi_index: float]`.
- **Physical Validation:** Dipole Mode Index must fall within $[-3.0^\circ\text{C}, +3.0^\circ\text{C}]$.

### 2.3 BoM Real-Time Multivariate MJO Connector (`BomMjoProvider`)
- **Protocol:** HTTP GET
- **Source Format:** 8-column space-delimited text table with initial comment headers.
  - Columns: `year`, `month`, `day`, `RMM1`, `RMM2`, `phase`, `amplitude`, `status`.
- **Missing Value Sentinel:** `1.e36` or `999.0`
- **Parsing Logic:**
  - Lines starting with non-numeric tokens skipped.
  - Daily date reconstructed from `(year, month, day)`.
  - Normalized to `[date: YYYY-MM-DD, rmm1: float, rmm2: float, phase: int (1-8), amplitude: float]`.
- **Physical Validation:**
  - Phase must be integer in $\{1, 2, 3, 4, 5, 6, 7, 8\}$.
  - Amplitude must satisfy $\text{Amp} \ge 0.0$ and $\text{Amp} \le 10.0$.

### 2.4 Open-Meteo ERA5-Land Connector (`OpenMeteoWeatherProvider`)
- **Protocol:** REST JSON API
- **Parameters:**
  - `latitude`: District / Block centroid latitude (e.g., $26.9749^\circ\text{N}$)
  - `longitude`: District / Block centroid longitude (e.g., $80.9276^\circ\text{E}$)
  - `start_date`, `end_date`: Monsoon window (e.g., `2024-06-01` to `2024-09-30`)
  - `daily`: `precipitation_sum`, `temperature_2m_max`, `temperature_2m_min`, `temperature_2m_mean`, `surface_pressure`, `wind_speed_10m_max`
  - `timezone`: `Asia/Kolkata`
- **Parsing Logic:**
  - Daily arrays aligned into rectangular DataFrame.
  - Units standardized to SI agromet standards: $\text{mm}$, $^\circ\text{C}$, $\text{hPa}$, $\text{m/s}$.
- **Physical Validation:**
  - $\text{Precipitation} \in [0.0, 500.0]\text{ mm/day}$
  - $T_{\text{min}} \le T_{\text{mean}} \le T_{\text{max}}$
  - $\text{Surface Pressure} \in [850.0, 1050.0]\text{ hPa}$

---

## 3. Resilience, Caching, and Backoff Configuration

All connectors inherit from `BaseProvider`:
```python
class BaseProvider(ABC):
    async def _http_get_with_retry(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        max_retries: int = 3,
        backoff_factor: float = 1.0,
        timeout_seconds: float = 15.0
    ) -> httpx.Response:
        ...
```

- **Exponential Backoff:** Retries after $1.0\text{s}$, $2.0\text{s}$, $4.0\text{s}$.
- **Raw Cache:** Every successful raw fetch is saved under `data/raw/<provider_id>_<dataset>_raw.<ext>`.
- **Atomic File Writing:** Parquet datasets and sidecar metadata are written atomically to prevent partial-write corruption.
