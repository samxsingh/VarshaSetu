import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseEnvelope';
import { env } from '../config/env';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface ClientBucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'Too many requests. Please try again later.' } = options;
  const store = new Map<string, ClientBucket>();

  // Cleanup expired entries periodically
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store.entries()) {
      if (now > bucket.resetAt) {
        store.delete(key);
      }
    }
  }, Math.max(windowMs, 10000));
  cleanupTimer.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    // If rate limiting is disabled via env or in test environment (unless test requests rate limit test), skip
    if (!env.RATE_LIMIT_ENABLED && env.NODE_ENV !== 'production') {
      return next();
    }

    const clientKey = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || 'client';
    const now = Date.now();
    const bucket = store.get(clientKey);

    if (!bucket || now > bucket.resetAt) {
      store.set(clientKey, { count: 1, resetAt: now + windowMs });
      res.setHeader('RateLimit-Limit', maxRequests);
      res.setHeader('RateLimit-Remaining', maxRequests - 1);
      res.setHeader('RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      return next();
    }

    if (bucket.count >= maxRequests) {
      res.setHeader('RateLimit-Limit', maxRequests);
      res.setHeader('RateLimit-Remaining', 0);
      res.setHeader('RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));
      sendError(res, 'RATE_LIMIT_EXCEEDED', message, 429, {
        retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
      });
      return;
    }

    bucket.count += 1;
    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', Math.max(0, maxRequests - bucket.count));
    res.setHeader('RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));
    return next();
  };
}

// Pre-configured rate limiters for sensitive endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Authentication rate limit reached. Please wait before retrying.',
});

export const simulationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Scenario simulation rate limit reached. Please wait a moment.',
});

export const voiceRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Voice synthesis rate limit reached. Please wait a moment.',
});
