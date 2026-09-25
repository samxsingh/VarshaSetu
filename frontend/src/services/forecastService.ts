import { request } from './apiClient';
import {
  HyperlocalForecastRecord,
  ForecastHorizonDays,
  DataProvenance,
  ApiResponse,
} from '@shared/types';

// =====================================================================
// PHASE 4E SCIENTIFIC FORECAST CONTRACTS
// =====================================================================

export interface LocationContext {
  state_id: string;
  district_id: string;
  block_id: string;
  latitude: number;
  longitude: number;
  spatial_resolution: string;
}

export interface TargetContext {
  target_type: string;
  target_definition_version: string;
  threshold?: number | null;
  unit: string;
}

export interface HorizonContext {
  horizon_days: number;
  horizon_label: string;
}

export interface ModelContext {
  model_id: string;
  model_family: string;
  model_version: string;
  training_period: string;
  dataset_fingerprint: string;
}

export interface PredictionContext {
  probability?: number | null;
  predicted_value?: number | null;
  category: string;
  event_observed_reference_if_available?: number | boolean | null;
}

export interface CalibrationContext {
  status: string;
  calibrator_type: string;
  calibration_artifact_id?: string | null;
}

export interface UncertaintyContext {
  status: string;
  lower_bound?: number | null;
  median?: number | null;
  upper_bound?: number | null;
  method: string;
}

export interface ValidationContext {
  validation_status: string;
  validation_years: number[];
  hindcast_experiment_id?: string | null;
}

export interface FeatureContributionItem {
  feature: string;
  category: string;
  shap_value: number;
  direction: string;
  magnitude: number;
  description: string;
}

export interface ExplainabilityContext {
  status: string;
  top_features: FeatureContributionItem[];
  shap_artifact_id?: string | null;
}

export interface DataContext {
  source_status: string;
  freshness_status: string;
  missingness: number;
  feature_coverage: string;
}

export interface ScientificDisclosureContext {
  status: string;
  messages: string[];
}

export interface ScientificForecastRecord {
  forecast_id: string;
  generated_at: string;
  valid_from: string;
  valid_until: string;
  location: LocationContext;
  target: TargetContext;
  horizon: HorizonContext;
  model: ModelContext;
  prediction: PredictionContext;
  calibration: CalibrationContext;
  uncertainty: UncertaintyContext;
  validation: ValidationContext;
  explainability: ExplainabilityContext;
  data: DataContext;
  scientific_disclosure: ScientificDisclosureContext;
}

export interface ForecastStatusResponse {
  service: string;
  phase: string;
  operational_forecast_allowed: boolean;
  system_status: string;
  active_dataset: string;
  total_records: number;
  total_forecasts_generated: number;
  message: string;
  scientific_disclosure: string;
}

export interface ForecastAvailabilityResponse {
  block_id: string;
  data_freshness: string;
  latest_observation_date: string;
  days_since_latest_observation: number;
  features_available: number;
  features_required: number;
  feature_coverage_pct: number;
  missingness_pct: number;
  expected_cadence: string;
  stale_threshold_hours: number;
  operational_allowed: boolean;
  scientific_notes: string;
}

export interface ForecastListResponse {
  total_forecasts: number;
  forecasts: ScientificForecastRecord[];
}

export interface ForecastExplanationResponse {
  forecast_id: string;
  target_name: string;
  horizon_days: number;
  model_id: string;
  model_name: string;
  explainability_status: string;
  top_features: FeatureContributionItem[];
  evidence_summary: Record<string, any>;
  deterministic_narrative: string;
  scientific_limitations: string[];
}

export interface ForecastTargetItem {
  target_type: string;
  name: string;
  description: string;
  unit: string;
  threshold?: number | null;
  category: string;
  version: string;
}

export interface TargetListResponse {
  targets: ForecastTargetItem[];
}

export interface ForecastHorizonItem {
  horizon_days: number;
  horizon_label: string;
  description: string;
  meteorological_scale: string;
  uncertainty_supported: boolean;
}

export interface HorizonListResponse {
  horizons: ForecastHorizonItem[];
}

