import { z } from 'zod';

// ==========================================
// 1. SCIENTIFIC FORECAST SCHEMAS
// ==========================================

export const LocationSchema = z.object({
  state_id: z.string().default('UP'),
  district_id: z.string().default('UP_LKO'),
  block_id: z.string().default('UP_LKO_BKT'),
  latitude: z.number().default(26.9749),
  longitude: z.number().default(80.9276),
  spatial_resolution: z.string().optional().default('BLOCK'),
});

export const ForecastTargetSchema = z.object({
  name: z.string().optional(),
  target_type: z.string().optional(),
  threshold_mm: z.number().optional().nullable(),
  threshold: z.number().optional().nullable(),
  unit: z.string().default('probability'),
  target_definition_version: z.string().optional(),
}).transform((data) => ({
  name: data.name || data.target_type || 'heavy_rain',
  target_type: data.target_type || data.name || 'HEAVY_RAIN',
  threshold_mm: data.threshold_mm ?? data.threshold ?? null,
  unit: data.unit,
  target_definition_version: data.target_definition_version,
}));

export const ForecastHorizonSchema = z.object({
  days: z.number().int().optional(),
  horizon_days: z.number().int().optional(),
  label: z.string().optional(),
  horizon_label: z.string().optional(),
}).transform((data) => ({
  days: data.days ?? data.horizon_days ?? 7,
  horizon_days: data.horizon_days ?? data.days ?? 7,
  label: data.label || data.horizon_label || '7-Day Outlook',
  horizon_label: data.horizon_label || data.label || '7-Day Outlook',
}));

export const ForecastModelMetaSchema = z.object({
  model_id: z.string(),
  algorithm: z.string().optional(),
  model_family: z.string().optional(),
  version: z.string().optional(),
  model_version: z.string().optional(),
  training_period: z.string().optional(),
  dataset_fingerprint: z.string().optional(),
}).transform((data) => ({
  model_id: data.model_id,
  algorithm: data.algorithm || data.model_family || 'Machine Learning Estimator',
  model_family: data.model_family || data.algorithm || 'Machine Learning Estimator',
  version: data.version || data.model_version || '1.0.0',
  model_version: data.model_version || data.version || '1.0.0',
  training_period: data.training_period,
  dataset_fingerprint: data.dataset_fingerprint,
}));

export const ForecastPredictionSchema = z.object({
  raw_probability: z.number().min(0.0).max(1.0).optional().nullable(),
  calibrated_probability: z.number().min(0.0).max(1.0).optional().nullable(),
  probability: z.number().min(0.0).max(1.0).optional().nullable(),
  expected_value_mm: z.number().optional().nullable(),
  predicted_value: z.number().optional().nullable(),
  risk_category: z.string().optional(),
  category: z.string().optional(),
}).transform((data) => {
  const prob = data.calibrated_probability ?? data.probability ?? data.raw_probability ?? 0.0;
  return {
    raw_probability: data.raw_probability ?? prob,
    calibrated_probability: data.calibrated_probability ?? prob,
    probability: prob,
    expected_value_mm: data.expected_value_mm ?? data.predicted_value ?? null,
    risk_category: (data.risk_category || data.category || 'LOW') as 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME',
    category: data.category || data.risk_category || 'LOW',
  };
});

export const ForecastCalibrationSchema = z.object({
  method: z.string().optional().default('PLATT_SCALING'),
  status: z.string().optional().default('CALIBRATED'),
  calibrator_type: z.string().optional(),
  brier_score_raw: z.number().optional().nullable(),
  brier_score_calibrated: z.number().optional().nullable(),
  gate_passed: z.boolean().optional().default(true),
  calibration_artifact_id: z.string().optional().nullable(),
});

export const ForecastUncertaintySchema = z.object({
  p10: z.number().min(0.0).max(1.0).optional().nullable(),
  p50: z.number().min(0.0).max(1.0).optional().nullable(),
  p90: z.number().min(0.0).max(1.0).optional().nullable(),
  lower_bound: z.number().min(0.0).max(1.0).optional().nullable(),
  median: z.number().min(0.0).max(1.0).optional().nullable(),
  upper_bound: z.number().min(0.0).max(1.0).optional().nullable(),
  confidence_interval_pct: z.number().optional().default(80.0),
  status: z.string().optional(),
  method: z.string().optional(),
}).transform((data) => {
  const p10 = data.p10 ?? data.lower_bound ?? 0.10;
  const p50 = data.p50 ?? data.median ?? 0.25;
  const p90 = data.p90 ?? data.upper_bound ?? 0.40;
  return {
    p10,
    p50,
    p90,
    lower_bound: data.lower_bound ?? p10,
    median: data.median ?? p50,
    upper_bound: data.upper_bound ?? p90,
    confidence_interval_pct: data.confidence_interval_pct || 80.0,
    status: data.status || 'CALCULATED',
    method: data.method || 'EMPIRICAL',
  };
}).refine((data) => data.p10 <= data.p50 && data.p50 <= data.p90, {
  message: 'Uncertainty intervals must satisfy monotonicity: p10 <= p50 <= p90',
});

