import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';

describe('Forecasts API Integration Tests (Phase 4E Operational Forecast Stage)', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/v1/forecasts/status', () => {
    it('returns forecast engine status and diagnostic mode disclosure', async () => {
      const res = await request(app).get('/api/v1/forecasts/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('phase', 'PHASE_4E_OPERATIONAL_FORECAST_STAGE');
      expect(res.body.data).toHaveProperty('operational_forecast_allowed', false);
      expect(res.body.data).toHaveProperty('system_status', 'DIAGNOSTIC_ONLY');
      expect(res.body.data).toHaveProperty('scientific_disclosure');
    });
  });

  describe('GET /api/v1/forecasts/availability', () => {
    it('returns observational data freshness and feature completeness', async () => {
      const res = await request(app).get('/api/v1/forecasts/availability?block_id=UP_LKO_BKT');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('block_id', 'UP_LKO_BKT');
      expect(res.body.data).toHaveProperty('data_freshness');
      expect(res.body.data).toHaveProperty('features_available', 19);
      expect(res.body.data).toHaveProperty('feature_coverage_pct', 100.0);
      expect(res.body.data).toHaveProperty('operational_allowed', false);
    });
  });

  describe('GET /api/v1/forecasts/targets', () => {
    it('lists supported forecast target definitions without agronomic crop commands', async () => {
      const res = await request(app).get('/api/v1/forecasts/targets');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('targets');
      expect(Array.isArray(res.body.data.targets)).toBe(true);

      const targetTypes = res.body.data.targets.map((t: any) => t.target_type);
      expect(targetTypes).toContain('HEAVY_RAIN');
      expect(targetTypes).toContain('DRY_SPELL');
      expect(targetTypes).toContain('RAINFALL_AMOUNT');

      // Strict negative check: No agronomic command targets in Phase 4E!
      expect(targetTypes).not.toContain('SOW');
      expect(targetTypes).not.toContain('SPRAY');
      expect(targetTypes).not.toContain('IRRIGATE');
    });
  });

  describe('GET /api/v1/forecasts/horizons', () => {
    it('lists supported forecast lead horizons (1, 3, 7, 14, 21, 30 days)', async () => {
      const res = await request(app).get('/api/v1/forecasts/horizons');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('horizons');
      expect(Array.isArray(res.body.data.horizons)).toBe(true);

      const days = res.body.data.horizons.map((h: any) => h.horizon_days);
      expect(days).toEqual(expect.arrayContaining([1, 3, 7, 14, 21, 30]));
    });
  });

  describe('GET /api/v1/forecasts', () => {
    it('lists structured forecast records with location, model, and disclosures', async () => {
      const res = await request(app).get('/api/v1/forecasts?target=HEAVY_RAIN&horizon=7');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_forecasts');
      expect(res.body.data).toHaveProperty('forecasts');
      expect(Array.isArray(res.body.data.forecasts)).toBe(true);

      if (res.body.data.forecasts.length > 0) {
        const fc = res.body.data.forecasts[0];
        expect(fc).toHaveProperty('forecast_id');
        expect(fc).toHaveProperty('location');
        expect(fc.location).toHaveProperty('spatial_resolution', 'BLOCK');
        expect(fc).toHaveProperty('target');
        expect(fc).toHaveProperty('prediction');
        expect(fc).toHaveProperty('scientific_disclosure');
      }
    });
  });

  describe('GET /api/v1/forecasts/location/:blockId', () => {
    it('retrieves forecast portfolio for an administrative block', async () => {
      const res = await request(app).get('/api/v1/forecasts/location/UP_LKO_BKT');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('block_id', 'UP_LKO_BKT');
      expect(res.body.data).toHaveProperty('forecasts');
      expect(Array.isArray(res.body.data.forecasts)).toBe(true);
    });
  });

  describe('GET /api/v1/forecasts/history', () => {
    it('retrieves immutable forecast history records with verification statuses', async () => {
      const res = await request(app).get('/api/v1/forecasts/history?limit=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('history');
      expect(Array.isArray(res.body.data.history)).toBe(true);
      expect(res.body.data.history[0]).toHaveProperty('verification_status');
    });
  });

  describe('GET /api/v1/forecasts/:id/explanation', () => {
    it('returns SHAP feature attributions and deterministic explanation narrative', async () => {
      const res = await request(app).get('/api/v1/forecasts/fc_heavy_rain_7d_test/explanation');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('top_features');
      expect(res.body.data).toHaveProperty('deterministic_narrative');
      expect(res.body.data).toHaveProperty('scientific_limitations');
      expect(res.body.data.deterministic_narrative).not.toMatch(/sow|spray|irrigate/i);
    });
  });

  describe('GET /api/v1/forecasts/:id (404 Handling)', () => {
    it('returns 404 with standard error envelope when forecast is not found', async () => {
      const res = await request(app).get('/api/v1/forecasts/non_existent_forecast_id');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('code', 'FORECAST_NOT_FOUND');
    });
  });
});
