import { request } from './apiClient';
import { ApiResponse } from '@shared/types';

export interface ModelStatusResponse {
  service: string;
  phase: string;
  operational_status: string;
  spatial_resolution_supported?: string;
  supported_blocks?: string[];
  data_availability_status?: string;
  data_availability_notes?: string;
  supported_model_families?: string[];
  available_model_artifacts?: string[];
  total_experiments_recorded: number;
  latest_experiment?: any;
}

export interface ModelBenchmarkItem {
  model_id: string;
  model_name: string;
  model_family: string;
  task_type: string;
  brier_score?: number;
  brier_skill_score?: number;
  log_loss?: number;
  roc_auc?: number;
  f1_score?: number;
  accuracy?: number;
  mae?: number;
  rmse?: number;
  mae_skill_score?: number;
  is_calibrated: boolean;
  has_skill_over_climatology: boolean;
  status: string;
}

export interface BenchmarkComparisonResponse {
  benchmark_report: {
    target_name: string;
    horizon_days: number;
    task_type: string;
    evaluation_period: string;
    test_sample_count: number;
    climatology_reference_val: number;
    models: ModelBenchmarkItem[];
    notes: string[];
  };
  data_availability: {
    status: string;
    has_30_year_climatology: boolean;
    spatial_resolution_level: string;
  };
  downscaling_resolution: {
    target_resolution: string;
    panchayat_data_available: boolean;
    resolution_warning?: string;
  };
}

export interface GlobalImportanceItem {
  feature_name: string;
  mean_abs_shap: number;
  relative_importance_pct: number;
  meteorological_category: string;
}

export interface ModelExplanationsResponse {
  model_id: string;
  target_name: string;
  sample_count_evaluated: number;
  top_driver: string;
  secondary_driver: string;
  teleconnection_importance_pct: number;
  global_importances: GlobalImportanceItem[];
}

export interface DatasetCatalogItem {
  dataset_id: string;
  name: string;
  provider: string;
  spatial_resolution: string;
  temporal_resolution: string;
  qc_passed: boolean;
}

export interface ExperimentRecordItem {
  experiment_id: string;
  model_name: string;
  model_version: string;
  feature_set_version: string;
  target_name: string;
  target_version: string;
  horizon_days: number;
  training_period: string;
  validation_period: string;
  test_period: string;
  geography: string;
  created_at: string;
  metrics: Record<string, any>;
  comparison_to_climatology?: Record<string, any>;
  calibration_status: string;
  dataset_version: string;
  git_commit?: string;
  status: string;
  notes?: string;
}

// ====================================================================
// PHASE 4C — PROBABILISTIC CALIBRATION & RELIABILITY TYPES
// ====================================================================

export interface CalibrationStatusResponse {
  service: string;
  phase: string;
  calibration_status: string;
  operational_calibration_active: boolean;
  message?: string;
  reason?: string;
  active_calibrator_type?: string;
  gate_status?: string;
  diagnostics_available?: boolean;
  engineering_guardrails?: {
    min_calibration_samples: number;
    min_calibration_positive: number;
    min_calibration_negative: number;
    min_calibration_years: number;
    min_test_samples: number;
    note: string;
  };
  supported_methods?: string[];
}

export interface ReliabilityBinItem {
  bin_index: number;
  bin_lower: number;
  bin_upper: number;
  predicted_prob_mean?: number | null;
  mean_predicted_probability?: number | null;
  observed_frequency: number | null;
  sample_count: number;
  calibration_error?: number | null;
  is_empty?: boolean;
}

export interface ReliabilityReportResponse {
  model_id: string;
  target_name: string;
  horizon_days?: number;
  calibration_status?: string;
  expected_calibration_error?: number;
  maximum_calibration_error?: number;
  brier_score?: number;
  brier_skill_score?: number;
  log_loss?: number;
  sample_size?: number;
  bins?: ReliabilityBinItem[];
  brier_decomposition?: {
    brier_score: number;
    reliability: number;
    resolution: number;
    uncertainty: number;
    decomposition_delta?: number;
    is_mathematically_valid?: boolean;
    scientific_notes?: string;
  };
  diagnostic_only?: boolean;
  reliability_diagram?: any;
}

