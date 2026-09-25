import { Router } from 'express';
import { scenarioController } from '../controllers/scenarioController';
import { requireAuth } from '../middleware/authMiddleware';

export const scenarioRoutes = Router();

// Controlled Scenario Registry (Accessible to all authenticated users & health checks)
scenarioRoutes.get('/registry', scenarioController.getRegistry);
scenarioRoutes.get('/', requireAuth, scenarioController.listScenarios);
scenarioRoutes.post('/run', requireAuth, scenarioController.runScenario);
scenarioRoutes.post('/compare', requireAuth, scenarioController.compareScenario);
scenarioRoutes.post('/sensitivity', requireAuth, scenarioController.runSensitivity);

scenarioRoutes.get('/:id', requireAuth, scenarioController.getScenarioById);
scenarioRoutes.get('/:id/sensitivity', requireAuth, scenarioController.getScenarioSensitivity);
scenarioRoutes.get('/:id/explanation', requireAuth, scenarioController.getScenarioExplanation);
scenarioRoutes.get('/:id/provenance', requireAuth, scenarioController.getScenarioProvenance);
