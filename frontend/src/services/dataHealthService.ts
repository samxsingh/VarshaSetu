import { request } from './apiClient';
import { ApiResponse } from '@shared/types';

export interface DataHealthOverview {
  totalSources: number;
  activeSources: number;
  freshSources: number;
  staleSources: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastSyncTime: string | null;
  overallHealth: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'NO_DATA';
}

export interface DataSourceItem {
  id: string;
  name: string;
  provider: string;
  type: string;
  base_url?: string;
  status: string;
  provenance_url?: string;
  update_frequency?: string;
  last_successful_sync?: string | null;
}

export interface DataIngestionRunItem {
  id: string;
  source_id?: string | null;
  source_name: string;
  provider: string;
  dataset_name: string;
  variable: string;
  started_at: string;
  completed_at?: string | null;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
  records_processed: number;
  records_failed: number;
  quality_summary: any;
  file_path?: string | null;
  error_message?: string | null;
}

export interface DataQualityReportItem {
  id: string;
  run_id: string;
  dataset_name: string;
  total_records: number;
  valid_records: number;
  missing_records: number;
  outlier_records: number;
  quality_score: number;
  quality_flag: 'GOOD' | 'WARNING' | 'BAD' | 'MISSING' | 'IMPUTED';
  details: any;
  created_at: string;
}

export interface IngestionRunDetails {
  run: DataIngestionRunItem;
  qualityReports: DataQualityReportItem[];
}

export const dataHealthService = {
  async getOverview(): Promise<ApiResponse<DataHealthOverview>> {
    return request<DataHealthOverview>('/data-health');
  },

  async getSources(): Promise<ApiResponse<DataSourceItem[]>> {
    return request<DataSourceItem[]>('/data-health/sources');
  },

  async getRuns(limit = 20, offset = 0, status?: string): Promise<ApiResponse<{ runs: DataIngestionRunItem[]; pagination: any }>> {
    const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (status) query.append('status', status);
    return request<{ runs: DataIngestionRunItem[]; pagination: any }>(`/data-health/runs?${query.toString()}`);
  },

  async getRunDetails(id: string): Promise<ApiResponse<IngestionRunDetails>> {
    return request<IngestionRunDetails>(`/data-health/runs/${id}`);
  },

  async triggerIngestion(datasetName = 'all'): Promise<ApiResponse<any>> {
    return request<any>('/data-health/trigger', {
      method: 'POST',
      body: JSON.stringify({ dataset_name: datasetName }),
    });
  },
};
