import { request } from './apiClient';
import { UserEntity, ApiResponse, UserRole } from '@shared/types';

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
  role?: UserRole | string;
  preferredLanguage?: string;
  assignedLocationId?: string;
}

export interface AuthSuccessData {
  token: string;
  refreshToken?: string;
  user: UserEntity;
}

const getSafeStorage = (): Storage | null => {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Fallback if localStorage is inaccessible
  }
  return null;
};

export const authService = {
  async getMe(): Promise<ApiResponse<UserEntity>> {
    return request<UserEntity>('/auth/me');
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthSuccessData>> {
    const res = await request<AuthSuccessData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.data?.token) {
      const storage = getSafeStorage();
      storage?.setItem('varshasetu_token', res.data.token);
      if (res.data.refreshToken) {
        storage?.setItem('varshasetu_refresh_token', res.data.refreshToken);
      }
    }
    return res;
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<AuthSuccessData>> {
    const res = await request<AuthSuccessData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.data?.token) {
      const storage = getSafeStorage();
      storage?.setItem('varshasetu_token', res.data.token);
      if (res.data.refreshToken) {
        storage?.setItem('varshasetu_refresh_token', res.data.refreshToken);
      }
    }
    return res;
  },

  async refresh(refreshToken?: string): Promise<ApiResponse<AuthSuccessData>> {
    const storage = getSafeStorage();
    const tokenToUse = refreshToken || storage?.getItem('varshasetu_refresh_token') || '';
    const res = await request<AuthSuccessData>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokenToUse }),
    });
    if (res.data?.token) {
      storage?.setItem('varshasetu_token', res.data.token);
      if (res.data.refreshToken) {
        storage?.setItem('varshasetu_refresh_token', res.data.refreshToken);
      }
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request<{ message: string }>('/auth/logout', { method: 'POST' });
    } catch {
      // Best-effort logout: server session may already be dead
    } finally {
      const storage = getSafeStorage();
      storage?.removeItem('varshasetu_token');
      storage?.removeItem('varshasetu_refresh_token');
    }
  },

  getToken(): string | null {
    return getSafeStorage()?.getItem('varshasetu_token') || null;
  },

  getRefreshToken(): string | null {
    return getSafeStorage()?.getItem('varshasetu_refresh_token') || null;
  },

  isAuthenticated(): boolean {
    return Boolean(getSafeStorage()?.getItem('varshasetu_token'));
  },

  clearTokens(): void {
    const storage = getSafeStorage();
    storage?.removeItem('varshasetu_token');
    storage?.removeItem('varshasetu_refresh_token');
  },
};
