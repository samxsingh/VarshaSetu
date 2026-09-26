import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { InspectionActionWorkspace } from '../components/operations/InspectionActionWorkspace';
import {
  operationalService,
  InspectionActionDTO,
} from '../services/operationalService';
import { useRealtimeStore } from '../stores/useRealtimeStore';

vi.mock('../services/operationalService', async () => {
  const actual = await vi.importActual('../services/operationalService');
  return {
    ...actual,
    operationalService: {
      getInspectionActions: vi.fn(),
      getInspectionAction: vi.fn(),
      createInspectionAction: vi.fn(),
      assignInspectionAction: vi.fn(),
      startInspectionAction: vi.fn(),
      completeInspectionAction: vi.fn(),
      cancelInspectionAction: vi.fn(),
    },
  };
});

describe('InspectionActionWorkspace Component (Phase 7C)', () => {
  const mockActionOpen: InspectionActionDTO = {
    actionId: 'act_open_001',
    signalId: 'sig_evt_101',
    actionType: 'FIELD_OBSERVATION',
    title: 'Verify Ground Rainfall at Station UP-01',
    description: 'Manual gauge check required following heavy rain advisory.',
    severity: 'WARNING',
    priority: 'P2',
    blockId: 'UP_LKO_BKT',
    status: 'OPEN',
    createdBy: 'officer_lucknow',
    creatorRole: 'FIELD_OFFICER',
    evidenceSnapshot: {
      originatingSignalType: 'EVENT',
      originatingSeverity: 'WARNING',
      detectedAt: '2024-07-20T10:00:00.000Z',
      scientificDisclosures: [],
      sourceReferences: [{ id: 'evt-101', type: 'EVENT', label: 'Heavy Rain Risk' }],
    },
    auditTrail: [
      {
        transition: 'CREATE',
        performedBy: 'officer_lucknow',
        role: 'FIELD_OFFICER',
        timestamp: '2024-07-20T10:00:00.000Z',
        notes: 'Initial creation',
      },
    ],
    createdAt: '2024-07-20T10:00:00.000Z',
    updatedAt: '2024-07-20T10:00:00.000Z',
  };

  const mockActionAssigned: InspectionActionDTO = {
    actionId: 'act_asgn_002',
    signalId: 'sig_dq_202',
    actionType: 'DATA_QUALITY_CHECK',
    title: 'Sensor Drift Cross-Verification',
    description: 'Check telemetry timestamps and calibrate drift against satellite precipitation.',
    severity: 'CRITICAL',
    priority: 'P1',
    blockId: 'UP_LKO_BKT',
    status: 'ASSIGNED',
    assignedTo: 'expert_sarah',
    assignedRole: 'CLIMATE_ANALYST',
    createdBy: 'system_gate',
    creatorRole: 'ADMIN',
    evidenceSnapshot: {
      originatingSignalType: 'DATA_QUALITY',
      originatingSeverity: 'CRITICAL',
      detectedAt: '2024-07-20T11:00:00.000Z',
      scientificDisclosures: [],
      sourceReferences: [],
    },
    auditTrail: [
      {
        transition: 'CREATE',
        performedBy: 'system_gate',
        role: 'ADMIN',
        timestamp: '2024-07-20T11:00:00.000Z',
      },
      {
        transition: 'ASSIGN',
        performedBy: 'admin_user',
        role: 'ADMIN',
        timestamp: '2024-07-20T11:30:00.000Z',
        notes: 'Assigned to Sarah for immediate telemetry triage',
      },
    ],
    createdAt: '2024-07-20T11:00:00.000Z',
    updatedAt: '2024-07-20T11:30:00.000Z',
  };

  const mockActionCompleted: InspectionActionDTO = {
    actionId: 'act_comp_003',
    signalId: 'sig_fc_303',
    actionType: 'FORECAST_REVIEW',
    title: 'Model Uncertainty Band Inspection',
    description: 'Evaluate ensemble spread across 5-day horizon.',
    severity: 'WATCH',
    priority: 'P3',
    blockId: 'UP_LKO_BKT',
    status: 'COMPLETED',
    assignedTo: 'analyst_raj',
    assignedRole: 'CLIMATE_ANALYST',
    createdBy: 'analyst_raj',
    creatorRole: 'CLIMATE_ANALYST',
    completionNotes: 'Spread is consistent with monsoon depression track variance; within 90% prediction intervals.',
    evidenceSnapshot: {
      originatingSignalType: 'FORECAST_CHANGE',
      originatingSeverity: 'WATCH',
      detectedAt: '2024-07-20T08:00:00.000Z',
      scientificDisclosures: [],
      sourceReferences: [],
    },
    auditTrail: [
      {
        transition: 'CREATE',
        performedBy: 'analyst_raj',
        role: 'CLIMATE_ANALYST',
        timestamp: '2024-07-20T08:00:00.000Z',
      },
      {
        transition: 'COMPLETE',
        performedBy: 'analyst_raj',
        role: 'CLIMATE_ANALYST',
        timestamp: '2024-07-20T09:30:00.000Z',
        notes: 'Completed review',
      },
    ],
    createdAt: '2024-07-20T08:00:00.000Z',
    updatedAt: '2024-07-20T09:30:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useRealtimeStore.setState({
      inspectionActions: [],
      connectionStatus: 'CONNECTED',
    });
  });

  it('renders the header, scientific guardrails, and loads actions from API', async () => {
    vi.mocked(operationalService.getInspectionActions).mockResolvedValueOnce({
      success: true,
      data: {
        items: [mockActionOpen, mockActionAssigned, mockActionCompleted],
        total: 3,
      },
    });

    render(
      <MemoryRouter>
        <InspectionActionWorkspace />
      </MemoryRouter>
    );

    expect(screen.getByText('Operational Inspection & Action Tracking')).toBeInTheDocument();
    expect(screen.getByText(/Authoritative Operational Review Protocol/i)).toBeInTheDocument();
    expect(screen.getByText(/Probability ≠ Confidence ≠ Operational Availability/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Verify Ground Rainfall at Station UP-01')).toBeInTheDocument();
      expect(screen.getByText('Sensor Drift Cross-Verification')).toBeInTheDocument();
      expect(screen.getByText('Model Uncertainty Band Inspection')).toBeInTheDocument();
    });
  });

  it('filters actions by status tabs', async () => {
    vi.mocked(operationalService.getInspectionActions).mockResolvedValue({
      success: true,
      data: {
        items: [mockActionOpen, mockActionAssigned, mockActionCompleted],
        total: 3,
      },
    });

    render(
      <MemoryRouter>
        <InspectionActionWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Verify Ground Rainfall at Station UP-01')).toBeInTheDocument();
    });

    // Click 'Open' filter tab
    const openTab = screen.getByRole('button', { name: /^Open$/i });
    fireEvent.click(openTab);

    await waitFor(() => {
      expect(screen.getByText('Verify Ground Rainfall at Station UP-01')).toBeInTheDocument();
      expect(screen.queryByText('Sensor Drift Cross-Verification')).not.toBeInTheDocument();
      expect(screen.queryByText('Model Uncertainty Band Inspection')).not.toBeInTheDocument();
    });

    // Click 'Completed' filter tab
    const completedTab = screen.getByRole('button', { name: /^Completed$/i });
    fireEvent.click(completedTab);

    await waitFor(() => {
      expect(screen.getByText('Model Uncertainty Band Inspection')).toBeInTheDocument();
      expect(screen.queryByText('Verify Ground Rainfall at Station UP-01')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no actions exist for selected filter', async () => {
    vi.mocked(operationalService.getInspectionActions).mockResolvedValue({
      success: true,
      data: {
        items: [],
        total: 0,
      },
    });

    render(
      <MemoryRouter>
        <InspectionActionWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No inspection actions found')).toBeInTheDocument();
    });
  });

  it('expands audit trail when button is clicked', async () => {
    vi.mocked(operationalService.getInspectionActions).mockResolvedValue({
      success: true,
      data: {
        items: [mockActionOpen],
        total: 1,
      },
    });

    render(
      <MemoryRouter>
        <InspectionActionWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Verify Ground Rainfall at Station UP-01')).toBeInTheDocument();
    });

    const auditBtn = screen.getByTestId(`audit-toggle-${mockActionOpen.actionId}`);
    fireEvent.click(auditBtn);

    await waitFor(() => {
      expect(screen.getByTestId('audit-trail-history')).toBeInTheDocument();
      expect(screen.getByText('CREATE')).toBeInTheDocument();
      expect(screen.getAllByText(/officer_lucknow/i).length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/Initial creation/i)).toBeInTheDocument();
    });
  });

  it('handles Assign flow on an OPEN action', async () => {
    vi.mocked(operationalService.getInspectionActions).mockResolvedValue({
      success: true,
      data: {
        items: [mockActionOpen],
        total: 1,
      },
    });

    vi.mocked(operationalService.assignInspectionAction).mockResolvedValueOnce({
      success: true,
      data: {
        ...mockActionOpen,
        status: 'ASSIGNED',
        assignedTo: 'officer_pune_south',
      },
    });

    render(
      <MemoryRouter>
        <InspectionActionWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Verify Ground Rainfall at Station UP-01')).toBeInTheDocument();
    });

    const assignBtn = screen.getByRole('button', { name: /Assign Action/i });
    fireEvent.click(assignBtn);

    // Modal dialog appears
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign Inspection Action/i })).toBeInTheDocument();
    });

    const assigneeInput = screen.getByPlaceholderText(/e.g. officer_pune_south/i);
    fireEvent.change(assigneeInput, { target: { value: 'officer_pune_south' } });

    const confirmBtn = screen.getByRole('button', { name: /Confirm Assignment/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(operationalService.assignInspectionAction).toHaveBeenCalledWith(
        'act_open_001',
        'officer_pune_south',
        undefined
      );
    });
  });

  it('handles Complete flow with mandatory completion notes on IN_PROGRESS action', async () => {
    const mockActionInProgress: InspectionActionDTO = {
      ...mockActionAssigned,
      actionId: 'act_prog_004',
      status: 'IN_PROGRESS',
    };

    vi.mocked(operationalService.getInspectionActions).mockResolvedValue({
      success: true,
      data: {
        items: [mockActionInProgress],
        total: 1,
      },
    });

    vi.mocked(operationalService.completeInspectionAction).mockResolvedValueOnce({
      success: true,
      data: {
        ...mockActionInProgress,
        status: 'COMPLETED',
        completionNotes: 'Physical sensor calibrated and tested successfully.',
      },
    });

    render(
      <MemoryRouter>
        <InspectionActionWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Complete Action')).toBeInTheDocument();
    });

    const completeBtn = screen.getByRole('button', { name: /Complete Action/i });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Complete Inspection Action/i })).toBeInTheDocument();
    });

    const notesInput = screen.getByPlaceholderText(/Physical station sensor cleaned and verified/i);
    fireEvent.change(notesInput, {
      target: { value: 'Physical sensor calibrated and tested successfully.' },
    });

    const markCompletedBtn = screen.getByRole('button', { name: /Mark Completed/i });
    fireEvent.click(markCompletedBtn);

    await waitFor(() => {
      expect(operationalService.completeInspectionAction).toHaveBeenCalledWith(
        'act_prog_004',
        'Physical sensor calibrated and tested successfully.'
      );
    });
  });

  it('handles Cancel flow with required reason', async () => {
    vi.mocked(operationalService.getInspectionActions).mockResolvedValue({
      success: true,
      data: {
        items: [mockActionOpen],
        total: 1,
      },
    });

    vi.mocked(operationalService.cancelInspectionAction).mockResolvedValueOnce({
      success: true,
      data: {
        ...mockActionOpen,
        status: 'CANCELLED',
        cancellationReason: 'Station resolved automatically by firmware reboot.',
      },
    });

    render(
      <MemoryRouter>
        <InspectionActionWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Cancel$/i })).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: /^Cancel$/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Cancel Inspection Action/i })).toBeInTheDocument();
    });

    const reasonInput = screen.getByPlaceholderText(/Station telemetry recovered automatically/i);
    fireEvent.change(reasonInput, {
      target: { value: 'Station resolved automatically by firmware reboot.' },
    });

    const confirmCancelBtn = screen.getByRole('button', { name: /Confirm Cancellation/i });
    fireEvent.click(confirmCancelBtn);

    await waitFor(() => {
      expect(operationalService.cancelInspectionAction).toHaveBeenCalledWith(
        'act_open_001',
        'Station resolved automatically by firmware reboot.'
      );
    });
  });

  it('updates reactively when realtime store receives an inspection event', async () => {
    vi.mocked(operationalService.getInspectionActions).mockResolvedValue({
      success: true,
      data: {
        items: [mockActionOpen],
        total: 1,
      },
    });

    render(
      <MemoryRouter>
        <InspectionActionWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Verify Ground Rainfall at Station UP-01')).toBeInTheDocument();
    });

    // Realtime update arrives
    act(() => {
      useRealtimeStore.getState().addOrUpdateInspectionAction({
        ...mockActionOpen,
        status: 'ASSIGNED',
        assignedTo: 'officer_ground_unit_4',
        updatedAt: '2024-07-20T12:00:00.000Z',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('officer_ground_unit_4')).toBeInTheDocument();
    });
  });
});
