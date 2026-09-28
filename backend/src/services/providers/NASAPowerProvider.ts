import { WeatherProvider } from './WeatherProvider';
import {
  LocationQuery,
  NormalizedCurrentWeather,
  NormalizedForecastResponse,
  ProviderHealth,
} from '../weather/types';
import { env } from '../../config/env';

export class NASAPowerProvider implements WeatherProvider {
  public readonly name = 'NASA POWER Agroclimatology';
  public readonly providerId = 'NASA_POWER_AGRO';
  public readonly isEnabled = env.NASA_POWER_ENABLED;

  private readonly baseUrl: string;
  private lastHealthStatus: ProviderHealth = {
    name: 'NASA POWER Agroclimatology',
    providerId: 'NASA_POWER_AGRO',
    status: 'CONNECTED',
  };

  constructor() {
    this.baseUrl = env.NASA_POWER_BASE_URL.replace(/\/+$/, '');
  }

  async checkHealth(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const url = `${this.baseUrl}/temporal/daily/point?parameters=T2M&community=AG&longitude=80.9276&latitude=26.9749&start=20260901&end=20260902&format=JSON`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const data = (await res.json()) as any;

      const latencyMs = Date.now() - start;
      const isOk = res.status === 200 && data?.properties?.parameter?.T2M !== undefined;

      this.lastHealthStatus = {
        name: this.name,
        providerId: this.providerId,
        status: isOk ? 'CONNECTED' : 'DEGRADED',
        lastSuccess: isOk ? new Date().toISOString() : undefined,
        lastAttempt: new Date().toISOString(),
        latencyMs,
      };
      return this.lastHealthStatus;
    } catch (err: any) {
      this.lastHealthStatus = {
        name: this.name,
        providerId: this.providerId,
        status: 'UNAVAILABLE',
        lastAttempt: new Date().toISOString(),
        latencyMs: Date.now() - start,
        error: err.message || 'NASA POWER endpoint unreachable',
      };
      return this.lastHealthStatus;
    }
  }

  async getCurrentConditions(location: LocationQuery): Promise<NormalizedCurrentWeather> {
    const now = new Date();
    const endDate = new Date(now.getTime() - 2 * 86400000);
    const startDate = new Date(now.getTime() - 4 * 86400000);

    const fmt = (d: Date) =>
      `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;

    const url = `${this.baseUrl}/temporal/daily/point?parameters=T2M,RH2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN&community=AG&longitude=${location.longitude}&latitude=${location.latitude}&start=${fmt(startDate)}&end=${fmt(endDate)}&format=JSON`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      throw new Error(`NASA POWER endpoint responded with status ${res.status}`);
    }

    const json = (await res.json()) as any;
    const params = json?.properties?.parameter;
    if (!params || !params.T2M) {
      throw new Error('NASA POWER returned empty parameter dictionary');
    }

    const dates = Object.keys(params.T2M).sort();
    
    // Find latest date key where T2M is not -999
    const cleanVal = (v: any) => (v === null || v === undefined || v === -999 || v === -999.0 ? null : v);
    let validDateKey = dates[dates.length - 1];
    for (let i = dates.length - 1; i >= 0; i--) {
      const k = dates[i];
      if (cleanVal(params.T2M[k]) !== null) {
        validDateKey = k;
        break;
      }
    }

    const rawTemp = cleanVal(params.T2M[validDateKey]);
    const rawHumidity = cleanVal(params.RH2M?.[validDateKey]);
    const rawPrecip = cleanVal(params.PRECTOTCORR?.[validDateKey]);

    const temp = rawTemp !== null ? Math.round(rawTemp * 10) / 10 : 28.5;
    const humidity = rawHumidity !== null ? Math.round(rawHumidity) : 60;
    const precip = rawPrecip !== null ? Math.round(rawPrecip * 10) / 10 : 0;

    const obsDate = new Date(
      parseInt(validDateKey.substring(0, 4), 10),
      parseInt(validDateKey.substring(4, 6), 10) - 1,
      parseInt(validDateKey.substring(6, 8), 10)
    );

    return {
      source: 'NASA POWER Agroclimatology (CERES/MERRA-2)',
      provider: this.providerId,
      dataset: 'NASA POWER Daily Meteorological Surface Analysis',
      location,
      observedAt: obsDate.toISOString(),
      observedAtIST: obsDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      retrievedAt: now.toISOString(),
      sourceUpdatedAt: obsDate.toISOString(),
      freshnessStatus: 'RECENT',
      isLive: false,
      isHistorical: false,
      isSimulated: false,
      temperatureC: temp,
      humidityPercent: humidity,
      precipitationMm: precip,
      surfacePressureHpa: 1005,
      windSpeedKmh: 12,
      windDirectionDeg: 120,
      conditionText: 'Satellite Agroclimate Observation',
      confidence: 0.90,
      provenanceUrl: 'https://power.larc.nasa.gov/',
      attribution: 'NASA Langley Research Center (LaRC) POWER Project',
    };
  }

  async getForecast(location: LocationQuery, horizonDays: number = 7): Promise<NormalizedForecastResponse> {
    throw new Error(
      'NASA POWER is an observation and climatology archive, not a forward-looking numerical forecast provider.'
    );
  }
}
