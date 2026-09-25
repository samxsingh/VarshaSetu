import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';

describe('Models API Integration Tests (Phase 4B Tree Downscaling Stage)', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/v1/models/status', () => {
    it('returns model readiness status with Phase 4B operational disclosure', async () => {
      const res = await request(app).get('/api/v1/models/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('phase', 'PHASE_4B_OPERATIONAL_DOWNSCALING_STAGE');
      expect(res.body.data).toHaveProperty('spatial_resolution_supported', 'BLOCK');
      expect(res.body.data).toHaveProperty('data_availability_status', 'PARTIAL');
      expect(res.body.data.supported_model_families).toBeInstanceOf(Array);
      expect(res.body.data.supported_model_families).toContain('XGBoost Gradient Boosted Trees');
      expect(res.body.data.supported_model_families).toContain('LightGBM Gradient Boosted Trees');
    });
  });

  describe('GET /api/v1/models/registry', () => {
    it('returns registered models list with task types', async () => {
      const res = await request(app).get('/api/v1/models/registry');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('models');
      expect(Array.isArray(res.body.data.models)).toBe(true);
      expect(res.body.data.models.length).toBeGreaterThan(0);
      expect(res.body.data.models[0]).toHaveProperty('model_type');
    });
  });

  describe('GET /api/v1/models/comparison', () => {
    it('returns multi-model benchmark report comparing all 4 families', async () => {
      const res = await request(app).get('/api/v1/models/comparison?target=HEAVY_RAIN&horizon_days=7');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('benchmark_report');
      expect(res.body.data.benchmark_report).toHaveProperty('models');
      expect(res.body.data.benchmark_report.models.length).toBe(4);
      expect(res.body.data).toHaveProperty('downscaling_resolution');
      expect(res.body.data.downscaling_resolution.target_resolution).toBe('BLOCK');
    });
  });

  describe('GET /api/v1/models/datasets', () => {
    it('returns scientific dataset catalog with integrity info', async () => {
      const res = await request(app).get('/api/v1/models/datasets');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('catalog');
      expect(Array.isArray(res.body.data.catalog)).toBe(true);
      expect(res.body.data.catalog.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/models/:id/explanations', () => {
    it('returns SHAP feature importance attributions for model', async () => {
      const res = await request(app).get('/api/v1/models/xgboost_heavy_rain_7d/explanations');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('global_importances');
      expect(res.body.data).toHaveProperty('top_driver');
    });
  });

  describe('GET /api/v1/models/experiments', () => {
    it('returns experiment registry list', async () => {
      const res = await request(app).get('/api/v1/models/experiments');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('experiments');
      expect(Array.isArray(res.body.data.experiments)).toBe(true);
    });
  });
});
