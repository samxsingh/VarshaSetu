-- Migration 011: Multilingual Agronomic Advisory Delivery & Voice Accessibility
-- Purpose: Schema foundation for multilingual advisory delivery (EN/HI),
-- deterministic translation caching, read receipts/acknowledgements, and voice synthesis telemetry (Phase 5C).

-- 1. Localized Advisories Table
CREATE TABLE IF NOT EXISTS localized_advisories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisory_id VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL CHECK (language IN ('EN', 'HI')),
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  risk_indicator TEXT NOT NULL,
  what_it_means TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}',
  confidence_statement TEXT NOT NULL,
  disclosure TEXT NOT NULL,
  historical_limitation_disclosure TEXT NOT NULL,
  classification VARCHAR(50) NOT NULL DEFAULT 'DIAGNOSTIC_ONLY',
  translation_method VARCHAR(50) NOT NULL DEFAULT 'CONTROLLED_TEMPLATE',
  template_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  terminology_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  localization_fingerprint VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_localized_advisory_lang UNIQUE (advisory_id, language)
);

CREATE INDEX IF NOT EXISTS idx_loc_adv_advisory_id ON localized_advisories(advisory_id);
CREATE INDEX IF NOT EXISTS idx_loc_adv_language ON localized_advisories(language);
CREATE INDEX IF NOT EXISTS idx_loc_adv_fingerprint ON localized_advisories(localization_fingerprint);
CREATE INDEX IF NOT EXISTS idx_loc_adv_created_at ON localized_advisories(created_at DESC);

-- 2. Advisory Read Receipts / Acknowledgements
CREATE TABLE IF NOT EXISTS advisory_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisory_id VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'EN',
  device_channel VARCHAR(50) NOT NULL DEFAULT 'WEB_PORTAL',
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adv_reads_advisory_id ON advisory_reads(advisory_id);
CREATE INDEX IF NOT EXISTS idx_adv_reads_user_id ON advisory_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_adv_reads_read_at ON advisory_reads(read_at DESC);

-- 3. Voice Synthesis Request Logs
CREATE TABLE IF NOT EXISTS voice_synthesis_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisory_id VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  duration_seconds NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_logs_advisory_id ON voice_synthesis_logs(advisory_id);
CREATE INDEX IF NOT EXISTS idx_voice_logs_requested_at ON voice_synthesis_logs(requested_at DESC);
