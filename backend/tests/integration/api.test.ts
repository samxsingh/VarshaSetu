import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';

describe('VarshaSetu Backend Core & Geospatial API Suite', () => {
  let farmerToken: string;
  let officerToken: string;
  let adminToken: string;
  let analystToken: string;

  beforeAll(async () => {
    // Authenticate demo users seeded during migration
    const farmerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ramesh.farmer@example.com', password: 'FarmerPassword123!' });
    farmerToken = farmerRes.body.data?.token;

    const officerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'officer.lucknow@varshasetu.gov.in', password: 'OfficerPassword123!' });
    officerToken = officerRes.body.data?.token;

    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@varshasetu.gov.in', password: 'AdminPassword123!' });
    adminToken = adminRes.body.data?.token;

    const analystRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'analyst.climate@varshasetu.gov.in', password: 'AnalystPassword123!' });
    analystToken = analystRes.body.data?.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  // 1. Health Endpoints
  describe('GET /api/v1/health', () => {
    it('returns 200 with standard application health envelope', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service).toBe('varshasetu-backend');
      expect(res.body.data.status).toBe('ok');
    });

    it('returns database health and PostGIS status', async () => {
      const res = await request(app).get('/api/v1/health/database');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.postgres).toBe(true);
      expect(res.body.data.postgis).toBe(true);
      expect(res.body.data.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  // 2. Geography Hierarchy & Spatial Queries
  describe('Geography Endpoints', () => {
    let stateId: string;
    let districtId: string;
    let blockId: string;
    let panchayatId: string;

    it('lists states with standard response envelope', async () => {
      const res = await request(app).get('/api/v1/geography/states');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      const up = res.body.data.find((s: any) => s.code === 'UP');
      expect(up).toBeDefined();
      expect(up.name).toBe('Uttar Pradesh');
      stateId = up.id;
    });

    it('lists districts with pagination metadata', async () => {
      const res = await request(app).get(`/api/v1/geography/districts?stateId=${stateId}&page=1&limit=10`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
      expect(res.body.meta.total).toBeGreaterThan(0);

      const lko = res.body.data.find((d: any) => d.code === 'UP_LKO');
      expect(lko).toBeDefined();
      expect(lko.name).toBe('Lucknow');
      districtId = lko.id;
    });

    it('lists blocks in Lucknow district', async () => {
      const res = await request(app).get(`/api/v1/geography/blocks?districtId=${districtId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(5); // 5 demo blocks: BKT, Malihabad, Mohanlalganj, Sarojininagar, Gosainganj
      const bkt = res.body.data.find((b: any) => b.code === 'UP_LKO_BKT');
      expect(bkt).toBeDefined();
      expect(bkt.name).toBe('Bakshi Ka Talab');
      blockId = bkt.id;
    });

    it('lists panchayats in Bakshi Ka Talab block', async () => {
      const res = await request(app).get(`/api/v1/geography/panchayats?blockId=${blockId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const bhaisamau = res.body.data.find((p: any) => p.name === 'Bhaisamau');
      expect(bhaisamau).toBeDefined();
      panchayatId = bhaisamau.id;
    });

    it('lists villages in Bhaisamau panchayat', async () => {
      const res = await request(app).get(`/api/v1/geography/villages?panchayatId=${panchayatId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].name).toContain('Bhaisamau');
    });

    it('executes spatial point-in-polygon resolution inside BKT boundary', async () => {
      // Coordinates inside Bakshi Ka Talab demo polygon: lat=26.9749, lon=80.9276
      const res = await request(app).get('/api/v1/geography/resolve-point?lat=26.9749&lon=80.9276');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matched).toBe(true);
      expect(res.body.data.boundaryAvailable).toBe(true);
      expect(res.body.data.block.name).toBe('Bakshi Ka Talab');
      expect(res.body.data.isDemoBoundary).toBe(true);
      expect(res.body.data.source).toContain('DEMO');
    });

    it('returns boundaryAvailable: false honestly when point is outside polygons', async () => {
      // Point in the Indian Ocean: lat=5.0, lon=75.0
      const res = await request(app).get('/api/v1/geography/resolve-point?lat=5.0&lon=75.0');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matched).toBe(false);
      expect(res.body.data.boundaryAvailable).toBe(false);
      expect(res.body.data.defaultDemoLocation).toBeDefined();
    });

    it('rejects invalid coordinates with 400 validation error', async () => {
      const res = await request(app).get('/api/v1/geography/resolve-point?lat=120&lon=80');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // 3. Authentication & Sessions
  describe('Authentication Endpoints', () => {
    it('authenticates user with phone and password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        phoneNumber: '+919876543210',
        password: 'FarmerPassword123!',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('FARMER');
      expect(res.body.data.user.fullName).toBe('Ramesh Kumar');
    });

    it('supports demo OTP for farmer role', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        phoneNumber: '+919876543210',
        otp: '123456',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('rejects incorrect password with 401 UNAUTHORIZED', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'ramesh.farmer@example.com',
        password: 'WrongPassword!',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('retrieves current authenticated user via /auth/me', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('ramesh.farmer@example.com');
      expect(res.body.data.role).toBe('FARMER');
    });

    it('rejects unauthenticated request to /auth/me with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('registers a new user successfully', async () => {
      const randomPhone = `+91981${Math.floor(1000000 + Math.random() * 9000000)}`;
      const res = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Test Field Worker',
        phoneNumber: randomPhone,
        email: `worker_${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        role: 'FARMER',
        preferredLanguage: 'hi',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.fullName).toBe('Test Field Worker');
    });

    it('rejects duplicate registration with 409 CONFLICT', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Duplicate Farmer',
        email: 'ramesh.farmer@example.com',
        password: 'SomePassword123!',
        role: 'FARMER',
      });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  // 4. Role-Based Access Control (RBAC) & Negative Authorization Paths
  describe('RBAC Authorization', () => {
    it('Farmer accessing admin endpoint is rejected with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Officer accessing admin endpoint is rejected with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${officerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Admin accessing admin endpoint is allowed with 200 OK', async () => {
      const res = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Admin access confirmed');
    });

    it('Analyst accessing model-inspect is allowed with 200 OK', async () => {
      const res = await request(app)
        .get('/api/v1/analyst/model-inspect')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.modelRegistryStatus).toBe('SHELL_ACTIVE_UNTRAINED');
    });

    it('Farmer accessing analyst endpoint is rejected with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/analyst/model-inspect')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // 5. 404 & Central Error Handling
  describe('Error Handling & 404s', () => {
    it('returns 404 with standard error envelope for undefined API routes', async () => {
      const res = await request(app).get('/api/v1/non-existent-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
    });

    it('rejects malformed JSON body with 400 MALFORMED_JSON', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ "email": "bad json without close');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MALFORMED_JSON');
    });
  });
});
