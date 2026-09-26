import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { OperationalCommandCenter } from '../components/operations/OperationalCommandCenter';
import {
  operationalService,
  OperationalCommandCenterDTO,
} from '../services/operationalService';
import { useRealtimeStore } from '../stores/useRealtimeStore';

// Mock child workspaces to isolate Command Center unit testing
vi.mock('../components/operations/OperationalSignalCenter', () => ({
  OperationalSignalCenter: ({ blockId, persona, title, description }: any) => (
    <div data-testid="mock-operational-signal-center">
      <h2>{title}</h2>
      <p>{description}</p>
      <span data-testid="child-signals-block">{blockId || 'ALL'}</span>
      <span data-testid="child-signals-persona">{persona}</span>
    </div>
  ),
}));

vi.mock('../components/operations/InspectionActionWorkspace', () => ({
  InspectionActionWorkspace: ({ blockId, persona, title, description, onNavigateSignal }: any) => (
    <div data-testid="mock-inspection-action-workspace">
      <h2>{title}</h2>
      <p>{description}</p>
      <span data-testid="child-actions-block">{blockId || 'ALL'}</span>
      <span data-testid="child-actions-persona">{persona}</span>
      <button
        data-testid="child-action-navigate-signal-btn"
        onClick={() => onNavigateSignal && onNavigateSignal('sig_target_from_child')}
      >
        Navigate Signal
      </button>
    </div>
  ),
}));

vi.mock('../components/operations/DecisionSupportWorkspace', () => ({
  DecisionSupportWorkspace: ({ signalId, isOpen, onClose, onActionCreated }: any) =>
    isOpen ? (
      <div data-testid="mock-decision-support-workspace">
        <span data-testid="decision-support-signal-id">{signalId}</span>
        <button data-testid="decision-support-close-btn" onClick={onClose}>
          Close
        </button>
        <button
          data-testid="decision-support-action-created-btn"
          onClick={() => onActionCreated && onActionCreated({ actionId: 'new_act' } as any)}
        >
          Action Created
        </button>
      </div>
    ) : null,
}));

vi.mock('../services/operationalService', async () => {
  const actual = (await vi.importActual('../services/operationalService')) as any;
  return {
    ...actual,
    operationalService: {
      ...actual.operationalService,
      getCommandCenter: vi.fn(),
    },
  };
});

