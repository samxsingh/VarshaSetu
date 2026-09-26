import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { app } from '../../src/app';
import { initSocketServer, closeSocketServer, realtimeService } from '../../src/realtime';
import { signAuthToken } from '../../src/utils/jwt';
import { UserRole } from '@shared/types';

describe('Phase 5: Real-time Socket.IO Gateway & RBAC Room Authorization', () => {
  let httpServer: http.Server;
  let serverPort: number;
  let farmerToken: string;
  let officerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Generate valid tokens for tests
    farmerToken = signAuthToken({
      userId: 'usr_farmer_test',
      role: 'FARMER',
      permissions: ['farmer:profile:read', 'farmer:advisory:read'],
      assignedLocationId: 'UP_LKO_BKT',
    });

    officerToken = signAuthToken({
      userId: 'usr_officer_test',
      role: 'OFFICER',
      permissions: ['officer:district:read', 'officer:bulletin:broadcast'],
      assignedLocationId: 'UP_LKO',
    });

    adminToken = signAuthToken({
      userId: 'usr_admin_test',
      role: 'ADMIN',
      permissions: ['admin:users:manage', 'admin:system_health:read'],
    });

    // Create and start dedicated test HTTP server with Socket.IO
    httpServer = http.createServer(app);
    initSocketServer(httpServer);

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const addr = httpServer.address() as any;
        serverPort = addr.port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await closeSocketServer();
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  });

  const createClient = (token?: string, extraAuth?: Record<string, any>): ClientSocket => {
    return Client(`http://localhost:${serverPort}`, {
      auth: token ? { token, ...extraAuth } : undefined,
      transports: ['websocket'],
      forceNew: true,
      autoConnect: true,
    });
  };

  describe('1. Socket Authentication & Rejection Guards', () => {
    it('rejects unauthenticated socket connections with AUTHENTICATION_REQUIRED', async () => {
      const client = createClient();

      const err: any = await new Promise((resolve) => {
        client.on('connect_error', (error) => resolve(error));
      });

      expect(err.message).toContain('AUTHENTICATION_REQUIRED');
      client.disconnect();
    });

    it('rejects connections with invalid or corrupted JWT tokens', async () => {
      const client = createClient('corrupted.bogus.jwt');

      const err: any = await new Promise((resolve) => {
        client.on('connect_error', (error) => resolve(error));
      });

      expect(err.message).toContain('AUTHENTICATION_FAILED');
      client.disconnect();
    });

    it('successfully connects with a valid signed JWT', async () => {
      const client = createClient(farmerToken);

      await new Promise<void>((resolve, reject) => {
        client.on('connect', () => resolve());
        client.on('connect_error', (err) => reject(err));
      });

      expect(client.connected).toBe(true);

      // Verify health ping
      const pingRes: any = await new Promise((resolve) => {
        client.emit('ping:health', (res: any) => resolve(res));
      });

      expect(pingRes.status).toBe('OK');
      expect(pingRes.role).toBe('FARMER');

      client.disconnect();
    });
  });

  describe('2. Server-Enforced Room Authorization & Isolation', () => {
    it('automatically joins authorized personal, role, and block rooms on connection', async () => {
      const client = createClient(farmerToken);

      await new Promise<void>((resolve) => {
        client.on('connect', () => resolve());
      });

      // Farmer should receive events for their block
      let eventReceived: any = null;
      client.on('event:created', (data) => {
        eventReceived = data;
      });

      // Emit event for UP_LKO_BKT
      realtimeService.emitEventCreated({
        eventId: 'evt_test_001',
        eventType: 'HEAVY_RAIN_RISK',
        forecastId: 'fc_001',
        blockId: 'UP_LKO_BKT',
        detectedAt: new Date().toISOString(),
        validFrom: '2026-09-27T00:00:00Z',
        validUntil: '2026-09-30T00:00:00Z',
        probability: 0.82,
        threshold: 65,
        unit: 'mm',
        severity: 'WARNING',
        confidenceStatus: 'HIGH_CONFIDENCE',
        operationalStatus: 'DIAGNOSTIC_ONLY',
        dataFreshness: 'HISTORICAL_ONLY',
        validationStatus: 'VALIDATED',
        state: 'DETECTED',
        description: 'Heavy precipitation forecast alert',
        deduplicationHash: 'hash_test_001',
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(eventReceived).not.toBeNull();
      expect(eventReceived.eventId).toBe('evt_test_001');
      expect(eventReceived.blockId).toBe('UP_LKO_BKT');

      client.disconnect();
    });

    it('rejects Farmer attempt to join role:officer room', async () => {
      const client = createClient(farmerToken);

      await new Promise<void>((resolve) => {
        client.on('connect', () => resolve());
      });

      const res: any = await new Promise((resolve) => {
        client.emit('room:join', 'role:officer', (response: any) => resolve(response));
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('is not authorized to join');

      client.disconnect();
    });

    it('rejects Farmer attempt to join unrelated agricultural block', async () => {
      const client = createClient(farmerToken);

      await new Promise<void>((resolve) => {
        client.on('connect', () => resolve());
      });

      const res: any = await new Promise((resolve) => {
        client.emit('room:join', 'block:UP_VAR_PINDRA', (response: any) => resolve(response));
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Farmer is restricted to assigned agricultural block');

      client.disconnect();
    });

    it('permits Officer to join Lucknow circle block rooms', async () => {
      const client = createClient(officerToken);

      await new Promise<void>((resolve) => {
        client.on('connect', () => resolve());
      });

      const res: any = await new Promise((resolve) => {
        client.emit('room:join', 'block:UP_LKO_MAL', (response: any) => resolve(response));
      });

      expect(res.success).toBe(true);
      expect(res.room).toBe('block:UP_LKO_MAL');

      client.disconnect();
    });

    it('permits ADMIN universal room access to any role or geographic room', async () => {
      const client = createClient(adminToken);

      await new Promise<void>((resolve) => {
        client.on('connect', () => resolve());
      });

      const resRole: any = await new Promise((resolve) => {
        client.emit('room:join', 'role:analyst', (response: any) => resolve(response));
      });
      expect(resRole.success).toBe(true);

      const resGeo: any = await new Promise((resolve) => {
        client.emit('room:join', 'block:UP_VAR_PINDRA', (response: any) => resolve(response));
      });
      expect(resGeo.success).toBe(true);

      client.disconnect();
    });
  });

  describe('3. Targeted Event Synchronization & DTO Delivery', () => {
    it('delivers forecast:updated event with sanitized non-leaking DTO', async () => {
      const client = createClient(officerToken);

      await new Promise<void>((resolve) => {
        client.on('connect', () => resolve());
      });

      let receivedForecast: any = null;
      client.on('forecast:updated', (data) => {
        receivedForecast = data;
      });

      realtimeService.emitForecastUpdated({
        forecastId: 'fc_2026_test',
        blockId: 'UP_LKO_BKT',
        targetType: 'HEAVY_RAIN',
        horizonDays: 7,
        validFrom: '2026-10-01',
        validUntil: '2026-10-07',
        probability: 0.76,
        predictedValue: 72.4,
        unit: 'mm',
        severity: 'WARNING',
        confidenceStatus: 'HIGH_CONFIDENCE',
        operationalStatus: 'DIAGNOSTIC_ONLY',
        dataFreshness: 'HISTORICAL_ONLY',
        modelId: 'xgboost',
        modelVersion: '1.2.0',
        generatedAt: new Date().toISOString(),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(receivedForecast).not.toBeNull();
      expect(receivedForecast.forecastId).toBe('fc_2026_test');
      expect(receivedForecast.probability).toBe(0.76);
      expect(receivedForecast.operationalStatus).toBe('DIAGNOSTIC_ONLY');
      // Verify no leaked database or secret fields
      expect(receivedForecast).not.toHaveProperty('_id');
      expect(receivedForecast).not.toHaveProperty('databaseUri');

      client.disconnect();
    });

    it('delivers notification:received exclusively to the target user room', async () => {
      const farmerClient = createClient(farmerToken);
      const officerClient = createClient(officerToken);

      await Promise.all([
        new Promise<void>((resolve) => farmerClient.on('connect', () => resolve())),
        new Promise<void>((resolve) => officerClient.on('connect', () => resolve())),
      ]);

      let farmerNotification: any = null;
      let officerNotification: any = null;

      farmerClient.on('notification:received', (n) => {
        farmerNotification = n;
      });
      officerClient.on('notification:received', (n) => {
        officerNotification = n;
      });

      // Emit notification targeted specifically to farmer ('usr_farmer_test')
      realtimeService.emitNotification('usr_farmer_test', {
        id: 'notif_001',
        deliveryId: 'del_001',
        userId: 'usr_farmer_test',
        title: 'Monsoon Advisory Alert',
        body: 'Heavy rainfall expected in Bakshi Ka Talab over the next 48h.',
        severity: 'WARNING',
        channel: 'IN_APP',
        status: 'DELIVERED',
        timestamp: new Date().toISOString(),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Farmer receives the alert
      expect(farmerNotification).not.toBeNull();
      expect(farmerNotification.id).toBe('notif_001');

      // Officer does NOT receive the farmer's private notification
      expect(officerNotification).toBeNull();

      farmerClient.disconnect();
      officerClient.disconnect();
    });
  });
});
