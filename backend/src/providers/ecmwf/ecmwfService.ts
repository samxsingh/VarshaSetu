import { env } from '../../config/env';
import {
  WeatherObservation,
  NormalizedHourlyPointResponse,
  HourlyPointQuery,
  MeteorologicalProviderSource,
} from '../types';

export interface EcmwfProviderStatus {
  source: MeteorologicalProviderSource;
  status: 'CONFIGURED' | 'NOT_CONFIGURED';
  baseUrl: string;
  hasKey: boolean;
  message: string;
}

export class EcmwfService {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(customBaseUrl?: string, customApiKey?: string) {
    this.baseUrl = (customBaseUrl || env.ECMWF_API_BASE_URL).replace(/\/+$/, '');
    this.apiKey = customApiKey !== undefined ? customApiKey : env.ECMWF_API_KEY;
  }

  public getStatus(): EcmwfProviderStatus {
    const isConfigured = Boolean(this.apiKey && this.apiKey.trim().length > 0);
    return {
      source: 'ECMWF',
      status: isConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      baseUrl: this.baseUrl,
      hasKey: isConfigured,
      message: isConfigured
        ? 'ECMWF Web API credentials configured for NWP extraction.'
        : 'ECMWF API credentials not configured. Machine learning pipeline utilizes ERA5 baseline and Open-Meteo ECMWF SEAS5 ensemble.',
    };
  }

  /**
   * Adapter for numerical weather prediction observations / forecasts.
   * If credentials are absent, reports unconfigured gracefully rather than crashing.
   */
  public async getHourlyPointData(query: HourlyPointQuery): Promise<NormalizedHourlyPointResponse> {
    const status = this.getStatus();
    if (status.status === 'NOT_CONFIGURED') {
      const nowIso = new Date().toISOString();
      return {
        source: 'ECMWF',
        availability: 'UNAVAILABLE',
        latestAvailableTimestamp: null,
        metadata: {
          source: 'ECMWF',
          requestedStart: typeof query.start === 'string' ? query.start : query.start.toISOString(),
          requestedEnd: typeof query.end === 'string' ? query.end : query.end.toISOString(),
          latestAvailableTimestamp: null,
          availabilityStatus: 'UNAVAILABLE',
          totalRecordCount: 0,
          validRecordCount: 0,
          missingRecordCount: 0,
          retrievedAt: nowIso,
          provenance: {
            providerName: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
            dataset: 'ECMWF Integrated Forecasting System (IFS) / HRES / SEAS5',
            isKeyless: false,
            dataRole: 'NUMERICAL_PREDICTION',
            latencyClassification: 'LIVE',
            latencyNote: 'Operational NWP forecast run initialized every 6-12 hours.',
            attribution: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
            provenanceUrl: 'https://www.ecmwf.int/',
          },
        },
        data: [],
      };
    }

    // When configured with operational key, make request to ECMWF Web API
    try {
      const startStr = typeof query.start === 'string' ? query.start : query.start.toISOString().split('T')[0];
      const endStr = typeof query.end === 'string' ? query.end : query.end.toISOString().split('T')[0];

      const url = `${this.baseUrl}/datasets/nwp/points?lat=${query.latitude}&lon=${query.longitude}&start=${startStr}&end=${endStr}`;
      const res = await fetch(url, {
        headers: {
          'X-ECMWF-KEY': this.apiKey!,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        throw new Error(`ECMWF API responded with HTTP status ${res.status}`);
      }

      const raw = (await res.json()) as any;
      const nowIso = new Date().toISOString();
      const records: WeatherObservation[] = (raw.data || []).map((d: any) => ({
        timestamp: d.timestamp || d.time,
        latitude: query.latitude,
        longitude: query.longitude,
        temperature2mC: d.temperature_2m ?? null,
        relativeHumidityPct: d.relative_humidity_2m ?? null,
        precipitationMm: d.precipitation ?? null,
        windSpeed10mMs: d.wind_speed_10m ?? null,
        windDirection10mDeg: d.wind_direction_10m ?? null,
        surfacePressureKPa: d.surface_pressure ? d.surface_pressure / 1000 : null,
        source: 'ECMWF',
        availability: 'AVAILABLE',
        retrievedAt: nowIso,
      }));

      return {
        source: 'ECMWF',
        availability: records.length > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
        latestAvailableTimestamp: records.length > 0 ? records[records.length - 1].timestamp : null,
        metadata: {
          source: 'ECMWF',
          requestedStart: typeof query.start === 'string' ? query.start : query.start.toISOString(),
          requestedEnd: typeof query.end === 'string' ? query.end : query.end.toISOString(),
          latestAvailableTimestamp: records.length > 0 ? records[records.length - 1].timestamp : null,
          availabilityStatus: records.length > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
          totalRecordCount: records.length,
          validRecordCount: records.length,
          missingRecordCount: 0,
          retrievedAt: nowIso,
          provenance: {
            providerName: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
            dataset: 'ECMWF Integrated Forecasting System (IFS) / HRES / SEAS5',
            isKeyless: false,
            dataRole: 'NUMERICAL_PREDICTION',
            latencyClassification: 'LIVE',
            latencyNote: 'Operational NWP forecast run initialized every 6-12 hours.',
            attribution: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
            provenanceUrl: 'https://www.ecmwf.int/',
          },
        },
        data: records,
      };
    } catch (err: any) {
      // Gracefully return empty normalized structure rather than crashing
      return {
        source: 'ECMWF',
        availability: 'ERROR',
        latestAvailableTimestamp: null,
        metadata: {
          source: 'ECMWF',
          requestedStart: typeof query.start === 'string' ? query.start : query.start.toISOString(),
          requestedEnd: typeof query.end === 'string' ? query.end : query.end.toISOString(),
          latestAvailableTimestamp: null,
          availabilityStatus: 'ERROR',
          totalRecordCount: 0,
          validRecordCount: 0,
          missingRecordCount: 0,
          retrievedAt: new Date().toISOString(),
          provenance: {
            providerName: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
            dataset: 'ECMWF Integrated Forecasting System (IFS)',
            isKeyless: false,
            dataRole: 'NUMERICAL_PREDICTION',
            latencyClassification: 'LIVE',
            latencyNote: err.message || 'Service temporarily unavailable',
            attribution: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
            provenanceUrl: 'https://www.ecmwf.int/',
          },
        },
        data: [],
      };
    }
  }
}

export const ecmwfService = new EcmwfService();
