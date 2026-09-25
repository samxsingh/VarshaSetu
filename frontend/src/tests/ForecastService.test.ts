import { describe, it, expect, vi, beforeEach } from 'vitest';
import { forecastService } from '../services/forecastService';
import * as apiClient from '../services/apiClient';

describe('forecastService API Client (Phase 4E Scientific Forecast Products)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches forecast status with diagnostic mode metadata', async () => {
    const mockStatus = {
      service: 'varshasetu-forecast-engine',
      phase: 'PHASE_4E_OPERATIONAL_FORECAST_STAGE',
      operational_forecast_allowed: false,
      system_status: 'DIAGNOSTIC_ONLY',
      active_dataset: 'Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)',
      total_records: 122,
      total_forecasts_generated: 4,
      message: 'Operational forecast product layer active.',
      scientific_disclosure: 'Historical ground observations reflect Kharif 2024.',
    };

    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      success: true,
      data: mockStatus,
      meta: {
        timestamp: new Date().toISOString(),
        dataMode: 'REAL',
      },
    });

    const res = await forecastService.getForecastStatus();
    expect(res.success).toBe(true);
    expect(res.data?.phase).toBe('PHASE_4E_OPERATIONAL_FORECAST_STAGE');
    expect(res.data?.operational_forecast_allowed).toBe(false);
    expect(res.data?.system_status).toBe('DIAGNOSTIC_ONLY');
  });

  it('fetches data availability report with 19 core features', async () => {
    const mockAvail = {
      block_id: 'UP_LKO_BKT',
      data_freshness: 'HISTORICAL_ONLY',
      latest_observation_date: '2024-09-30',
      days_since_latest_observation: 725,
      features_available: 19,
      features_required: 19,
      feature_coverage_pct: 100.0,
      missingness_pct: 0.0,
      expected_cadence: 'Daily (24h)',
      stale_threshold_hours: 48,
      operational_allowed: false,
      scientific_notes: 'Historical Kharif 2024 archive.',
    };

    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      success: true,
      data: mockAvail,
      meta: {
        timestamp: new Date().toISOString(),
        dataMode: 'REAL',
      },
    });

    const res = await forecastService.getForecastAvailability('UP_LKO_BKT');
    expect(res.success).toBe(true);
    expect(res.data?.block_id).toBe('UP_LKO_BKT');
    expect(res.data?.features_available).toBe(19);
    expect(res.data?.operational_allowed).toBe(false);
  });

  it('fetches forecast targets list without agronomic crop commands', async () => {
    const mockTargets = {
      targets: [
        { target_type: 'HEAVY_RAIN', name: 'Heavy Rain', description: '≥64.5mm', unit: 'probability', category: 'Extreme', version: 'v1' },
        { target_type: 'DRY_SPELL', name: 'Dry Spell', description: '<2.5mm for 3d', unit: 'probability', category: 'Stress', version: 'v1' },
        { target_type: 'RAINFALL_AMOUNT', name: 'Rainfall Amount', description: 'mm', unit: 'mm', category: 'QPF', version: 'v1' },
      ],
    };

    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      success: true,
      data: mockTargets,
      meta: {
        timestamp: new Date().toISOString(),
        dataMode: 'REAL',
      },
    });

    const res = await forecastService.getForecastTargets();
    expect(res.success).toBe(true);
    const types = res.data?.targets.map((t) => t.target_type);
    expect(types).toContain('HEAVY_RAIN');
    expect(types).not.toContain('SOW');
    expect(types).not.toContain('SPRAY');
  });

  it('fetches forecast horizons list (1, 3, 7, 14, 21, 30 days)', async () => {
    const mockHorizons = {
      horizons: [
        { horizon_days: 1, horizon_label: '1-Day Nowcast', description: 'Immediate', meteorological_scale: 'Micro', uncertainty_supported: true },
        { horizon_days: 7, horizon_label: '7-Day Medium', description: 'Weekly', meteorological_scale: 'Synoptic', uncertainty_supported: true },
      ],
    };

    vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
      success: true,
      data: mockHorizons,
      meta: {
        timestamp: new Date().toISOString(),
        dataMode: 'REAL',
      },
    });

    const res = await forecastService.getForecastHorizons();
    expect(res.success).toBe(true);
    expect(res.data?.horizons.length).toBeGreaterThan(0);
  });
});
