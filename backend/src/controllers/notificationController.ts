import { Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';
import { notificationRepository } from '../repositories/notificationRepository';

export const notificationController = {
  async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, {
        subsystem: 'varshasetu-notification-gateway',
        phase: 'PHASE_4F_OPERATIONAL_HARDENING',
        mode: 'INTERNAL_SIMULATION_ONLY',
        active_channels: ['IN_APP', 'LOG'],
        disabled_external_channels: ['SMS', 'WHATSAPP', 'VOICE'],
        external_channels_status: 'NOT_CONFIGURED',
        audit_storage: 'POSTGRESQL_AND_ARTIFACTS',
        scientific_disclosure:
          'Automated broadcast delivery (SMS/WhatsApp/Bhashini voice) is strictly not active in Phase 4F. Notification actions represent simulated internal dispatches.',
      });
    } catch (error) {
      next(error);
    }
  },

  async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Authentication required.', 401);
      }

      const prefs = await notificationRepository.getPreferencesByUserId(req.user.id);
      if (!prefs) {
        // Return default configuration
        return sendSuccess(res, {
          user_id: req.user.id,
          role: req.user.role,
          preferred_language: 'en',
          event_types: ['HEAVY_RAIN_RISK', 'DRY_SPELL_RISK', 'MONSOON_ONSET_RISK', 'FALSE_ONSET_RISK', 'RAINFALL_ANOMALY'],
          minimum_severity: 'WATCH',
          enabled: true,
          quiet_hours_start: null,
          quiet_hours_end: null,
          channels: ['IN_APP'],
        });
      }

      return sendSuccess(res, prefs);
    } catch (error) {
      next(error);
    }
  },

  async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Authentication required.', 401);
      }

      const {
        preferred_language,
        event_types,
        minimum_severity,
        enabled,
        quiet_hours_start,
        quiet_hours_end,
        channels,
      } = req.body || {};

      const updated = await notificationRepository.upsertPreferences(req.user.id, req.user.role, {
        preferred_language,
        event_types,
        minimum_severity,
        enabled,
        quiet_hours_start,
        quiet_hours_end,
        channels,
      });

      return sendSuccess(res, updated || {
        user_id: req.user.id,
        role: req.user.role,
        preferred_language: preferred_language || 'en',
        event_types: event_types || ['HEAVY_RAIN_RISK'],
        minimum_severity: minimum_severity || 'WATCH',
        enabled: enabled !== undefined ? enabled : true,
        quiet_hours_start: quiet_hours_start || null,
        quiet_hours_end: quiet_hours_end || null,
        channels: channels || ['IN_APP'],
      });
    } catch (error) {
      next(error);
    }
  },
};