export const ForecastValidationSchema = z.object({
  operational_allowed: z.boolean().optional().default(false),
  hindcast_validated: z.boolean().optional().default(true),
  single_season_warning: z.boolean().optional().default(true),
  status: z.string().optional().default('DIAGNOSTIC_ONLY'),
  validation_status: z.string().optional(),
  validation_years: z.array(z.number()).optional(),
  hindcast_experiment_id: z.string().optional(),
}).transform((data) => ({
  operational_allowed: data.operational_allowed ?? false,
  hindcast_validated: data.hindcast_validated ?? true,
  single_season_warning: data.single_season_warning ?? true,
  status: (data.status || data.validation_status || 'DIAGNOSTIC_ONLY') as any,
  validation_status: data.validation_status || data.status || 'DIAGNOSTIC_ONLY',
  validation_years: data.validation_years || [2024],
  hindcast_experiment_id: data.hindcast_experiment_id,
}));

export const ShapFeatureSchema = z.object({
  feature_name: z.string().optional(),
  feature: z.string().optional(),
  value: z.number().optional().nullable(),
  shap_value: z.number().optional().default(0.0),
  contribution: z.string().optional(),
  direction: z.string().optional(),
  category: z.string().optional(),
  magnitude: z.number().optional(),
  description: z.string().optional(),
}).transform((data) => ({
  feature_name: data.feature_name || data.feature || 'unknown_feature',
  feature: data.feature || data.feature_name || 'unknown_feature',
  value: data.value ?? 0.0,
  shap_value: data.shap_value,
  contribution: (data.contribution || (data.shap_value >= 0 ? 'INCREASES_RISK' : 'DECREASES_RISK')) as any,
  direction: data.direction || (data.shap_value >= 0 ? 'elevates' : 'suppresses'),
  category: data.category || 'Meteorological Feature',
  magnitude: data.magnitude ?? Math.abs(data.shap_value),
  description: data.description,
}));

export const ForecastExplainabilitySchema = z.object({
  method: z.string().optional().default('TREE_SHAP'),
  status: z.string().optional().default('EXPLAINED'),
  base_value: z.number().optional().default(0.0),
  top_features: z.array(ShapFeatureSchema).optional().default([]),
  shap_artifact_id: z.string().optional(),
});

export const ForecastDataProvenanceSchema = z.object({
  dataset_name: z.string().optional().default('Kharif 2024 Reanalysis'),
  source_status: z.string().optional(),
  freshness_status: z.string().optional(),
  season: z.string().optional().default('Kharif 2024'),
  observation_count: z.number().optional().default(122),
  missingness: z.number().optional(),
  feature_coverage: z.string().optional(),
  ground_anchor: z.string().optional().default('UP_LKO_BKT'),
});

export const ScientificDisclosureSchema = z.union([
  z.string(),
  z.object({
    status: z.string().optional().default('DIAGNOSTIC_ONLY'),
    messages: z.array(z.string()).optional().default([]),
  }).transform((d) => d.messages.join(' ')),
]);

export const ScientificForecastRecordSchema = z.object({
  forecast_id: z.string(),
  generated_at: z.string(),
  valid_from: z.string(),
  valid_until: z.string(),
  location: LocationSchema,
  target: ForecastTargetSchema,
  horizon: ForecastHorizonSchema,
  model: ForecastModelMetaSchema,
  prediction: ForecastPredictionSchema,
  calibration: ForecastCalibrationSchema,
  uncertainty: ForecastUncertaintySchema,
  validation: ForecastValidationSchema,
  explainability: ForecastExplainabilitySchema.optional().default({
    method: 'TREE_SHAP',
    status: 'EXPLAINED',
    base_value: 0.0,
    top_features: [],
  }),
  data: ForecastDataProvenanceSchema,
  scientific_disclosure: ScientificDisclosureSchema,
});

