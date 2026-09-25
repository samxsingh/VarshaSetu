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

  // Phase 5C Tests
  it('fetches supported languages registry', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: {
        supported_languages: [
          { code: 'EN', name: 'English', native_name: 'English', status: 'ACTIVE' },
          { code: 'HI', name: 'Hindi', native_name: 'हिन्दी', status: 'ACTIVE' },
        ],
        default_language: 'EN',
        translation_engine: 'CONTROLLED_DETERMINISTIC_TEMPLATES',
        disclaimer: 'Unvetted MT prohibited.',
      },
    });

    const res = await advisoryService.getLanguages();
    expect(res.success).toBe(true);
    expect(res.data?.supported_languages.length).toBe(2);
    expect(res.data?.translation_engine).toContain('CONTROLLED');
  });

  it('fetches controlled terminology catalog', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: {
        version: '1.0.0',
        total_terms: 15,
        terms: [
          { term_key: 'HEAVY_RAIN', category: 'METEOROLOGICAL', en: 'Heavy Rainfall', hi: 'भारी वर्षा', definition: '>=64.5mm' },
        ],
      },
    });

    const res = await advisoryService.getTerminology();
    expect(res.success).toBe(true);
    expect(res.data?.version).toBe('1.0.0');
    expect(res.data?.terms[0].hi).toBe('भारी वर्षा');
  });

  it('localizes advisory into Hindi via controlled template engine', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: {
        localized_advisory: {
          advisory_id: 'LOC_TEST_HI',
          source_advisory_id: 'SRC_001',
          language: 'HI' as const,
          title: 'भारी वर्षा जोखिम सूचक',
          summary: 'आगामी 7 दिनों के लिए भारी वर्षा सूचक।',
          risk_indicator: 'निगरानी',
          what_it_means: 'खेतों में जलभराव',
          evidence: { probability: 0.584, horizon_days: 7 },
          confidence_statement: 'अंशांकित',
          disclosure: 'सूचना',
          historical_limitation_disclosure: 'सीमा',
          classification: 'DIAGNOSTIC_ONLY',
          translation_method: 'CONTROLLED_TEMPLATE',
          template_version: '1.0.0',
          terminology_version: '1.0.0',
          localization_fingerprint: '12345678abcdef00',
        },
        safety_gate_status: 'PASSED',
        numerical_drift_detected: false,
        imperative_terms_detected: [],
      },
    });

    const res = await advisoryService.localizeAdvisory({
      advisory_id: 'SRC_001',
      target_language: 'HI',
    });

    expect(res.success).toBe(true);
    expect(res.data?.localized_advisory.language).toBe('HI');
    expect(res.data?.localized_advisory.title).toContain('भारी वर्षा');
    expect(res.data?.safety_gate_status).toBe('PASSED');
  });

  it('records read receipt acknowledgement', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: {
        message: 'Advisory read acknowledgement recorded.',
        receipt: {
          id: 'rcpt-123',
          advisory_id: 'SRC_001',
          user_id: null,
          language: 'HI',
          device_channel: 'WEB_PORTAL',
          read_at: '2026-09-25T17:00:00Z',
        },
      },
    });

    const res = await advisoryService.markAdvisoryAsRead('SRC_001', 'HI');
    expect(res.success).toBe(true);
    expect(res.data?.receipt.advisory_id).toBe('SRC_001');
  });

  it('requests voice synthesis for advisory in DEMO_ONLY mode', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      data: {
        advisory_id: 'SRC_001',
        language: 'HI',
        status: 'DEMO_ONLY' as const,
        provider: 'MOCK_LOCAL_VOICE_ENGINE',
        format: 'WAV',
        duration_seconds: 4.2,
        sample_rate_hz: 16000,
        audio_content_base64: 'data:audio/wav;base64,UklGRi...',
        transcript: 'भारी वर्षा जोखिम सूचक',
        synthesized_at: '2026-09-25T17:00:00Z',
        disclosure: 'Demo only',
      },
    });

    const res = await advisoryService.synthesizeVoice('SRC_001', {
      language: 'HI',
      speech_rate: 1.0,
    });

    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('DEMO_ONLY');
    expect(res.data?.duration_seconds).toBe(4.2);
  });
});
