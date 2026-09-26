import { Router } from 'express';
import { operationController } from '../controllers/operationController';
import { requireAuth } from '../middleware/authMiddleware';

export const operationRoutes = Router();

operationRoutes.get('/status', requireAuth, operationController.getStatus);
operationRoutes.get('/signals', requireAuth, operationController.getSignals);
operationRoutes.get('/signals/:signalId/context', requireAuth, operationController.getSignalContext);
