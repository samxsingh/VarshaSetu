import { Router } from 'express';
import { scenarioController } from '../controllers/scenarioController';
import { requireAuth } from '../middleware/authMiddleware';
import { simulationRateLimiter } from '../middleware/rateLimitMiddleware';

export const scenarioRoutes = Router();

// Controlled Scenario Registry (Accessible to all authenticated users & health checks)
scenarioRoutes.get('/registry', scenarioController.getRegistry);
scenarioRoutes.get('/', requireAuth, scenarioController.listScenarios);
scenarioRoutes.post('/run', requireAuth, simulationRateLimiter, scenarioController.runScenario);
scenarioRoutes.post('/compare', requireAuth, simulationRateLimiter, scenarioController.compareScenario);
scenarioRoutes.post('/sensitivity', requireAuth, simulationRateLimiter, scenarioController.runSensitivity);

scenarioRoutes.get('/:id', requireAuth, scenarioController.getScenarioById);
scenarioRoutes.get('/:id/sensitivity', requireAuth, scenarioController.getScenarioSensitivity);
scenarioRoutes.get('/:id/explanation', requireAuth, scenarioController.getScenarioExplanation);
scenarioRoutes.get('/:id/provenance', requireAuth, scenarioController.getScenarioProvenance);
