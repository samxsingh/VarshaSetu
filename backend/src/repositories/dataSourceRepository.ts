import { query } from '../db/pool';

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

export const dataSourceRepository = {
  async listAll(): Promise<DataSourceRow[]> {
    const res = await query<DataSourceRow>('SELECT * FROM data_sources ORDER BY provider, name');
    return res.rows;
  },

  async getById(id: string): Promise<DataSourceRow | null> {
    const res = await query<DataSourceRow>('SELECT * FROM data_sources WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
};
