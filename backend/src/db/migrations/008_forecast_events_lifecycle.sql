-- Migration 008: Forecast Lifecycle, Alert Events, Notification Deliveries & Preferences
-- Purpose: Support deterministic forecast lifecycle tracking, scientific event intelligence,
-- alert deduplication audit trails, and provider-neutral notification preference configurations.

-- 1. Forecast Lifecycle Events (Audit log of forecast state transitions)
CREATE TABLE IF NOT EXISTS forecast_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transition_id VARCHAR(100) NOT NULL UNIQUE,
  forecast_id VARCHAR(255) NOT NULL,
  previous_status VARCHAR(50) NOT NULL,
  new_status VARCHAR(50) NOT NULL,
  actor VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
  reason TEXT NOT NULL,
  model_version VARCHAR(50) DEFAULT '1.0.0',
  dataset_fingerprint VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_forecast_id ON forecast_lifecycle_events(forecast_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_new_status ON forecast_lifecycle_events(new_status);
CREATE INDEX IF NOT EXISTS idx_lifecycle_created_at ON forecast_lifecycle_events(created_at DESC);

-- 2. Forecast Scientific Alert Events
CREATE TABLE IF NOT EXISTS forecast_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(100) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  forecast_id VARCHAR(255) NOT NULL,
  block_id VARCHAR(100) NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  probability DOUBLE PRECISION NOT NULL,
  threshold DOUBLE PRECISION NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'mm',
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('INFO', 'WATCH', 'WARNING', 'CRITICAL')),
  confidence_status VARCHAR(100) NOT NULL,
  operational_status VARCHAR(100) NOT NULL DEFAULT 'DIAGNOSTIC_ONLY',
  data_freshness VARCHAR(50) NOT NULL DEFAULT 'HISTORICAL_ONLY',
  validation_status VARCHAR(100) NOT NULL DEFAULT 'INSUFFICIENT_DATA',
  explanation_reference VARCHAR(255),
  state VARCHAR(50) NOT NULL DEFAULT 'DETECTED' CHECK (state IN ('DETECTED', 'ACKNOWLEDGED', 'UPDATED', 'RESOLVED', 'EXPIRED', 'SUPPRESSED')),
  description TEXT NOT NULL,
  deduplication_hash VARCHAR(64) NOT NULL,
  acknowledged_by VARCHAR(100),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by VARCHAR(100),
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_forecast_id ON forecast_events(forecast_id);
CREATE INDEX IF NOT EXISTS idx_events_block_id ON forecast_events(block_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON forecast_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_state ON forecast_events(state);
CREATE INDEX IF NOT EXISTS idx_events_severity ON forecast_events(severity);
CREATE INDEX IF NOT EXISTS idx_events_valid_from ON forecast_events(valid_from);
CREATE INDEX IF NOT EXISTS idx_events_valid_until ON forecast_events(valid_until);
CREATE INDEX IF NOT EXISTS idx_events_dedup_hash ON forecast_events(deduplication_hash);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON forecast_events(created_at DESC);

-- 3. Forecast Event State Transitions Audit Trail
CREATE TABLE IF NOT EXISTS forecast_event_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transition_id VARCHAR(100) NOT NULL UNIQUE,
  event_id VARCHAR(100) NOT NULL REFERENCES forecast_events(event_id) ON DELETE CASCADE,
  previous_state VARCHAR(50) NOT NULL,
  new_state VARCHAR(50) NOT NULL,
  actor VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_transitions_event_id ON forecast_event_transitions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_transitions_created_at ON forecast_event_transitions(created_at DESC);

-- 4. Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
  event_types TEXT[] NOT NULL DEFAULT ARRAY['HEAVY_RAIN_RISK', 'DRY_SPELL_RISK', 'MONSOON_ONSET_RISK', 'FALSE_ONSET_RISK', 'RAINFALL_ANOMALY'],
  minimum_severity VARCHAR(50) NOT NULL DEFAULT 'WATCH' CHECK (minimum_severity IN ('INFO', 'WATCH', 'WARNING', 'CRITICAL')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start VARCHAR(10),
  quiet_hours_end VARCHAR(10),
  channels TEXT[] NOT NULL DEFAULT ARRAY['IN_APP'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_notification_preferences_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_notif_pref_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_pref_role ON notification_preferences(role);

-- 5. Notification Deliveries Simulation Log
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id VARCHAR(100) NOT NULL UNIQUE,
  message_id VARCHAR(100) NOT NULL,
  event_id VARCHAR(100) REFERENCES forecast_events(event_id) ON DELETE SET NULL,
  recipient_id VARCHAR(100) NOT NULL,
  channel VARCHAR(50) NOT NULL CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'VOICE', 'LOG')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('SIMULATED', 'DELIVERED', 'NOT_CONFIGURED', 'FAILED', 'SUPPRESSED')),
  provider_name VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_deliveries_event_id ON notification_deliveries(event_id);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_recipient ON notification_deliveries(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_channel ON notification_deliveries(channel);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_status ON notification_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_created_at ON notification_deliveries(created_at DESC);
