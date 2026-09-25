-- Migration 007: Data Ingestion Runs and Quality Reports
-- Purpose: Track real-time and historical climate/weather ingestion pipelines and data validation quality audits

CREATE TABLE IF NOT EXISTS data_ingestion_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
  source_name VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  dataset_name VARCHAR(255) NOT NULL,
  variable VARCHAR(100) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED')),
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  quality_summary JSONB DEFAULT '{}',
  processing_version VARCHAR(50) DEFAULT '1.0.0',
  error_message TEXT,
  file_path VARCHAR(500),
  coverage_start DATE,
  coverage_end DATE,
  spatial_resolution VARCHAR(100),
  temporal_resolution VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_quality_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES data_ingestion_runs(id) ON DELETE CASCADE,
  dataset_name VARCHAR(255) NOT NULL,
  total_records INTEGER NOT NULL,
  valid_records INTEGER NOT NULL,
  missing_records INTEGER NOT NULL,
  outlier_records INTEGER NOT NULL,
  quality_score DOUBLE PRECISION NOT NULL, -- 0.0 to 1.0
  quality_flag VARCHAR(20) NOT NULL DEFAULT 'GOOD' CHECK (quality_flag IN ('GOOD', 'WARNING', 'BAD', 'MISSING', 'IMPUTED')),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_status ON data_ingestion_runs(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_provider ON data_ingestion_runs(provider);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_created_at ON data_ingestion_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quality_reports_run_id ON data_quality_reports(run_id);
