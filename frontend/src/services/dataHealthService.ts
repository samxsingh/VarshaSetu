import { request } from './apiClient';
import { ApiResponse, FreshnessStatus } from '@shared/types';

export interface DataFeedStatus {
  sourceId: string;
  sourceName: string;
  status: FreshnessStatus;
  lastSuccessfulUpdate: string;
  expectedFrequencyHours: number;
}

export const dataHealthService = {
  async getPipelineStatus(): Promise<ApiResponse<DataFeedStatus[]>> {
    return request<DataFeedStatus[]>('/data-health/status');
  },
};
