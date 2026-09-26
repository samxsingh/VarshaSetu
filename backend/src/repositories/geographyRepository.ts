import mongoose from 'mongoose';
import { query } from '../db/pool';
import { Geography, IGeography } from '../models/Geography';
import { isDatabaseConnected } from '../config/database';

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

function docToStateRow(doc: any): StateRow {
  return {
    id: (doc._id as any).toString(),
    name: doc.name,
    code: doc.code,
    center_lat: doc.center?.coordinates?.[1] || 0,
    center_lon: doc.center?.coordinates?.[0] || 0,
    bbox: doc.metadata?.bbox as any,
    created_at: doc.createdAt || new Date(),
    updated_at: doc.updatedAt || new Date(),
  };
}

function docToDistrictRow(doc: any): DistrictRow {
  return {
    id: (doc._id as any).toString(),
    state_id: doc.parentId ? doc.parentId.toString() : '',
    name: doc.name,
    code: doc.code,
    center_lat: doc.center?.coordinates?.[1] || 0,
    center_lon: doc.center?.coordinates?.[0] || 0,
    bbox: doc.metadata?.bbox as any,
    created_at: doc.createdAt || new Date(),
    updated_at: doc.updatedAt || new Date(),
  };
}

function docToBlockRow(doc: any): BlockRow {
  return {
    id: (doc._id as any).toString(),
    district_id: doc.parentId ? doc.parentId.toString() : '',
    name: doc.name,
    code: doc.code,
    center_lat: doc.center?.coordinates?.[1] || 0,
    center_lon: doc.center?.coordinates?.[0] || 0,
    bbox: doc.metadata?.bbox as any,
    created_at: doc.createdAt || new Date(),
    updated_at: doc.updatedAt || new Date(),
  };
}

function docToPanchayatRow(doc: any): PanchayatRow {
  return {
    id: (doc._id as any).toString(),
    block_id: doc.parentId ? doc.parentId.toString() : '',
    name: doc.name,
    code: doc.code,
    center_lat: doc.center?.coordinates?.[1] || 0,
    center_lon: doc.center?.coordinates?.[0] || 0,
    bbox: doc.metadata?.bbox as any,
    created_at: doc.createdAt || new Date(),
    updated_at: doc.updatedAt || new Date(),
  };
}

function docToVillageRow(doc: any): VillageRow {
  return {
    id: (doc._id as any).toString(),
    panchayat_id: doc.parentId ? doc.parentId.toString() : '',
    name: doc.name,
    code: doc.code,
    center_lat: doc.center?.coordinates?.[1] || 0,
    center_lon: doc.center?.coordinates?.[0] || 0,
    bbox: doc.metadata?.bbox as any,
    created_at: doc.createdAt || new Date(),
    updated_at: doc.updatedAt || new Date(),
  };
}

async function findGeoByEntity(id: string, level: string): Promise<any> {
  const query = mongoose.isValidObjectId(id)
    ? { _id: id, level }
    : { code: id, level };
  return Geography.findOne(query as any);
}

