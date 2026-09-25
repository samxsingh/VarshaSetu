import { request } from './apiClient';
import { ApiResponse } from '@shared/types';

export interface ModelStatusResponse {
  service: string;
  phase: string;
  operational_status: string;
  operational_inference_available: boolean;
  message: string;
  active_baselines: string[];
  total_experiments_recorded: number;
  latest_experiment?: any;
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

export const modelService = {
  async getStatus(): Promise<ApiResponse<ModelStatusResponse>> {
    return request<ModelStatusResponse>('/models/status');
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
};
