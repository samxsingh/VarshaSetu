import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';

describe('Hindcasting API Integration Tests (Phase 4D Multi-Year Validation Stage)', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/v1/models/hindcasting/status', () => {
    it('returns hindcasting multi-year readiness status and data gate disclosures', async () => {
      const res = await request(app).get('/api/v1/models/hindcasting/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('phase', 'PHASE_4D_MULTIYEAR_HINDCASTING_STAGE');
      expect(res.body.data).toHaveProperty('operational_validation_allowed', false);
      expect(res.body.data).toHaveProperty('multiyear_gate_status', 'INSUFFICIENT_DATA');
      expect(res.body.data).toHaveProperty('years_available');
      expect(res.body.data.years_available).toEqual([2024]);
      expect(res.body.data.scientific_disclosure).toMatch(/Historical hindcast validation reflects only the years/i);
    });
  });

  describe('GET /api/v1/models/hindcasting/gate', () => {
    it('evaluates multi-year validation gate and enforces minimum season requirements', async () => {
      const res = await request(app).get('/api/v1/models/hindcasting/gate');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('gate_report');
      const gate = res.body.data.gate_report;
      expect(gate).toHaveProperty('status', 'INSUFFICIENT_DATA');
      expect(gate).toHaveProperty('operational_validation_allowed', false);
      expect(gate).toHaveProperty('total_years', 1);
      expect(gate).toHaveProperty('exclusion_reasons');
      expect(gate.exclusion_reasons.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/models/hindcasting/folds', () => {
    it('returns walk-forward expanding window folds with temporal leakage assertions', async () => {
      const res = await request(app).get('/api/v1/models/hindcasting/folds');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('folds');
      expect(Array.isArray(res.body.data.folds)).toBe(true);
      expect(res.body.data).toHaveProperty('total_folds');
      expect(res.body.data.folds[0]).toHaveProperty('fold_id');
      expect(res.body.data.folds[0]).toHaveProperty('train_start');
      expect(res.body.data.folds[0]).toHaveProperty('test_end');
    });
  });

  describe('GET /api/v1/models/hindcasting/results', () => {
    it('returns hindcasting evaluation results across models and horizons', async () => {
      const res = await request(app).get('/api/v1/models/hindcasting/results');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('experiment');
      const exp = res.body.data.experiment;
      expect(exp).toHaveProperty('target_name');
      expect(exp).toHaveProperty('horizon_days');
      expect(exp).toHaveProperty('operational_validation_allowed', false);
      expect(exp).toHaveProperty('model_results');
      expect(Array.isArray(exp.model_results)).toBe(true);
    });
  });

  describe('GET /api/v1/models/hindcasting/stability', () => {
    it('returns year-by-year stability metrics and degradation flags', async () => {
      const res = await request(app).get('/api/v1/models/hindcasting/stability?model_id=xgboost&target=MONSOON_ONSET');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('stability');
      const stability = res.body.data.stability;
      expect(stability).toHaveProperty('model_id', 'xgboost');
      expect(stability).toHaveProperty('stability_status', 'INSUFFICIENT_SEASONS');
      expect(stability).toHaveProperty('years_evaluated');
    });
  });

  describe('GET /api/v1/models/hindcasting/drift', () => {
    it('evaluates feature drift using PSI and KS statistics', async () => {
      const res = await request(app).get('/api/v1/models/hindcasting/drift');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('drift_report');
      const drift = res.body.data.drift_report;
      expect(['STABLE', 'SHIFT_DETECTED']).toContain(drift.status);
      expect(drift).toHaveProperty('reference_period');
      expect(drift).toHaveProperty('comparison_period');
    });
  });

  describe('GET /api/v1/models/hindcasting/coverage', () => {
    it('returns temporal coverage and missingness analysis for meteorological features', async () => {
      const res = await request(app).get('/api/v1/models/hindcasting/coverage');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('coverage_report');
      const coverage = res.body.data.coverage_report;
      expect(coverage).toHaveProperty('total_features');
      expect(coverage).toHaveProperty('temporal_span');
    });
  });
});
