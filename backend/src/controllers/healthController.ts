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
};
