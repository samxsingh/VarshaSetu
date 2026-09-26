import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useRealtimeStore } from '../stores/useRealtimeStore';
import { OperationalSignalDTO, InspectionActionDTO } from '../services/operationalService';
import { socketClient } from '../services/socketClient';

describe('Command Center Realtime Store Bindings (Phase 7D Stage 6)', () => {
  beforeEach(() => {
    useRealtimeStore.setState({
      connectionStatus: 'DISCONNECTED',
      lastConnectedAt: null,
      lastEventAt: null,
      unreadEventCount: 0,
      recentEvents: [],
      recentNotifications: [],
      recentForecastUpdates: [],
      latestDataHealth: null,
      operationalSignals: [],
      inspectionActions: [],
      connectionError: null,
      commandCenterStale: false,
      commandCenterLastInvalidatedAt: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockSignal: OperationalSignalDTO = {
    signalId: 'sig_rt_101',
    signalType: 'EVENT',
    title: 'Flash Flood Alert',
    summary: 'Expected heavy rainfall event',
    severity: 'CRITICAL',
    blockId: 'UP_LKO_BKT',
    detectedAt: '2026-09-26T12:00:00.000Z',
    validFrom: '2026-09-26T12:00:00.000Z',
    validUntil: '2026-09-27T12:00:00.000Z',
    probability: 0.85,
    confidenceStatus: 'PASS',
    operationalStatus: 'DIAGNOSTIC_ONLY',
    dataFreshness: 'FRESH',
    validationStatus: 'VALIDATED',
    sourceReferences: [],
    recommendedInspection: 'Inspect rain gauge',
    createdAt: '2026-09-26T12:00:00.000Z',
    updatedAt: '2026-09-26T12:00:00.000Z',
  };

  const mockAction: InspectionActionDTO = {
    actionId: 'act_rt_201',
    signalId: 'sig_rt_101',
    blockId: 'UP_LKO_BKT',
    actionType: 'DATA_QUALITY_CHECK',
    title: 'Sensor Validation',
    description: 'Verify gauge calibration',
    status: 'OPEN',
    priority: 'P1',
    createdBy: 'officer-1',
    assignedTo: undefined,
    assignedRole: undefined,
    creatorRole: 'OFFICER',
    severity: 'CRITICAL',
    evidenceSnapshot: {
      originatingSignalType: 'EVENT',
      originatingSeverity: 'CRITICAL',
      detectedAt: '2026-09-26T12:00:00.000Z',
      scientificDisclosures: ['DIAGNOSTIC_ONLY'],
      sourceReferences: [],
    },
    auditTrail: [],
    createdAt: '2026-09-26T12:05:00.000Z',
    updatedAt: '2026-09-26T12:05:00.000Z',
  };

  it('1. verifies initial commandCenterStale is false and timestamp is null', () => {
    const state = useRealtimeStore.getState();
    expect(state.commandCenterStale).toBe(false);
    expect(state.commandCenterLastInvalidatedAt).toBeNull();
  });

  it('2. invalidateCommandCenter sets stale = true and updates timestamp', () => {
    useRealtimeStore.getState().invalidateCommandCenter();
    const state = useRealtimeStore.getState();
    expect(state.commandCenterStale).toBe(true);
    expect(state.commandCenterLastInvalidatedAt).toBeDefined();
    expect(typeof state.commandCenterLastInvalidatedAt).toBe('string');
  });

  it('3. markCommandCenterFresh resets stale = false', () => {
    useRealtimeStore.getState().invalidateCommandCenter();
    expect(useRealtimeStore.getState().commandCenterStale).toBe(true);

    useRealtimeStore.getState().markCommandCenterFresh();
    expect(useRealtimeStore.getState().commandCenterStale).toBe(false);
  });

  it('4. addOperationalSignal stores signal, preserves deduplication, and sets commandCenterStale = true', () => {
    expect(useRealtimeStore.getState().commandCenterStale).toBe(false);

    useRealtimeStore.getState().addOperationalSignal(mockSignal);

    const state = useRealtimeStore.getState();
    expect(state.operationalSignals).toHaveLength(1);
    expect(state.operationalSignals[0].signalId).toBe('sig_rt_101');
    expect(state.commandCenterStale).toBe(true);
    expect(state.commandCenterLastInvalidatedAt).not.toBeNull();

    // Deduplication check: updating same signal replaces in-place
    const updatedSignal = { ...mockSignal, summary: 'Updated summary' };
    useRealtimeStore.getState().addOperationalSignal(updatedSignal);

    const stateAfter = useRealtimeStore.getState();
    expect(stateAfter.operationalSignals).toHaveLength(1);
    expect(stateAfter.operationalSignals[0].summary).toBe('Updated summary');
  });

  it('5. addOrUpdateInspectionAction stores action and sets commandCenterStale = true', () => {
    expect(useRealtimeStore.getState().commandCenterStale).toBe(false);

    useRealtimeStore.getState().addOrUpdateInspectionAction(mockAction);

    const state = useRealtimeStore.getState();
    expect(state.inspectionActions).toHaveLength(1);
    expect(state.inspectionActions[0].actionId).toBe('act_rt_201');
    expect(state.commandCenterStale).toBe(true);
    expect(state.commandCenterLastInvalidatedAt).not.toBeNull();
  });

  it('6. inspection:created transition invalidates command center', () => {
    useRealtimeStore.getState().markCommandCenterFresh();
    expect(useRealtimeStore.getState().commandCenterStale).toBe(false);

    useRealtimeStore.getState().addOrUpdateInspectionAction({
      ...mockAction,
      status: 'OPEN',
    });

    expect(useRealtimeStore.getState().commandCenterStale).toBe(true);
  });

  it('7. inspection:assigned transition invalidates command center', () => {
    useRealtimeStore.getState().markCommandCenterFresh();

    useRealtimeStore.getState().addOrUpdateInspectionAction({
      ...mockAction,
      status: 'ASSIGNED',
      assignedTo: 'tech-1',
    });

    expect(useRealtimeStore.getState().commandCenterStale).toBe(true);
  });

  it('8. inspection:started transition invalidates command center', () => {
    useRealtimeStore.getState().markCommandCenterFresh();

    useRealtimeStore.getState().addOrUpdateInspectionAction({
      ...mockAction,
      status: 'IN_PROGRESS',
    });

    expect(useRealtimeStore.getState().commandCenterStale).toBe(true);
  });

  it('9. inspection:completed transition invalidates command center', () => {
    useRealtimeStore.getState().markCommandCenterFresh();

    useRealtimeStore.getState().addOrUpdateInspectionAction({
      ...mockAction,
      status: 'COMPLETED',
      completionNotes: 'Audit complete',
    });

    expect(useRealtimeStore.getState().commandCenterStale).toBe(true);
  });

  it('10. inspection:cancelled transition invalidates command center', () => {
    useRealtimeStore.getState().markCommandCenterFresh();

    useRealtimeStore.getState().addOrUpdateInspectionAction({
      ...mockAction,
      status: 'CANCELLED',
      cancellationReason: 'False alarm',
    });

    expect(useRealtimeStore.getState().commandCenterStale).toBe(true);
  });

  it('11. connection status is decoupled from commandCenterStale', () => {
    useRealtimeStore.getState().setConnectionStatus('CONNECTED');
    expect(useRealtimeStore.getState().connectionStatus).toBe('CONNECTED');
    expect(useRealtimeStore.getState().commandCenterStale).toBe(false);

    useRealtimeStore.getState().setConnectionStatus('DISCONNECTED');
    expect(useRealtimeStore.getState().connectionStatus).toBe('DISCONNECTED');
    expect(useRealtimeStore.getState().commandCenterStale).toBe(false);
  });
});
