import { request } from './apiClient';
import {
  CropAdvisoryRecord,
  FarmerCropContext,
  WhatIfScenarioRequest,
  WhatIfSimulationResponse,
  ApiResponse,
  ScientificAdvisory,
  AgronomicRule,
  AgronomicCrop,
  ScenarioResult,
} from '@shared/types';

export interface AgronomyStatusResponse {
  status: string;
  phase: string;
  operational_mode: string;
  operational_advisory_allowed: boolean;
  active_dataset: string;
  station_coverage: string;
  total_registered_rules: number;
  total_supported_crops: number;
  total_active_advisories: number;
  safety_gate: {
    status: string;
    evaluated_checks_count: number;
    blocked_imperative_directives: boolean;
  };
  scientific_disclosure: string;
  timestamp: string;
}

export interface ListAdvisoriesResponse {
  total_advisories: number;
  advisories: ScientificAdvisory[];
}

export interface ListRulesResponse {
  total_rules: number;
  rules: AgronomicRule[];
}

export interface ListCropsResponse {
  total_crops: number;
  crops: AgronomicCrop[];
}

export const advisoryService = {
  /**
   * Phase 5A: Agronomic Status & Disclosures
   */
  async getStatus(): Promise<ApiResponse<AgronomyStatusResponse>> {
    return request<AgronomyStatusResponse>('/agronomy/status');
  },

  /**
   * Phase 5A: Controlled Crop Registry
   */
  async listCrops(): Promise<ApiResponse<ListCropsResponse>> {
    return request<ListCropsResponse>('/agronomy/crops');
  },

  /**
   * Phase 5A: Registered Agronomic Rules
   */
  async listRules(filters: {
    target?: string;
    crop?: string;
    stage?: string;
  } = {}): Promise<ApiResponse<ListRulesResponse>> {
    const params = new URLSearchParams();
    if (filters.target) params.append('target', filters.target);
    if (filters.crop) params.append('crop', filters.crop);
    if (filters.stage) params.append('stage', filters.stage);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<ListRulesResponse>(`/agronomy/rules${query}`);
  },

  /**
   * Phase 5A: Scientific Advisories List
   */
  async listScientificAdvisories(filters: {
    block_id?: string;
    crop_type?: string;
    severity?: string;
    limit?: number;
  } = {}): Promise<ApiResponse<ListAdvisoriesResponse>> {
    const params = new URLSearchParams();
    if (filters.block_id) params.append('block_id', filters.block_id);
    if (filters.crop_type) params.append('crop_type', filters.crop_type);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.limit) params.append('limit', String(filters.limit));
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<ListAdvisoriesResponse>(`/agronomy/advisories${query}`);
  },

  /**
   * Phase 5A: Single Scientific Advisory
   */
  async getScientificAdvisoryById(id: string): Promise<ApiResponse<ScientificAdvisory>> {
    return request<ScientificAdvisory>(`/agronomy/advisories/${encodeURIComponent(id)}`);
  },

  /**
   * Phase 5A: Dismiss Advisory
   */
  async dismissAdvisory(id: string): Promise<ApiResponse<{ message: string; advisory: ScientificAdvisory }>> {
    return request<{ message: string; advisory: ScientificAdvisory }>(
      `/agronomy/advisories/${encodeURIComponent(id)}/dismiss`,
      { method: 'POST' }
    );
  },

  /**
   * Phase 5A: What-If Scenario Sensitivity Simulation
   */
  async simulateScenario(payload: {
    block_id?: string;
    crop_type: string;
    growth_stage: string;
    scenario_type: 'SOWING_DELAY' | 'IRRIGATION_INTERVENTION' | 'SEASONAL_ANOMALY';
    parameters: Record<string, any>;
    baseline_forecast_id?: string;
  }): Promise<ApiResponse<ScenarioResult>> {
    return request<ScenarioResult>('/agronomy/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Legacy compatibility helpers
  async evaluateAdvisory(
    locationId: string,
    context: FarmerCropContext
  ): Promise<ApiResponse<CropAdvisoryRecord>> {
    return request<CropAdvisoryRecord>('/advisories/evaluate', {
      method: 'POST',
      body: JSON.stringify({ locationId, context }),
    });
  },

  async simulateWhatIf(
    req: WhatIfScenarioRequest
  ): Promise<ApiResponse<WhatIfSimulationResponse>> {
    return request<WhatIfSimulationResponse>('/simulations/what-if', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },
};
