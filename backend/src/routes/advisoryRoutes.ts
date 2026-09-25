import { Router } from 'express';
import { advisoryController } from '../controllers/advisoryController';
import { localizationController } from '../controllers/localizationController';
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

// Multilingual & Voice Accessibility (Phase 5C)
advisoryRoutes.get('/languages', localizationController.getLanguages);
advisoryRoutes.get('/terminology', localizationController.getTerminology);
advisoryRoutes.post('/localize', requireAuth, localizationController.localizeAdvisory);
advisoryRoutes.get('/voice/status', localizationController.getVoiceStatus);

// Advisory access & lifecycle (All authenticated users; Farmers restricted to permitted block)
advisoryRoutes.get('/', requireAuth, advisoryController.listAdvisories);
advisoryRoutes.get('/:id', requireAuth, advisoryController.getAdvisoryById);
advisoryRoutes.post('/:id/dismiss', requireAuth, advisoryController.dismissAdvisory);

// Advisory-specific localization & voice actions (Phase 5C)
advisoryRoutes.get('/:id/localized', requireAuth, localizationController.getLocalizedAdvisory);
advisoryRoutes.post('/:id/read', requireAuth, localizationController.recordReadReceipt);
advisoryRoutes.post('/:id/voice', requireAuth, localizationController.synthesizeVoice);

