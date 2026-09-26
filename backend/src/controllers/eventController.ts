import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';
import { eventRepository } from '../repositories/eventRepository';
import { mlGatewayClient } from '../services/ml';

export const eventController = {
  async listEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let blockId = req.query.block_id as string | undefined;

      // Farmers can only view events for their permitted block
      if (req.user?.role === 'FARMER') {
        blockId = req.user.assignedLocationId || 'UP_LKO_BKT';
      }

      const eventType = req.query.event_type as string | undefined;
      const severity = req.query.severity as string | undefined;
      const state = req.query.state as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      // 1. Try ML Service
      try {
        const query: Record<string, any> = { limit };
        if (blockId) query.block_id = blockId;
        if (eventType) query.event_type = eventType;
        if (severity) query.severity = severity;
        if (state) query.state = state;

        const data = await mlGatewayClient.get<any>('/events', { query });
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback to database repository
      }

      // 2. Fallback to database
      const dbEvents = await eventRepository.listEvents({
        block_id: blockId,
        event_type: eventType,
        severity: severity,
        state: state,
        limit,
      });

      return sendSuccess(res, {
        total_events: dbEvents.length,
        events: dbEvents,
      });
    } catch (error) {
      next(error);
    }
  },

  async getEventById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id;

      // 1. Try ML Service
      try {
        const data = await mlGatewayClient.get<any>(`/events/${encodeURIComponent(eventId)}`);

        // RBAC verification for farmers
        if (req.user?.role === 'FARMER' && req.user.assignedLocationId && data.block_id !== req.user.assignedLocationId) {
          return sendError(res, 'FORBIDDEN', 'Access to events outside assigned agricultural block is prohibited.', 403);
        }

        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      // 2. Fallback to repository
      const ev = await eventRepository.getEventById(eventId);
      if (!ev) {
        return sendError(res, 'NOT_FOUND', `Event '${eventId}' not found.`, 404);
      }

      if (req.user?.role === 'FARMER' && req.user.assignedLocationId && ev.block_id !== req.user.assignedLocationId) {
        return sendError(res, 'FORBIDDEN', 'Access to events outside assigned agricultural block is prohibited.', 403);
      }

      return sendSuccess(res, ev);
    } catch (error) {
      next(error);
    }
  },

  async getEventHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id;

      // 1. Try ML Service
      try {
        const data = await mlGatewayClient.get<any>(`/events/${encodeURIComponent(eventId)}/history`);
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      // 2. Fallback to repository
      const transitions = await eventRepository.getTransitionsByEventId(eventId);
      return sendSuccess(res, {
        event_id: eventId,
        history: transitions,
      });
    } catch (error) {
      next(error);
    }
  },

  async detectEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { block_id, target_types, cooldown_hours } = req.body || {};

      try {
        const data = await mlGatewayClient.post<any>('/events/detect', {
          block_id: block_id || 'UP_LKO_BKT',
          target_types: target_types || null,
          cooldown_hours: cooldown_hours || 24,
        });

        // Sync detected events into database if available
        if (Array.isArray(data.detected_events)) {
          for (const ev of data.detected_events) {
            await eventRepository.upsertEvent(ev).catch(() => null);
          }
        }
        if (Array.isArray(data.updated_events)) {
          for (const ev of data.updated_events) {
            await eventRepository.upsertEvent(ev).catch(() => null);
          }
        }
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      return sendSuccess(res, {
        total_evaluated_forecasts: 1,
        detected_events: [],
        updated_events: [],
        suppressed_count: 0,
        operational_status: 'DIAGNOSTIC_ONLY',
        timestamp: new Date().toISOString(),
        summary: 'Event detection completed in fallback mode. Operational status strictly DIAGNOSTIC_ONLY.',
      });
    } catch (error) {
      next(error);
    }
  },

  async acknowledgeEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id;
      const { reason, metadata } = req.body || {};
      const actor = req.user?.fullName || req.user?.phoneNumber || 'SYSTEM';

      // 1. Try ML Service
      try {
        const data = await mlGatewayClient.post<any>(`/events/${encodeURIComponent(eventId)}/acknowledge`, {
          actor,
          reason: reason || 'Duty officer acknowledged event notice.',
          metadata: metadata || {},
        });
        await eventRepository.updateEventState(eventId, 'ACKNOWLEDGED', actor, 'acknowledge').catch(() => null);
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      // 2. Fallback to repository
      const updated = await eventRepository.updateEventState(eventId, 'ACKNOWLEDGED', actor, 'acknowledge');
      if (!updated) {
        return sendError(res, 'NOT_FOUND', `Event '${eventId}' not found.`, 404);
      }

      await eventRepository.recordTransition({
        transition_id: `trans_${Date.now()}`,
        event_id: eventId,
        previous_state: 'DETECTED',
        new_state: 'ACKNOWLEDGED',
        actor,
        reason: reason || 'Duty officer acknowledged event notice.',
        metadata,
      }).catch(() => null);

      return sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async resolveEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id;
      const { reason, metadata } = req.body || {};
      const actor = req.user?.fullName || req.user?.phoneNumber || 'SYSTEM';

      // 1. Try ML Service
      try {
        const data = await mlGatewayClient.post<any>(`/events/${encodeURIComponent(eventId)}/resolve`, {
          actor,
          reason: reason || 'Event resolution completed.',
          metadata: metadata || {},
        });
        await eventRepository.updateEventState(eventId, 'RESOLVED', actor, 'resolve').catch(() => null);
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      // 2. Fallback to repository
      const updated = await eventRepository.updateEventState(eventId, 'RESOLVED', actor, 'resolve');
      if (!updated) {
        return sendError(res, 'NOT_FOUND', `Event '${eventId}' not found.`, 404);
      }

      await eventRepository.recordTransition({
        transition_id: `trans_${Date.now()}`,
        event_id: eventId,
        previous_state: 'ACKNOWLEDGED',
        new_state: 'RESOLVED',
        actor,
        reason: reason || 'Event resolution completed.',
        metadata,
      }).catch(() => null);

      return sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  },
};
