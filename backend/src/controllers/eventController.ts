import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';
import { eventRepository, ForecastEventRow } from '../repositories/eventRepository';
import { mlGatewayClient } from '../services/ml';
import { realtimeService, ScientificEventDTO } from '../realtime';
import { operationalSignalService } from '../services/operational/operationalSignalService';

function toEventDTO(ev: any): ScientificEventDTO {
  return {
    eventId: ev.event_id || ev.eventId,
    eventType: ev.event_type || ev.eventType,
    forecastId: ev.forecast_id || ev.forecastId,
    blockId: ev.block_id || ev.blockId,
    detectedAt: ev.detected_at instanceof Date ? ev.detected_at.toISOString() : String(ev.detected_at || new Date().toISOString()),
    validFrom: ev.valid_from instanceof Date ? ev.valid_from.toISOString() : String(ev.valid_from || new Date().toISOString()),
    validUntil: ev.valid_until instanceof Date ? ev.valid_until.toISOString() : String(ev.valid_until || new Date().toISOString()),
    probability: Number(ev.probability) || 0,
    threshold: Number(ev.threshold) || 0,
    unit: ev.unit || 'mm',
    severity: ev.severity || 'WATCH',
    confidenceStatus: ev.confidence_status || ev.confidenceStatus || 'CALIBRATED',
    operationalStatus: ev.operational_status || ev.operationalStatus || 'DIAGNOSTIC_ONLY',
    dataFreshness: ev.data_freshness || ev.dataFreshness || 'HISTORICAL_ONLY',
    validationStatus: ev.validation_status || ev.validationStatus || 'INSUFFICIENT_DATA',
    explanationReference: ev.explanation_reference || ev.explanationReference || null,
    state: ev.state || 'DETECTED',
    description: ev.description || '',
    deduplicationHash: ev.deduplication_hash || ev.deduplicationHash || '',
    acknowledgedBy: ev.acknowledged_by || ev.acknowledgedBy || null,
    acknowledgedAt: ev.acknowledged_at ? (ev.acknowledged_at instanceof Date ? ev.acknowledged_at.toISOString() : String(ev.acknowledged_at)) : null,
    resolvedBy: ev.resolved_by || ev.resolvedBy || null,
    resolvedAt: ev.resolved_at ? (ev.resolved_at instanceof Date ? ev.resolved_at.toISOString() : String(ev.resolved_at)) : null,
    metadata: ev.metadata || {},
  };
}

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

        // Sync detected events into database if available and emit realtime events
        if (Array.isArray(data.detected_events)) {
          for (const ev of data.detected_events) {
            await eventRepository.upsertEvent(ev).catch(() => null);
            realtimeService.emitEventCreated(toEventDTO(ev));
            realtimeService.emitOperationalSignal(operationalSignalService.fromEvent(ev));
          }
        }
        if (Array.isArray(data.updated_events)) {
          for (const ev of data.updated_events) {
            await eventRepository.upsertEvent(ev).catch(() => null);
            realtimeService.emitEventUpdated(toEventDTO(ev));
            realtimeService.emitOperationalSignal(operationalSignalService.fromEvent(ev));
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
        const updated = await eventRepository.updateEventState(eventId, 'ACKNOWLEDGED', actor, 'acknowledge').catch(() => null);
        realtimeService.emitEventAcknowledged(toEventDTO(updated || data));
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

      realtimeService.emitEventAcknowledged(toEventDTO(updated));
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
        const updated = await eventRepository.updateEventState(eventId, 'RESOLVED', actor, 'resolve').catch(() => null);
        realtimeService.emitEventResolved(toEventDTO(updated || data));
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

      realtimeService.emitEventResolved(toEventDTO(updated));
      return sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  },
};
