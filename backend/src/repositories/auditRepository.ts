import { query } from '../db/pool';

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

export const auditRepository = {
  async log(entry: {
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<AuditLogRow> {
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
    const countRes = await query<{ count: string }>('SELECT COUNT(*) AS count FROM audit_logs');
    const total = parseInt(countRes.rows[0]?.count || '0', 10);
    const res = await query<AuditLogRow>(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return { rows: res.rows, total };
  },
};
