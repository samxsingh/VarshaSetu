import { Router } from 'express';
import { auditController } from '../controllers/auditController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

export const auditRoutes = Router();

// Strict authoritative RBAC: ADMIN role only
auditRoutes.get(
  '/logs',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(auditController.listLogs as any)
);
