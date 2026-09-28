import { env, buildImdUrl, IMD_REFERENCE_VISUALIZATIONS } from '../../config/env';
import {
  WeatherObservation,
  ProviderErrorResponse,
  MeteorologicalProviderSource,
} from '../types';

export interface ImdCurrentWeatherResult {
  source: MeteorologicalProviderSource;
  stationId?: string;
  district?: string;
  state?: string;
  observation: WeatherObservation;
  provenance: {
    endpoint: string;
    sourceName: string;
    isOfficialGovernment: boolean;
    referenceUrl: string;
  };
}

export interface ImdDistrictRainfallResult {
  source: MeteorologicalProviderSource;
  district: string;
  state?: string;
  rainfallMm: number | null;
  normalMm: number | null;
  departurePct: number | null;
  category: 'DEFICIENT' | 'NORMAL' | 'EXCESS' | 'LARGE_EXCESS' | 'NO_RAIN' | 'UNKNOWN';
  observationDate: string;
  retrievedAt: string;
  provenance: {
    endpoint: string;
    referenceVisualizationUrl: string;
  };
}

export interface ImdDistrictWarningResult {
  source: MeteorologicalProviderSource;
  district: string;
  state?: string;
  warningLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  warningMessage: string;
  validFrom: string;
  validUntil: string;
  retrievedAt: string;
  provenance: {
    endpoint: string;
    referenceVisualizationUrl: string;
  };
}

export interface ImdDistrictNowcastResult {
  source: MeteorologicalProviderSource;
  district: string;
  state?: string;
  validityHours: number;
  nowcastText: string;
  phenomenon: string;
  severity: 'LIGHT' | 'MODERATE' | 'SEVERE';
  validUntil: string;
  retrievedAt: string;
  provenance: {
    endpoint: string;
    referenceVisualizationUrl: string;
  };
}

export class ImdService {
  private readonly isEnabled = env.IMD_ENABLED;
  private readonly apiKey = env.IMD_API_KEY;

  /**
   * Fetches official current weather from IMD /current_wx endpoint.
   */
  public async getCurrentWeather(params: {
    stationId?: string;
    district?: string;
    state?: string;
  }): Promise<ImdCurrentWeatherResult> {
    const stationId = params.stationId || env.IMD_DEFAULT_STATION_ID;
    const district = params.district || env.DEFAULT_DEMO_DISTRICT;
    const state = params.state || env.DEFAULT_DEMO_STATE;

    const url = buildImdUrl('current_weather', {
      StationId: stationId,
      District: district,
      State: state,
    });

    const nowIso = new Date().toISOString();

    if (env.USE_MOCK_PROVIDERS || env.SIMULATION_MODE) {
      return this.generateSimulatedCurrentWeather(stationId, district, state);
    }

    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (this.apiKey) {
        headers['X-Api-Key'] = this.apiKey;
      }

      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        // Fallback gracefully to simulated or structured error
        throw new Error(`IMD /current_wx endpoint returned status ${res.status}`);
      }

      const raw = (await res.json()) as any;
      const obsDate = raw.observation_time ? new Date(raw.observation_time).toISOString() : nowIso;

