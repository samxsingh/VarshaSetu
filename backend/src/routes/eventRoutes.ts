import { Router } from 'express';
import { eventController } from '../controllers/eventController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

export const eventRoutes = Router();

// Event detection (Admin, Officer, Analyst)
eventRoutes.post(
  '/detect',
  requireAuth,
  requireRole(['ADMIN', 'OFFICER', 'ANALYST']),
  eventController.detectEvents
);

// List events (All authenticated users; farmers restricted to permitted block)
eventRoutes.get('/', requireAuth, eventController.listEvents);

// Event history & details
eventRoutes.get('/:id/history', requireAuth, eventController.getEventHistory);
eventRoutes.get('/:id', requireAuth, eventController.getEventById);

// State transitions (Admin, Officer, Analyst)
eventRoutes.post(
  '/:id/acknowledge',
  requireAuth,
  requireRole(['ADMIN', 'OFFICER', 'ANALYST']),
  eventController.acknowledgeEvent
);

eventRoutes.post(
  '/:id/resolve',
  requireAuth,
  requireRole(['ADMIN', 'OFFICER', 'ANALYST']),
  eventController.resolveEvent
);
