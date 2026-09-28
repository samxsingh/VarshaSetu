import { env } from '../../config/env';
import { providerCache } from '../common/providerCache';
import {
  HourlyPointQuery,
  NormalizedHourlyPointResponse,
  WeatherObservation,
  ProviderErrorResponse,
  DataAvailabilityStatus,
} from '../types';

export class NasaPowerService {
  private readonly baseUrl: string;
  private readonly defaultParameters = 'T2M,RH2M,PRECTOTCORR,WS10M,WD10M,PS';

  constructor(customBaseUrl?: string) {
    this.baseUrl = (customBaseUrl || env.NASA_POWER_BASE_URL).replace(/\/+$/, '');
  }

  /**
   * Validates geographic coordinates strictly within global limits.
   */
  public validateCoordinates(latitude: number, longitude: number): void {
    if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
      throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90.`);
    }
    if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
      throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180.`);
    }
  }

  /**
   * Normalizes dates (Date object, ISO string, or YYYY-MM-DD / YYYYMMDD) into YYYYMMDD.
   */
  public formatDateToYYYYMMDD(input: Date | string): string {
    if (input instanceof Date) {
      if (isNaN(input.getTime())) throw new Error('Invalid Date object provided.');
      const y = input.getUTCFullYear();
      const m = String(input.getUTCMonth() + 1).padStart(2, '0');
      const d = String(input.getUTCDate()).padStart(2, '0');
      return `${y}${m}${d}`;
    }

    const clean = input.trim();
    // YYYYMMDD
    if (/^\d{8}$/.test(clean)) return clean;
    // YYYY-MM-DD or ISO
    const parsed = new Date(clean);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Cannot parse date string: "${input}". Expected YYYY-MM-DD or ISO format.`);
    }
    const y = parsed.getUTCFullYear();
    const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const d = String(parsed.getUTCDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  /**
   * Helper to format YYYYMMDD back to ISO date string (YYYY-MM-DDTHH:mm:ss.sssZ).
   */
  public dateStringToIso(ymd: string, isEnd: boolean = false): string {
    const y = ymd.substring(0, 4);
    const m = ymd.substring(4, 6);
    const d = ymd.substring(6, 8);
    return isEnd ? `${y}-${m}-${d}T23:59:59.000Z` : `${y}-${m}-${d}T00:00:00.000Z`;
  }

  /**
   * Helper to convert NASA POWER YYYYMMDDHH key into UTC ISO timestamp.
   */
  public parseHourKeyToIso(hourKey: string): string {
    if (hourKey.length !== 10) {
      throw new Error(`Malformed NASA POWER hour key: "${hourKey}". Expected YYYYMMDDHH format.`);
    }
    const y = hourKey.substring(0, 4);
    const m = hourKey.substring(4, 6);
    const d = hourKey.substring(6, 8);
    const h = hourKey.substring(8, 10);
    return `${y}-${m}-${d}T${h}:00:00.000Z`;
  }

  /**
   * Sanitizes NASA POWER measurement values.
   * NASA POWER denotes missing or unavailable observations with -999 or -999.0.
   * STRICT SCIENTIFIC RULE: These values MUST be converted to null.
   * They must NEVER be converted to 0, which would falsely represent 0°C or 0 pressure.
   */
  public normalizeNasaValue(val: unknown): number | null {
    if (val === null || val === undefined) return null;
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    if (isNaN(num)) return null;
    if (num === -999 || num === -999.0 || Math.abs(num - -999) < 0.001) return null;
    return Math.round(num * 100) / 100;
  }

  /**
   * Builds the official NASA POWER hourly point query URL.
   */
  public buildUrl(query: HourlyPointQuery): { url: string; startYmd: string; endYmd: string } {
    this.validateCoordinates(query.latitude, query.longitude);

    const startYmd = this.formatDateToYYYYMMDD(query.start);
    const endYmd = this.formatDateToYYYYMMDD(query.end);

    if (parseInt(startYmd, 10) > parseInt(endYmd, 10)) {
      throw new Error(`Start date (${startYmd}) cannot be after end date (${endYmd}).`);
    }

    const params = new URLSearchParams({
      start: startYmd,
      end: endYmd,
      latitude: query.latitude.toFixed(4),
      longitude: query.longitude.toFixed(4),
      community: 'ag',
      parameters: this.defaultParameters,
      format: 'json',
      units: 'metric',
      user: 'VarshaSetu',
      header: 'false',
      'time-standard': 'utc',
    });

    return {
      url: `${this.baseUrl}/temporal/hourly/point?${params.toString()}`,
      startYmd,
      endYmd,
    };
  }

  /**
   * Retrieves hourly meteorological reanalysis & agroclimatology data from NASA POWER.
   * Handles caching, latency detection, and -999 null conversion.
   */
  public async getHourlyPointData(
    query: HourlyPointQuery
  ): Promise<NormalizedHourlyPointResponse> {
    const { url, startYmd, endYmd } = this.buildUrl(query);
    const cacheKey = providerCache.generateKey(
      'NASA_POWER',
      query.latitude,
      query.longitude,
      startYmd,
      endYmd,
      this.defaultParameters
    );

    // 1. Check in-memory provider cache
    const cached = providerCache.get<NormalizedHourlyPointResponse>(cacheKey);
    if (cached) {
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          cached: true,
        },
      };
    }

    // 2. Offline Simulation / Mock Provider branch
    if (env.USE_MOCK_PROVIDERS || env.SIMULATION_MODE) {
      return this.generateSimulatedResponse(query, startYmd, endYmd);
    }

    // 3. Live External Request to NASA POWER
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12000), // 12-second timeout
      });

      if (!response.ok) {
        throw new Error(
          `NASA POWER service responded with HTTP status ${response.status} (${response.statusText})`
        );
      }

      const json = (await response.json()) as any;
      const parsed = this.parseNasaResponse(json, query, startYmd, endYmd);

      // Cache successful normalized responses
      providerCache.set(cacheKey, parsed);
      return parsed;
    } catch (err: any) {
      // Structured error propagation without throwing uncaught exceptions to caller
      throw this.createStructuredError(err.message || 'Network connection failed');
    }
  }

  /**
   * Parses and normalizes raw NASA POWER JSON into canonical WeatherObservation records.
   */
  public parseNasaResponse(
    rawJson: any,
    query: HourlyPointQuery,
    startYmd: string,
    endYmd: string
  ): NormalizedHourlyPointResponse {
    const params = rawJson?.properties?.parameter;
    if (!params || typeof params !== 'object') {
      throw new Error('NASA POWER response missing "properties.parameter" object.');
    }

    const t2mMap: Record<string, number> = params.T2M || {};
    const rh2mMap: Record<string, number> = params.RH2M || {};
    const precipMap: Record<string, number> = params.PRECTOTCORR || {};
    const ws10mMap: Record<string, number> = params.WS10M || {};
    const wd10mMap: Record<string, number> = params.WD10M || {};
    const psMap: Record<string, number> = params.PS || {};

    // Collect and sort all hourly timestamp keys
    const hourKeys = Object.keys(t2mMap).sort();
    if (hourKeys.length === 0) {
      return {
        source: 'NASA_POWER',
        availability: 'UNAVAILABLE',
        latestAvailableTimestamp: null,
        metadata: {
          source: 'NASA_POWER',
          requestedStart: this.dateStringToIso(startYmd, false),
          requestedEnd: this.dateStringToIso(endYmd, true),
          latestAvailableTimestamp: null,
          availabilityStatus: 'UNAVAILABLE',
          totalRecordCount: 0,
          validRecordCount: 0,
          missingRecordCount: 0,
          retrievedAt: new Date().toISOString(),
          provenance: this.getProvenanceMetadata(),
        },
        data: [],
      };
    }

    const nowIso = new Date().toISOString();
    let latestValidTimestamp: string | null = null;
    let validRecords = 0;
    let missingRecords = 0;

    const observations: WeatherObservation[] = hourKeys.map((key) => {
      const timestamp = this.parseHourKeyToIso(key);

      const temp = this.normalizeNasaValue(t2mMap[key]);
      const rh = this.normalizeNasaValue(rh2mMap[key]);
      const precip = this.normalizeNasaValue(precipMap[key]);
      const ws = this.normalizeNasaValue(ws10mMap[key]);
      const wd = this.normalizeNasaValue(wd10mMap[key]);
      const ps = this.normalizeNasaValue(psMap[key]);

      // An observation is considered available if at least one parameter is valid
      const hasValidMeasurement =
        temp !== null || rh !== null || precip !== null || ws !== null || ps !== null;

      if (hasValidMeasurement) {
        validRecords++;
        latestValidTimestamp = timestamp;
      } else {
        missingRecords++;
      }

      return {
        timestamp,
        latitude: query.latitude,
        longitude: query.longitude,
        temperature2mC: temp,
        relativeHumidityPct: rh,
        precipitationMm: precip,
        windSpeed10mMs: ws,
        windDirection10mDeg: wd,
        surfacePressureKPa: ps,
        source: 'NASA_POWER',
        availability: hasValidMeasurement ? 'AVAILABLE' : 'UNAVAILABLE',
        retrievedAt: nowIso,
      };
    });

    const totalRecords = observations.length;
    let availabilityStatus: DataAvailabilityStatus = 'UNAVAILABLE';
    if (validRecords === totalRecords) {
      availabilityStatus = 'AVAILABLE';
    } else if (validRecords > 0) {
      availabilityStatus = 'PARTIAL';
    }

    return {
      source: 'NASA_POWER',
      availability: availabilityStatus,
      latestAvailableTimestamp: latestValidTimestamp,
      metadata: {
        source: 'NASA_POWER',
        requestedStart: this.dateStringToIso(startYmd, false),
        requestedEnd: this.dateStringToIso(endYmd, true),
        latestAvailableTimestamp: latestValidTimestamp,
        availabilityStatus,
        totalRecordCount: totalRecords,
        validRecordCount: validRecords,
        missingRecordCount: missingRecords,
        retrievedAt: nowIso,
        provenance: this.getProvenanceMetadata(),
      },
      data: observations,
    };
  }

  /**
   * Creates a deterministic simulated response for offline testing or demo environments.
   */
  public generateSimulatedResponse(
    query: HourlyPointQuery,
    startYmd: string,
    endYmd: string
  ): NormalizedHourlyPointResponse {
    const observations: WeatherObservation[] = [];
    const nowIso = new Date().toISOString();

    const startYear = parseInt(startYmd.substring(0, 4), 10);
    const startMonth = parseInt(startYmd.substring(4, 6), 10) - 1;
    const startDay = parseInt(startYmd.substring(6, 8), 10);

    const endYear = parseInt(endYmd.substring(0, 4), 10);
    const endMonth = parseInt(endYmd.substring(4, 6), 10) - 1;
    const endDay = parseInt(endYmd.substring(6, 8), 10);

    const cur = new Date(Date.UTC(startYear, startMonth, startDay, 0, 0, 0));
    const end = new Date(Date.UTC(endYear, endMonth, endDay, 23, 0, 0));

    let latestAvailableTimestamp: string | null = null;
    let validRecords = 0;
    let missingRecords = 0;

    // Simulate 2-day operational latency for NASA POWER
    const latencyCutoff = new Date(Date.now() - 48 * 3600 * 1000);

    while (cur <= end) {
      const isAvailable = cur <= latencyCutoff;
      const ts = cur.toISOString();

      if (isAvailable) {
        validRecords++;
        latestAvailableTimestamp = ts;
        observations.push({
          timestamp: ts,
          latitude: query.latitude,
          longitude: query.longitude,
          temperature2mC: Math.round((28 + 4 * Math.sin(cur.getUTCHours() / 4)) * 10) / 10,
          relativeHumidityPct: Math.round(65 + 15 * Math.cos(cur.getUTCHours() / 4)),
          precipitationMm: cur.getUTCHours() === 14 ? 2.5 : 0.0,
          windSpeed10mMs: 3.2,
          windDirection10mDeg: 130,
          surfacePressureKPa: 99.8,
          source: 'NASA_POWER',
          availability: 'AVAILABLE',
          retrievedAt: nowIso,
        });
      } else {
        missingRecords++;
        observations.push({
          timestamp: ts,
          latitude: query.latitude,
          longitude: query.longitude,
          temperature2mC: null,
          relativeHumidityPct: null,
          precipitationMm: null,
          windSpeed10mMs: null,
          windDirection10mDeg: null,
          surfacePressureKPa: null,
          source: 'NASA_POWER',
          availability: 'UNAVAILABLE',
          retrievedAt: nowIso,
        });
      }

      cur.setUTCHours(cur.getUTCHours() + 1);
    }

    const totalRecords = observations.length;
    const availabilityStatus: DataAvailabilityStatus =
      validRecords === totalRecords ? 'AVAILABLE' : validRecords > 0 ? 'PARTIAL' : 'UNAVAILABLE';

    return {
      source: 'NASA_POWER',
      availability: availabilityStatus,
      latestAvailableTimestamp,
      metadata: {
        source: 'NASA_POWER',
        requestedStart: this.dateStringToIso(startYmd, false),
        requestedEnd: this.dateStringToIso(endYmd, true),
        latestAvailableTimestamp,
        availabilityStatus,
        totalRecordCount: totalRecords,
        validRecordCount: validRecords,
        missingRecordCount: missingRecords,
        retrievedAt: nowIso,
        provenance: this.getProvenanceMetadata(),
      },
      data: observations,
    };
  }

  public getProvenanceMetadata() {
    return {
      providerName: 'NASA POWER Agroclimatology',
      dataset: 'NASA POWER Hourly Point Meteorology (MERRA-2 / GEOS-5 / CERES)',
      isKeyless: true,
      dataRole: 'HISTORICAL_OBSERVATION' as const,
      latencyClassification: 'NEAR_REAL_TIME_LATENCY' as const,
      latencyNote:
        'NASA POWER near-real-time agroclimatology products operate with an observational latency of ~2 to 4 days. It is not real-time weather.',
      attribution: 'NASA Langley Research Center (LaRC) POWER Project',
      provenanceUrl: 'https://power.larc.nasa.gov/',
    };
  }

  public createStructuredError(message: string): ProviderErrorResponse {
    return {
      source: 'NASA_POWER',
      status: 'ERROR',
      errorCode: 'PROVIDER_UNAVAILABLE',
      message: `NASA POWER data could not be retrieved: ${message}`,
      retrievedAt: new Date().toISOString(),
    };
  }
}

export const nasaPowerService = new NasaPowerService();
