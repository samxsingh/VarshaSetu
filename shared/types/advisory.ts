/**
 * VarshaSetu - Agricultural Advisory & What-If Decision Simulation Types
 * Converts probabilistic climate/weather signals into crop-specific agronomic advice.
 */

import { DataMode } from './core';
import { ForecastLocationRef } from './forecast';

export type CropType =
  | 'PADDY'
  | 'MAIZE'
  | 'SOYBEAN'
  | 'PULSES'
  | 'COTTON'
  | 'GROUNDNUT'
  | 'MILLETS';

export type CropGrowthStage =
  | 'LAND_PREPARATION'
  | 'NURSERY_SOWING'
  | 'VEGETATIVE'
  | 'FLOWERING_REPRODUCTIVE'
  | 'GRAIN_POD_FILLING'
  | 'MATURITY_HARVESTING';

export type IrrigationFacility = 'RAINFED' | 'CANAL' | 'TUBEWELL' | 'DRIP_SPRINKLER' | 'MIXED';

export type SoilType = 'ALLUVIAL' | 'BLACK_COTTON' | 'RED_LATERITE' | 'SANDY_LOAM' | 'CLAY';

export type AdvisoryActionUrgency = 'INFO' | 'PREPARE' | 'ACTION_REQUIRED' | 'CRITICAL_ALERT';

export interface FarmerCropContext {
  crop: CropType;
  variety?: string;
  stage: CropGrowthStage;
  sowingDate?: string;
  irrigation: IrrigationFacility;
  soil: SoilType;
  farmSizeAcres?: number;
}

export interface AgronomicRuleMatch {
  ruleId: string;
  category: 'SOWING' | 'IRRIGATION' | 'PEST_DISEASE' | 'FERTILIZER' | 'DRAINAGE_HARVEST';
  matchedConditions: string[];
  rationale: string; // Scientific/agronomic rule reasoning
}

export interface CropAdvisoryRecord {
  id: string;
  location: ForecastLocationRef;
  farmerContext: FarmerCropContext;
  issuedAt: string;
  validUntil: string;
  urgency: AdvisoryActionUrgency;
  
  // Clean, high-impact headline for farmers
  headline: string;
  
  // Specific action items
  recommendations: {
    title: string;
    action: string;
    agronomicReasoning: string; // Explainable logic behind the recommendation
    doThis: string[];
    avoidThis: string[];
  }[];

  // Specific risk warnings
  riskWarnings: {
    type: 'FALSE_ONSET' | 'PROLONGED_DRY_SPELL' | 'WATERLOGGING_HEAVY_RAIN' | 'PEST_OUTBREAK';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    warningText: string;
    mitigationAction: string;
  }[];

  ruleMatches: AgronomicRuleMatch[];
  dataMode: DataMode;
}

// What-If Decision Simulator Contracts
export type SimulationScenarioType =
  | 'SOWING_DATE_COMPARISON'   // "Sow Now" vs "Wait 7 Days" vs "Wait 14 Days"
  | 'IRRIGATION_DECISION'       // "Irrigate Now" vs "Wait For Rains"
  | 'CROP_SELECTION_COMPARISON'; // "Crop A" vs "Crop B" under projected season

export interface WhatIfScenarioRequest {
  locationId: string;
  currentContext: FarmerCropContext;
  scenarioType: SimulationScenarioType;
  optionsToCompare: {
    label: string;
    parameterOverrides: Partial<FarmerCropContext> & {
      sowingOffsetDays?: number;
      irrigationAction?: 'IRRIGATE_NOW' | 'HOLD_OFF';
      alternateCrop?: CropType;
    };
  }[];
}

export interface ScenarioEvaluationResult {
  optionLabel: string;
  riskScore: number; // 0.0 (safest) to 1.0 (highest risk)
  primaryRisks: string[];
  expectedAdvantages: string[];
  waterStressRiskPercent: number;
  waterloggingRiskPercent: number;
  overallSuitability: 'RECOMMENDED' | 'ACCEPTABLE_WITH_RISK' | 'HIGH_RISK_NOT_RECOMMENDED';
  explanation: string;
}

export interface WhatIfSimulationResponse {
  id: string;
  scenarioType: SimulationScenarioType;
  evaluatedAt: string;
  disclaimer: string; // "Model-based agronomic estimate for advisory purposes, not a yield or weather guarantee."
  comparison: ScenarioEvaluationResult[];
  recommendedOption: string;
  decisionReasoning: string;
  dataMode: DataMode;
}

