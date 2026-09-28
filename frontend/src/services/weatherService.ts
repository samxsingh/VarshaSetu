import { request } from './apiClient';
import { ApiResponse, ApiErrorResponse } from '@shared/types';

export type ApiResult<T> = ApiResponse<T> | (ApiErrorResponse & { data?: T });

export type FreshnessClassification =
  | 'LIVE'
  | 'RECENT'
  | 'HISTORICAL'
  | 'CLIMATOLOGICAL'
  | 'SIMULATED'
  | 'UNAVAILABLE';

export type OperationalDataMode = 'OPERATIONAL' | 'HISTORICAL_ARCHIVE' | 'SIMULATION';

export interface OperationalDataContext {
  referenceTime: string;
  referenceTimeIST: string;
  currentDate: string; // YYYY-MM-DD
  location: LocationQuery;
  freshnessStatus: FreshnessClassification;
  dataMode: OperationalDataMode;
  observationWindow: {
    start: string;
    end: string;
  };
  forecastWindow: {
    start: string;
    end: string;
    horizonDays: number;
  };
  source: string;
  provider: string;
  observedAt: string;
  generatedAt: string;
  fallbackChainUsed?: string[];
}

export interface LocationQuery {
  state: string;
  district: string;
  blockId: string;
  blockName: string;
  latitude: number;
  longitude: number;
}

export interface NormalizedCurrentWeather {
  source: string;
  provider: string;
  dataset: string;
  location: LocationQuery;
  observedAt: string;
  observedAtIST: string;
  retrievedAt: string;
  sourceUpdatedAt: string;
  freshnessStatus: FreshnessClassification;
  isLive: boolean;
  isHistorical: boolean;
  isSimulated: boolean;
  temperatureC: number;
  temperatureMinC?: number;
  temperatureMaxC?: number;
  humidityPercent: number;
  precipitationMm: number;
  precipitationProbability?: number;
  surfacePressureHpa: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  soilMoisturePercent?: number;
  weatherCode?: number;
  conditionText: string;
  confidence: number;
  provenanceUrl: string;
  attribution: string;
  fallbackChainUsed?: string[];
}

export interface NormalizedDailyForecast {
  date: string;
  dayLabel: string;
  validFrom: string;
  validUntil: string;
  rainfallMm: number;
  rainfallProbability: number;
  tempMinC: number;
  tempMaxC: number;
  windSpeedKmh: number;
  heavyRainRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  drySpellRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  weatherCode: number;
  conditionText: string;
  confidence: number;
}

export interface NormalizedForecastResponse {
  location: LocationQuery;
  source: string;
  provider: string;
  retrievedAt: string;
  retrievedAtIST: string;
  sourceUpdatedAt: string;
  freshnessStatus: FreshnessClassification;
  isLive: boolean;
  isHistorical: boolean;
  isSimulated: boolean;
  daily: NormalizedDailyForecast[];
  summary: {
    expectedTotalRainfall7dMm: number;
    highestRainDay: string;
    heavyRainAlertRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    drySpellAlertRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    overallConfidence: number;
  };
  provenance: {
    sourceId: string;
    sourceName: string;
    modelFamily: string;
    resolution: string;
    retrievedAt: string;
    attribution: string;
    fallbackUsed: boolean;
    fallbackReason?: string;
  };
}

export interface ProviderHealth {
  name: string;
  providerId: string;
  status: 'CONNECTED' | 'DEGRADED' | 'STALE' | 'UNAVAILABLE';
  lastSuccess?: string;
  lastAttempt?: string;
  latencyMs?: number;
  error?: string;
}

export interface DataSyncStatus {
  overallStatus: 'LIVE' | 'SYNCING' | 'DEGRADED' | 'STALE' | 'OFFLINE';
  lastSuccessfulSync: string;
  lastAttemptedSync: string;
  recordsUpdated: number;
  recordsFailed: number;
  nextSync: string;
  providerStatuses: ProviderHealth[];
}

export interface ClimateSignalItem {
  signal: string;
  symbol: string;
  currentState: string;
  previousState: string;
  numericValue?: number;
  unit?: string;
  trend: 'STRENGTHENING' | 'WEAKENING' | 'STABLE' | 'NEUTRAL';
  influence: string;
  dataDate: string;
  classification: 'Observed' | 'Derived' | 'Model input' | 'Forecast signal' | 'Historical baseline';
  confidence: number;
  provenance: string;
}

export interface ClimateBaselineMetrics {
  location: LocationQuery;
  baselinePeriod: string;
  currentPeriod: string;
  source: string;
  climatologyDataset: string;
  rainfall: {
    observedAccumulationMm: number;
    baselineNormalMm: number;
    anomalyPercent: number;
    anomalyStatus: 'DEFICIENT' | 'NORMAL' | 'EXCESS' | 'LARGE_EXCESS';
  };
  temperature: {
    meanTemperatureC: number;
    baselineNormalC: number;
    anomalyC: number;
  };
  humidity: {
    meanRelativeHumidityPercent: number;
    baselineNormalPercent: number;
    anomalyPercent: number;
  };
  soilMoisture: {
    currentPercent: number;
    baselineNormalPercent: number;
    anomalyPercent: number;
  };
}

export interface OfficerBlockRiskItem {
  blockId: string;
  blockName: string;
  district: string;
  rainfallTodayMm: number;
  rainProbabilityPercent: number;
  heavyRainRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  drySpellRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  dataFreshness: FreshnessClassification;
  source: string;
  activeAlert?: string;
  lastUpdatedIST: string;
}

