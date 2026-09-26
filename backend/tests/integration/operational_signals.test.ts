import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

describe('Phase 7A — Operational Intelligence Signals Integration Tests', () => {
  let farmerToken: string;
  let officerToken: string;
  let govToken: string;
  let analystToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Authenticate real seeded users across operational roles
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

  describe('1. Authentication & Standardized Response Envelope', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/operations/signals');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 200 with standard envelope for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/operations/signals')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('requestId');
      expect(res.body.meta).toHaveProperty('timestamp');
    });
  });

  describe('2. Server-side RBAC & Geography Derivation', () => {
    it('restricts Farmer strictly to their assigned operational block (UP_LKO_BKT)', async () => {
      // 1. Farmer requesting without blockId gets assigned block signals
      const resAllowed = await request(app)
        .get('/api/v1/operations/signals')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(resAllowed.status).toBe(200);
      const items = resAllowed.body.data.items;
      items.forEach((item: any) => {
        expect(item.blockId).toBe('UP_LKO_BKT');
      });

      // 2. Farmer requesting unauthorized block gets 403 Forbidden
      const resForbidden = await request(app)
        .get('/api/v1/operations/signals?blockId=UP_LKO_MAL')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(resForbidden.status).toBe(403);
      expect(resForbidden.body.success).toBe(false);
      expect(resForbidden.body.error.code).toBe('FORBIDDEN');
    });

    it('restricts Field Officer to their assigned jurisdiction block', async () => {
      const resForbidden = await request(app)
        .get('/api/v1/operations/signals?blockId=UP_KAN_KLP')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(resForbidden.status).toBe(403);
      expect(resForbidden.body.success).toBe(false);
      expect(resForbidden.body.error.code).toBe('FORBIDDEN');
    });

    it('allows Admin universal clearance across any block', async () => {
      const resAdmin = await request(app)
        .get('/api/v1/operations/signals?blockId=UP_LKO_BKT')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resAdmin.status).toBe(200);
      expect(resAdmin.body.success).toBe(true);
    });
  });

  describe('3. Query Filtering & Deterministic Ordering', () => {
    it('filters signals by severity (WARNING)', async () => {
      const res = await request(app)
        .get('/api/v1/operations/signals?severity=WARNING')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const items = res.body.data.items;
      items.forEach((item: any) => {
        expect(item.severity).toBe('WARNING');
      });
    });

    it('filters signals by signalType (OPERATIONAL_GATE)', async () => {
      const res = await request(app)
        .get('/api/v1/operations/signals?signalType=OPERATIONAL_GATE')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      const items = res.body.data.items;
      expect(items.length).toBeGreaterThan(0);
      items.forEach((item: any) => {
        expect(item.signalType).toBe('OPERATIONAL_GATE');
      });
    });

    it('maintains deterministic sorting by severity weight and timestamp', async () => {
      const res = await request(app)
        .get('/api/v1/operations/signals')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      const items = res.body.data.items;
      const weight: Record<string, number> = { CRITICAL: 4, WARNING: 3, WATCH: 2, INFO: 1 };

      for (let i = 0; i < items.length - 1; i++) {
        const wA = weight[items[i].severity] || 0;
        const wB = weight[items[i + 1].severity] || 0;
        expect(wA).toBeGreaterThanOrEqual(wB);
      }
    });
  });

  describe('4. Scientific Safeguards & Gating Semantics', () => {
    it('enforces DIAGNOSTIC_ONLY operationalStatus and INSUFFICIENT_DATA validation gate', async () => {
      const res = await request(app)
        .get('/api/v1/operations/signals?signalType=OPERATIONAL_GATE')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      const items = res.body.data.items;
      const hindcastGate = items.find((s: any) => s.signalId === 'sig_gate_multiyear_hindcast_insufficient');
      expect(hindcastGate).toBeDefined();
      expect(hindcastGate.operationalStatus).toBe('DIAGNOSTIC_ONLY');
      expect(hindcastGate.validationStatus).toBe('INSUFFICIENT_DATA');
      expect(hindcastGate.confidenceStatus).toBe('PASS');
      expect(hindcastGate.probability).toBeNull();
    });

    it('returns NOT AVAILABLE for probability on deterministic gate signals without fabrication', async () => {
      const res = await request(app)
        .get('/api/v1/operations/signals')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const items = res.body.data.items;
      const gateSignal = items.find((s: any) => s.signalType === 'OPERATIONAL_GATE');
      if (gateSignal) {
        expect(gateSignal.probability).toBeNull();
      }
    });

    it('filters out internal MODEL_STATUS signals from Farmer perspective', async () => {
      const res = await request(app)
        .get('/api/v1/operations/signals')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      const items = res.body.data.items;
      const modelStatus = items.find((s: any) => s.signalType === 'MODEL_STATUS');
      expect(modelStatus).toBeUndefined();
    });
  });
});
