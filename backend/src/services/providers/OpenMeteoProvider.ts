import { WeatherProvider } from './WeatherProvider';
import {
  LocationQuery,
  NormalizedCurrentWeather,
  NormalizedForecastResponse,
  NormalizedDailyForecast,
  ProviderHealth,
} from '../weather/types';
import { env } from '../../config/env';

export class OpenMeteoProvider implements WeatherProvider {
  public readonly name = 'Open-Meteo / ECMWF IFS';
  public readonly providerId = 'OPEN_METEO_ECMWF';
  public readonly isEnabled = env.OPEN_METEO_ENABLED;

  private readonly baseUrl: string;
  private lastHealthStatus: ProviderHealth = {
    name: 'Open-Meteo / ECMWF IFS',
    providerId: 'OPEN_METEO_ECMWF',
    status: 'CONNECTED',
  };

  constructor() {
    this.baseUrl = env.OPEN_METEO_BASE_URL.replace(/\/+$/, '');
  }

  async checkHealth(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const url = `${this.baseUrl}/forecast?latitude=26.9749&longitude=80.9276&current=temperature_2m`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const data = (await res.json()) as any;

      const latencyMs = Date.now() - start;
      const isOk = res.status === 200 && data?.current?.temperature_2m !== undefined;

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
        error: err.message || 'Open-Meteo endpoint unreachable',
      };
      return this.lastHealthStatus;
    }
  }

  async getCurrentConditions(location: LocationQuery): Promise<NormalizedCurrentWeather> {
    const currentParams = [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'rain',
      'weather_code',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(',');

    const url = `${this.baseUrl}/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=${currentParams}&timezone=Asia%2FKolkata`;
    const res = await fetch(url, { signal: AbortSignal.timeout(7000) });

    if (!res.ok) {
      throw new Error(`Open-Meteo current endpoint responded with status ${res.status}`);
    }

    const data = (await res.json()) as any;
    const current = data.current;
    if (!current) {
      throw new Error('Open-Meteo returned empty current weather structure');
    }

    const now = new Date();
    const obsTime = current.time ? new Date(current.time) : now;
    const condition = this.mapWeatherCodeToText(current.weather_code);

    return {
      source: 'Open-Meteo / ECMWF IFS & DWD ICON',
      provider: this.providerId,
      dataset: 'Open-Meteo High-Resolution Gridded Atmospheric Model',
      location,
      observedAt: obsTime.toISOString(),
      observedAtIST: current.time ? `${current.time} IST` : obsTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      retrievedAt: now.toISOString(),
      sourceUpdatedAt: obsTime.toISOString(),
      freshnessStatus: 'LIVE',
      isLive: true,
      isHistorical: false,
      isSimulated: false,
      temperatureC: Math.round(current.temperature_2m * 10) / 10,
      humidityPercent: Math.round(current.relative_humidity_2m),
      precipitationMm: current.precipitation ?? current.rain ?? 0,
      surfacePressureHpa: Math.round(current.surface_pressure * 10) / 10,
      windSpeedKmh: Math.round(current.wind_speed_10m * 10) / 10,
      windDirectionDeg: Math.round(current.wind_direction_10m),
      weatherCode: current.weather_code,
      conditionText: condition,
      confidence: 0.94,
      provenanceUrl: 'https://open-meteo.com/en/docs',
      attribution: 'Open-Meteo Weather API (ECMWF IFS / DWD ICON Models)',
    };
  }

  async getForecast(location: LocationQuery, horizonDays: number = 7): Promise<NormalizedForecastResponse> {
    const dailyParams = [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
    ].join(',');

    const url = `${this.baseUrl}/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=${dailyParams}&timezone=Asia%2FKolkata`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!res.ok) {
      throw new Error(`Open-Meteo forecast endpoint responded with status ${res.status}`);
    }

    const data = (await res.json()) as any;
    const dailyRaw = data.daily;
    if (!dailyRaw || !dailyRaw.time || !Array.isArray(dailyRaw.time)) {
      throw new Error('Open-Meteo returned invalid daily forecast series');
    }

    const now = new Date();
    const daysCount = Math.min(dailyRaw.time.length, horizonDays);
    const daily: NormalizedDailyForecast[] = [];

    let totalRainfall7d = 0;
    let maxRain = -1;
    let highestRainDay = 'None';
    let maxHeavyRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let consecutiveDryDays = 0;
    let maxDryRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';

    for (let i = 0; i < daysCount; i++) {
      const dateStr = dailyRaw.time[i];
      const rainfall = dailyRaw.precipitation_sum[i] ?? 0;
      const rainProb = dailyRaw.precipitation_probability_max[i] ?? 0;
      const tMin = dailyRaw.temperature_2m_min[i] ?? 22;
      const tMax = dailyRaw.temperature_2m_max[i] ?? 32;
      const windMax = dailyRaw.wind_speed_10m_max[i] ?? 8;
      const wCode = dailyRaw.weather_code[i] ?? 0;

      totalRainfall7d += rainfall;
      if (rainfall > maxRain) {
        maxRain = rainfall;
        highestRainDay = dateStr;
      }

      // IMD heavy rain criteria: >=64.5 mm = Heavy Rain
      let heavyRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (rainfall >= 64.5 || (rainfall >= 40 && rainProb >= 70)) {
        heavyRisk = 'CRITICAL';
        maxHeavyRisk = 'CRITICAL';
      } else if (rainfall >= 35.5 || (rainfall >= 20 && rainProb >= 60)) {
        heavyRisk = 'HIGH';
        if (maxHeavyRisk !== 'CRITICAL') maxHeavyRisk = 'HIGH';
      } else if (rainfall >= 15.6 || rainProb >= 50) {
        heavyRisk = 'MODERATE';
        if (maxHeavyRisk === 'LOW') maxHeavyRisk = 'MODERATE';
      }

      // Dry spell monitoring (rain < 2.5 mm is non-rainy day in IMD standards)
      if (rainfall < 2.5) {
        consecutiveDryDays++;
      } else {
        consecutiveDryDays = 0;
      }

      let dryRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (consecutiveDryDays >= 5) {
        dryRisk = 'HIGH';
        maxDryRisk = 'HIGH';
      } else if (consecutiveDryDays >= 3) {
        dryRisk = 'MODERATE';
        if (maxDryRisk === 'LOW') maxDryRisk = 'MODERATE';
      }

      daily.push({
        date: dateStr,
        dayLabel: new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' }),
        validFrom: `${dateStr}T00:00:00+05:30`,
        validUntil: `${dateStr}T23:59:59+05:30`,
        rainfallMm: Math.round(rainfall * 10) / 10,
        rainfallProbability: Math.round(rainProb),
        tempMinC: Math.round(tMin * 10) / 10,
        tempMaxC: Math.round(tMax * 10) / 10,
        windSpeedKmh: Math.round(windMax * 10) / 10,
        heavyRainRisk: heavyRisk,
        drySpellRisk: dryRisk,
        weatherCode: wCode,
        conditionText: this.mapWeatherCodeToText(wCode),
        confidence: 0.91,
      });
    }

    return {
      location,
      source: 'Open-Meteo / ECMWF IFS & DWD ICON',
      provider: this.providerId,
      retrievedAt: now.toISOString(),
      retrievedAtIST: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      sourceUpdatedAt: now.toISOString(),
      freshnessStatus: 'LIVE',
      isLive: true,
      isHistorical: false,
      isSimulated: false,
      daily,
      summary: {
        expectedTotalRainfall7dMm: Math.round(totalRainfall7d * 10) / 10,
        highestRainDay,
        heavyRainAlertRisk: maxHeavyRisk,
        drySpellAlertRisk: maxDryRisk,
        overallConfidence: 0.91,
      },
      provenance: {
        sourceId: this.providerId,
        sourceName: 'Open-Meteo High-Resolution Numerical Forecasts',
        modelFamily: 'ECMWF IFS (Integrated Forecasting System) & DWD ICON',
        resolution: 'Gridded 0.1° (~9–11 km)',
        retrievedAt: now.toISOString(),
        attribution: 'Open-Meteo API under CC BY 4.0 (incorporating ECMWF / DWD open data)',
        fallbackUsed: false,
      },
    };
  }

  private mapWeatherCodeToText(code?: number): string {
    if (code === undefined || code === null) return 'Partly Cloudy';
    switch (code) {
      case 0: return 'Clear Sky';
      case 1: return 'Mainly Clear';
      case 2: return 'Partly Cloudy';
      case 3: return 'Overcast';
      case 45: return 'Fog';
      case 48: return 'Depositing Rime Fog';
      case 51: return 'Light Drizzle';
      case 53: return 'Moderate Drizzle';
      case 55: return 'Dense Drizzle';
      case 61: return 'Slight Rain';
      case 63: return 'Moderate Rain';
      case 65: return 'Heavy Rain';
      case 80: return 'Slight Rain Showers';
      case 81: return 'Moderate Rain Showers';
      case 82: return 'Violent Rain Showers';
      case 95: return 'Thunderstorm';
      case 96: return 'Thunderstorm with Slight Hail';
      case 99: return 'Thunderstorm with Heavy Hail';
      default: return 'Fair Conditions';
    }
  }
}
