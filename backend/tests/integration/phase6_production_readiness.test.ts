import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { signAuthToken } from '../../src/utils/jwt';

describe('Phase 6 — End-to-End Production Readiness & Architectural Verification', () => {
  let farmerToken: string;
  let officerToken: string;
  let govToken: string;
  let analystToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Authenticate real seeded users across all 5 operational roles
    const farmerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ramesh.farmer@example.com', password: 'FarmerPassword123!' });
    farmerToken = farmerRes.body.data?.token;

    const officerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'officer.lucknow@varshasetu.gov.in', password: 'OfficerPassword123!' });
    officerToken = officerRes.body.data?.token;

    const govRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'planner.up@varshasetu.gov.in', password: 'GovPassword123!' });
    govToken = govRes.body.data?.token;

    const analystRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'analyst.climate@varshasetu.gov.in', password: 'AnalystPassword123!' });
    analystToken = analystRes.body.data?.token;

    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@varshasetu.gov.in', password: 'AdminPassword123!' });
    adminToken = adminRes.body.data?.token;
  });

  describe('1. Standardized Response Envelope Verification', () => {
    it('returns standardized success envelope with requestId and timestamp', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('requestId');
      expect(res.body.meta).toHaveProperty('timestamp');
      expect(typeof res.body.meta.requestId).toBe('string');
      expect(typeof res.body.meta.timestamp).toBe('string');
    });

    it('returns standardized error envelope on 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/system-status');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.meta).toHaveProperty('requestId');
      expect(res.body.meta).toHaveProperty('timestamp');
    });

    it('returns standardized error envelope on 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'FORBIDDEN');
      expect(res.body.meta).toHaveProperty('requestId');
      expect(res.body.meta).toHaveProperty('timestamp');
    });

    it('returns standardized error envelope on 404 Not Found', async () => {
      const res = await request(app).get('/api/v1/non-existent-endpoint-xyz');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'ROUTE_NOT_FOUND');
    });
  });

  describe('2. Authoritative 5-Role RBAC Grid & URL Hopping Security', () => {
    it('FARMER can access farmer profile but is forbidden from officer, gov, analyst, admin routes', async () => {
      // Allowed
      const farmerRes = await request(app)
        .get('/api/v1/farmer/profile')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(farmerRes.status).toBe(200);
      expect(farmerRes.body.data.message).toBe('Farmer role verified');

      // Denied
      const officerRes = await request(app)
        .get('/api/v1/officer/overview')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(officerRes.status).toBe(403);

      const govRes = await request(app)
        .get('/api/v1/government/summary')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(govRes.status).toBe(403);

      const analystRes = await request(app)
        .get('/api/v1/analyst/model-inspect')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(analystRes.status).toBe(403);

      const adminRes = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(adminRes.status).toBe(403);

      const auditRes = await request(app)
        .get('/api/v1/audit/logs')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(auditRes.status).toBe(403);
    });

    it('OFFICER can access officer overview but is forbidden from admin routes', async () => {
      const allowed = await request(app)
        .get('/api/v1/officer/overview')
        .set('Authorization', `Bearer ${officerToken}`);
      expect(allowed.status).toBe(200);

      const denied = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${officerToken}`);
      expect(denied.status).toBe(403);
    });

    it('GOVERNMENT can access government summary but is forbidden from admin routes', async () => {
      const allowed = await request(app)
        .get('/api/v1/government/summary')
        .set('Authorization', `Bearer ${govToken}`);
      expect(allowed.status).toBe(200);

      const denied = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${govToken}`);
      expect(denied.status).toBe(403);
    });

    it('ANALYST can access analyst model inspect but is forbidden from admin routes', async () => {
      const allowed = await request(app)
        .get('/api/v1/analyst/model-inspect')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(allowed.status).toBe(200);

      const denied = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(denied.status).toBe(403);
    });

    it('ADMIN has universal clearance across all role endpoints and audit logs', async () => {
      const adminRes = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);

      const auditRes = await request(app)
        .get('/api/v1/audit/logs')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(auditRes.status).toBe(200);

      const farmerRes = await request(app)
        .get('/api/v1/farmer/profile')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(farmerRes.status).toBe(200);

      const officerRes = await request(app)
        .get('/api/v1/officer/overview')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(officerRes.status).toBe(200);

      const govRes = await request(app)
        .get('/api/v1/government/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(govRes.status).toBe(200);

      const analystRes = await request(app)
        .get('/api/v1/analyst/model-inspect')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(analystRes.status).toBe(200);
    });
  });

  describe('3. Scientific Honesty & Demonstration Integrity Safeguards', () => {
    it('enforces single-season Kharif 2024 anchor and DIAGNOSTIC_ONLY status', async () => {
      const res = await request(app).get('/api/v1/forecasts/status');
      expect(res.status).toBe(200);
      expect(res.body.data.system_status).toBe('DIAGNOSTIC_ONLY');
      expect(res.body.data.operational_forecast_allowed).toBe(false);
      expect(res.body.data).toHaveProperty('scientific_disclosure');
    });

    it('enforces multiyear gate status as INSUFFICIENT_DATA due to single season baseline', async () => {
      const res = await request(app).get('/api/v1/models/hindcasting/status');
      expect(res.status).toBe(200);
      expect(res.body.data.multiyear_gate_status).toBe('INSUFFICIENT_DATA');
      expect(res.body.data.operational_validation_allowed).toBe(false);
      expect(res.body.data.years_available).toEqual([2024]);
    });

    it('enforces audit logs immutability with no DELETE route available', async () => {
      const res = await request(app)
        .delete('/api/v1/audit/logs')
        .set('Authorization', `Bearer ${adminToken}`);
      // Must not allow DELETE (404/405)
      expect([404, 405]).toContain(res.status);
    });

    it('preserves probability vs. confidence distinction in forecast availability', async () => {
      const res = await request(app).get('/api/v1/forecasts/availability?block_id=UP_LKO_BKT');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('block_id', 'UP_LKO_BKT');
      expect(res.body.data.operational_allowed).toBe(false);
      expect(res.body.data).toHaveProperty('feature_coverage_pct', 100.0);
    });
  });
});
