import { query } from '../db/pool';
import { Event, IEvent, IEventStateTransition } from '../models/Event';
import { isDatabaseConnected } from '../config/database';

export interface ForecastEventRow {
  id: string;
  event_id: string;
  event_type: string;
  forecast_id: string;
  block_id: string;
  detected_at: Date;
  valid_from: string;
  valid_until: string;
  probability: number;
  threshold: number;
  unit: string;
  severity: string;
  confidence_status: string;
  operational_status: string;
  data_freshness: string;
  validation_status: string;
  explanation_reference: string | null;
  state: string;
  description: string;
  deduplication_hash: string;
  acknowledged_by: string | null;
  acknowledged_at: Date | null;
  resolved_by: string | null;
  resolved_at: Date | null;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

export interface ForecastEventTransitionRow {
  id: string;
  transition_id: string;
  event_id: string;
  previous_state: string;
  new_state: string;
  actor: string;
  reason: string;
  metadata: any;
  created_at: Date;
}

function docToEventRow(doc: IEvent): ForecastEventRow {
  return {
    id: (doc._id as any).toString(),
    event_id: doc.eventId,
    event_type: doc.eventType,
    forecast_id: doc.forecastId,
    block_id: doc.blockId,
    detected_at: doc.detectedAt || new Date(),
    valid_from: doc.validFrom ? doc.validFrom.toISOString() : new Date().toISOString(),
    valid_until: doc.validUntil ? doc.validUntil.toISOString() : new Date().toISOString(),
    probability: doc.probability,
    threshold: doc.threshold,
    unit: doc.unit || 'mm',
    severity: doc.severity,
    confidence_status: doc.confidenceStatus || 'CALIBRATED',
    operational_status: doc.operationalStatus || 'DIAGNOSTIC_ONLY',
    data_freshness: doc.dataFreshness || 'HISTORICAL_ONLY',
    validation_status: doc.validationStatus || 'INSUFFICIENT_DATA',
    explanation_reference: doc.explanationReference || null,
    state: doc.state || 'DETECTED',
    description: doc.description || '',
    deduplication_hash: doc.deduplicationHash || '',
    acknowledged_by: doc.acknowledgedBy || null,
    acknowledged_at: doc.acknowledgedAt || null,
    resolved_by: doc.resolvedBy || null,
    resolved_at: doc.resolvedAt || null,
    metadata: doc.metadata || {},
    created_at: doc.createdAt || new Date(),
    updated_at: doc.updatedAt || new Date(),
  };
}

export const eventRepository = {
  async listEvents(filters: {
    block_id?: string;
    event_type?: string;
    severity?: string;
    state?: string;
    limit?: number;
  } = {}): Promise<ForecastEventRow[]> {
    if (isDatabaseConnected()) {
      try {
        const mongoFilter: any = {};
        if (filters.block_id) mongoFilter.blockId = filters.block_id;
        if (filters.event_type) mongoFilter.eventType = filters.event_type;
        if (filters.severity) mongoFilter.severity = filters.severity;
        if (filters.state) mongoFilter.state = filters.state;

        const limit = filters.limit || 50;
        const docs = await Event.find(mongoFilter).sort({ detectedAt: -1 }).limit(limit);
        return docs.map(docToEventRow);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters.block_id) {
        params.push(filters.block_id);
        conditions.push(`block_id = $${params.length}`);
      }
      if (filters.event_type) {
        params.push(filters.event_type);
        conditions.push(`event_type = $${params.length}`);
      }
      if (filters.severity) {
        params.push(filters.severity);
        conditions.push(`severity = $${params.length}`);
      }
      if (filters.state) {
        params.push(filters.state);
        conditions.push(`state = $${params.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const limit = filters.limit || 50;
      params.push(limit);
      const limitIndex = params.length;

      const sql = `
        SELECT * FROM forecast_events
        ${whereClause}
        ORDER BY detected_at DESC
        LIMIT $${limitIndex}
      `;
      const res = await query<ForecastEventRow>(sql, params);
      return res.rows;
    } catch (err) {
      console.warn('Database query for events failed, returning empty set:', err);
      return [];
    }
  },

  async getEventById(eventId: string): Promise<ForecastEventRow | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await Event.findOne({ eventId });
        if (doc) return docToEventRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

    try {
      const res = await query<ForecastEventRow>(
        'SELECT * FROM forecast_events WHERE event_id = $1 LIMIT 1',
        [eventId]
      );
      return res.rows[0] || null;
    } catch (err) {
      return null;
    }
  },

  async upsertEvent(event: Partial<ForecastEventRow>): Promise<ForecastEventRow | null> {
    if (isDatabaseConnected() && event.event_id) {
      try {
        const doc = await Event.findOneAndUpdate(
          { eventId: event.event_id },
          {
            eventId: event.event_id,
            eventType: event.event_type,
            forecastId: event.forecast_id,
            blockId: event.block_id,
            detectedAt: event.detected_at || new Date(),
            validFrom: event.valid_from ? new Date(event.valid_from) : new Date(),
            validUntil: event.valid_until ? new Date(event.valid_until) : new Date(),
            probability: event.probability,
            threshold: event.threshold,
            unit: event.unit || 'mm',
            severity: event.severity,
            confidenceStatus: event.confidence_status || 'CALIBRATED',
            operationalStatus: event.operational_status || 'DIAGNOSTIC_ONLY',
            dataFreshness: event.data_freshness || 'HISTORICAL_ONLY',
            validationStatus: event.validation_status || 'INSUFFICIENT_DATA',
            explanationReference: event.explanation_reference,
            state: event.state || 'DETECTED',
            description: event.description,
            deduplicationHash: event.deduplication_hash,
            metadata: event.metadata || {},
          },
          { upsert: true, new: true }
        );
        if (doc) return docToEventRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

    try {
      const sql = `
        INSERT INTO forecast_events (
          event_id, event_type, forecast_id, block_id, detected_at,
          valid_from, valid_until, probability, threshold, unit,
          severity, confidence_status, operational_status, data_freshness,
          validation_status, explanation_reference, state, description,
          deduplication_hash, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
        ON CONFLICT (event_id) DO UPDATE SET
          probability = EXCLUDED.probability,
          severity = EXCLUDED.severity,
          state = EXCLUDED.state,
          description = EXCLUDED.description,
          updated_at = NOW()
        RETURNING *;
      `;
      const values = [
        event.event_id,
        event.event_type,
        event.forecast_id,
        event.block_id,
        event.detected_at || new Date(),
        event.valid_from,
        event.valid_until,
        event.probability,
        event.threshold,
        event.unit || 'mm',
        event.severity,
        event.confidence_status || 'CALIBRATED',
        event.operational_status || 'DIAGNOSTIC_ONLY',
        event.data_freshness || 'HISTORICAL_ONLY',
        event.validation_status || 'INSUFFICIENT_DATA',
        event.explanation_reference,
        event.state || 'DETECTED',
        event.description,
        event.deduplication_hash,
        JSON.stringify(event.metadata || {}),
      ];
      const res = await query<ForecastEventRow>(sql, values);
      return res.rows[0] || null;
    } catch (err) {
      console.warn('Upsert event failed in DB:', err);
      return null;
    }
  },

  async updateEventState(
    eventId: string,
    state: string,
    actor: string,
    action: 'acknowledge' | 'resolve'
  ): Promise<ForecastEventRow | null> {
    if (isDatabaseConnected()) {
      try {
        const updateData: any = { state, updatedAt: new Date() };
        if (action === 'acknowledge') {
          updateData.acknowledgedBy = actor;
          updateData.acknowledgedAt = new Date();
        } else if (action === 'resolve') {
          updateData.resolvedBy = actor;
          updateData.resolvedAt = new Date();
        }
        const doc = await Event.findOneAndUpdate({ eventId }, updateData, { new: true });
        if (doc) return docToEventRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

    try {
      let extraField = '';
      if (action === 'acknowledge') {
        extraField = ', acknowledged_by = $3, acknowledged_at = NOW()';
      } else if (action === 'resolve') {
        extraField = ', resolved_by = $3, resolved_at = NOW()';
      }

      const sql = `
        UPDATE forecast_events
        SET state = $1, updated_at = NOW() ${extraField}
        WHERE event_id = $2
        RETURNING *;
      `;
      const res = await query<ForecastEventRow>(sql, [state, eventId, actor]);
      return res.rows[0] || null;
    } catch (err) {
      console.warn('Update event state failed in DB:', err);
      return null;
    }
  },

  async recordTransition(transition: {
    transition_id: string;
    event_id: string;
    previous_state: string;
    new_state: string;
    actor: string;
    reason: string;
    metadata?: any;
  }): Promise<ForecastEventTransitionRow | null> {
    if (isDatabaseConnected()) {
      try {
        const newTrans: IEventStateTransition = {
          transitionId: transition.transition_id,
          previousState: transition.previous_state as any,
          newState: transition.new_state as any,
          actor: transition.actor,
          reason: transition.reason,
          timestamp: new Date(),
          metadata: transition.metadata || {},
        };
        await Event.findOneAndUpdate(
          { eventId: transition.event_id },
          { $push: { transitions: newTrans } }
        );
        return {
          id: transition.transition_id,
          transition_id: transition.transition_id,
          event_id: transition.event_id,
          previous_state: transition.previous_state,
          new_state: transition.new_state,
          actor: transition.actor,
          reason: transition.reason,
          metadata: transition.metadata || {},
          created_at: newTrans.timestamp,
        };
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

    try {
      const sql = `
        INSERT INTO forecast_event_transitions (
          transition_id, event_id, previous_state, new_state, actor, reason, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const res = await query<ForecastEventTransitionRow>(sql, [
        transition.transition_id,
        transition.event_id,
        transition.previous_state,
        transition.new_state,
        transition.actor,
        transition.reason,
        JSON.stringify(transition.metadata || {}),
      ]);
      return res.rows[0] || null;
    } catch (err) {
      return null;
    }
  },

  async getTransitionsByEventId(eventId: string): Promise<ForecastEventTransitionRow[]> {
    if (isDatabaseConnected()) {
      try {
        const doc = await Event.findOne({ eventId });
        if (doc && doc.transitions) {
          return doc.transitions.map((t) => ({
            id: t.transitionId,
            transition_id: t.transitionId,
            event_id: eventId,
            previous_state: t.previousState,
            new_state: t.newState,
            actor: t.actor,
            reason: t.reason,
            metadata: t.metadata || {},
            created_at: t.timestamp || new Date(),
          }));
        }
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

    try {
      const res = await query<ForecastEventTransitionRow>(
        'SELECT * FROM forecast_event_transitions WHERE event_id = $1 ORDER BY created_at ASC',
        [eventId]
      );
      return res.rows;
    } catch (err) {
      return [];
    }
  },
};
