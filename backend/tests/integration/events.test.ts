import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';

describe('Operational Events & Production Readiness API (Phase 4F)', () => {
  let farmerToken: string;
  let officerToken: string;
  let testEventId = 'ev_test_unit_01';

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

  describe('GET /api/v1/events', () => {
    it('rejects unauthenticated requests with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/v1/events');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns event list with standard envelope for authenticated farmer', async () => {
      const res = await request(app)
        .get('/api/v1/events')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_events');
      expect(res.body.data).toHaveProperty('events');
      expect(Array.isArray(res.body.data.events)).toBe(true);
    });
  });

  describe('POST /api/v1/events/detect', () => {
    it('rejects farmer role with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/events/detect')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ block_id: 'UP_LKO_BKT' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows officer role to trigger event detection and returns DIAGNOSTIC_ONLY status', async () => {
      const res = await request(app)
        .post('/api/v1/events/detect')
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ block_id: 'UP_LKO_BKT', cooldown_hours: 24 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('operational_status', 'DIAGNOSTIC_ONLY');
      expect(res.body.data).toHaveProperty('detected_events');
      expect(res.body.data).toHaveProperty('suppressed_count');

      if (res.body.data.detected_events && res.body.data.detected_events.length > 0) {
        testEventId = res.body.data.detected_events[0].event_id;
      }
    });
  });

  describe('POST /api/v1/events/:id/acknowledge & resolve', () => {
    it('rejects farmer attempting to acknowledge events with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${testEventId}/acknowledge`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ reason: 'Farmer acknowledgement not allowed' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('allows officer to acknowledge event', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${testEventId}/acknowledge`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ reason: 'Duty officer verified advisory bulletin' });
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.state).toBe('ACKNOWLEDGED');
      }
    });

    it('allows officer to resolve event', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${testEventId}/resolve`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ reason: 'Risk period elapsed cleanly' });
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.state).toBe('RESOLVED');
      }
    });
  });

  describe('GET /api/v1/notifications/status & preferences', () => {
    it('returns internal simulation status and confirms external carrier channels are not configured', async () => {
      const res = await request(app)
        .get('/api/v1/notifications/status')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('mode', 'INTERNAL_SIMULATION_ONLY');
      expect(res.body.data).toHaveProperty('external_channels_status', 'NOT_CONFIGURED');
    });

    it('retrieves user notification preferences', async () => {
      const res = await request(app)
        .get('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('enabled');
      expect(res.body.data).toHaveProperty('channels');
    });

    it('updates user notification preferences', async () => {
      const res = await request(app)
        .put('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          preferred_language: 'hi',
          minimum_severity: 'WARNING',
          enabled: true,
          channels: ['IN_APP'],
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.preferred_language).toBe('hi');
      expect(res.body.data.minimum_severity).toBe('WARNING');
    });
  });

  describe('GET /api/v1/operations/status', () => {
    it('returns system-wide operational monitoring report with historical data disclosures', async () => {
      const res = await request(app)
        .get('/api/v1/operations/status')
        .set('Authorization', `Bearer ${officerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('forecast_service_status');
      expect(res.body.data).toHaveProperty('data_freshness_status', 'HISTORICAL_ONLY');
      expect(res.body.data).toHaveProperty('validation_status', 'INSUFFICIENT_DATA');
      expect(res.body.data).toHaveProperty('delivery_status', 'INTERNAL_SIMULATION_ONLY');
      expect(res.body.data).toHaveProperty('scientific_disclosures');
      expect(Array.isArray(res.body.data.scientific_disclosures)).toBe(true);
    });
  });

  describe('POST /api/v1/forecasts/process-expiry', () => {
    it('executes idempotent expiry processing sweep', async () => {
      const res = await request(app).post('/api/v1/forecasts/process-expiry');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('processed_count');
      expect(res.body.data).toHaveProperty('expired_count');
      expect(res.body.data).toHaveProperty('message');
    });
  });
});
