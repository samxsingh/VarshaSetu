import { ApiResponse, ApiErrorResponse, DataMode } from '@shared/types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = localStorage.getItem('varshasetu_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await res.json();

    if (!res.ok || json.success === false) {
      const errRes = json as ApiErrorResponse;
      throw new ApiClientError(
        errRes.error?.code || 'UNKNOWN_ERROR',
        errRes.error?.message || 'An unexpected server error occurred.',
        errRes.error?.details,
        res.status
      );
    }

    return json as ApiResponse<T>;
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    throw new ApiClientError(
      'NETWORK_OR_PARSING_ERROR',
      err instanceof Error ? err.message : 'Network connection failure.'
    );
  }
}
