import { request } from './apiClient';
import {
  StateEntity,
  DistrictEntity,
  BlockEntity,
  PanchayatEntity,
  ApiResponse,
} from '@shared/types';

export const geographyService = {
  async getStates(): Promise<ApiResponse<StateEntity[]>> {
    return request<StateEntity[]>('/geography/states');
  },

  async getDistricts(stateId: string): Promise<ApiResponse<DistrictEntity[]>> {
    return request<DistrictEntity[]>(`/geography/districts?stateId=${encodeURIComponent(stateId)}`);
  },

  async getBlocks(districtId: string): Promise<ApiResponse<BlockEntity[]>> {
    return request<BlockEntity[]>(`/geography/blocks?districtId=${encodeURIComponent(districtId)}`);
  },

  async getPanchayats(blockId: string): Promise<ApiResponse<PanchayatEntity[]>> {
    return request<PanchayatEntity[]>(`/geography/panchayats?blockId=${encodeURIComponent(blockId)}`);
  },

  async resolvePoint(lat: number, lon: number): Promise<ApiResponse<PanchayatEntity>> {
    return request<PanchayatEntity>(`/geography/resolve-point?lat=${lat}&lon=${lon}`);
  },
};
