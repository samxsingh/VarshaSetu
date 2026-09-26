import { env } from '../../config/env';

export class GatewayError extends Error {
  public readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'GatewayError';
    this.code = code;
  }
}

export class GatewayTimeoutError extends GatewayError {
  public readonly timeoutMs: number;
  constructor(endpoint: string, timeoutMs: number) {
    super(`ML gateway request to ${endpoint} timed out after ${timeoutMs}ms`, 'GATEWAY_TIMEOUT');
    this.name = 'GatewayTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class GatewayUnavailableError extends GatewayError {
  public readonly endpoint: string;
  constructor(endpoint: string, cause?: string) {
    super(`ML gateway service unavailable at ${endpoint}${cause ? `: ${cause}` : ''}`, 'GATEWAY_UNAVAILABLE');
    this.name = 'GatewayUnavailableError';
    this.endpoint = endpoint;
  }
}

export class GatewayResponseError extends GatewayError {
  public readonly statusCode: number;
  public readonly responseBody: any;
  constructor(endpoint: string, statusCode: number, responseBody: any) {
    super(`ML gateway returned HTTP ${statusCode} from ${endpoint}`, 'GATEWAY_HTTP_ERROR');
    this.name = 'GatewayResponseError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

export interface GatewayClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
}

export class MLGatewayClient {
  private readonly baseUrl: string;
  private readonly defaultTimeoutMs: number;

  constructor(options: GatewayClientOptions = {}) {
    this.baseUrl = options.baseUrl || env.ML_SERVICE_URL || 'http://localhost:8000';
    this.defaultTimeoutMs = options.timeoutMs || 5000;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async get<T>(path: string, options: { query?: Record<string, string | number | boolean | undefined>; timeoutMs?: number } = {}): Promise<T> {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, this.baseUrl);
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.toString(), {
      method: 'GET',
      timeoutMs: options.timeoutMs,
    });
  }

  public async post<T>(path: string, body?: any, options: { timeoutMs?: number } = {}): Promise<T> {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, this.baseUrl);
    return this.request<T>(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      timeoutMs: options.timeoutMs,
    });
  }

  private async request<T>(fullUrl: string, init: RequestInit & { timeoutMs?: number }): Promise<T> {
    const timeoutMs = init.timeoutMs || this.defaultTimeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(fullUrl, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        throw new GatewayResponseError(fullUrl, response.status, errorData);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }
      return (await response.text()) as unknown as T;
    } catch (err: any) {
      if (err instanceof GatewayResponseError) {
        throw err;
      }
      if (err.name === 'AbortError' || err.code === 'ABORT_ERR') {
        throw new GatewayTimeoutError(fullUrl, timeoutMs);
      }
      throw new GatewayUnavailableError(fullUrl, err.message || 'Connection refused / network failure');
    } finally {
      clearTimeout(timer);
    }
  }
}

export const mlGatewayClient = new MLGatewayClient();
