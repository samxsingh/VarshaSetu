import { Router } from 'express';
import { advisoryController } from '../controllers/advisoryController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

export const advisoryRoutes = Router();

// Engine status & disclosures
advisoryRoutes.get('/status', advisoryController.getStatus);

// Controlled Crop & Rule Registries (All authenticated users)
advisoryRoutes.get('/rules', requireAuth, advisoryController.listRules);
advisoryRoutes.get('/rules/:id', requireAuth, advisoryController.getRuleById);
advisoryRoutes.get('/crops', requireAuth, advisoryController.listCrops);
advisoryRoutes.get('/crops/:id', requireAuth, advisoryController.getCropById);

// Rule evaluation & advisory generation (Privileged roles)
advisoryRoutes.post(
  '/evaluate',
  requireAuth,
  requireRole(['ADMIN', 'OFFICER', 'ANALYST']),
  advisoryController.evaluateAdvisories
);

advisoryRoutes.post(
  '/generate',
  requireAuth,
  requireRole(['ADMIN', 'OFFICER', 'ANALYST']),
  advisoryController.generateAdvisories
);

// What-If Scenario Sensitivity Simulation (All authenticated users: Farmers, Officers, Analysts)
advisoryRoutes.post('/simulate', requireAuth, advisoryController.simulateScenario);

// Advisory access & lifecycle (All authenticated users; Farmers restricted to permitted block)
advisoryRoutes.get('/', requireAuth, advisoryController.listAdvisories);
advisoryRoutes.get('/:id', requireAuth, advisoryController.getAdvisoryById);
advisoryRoutes.post('/:id/dismiss', requireAuth, advisoryController.dismissAdvisory);
