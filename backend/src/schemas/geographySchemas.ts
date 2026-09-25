import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
});

export const districtQuerySchema = paginationQuerySchema.extend({
  stateId: z.string().uuid().optional(),
});

export const blockQuerySchema = paginationQuerySchema.extend({
  districtId: z.string().uuid().optional(),
});

export const panchayatQuerySchema = paginationQuerySchema.extend({
  blockId: z.string().uuid().optional(),
});

export const villageQuerySchema = paginationQuerySchema.extend({
  panchayatId: z.string().uuid().optional(),
});

export const resolvePointQuerySchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lon: z.string().transform((val) => parseFloat(val)),
}).refine(
  (data) => !isNaN(data.lat) && data.lat >= -90 && data.lat <= 90,
  { message: 'Latitude must be between -90 and 90', path: ['lat'] }
).refine(
  (data) => !isNaN(data.lon) && data.lon >= -180 && data.lon <= 180,
  { message: 'Longitude must be between -180 and 180', path: ['lon'] }
);
