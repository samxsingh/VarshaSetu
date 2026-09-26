import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { OperationalSignalCenter } from '../components/operations/OperationalSignalCenter';
import { operationalService, OperationalSignalDTO } from '../services/operationalService';
import { useRealtimeStore } from '../stores/useRealtimeStore';

vi.mock('../services/operationalService', async () => {
  const actual = await vi.importActual('../services/operationalService');
  return {
    ...actual,
    operationalService: {
      getSignals: vi.fn(),
      getStatus: vi.fn(),
    },
  };
});

describe('OperationalSignalCenter Component (Phase 7A)', () => {
  const mockSignals: OperationalSignalDTO[] = [
    {
      signalId: 'sig_evt_101',
      signalType: 'EVENT',
      title: 'WARNING: HEAVY RAIN RISK',
      summary: 'Expected 24h precipitation exceeds 64.5 mm threshold.',
      severity: 'WARNING',
      blockId: 'UP_LKO_BKT',
      detectedAt: '2024-07-20T10:00:00.000Z',
      validFrom: '2024-07-20T10:00:00.000Z',
      validUntil: '2024-07-27T10:00:00.000Z',
      probability: 0.78,
      confidenceStatus: 'CALIBRATED',
      operationalStatus: 'DIAGNOSTIC_ONLY',
      dataFreshness: 'HISTORICAL_ONLY',
      validationStatus: 'VALIDATED',
      sourceReferences: [{ id: 'evt-101', type: 'EVENT', label: 'Event Heavy Rain' }],
      recommendedInspection: 'Inspect local rain gauge telemetry.',
      createdAt: '2024-07-20T10:00:00.000Z',
      updatedAt: '2024-07-20T10:00:00.000Z',
    },
    {
      signalId: 'sig_gate_multiyear_hindcast_insufficient',
      signalType: 'OPERATIONAL_GATE',
      title: 'Operational Gate: Single-Season Baseline Enforced',
      summary: 'Platform is strictly gated under DIAGNOSTIC_ONLY status. Multi-year validation status is INSUFFICIENT_DATA.',
      severity: 'WATCH',
      blockId: 'UP_LKO_BKT',
      detectedAt: '2024-07-01T00:00:00.000Z',
      validFrom: '2024-07-01T00:00:00.000Z',
      validUntil: '2024-10-31T23:59:59.000Z',
      probability: null,
      confidenceStatus: 'PASS',
      operationalStatus: 'DIAGNOSTIC_ONLY',
      dataFreshness: 'ARCHIVED',
      validationStatus: 'INSUFFICIENT_DATA',
      sourceReferences: [{ id: 'GATE_2024', type: 'OPERATIONAL_GATE', label: 'Hindcast Gate' }],
      recommendedInspection: 'Review multi-year folds before operational release.',
      createdAt: '2024-07-01T00:00:00.000Z',
      updatedAt: '2024-07-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useRealtimeStore.getState().clearOperationalSignals();
  });

  it('renders signal center with title, counts, and signal cards', async () => {
    vi.mocked(operationalService.getSignals).mockResolvedValueOnce({
      success: true,
      data: { items: mockSignals, total: 2 },
      meta: { requestId: 'req-1', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(<OperationalSignalCenter blockId="UP_LKO_BKT" />);

    expect(screen.getByText('Operational Intelligence Signals')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('WARNING: HEAVY RAIN RISK')).toBeInTheDocument();
      expect(screen.getByText('Operational Gate: Single-Season Baseline Enforced')).toBeInTheDocument();
    });

    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('NOT AVAILABLE')).toBeInTheDocument();
    expect(screen.getAllByText('DIAGNOSTIC_ONLY').length).toBeGreaterThanOrEqual(2);
  });

  it('renders empty state when no signals are returned', async () => {
    vi.mocked(operationalService.getSignals).mockResolvedValueOnce({
      success: true,
      data: { items: [], total: 0 },
      meta: { requestId: 'req-2', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(<OperationalSignalCenter blockId="UP_LKO_BKT" />);

    await waitFor(() => {
      expect(screen.getByTestId('signals-empty-state')).toBeInTheDocument();
      expect(screen.getByText(/No operational anomalies detected in active monitoring window/i)).toBeInTheDocument();
    });
  });

  it('renders error state on API rejection with retry button', async () => {
    vi.mocked(operationalService.getSignals).mockRejectedValueOnce(new Error('Gateway timeout'));

    render(<OperationalSignalCenter blockId="UP_LKO_BKT" />);

    await waitFor(() => {
      expect(screen.getByText('Gateway timeout')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('filters signals by type tab', async () => {
    vi.mocked(operationalService.getSignals).mockResolvedValueOnce({
      success: true,
      data: { items: mockSignals, total: 2 },
      meta: { requestId: 'req-3', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(<OperationalSignalCenter blockId="UP_LKO_BKT" />);

    await waitFor(() => {
      expect(screen.getByText('WARNING: HEAVY RAIN RISK')).toBeInTheDocument();
    });

    // Click "Gates & Quality" tab
    const gateTab = screen.getByRole('tab', { name: 'Gates & Quality' });
    fireEvent.click(gateTab);

    // Weather event should be filtered out
    expect(screen.queryByText('WARNING: HEAVY RAIN RISK')).not.toBeInTheDocument();
    // Gate signal should remain
    expect(screen.getByText('Operational Gate: Single-Season Baseline Enforced')).toBeInTheDocument();
  });

  it('filters signals by severity dropdown', async () => {
    vi.mocked(operationalService.getSignals).mockResolvedValueOnce({
      success: true,
      data: { items: mockSignals, total: 2 },
      meta: { requestId: 'req-4', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(<OperationalSignalCenter blockId="UP_LKO_BKT" />);

    await waitFor(() => {
      expect(screen.getByText('WARNING: HEAVY RAIN RISK')).toBeInTheDocument();
    });

    const select = screen.getByLabelText('Filter by severity level');
    fireEvent.change(select, { target: { value: 'WARNING' } });

    expect(screen.getByText('WARNING: HEAVY RAIN RISK')).toBeInTheDocument();
    expect(screen.queryByText('Operational Gate: Single-Season Baseline Enforced')).not.toBeInTheDocument();
  });

  it('opens ProvenanceDrawer when Evidence button is clicked', async () => {
    vi.mocked(operationalService.getSignals).mockResolvedValueOnce({
      success: true,
      data: { items: mockSignals, total: 2 },
      meta: { requestId: 'req-5', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(<OperationalSignalCenter blockId="UP_LKO_BKT" />);

    await waitFor(() => {
      expect(screen.getByText('WARNING: HEAVY RAIN RISK')).toBeInTheDocument();
    });

    const evidenceButtons = screen.getAllByRole('button', { name: /View evidence/i });
    expect(evidenceButtons.length).toBeGreaterThan(0);
    fireEvent.click(evidenceButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Signal Evidence: WARNING: HEAVY RAIN RISK/i)).toBeInTheDocument();
      expect(screen.getByText(/Observational Ingestion & Resolution/i)).toBeInTheDocument();
    });
  });

  it('reactively displays incoming realtime operational signals from useRealtimeStore', async () => {
    vi.mocked(operationalService.getSignals).mockResolvedValueOnce({
      success: true,
      data: { items: [], total: 0 },
      meta: { requestId: 'req-6', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });


    render(<OperationalSignalCenter blockId="UP_LKO_BKT" />);

    await waitFor(() => {
      expect(screen.getByTestId('signals-empty-state')).toBeInTheDocument();
    });

    // Simulate incoming realtime socket signal
    act(() => {
      useRealtimeStore.getState().addOperationalSignal({
        signalId: 'sig_realtime_critical_99',
        signalType: 'EVENT',
        title: 'CRITICAL: FLASH FLOOD PRECIPITATION ANOMALY',
        summary: 'Cloudburst threshold alert triggered in northern sector.',
        severity: 'CRITICAL',
        blockId: 'UP_LKO_BKT',
        detectedAt: new Date().toISOString(),
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000).toISOString(),
        probability: 0.92,
        confidenceStatus: 'CALIBRATED',
        operationalStatus: 'DIAGNOSTIC_ONLY',
        dataFreshness: 'REALTIME',
        validationStatus: 'VALIDATED',
        sourceReferences: [{ id: 'evt-99', type: 'EVENT', label: 'Flash Flood' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('CRITICAL: FLASH FLOOD PRECIPITATION ANOMALY')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });
  });
});
