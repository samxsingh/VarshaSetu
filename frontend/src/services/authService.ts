import { request } from './apiClient';
import { UserEntity, ApiResponse } from '@shared/types';

export const authService = {
  async getMe(): Promise<ApiResponse<UserEntity>> {
    return request<UserEntity>('/auth/me');
  },

  async login(phoneNumber: string, otp?: string): Promise<ApiResponse<{ token: string; user: UserEntity }>> {
    return request<{ token: string; user: UserEntity }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
  },

  logout(): void {
    localStorage.removeItem('varshasetu_token');
  },
};