// ====================================================================
// PHASE 5A — SCIENTIFIC AGRONOMIC RULES & ADVISORY FOUNDATION
// ====================================================================

export type AdvisorySeverityLevel = 'INFO' | 'WATCH' | 'ELEVATED' | 'HIGH';

export type AdvisoryCategoryType =
  | 'WEATHER_RISK'
  | 'WATER_STRESS'
  | 'RAINFALL_ANOMALY'
  | 'MONSOON_STATUS'
  | 'FIELD_CONDITION'
  | 'GENERAL_INFORMATION';

export interface AdvisoryEvidence {
  forecast_id: string;
  target_name: string;
  calibrated_probability: number;
  threshold_value: number;
  threshold_unit: string;
  confidence_interval_lower?: number;
  confidence_interval_upper?: number;
  model_name: string;
  model_version: string;
  data_freshness: string;
  validation_status: string;
  hindcast_brier_skill_score?: number;
  isotonic_ece?: number;
  operational_status: string;
  station_coverage: string;
  evaluation_timestamp: string;
  horizon_days?: number;
  probability?: number;
}

export interface AdvisoryExplanation {
  headline: string;
  evidence_summary: string;
  model_signals: string[];
  historical_context: string;
  uncertainty_caveat: string;
  language_mode: string;
}

export interface ScientificAdvisory {
  advisory_id: string;
  forecast_id: string;
  block_id: string;
  crop_type: string;
  growth_stage: string;
  rule_id: string;
  rule_name: string;
  severity: AdvisorySeverityLevel;
  category: AdvisoryCategoryType;
  headline: string;
  advisory_text: string;
  valid_from: string;
  valid_until: string;
  operational_status: string;
  scientific_basis: string;
  uncertainty_caveat: string;
  confidence_status: string;
  evidence: AdvisoryEvidence;
  explanation: AdvisoryExplanation;
  deduplication_hash: string;
  status: 'ACTIVE' | 'DISMISSED' | 'EXPIRED' | 'SUPERSEDED';
  created_at: string;
}

export interface AgronomicRule {
  rule_id: string;
  rule_name: string;
  description: string;
  target_meteorological_event: string;
  applicable_crops: string[];
  applicable_growth_stages: string[];
  severity: AdvisorySeverityLevel;
  category: AdvisoryCategoryType;
  probability_threshold: number;
  meteorological_threshold: number;
  meteorological_unit: string;
  rationale_template: string;
  advisory_template: string;
  scientific_basis: string;
  priority: number;
  is_active: boolean;
}

export interface AgronomicCrop {
  crop: string;
  scientific_name: string;
  supported_growth_stages: string[];
  relevant_weather_hazards: string[];
  notes: string;
  status: string;
}

export interface BlockedAdvisoryResponse {
  blocked: boolean;
  rule_id?: string;
  check_name: string;
  reason: string;
  safety_rule: string;
  mitigation: string;
  timestamp: string;
}

export interface ScenarioContract {
  scenario_id: string;
  scenario_type: 'SOWING_DELAY' | 'IRRIGATION_INTERVENTION' | 'SEASONAL_ANOMALY';
  block_id: string;
  crop_type: string;
  growth_stage: string;
  baseline_forecast_id: string;
  parameters: Record<string, any>;
  classification: string;
  yield_prediction_included: boolean;
  disclaimer: string;
}

export interface IndicatorDelta {
  indicator_name: string;
  baseline_value: number;
  scenario_value: number;
  absolute_delta: number;
  relative_delta_pct?: number | null;
  baseline_category: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  scenario_category: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  direction: 'INCREASED' | 'DECREASED' | 'UNCHANGED';
  scientific_interpretation: string;
}

export interface ScenarioEnvelope {
  indicator_name: string;
  min_value: number;
  max_value: number;
  baseline_value: number;
  median_value: number;
  min_category: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  max_category: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  baseline_category: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  median_category: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  data_origin_labels?: Record<string, string>;
}

export interface SensitivityPoint {
  parameter_value: number;
  parameter_label: string;
  indicator_values: Record<string, number>;
  indicator_categories: Record<string, string>;
  deltas: Record<string, number>;
}

