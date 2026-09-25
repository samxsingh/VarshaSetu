import { describe, it, expect, vi, beforeEach } from 'vitest';
import { advisoryService } from '../services/advisoryService';
import * as apiClient from '../services/apiClient';

describe('AdvisoryService (Phase 5A Agronomic Rules & Simulation)', () => {
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

  it('fetches registered agronomic rules', async () => {
    const mockRules = {
      total_rules: 1,
      rules: [
        {
          rule_id: 'AGRO_HEAVY_RAIN_INFO_001',
          rule_name: 'General Heavy Rainfall Information',
          description: 'IMD threshold >= 64.5 mm',
          target_meteorological_event: 'HEAVY_RAIN',
          applicable_crops: ['GENERAL'],
          applicable_growth_stages: ['ALL'],
          severity: 'INFO' as const,
          category: 'WEATHER_RISK' as const,
          probability_threshold: 0.40,
          meteorological_threshold: 64.5,
          meteorological_unit: 'mm',
          rationale_template: 'Rain >= 64.5mm',
          advisory_template: 'Notice',
          scientific_basis: 'IMD criteria',
          priority: 10,
          is_active: true,
        },
      ],
    };

    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: mockRules,
    });

    const res = await advisoryService.listRules();
    expect(res.success).toBe(true);
    expect(res.data?.rules.length).toBe(1);
    expect(res.data?.rules[0].rule_id).toBe('AGRO_HEAVY_RAIN_INFO_001');
  });

  it('executes What-If scenario simulation returning SCENARIO_INDICATOR_ONLY', async () => {
    const mockSim = {
      scenario_id: 'SCEN_TEST_01',
      scenario_type: 'SOWING_DELAY',
      block_id: 'UP_LKO_BKT',
      crop_type: 'PADDY',
      growth_stage: 'VEGETATIVE',
      baseline_forecast_id: 'FCST_BASE',
      parameters: { delay_days: 7 },
      risk_shift_indicator: 'ELEVATED_RISK' as const,
      water_stress_shift_percentage: 24.5,
      waterlogging_shift_percentage: -8.2,
      confidence_status: 'MODERATE_CONFIDENCE',
      classification: 'SCENARIO_INDICATOR_ONLY',
      yield_prediction_disclaimer: 'What-if simulations evaluate meteorological sensitivity indicators only.',
      scientific_notes: ['Kharif 2024 analog patterns.'],
      computed_at: '2026-09-25T00:00:00Z',
    };

    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: mockSim,
    });

    const res = await advisoryService.simulateScenario({
      block_id: 'UP_LKO_BKT',
      crop_type: 'PADDY',
      growth_stage: 'VEGETATIVE',
      scenario_type: 'SOWING_DELAY',
      parameters: { delay_days: 7 },
    });

    expect(res.success).toBe(true);
    expect(res.data?.classification).toBe('SCENARIO_INDICATOR_ONLY');
    expect(res.data?.yield_prediction_disclaimer).toContain('meteorological sensitivity');
  });
});
