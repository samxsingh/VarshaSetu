import { query } from '../db/pool';

export interface StateRow {
  id: string;
  name: string;
  code: string;
  center_lat: number;
  center_lon: number;
  bbox?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface DistrictRow {
  id: string;
  state_id: string;
  name: string;
  code: string;
  center_lat: number;
  center_lon: number;
  bbox?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface BlockRow {
  id: string;
  district_id: string;
  name: string;
  code: string;
  center_lat: number;
  center_lon: number;
  bbox?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface PanchayatRow {
  id: string;
  block_id: string;
  name: string;
  code: string;
  center_lat: number;
  center_lon: number;
  bbox?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface VillageRow {
  id: string;
  panchayat_id: string;
  name: string;
  code: string;
  center_lat: number;
  center_lon: number;
  bbox?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface BoundaryRow {
  id: string;
  entity_id: string;
  level: string;
  geometry: any;
  geometry_type: string;
  source: string;
  source_version?: string;
  is_demo: boolean;
  area_sq_km?: number;
  created_at: Date;
  updated_at: Date;
}

export const geographyRepository = {
  async listStates(): Promise<StateRow[]> {
    const res = await query<StateRow>('SELECT * FROM states ORDER BY name ASC');
    return res.rows;
  },

  async getStateById(id: string): Promise<StateRow | null> {
    const res = await query<StateRow>('SELECT * FROM states WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async listDistricts(stateId?: string, limit = 50, offset = 0): Promise<{ rows: DistrictRow[]; total: number }> {
    let sql = 'SELECT * FROM districts';
    let countSql = 'SELECT COUNT(*) AS count FROM districts';
    const params: any[] = [];

    if (stateId) {
      params.push(stateId);
      sql += ' WHERE state_id = $1';
      countSql += ' WHERE state_id = $1';
    }

    const countRes = await query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    params.push(limit);
    params.push(offset);
    sql += ` ORDER BY name ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await query<DistrictRow>(sql, params);
    return { rows: res.rows, total };
  },

  async getDistrictById(id: string): Promise<DistrictRow | null> {
    const res = await query<DistrictRow>('SELECT * FROM districts WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async listBlocks(districtId?: string, limit = 50, offset = 0): Promise<{ rows: BlockRow[]; total: number }> {
    let sql = 'SELECT * FROM blocks';
    let countSql = 'SELECT COUNT(*) AS count FROM blocks';
    const params: any[] = [];

    if (districtId) {
      params.push(districtId);
      sql += ' WHERE district_id = $1';
      countSql += ' WHERE district_id = $1';
    }

    const countRes = await query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    params.push(limit);
    params.push(offset);
    sql += ` ORDER BY name ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await query<BlockRow>(sql, params);
    return { rows: res.rows, total };
  },

  async getBlockById(id: string): Promise<BlockRow | null> {
    const res = await query<BlockRow>('SELECT * FROM blocks WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async listPanchayats(blockId?: string, limit = 50, offset = 0): Promise<{ rows: PanchayatRow[]; total: number }> {
    let sql = 'SELECT * FROM gram_panchayats';
    let countSql = 'SELECT COUNT(*) AS count FROM gram_panchayats';
    const params: any[] = [];

    if (blockId) {
      params.push(blockId);
      sql += ' WHERE block_id = $1';
      countSql += ' WHERE block_id = $1';
    }

    const countRes = await query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    params.push(limit);
    params.push(offset);
    sql += ` ORDER BY name ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await query<PanchayatRow>(sql, params);
    return { rows: res.rows, total };
  },

  async getPanchayatById(id: string): Promise<PanchayatRow | null> {
    const res = await query<PanchayatRow>('SELECT * FROM gram_panchayats WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async listVillages(panchayatId?: string, limit = 50, offset = 0): Promise<{ rows: VillageRow[]; total: number }> {
    let sql = 'SELECT * FROM villages';
    let countSql = 'SELECT COUNT(*) AS count FROM villages';
    const params: any[] = [];

    if (panchayatId) {
      params.push(panchayatId);
      sql += ' WHERE panchayat_id = $1';
      countSql += ' WHERE panchayat_id = $1';
    }

    const countRes = await query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    params.push(limit);
    params.push(offset);
    sql += ` ORDER BY name ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await query<VillageRow>(sql, params);
    return { rows: res.rows, total };
  },

  async getVillageById(id: string): Promise<VillageRow | null> {
    const res = await query<VillageRow>('SELECT * FROM villages WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async findBoundaryByEntity(entityId: string, level: string): Promise<BoundaryRow | null> {
    const res = await query<BoundaryRow>(
      'SELECT * FROM geographic_boundaries WHERE entity_id = $1 AND level = $2 LIMIT 1',
      [entityId, level]
    );
    return res.rows[0] || null;
  },

  async findBoundaryContainingPoint(lon: number, lat: number): Promise<{ boundary: BoundaryRow; block?: BlockRow } | null> {
    const res = await query<any>(
      `SELECT gb.*, b.name AS block_name, b.code AS block_code, b.district_id, b.center_lat AS block_lat, b.center_lon AS block_lon
       FROM geographic_boundaries gb
       JOIN blocks b ON gb.entity_id = b.id
       WHERE ST_Contains(gb.geometry, ST_MakePoint($1, $2))
       LIMIT 1;`,
      [lon, lat]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      boundary: {
        id: row.id,
        entity_id: row.entity_id,
        level: row.level,
        geometry: row.geometry,
        geometry_type: row.geometry_type,
        source: row.source,
        source_version: row.source_version,
        is_demo: row.is_demo,
        area_sq_km: row.area_sq_km,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      block: {
        id: row.entity_id,
        district_id: row.district_id,
        name: row.block_name,
        code: row.block_code,
        center_lat: row.block_lat,
        center_lon: row.block_lon,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
    };
  },
};
