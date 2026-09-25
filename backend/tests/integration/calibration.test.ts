import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';

describe('Calibration API Integration Tests (Phase 4C Reliability Stage)', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/v1/models/calibration/status', () => {
    it('returns calibration operational readiness and guardrails disclosure', async () => {
      const res = await request(app).get('/api/v1/models/calibration/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('phase', 'PHASE_4C_CALIBRATION_STAGE');
      expect(res.body.data).toHaveProperty('calibration_status', 'INSUFFICIENT_DATA');
      expect(res.body.data).toHaveProperty('operational_calibration_active', false);
      expect(res.body.data).toHaveProperty('engineering_guardrails');
      expect(res.body.data.engineering_guardrails).toHaveProperty('min_calibration_samples', 100);
      expect(res.body.data.engineering_guardrails).toHaveProperty('min_calibration_years', 5);
      expect(res.body.data.message).toMatch(/Probabilistic calibration is INACTIVE/i);
    });
  });

  describe('GET /api/v1/models/calibration/comparison', () => {
    it('returns multi-model calibration comparison and data gate status', async () => {
      const res = await request(app).get(
        '/api/v1/models/calibration/comparison?target=HEAVY_RAIN&horizon_days=7&method=PLATT'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('data_gate');
      expect(res.body.data.data_gate).toHaveProperty('operational_calibration_allowed', false);
      expect(res.body.data).toHaveProperty('comparison');
      expect(Array.isArray(res.body.data.comparison)).toBe(true);
      expect(res.body.data.comparison.length).toBeGreaterThan(0);
      expect(res.body.data.comparison[0]).toHaveProperty('raw_brier');
      expect(res.body.data.comparison[0]).toHaveProperty('raw_ece');
    });
  });

  describe('GET /api/v1/models/calibration/:id/reliability', () => {
    it('returns reliability diagram bins and calibration errors', async () => {
      const res = await request(app).get('/api/v1/models/calibration/xgboost/reliability');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('model_id', 'xgboost');
      expect(res.body.data).toHaveProperty('bins');
      expect(Array.isArray(res.body.data.bins)).toBe(true);
      expect(res.body.data).toHaveProperty('expected_calibration_error');
      expect(res.body.data).toHaveProperty('maximum_calibration_error');
      expect(res.body.data).toHaveProperty('diagnostic_only', true);
    });
  });
});
