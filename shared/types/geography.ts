/**
 * VarshaSetu - Geographic Hierarchy & Spatial Types
 * Administrative hierarchy: India -> State -> District -> Block -> Panchayat -> Village
 */

export type AdministrativeLevel =
  | 'COUNTRY'
  | 'STATE'
  | 'DISTRICT'
  | 'BLOCK'
  | 'PANCHAYAT'
  | 'VILLAGE';

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
}

export interface BoundingBox {
  minLatitude: number;
  minLongitude: number;
  maxLatitude: number;
  maxLongitude: number;
}

export interface GeographicHierarchyNode {
  id: string;
  code: string; // Official LGD (Local Government Directory) code or Census code
  name: string;
  level: AdministrativeLevel;
  parentId?: string;
  centerCoordinates: Coordinates;
  bbox?: BoundingBox;
}

export interface StateEntity extends GeographicHierarchyNode {
  level: 'STATE';
  stateCode: string;
}

export interface DistrictEntity extends GeographicHierarchyNode {
  level: 'DISTRICT';
  stateId: string;
  districtCode: string;
}

export interface BlockEntity extends GeographicHierarchyNode {
  level: 'BLOCK';
  districtId: string;
  blockCode: string;
}

export interface PanchayatEntity extends GeographicHierarchyNode {
  level: 'PANCHAYAT';
  blockId: string;
  panchayatCode: string;
}

export interface VillageEntity extends GeographicHierarchyNode {
  level: 'VILLAGE';
  panchayatId: string;
  villageCode: string;
}

export interface GeographicBoundaryGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

export interface GeographicBoundaryFeature {
  type: 'Feature';
  id: string;
  geometry: GeographicBoundaryGeometry;
  properties: {
    entityId: string;
    level: AdministrativeLevel;
    name: string;
    code: string;
    areaSqKm?: number;
    isDemo: boolean;
  };
}

export interface DefaultDemoLocationConfig {
  state: string;
  district: string;
  block: string;
  panchayat?: string;
  latitude: number;
  longitude: number;
}
