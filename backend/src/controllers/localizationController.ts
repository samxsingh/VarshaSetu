import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';
import { localizationRepository } from '../repositories/localizationRepository';
import { mlGatewayClient, GatewayResponseError } from '../services/ml';

export const localizationController = {
  async getLanguages(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const data = await mlGatewayClient.get<any>('/agronomy/languages');
        return sendSuccess(res, data);
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
        const data = await mlGatewayClient.get<any>('/agronomy/terminology');
        return sendSuccess(res, data);
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

      let locResult: any;
      try {
        locResult = await mlGatewayClient.post<any>('/agronomy/localize', {
          advisory_id,
          target_language: targetLang,
          advisory,
        });
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          const detail = err.responseBody?.detail || err.responseBody?.message || 'Failed to localize advisory.';
          return sendError(res, detail, 'LOCALIZATION_FAILED', err.statusCode);
        }
        return sendError(res, err.message || 'Failed to localize advisory.', 'LOCALIZATION_FAILED', 502);
      }

      const locAdv = locResult.localized_advisory || locResult;

      // Persist localized advisory
      if (locAdv) {
        await localizationRepository.saveLocalizedAdvisory({
          advisory_id: locAdv.source_advisory_id || advisory_id || 'UNKNOWN',
          language: locAdv.language || targetLang,
          title: locAdv.title || '',
          summary: locAdv.summary || '',
          risk_indicator: locAdv.risk_indicator || '',
          what_it_means: locAdv.what_it_means || '',
          evidence: locAdv.evidence || null,
          confidence_statement: locAdv.confidence_statement || '',
          disclosure: locAdv.disclosure || '',
          historical_limitation_disclosure: locAdv.historical_limitation_disclosure || '',
          classification: locAdv.classification || 'DIAGNOSTIC_ONLY',
          translation_method: locAdv.translation_method || 'CONTROLLED_TEMPLATE',
          template_version: locAdv.template_version || '1.0.0',
          terminology_version: locAdv.terminology_version || '1.0.0',
          localization_fingerprint: locAdv.localization_fingerprint || '0000000000000000',
        }).catch(() => null);
      }

      return sendSuccess(res, locResult);
    } catch (error) {
      next(error);
    }
  },

  async getLocalizedAdvisory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lang = ((req.query.lang as string) || 'HI').toUpperCase();

      // Check cache first
      const cached = await localizationRepository.getLocalizedAdvisory(id, lang);
      if (cached) {
        return sendSuccess(res, cached);
      }

      // Fetch from ML service
      let locAdv: any;
      try {
        locAdv = await mlGatewayClient.get<any>(`/agronomy/advisories/${id}/localized`, { query: { lang } });
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          const detail = err.responseBody?.detail || 'Advisory not found';
          return sendError(res, detail, 'NOT_FOUND', err.statusCode);
        }
        return sendError(res, 'Advisory not found', 'NOT_FOUND', 404);
      }

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
        const data = await mlGatewayClient.get<any>('/agronomy/voice/status');
        return sendSuccess(res, data);
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

      let data: any;
      try {
        data = await mlGatewayClient.post<any>(`/agronomy/advisories/${id}/voice`, {
          advisory_id: id,
          language,
          speech_rate,
          text,
        });
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          const detail = err.responseBody?.detail || 'Voice synthesis failed';
          return sendError(res, detail, 'VOICE_ERROR', err.statusCode);
        }
        return sendError(res, 'Voice synthesis failed', 'VOICE_ERROR', 502);
      }

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
