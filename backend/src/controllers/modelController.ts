import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseEnvelope';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const modelController = {
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const response = await fetch(`${ML_SERVICE_URL}/models/status`);
        if (response.ok) {
          const data = await response.json();
          return sendSuccess(res, data);
        }
      } catch (e) {
        // Fallback to static readiness disclosure if microservice is offline
      }

      return sendSuccess(res, {
        service: 'varshasetu-backend',
        phase: 'PHASE_4A_BASELINE_STAGE',
        operational_status: 'BASELINE_EVALUATION_ACTIVE',
        operational_inference_available: false,
        message: 'Forecast models are in Phase 4A baseline evaluation stage. Operational downscaling pending Phase 4B.',
        active_baselines: [
          'LogisticRegressionBaseline (HEAVY_RAIN 7d, 14d)',
          'LogisticRegressionBaseline (DRY_SPELL 7d, 14d)',
          'RidgeRegressionBaseline (RAINFALL_AMOUNT 7d, 14d)'
        ],
        total_experiments_recorded: 3,
        ml_service_url: ML_SERVICE_URL,
      });
    } catch (error) {
      next(error);
    }
  },

  async listExperiments(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const response = await fetch(`${ML_SERVICE_URL}/models/experiments`);
        if (response.ok) {
          const data = await response.json();
          return sendSuccess(res, data);
        }
      } catch (e) {
        // fallback
      }

      return sendSuccess(res, {
        total: 0,
        experiments: [],
        message: 'ML Service offline or no baseline experiments queried.'
      });
    } catch (error) {
      next(error);
    }
  },

  async getExperimentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const response = await fetch(`${ML_SERVICE_URL}/models/experiments/${id}`);
      if (!response.ok) {
        return sendError(res, 'EXPERIMENT_NOT_FOUND', `Experiment ${id} not found`, 404);
      }
      const data = await response.json();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async triggerBaselineTraining(req: Request, res: Response, next: NextFunction) {
    try {
      const target = (req.query.target as string) || 'ALL';
      const response = await fetch(`${ML_SERVICE_URL}/models/baselines/train?target=${target}`, {
        method: 'POST',
      });
      if (!response.ok) {
        return sendError(res, 'ML_SERVICE_ERROR', 'Failed to trigger baseline training', 502);
      }
      const data = await response.json();
      return sendSuccess(res, data, undefined, 202);
    } catch (error) {
      next(error);
    }
  },
};
