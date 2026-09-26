import { query } from '../db/pool';
import { DataHealth, IDataHealth } from '../models/DataHealth';
import { isDatabaseConnected } from '../config/database';

export interface DataSourceRow {
  id: string;
  name: string;
  provider: string;
  type: string;
  base_url?: string;
  status: string;
  provenance_url?: string;
  update_frequency?: string;
  last_successful_sync?: Date;
  created_at: Date;
  updated_at: Date;
}

function docToSourceRow(doc: IDataHealth): DataSourceRow {
  const meta: any = doc.metadata || {};
  return {
    id: doc.sourceId,
    name: doc.name,
    provider: doc.provider,
    type: doc.type,
    base_url: doc.baseUrl,
    status: doc.status,
    provenance_url: meta.provenance_url || meta.provenanceUrl,
    update_frequency: doc.updateFrequency,
    last_successful_sync: doc.lastSuccessfulSync,
    created_at: doc.createdAt || new Date(),
    updated_at: doc.updatedAt || new Date(),
  };
}

export const dataSourceRepository = {
  async listAll(): Promise<DataSourceRow[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await DataHealth.find().sort({ provider: 1, name: 1 });
        if (docs.length > 0) {
          return docs.map(docToSourceRow);
        }
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
    const res = await query<DataSourceRow>('SELECT * FROM data_sources ORDER BY provider, name');
    return res.rows;
  },

  async getById(id: string): Promise<DataSourceRow | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await DataHealth.findOne({ sourceId: id });
        if (doc) return docToSourceRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
    const res = await query<DataSourceRow>('SELECT * FROM data_sources WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
};
