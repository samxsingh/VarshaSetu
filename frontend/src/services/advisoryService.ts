import { request } from './apiClient';
import {
  CropAdvisoryRecord,
  FarmerCropContext,
  WhatIfScenarioRequest,
  WhatIfSimulationResponse,
  ApiResponse,
} from '@shared/types';

export const advisoryService = {
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
