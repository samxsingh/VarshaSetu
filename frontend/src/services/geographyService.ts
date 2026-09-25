import { request } from './apiClient';
import {
  StateEntity,
  DistrictEntity,
  BlockEntity,
  PanchayatEntity,
  VillageEntity,
  ApiResponse,
} from '@shared/types';

export interface ResolvePointResponse {
  matched: boolean;
  boundaryAvailable: boolean;
  isDemoBoundary?: boolean;
  source?: string;
  sourceVersion?: string;
  block?: BlockEntity;
  coordinates: { latitude: number; longitude: number };
  defaultDemoLocation?: {
    state: string;
    district: string;
    block: string;
    latitude: number;
    longitude: number;
  };
}

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

  async getVillages(panchayatId: string): Promise<ApiResponse<VillageEntity[]>> {
    return request<VillageEntity[]>(`/geography/villages?panchayatId=${encodeURIComponent(panchayatId)}`);
  },

  async resolvePoint(lat: number, lon: number): Promise<ApiResponse<ResolvePointResponse>> {
    return request<ResolvePointResponse>(`/geography/resolve-point?lat=${lat}&lon=${lon}`);
  },
};
