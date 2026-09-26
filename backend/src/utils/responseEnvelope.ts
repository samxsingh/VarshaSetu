import { Response } from 'express';

export interface StandardSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface StandardErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(res: Response, data: T, meta?: Record<string, unknown>, statusCode = 200): Response {
  const requestId = (res.getHeader('X-Request-Id') as string) || (res.req?.headers['x-request-id'] as string) || undefined;
  const payload: StandardSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      ...(requestId ? { requestId } : {}),
      timestamp: new Date().toISOString(),
      ...(meta || {}),
    },
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  details?: Record<string, unknown>
): Response {
  const requestId = (res.getHeader('X-Request-Id') as string) || (res.req?.headers['x-request-id'] as string) || undefined;
  const payload: StandardErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    meta: {
      ...(requestId ? { requestId } : {}),
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(payload);
}
