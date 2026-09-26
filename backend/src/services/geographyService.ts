import { geographyRepository, StateRow, DistrictRow, BlockRow, PanchayatRow, VillageRow } from '../repositories/geographyRepository';
import { NotFoundError } from '../utils/errors';
import {
  StateEntity,
  DistrictEntity,
  BlockEntity,
  PanchayatEntity,
  VillageEntity,
  DefaultDemoLocationConfig,
} from '@shared/types';
import { env } from '../config/env';

function toStateEntity(row: StateRow): StateEntity {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    level: 'STATE',
    stateCode: row.code,
    centerCoordinates: {
      latitude: row.center_lat,
      longitude: row.center_lon,
    },
    bbox: row.bbox as any,
  };
}

function toDistrictEntity(row: DistrictRow): DistrictEntity {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    level: 'DISTRICT',
    stateId: row.state_id,
    districtCode: row.code,
    centerCoordinates: {
      latitude: row.center_lat,
      longitude: row.center_lon,
    },
    bbox: row.bbox as any,
  };
}

function toBlockEntity(row: BlockRow): BlockEntity {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    level: 'BLOCK',
    districtId: row.district_id,
    blockCode: row.code,
    centerCoordinates: {
      latitude: row.center_lat,
      longitude: row.center_lon,
    },
    bbox: row.bbox as any,
  };
}

function toPanchayatEntity(row: PanchayatRow): PanchayatEntity {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    level: 'PANCHAYAT',
    blockId: row.block_id,
    panchayatCode: row.code,
    centerCoordinates: {
      latitude: row.center_lat,
      longitude: row.center_lon,
    },
    bbox: row.bbox as any,
  };
}

function toVillageEntity(row: VillageRow): VillageEntity {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    level: 'VILLAGE',
    panchayatId: row.panchayat_id,
    villageCode: row.code,
    centerCoordinates: {
      latitude: row.center_lat,
      longitude: row.center_lon,
    },
    bbox: row.bbox as any,
  };
}

export const geographyService = {
  async getStates(): Promise<StateEntity[]> {
    const rows = await geographyRepository.listStates();
    return rows.map(toStateEntity);
  },

  async getState(id: string): Promise<StateEntity> {
    const row = await geographyRepository.getStateById(id);
    if (!row) throw new NotFoundError(`State with ID ${id} not found`);
    return toStateEntity(row);
  },

  async getDistricts(stateId?: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const { rows, total } = await geographyRepository.listDistricts(stateId, limit, offset);
    return {
      districts: rows.map(toDistrictEntity),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getDistrict(id: string): Promise<DistrictEntity> {
    const row = await geographyRepository.getDistrictById(id);
    if (!row) throw new NotFoundError(`District with ID ${id} not found`);
    return toDistrictEntity(row);
  },

  async getBlocks(districtId?: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const { rows, total } = await geographyRepository.listBlocks(districtId, limit, offset);
    return {
      blocks: rows.map(toBlockEntity),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getBlock(id: string): Promise<BlockEntity> {
    const row = await geographyRepository.getBlockById(id);
    if (!row) throw new NotFoundError(`Block with ID ${id} not found`);
    return toBlockEntity(row);
  },

  async getPanchayats(blockId?: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const { rows, total } = await geographyRepository.listPanchayats(blockId, limit, offset);
    return {
      panchayats: rows.map(toPanchayatEntity),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getPanchayat(id: string): Promise<PanchayatEntity> {
    const row = await geographyRepository.getPanchayatById(id);
    if (!row) throw new NotFoundError(`Panchayat with ID ${id} not found`);
    return toPanchayatEntity(row);
  },

  async getVillages(panchayatId?: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const { rows, total } = await geographyRepository.listVillages(panchayatId, limit, offset);
    return {
      villages: rows.map(toVillageEntity),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getVillage(id: string): Promise<VillageEntity> {
    const row = await geographyRepository.getVillageById(id);
    if (!row) throw new NotFoundError(`Village with ID ${id} not found`);
    return toVillageEntity(row);
  },

  async resolvePoint(lat: number, lon: number) {
    // Spatial point-in-polygon lookup
    const result = await geographyRepository.findBoundaryContainingPoint(lon, lat);

    if (result && result.block) {
      const blockEntity = toBlockEntity(result.block);
      return {
        matched: true,
        boundaryAvailable: true,
        isDemoBoundary: result.boundary.is_demo,
        source: result.boundary.source,
        sourceVersion: result.boundary.source_version,
        block: blockEntity,
        coordinates: { latitude: lat, longitude: lon },
      };
    }

    // Default demo location fallback when point is outside seeded polygons
    const defaultDemoLocation: DefaultDemoLocationConfig = {
      state: env.DEFAULT_DEMO_STATE,
      district: env.DEFAULT_DEMO_DISTRICT,
      block: env.DEFAULT_DEMO_BLOCK,
      latitude: env.DEFAULT_DEMO_LATITUDE,
      longitude: env.DEFAULT_DEMO_LONGITUDE,
    };

    return {
      matched: false,
      boundaryAvailable: false,
      message: 'No authoritative or demo boundary contains these coordinates.',
      coordinates: { latitude: lat, longitude: lon },
      defaultDemoLocation,
    };
  },

  async getHierarchy(id: string) {
    let villageRow = await geographyRepository.getVillageById(id);
    let panchayatRow = villageRow ? (villageRow.panchayat_id ? await geographyRepository.getPanchayatById(villageRow.panchayat_id) : null) : await geographyRepository.getPanchayatById(id);
    let blockRow = panchayatRow ? (panchayatRow.block_id ? await geographyRepository.getBlockById(panchayatRow.block_id) : null) : await geographyRepository.getBlockById(id);
    let districtRow = blockRow ? (blockRow.district_id ? await geographyRepository.getDistrictById(blockRow.district_id) : null) : await geographyRepository.getDistrictById(id);
    let stateRow = districtRow ? (districtRow.state_id ? await geographyRepository.getStateById(districtRow.state_id) : null) : await geographyRepository.getStateById(id);

    if (!villageRow && !panchayatRow && !blockRow && !districtRow && !stateRow) {
      throw new NotFoundError(`Geographic entity with ID ${id} not found in hierarchy`);
    }

    return {
      entityId: id,
      hierarchy: {
        state: stateRow ? toStateEntity(stateRow) : null,
        district: districtRow ? toDistrictEntity(districtRow) : null,
        block: blockRow ? toBlockEntity(blockRow) : null,
        panchayat: panchayatRow ? toPanchayatEntity(panchayatRow) : null,
        village: villageRow ? toVillageEntity(villageRow) : null,
      },
    };
  },
};
