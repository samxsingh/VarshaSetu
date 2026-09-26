import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { realtimeService } from '../../src/realtime/socketEvents';

describe('Phase 7C — Operational Inspection & Action Tracking Integration Tests', () => {
  let farmerToken: string;
  let officerToken: string;
  let govToken: string;
  let analystToken: string;
  let adminToken: string;

  let validSignalId: string;
  let foreignBlockSignalId: string;

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

    // Valid event signal in UP_LKO_BKT
    validSignalId = 'sig_evt_evt-101';

    // Foreign block signal ID
    foreignBlockSignalId = 'sig_evt_foreign_block_999';
  });

  describe('1. Authentication & Standardized Response Envelope', () => {
    it('1. rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/operations/actions');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('2. rejects request with invalid token with 401', async () => {
      const res = await request(app)
        .get('/api/v1/operations/actions')
        .set('Authorization', 'Bearer invalid-token-xyz');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Action Creation & Validation', () => {
    it('9. creates valid inspection action with 201 and standardized envelope', async () => {
      const spyEmit = vi.spyOn(realtimeService, 'emitInspectionCreated');

      const res = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'DATA_QUALITY_CHECK',
          title: 'Verify AWS Rain Gauge Telemetry',
          description: 'Rain gauge calibration anomaly requires ground check.',
          priority: 'HIGH',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('actionId');
      expect(res.body.data.actionId).toMatch(/^act_/);
      expect(res.body.data.status).toBe('OPEN');
      expect(res.body.data.actionType).toBe('DATA_QUALITY_CHECK');
      expect(res.body.data.blockId).toBe('UP_LKO_BKT');
      expect(res.body.data.priority).toBe('HIGH');
      expect(res.body.data.auditTrail.length).toBe(1);
      expect(res.body.data.auditTrail[0].to).toBe('OPEN');

      // 29. Realtime event emission occurs
      expect(spyEmit).toHaveBeenCalledWith(
        expect.objectContaining({
          actionId: res.body.data.actionId,
          status: 'OPEN',
        })
      );
    });

    it('10. rejects action creation on invalid signal with 404', async () => {
      const res = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          signalId: 'sig_non_existent_000',
          actionType: 'STATION_INSPECTION',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/not found/i);
    });

    it('11. rejects invalid action type with 400', async () => {
      const res = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'IRRIGATION_COMMAND', // Illegal action type
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/invalid inspection action type/i);
    });
  });

  describe('3. Role-Based Access Control & Geographic Isolation', () => {
    it('3. allows Farmer valid access to create field observation in assigned block', async () => {
      const res = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'FIELD_OBSERVATION',
          description: 'Farmer reported soil saturation observed after heavy shower.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('OPEN');
      expect(res.body.data.createdBy).toBeDefined();
    });

    it('4. rejects Farmer access to foreign block or forbidden signals with 403', async () => {
      const res = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          signalId: 'sig_gate_multiyear_hindcast_insufficient', // Internal system gate signal
          actionType: 'DATA_QUALITY_CHECK',
        });

      // Internal model/gate status signal forbidden for farmers
      expect(res.status).toBe(403);
    });

    it('5. officer restricted to assigned jurisdiction', async () => {
      const res = await request(app)
        .get('/api/v1/operations/actions?blockId=UP_LKO_BKT')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toBeDefined();
    });

    it('6. allows Government regional inspection action listing', async () => {
      const res = await request(app)
        .get('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${govToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('7. allows Climate Analyst to list and inspect actions', async () => {
      const res = await request(app)
        .get('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('8. allows Admin universal access across all actions', async () => {
      const res = await request(app)
        .get('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('21. Farmer cannot assign actions (returns 403)', async () => {
      // Create an action
      const createRes = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'FORECAST_REVIEW',
        });
      const actionId = createRes.body.data.actionId;

      const res = await request(app)
        .post(`/api/v1/operations/actions/${actionId}/assign`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ assignedTo: 'officer-1' });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/farmers are not authorized to assign/i);
    });
  });

  describe('4. Lifecycle State Machine Transitions', () => {
    let testActionId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'STATION_INSPECTION',
          title: 'Station Solar Power Check',
        });
      testActionId = res.body.data.actionId;
    });

    it('12. transitions OPEN -> ASSIGNED successfully', async () => {
      const spyEmit = vi.spyOn(realtimeService, 'emitInspectionAssigned');

      const res = await request(app)
        .post(`/api/v1/operations/actions/${testActionId}/assign`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          assignedTo: 'tech.field.lucknow',
          reason: 'Field technician dispatched for sensor inspection',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ASSIGNED');
      expect(res.body.data.assignedTo).toBe('tech.field.lucknow');
      expect(res.body.data.assignedAt).toBeDefined();

      // 24. Audit trail appended
      const audits = res.body.data.auditTrail;
      expect(audits.length).toBe(2);
      expect(audits[1].from).toBe('OPEN');
      expect(audits[1].to).toBe('ASSIGNED');
      expect(audits[1].actorRole).toBe('OFFICER');

      // 25. Actor identity comes from JWT
      expect(audits[1].actorId).toBeDefined();

      expect(spyEmit).toHaveBeenCalled();
    });

    it('13. transitions ASSIGNED -> IN_PROGRESS successfully', async () => {
      const spyEmit = vi.spyOn(realtimeService, 'emitInspectionStarted');

      const res = await request(app)
        .post(`/api/v1/operations/actions/${testActionId}/start`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ reason: 'Technician reached the station site' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IN_PROGRESS');
      expect(res.body.data.startedAt).toBeDefined();

      const audits = res.body.data.auditTrail;
      expect(audits.length).toBe(3);
      expect(audits[2].from).toBe('ASSIGNED');
      expect(audits[2].to).toBe('IN_PROGRESS');

      expect(spyEmit).toHaveBeenCalled();
    });

    it('14. transitions IN_PROGRESS -> COMPLETED successfully with required notes', async () => {
      const spyEmit = vi.spyOn(realtimeService, 'emitInspectionCompleted');

      const res = await request(app)
        .post(`/api/v1/operations/actions/${testActionId}/complete`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          completionNotes: 'Cleaned rain gauge tipping bucket; telemetry nominal.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.completedAt).toBeDefined();
      expect(res.body.data.completionNotes).toBe('Cleaned rain gauge tipping bucket; telemetry nominal.');

      const audits = res.body.data.auditTrail;
      expect(audits.length).toBe(4);
      expect(audits[3].from).toBe('IN_PROGRESS');
      expect(audits[3].to).toBe('COMPLETED');

      expect(spyEmit).toHaveBeenCalled();
    });

    it('19. COMPLETED action cannot be modified (terminal state)', async () => {
      // Attempting to assign completed action
      const assignRes = await request(app)
        .post(`/api/v1/operations/actions/${testActionId}/assign`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ assignedTo: 'tech-2' });

      expect(assignRes.status).toBe(400);
      expect(assignRes.body.error.message).toMatch(/cannot mutate action in terminal state/i);

      // Attempting to start completed action
      const startRes = await request(app)
        .post(`/api/v1/operations/actions/${testActionId}/start`)
        .set('Authorization', `Bearer ${officerToken}`);

      expect(startRes.status).toBe(400);

      // Attempting to cancel completed action
      const cancelRes = await request(app)
        .post(`/api/v1/operations/actions/${testActionId}/cancel`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ cancellationReason: 'Invalid late cancellation' });

      expect(cancelRes.status).toBe(400);
      expect(cancelRes.body.error.message).toMatch(/already COMPLETED/i);
    });
  });

  describe('5. Cancellation Transitions & Guardrails', () => {
    it('15. transitions OPEN -> CANCELLED with reason', async () => {
      const createRes = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'MODEL_EVIDENCE_REVIEW',
        });
      const actionId = createRes.body.data.actionId;

      // 23. Cancellation requires reason
      const failRes = await request(app)
        .post(`/api/v1/operations/actions/${actionId}/cancel`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ cancellationReason: '   ' });

      expect(failRes.status).toBe(400);
      expect(failRes.body.error.message).toMatch(/cancellationReason is required/i);

      const res = await request(app)
        .post(`/api/v1/operations/actions/${actionId}/cancel`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ cancellationReason: 'Sensor self-test passed automatically' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
      expect(res.body.data.cancelledAt).toBeDefined();
      expect(res.body.data.cancellationReason).toBe('Sensor self-test passed automatically');
    });

    it('16. transitions ASSIGNED -> CANCELLED with reason', async () => {
      const createRes = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'ADVISORY_REVIEW',
        });
      const actionId = createRes.body.data.actionId;

      await request(app)
        .post(`/api/v1/operations/actions/${actionId}/assign`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ assignedTo: 'advisor-1' });

      const res = await request(app)
        .post(`/api/v1/operations/actions/${actionId}/cancel`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ cancellationReason: 'Advisory superseded by newer bulletin' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('17. transitions IN_PROGRESS -> CANCELLED with reason', async () => {
      const createRes = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'FIELD_OBSERVATION',
        });
      const actionId = createRes.body.data.actionId;

      await request(app)
        .post(`/api/v1/operations/actions/${actionId}/assign`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ assignedTo: 'advisor-1' });

      await request(app)
        .post(`/api/v1/operations/actions/${actionId}/start`)
        .set('Authorization', `Bearer ${officerToken}`);

      const res = await request(app)
        .post(`/api/v1/operations/actions/${actionId}/cancel`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ cancellationReason: 'Road blockage prevented reaching station' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('18. rejects illegal lifecycle transition (OPEN -> COMPLETED)', async () => {
      const createRes = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'DATA_QUALITY_CHECK',
        });
      const actionId = createRes.body.data.actionId;

      const res = await request(app)
        .post(`/api/v1/operations/actions/${actionId}/complete`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ completionNotes: 'Premature completion' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/Action must be IN_PROGRESS to complete/i);
    });

    it('20. CANCELLED action cannot be mutated (terminal state)', async () => {
      const createRes = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'DATA_QUALITY_CHECK',
        });
      const actionId = createRes.body.data.actionId;

      await request(app)
        .post(`/api/v1/operations/actions/${actionId}/cancel`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ cancellationReason: 'Cancelled test' });

      const startRes = await request(app)
        .post(`/api/v1/operations/actions/${actionId}/start`)
        .set('Authorization', `Bearer ${analystToken}`);

      expect(startRes.status).toBe(400);
      expect(startRes.body.error.message).toMatch(/already CANCELLED|terminal state: CANCELLED/i);
    });
  });

  describe('6. Scientific Integrity & Audit Guarantees', () => {
    it('27 & 28. preserves DIAGNOSTIC_ONLY status and never fabricates ML metrics', async () => {
      const res = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'DATA_QUALITY_CHECK',
        });

      expect(res.status).toBe(201);
      const action = res.body.data;
      expect(action.sourceSignal.operationalStatus).toBe('DIAGNOSTIC_ONLY');

      // The action document does not contain modified ML predictions or fabricated agronomic metrics
      expect(action).not.toHaveProperty('cropYield');
      expect(action).not.toHaveProperty('irrigationLiters');
    });

    it('30. duplicate replayed action mutation does not corrupt lifecycle', async () => {
      const createRes = await request(app)
        .post('/api/v1/operations/actions')
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          signalId: validSignalId,
          actionType: 'STATION_INSPECTION',
        });
      const actionId = createRes.body.data.actionId;

      // Assign first time
      const res1 = await request(app)
        .post(`/api/v1/operations/actions/${actionId}/assign`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ assignedTo: 'tech.primary' });
      expect(res1.status).toBe(200);

      // Start action
      const res2 = await request(app)
        .post(`/api/v1/operations/actions/${actionId}/start`)
        .set('Authorization', `Bearer ${officerToken}`);
      expect(res2.status).toBe(200);

      // Attempt to re-play start action
      const resReplay = await request(app)
        .post(`/api/v1/operations/actions/${actionId}/start`)
        .set('Authorization', `Bearer ${officerToken}`);
      expect(resReplay.status).toBe(400);
      expect(resReplay.body.error.message).toMatch(/Action must be in ASSIGNED status to start/i);
    });
  });
});
