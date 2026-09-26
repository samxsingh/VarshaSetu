import { describe, it, expect, vi, beforeEach } from 'vitest';
import { operationalService, OperationalCommandCenterDTO } from '../services/operationalService';
import { apiClient } from '../services/apiClient';

describe('operationalService.getCommandCenter (Phase 7D Frontend API Integration)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockCommandCenterDTO: OperationalCommandCenterDTO = {
    timestamp: '2026-09-26T12:00:00.000Z',
    scope: {
      blockId: 'UP_LKO_BKT',
      userRole: 'ANALYST',
    },
    systemStatus: {
      forecastServiceStatus: 'DIAGNOSTIC_ONLY',
      modelRegistryStatus: 'OPERATIONAL_CALIBRATED_BENCHMARKS_ACTIVE',
      dataFreshnessStatus: 'HISTORICAL_ONLY',
      validationStatus: 'INSUFFICIENT_DATA',
      activeDataset: 'Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)',
      scientificDisclosures: ['DIAGNOSTIC_ONLY status enforced.'],
    },
    signalSummary: {
      total: 5,
      bySeverity: {
        CRITICAL: 1,
        WARNING: 2,
        WATCH: 1,
        INFO: 1,
      },
      byType: {
        EVENT: 2,
        FORECAST_CHANGE: 1,
        ADVISORY: 1,
        OPERATIONAL_GATE: 1,
      },
    },
    actionSummary: {
      totalActions: 3,
      openCount: 1,
      assignedCount: 1,
      inProgressCount: 0,
      completedCount: 1,
      cancelledCount: 0,
      averageTimeToResolutionHours: null,
    },
    coverage: {
      totalActiveSignals: 5,
      actionedSignalsCount: 3,
      unactionedSignalsCount: 2,
      coveragePercentage: 60.0,
      criticalSignalsUnactioned: 0,
    },
    aging: {
      lessThan1h: 1,
      between1hAnd6h: 1,
      between6hAnd24h: 0,
      between24hAnd72h: 1,
      greaterThan72h: 0,
    },
    attentionQueue: [
      {
        id: 'att_sig_1',
        sourceType: 'SIGNAL',
        sourceId: 'sig_1',
        title: 'Flash Flood Watch',
        severity: 'WARNING',
        priority: 'P2',
        reason: 'UNASSIGNED_HIGH_PRIORITY',
        blockId: 'UP_LKO_BKT',
        status: 'ACTIVE',
        ageHours: 2.5,
        detectedAt: '2026-09-26T09:30:00.000Z',
      },
    ],
    recentActivity: [
      {
        id: 'act_audit_1',
        actionId: 'act_1',
        transition: 'OPEN -> ASSIGNED',
        performedBy: 'officer-1',
        role: 'OFFICER',
        timestamp: '2026-09-26T11:00:00.000Z',
        notes: 'Dispatched field inspector',
      },
    ],
  };

  it('1. calls GET /operations/command-center with default/no params', async () => {
    const spyGet = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockCommandCenterDTO,
      meta: { timestamp: new Date().toISOString(), dataMode: 'REAL' },
    });

    const res = await operationalService.getCommandCenter();

    expect(spyGet).toHaveBeenCalledWith('/operations/command-center', {
      params: undefined,
    });
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockCommandCenterDTO);
  });

  it('2. serializes timeHorizon=24h correctly', async () => {
    const spyGet = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockCommandCenterDTO,
      meta: { timestamp: new Date().toISOString(), dataMode: 'REAL' },
    });

    await operationalService.getCommandCenter({ timeHorizon: '24h' });

    expect(spyGet).toHaveBeenCalledWith('/operations/command-center', {
      params: { timeHorizon: '24h' },
    });
  });

  it('3. serializes timeHorizon=7d correctly', async () => {
    const spyGet = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockCommandCenterDTO,
      meta: { timestamp: new Date().toISOString(), dataMode: 'REAL' },
    });

    await operationalService.getCommandCenter({ timeHorizon: '7d' });

    expect(spyGet).toHaveBeenCalledWith('/operations/command-center', {
      params: { timeHorizon: '7d' },
    });
  });

  it('4. serializes timeHorizon=30d correctly', async () => {
    const spyGet = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockCommandCenterDTO,
      meta: { timestamp: new Date().toISOString(), dataMode: 'REAL' },
    });

    await operationalService.getCommandCenter({ timeHorizon: '30d' });

    expect(spyGet).toHaveBeenCalledWith('/operations/command-center', {
      params: { timeHorizon: '30d' },
    });
  });

  it('5. serializes blockId parameter correctly', async () => {
    const spyGet = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockCommandCenterDTO,
      meta: { timestamp: new Date().toISOString(), dataMode: 'REAL' },
    });

    await operationalService.getCommandCenter({ blockId: 'UP_LKO_BKT' });

    expect(spyGet).toHaveBeenCalledWith('/operations/command-center', {
      params: { blockId: 'UP_LKO_BKT' },
    });
  });

  it('6. serializes combined blockId and timeHorizon correctly', async () => {
    const spyGet = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockCommandCenterDTO,
      meta: { timestamp: new Date().toISOString(), dataMode: 'REAL' },
    });

    await operationalService.getCommandCenter({ blockId: 'UP_LKO_BKT', timeHorizon: '24h' });

    expect(spyGet).toHaveBeenCalledWith('/operations/command-center', {
      params: { blockId: 'UP_LKO_BKT', timeHorizon: '24h' },
    });
  });

  it('7. returns correctly typed response envelope and payload', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockCommandCenterDTO,
      meta: { requestId: 'req-123', timestamp: '2026-09-26T12:00:00.000Z', dataMode: 'REAL' },
    });

    const res = await operationalService.getCommandCenter();

    expect(res.success).toBe(true);
    expect(res.data?.scope.blockId).toBe('UP_LKO_BKT');
    expect(res.data?.actionSummary.openCount).toBe(1);
    expect(res.data?.coverage.coveragePercentage).toBe(60.0);
    expect(res.data?.aging.lessThan1h).toBe(1);
  });

  it('8. preserves null averageTimeToResolutionHours without converting to zero', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: {
        ...mockCommandCenterDTO,
        actionSummary: {
          ...mockCommandCenterDTO.actionSummary,
          averageTimeToResolutionHours: null,
        },
      },
    });

    const res = await operationalService.getCommandCenter();
    expect(res.data?.actionSummary.averageTimeToResolutionHours).toBeNull();
    expect(res.data?.actionSummary.averageTimeToResolutionHours).not.toBe(0);
  });

  it('9. propagates backend errors cleanly', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Network error or 403 Forbidden'));

    await expect(operationalService.getCommandCenter()).rejects.toThrow(
      'Network error or 403 Forbidden'
    );
  });
});
