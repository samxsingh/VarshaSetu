import { request } from './apiClient';
import { ApiResponse } from '@shared/types';

export interface ModelRegistryEntry {
  modelId: string;
  name: string;
  target: string;
  version: string;
  algorithm: string;
  status: 'NOT_TRAINED' | 'TRAINING' | 'BENCHMARKED' | 'ACTIVE';
  brierSkillScore?: number;
  crps?: number;
  rocAuc?: number;
}

export const modelService = {
  async getModelRegistry(): Promise<ApiResponse<ModelRegistryEntry[]>> {
    return request<ModelRegistryEntry[]>('/models/registry');
  },
};