export interface GovernmentOverviewMetrics {
  monitoredBlocks: number;
  activeRainfallWarnings: number;
  heavyRainRiskBlocks: number;
  drySpellRiskBlocks: number;
  districtRainfallAnomalyPercent: number;
  districtRainfallStatus: 'DEFICIENT' | 'NORMAL' | 'EXCESS' | 'LARGE_EXCESS';
  overallDataFreshness: FreshnessClassification;
  forecastConfidenceScore: number;
  lastSyncTimeIST: string;
}

export const weatherService = {
  async getCurrentConditions(params?: {
    lat?: number;
    lon?: number;
    block_id?: string;
  }): Promise<ApiResult<NormalizedCurrentWeather>> {
    const q = new URLSearchParams();
    if (params?.lat) q.append('lat', params.lat.toString());
    if (params?.lon) q.append('lon', params.lon.toString());
    if (params?.block_id) q.append('block_id', params.block_id);
    const qs = q.toString() ? `?${q.toString()}` : '';
    try {
      return await request<NormalizedCurrentWeather>(`/weather/current${qs}`);
    } catch (err: any) {
      return { success: false, data: undefined as any, error: { code: 'CURRENT_FETCH_ERROR', message: err?.message || 'Failed to fetch current weather' } };
    }
  },

  async getForecast(params?: {
    lat?: number;
    lon?: number;
    block_id?: string;
    horizon?: number;
  }): Promise<ApiResult<NormalizedForecastResponse>> {
    const q = new URLSearchParams();
    if (params?.lat) q.append('lat', params.lat.toString());
    if (params?.lon) q.append('lon', params.lon.toString());
    if (params?.block_id) q.append('block_id', params.block_id);
    if (params?.horizon) q.append('horizon', params.horizon.toString());
    const qs = q.toString() ? `?${q.toString()}` : '';
    try {
      return await request<NormalizedForecastResponse>(`/weather/forecast${qs}`);
    } catch (err: any) {
      return { success: false, data: undefined as any, error: { code: 'FORECAST_FETCH_ERROR', message: err?.message || 'Failed to fetch forecast' } };
    }
  },

  async getSyncStatus(): Promise<ApiResult<DataSyncStatus>> {
    try {
      return await request<DataSyncStatus>('/weather/sync-status');
    } catch (err: any) {
      return { success: false, data: undefined as any, error: { code: 'SYNC_STATUS_ERROR', message: err?.message || 'Failed to fetch sync status' } };
    }
  },

  async getOfficerBlockRisks(): Promise<ApiResult<OfficerBlockRiskItem[]>> {
    try {
      return await request<OfficerBlockRiskItem[]>('/weather/officer-block-risks');
    } catch (err: any) {
      return { success: false, data: [], error: { code: 'OFFICER_RISKS_ERROR', message: err?.message || 'Failed to fetch block risks' } };
    }
  },

  async getGovernmentOverview(): Promise<ApiResult<GovernmentOverviewMetrics>> {
    try {
      return await request<GovernmentOverviewMetrics>('/weather/government-overview');
    } catch (err: any) {
      return { success: false, data: undefined as any, error: { code: 'GOV_OVERVIEW_ERROR', message: err?.message || 'Failed to fetch government overview' } };
    }
  },

  async getClimateSignals(): Promise<ApiResult<ClimateSignalItem[]>> {
    try {
      return await request<ClimateSignalItem[]>('/climate/signals');
    } catch (err: any) {
      return { success: false, data: [], error: { code: 'SIGNALS_ERROR', message: err?.message || 'Failed to fetch climate signals' } };
    }
  },

  async getClimateBaseline(blockId?: string): Promise<ApiResult<ClimateBaselineMetrics>> {
    const qs = blockId ? `?block_id=${encodeURIComponent(blockId)}` : '';
    try {
      return await request<ClimateBaselineMetrics>(`/climate/baseline${qs}`);
    } catch (err: any) {
      return { success: false, data: undefined as any, error: { code: 'BASELINE_ERROR', message: err?.message || 'Failed to fetch baseline' } };
    }
  },

  async getProviderHealth(): Promise<
    ApiResult<{ overall: string; providers: ProviderHealth[] }>
  > {
    try {
      return await request<{ overall: string; providers: ProviderHealth[] }>('/weather/provider-health');
    } catch (err: any) {
      return { success: false, data: { overall: 'UNKNOWN', providers: [] }, error: { code: 'HEALTH_ERROR', message: err?.message || 'Failed to fetch health' } };
    }
  },

  async getDataContext(params?: {
    lat?: number;
    lon?: number;
    block_id?: string;
  }): Promise<ApiResult<OperationalDataContext>> {
    const q = new URLSearchParams();
    if (params?.lat) q.append('lat', params.lat.toString());
    if (params?.lon) q.append('lon', params.lon.toString());
    if (params?.block_id) q.append('block_id', params.block_id);
    const qs = q.toString() ? `?${q.toString()}` : '';
    try {
      return await request<OperationalDataContext>(`/data/context${qs}`);
    } catch (err: any) {
      return { success: false, data: undefined as any, error: { code: 'CONTEXT_ERROR', message: err?.message || 'Failed to fetch data context' } };
    }
  },
};