export type ScientificForecastRecord = z.infer<typeof ScientificForecastRecordSchema>;

export const ForecastGenerateRequestSchema = z.object({
  target_name: z.enum(['heavy_rain', 'dry_spell', 'rainfall_amount', 'HEAVY_RAIN', 'DRY_SPELL', 'RAINFALL_AMOUNT']),
  horizon_days: z.number().int().default(7),
  block_id: z.string().default('UP_LKO_BKT'),
  model_id: z.string().optional(),
});

export type ForecastGenerateRequest = z.infer<typeof ForecastGenerateRequestSchema>;

// ==========================================
// 2. ML HEALTH & DIAGNOSTIC SCHEMAS
// ==========================================

export const MLHealthResponseSchema = z.object({
  status: z.string(),
  service: z.string().optional().default('varshasetu-ml-service'),
  version: z.string().optional().default('1.0.0'),
  timestamp: z.string().optional(),
  uptime_seconds: z.number().optional(),
  subsystems: z.record(z.any()).optional(),
  scientific_integrity: z.record(z.any()).optional(),
});

export type MLHealthResponse = z.infer<typeof MLHealthResponseSchema>;

// ==========================================
// 3. MODEL & CALIBRATION SCHEMAS
// ==========================================

export const ModelMetadataSchema = z.object({
  model_id: z.string(),
  model_family: z.string(),
  target: z.string(),
  horizon_days: z.number(),
  block_id: z.string(),
  trained_at: z.string().optional(),
  metrics: z.record(z.any()).optional().default({}),
  parameters: z.record(z.any()).optional().default({}),
  status: z.string().default('ACTIVE'),
});

export const ModelRegistryResponseSchema = z.object({
  service: z.string().optional(),
  models_registered: z.number().optional(),
  models: z.array(ModelMetadataSchema).default([]),
  scientific_notes: z.string().optional(),
});

export const ReliabilityBinSchema = z.object({
  bin_index: z.number().int(),
  predicted_prob_mean: z.number().nullable().optional(),
  empirical_prob_mean: z.number().nullable().optional(),
  observed_frequency: z.number().nullable().optional(),
  sample_count: z.number().int(),
  calibration_error: z.number().nullable().optional(),
});

export const ReliabilityCurveSchema = z.object({
  model_id: z.string(),
  calibration_method: z.string().optional(),
  calibration_status: z.string().optional(),
  brier_score_raw: z.number().optional().nullable(),
  brier_score_calibrated: z.number().optional().nullable(),
  brier_score: z.number().optional().nullable(),
  log_loss: z.number().optional().nullable(),
  ece: z.number().optional().nullable(),
  expected_calibration_error: z.number().optional().nullable(),
  maximum_calibration_error: z.number().optional().nullable(),
  bins: z.array(ReliabilityBinSchema).default([]),
});

// ==========================================
// 4. AGRONOMY & SCENARIO SCHEMAS
// ==========================================

export const ScenarioContractSchema = z.object({
  scenario_type: z.enum(['SOWING_WINDOW_SHIFT', 'DRY_SPELL_RESILIENCE', 'IRRIGATION_OPTIMIZATION', 'CROP_SWITCHING']),
  crop_type: z.string(),
  sowing_delay_days: z.number().optional().default(0),
  irrigation_capacity_mm: z.number().optional().default(0),
  block_id: z.string().default('UP_LKO_BKT'),
  parameters: z.record(z.any()).optional().default({}),
});

export const ScenarioResultSchema = z.object({
  scenario_id: z.string(),
  scenario_type: z.string(),
  crop_type: z.string(),
  block_id: z.string(),
  computed_at: z.string(),
  risk_index_baseline: z.number(),
  risk_index_scenario: z.number(),
  risk_delta_pct: z.number(),
  agronomic_advisory: z.string(),
  safety_gate_passed: z.boolean().default(true),
  disclaimer: z.string(),
  scientific_disclosure: z.string().default('Deterministic scenario indicator only. Not a causal yield forecast.'),
});

export const ScenarioSensitivityResultSchema = z.object({
  scenario_id: z.string(),
  parameter_tested: z.string(),
  perturbations: z.array(
    z.object({
      shift_value: z.number(),
      risk_index: z.number(),
      risk_delta_pct: z.number(),
      status: z.string().optional(),
    })
  ),
  sensitivity_slope: z.number().optional(),
  scientific_disclosure: z.string(),
});
