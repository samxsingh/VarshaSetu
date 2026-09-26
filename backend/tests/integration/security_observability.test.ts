import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/db/pool';
import { createRateLimiter } from '../../src/middleware/rateLimitMiddleware';
import express from 'express';

describe('Phase 6 — Security, Observability & Health Hardening', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('Observability & Unified Health Endpoints', () => {
    it('GET /health returns machine-readable health with all required subsystems', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service).toBe('varshasetu-backend');
      expect(res.body.data.health_classification).toBe('HEALTHY');

      const subsystems = res.body.data.subsystems;
      expect(subsystems).toBeDefined();
      expect(subsystems.database.status).toBe('HEALTHY');
      expect(subsystems.forecast_engine.status).toBe('DIAGNOSTIC_ONLY');
      expect(subsystems.agronomic_rules_engine.status).toBe('HEALTHY');
      expect(subsystems.scenario_engine.status).toBe('HEALTHY');
      expect(subsystems.localization_engine.status).toBe('HEALTHY');
      expect(subsystems.voice_subsystem.status).toBe('DEMO_ONLY');
      expect(subsystems.voice_subsystem.details.bhashini_gov_in).toBe('NOT_CONFIGURED');
      expect(subsystems.notification_delivery.status).toBe('NOT_CONFIGURED');

      // Scientific integrity separation
      const scientific = res.body.data.scientific_integrity;
      expect(scientific.distinction_note).toBeDefined();
      expect(scientific.ground_anchor).toBe('UP_LKO_BKT');
      expect(scientific.observational_season).toBe('Kharif 2024');
      expect(scientific.records_count).toBe(122);
      expect(scientific.single_season_constraint).toBe(true);
      expect(scientific.operational_forecast_active).toBe(false);
    });

    it('GET /ready returns readiness status with dependency verification', async () => {
      const res = await request(app).get('/ready');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ready).toBe(true);
      expect(res.body.data.dependencies.database).toBe('UP');
    });

    it('GET /version returns semantic version and phase metadata', async () => {
      const res = await request(app).get('/version');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.version).toBe('1.0.0');
      expect(res.body.data.phase).toBe('PHASE_6_PRODUCTION_READY');
      expect(res.body.data.ground_anchor).toBe('UP_LKO_BKT');
    });

    it('GET /metrics returns non-sensitive system metrics', async () => {
      const res = await request(app).get('/metrics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.uptime_seconds).toBeGreaterThanOrEqual(0);
      expect(res.body.data.memory).toBeDefined();
      expect(res.body.data.database_pool).toBeDefined();
    });
  });

  describe('Security Hardening & RBAC Protection', () => {
    it('rejects self-registration privilege escalation attempt with 403 FORBIDDEN', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Attacker Admin',
        email: `escalation_${Date.now()}@example.com`,
        password: 'Password123!',
        role: 'ADMIN',
      });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Self-registration is restricted to FARMER role');
    });

    it('includes security headers and correlation X-Request-Id', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('rate limiter restricts excessive requests and returns 429', async () => {
      const testApp = express();
      const testLimiter = createRateLimiter({ windowMs: 10000, maxRequests: 2 });
      testApp.get('/test-rate-limit', testLimiter, (_req, res) => res.json({ ok: true }));

      // Request 1: OK
      const r1 = await request(testApp).get('/test-rate-limit');
      expect(r1.status).toBe(200);
      expect(r1.headers['ratelimit-remaining']).toBe('1');

      // Request 2: OK
      const r2 = await request(testApp).get('/test-rate-limit');
      expect(r2.status).toBe(200);
      expect(r2.headers['ratelimit-remaining']).toBe('0');

      // Request 3: Blocked (429)
      const r3 = await request(testApp).get('/test-rate-limit');
      expect(r3.status).toBe(429);
      expect(r3.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});
