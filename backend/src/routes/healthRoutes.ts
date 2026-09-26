import { Router } from 'express';
import { healthController } from '../controllers/healthController';
import { asyncHandler } from '../utils/asyncHandler';

export const healthRoutes = Router();

healthRoutes.get('/', healthController.getHealth);
healthRoutes.get('/ready', asyncHandler(healthController.getReadiness as any));
healthRoutes.get('/version', healthController.getVersion);
healthRoutes.get('/metrics', healthController.getMetrics);
healthRoutes.get('/database', asyncHandler(healthController.getDatabaseHealth as any));
