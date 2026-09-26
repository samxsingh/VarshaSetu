import { query } from '../db/pool';
import { AuditLog, IAuditLog } from '../models/AuditLog';
import { isDatabaseConnected } from '../config/database';

export interface AuditLogRow {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: Date;
}

function docToAuditRow(doc: IAuditLog): AuditLogRow {
  return {
    id: (doc._id as any).toString(),
    user_id: doc.actor !== 'SYSTEM' ? doc.actor : undefined,
    action: doc.action,
    resource_type: doc.resource,
    resource_id: doc.resourceId || undefined,
    metadata: doc.metadata,
    ip_address: doc.ipAddress || undefined,
    created_at: doc.createdAt || new Date(),
  };
}

export const auditRepository = {
  async log(entry: {
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<AuditLogRow> {
    if (isDatabaseConnected()) {
      try {
        const doc = await AuditLog.create({
          actor: entry.userId || 'SYSTEM',
          role: 'SYSTEM',
          action: entry.action,
          resource: entry.resourceType,
          resourceId: entry.resourceId || undefined,
          metadata: entry.metadata || {},
          ipAddress: entry.ipAddress || undefined,
        });
        return docToAuditRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

    const res = await query<AuditLogRow>(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        entry.userId || null,
        entry.action,
        entry.resourceType,
        entry.resourceId || null,
        JSON.stringify(entry.metadata || {}),
        entry.ipAddress || null,
      ]
    );
    return res.rows[0];
  },

  async list(limit = 50, offset = 0): Promise<{ rows: AuditLogRow[]; total: number }> {
    if (isDatabaseConnected()) {
      try {
        const total = await AuditLog.countDocuments();
        const docs = await AuditLog.find().sort({ createdAt: -1 }).skip(offset).limit(limit);
        return { rows: docs.map(docToAuditRow), total };
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

    const countRes = await query<{ count: string }>('SELECT COUNT(*) AS count FROM audit_logs');
    const total = parseInt(countRes.rows[0]?.count || '0', 10);
    const res = await query<AuditLogRow>(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return { rows: res.rows, total };
  },
};
