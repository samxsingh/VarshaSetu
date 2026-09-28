/**
 * VarshaSetu - Meteorological & Climate Canonical Types (Phase 11)
 * Provider-agnostic schemas, freshness classifications, and provenance models.
 */

export type FreshnessClassification =
  | 'LIVE'
  | 'RECENT'
  | 'HISTORICAL'
  | 'CLIMATOLOGICAL'
  | 'SIMULATED'
  | 'UNAVAILABLE';

export type OperationalDataMode = 'OPERATIONAL' | 'HISTORICAL_ARCHIVE' | 'SIMULATION';

export interface OperationalDataContext {
  referenceTime: string; // ISO in UTC
  referenceTimeIST: string; // Formatted in Asia/Kolkata
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

export function computeFreshnessFromAge(
  observedAt: Date | string,
  isSimulated: boolean = false
): FreshnessClassification {
  if (isSimulated) return 'SIMULATED';
  const obsTime = typeof observedAt === 'string' ? new Date(observedAt).getTime() : observedAt.getTime();
  if (isNaN(obsTime)) return 'UNAVAILABLE';
  const ageHours = (Date.now() - obsTime) / (1000 * 60 * 60);
  if (ageHours < 0) return 'LIVE'; // Forecast or current
  if (ageHours <= 3) return 'LIVE';
  if (ageHours <= 24) return 'RECENT';
  return 'HISTORICAL';
}

export type ProviderStatus =
  | 'CONNECTED'
  | 'DEGRADED'
  | 'STALE'
  | 'UNAVAILABLE';

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
  observedAt: string; // ISO in UTC / IST convertible
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
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. Mon, Tue
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
  status: ProviderStatus;
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
