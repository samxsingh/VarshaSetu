import { Router } from 'express';
import { operationController } from '../controllers/operationController';
import { requireAuth } from '../middleware/authMiddleware';

export const operationRoutes = Router();

operationRoutes.get('/status', requireAuth, operationController.getStatus);
operationRoutes.get('/signals', requireAuth, operationController.getSignals);
operationRoutes.get('/signals/:signalId/context', requireAuth, operationController.getSignalContext);

// Phase 7D: Operational Command Center
operationRoutes.get('/command-center', requireAuth, operationController.getCommandCenter);

// Phase 7C: Operational Inspection & Action Tracking
operationRoutes.post('/actions', requireAuth, operationController.createAction);
operationRoutes.get('/actions', requireAuth, operationController.listActions);
operationRoutes.get('/actions/:actionId', requireAuth, operationController.getActionById);
operationRoutes.post('/actions/:actionId/assign', requireAuth, operationController.assignAction);
operationRoutes.post('/actions/:actionId/start', requireAuth, operationController.startAction);
operationRoutes.post('/actions/:actionId/complete', requireAuth, operationController.completeAction);
operationRoutes.post('/actions/:actionId/cancel', requireAuth, operationController.cancelAction);
