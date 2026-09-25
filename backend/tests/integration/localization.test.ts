import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';

describe('Multilingual Advisory Delivery & Voice Accessibility API (Phase 5C)', () => {
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

  describe('GET /api/v1/advisories/languages', () => {
    it('returns supported languages with EN and HI', async () => {
      const res = await request(app).get('/api/v1/advisories/languages');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.supported_languages).toBeDefined();
      const codes = res.body.data.supported_languages.map((l: any) => l.code);
      expect(codes).toContain('EN');
      expect(codes).toContain('HI');
      expect(res.body.data.translation_engine).toContain('CONTROLLED');
    });
  });

  describe('GET /api/v1/advisories/terminology', () => {
    it('returns controlled terminology catalog', async () => {
      const res = await request(app).get('/api/v1/advisories/terminology');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.version).toBe('1.0.0');
    });
  });

  describe('POST /api/v1/advisories/localize', () => {
    it('localizes advisory payload into Hindi with safety gate validation', async () => {
      const sampleAdvisory = {
        advisory_id: 'ADV_TEST_INT_001',
        triggered_rules: ['AGRO_HEAVY_RAIN_INFO_001'],
        dedup_hash: '1234567890abcdef',
        confidence_status: 'HISTORICALLY_CALIBRATED',
        evidence: {
          target: 'HEAVY_RAIN',
          horizon_days: 7,
          probability: 0.45,
        },
      };

      const res = await request(app)
        .post('/api/v1/advisories/localize')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          advisory: sampleAdvisory,
          target_language: 'HI',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const loc = res.body.data.localized_advisory;
      expect(loc.language).toBe('HI');
      expect(loc.title).toContain('भारी वर्षा');
      expect(loc.classification).toBe('DIAGNOSTIC_ONLY');
      expect(loc.localization_fingerprint).toBeDefined();
    });
  });

  describe('POST /api/v1/advisories/:id/read', () => {
    it('records read receipt acknowledgement in PostgreSQL', async () => {
      const res = await request(app)
        .post('/api/v1/advisories/ADV_TEST_INT_001/read')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          language: 'HI',
          device_channel: 'WEB_PORTAL',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.receipt).toBeDefined();
      expect(res.body.data.receipt.advisory_id).toBe('ADV_TEST_INT_001');
      expect(res.body.data.receipt.language).toBe('HI');
    });
  });

  describe('GET /api/v1/voice/status', () => {
    it('returns voice subsystem status in DEMO_ONLY mode', async () => {
      const res = await request(app).get('/api/v1/voice/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.system_mode).toBe('DEMO_ONLY');
      expect(res.body.data.telecom_integration).toBe('DISABLED');
    });
  });
});
