import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/responseEnvelope';
import { env } from '../config/env';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // Operational domain errors
  if (err instanceof AppError) {
    return sendError(res, err.errorCode, err.message, err.statusCode, err.details);
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && 'body' in err) {
    return sendError(res, 'MALFORMED_JSON', 'Malformed JSON payload provided', 400);
  }

  // PostgreSQL unique violation error (23505)
  if (err.code === '23505') {
    return sendError(
      res,
      'CONFLICT',
      'A record with these unique attributes already exists',
      409,
      { detail: err.detail }
    );
  }

  // PostgreSQL foreign key violation error (23503)
  if (err.code === '23503') {
    return sendError(
      res,
      'FOREIGN_KEY_VIOLATION',
      'Referenced parent entity does not exist',
      400,
      { detail: err.detail }
    );
  }

  // Unhandled internal server error
  console.error('💥 Unhandled Server Exception:', err);

  const isDev = env.NODE_ENV === 'development';
  return sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred on the server',
    500,
    isDev ? { stack: err.stack, originalMessage: err.message } : undefined
  );
}