describe('OperationalCommandCenter Component (Phase 7D Stage 8)', () => {
  const mockCommandCenterDTO: OperationalCommandCenterDTO = {
    timestamp: '2026-09-26T14:30:00.000Z',
    scope: {
      blockId: 'UP_LKO_BKT',
      userRole: 'OFFICER',
    },
    systemStatus: {
      forecastServiceStatus: 'DIAGNOSTIC_ONLY',
      modelRegistryStatus: 'OPERATIONAL_CALIBRATED_BENCHMARKS_ACTIVE',
      dataFreshnessStatus: 'HISTORICAL_ONLY',
      validationStatus: 'INSUFFICIENT_DATA',
      activeDataset: 'Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT, 122 daily records)',
      scientificDisclosures: [
        'Probability ≠ Confidence ≠ Operational Availability: Probability denotes meteorological likelihood; confidence reflects ensemble agreement and calibration reliability; operational availability signifies data pipeline readiness.',
        'Diagnostic-Only Operational Boundary: All operational intelligence signals and inspection actions support human decision-making only. The platform performs no automated farm actuation or physical equipment control.',
        'Kharif 2024 Baseline: Operational calibrations and verification gates are benchmarked against historical agro-meteorological records for Uttar Pradesh.',
      ],
    },
    signalSummary: {
      total: 12,
      bySeverity: {
        CRITICAL: 2,
        WARNING: 4,
        WATCH: 3,
        INFO: 3,
      },
      byType: {
        EVENT: 5,
        FORECAST_CHANGE: 3,
        ADVISORY: 2,
        OPERATIONAL_GATE: 2,
      },
    },
    actionSummary: {
      totalActions: 8,
      openCount: 2,
      assignedCount: 2,
      inProgressCount: 1,
      completedCount: 3,
      cancelledCount: 0,
      averageTimeToResolutionHours: null,
    },
    coverage: {
      totalActiveSignals: 12,
      actionedSignalsCount: 7,
      unactionedSignalsCount: 5,
      coveragePercentage: 58.3,
      criticalSignalsUnactioned: 1,
    },
    aging: {
      lessThan1h: 3,
      between1hAnd6h: 4,
      between6hAnd24h: 2,
      between24hAnd72h: 2,
      greaterThan72h: 1,
    },
    attentionQueue: [
      {
        id: 'att_item_1',
        sourceType: 'SIGNAL',
        sourceId: 'sig_crit_001',
        title: 'CRITICAL: Severe Flood Inundation Alert',
        severity: 'CRITICAL',
        priority: 'P1',
        reason: 'UNACTIONED_CRITICAL_SIGNAL',
        blockId: 'UP_LKO_BKT',
        status: 'ACTIVE',
        ageHours: 1.2,
        detectedAt: '2026-09-26T13:15:00.000Z',
      },
      {
        id: 'att_item_2',
        sourceType: 'ACTION',
        sourceId: 'act_p1_002',
        title: 'Emergency Sluice Gate Manual Audit',
        severity: 'CRITICAL',
        priority: 'P1',
        reason: 'OVERDUE_P1_ACTION',
        blockId: 'UP_LKO_BKT',
        status: 'OPEN',
        assignedTo: 'Officer Sharma',
        ageHours: 26.5,
        detectedAt: '2026-09-25T12:00:00.000Z',
      },
      {
        id: 'att_item_3',
        sourceType: 'ACTION',
        sourceId: 'act_stalled_003',
        title: 'Field Verification of Soil Moisture Sensor BKT-04',
        severity: 'WARNING',
        priority: 'P2',
        reason: 'STALLED_IN_PROGRESS',
        blockId: 'UP_LKO_BKT',
        status: 'IN_PROGRESS',
        assignedTo: 'Officer Verma',
        ageHours: 50.0,
        detectedAt: '2026-09-24T12:00:00.000Z',
      },
      {
        id: 'att_item_4',
        sourceType: 'SIGNAL',
        sourceId: 'sig_warn_004',
        title: 'WARNING: Pest Risk Advisory Threshold Met',
        severity: 'WARNING',
        priority: 'P2',
        reason: 'UNASSIGNED_HIGH_PRIORITY',
        blockId: 'UP_LKO_BKT',
        status: 'ACTIVE',
        ageHours: 4.0,
        detectedAt: '2026-09-26T10:30:00.000Z',
      },
      {
        id: 'att_item_5',
        sourceType: 'ACTION',
        sourceId: 'act_routine_005',
        title: 'Routine Automatic Weather Station Inspection',
        severity: 'INFO',
        priority: 'P4',
        reason: 'ROUTINE_MONITORING',
        blockId: 'UP_LKO_BKT',
        status: 'OPEN',
        ageHours: 74.0,
        detectedAt: '2026-09-23T12:00:00.000Z',
      },
    ],
    recentActivity: [
      {
        id: 'act_trans_1',
        actionId: 'act_p1_002',
        transition: 'ASSIGNED',
        performedBy: 'Lead Analyst',
        role: 'ADMIN',
        timestamp: '2026-09-26T14:10:00.000Z',
        notes: 'Assigned to field officer Sharma for priority review',
      },
      {
        id: 'act_trans_2',
        actionId: 'act_comp_000',
        transition: 'COMPLETED',
        performedBy: 'Officer Sharma',
        role: 'FIELD_OFFICER',
        timestamp: '2026-09-26T13:45:00.000Z',
        notes: 'Gauge checked and calibrated against manual cylinder',
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useRealtimeStore.setState({
      commandCenterStale: false,
      commandCenterLastInvalidatedAt: null,
      connectionStatus: 'CONNECTED',
    });
    (operationalService.getCommandCenter as any).mockResolvedValue({
      data: mockCommandCenterDTO,
      status: 200,
      headers: {},
      config: {} as any,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // Group 1 — Initial Render
  it('Group 1: renders Operational Command Center workspace successfully when API resolves', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('operational-command-center')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { level: 1, name: /operational command center/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Kharif 2024/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/UP_LKO_BKT/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Synced at:/i)).toBeInTheDocument();
  });

  // Group 2 — Executive Posture Bar
  it('Group 2: renders executive posture bar with DIAGNOSTIC_ONLY badge, connection pill, and horizon controls', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('posture-diagnostic-badge')).toBeInTheDocument();
    });

    expect(screen.getByTestId('posture-diagnostic-badge')).toHaveTextContent('DIAGNOSTIC ONLY');
    expect(screen.getByTestId('connection-status-pill')).toHaveTextContent(/CONNECTED/i);
    expect(screen.getByTestId('refresh-command-center-button')).toBeInTheDocument();
    expect(screen.getByTestId('time-horizon-24h')).toBeInTheDocument();
    expect(screen.getByTestId('time-horizon-7d')).toBeInTheDocument();
    expect(screen.getByTestId('time-horizon-30d')).toBeInTheDocument();
  });

  // Group 3 — Scientific Posture Strip
  it('Group 3: renders scientific posture strip with unmutated authoritative system states', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('scientific-posture-strip')).toBeInTheDocument();
    });

    const postureStrip = screen.getByTestId('scientific-posture-strip');
    expect(postureStrip).toHaveTextContent('DIAGNOSTIC_ONLY');
    expect(postureStrip).toHaveTextContent('OPERATIONAL_CALIBRATED_BENCHMARKS_ACTIVE');
    expect(postureStrip).toHaveTextContent('HISTORICAL_ONLY');
    expect(postureStrip).toHaveTextContent('INSUFFICIENT_DATA');
  });

  // Group 4 — KPI Grid
  it('Group 4: renders 4 executive KPI cards with exact DTO counts and labels', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('executive-kpi-grid')).toBeInTheDocument();
    });

    // Card 1: Active Signals
    const activeSignalsCard = screen.getByTestId('kpi-active-signals');
    expect(activeSignalsCard).toHaveTextContent('12');
    expect(activeSignalsCard).toHaveTextContent('2 Critical');
    expect(activeSignalsCard).toHaveTextContent('4 Warning');
    expect(activeSignalsCard).toHaveTextContent('6 Watch/Info');

    // Card 2: Resolution Pipeline
    const pipelineCard = screen.getByTestId('kpi-resolution-pipeline');
    expect(pipelineCard).toHaveTextContent('8');
    expect(pipelineCard).toHaveTextContent('2 Open');
    expect(pipelineCard).toHaveTextContent('2 Assigned');
    expect(pipelineCard).toHaveTextContent('1 In Prog');
    expect(pipelineCard).toHaveTextContent('3 Done');

    // Card 3: Attention Queue
    const queueCard = screen.getByTestId('kpi-attention-queue');
    expect(queueCard).toHaveTextContent('5');
    expect(queueCard).toHaveTextContent('1 Critical Unactioned');

    // Card 4: Human Review Coverage
    const coverageCard = screen.getByTestId('kpi-action-coverage');
    expect(coverageCard).toHaveTextContent('58.3%');
    expect(coverageCard).toHaveTextContent('7 Actioned');
    expect(coverageCard).toHaveTextContent('5 Pending Review');
  });

  // Group 5 — Attention Queue Ordering & Priorities
  it('Group 5: renders Attention Queue in exact backend-authoritative order with P1-P4 tags', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('panel-attention-queue')).toBeInTheDocument();
    });

    // Verify all 5 items rendered in exact backend order
    const item1 = screen.getByTestId('attention-queue-item-att_item_1');
    const item2 = screen.getByTestId('attention-queue-item-att_item_2');
    const item3 = screen.getByTestId('attention-queue-item-att_item_3');
    const item4 = screen.getByTestId('attention-queue-item-att_item_4');
    const item5 = screen.getByTestId('attention-queue-item-att_item_5');

    expect(item1).toHaveTextContent('P1 - Immediate');
    expect(item1).toHaveTextContent('CRITICAL: Severe Flood Inundation Alert');
    expect(item1).toHaveTextContent('Unactioned Critical Signal');
    expect(item1).toHaveTextContent('1.2h');

    expect(item2).toHaveTextContent('P1 - Immediate');
    expect(item2).toHaveTextContent('Emergency Sluice Gate Manual Audit');
    expect(item2).toHaveTextContent('Overdue P1 Action (>24h)');
    expect(item2).toHaveTextContent('Officer Sharma');

    expect(item3).toHaveTextContent('P2 - High');
    expect(item3).toHaveTextContent('Stalled In-Progress (>48h)');

    expect(item4).toHaveTextContent('P2 - High');
    expect(item4).toHaveTextContent('Unassigned High Priority');

    expect(item5).toHaveTextContent('P4 - Informational');
    expect(item5).toHaveTextContent('Routine Monitoring');

    // Verify order via DOM traversal
    const queuePanel = screen.getByTestId('panel-attention-queue');
    const articles = queuePanel.querySelectorAll('article');
    expect(articles).toHaveLength(5);
    expect(articles[0]).toHaveAttribute('data-testid', 'attention-queue-item-att_item_1');
    expect(articles[1]).toHaveAttribute('data-testid', 'attention-queue-item-att_item_2');
    expect(articles[2]).toHaveAttribute('data-testid', 'attention-queue-item-att_item_3');
    expect(articles[3]).toHaveAttribute('data-testid', 'attention-queue-item-att_item_4');
    expect(articles[4]).toHaveAttribute('data-testid', 'attention-queue-item-att_item_5');
  });

  // Group 6 — Attention Queue Empty State
  it('Group 6: renders affirmative empty state when attention queue length is 0 without fake risk score', async () => {
    (operationalService.getCommandCenter as any).mockResolvedValueOnce({
      data: {
        ...mockCommandCenterDTO,
        attentionQueue: [],
      },
      status: 200,
      headers: {},
      config: {} as any,
    });

    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('attention-queue-empty')).toBeInTheDocument();
    });

    expect(screen.getByText(/no immediate operational attention required/i)).toBeInTheDocument();
    expect(screen.queryByText(/overall risk score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ai score/i)).not.toBeInTheDocument();
  });

  // Group 7 — Time Horizon Switching
  it('Group 7: switches time horizon and invokes getCommandCenter with updated horizon parameter', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(operationalService.getCommandCenter).toHaveBeenCalledWith({
        blockId: 'UP_LKO_BKT',
        timeHorizon: '24h',
      });
    });

    // Click 7d button
    fireEvent.click(screen.getByTestId('time-horizon-7d'));

    await waitFor(() => {
      expect(operationalService.getCommandCenter).toHaveBeenCalledWith({
        blockId: 'UP_LKO_BKT',
        timeHorizon: '7d',
      });
    });

    // Click 30d button
    fireEvent.click(screen.getByTestId('time-horizon-30d'));

    await waitFor(() => {
      expect(operationalService.getCommandCenter).toHaveBeenCalledWith({
        blockId: 'UP_LKO_BKT',
        timeHorizon: '30d',
      });
    });
  });

  // Group 8 — Manual Refresh Trigger
  it('Group 8: triggers manual refresh and fetches fresh data when clicking refresh button', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(operationalService.getCommandCenter).toHaveBeenCalledTimes(1);
    });

    const refreshBtn = screen.getByTestId('refresh-command-center-button');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(operationalService.getCommandCenter).toHaveBeenCalledTimes(2);
    });
  });

  // Group 9 — Loading Skeleton State
  it('Group 9: renders loading skeleton during initial pending request without fabricated metrics', async () => {
    let resolvePromise: (val: any) => void = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (operationalService.getCommandCenter as any).mockReturnValueOnce(pendingPromise);

    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    expect(screen.getByTestId('command-center-loading-skeleton')).toBeInTheDocument();

    // Resolve promise
    await act(async () => {
      resolvePromise({
        data: mockCommandCenterDTO,
        status: 200,
        headers: {},
        config: {} as any,
      });
    });

    await waitFor(() => {
      expect(screen.queryByTestId('command-center-loading-skeleton')).not.toBeInTheDocument();
    });
  });

  // Group 10 — Error State & Retry Flow
  it('Group 10: renders error alert when API call rejects and retries successfully', async () => {
    (operationalService.getCommandCenter as any).mockRejectedValueOnce(
      new Error('Gateway connection timeout')
    );

    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('command-center-error-alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/Gateway connection timeout/i)).toBeInTheDocument();

    // Now mock recovery
    (operationalService.getCommandCenter as any).mockResolvedValueOnce({
      data: mockCommandCenterDTO,
      status: 200,
      headers: {},
      config: {} as any,
    });

    // Click retry
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('command-center-error-alert')).not.toBeInTheDocument();
      expect(screen.getByTestId('panel-attention-queue')).toBeInTheDocument();
    });
  });

  // Group 11 — Realtime Invalidation & markCommandCenterFresh Lifecycle
  it('Group 11: shows stale banner and auto-refreshes when commandCenterStale is set to true', async () => {
    vi.useFakeTimers();

    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    // Simulate realtime invalidation from Socket.IO signal/action arrival
    act(() => {
      useRealtimeStore.setState({
        commandCenterStale: true,
        commandCenterLastInvalidatedAt: new Date().toISOString(),
      });
    });

    expect(screen.getByTestId('command-center-stale-banner')).toBeInTheDocument();

    // Advance past debounce timer (~750ms)
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(operationalService.getCommandCenter).toHaveBeenCalledTimes(2);
    expect(useRealtimeStore.getState().commandCenterStale).toBe(false);

    vi.useRealTimers();
  });

  // Group 12 — Tab Navigation & Panel Switching
  it('Group 12: tab navigation renders role="tablist" and switches active tab panel', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    const queueTab = screen.getByTestId('tab-attention-queue');
    const signalsTab = screen.getByTestId('tab-operational-signals');
    const actionsTab = screen.getByTestId('tab-inspection-actions');
    const resolutionTab = screen.getByTestId('tab-resolution-intelligence');

    expect(queueTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('panel-attention-queue')).toBeInTheDocument();

    // Switch to Signals tab
    fireEvent.click(signalsTab);
    expect(signalsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('panel-operational-signals')).toBeInTheDocument();

    // Switch to Actions tab
    fireEvent.click(actionsTab);
    expect(actionsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('panel-inspection-actions')).toBeInTheDocument();

    // Switch to Resolution tab
    fireEvent.click(resolutionTab);
    expect(resolutionTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('panel-resolution-intelligence')).toBeInTheDocument();
  });

  // Group 13 — Operational Signals Child Workspace Integration
  it('Group 13: renders OperationalSignalCenter child component inside signals tab', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-operational-signals')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tab-operational-signals'));

    expect(screen.getByTestId('mock-operational-signal-center')).toBeInTheDocument();
    expect(screen.getByTestId('child-signals-block')).toHaveTextContent('UP_LKO_BKT');
    expect(screen.getByTestId('child-signals-persona')).toHaveTextContent('OFFICER');
  });

  // Group 14 — Inspection Actions Child Workspace Integration
  it('Group 14: renders InspectionActionWorkspace child component inside actions tab', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-inspection-actions')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tab-inspection-actions'));

    expect(screen.getByTestId('mock-inspection-action-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('child-actions-block')).toHaveTextContent('UP_LKO_BKT');
    expect(screen.getByTestId('child-actions-persona')).toHaveTextContent('OFFICER');
  });

  // Group 15 — Resolution & Aging Distribution
  it('Group 15: renders Aging Distribution with all 5 distinct duration buckets and exact values', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-resolution-intelligence')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tab-resolution-intelligence'));

    const agingCard = screen.getByTestId('aging-distribution-card');
    expect(agingCard).toBeInTheDocument();
    expect(agingCard).toHaveTextContent('< 1 hour');
    expect(agingCard).toHaveTextContent('3');
    expect(agingCard).toHaveTextContent('1 – 6 hours');
    expect(agingCard).toHaveTextContent('4');
    expect(agingCard).toHaveTextContent('6 – 24 hours');
    expect(agingCard).toHaveTextContent('2');
    expect(agingCard).toHaveTextContent('24 – 72 hours');
    expect(agingCard).toHaveTextContent('2');
    expect(agingCard).toHaveTextContent('> 72 hours');
    expect(agingCard).toHaveTextContent('1');
  });

  // Group 16 — Turnaround Null Safety
  it('Group 16: displays "NOT AVAILABLE" when average turnaround time is null and never displays "0 hours"', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-resolution-intelligence')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tab-resolution-intelligence'));

    const turnaroundCard = screen.getByTestId('turnaround-metrics-card');
    expect(turnaroundCard).toHaveTextContent('NOT AVAILABLE');
    expect(turnaroundCard).not.toHaveTextContent('0 hours');
    expect(turnaroundCard).not.toHaveTextContent('0.0 hours');
  });

  it('Group 16b: renders formatted turnaround hours when a valid numeric value is present', async () => {
    (operationalService.getCommandCenter as any).mockResolvedValueOnce({
      data: {
        ...mockCommandCenterDTO,
        actionSummary: {
          ...mockCommandCenterDTO.actionSummary,
          averageTimeToResolutionHours: 4.75,
        },
      },
      status: 200,
      headers: {},
      config: {} as any,
    });

    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-resolution-intelligence')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tab-resolution-intelligence'));

    const turnaroundCard = screen.getByTestId('turnaround-metrics-card');
    expect(turnaroundCard).toHaveTextContent('4.8 hours');
  });

  // Group 17 — Coverage Metrics in Resolution Tab
  it('Group 17: renders human review coverage rate and critical unactioned count in resolution tab', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-resolution-intelligence')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tab-resolution-intelligence'));

    const turnaroundCard = screen.getByTestId('turnaround-metrics-card');
    expect(turnaroundCard).toHaveTextContent('58.3%');
    expect(turnaroundCard).toHaveTextContent('1');
  });

  // Group 18 — Recent Activity & Immutable Audit Timeline
  it('Group 18: renders persisted recent activity items with transition, actor, role, and notes', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-resolution-intelligence')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tab-resolution-intelligence'));

    const auditCard = screen.getByTestId('operational-audit-timeline-card');
    expect(auditCard).toBeInTheDocument();

    const act1 = screen.getByTestId('audit-activity-item-act_trans_1');
    expect(act1).toHaveTextContent('ASSIGNED');
    expect(act1).toHaveTextContent('Lead Analyst');
    expect(act1).toHaveTextContent('ADMIN');
    expect(act1).toHaveTextContent('Assigned to field officer Sharma for priority review');

    const act2 = screen.getByTestId('audit-activity-item-act_trans_2');
    expect(act2).toHaveTextContent('COMPLETED');
    expect(act2).toHaveTextContent('Officer Sharma');
    expect(act2).toHaveTextContent('FIELD_OFFICER');
    expect(act2).toHaveTextContent('Gauge checked and calibrated against manual cylinder');
  });

  // Group 19 — Scientific Disclosure Footer
  it('Group 19: renders persistent scientific disclosure footer communicating Probability != Confidence != Operational Availability', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('scientific-disclosures-footer')).toBeInTheDocument();
    });

    const footer = screen.getByTestId('scientific-disclosures-footer');
    expect(footer).toHaveTextContent('Probability ≠ Confidence ≠ Operational Availability');
    expect(footer).toHaveTextContent('Diagnostic-Only Operational Boundary');
    expect(footer).toHaveTextContent('Kharif 2024 Baseline');
  });

  // Group 20 — Prohibited Synthetic Scores Check
  it('Group 20: does NOT render any prohibited synthetic risk or composite AI scores', async () => {
    const { container } = render(
      <OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />
    );

    await waitFor(() => {
      expect(screen.getByTestId('operational-command-center')).toBeInTheDocument();
    });

    const text = container.textContent || '';
    expect(text).not.toMatch(/overall\s*risk\s*score/i);
    expect(text).not.toMatch(/ai\s*score/i);
    expect(text).not.toMatch(/composite\s*risk/i);
    expect(text).not.toMatch(/unified\s*health\s*score/i);
  });

  // Group 21 — Semantic Accessibility
  it('Group 21: tablist and interactive controls meet ARIA semantic requirements', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Operational Command Center Sections');

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(4);
    tabs.forEach((tab) => {
      expect(tab).toHaveAttribute('aria-selected');
      expect(tab).toHaveAttribute('aria-controls');
    });

    expect(screen.getByTestId('refresh-command-center-button')).toHaveAttribute(
      'aria-label',
      'Refresh operational command center data'
    );
  });

  // Group 22 — Persona & Geographic Scope Handoff
  it('Group 22: respects initialBlockId and persona in API call and scope displays', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="ADMIN" />);

    await waitFor(() => {
      expect(operationalService.getCommandCenter).toHaveBeenCalledWith({
        blockId: 'UP_LKO_BKT',
        timeHorizon: '24h',
      });
    });

    expect(screen.getAllByText(/UP_LKO_BKT/i).length).toBeGreaterThan(0);
  });

  // Group 23 — Deep Inspection Modal Trigger from Attention Queue
  it('Group 23: clicking "Inspect Evidence" on a signal queue item opens DecisionSupportWorkspace modal', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('inspect-signal-sig_crit_001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('inspect-signal-sig_crit_001'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-decision-support-workspace')).toBeInTheDocument();
    });

    expect(screen.getByTestId('decision-support-signal-id')).toHaveTextContent('sig_crit_001');

    // Close modal
    fireEvent.click(screen.getByTestId('decision-support-close-btn'));
    expect(screen.queryByTestId('mock-decision-support-workspace')).not.toBeInTheDocument();
  });

  // Group 24 — Action Handoff from Attention Queue
  it('Group 24: clicking "Open Action" on an action queue item navigates to inspection actions tab', async () => {
    render(<OperationalCommandCenter initialBlockId="UP_LKO_BKT" persona="OFFICER" />);

    await waitFor(() => {
      expect(screen.getByTestId('open-action-act_p1_002')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('open-action-act_p1_002'));

    await waitFor(() => {
      expect(screen.getByTestId('panel-inspection-actions')).toBeInTheDocument();
    });
    expect(screen.getByTestId('tab-inspection-actions')).toHaveAttribute('aria-selected', 'true');
  });
});
