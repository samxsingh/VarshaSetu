import mongoose from 'mongoose';
import { query } from '../db/pool';
import { Notification, INotification } from '../models/Notification';
import { isDatabaseConnected } from '../config/database';

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

function docToPrefRow(doc: INotification): NotificationPreferenceRow {
  return {
    id: (doc._id as any).toString(),
    user_id: doc.userId.toString(),
    role: doc.role,
    preferred_language: doc.preferredLanguage,
    event_types: doc.eventTypes,
    minimum_severity: doc.minimumSeverity,
    enabled: doc.enabled,
    quiet_hours_start: doc.quietHoursStart || null,
    quiet_hours_end: doc.quietHoursEnd || null,
    channels: doc.channels,
    created_at: doc.createdAt || new Date(),
    updated_at: doc.updatedAt || new Date(),
  };
}

export const notificationRepository = {
  async getPreferencesByUserId(userId: string): Promise<NotificationPreferenceRow | null> {
    if (isDatabaseConnected()) {
      try {
        const filter = mongoose.isValidObjectId(userId)
          ? { userId: new mongoose.Types.ObjectId(userId) }
          : { userId };
        const doc = await Notification.findOne(filter);
        if (doc) return docToPrefRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

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
    if (isDatabaseConnected()) {
      try {
        const userObjId = mongoose.isValidObjectId(userId)
          ? new mongoose.Types.ObjectId(userId)
          : userId;
        const doc = await Notification.findOneAndUpdate(
          { userId: userObjId },
          {
            userId: userObjId,
            role,
            preferredLanguage: prefs.preferred_language || 'hi',
            eventTypes: prefs.event_types || [
              'HEAVY_RAIN_RISK',
              'DRY_SPELL_RISK',
              'MONSOON_ONSET_RISK',
              'FALSE_ONSET_RISK',
              'RAINFALL_ANOMALY',
            ],
            minimumSeverity: prefs.minimum_severity || 'WATCH',
            enabled: prefs.enabled !== undefined ? prefs.enabled : true,
            quietHoursStart: prefs.quiet_hours_start || null,
            quietHoursEnd: prefs.quiet_hours_end || null,
            channels: prefs.channels || ['IN_APP'],
          },
          { upsert: true, new: true }
        );
        if (doc) return docToPrefRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

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
    if (isDatabaseConnected() && delivery.recipient_id) {
      try {
        const userFilter = mongoose.isValidObjectId(delivery.recipient_id)
          ? { userId: new mongoose.Types.ObjectId(delivery.recipient_id) }
          : { userId: delivery.recipient_id };
        await Notification.findOneAndUpdate(
          userFilter,
          {
            $push: {
              deliveries: {
                deliveryId: delivery.delivery_id || new mongoose.Types.ObjectId().toString(),
                messageId: delivery.message_id || 'MSG_SIMULATED',
                eventId: delivery.event_id || null,
                channel: delivery.channel || 'IN_APP',
                status: delivery.status || 'SIMULATED',
                title: delivery.title || '',
                body: delivery.body || '',
                dispatchedAt: new Date(),
                details: delivery.details || {},
              },
            },
          }
        );
      } catch (err) {
        // Fallback
      }
    }

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
        delivery.channel || 'IN_APP',
        delivery.status || 'SIMULATED',
        delivery.provider_name || 'SYSTEM_MOCK',
        delivery.title,
        delivery.body,
        JSON.stringify(delivery.details || {}),
      ]);
      return res.rows[0] || null;
    } catch (err) {
      console.warn('Record notification delivery failed in DB:', err);
      return null;
    }
  },

  async getDeliveriesByUserId(userId: string, limit = 20): Promise<NotificationDeliveryRow[]> {
    if (isDatabaseConnected()) {
      try {
        const userFilter = mongoose.isValidObjectId(userId)
          ? { userId: new mongoose.Types.ObjectId(userId) }
          : { userId };
        const doc = await Notification.findOne(userFilter);
        if (doc && doc.deliveries) {
          return doc.deliveries
            .slice(-limit)
            .reverse()
            .map((d: any) => ({
              id: d.deliveryId,
              delivery_id: d.deliveryId,
              message_id: d.messageId,
              event_id: d.eventId || null,
              recipient_id: userId,
              channel: d.channel,
              status: d.status,
              provider_name: 'IN_APP',
              title: d.title,
              body: d.body,
              details: d.details || {},
              created_at: d.dispatchedAt || new Date(),
            }));
        }
      } catch (err) {
        // Fallback
      }
    }

    try {
      const res = await query<NotificationDeliveryRow>(
        'SELECT * FROM notification_deliveries WHERE recipient_id = $1 ORDER BY created_at DESC LIMIT $2',
        [userId, limit]
      );
      return res.rows;
    } catch {
      return [];
    }
  },
};
