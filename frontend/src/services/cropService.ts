import { request } from './apiClient';
import { CropType, CropGrowthStage, ApiResponse } from '@shared/types';

export interface CropInfo {
  type: CropType;
  commonNameEn: string;
  commonNameHi: string;
  recommendedStages: CropGrowthStage[];
}

export const cropService = {
  async getSupportedCrops(): Promise<ApiResponse<CropInfo[]>> {
    return request<CropInfo[]>('/crops');
  },
};
