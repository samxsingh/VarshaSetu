import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { inspectionActionRepository } from '../../src/repositories/inspectionActionRepository';
import { InspectionAction } from '../../src/models/InspectionAction';
import { isDatabaseConnected } from '../../src/config/database';
import {
  calculateAgeHours,
  calculateAgingDistribution,
  calculateCoverage,
  calculateResolutionMetrics,
  buildAttentionQueue,
  buildRecentActivity,
} from '../../src/services/operational/commandCenterService';
import { OperationalSignalDTO } from '../../src/services/operational/operationalSignalTypes';

describe('Phase 7D — Operational Command Center Integration Tests', () => {
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

  // ------------------------------------------------------------
  // TEST GROUP 1 — AUTHENTICATION
  // ------------------------------------------------------------
  describe('Group 1: Authentication & Standard Error Envelope', () => {
    it('1. rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/operations/command-center');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('2. rejects request with malformed Bearer token with 401', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center')
        .set('Authorization', 'Bearer malformed.token');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('3. rejects request with completely invalid JWT with 401', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center')
        .set('Authorization', 'Bearer invalid-token-xyz-12345');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 2 — FARMER RBAC
  // ------------------------------------------------------------
  describe('Group 2: Farmer RBAC & Geographic Isolation', () => {
    it('4. allows Farmer within assigned block (UP_LKO_BKT) and hides internal system gate signals', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scope.blockId).toBe('UP_LKO_BKT');
      expect(res.body.data.scope.userRole).toBe('FARMER');

      // Farmer must not have internal MODEL_STATUS signals
      if (res.body.data.signalSummary.byType['MODEL_STATUS']) {
        expect(res.body.data.signalSummary.byType['MODEL_STATUS']).toBe(0);
      }
    });

    it('5. forbids Farmer from accessing foreign block (UP_LKO_MAL) with 403', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center?blockId=UP_LKO_MAL')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toMatch(/farmers are strictly restricted/i);
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 3 — OFFICER RBAC
  // ------------------------------------------------------------
  describe('Group 3: Field Officer RBAC & Jurisdiction', () => {
    it('6. allows Field Officer within assigned administrative block (UP_LKO_BKT)', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scope.blockId).toBe('UP_LKO_BKT');
      expect(res.body.data.scope.userRole).toBe('OFFICER');
    });

    it('7. forbids Field Officer from accessing foreign jurisdiction (UP_KAN_KLP) with 403', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center?blockId=UP_KAN_KLP')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toMatch(/field officers are restricted/i);
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 4 — GOVERNMENT SCOPE
  // ------------------------------------------------------------
  describe('Group 4: Government Regional/Multi-Block Scope', () => {
    it('8. allows Government regional operational command center access', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center')
        .set('Authorization', `Bearer ${govToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scope.userRole).toBe('GOVERNMENT');
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 5 — CLIMATE ANALYST SCOPE
  // ------------------------------------------------------------
  describe('Group 5: Climate Analyst Global Diagnostic Scope', () => {
    it('9. allows Climate Analyst to access diagnostic command center', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(['ANALYST', 'CLIMATE_ANALYST']).toContain(res.body.data.scope.userRole);
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 6 — ADMIN GLOBAL CLEARANCE
  // ------------------------------------------------------------
  describe('Group 6: Admin Global Clearance', () => {
    it('10. allows Admin global unrestricted clearance and targeted block scoping', async () => {
      // Global scope
      const resGlobal = await request(app)
        .get('/api/v1/operations/command-center')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resGlobal.status).toBe(200);
      expect(resGlobal.body.data.scope.userRole).toBe('ADMIN');

      // Block-scoped
      const resBlock = await request(app)
        .get('/api/v1/operations/command-center?blockId=UP_LKO_BKT')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resBlock.status).toBe(200);
      expect(resBlock.body.data.scope.blockId).toBe('UP_LKO_BKT');
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 7 & 8 — RESPONSE ENVELOPE & DTO STRUCTURE
  // ------------------------------------------------------------
  describe('Group 7 & 8: Response Envelope & Full DTO Structure', () => {
    it('11. returns standardized response envelope with metadata and complete DTO', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(typeof res.body.meta.timestamp).toBe('string');

      const data = res.body.data;
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('scope');
      expect(data).toHaveProperty('systemStatus');
      expect(data).toHaveProperty('signalSummary');
      expect(data).toHaveProperty('actionSummary');
      expect(data).toHaveProperty('coverage');
      expect(data).toHaveProperty('aging');
      expect(data).toHaveProperty('attentionQueue');
      expect(data).toHaveProperty('recentActivity');

      // systemStatus checks
      expect(data.systemStatus).toHaveProperty('forecastServiceStatus');
      expect(data.systemStatus).toHaveProperty('modelRegistryStatus');
      expect(data.systemStatus).toHaveProperty('dataFreshnessStatus');
      expect(data.systemStatus).toHaveProperty('validationStatus');
      expect(data.systemStatus).toHaveProperty('activeDataset');
      expect(Array.isArray(data.systemStatus.scientificDisclosures)).toBe(true);

      // signalSummary checks
      expect(typeof data.signalSummary.total).toBe('number');
      expect(data.signalSummary.bySeverity).toHaveProperty('CRITICAL');
      expect(data.signalSummary.bySeverity).toHaveProperty('WARNING');
      expect(data.signalSummary.bySeverity).toHaveProperty('WATCH');
      expect(data.signalSummary.bySeverity).toHaveProperty('INFO');
      expect(typeof data.signalSummary.byType).toBe('object');

      // actionSummary checks
      expect(typeof data.actionSummary.totalActions).toBe('number');
      expect(typeof data.actionSummary.openCount).toBe('number');
      expect(typeof data.actionSummary.assignedCount).toBe('number');
      expect(typeof data.actionSummary.inProgressCount).toBe('number');
      expect(typeof data.actionSummary.completedCount).toBe('number');
      expect(typeof data.actionSummary.cancelledCount).toBe('number');

      // coverage checks
      expect(typeof data.coverage.totalActiveSignals).toBe('number');
      expect(typeof data.coverage.actionedSignalsCount).toBe('number');
      expect(typeof data.coverage.unactionedSignalsCount).toBe('number');
      expect(typeof data.coverage.coveragePercentage).toBe('number');
      expect(typeof data.coverage.criticalSignalsUnactioned).toBe('number');

      // aging checks
      expect(typeof data.aging.lessThan1h).toBe('number');
      expect(typeof data.aging.between1hAnd6h).toBe('number');
      expect(typeof data.aging.between6hAnd24h).toBe('number');
      expect(typeof data.aging.between24hAnd72h).toBe('number');
      expect(typeof data.aging.greaterThan72h).toBe('number');

      // attentionQueue checks
      expect(Array.isArray(data.attentionQueue)).toBe(true);
      expect(Array.isArray(data.recentActivity)).toBe(true);
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 9 & 10 — COVERAGE CALCULATION & CANCELLED ACTIONS
  // ------------------------------------------------------------
  describe('Group 9 & 10: Signal-Action Coverage & Cancelled Action Semantics', () => {
    it('12. calculates coverage accurately: cancelled actions do not action a signal', () => {
      const mockSignals: OperationalSignalDTO[] = [
        {
          signalId: 'sig_A',
          signalType: 'EVENT',
          title: 'Signal A',
          summary: 'Critical alert',
          severity: 'CRITICAL',
          blockId: 'UP_LKO_BKT',
          detectedAt: new Date().toISOString(),
          validFrom: new Date().toISOString(),
          validUntil: new Date().toISOString(),
          probability: 0.9,
          confidenceStatus: 'PASS',
          operationalStatus: 'DIAGNOSTIC_ONLY',
          dataFreshness: 'FRESH',
          validationStatus: 'VALIDATED',
          sourceReferences: [],
          recommendedInspection: 'Inspect rain gauge',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          signalId: 'sig_B',
          signalType: 'FORECAST_CHANGE',
          title: 'Signal B',
          summary: 'Warning alert',
          severity: 'WARNING',
          blockId: 'UP_LKO_BKT',
          detectedAt: new Date().toISOString(),
          validFrom: new Date().toISOString(),
          validUntil: new Date().toISOString(),
          probability: 0.7,
          confidenceStatus: 'PASS',
          operationalStatus: 'DIAGNOSTIC_ONLY',
          dataFreshness: 'FRESH',
          validationStatus: 'VALIDATED',
          sourceReferences: [],
          recommendedInspection: 'Inspect forecast',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          signalId: 'sig_C',
          signalType: 'ADVISORY',
          title: 'Signal C',
          summary: 'Watch advisory',
          severity: 'WATCH',
          blockId: 'UP_LKO_BKT',
          detectedAt: new Date().toISOString(),
          validFrom: new Date().toISOString(),
          validUntil: new Date().toISOString(),
          probability: 0.5,
          confidenceStatus: 'PASS',
          operationalStatus: 'DIAGNOSTIC_ONLY',
          dataFreshness: 'FRESH',
          validationStatus: 'VALIDATED',
          sourceReferences: [],
          recommendedInspection: 'Review advisory',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          signalId: 'sig_D',
          signalType: 'DATA_QUALITY',
          title: 'Signal D',
          summary: 'Info notice',
          severity: 'INFO',
          blockId: 'UP_LKO_BKT',
          detectedAt: new Date().toISOString(),
          validFrom: new Date().toISOString(),
          validUntil: new Date().toISOString(),
          probability: null,
          confidenceStatus: 'PASS',
          operationalStatus: 'DIAGNOSTIC_ONLY',
          dataFreshness: 'FRESH',
          validationStatus: 'VALIDATED',
          sourceReferences: [],
          recommendedInspection: 'Telemetry check',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const mockActions = [
        { signalId: 'sig_B', status: 'OPEN' }, // sig_B actioned
        { signalId: 'sig_C', status: 'COMPLETED' }, // sig_C actioned
        { signalId: 'sig_D', status: 'CANCELLED' }, // sig_D only has cancelled action => unactioned
      ];

      const coverage = calculateCoverage(mockSignals, mockActions);

      expect(coverage.totalActiveSignals).toBe(4);
      expect(coverage.actionedSignalsCount).toBe(2); // B and C
      expect(coverage.unactionedSignalsCount).toBe(2); // A and D
      expect(coverage.coveragePercentage).toBe(50.0);
      expect(coverage.criticalSignalsUnactioned).toBe(1); // A is critical and unactioned
    });

    it('13. returns 0 coverage when totalActiveSignals is 0', () => {
      const coverage = calculateCoverage([], []);
      expect(coverage.totalActiveSignals).toBe(0);
      expect(coverage.actionedSignalsCount).toBe(0);
      expect(coverage.unactionedSignalsCount).toBe(0);
      expect(coverage.coveragePercentage).toBe(0);
      expect(coverage.criticalSignalsUnactioned).toBe(0);
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 11 — AGING BUCKETS
  // ------------------------------------------------------------
  describe('Group 11: Aging Buckets and Boundary Evaluation', () => {
    it('14. correctly assigns actions to aging buckets with exact boundary values', () => {
      const now = new Date('2026-09-26T12:00:00.000Z');

      const actions = [
        { createdAt: new Date('2026-09-26T11:45:00.000Z') }, // 15m ago -> lessThan1h
        { createdAt: new Date('2026-09-26T11:00:00.000Z') }, // exactly 1h ago -> between1hAnd6h
        { createdAt: new Date('2026-09-26T08:00:00.000Z') }, // 4h ago -> between1hAnd6h
        { createdAt: new Date('2026-09-26T06:00:00.000Z') }, // exactly 6h ago -> between6hAnd24h
        { createdAt: new Date('2026-09-25T16:00:00.000Z') }, // 20h ago -> between6hAnd24h
        { createdAt: new Date('2026-09-25T12:00:00.000Z') }, // exactly 24h ago -> between24hAnd72h
        { createdAt: new Date('2026-09-24T12:00:00.000Z') }, // 48h ago -> between24hAnd72h
        { createdAt: new Date('2026-09-23T12:00:00.000Z') }, // exactly 72h ago -> greaterThan72h
        { createdAt: new Date('2026-09-20T12:00:00.000Z') }, // 6 days ago -> greaterThan72h
      ];

      const aging = calculateAgingDistribution(actions, now);

      expect(aging.lessThan1h).toBe(1);
      expect(aging.between1hAnd6h).toBe(2);
      expect(aging.between6hAnd24h).toBe(2);
      expect(aging.between24hAnd72h).toBe(2);
      expect(aging.greaterThan72h).toBe(2);
    });

    it('15. calculateAgeHours computes deterministic age rounded to two decimal places', () => {
      const now = new Date('2026-09-26T12:00:00.000Z');
      const past = new Date('2026-09-26T10:30:00.000Z'); // 1.5 hours
      expect(calculateAgeHours(past, now)).toBe(1.5);
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 12 — RESOLUTION METRICS
  // ------------------------------------------------------------
  describe('Group 12: Resolution Metrics & Duration Computation', () => {
    it('16. computes average resolution time only from completed actions with valid timestamps', () => {
      const actions = [
        {
          status: 'COMPLETED',
          createdAt: new Date('2026-09-26T06:00:00.000Z'),
          startedAt: new Date('2026-09-26T07:00:00.000Z'),
          completedAt: new Date('2026-09-26T09:00:00.000Z'), // 2 hours from startedAt
        },
        {
          status: 'COMPLETED',
          createdAt: new Date('2026-09-26T00:00:00.000Z'),
          startedAt: null,
          completedAt: new Date('2026-09-26T04:00:00.000Z'), // 4 hours from createdAt
        },
        {
          status: 'CANCELLED',
          createdAt: new Date('2026-09-26T00:00:00.000Z'),
          completedAt: new Date('2026-09-26T10:00:00.000Z'),
        },
        {
          status: 'OPEN',
          createdAt: new Date('2026-09-26T00:00:00.000Z'),
        },
      ];

      const metrics = calculateResolutionMetrics(actions);
      expect(metrics.totalActions).toBe(4);
      expect(metrics.completedCount).toBe(2);
      expect(metrics.cancelledCount).toBe(1);
      expect(metrics.openCount).toBe(1);
      // Average of 2h and 4h = 3.0h
      expect(metrics.averageTimeToResolutionHours).toBe(3.0);
    });

    it('17. returns null (not zero) for resolution time when no valid completed action exists', () => {
      const actions = [
        { status: 'OPEN', createdAt: new Date() },
        { status: 'IN_PROGRESS', createdAt: new Date() },
        { status: 'CANCELLED', createdAt: new Date() },
      ];

      const metrics = calculateResolutionMetrics(actions);
      expect(metrics.averageTimeToResolutionHours).toBeNull();
    });
  });

  // ------------------------------------------------------------
  // TEST GROUPS 13 TO 18 — ATTENTION QUEUE TIERS & DETERMINISTIC SORTING
  // ------------------------------------------------------------
  describe('Groups 13–18: Attention Queue Tiers, Deduplication, and Deterministic Sorting', () => {
    const now = new Date('2026-09-26T12:00:00.000Z');

    it('18. Tier 1: Emergency prioritization for unactioned critical signal and overdue P1 action', () => {
      const signals: OperationalSignalDTO[] = [
        {
          signalId: 'sig_crit_unactioned',
          signalType: 'EVENT',
          title: 'Extreme Flash Flood',
          summary: 'Critical flash flood warning',
          severity: 'CRITICAL',
          blockId: 'UP_LKO_BKT',
          detectedAt: '2026-09-26T10:00:00.000Z',
          validFrom: '2026-09-26T10:00:00.000Z',
          validUntil: '2026-09-26T18:00:00.000Z',
          probability: 0.95,
          confidenceStatus: 'PASS',
          operationalStatus: 'DIAGNOSTIC_ONLY',
          dataFreshness: 'FRESH',
          validationStatus: 'VALIDATED',
          sourceReferences: [],
          recommendedInspection: 'Immediate ground truthing',
          createdAt: '2026-09-26T10:00:00.000Z',
          updatedAt: '2026-09-26T10:00:00.000Z',
        },
      ];

      const actions: any[] = [
        {
          actionId: 'act_p1_overdue',
          signalId: 'other_sig',
          title: 'Dam Sluice Check',
          status: 'OPEN',
          priority: 'CRITICAL', // maps to P1
          createdAt: new Date('2026-09-26T04:00:00.000Z'), // 8h ago (> 6h)
          blockId: 'UP_LKO_BKT',
          assignedTo: 'officer-1',
        },
      ];

      const queue = buildAttentionQueue(signals, actions, now);
      expect(queue.length).toBe(2);

      const sigItem = queue.find((q) => q.sourceType === 'SIGNAL');
      expect(sigItem?.reason).toBe('UNACTIONED_CRITICAL_SIGNAL');
      expect(sigItem?.priority).toBe('P1');

      const actItem = queue.find((q) => q.sourceType === 'ACTION');
      expect(actItem?.reason).toBe('OVERDUE_P1_ACTION');
      expect(actItem?.priority).toBe('P1');
    });

    it('19. Tier 2: High priority for unassigned P1, unactioned warning, stalled in-progress', () => {
      const signals: OperationalSignalDTO[] = [
        {
          signalId: 'sig_warn_unactioned',
          signalType: 'FORECAST_CHANGE',
          title: 'Heavy Rain 7D',
          summary: 'Warning',
          severity: 'WARNING',
          blockId: 'UP_LKO_BKT',
          detectedAt: '2026-09-26T11:00:00.000Z',
          validFrom: '2026-09-26T11:00:00.000Z',
          validUntil: '2026-09-27T11:00:00.000Z',
          probability: 0.75,
          confidenceStatus: 'PASS',
          operationalStatus: 'DIAGNOSTIC_ONLY',
          dataFreshness: 'FRESH',
          validationStatus: 'VALIDATED',
          sourceReferences: [],
          recommendedInspection: 'Review models',
          createdAt: '2026-09-26T11:00:00.000Z',
          updatedAt: '2026-09-26T11:00:00.000Z',
        },
      ];

      const actions: any[] = [
        {
          actionId: 'act_p1_unassigned',
          signalId: 'sig_other_1',
          title: 'Rain Gauge Audit',
          status: 'OPEN',
          priority: 'CRITICAL',
          assignedTo: null,
          createdAt: new Date('2026-09-26T10:00:00.000Z'), // 2h ago (<= 6h)
          blockId: 'UP_LKO_BKT',
        },
        {
          actionId: 'act_stalled',
          signalId: 'sig_other_2',
          title: 'Station Maintenance',
          status: 'IN_PROGRESS',
          priority: 'HIGH', // P2
          assignedTo: 'tech-1',
          createdAt: new Date('2026-09-24T10:00:00.000Z'), // 50h ago (> 24h)
          blockId: 'UP_LKO_BKT',
        },
      ];

      const queue = buildAttentionQueue(signals, actions, now);
      expect(queue.length).toBe(3);

      const unassignedAct = queue.find((q) => q.sourceId === 'act_p1_unassigned');
      expect(unassignedAct?.reason).toBe('UNASSIGNED_HIGH_PRIORITY');
      expect(unassignedAct?.priority).toBe('P1');

      const warnSig = queue.find((q) => q.sourceId === 'sig_warn_unactioned');
      expect(warnSig?.reason).toBe('UNASSIGNED_HIGH_PRIORITY');
      expect(warnSig?.priority).toBe('P2');

      const stalledAct = queue.find((q) => q.sourceId === 'act_stalled');
      expect(stalledAct?.reason).toBe('STALLED_IN_PROGRESS');
      expect(stalledAct?.priority).toBe('P2');
    });

    it('20. Tier 3 & 4: Supervisory routing and routine triage', () => {
      const signals: OperationalSignalDTO[] = [
        {
          signalId: 'sig_watch',
          signalType: 'ADVISORY',
          title: 'Watch Advisory',
          summary: 'Watch',
          severity: 'WATCH',
          blockId: 'UP_LKO_BKT',
          detectedAt: '2026-09-26T11:00:00.000Z',
          validFrom: '2026-09-26T11:00:00.000Z',
          validUntil: '2026-09-27T11:00:00.000Z',
          probability: 0.45,
          confidenceStatus: 'PASS',
          operationalStatus: 'DIAGNOSTIC_ONLY',
          dataFreshness: 'FRESH',
          validationStatus: 'VALIDATED',
          sourceReferences: [],
          recommendedInspection: 'Advisory notice',
          createdAt: '2026-09-26T11:00:00.000Z',
          updatedAt: '2026-09-26T11:00:00.000Z',
        },
        {
          signalId: 'sig_info',
          signalType: 'DATA_QUALITY',
          title: 'Info Sync',
          summary: 'Info',
          severity: 'INFO',
          blockId: 'UP_LKO_BKT',
          detectedAt: '2026-09-26T11:30:00.000Z',
          validFrom: '2026-09-26T11:30:00.000Z',
          validUntil: '2026-09-27T11:30:00.000Z',
          probability: null,
          confidenceStatus: 'PASS',
          operationalStatus: 'DIAGNOSTIC_ONLY',
          dataFreshness: 'FRESH',
          validationStatus: 'VALIDATED',
          sourceReferences: [],
          recommendedInspection: 'Data sync info',
          createdAt: '2026-09-26T11:30:00.000Z',
          updatedAt: '2026-09-26T11:30:00.000Z',
        },
      ];

      const actions: any[] = [
        {
          actionId: 'act_p3_open',
          signalId: 'sig_x',
          title: 'Soil Sensor Check',
          status: 'OPEN',
          priority: 'MEDIUM', // P3
          assignedTo: 'tech-2',
          createdAt: new Date('2026-09-26T10:00:00.000Z'),
          blockId: 'UP_LKO_BKT',
        },
        {
          actionId: 'act_p4_open',
          signalId: 'sig_y',
          title: 'Document archive',
          status: 'OPEN',
          priority: 'LOW', // P4
          assignedTo: 'tech-3',
          createdAt: new Date('2026-09-26T09:00:00.000Z'),
          blockId: 'UP_LKO_BKT',
        },
      ];

      const queue = buildAttentionQueue(signals, actions, now);
      expect(queue.length).toBe(4);

      const watchItem = queue.find((q) => q.sourceId === 'sig_watch');
      expect(watchItem?.reason).toBe('ROUTINE_MONITORING');
      expect(watchItem?.priority).toBe('P3');

      const infoItem = queue.find((q) => q.sourceId === 'sig_info');
      expect(infoItem?.reason).toBe('ROUTINE_MONITORING');
      expect(infoItem?.priority).toBe('P4');

      const p3Item = queue.find((q) => q.sourceId === 'act_p3_open');
      expect(p3Item?.reason).toBe('ROUTINE_MONITORING');
      expect(p3Item?.priority).toBe('P3');

      const p4Item = queue.find((q) => q.sourceId === 'act_p4_open');
      expect(p4Item?.reason).toBe('ROUTINE_MONITORING');
      expect(p4Item?.priority).toBe('P4');
    });

    it('21. deterministic sorting: Tier ascending, Age descending, SourceType ascending, SourceID ascending', () => {
      const signals: OperationalSignalDTO[] = [
        {
          signalId: 'sig_crit_1',
          signalType: 'EVENT',
          title: 'Crit 1',
          summary: 'Critical alert 1',
          severity: 'CRITICAL',
          blockId: 'UP_LKO_BKT',
          detectedAt: '2026-09-26T10:00:00.000Z', // 2h age
          validFrom: '2026-09-26T10:00:00.000Z',
          validUntil: '2026-09-26T18:00:00.000Z',
          probability: 0.9,
          confidenceStatus: 'PASS',
          operationalStatus: 'DIAGNOSTIC_ONLY',
          dataFreshness: 'FRESH',
          validationStatus: 'VALIDATED',
          sourceReferences: [],
          recommendedInspection: 'Inspect',
          createdAt: '2026-09-26T10:00:00.000Z',
          updatedAt: '2026-09-26T10:00:00.000Z',
        },
        {
          signalId: 'sig_crit_2',
          signalType: 'EVENT',
          title: 'Crit 2',
          summary: 'Critical alert 2',
          severity: 'CRITICAL',
          blockId: 'UP_LKO_BKT',
          detectedAt: '2026-09-26T08:00:00.000Z', // 4h age (older)
          validFrom: '2026-09-26T08:00:00.000Z',
          validUntil: '2026-09-26T18:00:00.000Z',
          probability: 0.9,
          confidenceStatus: 'PASS',
          operationalStatus: 'DIAGNOSTIC_ONLY',
          dataFreshness: 'FRESH',
          validationStatus: 'VALIDATED',
          sourceReferences: [],
          recommendedInspection: 'Inspect',
          createdAt: '2026-09-26T08:00:00.000Z',
          updatedAt: '2026-09-26T08:00:00.000Z',
        },
      ];

      const queue1 = buildAttentionQueue(signals, [], now);
      const queue2 = buildAttentionQueue(signals, [], now);

      // Reproducibility test
      expect(queue1).toEqual(queue2);

      // Older item (sig_crit_2) must appear before newer item (sig_crit_1)
      expect(queue1[0].sourceId).toBe('sig_crit_2');
      expect(queue1[1].sourceId).toBe('sig_crit_1');
    });

    it('22. first-match deduplication prevents same entity from appearing multiple times', () => {
      const signals: OperationalSignalDTO[] = [
        {
          signalId: 'sig_multi',
          signalType: 'EVENT',
          title: 'Multi rule trigger',
          summary: 'Crit',
          severity: 'CRITICAL',
          blockId: 'UP_LKO_BKT',
          detectedAt: '2026-09-26T08:00:00.000Z',
          validFrom: '2026-09-26T08:00:00.000Z',
          validUntil: '2026-09-26T18:00:00.000Z',
          probability: 0.9,
          confidenceStatus: 'PASS',
          operationalStatus: 'DIAGNOSTIC_ONLY',
          dataFreshness: 'FRESH',
          validationStatus: 'VALIDATED',
          sourceReferences: [],
          recommendedInspection: 'Inspect',
          createdAt: '2026-09-26T08:00:00.000Z',
          updatedAt: '2026-09-26T08:00:00.000Z',
        },
      ];

      const queue = buildAttentionQueue(signals, [], now);
      const occurrences = queue.filter((q) => q.sourceId === 'sig_multi');
      expect(occurrences.length).toBe(1);
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 19 — TIME HORIZON
  // ------------------------------------------------------------
  describe('Group 19: Time Horizon Query Filtering', () => {
    it('23. accepts 24h, 7d, and 30d time horizons successfully', async () => {
      for (const horizon of ['24h', '7d', '30d']) {
        const res = await request(app)
          .get(`/api/v1/operations/command-center?timeHorizon=${horizon}`)
          .set('Authorization', `Bearer ${analystToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });

    it('24. rejects unsupported time horizon (e.g. 12h) with 400 Bad Request', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center?timeHorizon=12h')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toMatch(/invalid timeHorizon/i);
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 20 — BLOCK FILTERING
  // ------------------------------------------------------------
  describe('Group 20: Block-Scoped Query Filtering', () => {
    it('25. scopes query to requested block for privileged users', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center?blockId=UP_LKO_BKT')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.scope.blockId).toBe('UP_LKO_BKT');
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 21 — SCIENTIFIC DISCLOSURES
  // ------------------------------------------------------------
  describe('Group 21: Preserved Scientific Integrity & Disclosures', () => {
    it('26. preserves DIAGNOSTIC_ONLY, HISTORICAL_ONLY, and single-season disclosures', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      const status = res.body.data.systemStatus;

      expect(status.forecastServiceStatus).toMatch(/DIAGNOSTIC_ONLY/);
      expect(status.dataFreshnessStatus).toMatch(/HISTORICAL_ONLY/);
      expect(status.validationStatus).toMatch(/INSUFFICIENT_DATA/);
      expect(status.activeDataset).toMatch(/Kharif 2024.*UP_LKO_BKT/);

      const disclosures = status.scientificDisclosures.join(' ');
      expect(disclosures).toMatch(/DIAGNOSTIC_ONLY/);
      expect(disclosures).toMatch(/Kharif 2024/);
      expect(disclosures).toMatch(/(automated farm actuation|agronomic crop decision commands)/i);
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 22 — TRIAD OF TRUTH
  // ------------------------------------------------------------
  describe('Group 22: Triad of Truth (No Prohibited Synthetic Scores)', () => {
    it('27. does NOT fabricate synthetic risk scores or conflate probability with confidence', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      const data = res.body.data;

      // Verify no prohibited synthetic fields exist in DTO
      expect((data as any).riskScore).toBeUndefined();
      expect((data as any).overallOperationalScore).toBeUndefined();
      expect((data as any).confidenceScoreAsProbability).toBeUndefined();
      expect((data as any).aiPriorityScore).toBeUndefined();
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 23 — RECENT ACTIVITY
  // ------------------------------------------------------------
  describe('Group 23: Recent Activity Feed from Persisted Audit Trail', () => {
    it('28. builds recent activity from audit trail ordered newest first', () => {
      const actions: any[] = [
        {
          actionId: 'act_101',
          auditTrail: [
            {
              from: 'NONE',
              to: 'OPEN',
              actorId: 'user_1',
              actorRole: 'OFFICER',
              timestamp: new Date('2026-09-26T10:00:00.000Z'),
              reason: 'Created from event',
            },
            {
              from: 'OPEN',
              to: 'ASSIGNED',
              actorId: 'user_2',
              actorRole: 'OFFICER',
              timestamp: new Date('2026-09-26T10:30:00.000Z'),
              reason: 'Assigned to field staff',
            },
          ],
        },
        {
          actionId: 'act_102',
          auditTrail: [
            {
              from: 'ASSIGNED',
              to: 'COMPLETED',
              actorId: 'user_3',
              actorRole: 'OFFICER',
              timestamp: new Date('2026-09-26T11:00:00.000Z'),
              reason: 'Inspection completed successfully',
            },
          ],
        },
      ];

      const activity = buildRecentActivity(actions, 10);
      expect(activity.length).toBe(3);

      // Newest first: act_102 (11:00) then act_101 (10:30) then act_101 (10:00)
      expect(activity[0].actionId).toBe('act_102');
      expect(activity[0].transition).toBe('ASSIGNED -> COMPLETED');
      expect(activity[1].actionId).toBe('act_101');
      expect(activity[1].transition).toBe('OPEN -> ASSIGNED');
      expect(activity[2].actionId).toBe('act_101');
      expect(activity[2].transition).toBe('NONE -> OPEN');
    });
  });

  // ------------------------------------------------------------
  // TEST GROUP 24 & 25 — ERROR BOUNDARIES & NO FASTAPI LEAKAGE
  // ------------------------------------------------------------
  describe('Groups 24 & 25: Error Boundaries & No Internal Leakage', () => {
    it('29. does not leak stack traces, database credentials, or internal URLs in errors', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center?timeHorizon=invalid_horizon')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(400);
      const str = JSON.stringify(res.body);
      expect(str).not.toMatch(/mongodb:\/\//i);
      expect(str).not.toMatch(/password/i);
      expect(str).not.toMatch(/node_modules/i);
      expect(str).not.toMatch(/localhost:8000/);
      expect(str).not.toMatch(/:8000/);
    });

    it('30. command center endpoint does not leak port 8000 in successful response', async () => {
      const res = await request(app)
        .get('/api/v1/operations/command-center')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      const str = JSON.stringify(res.body);
      expect(str).not.toMatch(/localhost:8000/);
      expect(str).not.toMatch(/:8000/);
    });
  });
});
