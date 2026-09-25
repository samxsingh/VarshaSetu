import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorMiddleware';
import { apiRouter } from './routes';
import { sendError } from './utils/responseEnvelope';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers
  app.use(helmet());

  // 2. CORS configuration
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // 3. Body Parsers with safe payload limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Structured Request Logging
  app.use(requestLogger);

  // 5. Mount API version 1
  app.use('/api/v1', apiRouter);

  // 6. 404 Catch-All Handler for API
  app.use('/api', (req: Request, res: Response) => {
    return sendError(
      res,
      'ROUTE_NOT_FOUND',
      `Cannot ${req.method} ${req.originalUrl}. Please check /api/v1/ endpoints.`,
      404
    );
  });

  // 7. Central Error Handling Middleware
  app.use(errorHandler);

  return app;
}

export const app = createApp();
