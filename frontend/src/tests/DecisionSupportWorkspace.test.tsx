import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DecisionSupportWorkspace } from '../components/operations/DecisionSupportWorkspace';
import { operationalService, DecisionSupportContext } from '../services/operationalService';
import { useRealtimeStore } from '../stores/useRealtimeStore';
import { useAuthStore } from '../stores/useAuthStore';

vi.mock('../services/operationalService', async () => {
  const actual = await vi.importActual('../services/operationalService');
  return {
    ...actual,
    operationalService: {
      getSignalContext: vi.fn(),
    },
  };
});

describe('DecisionSupportWorkspace Component (Phase 7B)', () => {
  const mockContext: DecisionSupportContext = {
    signalId: 'sig_evt_101',
    signalType: 'EVENT',
    title: 'WARNING: HEAVY RAIN RISK',
    summary: 'Expected 24h precipitation exceeds 64.5 mm threshold.',
    severity: 'WARNING',
    location: {
      blockId: 'UP_LKO_BKT',
      blockName: 'Bakshi Ka Talab',
      districtName: 'Lucknow',
      stateName: 'Uttar Pradesh',
    },
    timing: {
      detectedAt: '2024-07-20T10:00:00.000Z',
      validFrom: '2024-07-20T10:00:00.000Z',
      validUntil: '2024-07-27T10:00:00.000Z',
    },
    scientific: {
      probability: 0.78,
      confidenceStatus: 'CALIBRATED',
      validationStatus: 'VALIDATED',
      operationalStatus: 'DIAGNOSTIC_ONLY',
      dataFreshness: 'HISTORICAL_ONLY',
      modelReliabilityLabel: 'Calibrated using Isotonic Regression',
    },
    evidence: {
      sourceReferences: [{ id: 'evt-101', type: 'EVENT', label: 'Event Heavy Rain' }],
      provenanceAvailable: true,
      provenanceDetails: {
        hash: 'hash-abc-123',
        pipeline: 'IMD GFS Ensemble Downscaling',
      },
      modelReference: {
        modelId: 'xgboost_heavy_rain_7d',
        modelFamily: 'XGBoost Extreme Event Downscaler',
        modelVersion: 'v2.1.0',
        algorithm: 'Gradient Boosted Decision Trees',
        calibrationMethod: 'Isotonic Regression',
        ece: 0.042,
        brierScore: 0.088,
      },
      observationReference: {
        source: 'IMD AWS Lucknow Station',
        stationId: 'AWS-42182',
        stationName: 'Lucknow Agromet Station',
        variable: 'Precipitation 24h Accumulated',
        resolution: 'Hourly Telemetry',
        observationCount: 168,
      },
      explanation: {
        available: true,
        baseValue: 0.22,
        contributions: [
          {
            featureName: 'convective_available_potential_energy_cape',
            contribution: 0.35,
            direction: 'increases_risk',
            description: 'Elevated CAPE exceeding 2800 J/kg indicating atmospheric instability',
          },
          {
            featureName: 'relative_humidity_850hpa',
            contribution: 0.21,
            direction: 'increases_risk',
            description: 'High boundary-layer moisture flux (88%)',
          },
        ],
        nonCausalDisclaimer: 'Features represent statistical correlation from calibrated ML downscaling, not proven causal drivers.',
      },
      dataHealth: {
        available: true,
        providerStatus: 'HEALTHY',
        lastSyncTime: '2024-07-20T09:45:00.000Z',
        dataFreshness: 'HISTORICAL_ONLY',
        qualityState: 'PASS',
        pipelineStatus: 'OPERATIONAL',
      },
    },
    underlyingEntity: {
      entityType: 'EVENT',
      entityId: 'evt-101',
      details: {
        category: 'PRECIPITATION',
        thresholdMm: 64.5,
      },
    },
    recommendedInspection: 'Inspect local rain gauge telemetry and field drainage status.',
    limitations: [
      'Single-season baseline (Monsoon 2024). Multi-year hindcasting validation pending.',
      'Operational status is strictly DIAGNOSTIC_ONLY.',
    ],
    nextInspections: [
      {
        label: 'Inspect Alert Stream',
        actionType: 'NAVIGATE',
        target: '/alerts',
        description: 'Review live community and telemetry alert thresholds.',
      },
      {
        label: 'Model Card & Registry',
        actionType: 'NAVIGATE',
        target: '/models',
        description: 'Inspect model calibration curves and SHAP feature registry.',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useRealtimeStore.getState().clearOperationalSignals();
    useAuthStore.getState().setUser(null);
  });

  it('renders workspace modal with signal details and scientific status trio', async () => {
    vi.mocked(operationalService.getSignalContext).mockResolvedValueOnce({
      success: true,
      data: mockContext,
      meta: { requestId: 'req-ws-1', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(
      <MemoryRouter>
        <DecisionSupportWorkspace signalId="sig_evt_101" isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    // Modal role and title
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Decision Support Workspace')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('WARNING: HEAVY RAIN RISK')).toBeInTheDocument();
    });

    // Location & Scope
    expect(screen.getByText(/Bakshi Ka Talab/i)).toBeInTheDocument();
    expect(screen.getByText(/UP_LKO_BKT/i)).toBeInTheDocument();
    expect(screen.getByText(/Lucknow, Uttar Pradesh/i)).toBeInTheDocument();

    // Scientific Status Trio: Probability vs Confidence vs Operational Mode
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('CALIBRATED')).toBeInTheDocument();
    expect(screen.getByText('DIAGNOSTIC_ONLY')).toBeInTheDocument();
  });

  it('displays evidence chain with model and observation references', async () => {
    vi.mocked(operationalService.getSignalContext).mockResolvedValueOnce({
      success: true,
      data: mockContext,
      meta: { requestId: 'req-ws-2', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(
      <MemoryRouter>
        <DecisionSupportWorkspace signalId="sig_evt_101" isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('XGBoost Extreme Event Downscaler')).toBeInTheDocument();
      expect(screen.getByText('v2.1.0')).toBeInTheDocument();
      expect(screen.getByText('Lucknow Agromet Station')).toBeInTheDocument();
      expect(screen.getByText('Precipitation 24h Accumulated')).toBeInTheDocument();
    });

    // Calibration stats in Analyst/Officer view
    expect(screen.getByText(/ECE: 0.042/i)).toBeInTheDocument();
    expect(screen.getByText(/Brier: 0.088/i)).toBeInTheDocument();
  });

  it('displays SHAP feature contributions and non-causal disclaimer', async () => {
    vi.mocked(operationalService.getSignalContext).mockResolvedValueOnce({
      success: true,
      data: mockContext,
      meta: { requestId: 'req-ws-3', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(
      <MemoryRouter>
        <DecisionSupportWorkspace signalId="sig_evt_101" isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('convective_available_potential_energy_cape')).toBeInTheDocument();
      expect(screen.getByText('relative_humidity_850hpa')).toBeInTheDocument();
      expect(screen.getByText(/Features represent statistical correlation from calibrated ML downscaling, not proven causal drivers./i)).toBeInTheDocument();
    });
  });

  it('handles missing explanation gracefully without fabricating data', async () => {
    const contextNoExplanation: DecisionSupportContext = {
      ...mockContext,
      evidence: {
        ...mockContext.evidence,
        explanation: {
          available: false,
          contributions: [],
          nonCausalDisclaimer: 'Features represent statistical correlation from calibrated ML downscaling, not proven causal drivers.',
        },
      },
    };

    vi.mocked(operationalService.getSignalContext).mockResolvedValueOnce({
      success: true,
      data: contextNoExplanation,
      meta: { requestId: 'req-ws-4', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(
      <MemoryRouter>
        <DecisionSupportWorkspace signalId="sig_evt_101" isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('MODEL EXPLANATION NOT AVAILABLE')).toBeInTheDocument();
    });
  });

  it('handles missing provenance gracefully without fabricating data', async () => {
    const contextNoProvenance: DecisionSupportContext = {
      ...mockContext,
      evidence: {
        ...mockContext.evidence,
        provenanceAvailable: false,
        provenanceDetails: undefined,
      },
    };

    vi.mocked(operationalService.getSignalContext).mockResolvedValueOnce({
      success: true,
      data: contextNoProvenance,
      meta: { requestId: 'req-ws-5', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(
      <MemoryRouter>
        <DecisionSupportWorkspace signalId="sig_evt_101" isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('PROVENANCE NOT AVAILABLE')).toBeInTheDocument();
    });
  });

  it('renders Farmer tailored view without raw ECE and Brier stats', async () => {
    useAuthStore.getState().setUser({
      id: 'u-farmer-1',
      name: 'Ramesh Patel',
      phone: '9876543210',
      role: 'FARMER',
      preferredLanguage: 'hi',
      assignedLocationId: 'UP_LKO_BKT',
      hasCompletedOnboarding: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);

    const farmerContext: DecisionSupportContext = {
      ...mockContext,
      evidence: {
        ...mockContext.evidence,
        modelReference: {
          modelId: 'xgboost_heavy_rain_7d',
          modelFamily: 'XGBoost Extreme Event Downscaler',
          modelVersion: 'v2.1.0',
          algorithm: 'Gradient Boosted Decision Trees',
          calibrationMethod: 'Isotonic Regression',
          // ece and brierScore omitted for farmer
        },
      },
      scientific: {
        ...mockContext.scientific,
        modelReliabilityLabel: 'Model reliability: Calibrated & Verified',
      },
    };

    vi.mocked(operationalService.getSignalContext).mockResolvedValueOnce({
      success: true,
      data: farmerContext,
      meta: { requestId: 'req-ws-6', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(
      <MemoryRouter>
        <DecisionSupportWorkspace signalId="sig_evt_101" isOpen={true} onClose={vi.fn()} persona="FARMER" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Model reliability: Calibrated & Verified/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/ECE:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Brier:/i)).not.toBeInTheDocument();
  });

  it('renders deterministic next inspection navigation buttons', async () => {
    vi.mocked(operationalService.getSignalContext).mockResolvedValueOnce({
      success: true,
      data: mockContext,
      meta: { requestId: 'req-ws-7', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(
      <MemoryRouter>
        <DecisionSupportWorkspace signalId="sig_evt_101" isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Inspect Alert Stream')).toBeInTheDocument();
      expect(screen.getByText('Model Card & Registry')).toBeInTheDocument();
    });
  });

  it('notifies user when realtime socket updates arrive for the active signal', async () => {
    vi.mocked(operationalService.getSignalContext).mockResolvedValueOnce({
      success: true,
      data: mockContext,
      meta: { requestId: 'req-ws-8', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    render(
      <MemoryRouter>
        <DecisionSupportWorkspace signalId="sig_evt_101" isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('WARNING: HEAVY RAIN RISK')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Signal updated just now via Socket.IO/i)).not.toBeInTheDocument();

    // Trigger realtime signal update for the same signal
    act(() => {
      useRealtimeStore.getState().addOperationalSignal({
        signalId: 'sig_evt_101',
        signalType: 'EVENT',
        title: 'CRITICAL: FLASH FLOOD ESCALATION',
        summary: 'Precipitation exceeded secondary threshold.',
        severity: 'CRITICAL',
        blockId: 'UP_LKO_BKT',
        detectedAt: new Date().toISOString(),
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000).toISOString(),
        probability: 0.95,
        confidenceStatus: 'CALIBRATED',
        operationalStatus: 'DIAGNOSTIC_ONLY',
        dataFreshness: 'REALTIME',
        validationStatus: 'VALIDATED',
        sourceReferences: [{ id: 'evt-101', type: 'EVENT', label: 'Heavy Rain Event' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Signal updated just now via Socket.IO/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Refresh Evidence/i })).toBeInTheDocument();
    });
  });

  it('closes on Escape key press and on Close button click', async () => {
    vi.mocked(operationalService.getSignalContext).mockResolvedValueOnce({
      success: true,
      data: mockContext,
      meta: { requestId: 'req-ws-9', timestamp: new Date().toISOString(), dataMode: 'DEMO' as const },
    });

    const handleClose = vi.fn();

    const { rerender } = render(
      <MemoryRouter>
        <DecisionSupportWorkspace signalId="sig_evt_101" isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('WARNING: HEAVY RAIN RISK')).toBeInTheDocument();
    });

    // Close button
    const closeBtn = screen.getByRole('button', { name: /Close decision support workspace/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Escape key on document
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);

    // When isOpen is false, nothing is rendered
    rerender(
      <MemoryRouter>
        <DecisionSupportWorkspace signalId="sig_evt_101" isOpen={false} onClose={handleClose} />
      </MemoryRouter>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
