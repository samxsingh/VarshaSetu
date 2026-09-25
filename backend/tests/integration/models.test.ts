import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';

describe('Models API Integration Tests (Phase 4A Baseline Stage)', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/v1/models/status', () => {
    it('returns model readiness status with Phase 4A baseline disclosure', async () => {
      const res = await request(app).get('/api/v1/models/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('phase', 'PHASE_4A_BASELINE_STAGE');
      expect(res.body.data).toHaveProperty('operational_inference_available', false);
      expect(res.body.data.active_baselines).toBeInstanceOf(Array);
      expect(res.body.data.message).toMatch(/Phase 4A baseline/i);
    });
  });

  describe('GET /api/v1/models/experiments', () => {
    it('returns experiment registry list', async () => {
      const res = await request(app).get('/api/v1/models/experiments');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('experiments');
      expect(Array.isArray(res.body.data.experiments)).toBe(true);
    });
  });
});
