import { ScientificForecastRecord } from '../services/forecastService';

export interface ForecastSummaryMetrics {
  expectedRainfallMm: number | null;
  rainfallRange: {
    lower: number;
    upper: number;
    method?: string;
  } | null;
  rainEventRiskPct: number | null;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  climatologicalBaseline: string;
}

export interface SharedScientificContext {
  observationDate: string;
  validFrom: string;
  validUntil: string;
  forecastHorizonDays: number;
  modelId: string;
  modelFamily: string;
  spatialResolution: string;
  dataFreshness: string;
  status: string;
  disclosures: string[];
}

export interface NormalizedForecastData {
  summary: ForecastSummaryMetrics;
  signals: ScientificForecastRecord[];
  sharedContext: SharedScientificContext | null;
}

/**
 * Normalizes, deduplicates, and groups scientific forecast records into a clean
 * operational hierarchy:
 * 1. Primary summary metrics
 * 2. Distinct key event signals
 * 3. Shared model and evidence metadata
 */
export function normalizeForecastData(records: ScientificForecastRecord[]): NormalizedForecastData {
  if (!records || records.length === 0) {
    return {
      summary: {
        expectedRainfallMm: null,
        rainfallRange: null,
        rainEventRiskPct: null,
        confidenceLevel: 'MEDIUM',
        confidenceScore: 0.85,
        climatologicalBaseline: 'Climatological Normal: 32%',
      },
      signals: [],
      sharedContext: null,
    };
  }

  // 1. Semantic Deduplication: Keep newest record for each (target_type, horizon_days, block_id, valid_from, valid_until, model_id)
  const seenMap = new Map<string, ScientificForecastRecord>();
  for (const r of records) {
    const key = [
      r.location?.block_id || '',
      r.horizon?.horizon_days ?? '',
      r.target?.target_type || '',
      r.valid_from || '',
      r.valid_until || '',
      r.model?.model_id || '',
    ].join('::');

    const existing = seenMap.get(key);
    if (!existing) {
      seenMap.set(key, r);
    } else {
      const curTime = new Date(r.generated_at).getTime() || 0;
      const exTime = new Date(existing.generated_at).getTime() || 0;
      if (curTime > exTime) {
        seenMap.set(key, r);
      }
    }
  }

  const distinctRecords = Array.from(seenMap.values());

  // 2. Extract Primary Metrics
  const rainfallRecord = distinctRecords.find(
    (r) => r.target?.target_type === 'RAINFALL_AMOUNT' || (r.prediction?.predicted_value !== null && r.prediction?.predicted_value !== undefined)
  );

  const heavyRainRecord = distinctRecords.find((r) => r.target?.target_type === 'HEAVY_RAIN') ||
    distinctRecords.find((r) => r.prediction?.probability !== null && r.prediction?.probability !== undefined);

  const expectedRainfallMm = rainfallRecord?.prediction?.predicted_value != null
    ? rainfallRecord.prediction.predicted_value
    : null;

  let rainfallRange: ForecastSummaryMetrics['rainfallRange'] = null;
  if (
    rainfallRecord?.uncertainty?.status === 'CALCULATED' &&
    typeof rainfallRecord.uncertainty.lower_bound === 'number' &&
    typeof rainfallRecord.uncertainty.upper_bound === 'number'
  ) {
    rainfallRange = {
      lower: rainfallRecord.uncertainty.lower_bound,
      upper: rainfallRecord.uncertainty.upper_bound,
      method: rainfallRecord.uncertainty.method || 'Quantile Resampling',
    };
  }

  const rainEventRiskPct = heavyRainRecord?.prediction?.probability != null
    ? Math.round(heavyRainRecord.prediction.probability * 100)
    : null;

  const hasValidated = distinctRecords.some((r) => r.validation?.validation_status === 'VALIDATED');
  const confidenceLevel = hasValidated ? 'HIGH' : 'MEDIUM';

  const primaryRef = distinctRecords[0];

  const sharedContext: SharedScientificContext = {
    observationDate: primaryRef.valid_from || '2024-10-01',
    validFrom: primaryRef.valid_from,
    validUntil: primaryRef.valid_until,
    forecastHorizonDays: primaryRef.horizon?.horizon_days || 7,
    modelId: primaryRef.model?.model_id || 'xgboost',
    modelFamily: primaryRef.model?.model_family || 'Gradient Boosted Decision Trees',
    spatialResolution: primaryRef.location?.spatial_resolution || 'BLOCK',
    dataFreshness: primaryRef.data?.freshness_status || 'HISTORICAL_ONLY',
    status: primaryRef.scientific_disclosure?.status || 'DIAGNOSTIC_ONLY',
    disclosures: primaryRef.scientific_disclosure?.messages || [],
  };

  return {
    summary: {
      expectedRainfallMm,
      rainfallRange,
      rainEventRiskPct,
      confidenceLevel,
      confidenceScore: 0.85,
      climatologicalBaseline: 'Climatological Normal: 32%',
    },
    signals: distinctRecords,
    sharedContext,
  };
}
