import { Request, Response, NextFunction } from 'express';
import { dataSourceRepository } from '../repositories/dataSourceRepository';
import { dataIngestionRepository } from '../repositories/dataIngestionRepository';
import { sendSuccess, sendError } from '../utils/responseEnvelope';

export const dataHealthController = {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await dataIngestionRepository.getOverview();
      return sendSuccess(res, overview);
    } catch (error) {
      next(error);
    }
  },

  async listSources(req: Request, res: Response, next: NextFunction) {
    try {
      const sources = await dataSourceRepository.listAll();
      return sendSuccess(res, sources);
    } catch (error) {
      next(error);
    }
  },

  async listRuns(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string || '20', 10), 100);
      const offset = parseInt(req.query.offset as string || '0', 10);
      const status = req.query.status as string | undefined;

      const result = await dataIngestionRepository.listRuns(limit, offset, status);
      return sendSuccess(res, {
        runs: result.runs,
        pagination: {
          total: result.total,
          limit,
          offset,
          hasMore: offset + result.runs.length < result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getRunById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await dataIngestionRepository.getRunById(id);
      if (!result) {
        return sendError(res, 'INGESTION_RUN_NOT_FOUND', `Ingestion run ${id} not found`, 404);
      }
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async triggerIngestion(req: Request, res: Response, next: NextFunction) {
    try {
      const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      try {
        const response = await fetch(`${mlServiceUrl}/ingestion/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body || {}),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          const errText = await response.text();
          return sendError(res, 'ML_SERVICE_ERROR', `ML Service returned ${response.status}: ${errText}`, 502);
        }

        const data = await response.json();
        return sendSuccess(res, data, undefined, 202);
      } catch (fetchErr: any) {
        clearTimeout(timeout);
        return sendError(res, 'ML_SERVICE_UNAVAILABLE', `Could not reach ML ingestion service at ${mlServiceUrl}: ${fetchErr.message}`, 503);
      }
    } catch (error) {
      next(error);
    }
  },
};
