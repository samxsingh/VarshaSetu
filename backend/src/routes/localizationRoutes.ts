import { Router } from 'express';
import { localizationController } from '../controllers/localizationController';
import { requireAuth } from '../middleware/authMiddleware';
import { voiceRateLimiter } from '../middleware/rateLimitMiddleware';

export const localizationRoutes = Router();

// Controlled languages & terminology catalog
localizationRoutes.get('/languages', localizationController.getLanguages);
localizationRoutes.get('/terminology', localizationController.getTerminology);

// Localization engine
localizationRoutes.post('/localize', requireAuth, localizationController.localizeAdvisory);
localizationRoutes.get('/advisories/:id/localized', requireAuth, localizationController.getLocalizedAdvisory);

// Read receipts / personal acknowledgements
localizationRoutes.post('/advisories/:id/read', requireAuth, localizationController.recordReadReceipt);

// Voice accessibility subsystem
localizationRoutes.get('/status', localizationController.getVoiceStatus);
localizationRoutes.post('/advisories/:id/synthesize', requireAuth, voiceRateLimiter, localizationController.synthesizeVoice);
