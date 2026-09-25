-- Migration 004: Geographic Boundaries
-- Stores spatial boundary MultiPolygons with explicit provenance and demo indicators

CREATE TABLE IF NOT EXISTS geographic_boundaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL,
  level VARCHAR(32) NOT NULL CHECK (level IN ('COUNTRY', 'STATE', 'DISTRICT', 'BLOCK', 'PANCHAYAT', 'VILLAGE')),
  geometry geometry NOT NULL,
  geometry_type VARCHAR(32) NOT NULL DEFAULT 'MultiPolygon',
  source VARCHAR(255) NOT NULL,
  source_version VARCHAR(100),
  is_demo BOOLEAN NOT NULL DEFAULT true,
  area_sq_km DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boundaries_entity ON geographic_boundaries (entity_id, level);

-- Conditionally create GiST or GIN spatial index depending on geometry underlying type
DO $$
BEGIN
  BEGIN
    CREATE INDEX idx_boundaries_gist ON geographic_boundaries USING GIST (geometry);
    RAISE NOTICE 'Created GiST spatial index on geographic_boundaries.';
  EXCEPTION WHEN OTHERS THEN
    CREATE INDEX idx_boundaries_gin ON geographic_boundaries USING GIN (geometry);
    RAISE NOTICE 'Created GIN index for JSONB spatial compatibility.';
  END;
END $$;

CREATE TRIGGER trg_boundaries_updated_at BEFORE UPDATE ON geographic_boundaries FOR EACH ROW EXECUTE FUNCTION update_timestamp();
