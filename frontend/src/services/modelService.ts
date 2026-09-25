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

  // ====================================================================
  // Phase 4D Multi-Year Validation & Hindcasting Endpoints
  // ====================================================================

  async getHindcastStatus(): Promise<ApiResponse<HindcastStatusResponse>> {
    return request<HindcastStatusResponse>('/models/hindcasting/status');
  },

  async getHindcastGate(): Promise<ApiResponse<HindcastGateResponse>> {
    return request<HindcastGateResponse>('/models/hindcasting/gate');
  },

  async getHindcastFolds(): Promise<ApiResponse<HindcastFoldsResponse>> {
    return request<HindcastFoldsResponse>('/models/hindcasting/folds');
  },

  async getHindcastResults(target = 'HEAVY_RAIN', horizon_days = 7): Promise<ApiResponse<HindcastResultsResponse>> {
    return request<HindcastResultsResponse>(`/models/hindcasting/results?target=${target}&horizon_days=${horizon_days}`);
  },

  async getHindcastStability(target = 'HEAVY_RAIN', horizon_days = 7, model_id = 'xgboost'): Promise<ApiResponse<HindcastStabilityResponse>> {
    return request<HindcastStabilityResponse>(
      `/models/hindcasting/stability?target=${target}&horizon_days=${horizon_days}&model_id=${model_id}`
    );
  },

  async getHindcastDrift(): Promise<ApiResponse<HindcastDriftResponse>> {
    return request<HindcastDriftResponse>('/models/hindcasting/drift');
  },

  async getHindcastCoverage(): Promise<ApiResponse<HindcastCoverageResponse>> {
    return request<HindcastCoverageResponse>('/models/hindcasting/coverage');
  },

  async runHindcast(payload: { target_name?: string; horizon_days?: number; block_id?: string; models?: string[] } = {}): Promise<ApiResponse<any>> {
    return request<any>('/models/hindcasting/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ====================================================================
// Phase 4D Hindcasting Type Definitions
// ====================================================================

export interface HindcastStatusResponse {
  service?: string;
  phase: string;
  operational_validation_allowed: boolean;
  multiyear_gate_status: string;
  total_experiments_recorded?: number;
  years_available?: number[];
  complete_seasons?: number[];
  data_reality?: {
    available_years?: number[];
    required_years?: number;
  };
  message?: string;
  scientific_disclosure: string;
}

export interface HindcastGateReport {
  status: string;
  years_available: number[];
  total_years: number;
  complete_seasons: number[];
  eligible_years: number[];
  excluded_years: number[];
  exclusion_reasons: string[];
  schema_consistent: boolean;
  fingerprint_consistent: boolean;
  operational_validation_allowed: boolean;
  scientific_notes: string;
}

export interface HindcastGateResponse {
  gate_report: HindcastGateReport;
}

export interface HindcastFoldItem {
  fold_id: string;
  train_start: string;
  train_end: string;
  validation_start: string;
  validation_end: string;
  test_start: string;
  test_end: string;
  test_year: number;
  training_rows: number;
  validation_rows: number;
  test_rows: number;
  training_years: number[];
  feature_cutoff: string;
  dataset_fingerprint: string;
  notes?: string;
}

export interface HindcastFoldsResponse {
  total_folds: number;
  folds: HindcastFoldItem[];
}

export interface ModelHindcastResultItem {
  model_id: string;
  model_name: string;
  metrics: {
    brier_score?: number | null;
    brier_skill_score?: number | null;
    log_loss?: number | null;
    roc_auc?: number | null;
    pr_auc?: number | null;
    expected_calibration_error?: number | null;
    mae?: number | null;
    rmse?: number | null;
    mean_skill_score?: number | null;
    sample_count?: number;
    test_positive_count?: number;
    test_negative_count?: number;
    notes?: string;
  };
  calibration_status: string;
  data_status: string;
}

export interface HorizonReportItem {
  horizon_days: number;
  target_name: string;
  best_model_id: string;
  climatology_brier: number;
  models: Record<string, any>;
  data_gate_passed: boolean;
  notes: string;
}

export interface HindcastExperimentResult {
  experiment_id: string;
  target_name: string;
  horizon_days: number;
  models_evaluated: string[];
  spatial_resolution: string;
  multi_year_gate_status?: string;
  multiyear_gate_status?: string;
  operational_validation_allowed: boolean;
  model_results: ModelHindcastResultItem[];
  horizon_reports: HorizonReportItem[];
  warnings: string[];
  dataset_fingerprint?: string;
}

export interface HindcastResultsResponse {
  experiment: HindcastExperimentResult;
}

export interface YearlyStabilityReportItem {
  year: number;
  metric_name: string;
  value: number;
  sample_size: number;
  degraded_flag: boolean;
}

export interface StabilityDistributionStats {
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  iqr?: number;
}

export interface HindcastStabilityData {
  target_name: string;
  horizon_days: number;
  model_id: string;
  years_evaluated: number[];
  total_years: number;
  stability_status: string;
  notes: string;
  distribution_stats?: Record<string, StabilityDistributionStats>;
  yearly_reports?: YearlyStabilityReportItem[];
  degraded_years?: number[];
  insufficient_seasons_flag?: boolean;
}

export interface HindcastStabilityResponse {
  stability: HindcastStabilityData;
}

export interface DriftMetricItem {
  feature_name: string;
  psi: number;
  ks_statistic: number;
  ks_p_value: number;
  is_drifted: boolean;
  drift_severity: 'NEGLIGIBLE' | 'MODERATE' | 'SIGNIFICANT';
  early_mean?: number;
  late_mean?: number;
}

export interface HindcastDriftData {
  status: string;
  reference_period: string;
  comparison_period: string;
  total_features_evaluated: number;
  features_with_shift: string[];
  drift_results: DriftMetricItem[];
  scientific_notes: string;
}

export interface HindcastDriftResponse {
  drift_report: HindcastDriftData;
}

export interface FeatureCoverageItem {
  feature_name: string;
  source: string;
  first_date: string;
  last_date: string;
  total_days: number;
  missing_days: number;
  missing_pct: number;
  data_quality: string;
}

export interface HindcastCoverageData {
  total_features: number;
  features_full_coverage: number;
  features_partial_coverage: number;
  temporal_span: string;
  coverage_items: FeatureCoverageItem[];
  scientific_notes: string;
}

export interface HindcastCoverageResponse {
  coverage_report: HindcastCoverageData;
}
