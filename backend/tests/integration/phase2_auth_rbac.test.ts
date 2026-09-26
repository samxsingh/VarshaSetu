import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

describe('Phase 2 — MongoDB-Backed Express API Gateway & Authoritative RBAC', () => {
  let farmerToken: string;
  let officerToken: string;
  let govToken: string;
  let analystToken: string;
  let adminToken: string;
  let farmerRefreshToken: string;

  beforeAll(async () => {
    // Authenticate demo users across all 5 operational roles
    const farmerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ramesh.farmer@example.com', password: 'FarmerPassword123!' });
    farmerToken = farmerRes.body.data?.token;
    farmerRefreshToken = farmerRes.body.data?.refreshToken;

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

  describe('Response Envelope Standardization', () => {
    it('returns standardized envelope with meta.requestId and meta.timestamp', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('requestId');
      expect(res.body.meta).toHaveProperty('timestamp');
    });

    it('propagates X-Request-Id header in meta.requestId and headers', async () => {
      const customId = 'req-trace-test-12345';
      const res = await request(app)
        .get('/api/v1/health')
        .set('X-Request-Id', customId);
      expect(res.status).toBe(200);
      expect(res.body.meta.requestId).toBe(customId);
      expect(res.headers['x-request-id']).toBe(customId);
    });
  });

  describe('Authentication & Token Refresh Lifecycle', () => {
    it('rejects unauthenticated requests to protected endpoints with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code');
    });

    it('rejects invalid or malformed bearer token with 401', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-garbage-token');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects refresh request with missing token with 400', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects invalid refresh token with 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.token.signature' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('allows valid refresh token flow and generates fresh auth & refresh tokens', async () => {
      expect(farmerRefreshToken).toBeDefined();
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: farmerRefreshToken });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('ramesh.farmer@example.com');
    });
  });

  describe('Authoritative RBAC Boundaries Across 5 Roles', () => {
    it('FARMER: can access farmer endpoints, forbidden from admin endpoints (403)', async () => {
      const deniedRes = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(deniedRes.status).toBe(403);
      expect(deniedRes.body.success).toBe(false);

      const deniedAudit = await request(app)
        .get('/api/v1/audit/logs')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(deniedAudit.status).toBe(403);

      const allowedRes = await request(app)
        .get('/api/v1/farmer/profile')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(allowedRes.status).toBe(200);
      expect(allowedRes.body.data.message).toBe('Farmer role verified');
    });

    it('OFFICER: can access officer endpoints, forbidden from admin audit logs (403)', async () => {
      const deniedRes = await request(app)
        .get('/api/v1/audit/logs')
        .set('Authorization', `Bearer ${officerToken}`);
      expect(deniedRes.status).toBe(403);

      const allowedRes = await request(app)
        .get('/api/v1/officer/overview')
        .set('Authorization', `Bearer ${officerToken}`);
      expect(allowedRes.status).toBe(200);
      expect(allowedRes.body.data.message).toBe('Field Officer role verified');
    });

    it('GOVERNMENT: can access government endpoints, forbidden from admin endpoints (403)', async () => {
      const deniedRes = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${govToken}`);
      expect(deniedRes.status).toBe(403);

      const allowedRes = await request(app)
        .get('/api/v1/government/summary')
        .set('Authorization', `Bearer ${govToken}`);
      expect(allowedRes.status).toBe(200);
      expect(allowedRes.body.data.message).toBe('Government role verified');
    });

    it('ANALYST: can access analyst model inspect, forbidden from admin endpoints (403)', async () => {
      const deniedRes = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(deniedRes.status).toBe(403);

      const allowedRes = await request(app)
        .get('/api/v1/analyst/model-inspect')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(allowedRes.status).toBe(200);
      expect(allowedRes.body.data.message).toBe('Analyst role verified');
    });

    it('ADMIN: has superuser access to all operational role perspectives and audit logs', async () => {
      const adminRes = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);
      expect(adminRes.body.data.message).toBe('Admin access confirmed');

      const auditRes = await request(app)
        .get('/api/v1/audit/logs')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(auditRes.status).toBe(200);
      expect(auditRes.body.success).toBe(true);

      const analystCheck = await request(app)
        .get('/api/v1/analyst/model-inspect')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(analystCheck.status).toBe(200);

      const govCheck = await request(app)
        .get('/api/v1/government/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(govCheck.status).toBe(200);
    });
  });

  describe('Geography & Spatial Resolution Gateways', () => {
    it('GET /api/v1/geography/states returns list of states', async () => {
      const res = await request(app).get('/api/v1/geography/states');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/geography/resolve validates coordinate parameters', async () => {
      const res = await request(app).get('/api/v1/geography/resolve?lat=26.9749&lon=80.9276');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('coordinates');
    });

    it('GET /api/v1/geography/hierarchy/:id handles lookup and returns 404 for unknown', async () => {
      const res = await request(app).get('/api/v1/geography/hierarchy/UNKNOWN_BLOCK');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Data Health & Ingestion Observability', () => {
    it('GET /api/v1/ingestion/overview returns ingestion status summary', async () => {
      const res = await request(app).get('/api/v1/ingestion/overview');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalSources');
    });

    it('GET /api/v1/data-health/overview provides backwards-compatible access', async () => {
      const res = await request(app).get('/api/v1/data-health/overview');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Notifications Preferences & Dispatch Simulation', () => {
    it('GET /api/v1/notifications/preferences returns user preference config', async () => {
      const res = await request(app)
        .get('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('channels');
    });

    it('POST /api/v1/notifications/simulate-alert generates simulated dispatch', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/simulate-alert')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          event_type: 'HEAVY_RAIN_RISK',
          severity: 'WARNING',
          title: 'Heavy Rain Advisory',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('simulated', true);
      expect(res.body.data).toHaveProperty('deliveryId');
    });
  });
});
