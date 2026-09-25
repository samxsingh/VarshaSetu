-- Migration 009: Agronomic Advisories, Rule Evaluations, and What-If Scenario Runs
-- Purpose: Schema foundation for scientific agronomic rules, safety-gated informational advisories,
-- and scenario sensitivity simulations (Phase 5A).

-- 1. Agronomic Advisories
CREATE TABLE IF NOT EXISTS agronomic_advisories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisory_id VARCHAR(100) NOT NULL UNIQUE,
  forecast_id VARCHAR(255) NOT NULL,
  block_id VARCHAR(100) NOT NULL,
  crop_type VARCHAR(50) NOT NULL,
  growth_stage VARCHAR(50) NOT NULL,
  rule_id VARCHAR(100) NOT NULL,
  rule_name VARCHAR(255) NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('INFO', 'WATCH', 'ELEVATED', 'HIGH')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('WEATHER_RISK', 'WATER_STRESS', 'RAINFALL_ANOMALY', 'MONSOON_STATUS', 'FIELD_CONDITION', 'GENERAL_INFORMATION')),
  headline VARCHAR(255) NOT NULL,
  advisory_text TEXT NOT NULL,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  operational_status VARCHAR(50) NOT NULL DEFAULT 'DIAGNOSTIC_ONLY',
  scientific_basis TEXT NOT NULL,
  uncertainty_caveat TEXT NOT NULL,
  confidence_status VARCHAR(100) NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}',
  explanation JSONB NOT NULL DEFAULT '{}',
  deduplication_hash VARCHAR(64) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISMISSED', 'EXPIRED', 'SUPERSEDED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agro_adv_advisory_id ON agronomic_advisories(advisory_id);
CREATE INDEX IF NOT EXISTS idx_agro_adv_forecast_id ON agronomic_advisories(forecast_id);
CREATE INDEX IF NOT EXISTS idx_agro_adv_block_id ON agronomic_advisories(block_id);
CREATE INDEX IF NOT EXISTS idx_agro_adv_crop_type ON agronomic_advisories(crop_type);
CREATE INDEX IF NOT EXISTS idx_agro_adv_rule_id ON agronomic_advisories(rule_id);
CREATE INDEX IF NOT EXISTS idx_agro_adv_severity ON agronomic_advisories(severity);
CREATE INDEX IF NOT EXISTS idx_agro_adv_status ON agronomic_advisories(status);
CREATE INDEX IF NOT EXISTS idx_agro_adv_dedup_hash ON agronomic_advisories(deduplication_hash);
CREATE INDEX IF NOT EXISTS idx_agro_adv_created_at ON agronomic_advisories(created_at DESC);

-- 2. Agronomic Rule Evaluations Audit Log
CREATE TABLE IF NOT EXISTS agronomic_rule_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id VARCHAR(100) NOT NULL UNIQUE,
  forecast_id VARCHAR(255) NOT NULL,
  block_id VARCHAR(100) NOT NULL,
  crop_type VARCHAR(50) NOT NULL,
  growth_stage VARCHAR(50) NOT NULL,
  safety_gate_passed BOOLEAN NOT NULL,
  blocked_reasons JSONB DEFAULT '[]',
  rules_evaluated INTEGER NOT NULL DEFAULT 0,
  advisories_generated INTEGER NOT NULL DEFAULT 0,
  evaluator VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agro_eval_forecast_id ON agronomic_rule_evaluations(forecast_id);
CREATE INDEX IF NOT EXISTS idx_agro_eval_block_id ON agronomic_rule_evaluations(block_id);
CREATE INDEX IF NOT EXISTS idx_agro_eval_crop_type ON agronomic_rule_evaluations(crop_type);
CREATE INDEX IF NOT EXISTS idx_agro_eval_created_at ON agronomic_rule_evaluations(created_at DESC);

-- 3. Scenario Runs (What-If sensitivity explorations)
CREATE TABLE IF NOT EXISTS scenario_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id VARCHAR(100) NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  block_id VARCHAR(100) NOT NULL,
  crop_type VARCHAR(50) NOT NULL,
  growth_stage VARCHAR(50) NOT NULL,
  baseline_forecast_id VARCHAR(255) NOT NULL,
  scenario_parameters JSONB NOT NULL DEFAULT '{}',
  scenario_results JSONB NOT NULL DEFAULT '{}',
  indicator_only_ack BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenario_runs_scenario_id ON scenario_runs(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_runs_block_id ON scenario_runs(block_id);
CREATE INDEX IF NOT EXISTS idx_scenario_runs_crop_type ON scenario_runs(crop_type);
CREATE INDEX IF NOT EXISTS idx_scenario_runs_created_at ON scenario_runs(created_at DESC);
