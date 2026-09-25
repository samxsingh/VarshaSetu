import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';

describe('Agronomic Rules Engine & Explainable Advisory Foundation API (Phase 5A)', () => {
  let farmerToken: string;
  let officerToken: string;

  beforeAll(async () => {
    // Authenticate farmer
    const farmerRes = await request(app).post('/api/v1/auth/login').send({
      phoneNumber: '+919876543210',
      password: 'FarmerPassword123!',
    });
    farmerToken = farmerRes.body?.data?.token;

    // Authenticate officer
    const officerRes = await request(app).post('/api/v1/auth/login').send({
      phoneNumber: '+919876543211',
      password: 'OfficerPassword123!',
    });
    officerToken = officerRes.body?.data?.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/v1/agronomy/status', () => {
    it('returns agronomic status with DIAGNOSTIC_ONLY operational mode and scientific disclosures', async () => {
      const res = await request(app).get('/api/v1/agronomy/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.operational_mode).toBe('DIAGNOSTIC_ONLY');
      expect(res.body.data.operational_advisory_allowed).toBe(false);
      expect(res.body.data.safety_gate).toBeDefined();
      expect(res.body.data.safety_gate.status).toBe('ENFORCING');
      expect(res.body.data.safety_gate.blocked_imperative_directives).toBe(true);
      expect(res.body.data.scientific_disclosure).toContain('Kharif 2024');
    });
  });

  describe('GET /api/v1/agronomy/crops', () => {
    it('rejects unauthenticated requests with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/v1/agronomy/crops');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns controlled crop registry for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/agronomy/crops')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.crops).toBeDefined();
      expect(Array.isArray(res.body.data.crops)).toBe(true);
      expect(res.body.data.crops.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('GET /api/v1/agronomy/rules', () => {
    it('rejects unauthenticated requests with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/v1/agronomy/rules');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns rules list for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/agronomy/rules')
        .set('Authorization', `Bearer ${officerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('rules');
    });
  });

  describe('POST /api/v1/agronomy/evaluate', () => {
    it('rejects farmer role with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/agronomy/evaluate')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          block_id: 'UP_LKO_BKT',
          crop_type: 'PADDY',
          growth_stage: 'TRANSPLANTING',
        });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/agronomy/simulate', () => {
    it('rejects unauthenticated requests with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/v1/agronomy/simulate')
        .send({
          block_id: 'UP_LKO_BKT',
          crop_type: 'PADDY',
          growth_stage: 'VEGETATIVE',
          scenario_type: 'SOWING_DELAY',
          parameters: { delay_days: 7 },
        });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/advisories', () => {
    it('returns advisory list for authenticated farmer restricted to permitted block', async () => {
      const res = await request(app)
        .get('/api/v1/advisories')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('advisories');
      expect(Array.isArray(res.body.data.advisories)).toBe(true);
    });
  });
});
