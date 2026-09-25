import { query } from '../db/pool';

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

export const eventRepository = {
  async listEvents(filters: {
    block_id?: string;
    event_type?: string;
    severity?: string;
    state?: string;
    limit?: number;
  } = {}): Promise<ForecastEventRow[]> {
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
