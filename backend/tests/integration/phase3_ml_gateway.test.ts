import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';
import {
  mlGatewayClient,
  mlGatewayService,
  ScientificForecastRecordSchema,
  ForecastGenerateRequestSchema,
  ForecastUncertaintySchema,
  ForecastPredictionSchema,
  GatewayTimeoutError,
  GatewayUnavailableError,
  GatewayResponseError,
} from '../../src/services/ml';
import { Forecast } from '../../src/models/Forecast';
import { isDatabaseConnected } from '../../src/config/database';

describe('Phase 3 — Scientific ML Service Gateway Integration Suite', () => {
  let adminToken: string;
  let farmerToken: string;

  beforeAll(async () => {
    // Authenticate users
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@varshasetu.gov.in', password: 'AdminPassword123!' });
    adminToken = adminRes.body?.data?.token;

    const farmerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ramesh.farmer@example.com', password: 'FarmerPassword123!' });
    farmerToken = farmerRes.body?.data?.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  // ====================================================================
  // 1. GATEWAY CLIENT RESILIENCE & ERROR WRAPPING
  // ====================================================================
  describe('MLGatewayClient Resilience & HTTP Handling', () => {
    it('initializes with proper default base URL from environment', () => {
      const baseUrl = mlGatewayClient.getBaseUrl();
      expect(baseUrl).toBeDefined();
      expect(baseUrl).toMatch(/http:\/\//);
    });

    it('wraps connection failures to unreachable endpoints in GatewayUnavailableError', async () => {
      // Create a temporary client pointing to an unreachable port
      const { MLGatewayClient } = await import('../../src/services/ml/mlGatewayClient');
      const badClient = new MLGatewayClient({ baseUrl: 'http://localhost:59999', timeoutMs: 500 });

      await expect(badClient.get('/health')).rejects.toThrow(GatewayUnavailableError);
    });

    it('wraps aborted timeout requests in GatewayTimeoutError', async () => {
      const { MLGatewayClient } = await import('../../src/services/ml/mlGatewayClient');
      // Tiny timeout that triggers abort before connection
      const timeoutClient = new MLGatewayClient({ baseUrl: 'http://10.255.255.1:8000', timeoutMs: 50 });

      await expect(timeoutClient.get('/health')).rejects.toThrow(GatewayTimeoutError);
    });
  });

  // ====================================================================
  // 2. AUTHORITATIVE SCIENTIFIC SCHEMAS & ZERO-FABRICATION CONSTRAINTS
  // ====================================================================
  describe('MLGatewaySchemas Scientific Validation', () => {
    it('validates a well-formed ScientificForecastRecord matching contract', () => {
      const validRecord = {
        forecast_id: 'fc_heavy_rain_7d_test_001',
        generated_at: new Date().toISOString(),
        valid_from: '2024-10-01',
        valid_until: '2024-10-07',
        location: {
          state_id: 'UP',
          district_id: 'UP_LKO',
          block_id: 'UP_LKO_BKT',
          latitude: 26.9749,
          longitude: 80.9276,
        },
        target: {
          name: 'heavy_rain',
          threshold_mm: 64.5,
          unit: 'probability',
        },
        horizon: {
          days: 7,
          label: '7-Day Outlook',
        },
        model: {
          model_id: 'lightgbm_heavy_rain_7d',
          algorithm: 'LightGBM Classifier + Platt Scaling',
          version: '1.0.0',
        },
        prediction: {
          raw_probability: 0.28,
          calibrated_probability: 0.25,
          expected_value_mm: null,
          risk_category: 'LOW',
        },
        calibration: {
          method: 'PLATT_SCALING',
          brier_score_raw: 0.089,
          brier_score_calibrated: 0.076,
          gate_passed: true,
        },
        uncertainty: {
          p10: 0.18,
          p50: 0.25,
          p90: 0.35,
          confidence_interval_pct: 80.0,
        },
        validation: {
          operational_allowed: false,
          hindcast_validated: true,
          single_season_warning: true,
          status: 'DIAGNOSTIC_ONLY',
        },
        explainability: {
          method: 'TREE_SHAP',
          base_value: 0.15,
          top_features: [
            { feature_name: 'relative_humidity_9am', value: 82.5, shap_value: 0.08, contribution: 'INCREASES_RISK' },
          ],
        },
        data: {
          dataset_name: 'Kharif 2024 Reanalysis',
          season: 'Kharif 2024',
          observation_count: 122,
          ground_anchor: 'Bakshi Ka Talab centroid (~9km)',
        },
        scientific_disclosure:
          'DIAGNOSTIC ONLY. Probabilistic forecast calibrated on Kharif 2024 archive.',
      };

      const parsed = ScientificForecastRecordSchema.safeParse(validRecord);
      expect(parsed.success).toBe(true);
    });

    it('enforces probability bounds P in [0.0, 1.0]', () => {
      const invalidProbHigh = {
        raw_probability: 1.25, // Invalid > 1.0
        calibrated_probability: 0.5,
        risk_category: 'HIGH',
      };
      const parseHigh = ForecastPredictionSchema.safeParse(invalidProbHigh);
      expect(parseHigh.success).toBe(false);

      const invalidProbLow = {
        raw_probability: -0.1, // Invalid < 0.0
        calibrated_probability: 0.5,
        risk_category: 'LOW',
      };
      const parseLow = ForecastPredictionSchema.safeParse(invalidProbLow);
      expect(parseLow.success).toBe(false);
    });

    it('enforces monotonic uncertainty percentiles: p10 <= p50 <= p90', () => {
      const validUncertainty = {
        p10: 0.20,
        p50: 0.35,
        p90: 0.60,
        confidence_interval_pct: 80.0,
      };
      expect(ForecastUncertaintySchema.safeParse(validUncertainty).success).toBe(true);

      const nonMonotonic = {
        p10: 0.50, // Invalid: p10 > p50
        p50: 0.30,
        p90: 0.70,
        confidence_interval_pct: 80.0,
      };
      expect(ForecastUncertaintySchema.safeParse(nonMonotonic).success).toBe(false);
    });

    it('validates forecast generate request schema and sets 7-day default horizon', () => {
      const minimalRequest = {
        target_name: 'heavy_rain',
      };
      const parsed = ForecastGenerateRequestSchema.parse(minimalRequest);
      expect(parsed.horizon_days).toBe(7);
      expect(parsed.block_id).toBe('UP_LKO_BKT');
    });
  });

  // ====================================================================
  // 3. TYPED ML GATEWAY SERVICE METHODS
  // ====================================================================
  describe('MLGatewayService Methods', () => {
    it('checks ML service health and returns structured diagnostic integrity', async () => {
      const health = await mlGatewayService.checkHealth();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('service');
    });

    it('fetches forecast engine status with diagnostic disclosure', async () => {
      const status = await mlGatewayService.getForecastStatus();
      expect(status).toHaveProperty('operational_forecast_allowed', false);
      expect(status).toHaveProperty('system_status', 'DIAGNOSTIC_ONLY');
      expect(status).toHaveProperty('scientific_disclosure');
    });

    it('fetches observational data availability for Bakshi Ka Talab', async () => {
      const avail = await mlGatewayService.getForecastAvailability('UP_LKO_BKT');
      expect(avail).toHaveProperty('block_id', 'UP_LKO_BKT');
      expect(avail).toHaveProperty('features_available', 19);
      expect(avail).toHaveProperty('operational_allowed', false);
    });

    it('generates a verified scientific forecast record and returns full lineage', async () => {
      const record = await mlGatewayService.generateForecast({
        target_name: 'heavy_rain',
        horizon_days: 7,
        block_id: 'UP_LKO_BKT',
      });

      expect(record).toHaveProperty('forecast_id');
      expect(record.location.block_id).toBe('UP_LKO_BKT');
      expect(record.horizon.days).toBe(7);
      expect(record.validation.status).toBe('DIAGNOSTIC_ONLY');
      expect(record.prediction.calibrated_probability).toBeGreaterThanOrEqual(0.0);
      expect(record.prediction.calibrated_probability).toBeLessThanOrEqual(1.0);
      expect(record.uncertainty.p10).toBeLessThanOrEqual(record.uncertainty.p50);
      expect(record.uncertainty.p50).toBeLessThanOrEqual(record.uncertainty.p90);
    });
  });

  // ====================================================================
  // 4. REST API GATEWAY ROUTING & PERSISTENCE
  // ====================================================================
  describe('Express REST API Gateway Integration', () => {
    it('POST /api/v1/forecasts/generate returns 201 with verified scientific forecast', async () => {
      const res = await request(app)
        .post('/api/v1/forecasts/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          target_name: 'heavy_rain',
          horizon_days: 7,
          block_id: 'UP_LKO_BKT',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data).toHaveProperty('forecast_id');
      expect(data.location).toHaveProperty('block_id', 'UP_LKO_BKT');
      expect(data.validation).toHaveProperty('status', 'DIAGNOSTIC_ONLY');
      expect(data.uncertainty.p10).toBeLessThanOrEqual(data.uncertainty.p90);
    });

    it('GET /api/v1/forecasts lists forecasts with spatial resolution BLOCK', async () => {
      const res = await request(app)
        .get('/api/v1/forecasts?block_id=UP_LKO_BKT&horizon=7')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('forecasts');
      expect(Array.isArray(res.body.data.forecasts)).toBe(true);

      if (res.body.data.forecasts.length > 0) {
        const fc = res.body.data.forecasts[0];
        expect(fc.location.spatial_resolution).toBe('BLOCK');
      }
    });

    it('GET /api/v1/health reports active ML service subsystem', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subsystems).toHaveProperty('ml_service');
      expect(res.body.data.subsystems.ml_service).toHaveProperty('details');
      expect(res.body.data.subsystems.ml_service.details).toHaveProperty('endpoint');
    });

    it('GET /api/v1/models/status preserves Kharif 2024 single season constraint', async () => {
      const res = await request(app).get('/api/v1/models/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('phase', 'PHASE_4B_OPERATIONAL_DOWNSCALING_STAGE');
      expect(res.body.data).toHaveProperty('spatial_resolution_supported', 'BLOCK');
    });
  });
});
