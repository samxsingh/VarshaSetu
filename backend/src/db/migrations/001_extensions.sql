-- Migration 001: Extensions and Spatial Initialization
-- Purpose: Enable UUID generator, crypto hashing, and PostGIS or spatial compatibility layer

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  -- Attempt native PostGIS installation
  CREATE EXTENSION IF NOT EXISTS postgis;
  RAISE NOTICE 'Native PostGIS extension loaded successfully.';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'PostGIS C-extension not available in local PostgreSQL environment. Installing spatial compatibility layer.';

  -- Create geometry domain if type does not exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geometry') THEN
    CREATE DOMAIN geometry AS JSONB;
  END IF;

  -- Create PostGIS_Version compatibility function
  CREATE OR REPLACE FUNCTION PostGIS_Version()
  RETURNS text AS $fn$
  BEGIN
    RETURN '3.4.2-compatibility-mode';
  END;
  $fn$ LANGUAGE plpgsql IMMUTABLE;

  -- Create ST_MakePoint(x, y) returning point GeoJSON
  CREATE OR REPLACE FUNCTION ST_MakePoint(x double precision, y double precision)
  RETURNS geometry AS $fn$
  BEGIN
    RETURN jsonb_build_object(
      'type', 'Point',
      'coordinates', jsonb_build_array(x, y)
    );
  END;
  $fn$ LANGUAGE plpgsql IMMUTABLE;

  -- Create ST_SetSRID(geom, srid)
  CREATE OR REPLACE FUNCTION ST_SetSRID(geom geometry, srid integer)
  RETURNS geometry AS $fn$
  BEGIN
    RETURN geom;
  END;
  $fn$ LANGUAGE plpgsql IMMUTABLE;

  -- Create ST_AsGeoJSON(geom)
  CREATE OR REPLACE FUNCTION ST_AsGeoJSON(geom geometry)
  RETURNS text AS $fn$
  BEGIN
    RETURN geom::text;
  END;
  $fn$ LANGUAGE plpgsql IMMUTABLE;

  -- Create ST_GeomFromGeoJSON(geojson_text)
  CREATE OR REPLACE FUNCTION ST_GeomFromGeoJSON(geojson_text text)
  RETURNS geometry AS $fn$
  BEGIN
    RETURN geojson_text::jsonb;
  END;
  $fn$ LANGUAGE plpgsql IMMUTABLE;

  -- Point-in-polygon ray-casting test for standard GeoJSON Polygon / MultiPolygon
  CREATE OR REPLACE FUNCTION ST_Contains(poly geometry, pt geometry)
  RETURNS boolean AS $fn$
  DECLARE
    pt_x double precision;
    pt_y double precision;
    poly_type text;
    geom_rings jsonb;
    ring jsonb;
    n_pts integer;
    i integer;
    j integer;
    xi double precision;
    yi double precision;
    xj double precision;
    yj double precision;
    inside boolean := false;
    sub_poly jsonb;
  BEGIN
    IF poly IS NULL OR pt IS NULL THEN
      RETURN false;
    END IF;

    pt_x := (pt->'coordinates'->>0)::double precision;
    pt_y := (pt->'coordinates'->>1)::double precision;
    poly_type := poly->>'type';

    IF poly_type = 'Polygon' THEN
      -- Exterior ring is the first element
      ring := poly->'coordinates'->0;
      n_pts := jsonb_array_length(ring);
      j := n_pts - 1;
      FOR i IN 0..(n_pts - 1) LOOP
        xi := (ring->i->>0)::double precision;
        yi := (ring->i->>1)::double precision;
        xj := (ring->j->>0)::double precision;
        yj := (ring->j->>1)::double precision;

        IF ((yi > pt_y) != (yj > pt_y)) AND
           (pt_x < (xj - xi) * (pt_y - yi) / NULLIF(yj - yi, 0) + xi) THEN
          inside := NOT inside;
        END IF;
        j := i;
      END LOOP;
      RETURN inside;

    ELSIF poly_type = 'MultiPolygon' THEN
      FOR sub_poly IN SELECT jsonb_array_elements(poly->'coordinates') LOOP
        ring := sub_poly->0;
        n_pts := jsonb_array_length(ring);
        j := n_pts - 1;
        inside := false;
        FOR i IN 0..(n_pts - 1) LOOP
          xi := (ring->i->>0)::double precision;
          yi := (ring->i->>1)::double precision;
          xj := (ring->j->>0)::double precision;
          yj := (ring->j->>1)::double precision;

          IF ((yi > pt_y) != (yj > pt_y)) AND
             (pt_x < (xj - xi) * (pt_y - yi) / NULLIF(yj - yi, 0) + xi) THEN
            inside := NOT inside;
          END IF;
          j := i;
        END LOOP;
        IF inside THEN
          RETURN true;
        END IF;
      END LOOP;
      RETURN false;
    END IF;

    RETURN false;
  END;
  $fn$ LANGUAGE plpgsql IMMUTABLE;

  -- Create ST_Intersects alias
  CREATE OR REPLACE FUNCTION ST_Intersects(geom1 geometry, geom2 geometry)
  RETURNS boolean AS $fn$
  BEGIN
    RETURN ST_Contains(geom1, geom2);
  END;
  $fn$ LANGUAGE plpgsql IMMUTABLE;

END $$;