export interface ForecastHistoryItem {
  forecast_id: string;
  generated_at: string;
  valid_from: string;
  valid_until: string;
  target_name: string;
  horizon_days: number;
  model_id: string;
  model_version: string;
  dataset_fingerprint: string;
  probability?: number | null;
  predicted_value?: number | null;
  status: string;
  verification_status: string;
  verification_error?: number | null;
}

export interface ForecastHistoryResponse {
  total: number;
  history: ForecastHistoryItem[];
}

export interface ForecastFilterParams {
  target?: string;
  horizon?: number;
  block_id?: string;
  status?: string;
  limit?: number;
}

export type ForecastGateStatusResponse = ForecastStatusResponse;

export interface ForecastGeneratePayload {
  target_name?: string;
  target_type?: string;
  horizon_days: number;
  block_id?: string;
  model_id?: string;
  model_type?: string;
  reference_date?: string;
  request_explanation?: boolean;
}

// =====================================================================
// FORECAST SERVICE API CLIENT
// =====================================================================

export const forecastService = {
  async getForecastStatus(): Promise<ApiResponse<ForecastStatusResponse>> {
    return request<ForecastStatusResponse>('/forecasts/status');
  },

  async getStatus(): Promise<ApiResponse<ForecastStatusResponse>> {
    return request<ForecastStatusResponse>('/forecasts/status');
  },

  async getForecastAvailability(blockId = 'UP_LKO_BKT'): Promise<ApiResponse<ForecastAvailabilityResponse>> {
    return request<ForecastAvailabilityResponse>(`/forecasts/availability?block_id=${encodeURIComponent(blockId)}`);
  },

  async getForecasts(params: ForecastFilterParams = {}): Promise<ApiResponse<ForecastListResponse>> {
    const query = new URLSearchParams();
    if (params.target) query.append('target', params.target);
    if (params.horizon) query.append('horizon', String(params.horizon));
    if (params.block_id) query.append('block_id', params.block_id);
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = queryString ? `/forecasts?${queryString}` : '/forecasts';
    return request<ForecastListResponse>(endpoint);
  },

  async getForecast(forecastId: string): Promise<ApiResponse<ScientificForecastRecord>> {
    return request<ScientificForecastRecord>(`/forecasts/${encodeURIComponent(forecastId)}`);
  },

  async getForecastExplanation(forecastId: string): Promise<ApiResponse<ForecastExplanationResponse>> {
    return request<ForecastExplanationResponse>(`/forecasts/${encodeURIComponent(forecastId)}/explanation`);
  },

  async getLocationForecasts(blockId: string): Promise<ApiResponse<{ block_id: string; total_forecasts: number; forecasts: ScientificForecastRecord[] }>> {
    return request<{ block_id: string; total_forecasts: number; forecasts: ScientificForecastRecord[] }>(
      `/forecasts/location/${encodeURIComponent(blockId)}`
    );
  },

  async generateForecast(payload: ForecastGeneratePayload): Promise<ApiResponse<ScientificForecastRecord>> {
    return request<ScientificForecastRecord>('/forecasts/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getForecastHistory(limit = 100): Promise<ApiResponse<ForecastHistoryResponse>> {
    return request<ForecastHistoryResponse>(`/forecasts/history?limit=${limit}`);
  },

  async getForecastTargets(): Promise<ApiResponse<TargetListResponse>> {
    return request<TargetListResponse>('/forecasts/targets');
  },

  async getForecastHorizons(): Promise<ApiResponse<HorizonListResponse>> {
    return request<HorizonListResponse>('/forecasts/horizons');
  },

  // Legacy helper methods
  async getHyperlocalForecast(
    locationId: string,
    horizons: ForecastHorizonDays[] = [7, 14, 21, 30]
  ): Promise<ApiResponse<HyperlocalForecastRecord>> {
    return request<HyperlocalForecastRecord>(
      `/forecasts/hyperlocal?locationId=${encodeURIComponent(locationId)}&horizons=${horizons.join(',')}`
    );
  },

  async getForecastProvenance(forecastId: string): Promise<ApiResponse<DataProvenance>> {
    return request<DataProvenance>(`/forecasts/provenance/${encodeURIComponent(forecastId)}`);
  },
};
