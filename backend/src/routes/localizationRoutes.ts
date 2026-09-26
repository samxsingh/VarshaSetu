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
localizationRoutes.get('/advisory/:id', requireAuth, localizationController.getLocalizedAdvisory);

// Read receipts / personal acknowledgements
localizationRoutes.post('/advisories/:id/read', requireAuth, localizationController.recordReadReceipt);
localizationRoutes.post('/read', requireAuth, (req, res, next) => {
  if (req.body?.advisoryId && !req.params.id) {
    req.params.id = req.body.advisoryId;
  }
  return localizationController.recordReadReceipt(req as any, res, next);
});

// Voice accessibility subsystem
localizationRoutes.get('/status', localizationController.getVoiceStatus);
localizationRoutes.post('/advisories/:id/synthesize', requireAuth, voiceRateLimiter, localizationController.synthesizeVoice);
localizationRoutes.post('/voice-synthesize', requireAuth, voiceRateLimiter, (req, res, next) => {
  if (req.body?.advisoryId && !req.params.id) {
    req.params.id = req.body.advisoryId;
  }
  return localizationController.synthesizeVoice(req as any, res, next);
});
