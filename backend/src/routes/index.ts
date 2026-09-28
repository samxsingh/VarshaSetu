import { Router, Request, Response } from 'express';
import { healthRoutes } from './healthRoutes';
import { authRoutes } from './authRoutes';
import { geographyRoutes } from './geographyRoutes';
import { dataHealthRoutes } from './dataHealthRoutes';
import { modelRoutes } from './modelRoutes';
import { forecastRoutes } from './forecastRoutes';
import { eventRoutes } from './eventRoutes';
import { notificationRoutes } from './notificationRoutes';
import { operationRoutes } from './operationRoutes';
import { advisoryRoutes } from './advisoryRoutes';
import { scenarioRoutes } from './scenarioRoutes';
import { localizationRoutes } from './localizationRoutes';
import { auditRoutes } from './auditRoutes';
import { weatherRoutes } from './weatherRoutes';
import { climateRoutes } from './climateRoutes';
import { weatherController } from '../controllers/weatherController';
import { scenarioController } from '../controllers/scenarioController';
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
apiRouter.use('/weather', weatherRoutes);
apiRouter.get('/data/context', weatherController.getDataContext);
apiRouter.use('/climate', climateRoutes);
apiRouter.use('/ingestion', dataHealthRoutes);
apiRouter.use('/models', modelRoutes);
apiRouter.use('/forecasts', forecastRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/operations', operationRoutes);
apiRouter.get('/agronomy/scenario-registry', scenarioController.getRegistry);
apiRouter.use('/agronomy/scenarios', scenarioRoutes);
apiRouter.use('/scenario', scenarioRoutes);
apiRouter.use('/scenarios', scenarioRoutes);
apiRouter.use('/agronomy', advisoryRoutes);
apiRouter.use('/advisories', advisoryRoutes);
apiRouter.use('/localization', localizationRoutes);
apiRouter.use('/voice', localizationRoutes);
apiRouter.use('/audit', auditRoutes);

// Authoritative RBAC role verification endpoints across all 5 operational roles
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
  requireRole(['ANALYST', 'ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    return sendSuccess(res, {
      message: 'Analyst role verified',
      user: req.user?.fullName,
      modelRegistryStatus: 'SHELL_ACTIVE_UNTRAINED',
    });
  }
);

apiRouter.get(
  '/government/summary',
  requireAuth,
  requireRole(['GOVERNMENT', 'ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    return sendSuccess(res, {
      message: 'Government role verified',
      user: req.user?.fullName,
      observationalAnchor: 'UP_LKO_BKT',
    });
  }
);

apiRouter.get(
  '/officer/overview',
  requireAuth,
  requireRole(['OFFICER', 'ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    return sendSuccess(res, {
      message: 'Field Officer role verified',
      user: req.user?.fullName,
      assignedLocationId: req.user?.assignedLocationId || null,
    });
  }
);

apiRouter.get(
  '/farmer/profile',
  requireAuth,
  requireRole(['FARMER', 'ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    return sendSuccess(res, {
      message: 'Farmer role verified',
      user: req.user?.fullName,
      preferredLanguage: req.user?.preferredLanguage,
    });
  }
);
