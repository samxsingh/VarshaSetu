import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';

describe('Advanced What-If Scenario Analysis & Sensitivity Engine API (Phase 5B)', () => {
  let farmerToken: string;

  beforeAll(async () => {
    // Authenticate farmer
    const farmerRes = await request(app).post('/api/v1/auth/login').send({
      phoneNumber: '+919876543210',
      password: 'FarmerPassword123!',
    });
    farmerToken = farmerRes.body?.data?.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/v1/agronomy/scenario-registry', () => {
    it('returns the controlled scenario registry with 6 types and classification SCENARIO_INDICATOR_ONLY', async () => {
      const res = await request(app).get('/api/v1/agronomy/scenario-registry');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.classification).toBe('SCENARIO_INDICATOR_ONLY');
      expect(res.body.data.total_scenario_types).toBe(6);
      expect(res.body.data.registry).toBeDefined();
      expect(res.body.data.registry.length).toBe(6);
      const types = res.body.data.registry.map((r: any) => r.scenario_type);
      expect(types).toContain('SOWING_DELAY');
      expect(types).toContain('IRRIGATION_INTERVENTION');
      expect(types).toContain('SEASONAL_ANOMALY');
      expect(types).toContain('RAINFALL_TIMING_SHIFT');
      expect(types).toContain('HEAVY_RAIN_CONCENTRATION');
      expect(types).toContain('COMBINED_SCENARIO');
    });
  });

  describe('POST /api/v1/agronomy/scenarios/run', () => {
    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app).post('/api/v1/agronomy/scenarios/run').send({
        scenario_type: 'SOWING_DELAY',
        delay_days: 7,
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('successfully runs a SOWING_DELAY scenario and returns deltas and envelopes', async () => {
      const res = await request(app)
        .post('/api/v1/agronomy/scenarios/run')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          scenario_type: 'SOWING_DELAY',
          delay_days: 7,
          crop: 'PADDY',
          crop_stage: 'VEGETATIVE',
          block_id: 'UP_LKO_BKT',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.scenario_id).toBeDefined();
      expect(data.classification).toBe('SCENARIO_INDICATOR_ONLY');
      expect(data.deltas).toBeDefined();
      expect(data.deltas.length).toBeGreaterThan(0);
      expect(data.envelope).toBeDefined();
      expect(data.explanation).toBeDefined();
      expect(data.provenance).toBeDefined();
      expect(data.scientific_disclaimer).toContain('NOT predict crop yields');
    });

    it('blocks out-of-bounds parameters via safety gate with 422', async () => {
      const res = await request(app)
        .post('/api/v1/agronomy/scenarios/run')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          scenario_type: 'SOWING_DELAY',
          delay_days: 40, // Exceeds max 21 days
          crop: 'PADDY',
          crop_stage: 'VEGETATIVE',
          block_id: 'UP_LKO_BKT',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Safety gate blocked scenario');
    });
  });

  describe('POST /api/v1/agronomy/scenarios/compare', () => {
    it('returns baseline vs scenario comparative report', async () => {
      const res = await request(app)
        .post('/api/v1/agronomy/scenarios/compare')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          scenario_type: 'SEASONAL_ANOMALY',
          rainfall_anomaly_pct: -20.0,
          crop: 'PADDY',
          crop_stage: 'VEGETATIVE',
          block_id: 'UP_LKO_BKT',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.baseline_reference).toBe('Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)');
      expect(data.deltas).toBeDefined();
      expect(data.deltas.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/agronomy/scenarios/sensitivity', () => {
    it('returns deterministic parameter response curve data', async () => {
      const res = await request(app)
        .post('/api/v1/agronomy/scenarios/sensitivity')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          scenario_type: 'SOWING_DELAY',
          delay_days: 7,
          crop: 'PADDY',
          crop_stage: 'VEGETATIVE',
          block_id: 'UP_LKO_BKT',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.parameter_name).toBe('delay_days');
      expect(data.curve_points).toBeDefined();
      expect(data.curve_points.length).toBeGreaterThan(0);
    });
  });
});
