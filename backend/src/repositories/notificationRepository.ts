import { query } from '../db/pool';

export interface NotificationPreferenceRow {
  id: string;
  user_id: string;
  role: string;
  preferred_language: string;
  event_types: string[];
  minimum_severity: string;
  enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  channels: string[];
  created_at: Date;
  updated_at: Date;
}

export interface NotificationDeliveryRow {
  id: string;
  delivery_id: string;
  message_id: string;
  event_id: string | null;
  recipient_id: string;
  channel: string;
  status: string;
  provider_name: string;
  title: string;
  body: string;
  details: any;
  created_at: Date;
}

export const notificationRepository = {
  async getPreferencesByUserId(userId: string): Promise<NotificationPreferenceRow | null> {
    try {
      const res = await query<NotificationPreferenceRow>(
        'SELECT * FROM notification_preferences WHERE user_id = $1 LIMIT 1',
        [userId]
      );
      return res.rows[0] || null;
    } catch (err) {
      return null;
    }
  },

  async upsertPreferences(
    userId: string,
    role: string,
    prefs: {
      preferred_language?: string;
      event_types?: string[];
      minimum_severity?: string;
      enabled?: boolean;
      quiet_hours_start?: string | null;
      quiet_hours_end?: string | null;
      channels?: string[];
    }
  ): Promise<NotificationPreferenceRow | null> {
    try {
      const sql = `
        INSERT INTO notification_preferences (
          user_id, role, preferred_language, event_types,
          minimum_severity, enabled, quiet_hours_start, quiet_hours_end, channels
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
        ON CONFLICT (user_id) DO UPDATE SET
          preferred_language = COALESCE(EXCLUDED.preferred_language, notification_preferences.preferred_language),
          event_types = COALESCE(EXCLUDED.event_types, notification_preferences.event_types),
          minimum_severity = COALESCE(EXCLUDED.minimum_severity, notification_preferences.minimum_severity),
          enabled = COALESCE(EXCLUDED.enabled, notification_preferences.enabled),
          quiet_hours_start = EXCLUDED.quiet_hours_start,
          quiet_hours_end = EXCLUDED.quiet_hours_end,
          channels = COALESCE(EXCLUDED.channels, notification_preferences.channels),
          updated_at = NOW()
        RETURNING *;
      `;
      const res = await query<NotificationPreferenceRow>(sql, [
        userId,
        role,
        prefs.preferred_language || 'en',
        prefs.event_types || ['HEAVY_RAIN_RISK', 'DRY_SPELL_RISK', 'MONSOON_ONSET_RISK', 'FALSE_ONSET_RISK', 'RAINFALL_ANOMALY'],
        prefs.minimum_severity || 'WATCH',
        prefs.enabled !== undefined ? prefs.enabled : true,
        prefs.quiet_hours_start || null,
        prefs.quiet_hours_end || null,
        prefs.channels || ['IN_APP'],
      ]);
      return res.rows[0] || null;
    } catch (err) {
      console.warn('Upsert notification preferences failed in DB:', err);
      return null;
    }
  },

  async recordDelivery(delivery: Partial<NotificationDeliveryRow>): Promise<NotificationDeliveryRow | null> {
    try {
      const sql = `
        INSERT INTO notification_deliveries (
          delivery_id, message_id, event_id, recipient_id, channel, status, provider_name, title, body, details
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const res = await query<NotificationDeliveryRow>(sql, [
        delivery.delivery_id,
        delivery.message_id,
        delivery.event_id || null,
        delivery.recipient_id,
        delivery.channel,
        delivery.status || 'SIMULATED',
        delivery.provider_name || 'DatabaseDeliveryProvider',
        delivery.title,
        delivery.body,
        JSON.stringify(delivery.details || {}),
      ]);
      return res.rows[0] || null;
    } catch (err) {
      return null;
    }
  },

  async listDeliveries(limit = 50): Promise<NotificationDeliveryRow[]> {
    try {
      const res = await query<NotificationDeliveryRow>(
        'SELECT * FROM notification_deliveries ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      return res.rows;
    } catch (err) {
      return [];
    }
  },
};