export interface CalibrationComparisonItem {
  model_id: string;
  model_name?: string;
  target_name?: string;
  calibration_method?: string;
  calibration_status?: string;
  raw_brier?: number;
  raw_brier_score?: number;
  calibrated_brier?: number | null;
  calibrated_platt_brier_score?: number | null;
  calibrated_isotonic_brier_score?: number | null;
  raw_log_loss?: number;
  calibrated_log_loss?: number | null;
  raw_ece?: number;
  calibrated_ece?: number | null;
  raw_mce?: number;
  calibrated_mce?: number | null;
  raw_roc_auc?: number | null;
  calibrated_roc_auc?: number | null;
  sample_count?: number;
  bss_status?: string;
  bss_vs_climatology?: number | null;
  raw_brier_skill_score?: number | null;
  best_calibrator?: string;
  operational_status?: string;
  note?: string;
}

export interface CalibrationComparisonResponse {
  target_name?: string;
  horizon_days?: number;
  gate_status?: string;
  data_gate?: {
    status: string;
    operational_calibration_allowed?: boolean;
    scientific_notes?: string;
    reason?: string;
  };
  comparison: CalibrationComparisonItem[];
  uncertainty_reports?: Record<string, any>;
}

export const modelService = {
  async getStatus(): Promise<ApiResponse<ModelStatusResponse>> {
    return request<ModelStatusResponse>('/models/status');
  },

  async getRegistry(): Promise<ApiResponse<{ total_models: number; models: any[] }>> {
    return request<{ total_models: number; models: any[] }>('/models/registry');
  },

  async getComparison(target = 'HEAVY_RAIN', horizon_days = 7): Promise<ApiResponse<BenchmarkComparisonResponse>> {
    return request<BenchmarkComparisonResponse>(`/models/comparison?target=${target}&horizon_days=${horizon_days}`);
  },

  async getDatasetsCatalog(): Promise<ApiResponse<{ status: string; total_datasets: number; catalog: DatasetCatalogItem[] }>> {
    return request<{ status: string; total_datasets: number; catalog: DatasetCatalogItem[] }>('/models/datasets');
  },

  async getModelExplanations(modelId: string): Promise<ApiResponse<ModelExplanationsResponse>> {
    return request<ModelExplanationsResponse>(`/models/${modelId}/explanations`);
  },

  async trainTreeModel(target_name = 'HEAVY_RAIN', horizon_days = 7, block_id = 'UP_LKO_BKT'): Promise<ApiResponse<any>> {
    return request<any>('/models/train', {
      method: 'POST',
      body: JSON.stringify({ target_name, horizon_days, block_id }),
    });
  },

  async getExperiments(): Promise<ApiResponse<{ total: number; experiments: ExperimentRecordItem[] }>> {
    return request<{ total: number; experiments: ExperimentRecordItem[] }>('/models/experiments');
  },

  async getExperimentById(id: string): Promise<ApiResponse<ExperimentRecordItem>> {
    return request<ExperimentRecordItem>(`/models/experiments/${id}`);
  },

  async trainBaselines(target = 'ALL'): Promise<ApiResponse<any>> {
    return request<any>(`/models/baselines/train?target=${target}`, {
      method: 'POST',
    });
  },

  // Phase 4C Probabilistic Calibration endpoints
  async getCalibrationStatus(): Promise<ApiResponse<CalibrationStatusResponse>> {
    return request<CalibrationStatusResponse>('/models/calibration/status');
  },

  async getCalibrationComparison(target = 'HEAVY_RAIN', horizon_days = 7, method = 'PLATT'): Promise<ApiResponse<CalibrationComparisonResponse>> {
    return request<CalibrationComparisonResponse>(
      `/models/calibration/comparison?target=${target}&horizon_days=${horizon_days}&method=${method}`
    );
  },

  async getCalibrationModelReliability(modelId = 'xgboost'): Promise<ApiResponse<ReliabilityReportResponse>> {
    return request<ReliabilityReportResponse>(`/models/calibration/${modelId}/reliability`);
  },

  async runCalibration(target_name = 'HEAVY_RAIN', horizon_days = 7, calibration_method = 'PLATT', block_id = 'UP_LKO_BKT'): Promise<ApiResponse<any>> {
    return request<any>('/models/calibration/run', {
      method: 'POST',
      body: JSON.stringify({ target_name, horizon_days, calibration_method, block_id }),
    });
  },
};
