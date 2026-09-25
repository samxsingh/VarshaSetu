import { Router, Request, Response } from 'express';
import { healthRoutes } from './healthRoutes';
import { authRoutes } from './authRoutes';
import { geographyRoutes } from './geographyRoutes';
import { dataHealthRoutes } from './dataHealthRoutes';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole, requirePermission } from '../middleware/rbacMiddleware';
import { sendSuccess } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';

export const apiRouter = Router();

// Mount public and standard routes
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/geography', geographyRoutes);
apiRouter.use('/data-health', dataHealthRoutes);

// RBAC demonstration & test endpoints
apiRouter.get(
  '/admin/system-status',
  requireAuth,
  requireRole(['ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    return sendSuccess(res, {
      message: 'Admin access confirmed',
      adminUser: req.user?.fullName,
      systemMode: 'OPERATIONAL',
    });
  }
);

apiRouter.get(
  '/analyst/model-inspect',
  requireAuth,
  requirePermission(['analyst:models:read']),
  (req: AuthenticatedRequest, res: Response) => {
    return sendSuccess(res, {
      message: 'Analyst permission verified',
      user: req.user?.fullName,
      modelRegistryStatus: 'SHELL_ACTIVE_UNTRAINED',
    });
  }
);
