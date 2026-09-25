-- Migration 005: Data Sources Foundation
-- Prepares ingestion infrastructure metadata for external meteorological and climate sources

CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  base_url VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'INACTIVE',
  provenance_url VARCHAR(500),
  update_frequency VARCHAR(50) DEFAULT 'DAILY',
  last_successful_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_sources_provider ON data_sources(provider);
CREATE INDEX IF NOT EXISTS idx_data_sources_status ON data_sources(status);

CREATE TRIGGER trg_data_sources_updated_at BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION update_timestamp();
