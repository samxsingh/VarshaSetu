import { request } from './apiClient';
import {
  HyperlocalForecastRecord,
  ForecastHorizonDays,
  DataProvenance,
  ApiResponse,
} from '@shared/types';

export const forecastService = {
  async getHyperlocalForecast(
    locationId: string,
    horizons: ForecastHorizonDays[] = [7, 14, 21, 30]
  ): Promise<ApiResponse<HyperlocalForecastRecord>> {
    return request<HyperlocalForecastRecord>(
      `/forecasts/hyperlocal?locationId=${encodeURIComponent(locationId)}&horizons=${horizons.join(',')}`
    );
  },

  async getForecastProvenance(forecastId: string): Promise<ApiResponse<DataProvenance>> {
    return request<DataProvenance>(`/forecasts/provenance/${encodeURIComponent(forecastId)}`);
  },
};
