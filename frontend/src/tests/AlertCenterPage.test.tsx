import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AlertCenterPage } from '../pages/analyst/AlertCenterPage';
import { eventService } from '../services/eventService';

vi.mock('../services/eventService', () => ({
  eventService: {
    listEvents: vi.fn(),
    getEvents: vi.fn(),
    getOperationsStatus: vi.fn(),
    getOperationalStatus: vi.fn(),
    detectEvents: vi.fn(),
    processForecastExpiry: vi.fn(),
    processExpiry: vi.fn(),
    acknowledgeEvent: vi.fn(),
    resolveEvent: vi.fn(),
    getEventHistory: vi.fn(),
  },
}));

describe('AlertCenterPage Component (Phase 4F Operational Alerting & Lifecycle)', () => {
  const mockStatus = {
    service: 'varshasetu-operational-engine',
    phase: 'PHASE_4F_OPERATIONAL_DELIVERY',
    system_status: 'DIAGNOSTIC_ONLY',
    operational_alerting_allowed: false,
    data_freshness: 'HISTORICAL_ONLY',
    dataset: 'Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)',
    channels: {
      IN_APP: { status: 'SIMULATED', message: 'In-app notification state simulated' },
      SMS: { status: 'NOT_CONFIGURED', message: 'SMS gateway not configured' },
      WHATSAPP: { status: 'NOT_CONFIGURED', message: 'WhatsApp delivery not configured' },
      VOICE: { status: 'NOT_CONFIGURED', message: 'Voice IVR not configured' },
    },
    events: { active_count: 1, total_detected: 2 },
    lifecycle: { active_forecasts: 4, expired_forecasts: 0 },
    gating_rationale: 'Single-season record requires multi-year verification.',
    timestamp: '2024-09-15T06:00:00Z',
  };

  const mockEvents = [
    {
      event_id: 'evt-test-101',
      block_id: 'UP_LKO_BKT',
      event_type: 'HEAVY_RAIN_RISK',
      severity: 'WARNING',
      state: 'DETECTED',
      probability: 0.76,
      description: 'Probability 76% meets heavy rain threshold (>=64.5 mm) for horizon 7d.',
      horizon_days: 7,
      valid_from: '2024-09-15T00:00:00Z',
      valid_until: '2024-09-22T00:00:00Z',
      detected_at: '2024-09-15T06:00:00Z',
      updated_at: '2024-09-15T06:00:00Z',
      dedup_hash: 'hash-abc',
      scientific_disclosure: {
        operational_status: 'DIAGNOSTIC_ONLY',
        data_freshness: 'HISTORICAL_ONLY',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(eventService.getOperationalStatus).mockResolvedValue({
      success: true,
      data: mockStatus as any,
    });
    vi.mocked(eventService.listEvents).mockResolvedValue({
      success: true,
      data: { total_events: 1, events: mockEvents as any },
    });
    vi.mocked(eventService.getEvents).mockResolvedValue({
      success: true,
      data: { total_events: 1, events: mockEvents as any },
    });
  });

  it('renders operational alert center and gating disclosures', async () => {
    render(<AlertCenterPage />);

    expect(screen.getByText('Alert Intelligence & Scientific Event Center')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('DIAGNOSTIC_ONLY').length).toBeGreaterThan(0);
      expect(screen.getByText('Historical Archive (Kharif 2024)')).toBeInTheDocument();
    });

    // Check filters rendered
    expect(screen.getByText('Event Type')).toBeInTheDocument();
    expect(screen.getByText('Severity Tier')).toBeInTheDocument();
    expect(screen.getByText('Lifecycle State')).toBeInTheDocument();
  });

  it('displays detected events with severity badge and non-alarmist descriptions', async () => {
    render(<AlertCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('HEAVY_RAIN_RISK')).toBeInTheDocument();
      expect(screen.getByText('WARNING')).toBeInTheDocument();
      expect(screen.getByText('DETECTED')).toBeInTheDocument();
      expect(screen.getByText('76.0%')).toBeInTheDocument();
    });
  });

  it('allows acknowledging an event', async () => {
    vi.mocked(eventService.acknowledgeEvent).mockResolvedValue({
      success: true,
      data: {
        event_id: 'evt-test-101',
        previous_state: 'DETECTED',
        new_state: 'ACKNOWLEDGED',
        reason: 'Analyst reviewed',
        transition_time: '2024-09-15T06:10:00Z',
      } as any,
    });

    render(<AlertCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('Acknowledge')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Acknowledge'));

    await waitFor(() => {
      expect(eventService.acknowledgeEvent).toHaveBeenCalledWith('evt-test-101', expect.any(String));
    });
  });

  it('triggers event detection run on button click', async () => {
    vi.mocked(eventService.detectEvents).mockResolvedValue({
      success: true,
      data: {
        total_evaluated_forecasts: 4,
        detected_events: mockEvents as any,
        updated_events: [],
        suppressed_count: 0,
        operational_status: 'DIAGNOSTIC_ONLY',
        timestamp: '2024-09-15T06:00:00Z',
        summary: 'Diagnostic detection complete',
      },
    });

    render(<AlertCenterPage />);

    const detectBtn = screen.getByText('Detect Events');
    fireEvent.click(detectBtn);

    await waitFor(() => {
      expect(eventService.detectEvents).toHaveBeenCalledWith({ block_id: 'UP_LKO_BKT', cooldown_hours: 24 });
    });
  });
});
