import { Router } from 'express';
import { geographyController } from '../controllers/geographyController';
import { validateRequest } from '../middleware/validateMiddleware';
import {
  districtQuerySchema,
  blockQuerySchema,
  panchayatQuerySchema,
  villageQuerySchema,
  resolvePointQuerySchema,
} from '../schemas/geographySchemas';
import { asyncHandler } from '../utils/asyncHandler';

export const geographyRoutes = Router();

// States
geographyRoutes.get('/states', asyncHandler(geographyController.getStates as any));
geographyRoutes.get('/states/:id', asyncHandler(geographyController.getState as any));

// Districts
geographyRoutes.get('/districts', validateRequest({ query: districtQuerySchema }), asyncHandler(geographyController.getDistricts as any));
geographyRoutes.get('/districts/:id', asyncHandler(geographyController.getDistrict as any));

// Blocks
geographyRoutes.get('/blocks', validateRequest({ query: blockQuerySchema }), asyncHandler(geographyController.getBlocks as any));
geographyRoutes.get('/blocks/:id', asyncHandler(geographyController.getBlock as any));

// Panchayats
geographyRoutes.get('/panchayats', validateRequest({ query: panchayatQuerySchema }), asyncHandler(geographyController.getPanchayats as any));
geographyRoutes.get('/panchayats/:id', asyncHandler(geographyController.getPanchayat as any));

// Villages
geographyRoutes.get('/villages', validateRequest({ query: villageQuerySchema }), asyncHandler(geographyController.getVillages as any));
geographyRoutes.get('/villages/:id', asyncHandler(geographyController.getVillage as any));

// Spatial point-in-polygon resolution
geographyRoutes.get('/resolve-point', validateRequest({ query: resolvePointQuerySchema }), asyncHandler(geographyController.resolvePoint as any));
geographyRoutes.get('/resolve', validateRequest({ query: resolvePointQuerySchema }), asyncHandler(geographyController.resolvePoint as any));

// Geographic hierarchy chain resolution
geographyRoutes.get('/hierarchy/:id', asyncHandler(geographyController.getHierarchy as any));