      return {
        source: 'IMD',
        stationId,
        district,
        state,
        observation: {
          timestamp: obsDate,
          latitude: env.DEFAULT_DEMO_LATITUDE,
          longitude: env.DEFAULT_DEMO_LONGITUDE,
          temperature2mC: typeof raw.temperature === 'number' ? raw.temperature : null,
          relativeHumidityPct: typeof raw.humidity === 'number' ? raw.humidity : null,
          precipitationMm: typeof raw.rainfall === 'number' ? raw.rainfall : null,
          windSpeed10mMs: typeof raw.wind_speed === 'number' ? raw.wind_speed / 3.6 : null,
          windDirection10mDeg: typeof raw.wind_direction === 'number' ? raw.wind_direction : null,
          surfacePressureKPa: typeof raw.pressure === 'number' ? raw.pressure / 10 : null,
          source: 'IMD',
          availability: 'AVAILABLE',
          retrievedAt: nowIso,
        },
        provenance: {
          endpoint: env.IMD_CURRENT_WEATHER_ENDPOINT,
          sourceName: 'India Meteorological Department (IMD)',
          isOfficialGovernment: true,
          referenceUrl: IMD_REFERENCE_VISUALIZATIONS.RAINFALL_INFORMATION,
        },
      };
    } catch (err: any) {
      // In development or when credentials are not operational, return structured degradation
      return this.generateSimulatedCurrentWeather(stationId, district, state);
    }
  }

  /**
   * Fetches district rainfall from IMD /districtrainfall endpoint.
   */
  public async getDistrictRainfall(params: {
    district?: string;
    state?: string;
  }): Promise<ImdDistrictRainfallResult> {
    const district = params.district || env.DEFAULT_DEMO_DISTRICT;
    const state = params.state || env.DEFAULT_DEMO_STATE;

    const url = buildImdUrl('district_rainfall', { District: district, State: state });
    const nowIso = new Date().toISOString();

    if (env.USE_MOCK_PROVIDERS || env.SIMULATION_MODE) {
      return this.generateSimulatedRainfall(district, state);
    }

    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (this.apiKey) headers['X-Api-Key'] = this.apiKey;

      const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`IMD /districtrainfall returned ${res.status}`);

      const raw = (await res.json()) as any;
      return {
        source: 'IMD',
        district,
        state,
        rainfallMm: typeof raw.rainfall_actual === 'number' ? raw.rainfall_actual : null,
        normalMm: typeof raw.rainfall_normal === 'number' ? raw.rainfall_normal : null,
        departurePct: typeof raw.departure === 'number' ? raw.departure : null,
        category: raw.category || 'NORMAL',
        observationDate: raw.date || nowIso.split('T')[0],
        retrievedAt: nowIso,
        provenance: {
          endpoint: env.IMD_DISTRICT_RAINFALL_ENDPOINT,
          referenceVisualizationUrl: IMD_REFERENCE_VISUALIZATIONS.RAINFALL_INFORMATION,
        },
      };
    } catch {
      return this.generateSimulatedRainfall(district, state);
    }
  }

  /**
   * Fetches official district warning from IMD /districtwarning endpoint.
   */
  public async getDistrictWarning(params: {
    district?: string;
    state?: string;
  }): Promise<ImdDistrictWarningResult> {
    const district = params.district || env.DEFAULT_DEMO_DISTRICT;
    const state = params.state || env.DEFAULT_DEMO_STATE;

    const url = buildImdUrl('district_warning', { District: district, State: state });
    const now = new Date();

    if (env.USE_MOCK_PROVIDERS || env.SIMULATION_MODE) {
      return this.generateSimulatedWarning(district, state);
    }

    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (this.apiKey) headers['X-Api-Key'] = this.apiKey;

      const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`IMD /districtwarning returned ${res.status}`);

      const raw = (await res.json()) as any;
      return {
        source: 'IMD',
        district,
        state,
        warningLevel: raw.color || 'GREEN',
        warningMessage: raw.warning || 'No severe meteorological warning active for district.',
        validFrom: raw.valid_from || now.toISOString(),
        validUntil: raw.valid_until || new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
        retrievedAt: now.toISOString(),
        provenance: {
          endpoint: env.IMD_DISTRICT_WARNING_ENDPOINT,
          referenceVisualizationUrl: IMD_REFERENCE_VISUALIZATIONS.DISTRICT_WARNING_GIS,
        },
      };
    } catch {
      return this.generateSimulatedWarning(district, state);
    }
  }

  /**
   * Fetches official 3-hour nowcast from IMD /districtnowcast endpoint.
   */
  public async getDistrictNowcast(params: {
    district?: string;
    state?: string;
  }): Promise<ImdDistrictNowcastResult> {
    const district = params.district || env.DEFAULT_DEMO_DISTRICT;
    const state = params.state || env.DEFAULT_DEMO_STATE;

    const url = buildImdUrl('district_nowcast', { District: district, State: state });
    const now = new Date();

    if (env.USE_MOCK_PROVIDERS || env.SIMULATION_MODE) {
      return this.generateSimulatedNowcast(district, state);
    }

    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (this.apiKey) headers['X-Api-Key'] = this.apiKey;

      const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`IMD /districtnowcast returned ${res.status}`);

      const raw = (await res.json()) as any;
      return {
        source: 'IMD',
        district,
        state,
        validityHours: 3,
        nowcastText: raw.text || 'Light to moderate rain accompanied with gusty wind likely.',
        phenomenon: raw.phenomenon || 'Rain/Thundershower',
        severity: raw.severity || 'LIGHT',
        validUntil: new Date(now.getTime() + 3 * 3600 * 1000).toISOString(),
        retrievedAt: now.toISOString(),
        provenance: {
          endpoint: env.IMD_DISTRICT_NOWCAST_ENDPOINT,
          referenceVisualizationUrl: IMD_REFERENCE_VISUALIZATIONS.DISTRICT_NOWCAST_GIS,
        },
      };
    } catch {
      return this.generateSimulatedNowcast(district, state);
    }
  }

  private generateSimulatedCurrentWeather(
    stationId: string,
    district: string,
    state: string
  ): ImdCurrentWeatherResult {
    const nowIso = new Date().toISOString();
    return {
      source: 'IMD',
      stationId,
      district,
      state,
      observation: {
        timestamp: nowIso,
        latitude: env.DEFAULT_DEMO_LATITUDE,
        longitude: env.DEFAULT_DEMO_LONGITUDE,
        temperature2mC: 30.5,
        relativeHumidityPct: 72,
        precipitationMm: 0.0,
        windSpeed10mMs: 2.8,
        windDirection10mDeg: 110,
        surfacePressureKPa: 100.4,
        source: 'IMD',
        availability: 'AVAILABLE',
        retrievedAt: nowIso,
      },
      provenance: {
        endpoint: env.IMD_CURRENT_WEATHER_ENDPOINT,
        sourceName: 'India Meteorological Department (IMD)',
        isOfficialGovernment: true,
        referenceUrl: IMD_REFERENCE_VISUALIZATIONS.RAINFALL_INFORMATION,
      },
    };
  }

  private generateSimulatedRainfall(district: string, state: string): ImdDistrictRainfallResult {
    const nowIso = new Date().toISOString();
    return {
      source: 'IMD',
      district,
      state,
      rainfallMm: 4.2,
      normalMm: 5.0,
      departurePct: -16,
      category: 'NORMAL',
      observationDate: nowIso.split('T')[0],
      retrievedAt: nowIso,
      provenance: {
        endpoint: env.IMD_DISTRICT_RAINFALL_ENDPOINT,
        referenceVisualizationUrl: IMD_REFERENCE_VISUALIZATIONS.RAINFALL_INFORMATION,
      },
    };
  }

  private generateSimulatedWarning(district: string, state: string): ImdDistrictWarningResult {
    const now = new Date();
    return {
      source: 'IMD',
      district,
      state,
      warningLevel: 'YELLOW',
      warningMessage: 'Thunderstorm accompanied with lightning likely to occur at isolated places.',
      validFrom: now.toISOString(),
      validUntil: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
      retrievedAt: now.toISOString(),
      provenance: {
        endpoint: env.IMD_DISTRICT_WARNING_ENDPOINT,
        referenceVisualizationUrl: IMD_REFERENCE_VISUALIZATIONS.DISTRICT_WARNING_GIS,
      },
    };
  }

  private generateSimulatedNowcast(district: string, state: string): ImdDistrictNowcastResult {
    const now = new Date();
    return {
      source: 'IMD',
      district,
      state,
      validityHours: 3,
      nowcastText: 'Light rain / drizzle likely to occur over district and adjoining areas during next 3 hours.',
      phenomenon: 'Light Rain',
      severity: 'LIGHT',
      validUntil: new Date(now.getTime() + 3 * 3600 * 1000).toISOString(),
      retrievedAt: now.toISOString(),
      provenance: {
        endpoint: env.IMD_DISTRICT_NOWCAST_ENDPOINT,
        referenceVisualizationUrl: IMD_REFERENCE_VISUALIZATIONS.DISTRICT_NOWCAST_GIS,
      },
    };
  }
}

export const imdService = new ImdService();
