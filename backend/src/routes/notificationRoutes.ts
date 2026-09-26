import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { requireAuth } from '../middleware/authMiddleware';

export const notificationRoutes = Router();

notificationRoutes.get('/status', requireAuth, notificationController.getStatus);
notificationRoutes.get('/inbox', requireAuth, notificationController.getInbox);
notificationRoutes.get('/preferences', requireAuth, notificationController.getPreferences);
notificationRoutes.put('/preferences', requireAuth, notificationController.updatePreferences);
notificationRoutes.post('/simulate-alert', requireAuth, notificationController.simulateAlert);
