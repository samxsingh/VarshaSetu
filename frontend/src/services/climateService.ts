import { request } from './apiClient';
import { ClimateSignalsObservation, ApiResponse } from '@shared/types';

export const climateService = {
  async getLatestSignals(): Promise<ApiResponse<ClimateSignalsObservation>> {
    return request<ClimateSignalsObservation>('/climate/signals/latest');
  },

  async getHistoricalSignals(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<ClimateSignalsObservation[]>> {
    return request<ClimateSignalsObservation[]>(
      `/climate/signals/history?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );
  },
};
