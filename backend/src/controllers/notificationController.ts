import { Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';
import { notificationRepository } from '../repositories/notificationRepository';
import { realtimeService } from '../realtime';

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

  async getInbox(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Authentication required.', 401);
      }
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const items = await notificationRepository.getDeliveriesByUserId(req.user.id, limit);
      return sendSuccess(res, {
        total: items.length,
        notifications: items,
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

  async simulateAlert(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Authentication required.', 401);
      }
      const { event_type, severity, title, body, channel } = req.body || {};
      const deliveryId = `del_${Date.now()}`;
      const record = await notificationRepository.recordDelivery({
        delivery_id: deliveryId,
        message_id: `msg_${Date.now()}`,
        recipient_id: req.user.id,
        channel: channel || 'IN_APP',
        status: 'SIMULATED',
        provider_name: 'INTERNAL_MOCK',
        title: title || 'Agro-Meteorological Advisory Alert',
        body: body || 'Simulated advisory alert dispatch',
        details: { event_type, severity, simulated: true },
      });

      // Emit realtime notification to recipient user room
      try {
        realtimeService.emitNotification(req.user.id, {
          id: deliveryId,
          deliveryId,
          userId: req.user.id,
          title: title || 'Agro-Meteorological Advisory Alert',
          body: body || 'Simulated advisory alert dispatch',
          severity: severity || 'WATCH',
          channel: 'IN_APP',
          status: 'DELIVERED',
          timestamp: new Date().toISOString(),
          metadata: { event_type, simulated: true },
        });
      } catch {
        // Non-blocking emission
      }

      return sendSuccess(res, {
        simulated: true,
        deliveryId,
        recipient: req.user.id,
        channel: channel || 'IN_APP',
        record,
      });
    } catch (error) {
      next(error);
    }
  },
};
