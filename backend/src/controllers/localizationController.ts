import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';
import { localizationRepository } from '../repositories/localizationRepository';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const localizationController = {
  async getLanguages(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/languages`);
        if (mlRes.ok) {
          const data = await mlRes.json();
          return sendSuccess(res, data);
        }
      } catch (e) {
        // Fallback below
      }

      return sendSuccess(res, {
        supported_languages: [
          { code: 'EN', name: 'English', native_name: 'English', status: 'ACTIVE' },
          { code: 'HI', name: 'Hindi', native_name: 'हिन्दी', status: 'ACTIVE' },
        ],
        default_language: 'EN',
        translation_engine: 'CONTROLLED_DETERMINISTIC_TEMPLATES',
        terminology_version: '1.0.0',
        disclaimer:
          'Advisory localization is governed by strictly controlled deterministic agronomic templates. Unvetted machine translation is prohibited.',
      });
    } catch (error) {
      next(error);
    }
  },

  async getTerminology(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/terminology`);
        if (mlRes.ok) {
          const data = await mlRes.json();
          return sendSuccess(res, data);
        }
      } catch (e) {
        // Fallback below
      }

      return sendSuccess(res, {
        version: '1.0.0',
        total_terms: 0,
        terms: [],
        classification: 'CONTROLLED_VOCABULARY',
      });
    } catch (error) {
      next(error);
    }
  },

  async localizeAdvisory(req: Request, res: Response, next: NextFunction) {
    try {
      const { advisory_id, target_language, advisory } = req.body;
      const targetLang = (target_language || 'HI').toUpperCase();

      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/localize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advisory_id,
          target_language: targetLang,
          advisory,
        }),
      });

      if (!mlRes.ok) {
        const errData: any = await mlRes.json().catch(() => ({ detail: 'Localization failed' }));
        return sendError(res, errData.detail || 'Localization failed', 'LOCALIZATION_ERROR', mlRes.status);
      }

      const data: any = await mlRes.json();
      const locAdv = data.localized_advisory;

      // Persist to database cache
      if (locAdv) {
        await localizationRepository.saveLocalizedAdvisory({
          advisory_id: locAdv.source_advisory_id || advisory_id || 'UNKNOWN',
          language: locAdv.language,
          title: locAdv.title,
          summary: locAdv.summary,
          risk_indicator: locAdv.risk_indicator,
          what_it_means: locAdv.what_it_means,
          evidence: locAdv.evidence,
          confidence_statement: locAdv.confidence_statement,
          disclosure: locAdv.disclosure,
          historical_limitation_disclosure: locAdv.historical_limitation_disclosure,
          classification: locAdv.classification || 'DIAGNOSTIC_ONLY',
          translation_method: locAdv.translation_method || 'CONTROLLED_TEMPLATE',
          template_version: locAdv.template_version || '1.0.0',
          terminology_version: locAdv.terminology_version || '1.0.0',
          localization_fingerprint: locAdv.localization_fingerprint || '0000000000000000',
        });
      }

      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getLocalizedAdvisory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lang = (String(req.query.lang || 'HI')).toUpperCase();

      // Check DB first
      const cached = await localizationRepository.getLocalizedAdvisory(id, lang);
      if (cached) {
        return sendSuccess(res, cached);
      }

      // Fetch from ML service
      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/advisories/${id}/localized?lang=${lang}`);
      if (!mlRes.ok) {
        const err: any = await mlRes.json().catch(() => ({ detail: 'Advisory not found' }));
        return sendError(res, err.detail || 'Advisory not found', 'NOT_FOUND', mlRes.status);
      }

      const locAdv: any = await mlRes.json();

      // Save to cache
      await localizationRepository.saveLocalizedAdvisory({
        advisory_id: locAdv.source_advisory_id || id,
        language: locAdv.language,
        title: locAdv.title,
        summary: locAdv.summary,
        risk_indicator: locAdv.risk_indicator,
        what_it_means: locAdv.what_it_means,
        evidence: locAdv.evidence,
        confidence_statement: locAdv.confidence_statement,
        disclosure: locAdv.disclosure,
        historical_limitation_disclosure: locAdv.historical_limitation_disclosure,
        classification: locAdv.classification || 'DIAGNOSTIC_ONLY',
        translation_method: locAdv.translation_method || 'CONTROLLED_TEMPLATE',
        template_version: locAdv.template_version || '1.0.0',
        terminology_version: locAdv.terminology_version || '1.0.0',
        localization_fingerprint: locAdv.localization_fingerprint || '0000000000000000',
      });

      return sendSuccess(res, locAdv);
    } catch (error) {
      next(error);
    }
  },

  async recordReadReceipt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { language = 'EN', device_channel = 'WEB_PORTAL' } = req.body;
      const userId = req.user?.id || null;

      const receipt = await localizationRepository.recordReadReceipt(id, userId, language, device_channel);
      return sendSuccess(res, {
        message: 'Advisory read acknowledgement recorded.',
        receipt,
      });
    } catch (error) {
      next(error);
    }
  },

  async getVoiceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/voice/status`);
        if (mlRes.ok) {
          const data = await mlRes.json();
          return sendSuccess(res, data);
        }
      } catch (e) {
        // Fallback
      }

      return sendSuccess(res, {
        active_provider: 'MOCK_LOCAL_VOICE_ENGINE',
        status: {
          provider: 'MOCK_LOCAL_VOICE_ENGINE',
          status: 'DEMO_ONLY',
          configured: true,
        },
        system_mode: 'DEMO_ONLY',
        telecom_integration: 'DISABLED',
        disclosure: 'Accessibility Voice Engine: Demonstrates localized audio readout capabilities.',
      });
    } catch (error) {
      next(error);
    }
  },

  async synthesizeVoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { language = 'HI', speech_rate = 1.0, text } = req.body;

      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/advisories/${id}/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advisory_id: id,
          language,
          speech_rate,
          text,
        }),
      });

      if (!mlRes.ok) {
        const err: any = await mlRes.json().catch(() => ({ detail: 'Voice synthesis failed' }));
        return sendError(res, err.detail || 'Voice synthesis failed', 'VOICE_ERROR', mlRes.status);
      }

      const data: any = await mlRes.json();

      // Log voice synthesis
      await localizationRepository.recordVoiceSynthesisLog(
        id,
        data.language,
        data.provider,
        data.status,
        data.duration_seconds || 0.0
      );

      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};
