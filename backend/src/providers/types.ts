/**
 * VarshaSetu - Normalized Meteorological Provider Types
 *
 * Canonical data abstractions decoupling internal intelligence modules
 * from vendor-specific meteorological schemas (NASA POWER, IMD, ECMWF).
 */

export type MeteorologicalProviderSource =
  | 'NASA_POWER'
  | 'IMD'
  | 'ECMWF'
  | 'OPEN_METEO'
  | 'ERA5';

export type DataAvailabilityStatus =
  | 'AVAILABLE'
  | 'PARTIAL'
  | 'UNAVAILABLE'
  | 'ERROR';

export type LatencyClassification =
  | 'LIVE'
  | 'NEAR_REAL_TIME_LATENCY'
  | 'HISTORICAL'
  | 'CLIMATOLOGY';

/**
 * Normalized hourly weather observation record.
 * Missing / unavailable measurements (including NASA POWER -999 / -999.0 flags)
 * MUST be coerced strictly to null, preserving scientific integrity.
 */
export interface WeatherObservation {
  timestamp: string; // ISO 8601 UTC string
  latitude: number;
  longitude: number;

  temperature2mC: number | null;
  relativeHumidityPct: number | null;
  precipitationMm: number | null;

  windSpeed10mMs: number | null;
  windDirection10mDeg: number | null;

  surfacePressureKPa: number | null;

  source: MeteorologicalProviderSource;
  availability: 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
  retrievedAt: string; // ISO 8601 timestamp
}

export interface ProviderResponseMetadata {
  source: MeteorologicalProviderSource;
  requestedStart: string; // ISO string
  requestedEnd: string; // ISO string
  latestAvailableTimestamp: string | null;
  availabilityStatus: DataAvailabilityStatus;
  totalRecordCount: number;
  validRecordCount: number;
  missingRecordCount: number;
  retrievedAt: string;
  cached?: boolean;
  provenance: {
    providerName: string;
    dataset: string;
    isKeyless: boolean;
    dataRole: 'HISTORICAL_OBSERVATION' | 'OPERATIONAL_OBSERVATION' | 'NUMERICAL_PREDICTION' | 'CLIMATOLOGICAL_BASELINE';
    latencyClassification: LatencyClassification;
    latencyNote: string;
    attribution: string;
    provenanceUrl: string;
  };
}

export interface NormalizedHourlyPointResponse {
  source: MeteorologicalProviderSource;
  availability: DataAvailabilityStatus;
  latestAvailableTimestamp: string | null;
  metadata: ProviderResponseMetadata;
  data: WeatherObservation[];
}

export interface HourlyPointQuery {
  start: Date | string;
  end: Date | string;
  latitude: number;
  longitude: number;
  source?: MeteorologicalProviderSource;
}

export interface ProviderErrorResponse {
  source: MeteorologicalProviderSource;
  status: 'ERROR';
  errorCode: string;
  message: string;
  details?: string;
  retrievedAt: string;
}
