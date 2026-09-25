import { describe, it, expect, vi, beforeEach } from 'vitest';
import { advisoryService } from '../services/advisoryService';
import * as apiClient from '../services/apiClient';

describe('AdvisoryService (Phase 5A & 5B Agronomic Rules & Scenario Analysis)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches agronomy status with DIAGNOSTIC_ONLY operational mode', async () => {
    const mockStatus = {
      status: 'active',
      phase: 'PHASE_5A_AGRONOMIC_RULES_FOUNDATION',
      operational_mode: 'DIAGNOSTIC_ONLY',
      operational_advisory_allowed: false,
      active_dataset: 'Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)',
      station_coverage: '1 Station (Bakshi Ka Talab centroid)',
      total_registered_rules: 9,
      total_supported_crops: 6,
      total_active_advisories: 2,
      safety_gate: {
        status: 'ENFORCING',
        evaluated_checks_count: 13,
        blocked_imperative_directives: true,
      },
      scientific_disclosure: 'Informational diagnostic mode.',
      timestamp: '2026-09-25T00:00:00Z',
    };

    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: mockStatus,
    });

    const res = await advisoryService.getStatus();
    expect(res.success).toBe(true);
    expect(res.data?.operational_mode).toBe('DIAGNOSTIC_ONLY');
    expect(res.data?.safety_gate.status).toBe('ENFORCING');
    expect(res.data?.total_registered_rules).toBe(9);
  });

  it('fetches registered crops list', async () => {
    const mockCrops = {
      total_crops: 6,
      crops: [
        { crop: 'GENERAL', scientific_name: 'All Crops', supported_growth_stages: ['ALL'], relevant_weather_hazards: [], notes: '', status: 'INFORMATIONAL_ONLY' },
        { crop: 'PADDY', scientific_name: 'Oryza sativa', supported_growth_stages: ['VEGETATIVE'], relevant_weather_hazards: [], notes: '', status: 'INFORMATIONAL_ONLY' },
      ],
    };

    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: mockCrops,
    });

    const res = await advisoryService.listCrops();
    expect(res.success).toBe(true);
    expect(res.data?.total_crops).toBe(6);
  });

  it('fetches scenario registry with 6 scenario types (Phase 5B)', async () => {
    const mockRegistry = {
      status: 'active',
      phase: 'PHASE_5B_ADVANCED_SCENARIO_ANALYSIS',
      classification: 'SCENARIO_INDICATOR_ONLY',
      total_scenario_types: 6,
      registry: [
        { scenario_type: 'SOWING_DELAY', display_name: 'Sowing Delay', description: '', allowed_parameters: {}, evaluated_indicators: [], max_dimensions: 1 },
        { scenario_type: 'IRRIGATION_INTERVENTION', display_name: 'Supplemental Irrigation', description: '', allowed_parameters: {}, evaluated_indicators: [], max_dimensions: 1 },
        { scenario_type: 'SEASONAL_ANOMALY', display_name: 'Seasonal Anomaly', description: '', allowed_parameters: {}, evaluated_indicators: [], max_dimensions: 1 },
        { scenario_type: 'RAINFALL_TIMING_SHIFT', display_name: 'Timing Shift', description: '', allowed_parameters: {}, evaluated_indicators: [], max_dimensions: 1 },
        { scenario_type: 'HEAVY_RAIN_CONCENTRATION', display_name: 'Heavy Rain Concentration', description: '', allowed_parameters: {}, evaluated_indicators: [], max_dimensions: 1 },
        { scenario_type: 'COMBINED_SCENARIO', display_name: 'Compound Multi-Hazard', description: '', allowed_parameters: {}, evaluated_indicators: [], max_dimensions: 3 },
      ],
      scientific_disclaimer: 'This scenario evaluates sensitivity indicators only. It does NOT predict crop yields.',
    };

    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: mockRegistry,
    });

    const res = await advisoryService.getScenarioRegistry();
    expect(res.success).toBe(true);
    expect(res.data?.total_scenario_types).toBe(6);
    expect(res.data?.classification).toBe('SCENARIO_INDICATOR_ONLY');
  });

  it('runs scenario simulation and returns comparative deltas (Phase 5B)', async () => {
    const mockResult = {
      scenario_id: 'SCEN_5B_001',
      scenario_type: 'SOWING_DELAY',
      classification: 'SCENARIO_INDICATOR_ONLY',
      block_id: 'UP_LKO_BKT',
      crop: 'PADDY',
      crop_stage: 'VEGETATIVE',
      deltas: [
        {
          indicator_name: 'moisture_stress_pct',
          baseline_value: 32.0,
          scenario_value: 51.6,
          absolute_delta: 19.6,
          relative_delta_pct: 61.25,
          baseline_category: 'MODERATE' as const,
          scenario_category: 'HIGH' as const,
          direction: 'INCREASED' as const,
          scientific_interpretation: 'Moisture stress increases under simulated delay.',
        },
      ],
      scientific_disclaimer: 'It does NOT predict crop yields.',
    };

    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: mockResult,
    });

    const res = await advisoryService.runScenario({
      scenario_type: 'SOWING_DELAY',
      delay_days: 7,
      crop: 'PADDY',
      crop_stage: 'VEGETATIVE',
    });

    expect(res.success).toBe(true);
    expect(res.data?.classification).toBe('SCENARIO_INDICATOR_ONLY');
    expect(res.data?.deltas?.length).toBe(1);
    expect(res.data?.deltas?.[0].direction).toBe('INCREASED');
  });
});
