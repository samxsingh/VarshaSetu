import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';

describe('Data Health & Ingestion API Integration Tests', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/v1/data-health', () => {
    it('returns data health overview with status 200', async () => {
      const res = await request(app).get('/api/v1/data-health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalSources');
      expect(res.body.data).toHaveProperty('freshSources');
      expect(res.body.data).toHaveProperty('totalRuns');
      expect(res.body.data).toHaveProperty('successfulRuns');
      expect(res.body.data).toHaveProperty('overallHealth');
      expect(['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'NO_DATA']).toContain(res.body.data.overallHealth);
    });
  });

  describe('GET /api/v1/data-health/sources', () => {
    it('returns configured scientific data sources', async () => {
      const res = await request(app).get('/api/v1/data-health/sources');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const providers = res.body.data.map((s: any) => s.provider);
      expect(providers).toContain('NOAA_CPC');
      expect(providers).toContain('BOM_AUSTRALIA');
    });
  });

  describe('GET /api/v1/data-health/runs', () => {
    it('returns paginated ingestion runs', async () => {
      const res = await request(app).get('/api/v1/data-health/runs?limit=10&offset=0');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('runs');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.runs)).toBe(true);
      expect(res.body.data.pagination.limit).toBe(10);
      expect(res.body.data.pagination.offset).toBe(0);
    });
  });

  describe('GET /api/v1/data-health/runs/:id', () => {
    it('returns 404 for nonexistent run ID', async () => {
      const res = await request(app).get('/api/v1/data-health/runs/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INGESTION_RUN_NOT_FOUND');
    });

    it('returns run details and quality reports for a valid run', async () => {
      // Fetch the latest run first
      const listRes = await request(app).get('/api/v1/data-health/runs?limit=1');
      if (listRes.body.data.runs.length > 0) {
        const runId = listRes.body.data.runs[0].id;
        const res = await request(app).get(`/api/v1/data-health/runs/${runId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.run.id).toBe(runId);
        expect(res.body.data).toHaveProperty('qualityReports');
        expect(Array.isArray(res.body.data.qualityReports)).toBe(true);
      }
    });
  });
});
