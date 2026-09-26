import { Request, Response } from 'express';
import { healthService } from '../services/healthService';
import { sendSuccess } from '../utils/responseEnvelope';

export const healthController = {
  getHealth(_req: Request, res: Response): Response {
    const health = healthService.getAppHealth();
    return sendSuccess(res, health);
  },

  async getDatabaseHealth(_req: Request, res: Response): Promise<Response> {
    const dbHealth = await healthService.getDatabaseHealth();
    const statusCode = dbHealth.postgres ? 200 : 503;
    return sendSuccess(res, dbHealth, undefined, statusCode);
  },

  async getReadiness(_req: Request, res: Response): Promise<Response> {
    const readiness = await healthService.getReadiness();
    const statusCode = readiness.ready ? 200 : 503;
    return sendSuccess(res, readiness, undefined, statusCode);
  },

  getVersion(_req: Request, res: Response): Response {
    const version = healthService.getVersion();
    return sendSuccess(res, version);
  },

  getMetrics(_req: Request, res: Response): Response {
    const metrics = healthService.getMetrics();
    return sendSuccess(res, metrics);
  },
};
