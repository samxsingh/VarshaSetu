import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    // Skip health check logging to keep logs clean in high frequency polling
    if (originalUrl.includes('/health')) return;

    const logLine = `[${new Date().toISOString()}] [${requestId.slice(0, 8)}] ${method} ${originalUrl} ${statusCode} (${duration}ms)`;

    if (statusCode >= 500) {
      console.error(`🔴 ${logLine}`);
    } else if (statusCode >= 400) {
      console.warn(`🟡 ${logLine}`);
    } else {
      console.log(`🟢 ${logLine}`);
    }
  });

  next();
}