export interface SensitivityAnalysisResult {
  scenario_id: string;
  scenario_type: string;
  parameter_name: string;
  parameter_range: number[];
  curve_points: SensitivityPoint[];
  envelope: ScenarioEnvelope;
  scientific_notes: string[];
}

export interface ScenarioProvenance {
  dataset_fingerprint: string;
  scenario_fingerprint: string;
  engine_version: string;
  scenario_version: string;
  created_at: string;
  baseline_reference: string;
  parameter_hash: string;
  input_feature_hash: string;
}

export interface ScenarioExplanation {
  baseline_description: string;
  perturbations_applied: string[];
  indicator_shift_summary: string;
  meteorological_drivers: string[];
  assumptions: string[];
  observed_vs_simulated: Record<string, string>;
  non_causal_statement: string;
}

export interface ScenarioComparison {
  scenario_id: string;
  baseline_reference: string;
  scenario_type: string;
  crop: string;
  crop_stage: string;
  applicability: string;
  deltas: IndicatorDelta[];
  envelope?: ScenarioEnvelope;
  explanation: ScenarioExplanation;
  provenance: ScenarioProvenance;
  scientific_disclaimer: string;
}

export interface ScenarioRegistryItem {
  scenario_type: string;
  display_name: string;
  description: string;
  allowed_parameters: Record<string, any>;
  evaluated_indicators: string[];
  max_dimensions: number;
}

export interface ScenarioResult {
  scenario_id: string;
  scenario_type: string;
  classification: string;
  block_id: string;
  crop: string;
  crop_stage: string;
  applicability?: string;
  inputs?: Record<string, any>;
  baseline_summary?: Record<string, any>;
  simulated_summary?: Record<string, any>;
  hypothetical_risk_indicators?: any[];
  deltas?: IndicatorDelta[];
  envelope?: ScenarioEnvelope;
  explanation?: ScenarioExplanation;
  provenance?: ScenarioProvenance;
  scientific_disclaimer: string;
  timestamp?: string;

  // Legacy Phase 5A fields for compatibility
  crop_type?: string;
  growth_stage?: string;
  baseline_forecast_id?: string;
  parameters?: Record<string, any>;
  risk_shift_indicator?: 'REDUCED_RISK' | 'NEUTRAL_CHANGE' | 'ELEVATED_RISK';
  water_stress_shift_percentage?: number;
  waterlogging_shift_percentage?: number;
  confidence_status?: string;
  yield_prediction_disclaimer?: string;
  scientific_notes?: string[];
  computed_at?: string;
}


// ====================================================================
// PHASE 5C — MULTILINGUAL ADVISORY DELIVERY & VOICE ACCESSIBILITY
// ====================================================================

export type LanguageCode = 'EN' | 'HI';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  native_name: string;
  status: string;
}

export interface TerminologyCatalogItem {
  term_key: string;
  category: string;
  en: string;
  hi: string;
  definition: string;
}

export interface LocalizedAdvisory {
  id?: string;
  advisory_id: string;
  source_advisory_id: string;
  language: LanguageCode;
  title: string;
  summary: string;
  risk_indicator: string;
  what_it_means: string;
  evidence: Record<string, any>;
  confidence_statement: string;
  disclosure: string;
  historical_limitation_disclosure: string;
  classification: string;
  translation_method: string;
  template_version: string;
  terminology_version: string;
  localization_fingerprint: string;
  generated_at?: string;
  created_at?: string;
}

export type VoiceStatus = 'NOT_CONFIGURED' | 'DEMO_ONLY' | 'READY' | 'ERROR';

export interface VoiceSynthesisResult {
  advisory_id: string;
  language: string;
  status: VoiceStatus;
  provider: string;
  format: string;
  duration_seconds: number;
  sample_rate_hz: number;
  audio_url?: string | null;
  audio_content_base64?: string | null;
  transcript: string;
  synthesized_at: string;
  disclosure: string;
}

export interface VoiceSubsystemStatus {
  active_provider: string;
  status: {
    provider: string;
    status: VoiceStatus;
    configured: boolean;
    mode?: string;
    disclaimer?: string;
  };
  system_mode: string;
  telecom_integration: string;
  disclosure: string;
}

export interface AdvisoryReadReceipt {
  id: string;
  advisory_id: string;
  user_id: string | null;
  language: string;
  device_channel: string;
  read_at: string;
}



