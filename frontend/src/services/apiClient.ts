import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiErrorResponse } from '@shared/types';
import { env } from '../config/env';

export const API_BASE_URL = env.API_BASE_URL;

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiClientError';
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

// Single-flight refresh token queue state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Safe storage accessor for SSR and headless test environments
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

// Create authoritative Axios instance
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach X-Request-Id and Bearer token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Generate unique request ID if not provided
    if (!config.headers.get('X-Request-Id')) {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      config.headers.set('X-Request-Id', requestId);
    }

    // 2. Attach Authorization Bearer token from localStorage
    const storage = getSafeStorage();
    const token = storage?.getItem('varshasetu_token');
    if (token && !config.headers.get('Authorization')) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle token refresh queue & envelope parsing
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return backend JSON envelope directly
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Detect if this is an auth failure that can be refreshed
    const is401 = error.response?.status === 401;
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/register');

    if (is401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Queue this request until current refresh flight finishes
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.set('Authorization', `Bearer ${token}`);
              resolve(axiosInstance(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storage = getSafeStorage();
      const refreshToken = storage?.getItem('varshasetu_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(new Error('No refresh token available'), null);
        storage?.removeItem('varshasetu_token');
        storage?.removeItem('varshasetu_refresh_token');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('varshasetu:unauthorized'));
        }
        return Promise.reject(createApiClientError(error));
      }

      try {
        // Direct call to refresh endpoint
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const data = refreshResponse.data?.data;
        const newAccessToken = data?.token;
        const newRefreshToken = data?.refreshToken;

        if (newAccessToken) {
          storage?.setItem('varshasetu_token', newAccessToken);
          if (newRefreshToken) {
            storage?.setItem('varshasetu_refresh_token', newRefreshToken);
          }

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('varshasetu:token-refreshed', {
                detail: { token: newAccessToken, user: data?.user },
              })
            );
          }

          processQueue(null, newAccessToken);
          originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Refresh response did not contain new access token');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        storage?.removeItem('varshasetu_token');
        storage?.removeItem('varshasetu_refresh_token');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('varshasetu:unauthorized'));
        }
        return Promise.reject(createApiClientError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(createApiClientError(error));
  }
);

/**
 * Normalizes any error (AxiosError, NetworkError, etc.) into a consistent ApiClientError.
 */
function createApiClientError(err: any): ApiClientError {
  if (err instanceof ApiClientError) {
    return err;
  }

  if (err?.response) {
    const errorData = err.response.data as ApiErrorResponse | undefined;
    const code = errorData?.error?.code || `HTTP_${err.response.status}`;
    const message = errorData?.error?.message || err.message || 'Server returned an error response';
    const details = errorData?.error?.details;
    return new ApiClientError(code, message, details, err.response.status);
  }

  if (err?.request) {
    return new ApiClientError(
      'NETWORK_CONNECTION_ERROR',
      'Unable to connect to the VarshaSetu API gateway. Please check network connectivity.',
      undefined,
      0
    );
  }

  return new ApiClientError(
    'UNKNOWN_CLIENT_ERROR',
    err?.message || 'An unexpected client-side error occurred.'
  );
}

/**
 * Universal backwards-compatible request helper wrapping axiosInstance.
 * Supports both RequestInit options and AxiosRequestConfig.
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit | AxiosRequestConfig = {}
): Promise<ApiResponse<T>> {
  // Normalize method
  const method = ((options as RequestInit).method || (options as AxiosRequestConfig).method || 'GET').toUpperCase();

  // Normalize body/data
  let data: any = undefined;
  if ('body' in options && options.body) {
    if (typeof options.body === 'string') {
      try {
        data = JSON.parse(options.body);
      } catch {
        data = options.body;
      }
    } else {
      data = options.body;
    }
  } else if ('data' in options) {
    data = (options as AxiosRequestConfig).data;
  }

  // Normalize headers
  const headers: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((val, key) => {
        headers[key] = val;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([k, v]) => {
        headers[k] = v;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  const response = await axiosInstance.request<ApiResponse<T>>({
    url: endpoint,
    method,
    headers,
    data,
  });

  return response.data;
}

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<ApiResponse<T>>(url, config).then((r) => r.data),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.post<ApiResponse<T>>(url, data, config).then((r) => r.data),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.put<ApiResponse<T>>(url, data, config).then((r) => r.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<ApiResponse<T>>(url, config).then((r) => r.data),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.patch<ApiResponse<T>>(url, data, config).then((r) => r.data),
  instance: axiosInstance,
};
