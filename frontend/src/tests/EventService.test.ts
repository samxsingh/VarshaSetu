import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventService } from '../services/eventService';
import * as apiClient from '../services/apiClient';

describe('eventService API Client (Phase 4F Operational Alerting & Lifecycle)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches detected events with filters', async () => {
    const mockEvents = [
      {
        event_id: 'evt-test-01',
        forecast_id: 'fc-101',
        block_id: 'UP_LKO_BKT',
        event_type: 'HEAVY_RAIN_RISK',
        severity: 'WARNING' as const,
        state: 'DETECTED' as const,
        probability: 0.78,
        threshold: 64.5,
        unit: 'probability',
        confidence_status: 'PROBABILISTIC_EMPIRICAL',
        operational_status: 'DIAGNOSTIC_ONLY',
        data_freshness: 'HISTORICAL_ONLY',
        validation_status: 'INSUFFICIENT_DATA',
        description: 'Elevated heavy rain risk (probability 78%)',
        deduplication_hash: 'hash1234',
        detected_at: '2024-09-15T06:00:00Z',
        valid_from: '2024-09-15T00:00:00Z',
        valid_until: '2024-09-22T00:00:00Z',
        updated_at: '2024-09-15T06:00:00Z',
      },
    ];

    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      success: true,
      data: { total_events: 1, events: mockEvents },
    });

    const res = await eventService.getEvents({ block_id: 'UP_LKO_BKT' });
    expect(res.success).toBe(true);
    expect(res.data?.total_events).toBe(1);
    expect(res.data?.events[0].event_type).toBe('HEAVY_RAIN_RISK');
    expect(res.data?.events[0].severity).toBe('WARNING');
  });

  it('triggers event detection for a block', async () => {
    const mockDetectRes = {
      total_evaluated_forecasts: 4,
      detected_events: [],
      updated_events: [],
      suppressed_count: 0,
      operational_status: 'DIAGNOSTIC_ONLY',
      timestamp: '2024-09-15T06:00:00Z',
      summary: 'Evaluation completed for UP_LKO_BKT',
    };

    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      success: true,
      data: mockDetectRes,
    });

    const res = await eventService.detectEvents({ block_id: 'UP_LKO_BKT' });
    expect(res.success).toBe(true);
    expect(res.data?.total_evaluated_forecasts).toBe(4);
    expect(res.data?.operational_status).toBe('DIAGNOSTIC_ONLY');
  });

  it('acknowledges an active event', async () => {
    const mockAckRes = {
      event_id: 'evt-test-01',
      forecast_id: 'fc-101',
      block_id: 'UP_LKO_BKT',
      event_type: 'HEAVY_RAIN_RISK',
      severity: 'WARNING' as const,
      state: 'ACKNOWLEDGED' as const,
      probability: 0.78,
      threshold: 64.5,
      unit: 'probability',
      confidence_status: 'PROBABILISTIC_EMPIRICAL',
      operational_status: 'DIAGNOSTIC_ONLY',
      data_freshness: 'HISTORICAL_ONLY',
      validation_status: 'INSUFFICIENT_DATA',
      description: 'Elevated heavy rain risk',
      deduplication_hash: 'hash1234',
      detected_at: '2024-09-15T06:00:00Z',
      valid_from: '2024-09-15T00:00:00Z',
      valid_until: '2024-09-22T00:00:00Z',
      updated_at: '2024-09-15T06:30:00Z',
      acknowledged_by: 'Analyst',
      acknowledged_at: '2024-09-15T06:30:00Z',
    };

    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      success: true,
      data: mockAckRes,
    });

    const res = await eventService.acknowledgeEvent('evt-test-01', 'Analyst reviewed meteorological signal');
    expect(res.success).toBe(true);
    expect(res.data?.state).toBe('ACKNOWLEDGED');
  });

  it('resolves an event', async () => {
    const mockResolveRes = {
      event_id: 'evt-test-01',
      forecast_id: 'fc-101',
      block_id: 'UP_LKO_BKT',
      event_type: 'HEAVY_RAIN_RISK',
      severity: 'WARNING' as const,
      state: 'RESOLVED' as const,
      probability: 0.78,
      threshold: 64.5,
      unit: 'probability',
      confidence_status: 'PROBABILISTIC_EMPIRICAL',
      operational_status: 'DIAGNOSTIC_ONLY',
      data_freshness: 'HISTORICAL_ONLY',
      validation_status: 'INSUFFICIENT_DATA',
      description: 'Elevated heavy rain risk',
      deduplication_hash: 'hash1234',
      detected_at: '2024-09-15T06:00:00Z',
      valid_from: '2024-09-15T00:00:00Z',
      valid_until: '2024-09-22T00:00:00Z',
      updated_at: '2024-09-22T06:00:00Z',
      resolved_by: 'Analyst',
      resolved_at: '2024-09-22T06:00:00Z',
    };

    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      success: true,
      data: mockResolveRes,
    });

    const res = await eventService.resolveEvent('evt-test-01', 'Horizon completed');
    expect(res.success).toBe(true);
    expect(res.data?.state).toBe('RESOLVED');
  });

  it('retrieves operational status report', async () => {
    const mockOpStatus = {
      forecast_service_status: 'HEALTHY',
      model_registry_status: 'ONLINE',
      data_freshness_status: 'HISTORICAL_ONLY',
      calibration_status: 'CALIBRATED',
      validation_status: 'INSUFFICIENT_DATA',
      event_engine_status: 'ACTIVE',
      delivery_status: 'DIAGNOSTIC_SIMULATED',
      database_status: 'CONNECTED',
      last_successful_forecast_generation: '2024-09-15T06:00:00Z',
      last_event_detection: '2024-09-15T06:00:00Z',
      last_expiry_run: '2024-09-15T06:00:00Z',
      total_active_forecasts: 4,
      total_active_events: 1,
      active_dataset: 'Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)',
      spatial_extent: 'Lucknow District (1 Assimilated Anchor)',
      timestamp: '2024-09-15T06:00:00Z',
      scientific_disclosures: ['Diagnostic only; operational alerting not permitted.'],
    };

    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      success: true,
      data: mockOpStatus,
    });

    const res = await eventService.getOperationalStatus();
    expect(res.success).toBe(true);
    expect(res.data?.validation_status).toBe('INSUFFICIENT_DATA');
    expect(res.data?.data_freshness_status).toBe('HISTORICAL_ONLY');
    expect(res.data?.delivery_status).toBe('DIAGNOSTIC_SIMULATED');
  });

  it('processes forecast expiry sweep', async () => {
    const mockExpiryRes = {
      processed_count: 4,
      expired_count: 0,
      expired_forecast_ids: [],
      timestamp: '2024-09-15T06:00:00Z',
      message: 'Processed 4 forecasts, 0 expired',
    };

    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      success: true,
      data: mockExpiryRes,
    });

    const res = await eventService.processExpiry();
    expect(res.success).toBe(true);
    expect(res.data?.processed_count).toBe(4);
  });
});