export const geographyRepository = {
  async listStates(): Promise<StateRow[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await Geography.find({ level: 'STATE' }).sort({ name: 1 });
        return docs.map(docToStateRow);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
    const res = await query<StateRow>('SELECT * FROM states ORDER BY name ASC');
    return res.rows;
  },

  async getStateById(id: string): Promise<StateRow | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await findGeoByEntity(id, 'STATE');
        if (doc) return docToStateRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
    try {
      const res = await query<StateRow>('SELECT * FROM states WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },

  async listDistricts(stateId?: string, limit = 50, offset = 0): Promise<{ rows: DistrictRow[]; total: number }> {
    if (isDatabaseConnected()) {
      try {
        const filter: any = { level: 'DISTRICT' };
        if (stateId) {
          if (mongoose.isValidObjectId(stateId)) {
            filter.parentId = stateId;
          } else {
            const state = await Geography.findOne({ code: stateId, level: 'STATE' } as any);
            if (state) filter.parentId = state._id;
          }
        }
        const total = await Geography.countDocuments(filter);
        const docs = await Geography.find(filter).sort({ name: 1 }).skip(offset).limit(limit);
        return { rows: docs.map(docToDistrictRow), total };
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
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
    if (isDatabaseConnected()) {
      try {
        const doc = await findGeoByEntity(id, 'DISTRICT');
        if (doc) return docToDistrictRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
    try {
      const res = await query<DistrictRow>('SELECT * FROM districts WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },

  async listBlocks(districtId?: string, limit = 50, offset = 0): Promise<{ rows: BlockRow[]; total: number }> {
    if (isDatabaseConnected()) {
      try {
        const filter: any = { level: 'BLOCK' };
        if (districtId) {
          if (mongoose.isValidObjectId(districtId)) {
            filter.parentId = districtId;
          } else {
            const dist = await Geography.findOne({ code: districtId, level: 'DISTRICT' } as any);
            if (dist) filter.parentId = dist._id;
          }
        }
        const total = await Geography.countDocuments(filter);
        const docs = await Geography.find(filter).sort({ name: 1 }).skip(offset).limit(limit);
        return { rows: docs.map(docToBlockRow), total };
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
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
    if (isDatabaseConnected()) {
      try {
        const doc = await findGeoByEntity(id, 'BLOCK');
        if (doc) return docToBlockRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
    try {
      const res = await query<BlockRow>('SELECT * FROM blocks WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },

  async listPanchayats(blockId?: string, limit = 50, offset = 0): Promise<{ rows: PanchayatRow[]; total: number }> {
    if (isDatabaseConnected()) {
      try {
        const filter: any = { level: 'PANCHAYAT' };
        if (blockId) {
          if (mongoose.isValidObjectId(blockId)) {
            filter.parentId = blockId;
          } else {
            const block = await Geography.findOne({ code: blockId, level: 'BLOCK' } as any);
            if (block) filter.parentId = block._id;
          }
        }
        const total = await Geography.countDocuments(filter);
        const docs = await Geography.find(filter).sort({ name: 1 }).skip(offset).limit(limit);
        return { rows: docs.map(docToPanchayatRow), total };
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
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
    if (isDatabaseConnected()) {
      try {
        const doc = await findGeoByEntity(id, 'PANCHAYAT');
        if (doc) return docToPanchayatRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
    try {
      const res = await query<PanchayatRow>('SELECT * FROM gram_panchayats WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },

  async listVillages(panchayatId?: string, limit = 50, offset = 0): Promise<{ rows: VillageRow[]; total: number }> {
    if (isDatabaseConnected()) {
      try {
        const filter: any = { level: 'VILLAGE' };
        if (panchayatId) {
          if (mongoose.isValidObjectId(panchayatId)) {
            filter.parentId = panchayatId;
          } else {
            const pan = await Geography.findOne({ code: panchayatId, level: 'PANCHAYAT' } as any);
            if (pan) filter.parentId = pan._id;
          }
        }
        const total = await Geography.countDocuments(filter);
        const docs = await Geography.find(filter).sort({ name: 1 }).skip(offset).limit(limit);
        return { rows: docs.map(docToVillageRow), total };
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
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
    if (isDatabaseConnected()) {
      try {
        const doc = await findGeoByEntity(id, 'VILLAGE');
        if (doc) return docToVillageRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
    try {
      const res = await query<VillageRow>('SELECT * FROM villages WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },

  async findBoundaryByEntity(entityId: string, level: string): Promise<BoundaryRow | null> {
    if (isDatabaseConnected()) {
      try {
        const geo: any = await findGeoByEntity(entityId, level);
        if (geo && geo.boundary) {
          return {
            id: (geo._id as any).toString(),
            entity_id: (geo._id as any).toString(),
            level: geo.level,
            geometry: geo.boundary,
            geometry_type: geo.boundary?.type || 'MultiPolygon',
            source: geo.source,
            source_version: geo.sourceVersion,
            is_demo: geo.isDemo,
            area_sq_km: geo.areaSqKm,
            created_at: geo.createdAt || new Date(),
            updated_at: geo.updatedAt || new Date(),
          };
        }
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }
    try {
      const res = await query<BoundaryRow>(
        'SELECT * FROM geographic_boundaries WHERE entity_id = $1 AND level = $2 LIMIT 1',
        [entityId, level]
      );
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },

  async findBoundaryContainingPoint(lon: number, lat: number): Promise<{ boundary: BoundaryRow; block?: BlockRow } | null> {
    if (isDatabaseConnected()) {
      try {
        const geo: any = await Geography.findOne({
          level: 'BLOCK',
          boundary: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: [lon, lat],
              },
            },
          },
        } as any);
        if (geo) {
          return {
            boundary: {
              id: (geo._id as any).toString(),
              entity_id: (geo._id as any).toString(),
              level: geo.level,
              geometry: geo.boundary,
              geometry_type: geo.boundary?.type || 'MultiPolygon',
              source: geo.source,
              source_version: geo.sourceVersion,
              is_demo: geo.isDemo,
              area_sq_km: geo.areaSqKm,
              created_at: geo.createdAt || new Date(),
              updated_at: geo.updatedAt || new Date(),
            },
            block: {
              id: (geo._id as any).toString(),
              district_id: geo.parentId ? geo.parentId.toString() : '',
              name: geo.name,
              code: geo.code,
              center_lat: geo.center?.coordinates?.[1] || 0,
              center_lon: geo.center?.coordinates?.[0] || 0,
              created_at: geo.createdAt || new Date(),
              updated_at: geo.updatedAt || new Date(),
            },
          };
        }
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

    try {
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
    } catch {
      return null;
    }
  },
};
