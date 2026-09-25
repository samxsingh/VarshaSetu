-- Migration 010: Advanced Scenario Analysis, Comparisons & Sensitivity Engine (Phase 5B)
-- Purpose: Schema foundation for controlled What-If scenario evaluations,
-- baseline comparisons, parameter response curves, and provenance tracking.

-- 1. Extend scenario_runs if not already present
ALTER TABLE scenario_runs 
  ADD COLUMN IF NOT EXISTS scenario_type VARCHAR(64) DEFAULT 'SOWING_DELAY',
  ADD COLUMN IF NOT EXISTS classification VARCHAR(64) DEFAULT 'SCENARIO_INDICATOR_ONLY',
  ADD COLUMN IF NOT EXISTS deltas JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS envelope JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS explanation JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS provenance JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS scientific_disclaimer TEXT DEFAULT 'This scenario evaluates meteorological and agro-meteorological sensitivity indicators only. It does NOT predict crop yields, biomass production, revenue, or guaranteed agronomic outcomes.';

CREATE INDEX IF NOT EXISTS idx_scenario_runs_type ON scenario_runs(scenario_type);

-- 2. Scenario Comparisons Table
CREATE TABLE IF NOT EXISTS scenario_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id VARCHAR(100) NOT NULL,
  baseline_reference TEXT NOT NULL,
  scenario_type VARCHAR(64) NOT NULL,
  crop VARCHAR(50) NOT NULL,
  crop_stage VARCHAR(50) NOT NULL,
  applicability VARCHAR(50) NOT NULL DEFAULT 'APPLICABLE',
  deltas JSONB NOT NULL DEFAULT '[]',
  envelope JSONB DEFAULT NULL,
  explanation JSONB NOT NULL DEFAULT '{}',
  provenance JSONB NOT NULL DEFAULT '{}',
  scientific_disclaimer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenario_comp_id ON scenario_comparisons(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_comp_type ON scenario_comparisons(scenario_type);
CREATE INDEX IF NOT EXISTS idx_scenario_comp_created ON scenario_comparisons(created_at DESC);

-- 3. Scenario Sensitivities Table
CREATE TABLE IF NOT EXISTS scenario_sensitivities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id VARCHAR(100) NOT NULL,
  scenario_type VARCHAR(64) NOT NULL,
  parameter_name VARCHAR(64) NOT NULL,
  parameter_range JSONB NOT NULL,
  curve_points JSONB NOT NULL DEFAULT '[]',
  envelope JSONB NOT NULL DEFAULT '{}',
  scientific_notes JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenario_sens_id ON scenario_sensitivities(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_sens_type ON scenario_sensitivities(scenario_type);
CREATE INDEX IF NOT EXISTS idx_scenario_sens_created ON scenario_sensitivities(created_at DESC);
