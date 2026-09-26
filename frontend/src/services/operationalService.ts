import { apiClient } from './apiClient';
import { ApiResponse } from '@shared/types';

export type OperationalSignalType =
  | 'EVENT'
  | 'FORECAST_CHANGE'
  | 'ADVISORY'
  | 'DATA_QUALITY'
  | 'MODEL_STATUS'
  | 'OPERATIONAL_GATE';

export type SignalSeverity = 'CRITICAL' | 'WARNING' | 'WATCH' | 'INFO';

export interface SignalSourceReference {
  id: string;
  type: string;
  label: string;
}

export interface OperationalSignalDTO {
  signalId: string;
  signalType: OperationalSignalType;
  title: string;
  summary: string;
  severity: SignalSeverity;
  blockId: string;
  detectedAt: string;
  validFrom: string;
  validUntil: string;
  probability: number | null;
  confidenceStatus: string;
  operationalStatus: string;
  dataFreshness: string;
  validationStatus: string;
  sourceReferences: SignalSourceReference[];
  recommendedInspection?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface GetSignalsQuery {
  blockId?: string;
  severity?: SignalSeverity;
  signalType?: OperationalSignalType;
  operationalStatus?: string;
  limit?: number;
  cursor?: string;
}

export interface SystemOperationalStatusResponse {
  forecast_service_status: string;
  model_registry_status: string;
  data_freshness_status: string;
  calibration_status: string;
  validation_status: string;
  event_engine_status: string;
  delivery_status: string;
  database_status: string;
  active_dataset: string;
  spatial_extent: string;
  scientific_disclosures: string[];
  timestamp: string;
}

export const operationalService = {
  /**
   * Retrieves active operational intelligence signals
   */
  async getSignals(params?: GetSignalsQuery): Promise<ApiResponse<{ items: OperationalSignalDTO[]; total: number }>> {
    return apiClient.get<{ items: OperationalSignalDTO[]; total: number }>('/operations/signals', {
      params,
    });
  },

  /**
   * Retrieves operational system status
   */
  async getStatus(): Promise<ApiResponse<SystemOperationalStatusResponse>> {
    return apiClient.get<SystemOperationalStatusResponse>('/operations/status');
  },
};

