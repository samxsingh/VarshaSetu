import { request } from './apiClient';
import { UserEntity, ApiResponse } from '@shared/types';

export interface LoginPayload {
  phoneNumber?: string;
  email?: string;
  password?: string;
  otp?: string;
}

export interface RegisterPayload {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  password: string;
  role?: string;
  preferredLanguage?: string;
  assignedLocationId?: string;
}

export const authService = {
  async getMe(): Promise<ApiResponse<UserEntity>> {
    return request<UserEntity>('/auth/me');
  },

  async login(payload: LoginPayload): Promise<ApiResponse<{ token: string; user: UserEntity }>> {
    const res = await request<{ token: string; user: UserEntity }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.data?.token) {
      localStorage.setItem('varshasetu_token', res.data.token);
    }
    return res;
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<{ token: string; user: UserEntity }>> {
    const res = await request<{ token: string; user: UserEntity }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.data?.token) {
      localStorage.setItem('varshasetu_token', res.data.token);
    }
    return res;
  },

  logout(): void {
    localStorage.removeItem('varshasetu_token');
  },

  getToken(): string | null {
    return localStorage.getItem('varshasetu_token');
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('varshasetu_token'));
  },
};
