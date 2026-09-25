import { pool, getClient } from '../pool';
import { hashPassword } from '../../utils/password';
import { env } from '../../config/env';

export async function runSeeds(): Promise<void> {
  const client = await getClient();

  try {
    console.log('🌱 Beginning demonstration seed process...');
    await client.query('BEGIN');

    // 1. Seed State: Uttar Pradesh
    const stateRes = await client.query(`
      INSERT INTO states (name, code, center_lat, center_lon, bbox)
      VALUES (
        'Uttar Pradesh',
        'UP',
        26.8467,
        80.9462,
        '{"minLatitude": 23.86, "minLongitude": 77.08, "maxLatitude": 30.40, "maxLongitude": 84.63}'::jsonb
      )
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const stateId = stateRes.rows[0].id;
    console.log(`  ✓ State seeded: Uttar Pradesh (${stateId})`);

    // 2. Seed District: Lucknow
    const districtRes = await client.query(`
      INSERT INTO districts (state_id, name, code, center_lat, center_lon, bbox)
      VALUES (
        $1,
        'Lucknow',
        'UP_LKO',
        26.8467,
        80.9462,
        '{"minLatitude": 26.50, "minLongitude": 80.50, "maxLatitude": 27.20, "maxLongitude": 81.30}'::jsonb
      )
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `, [stateId]);
    const districtId = districtRes.rows[0].id;
    console.log(`  ✓ District seeded: Lucknow (${districtId})`);

    // 3. Seed 5 Demonstration Blocks
    const blocksData = [
      { name: 'Bakshi Ka Talab', code: 'UP_LKO_BKT', lat: 26.9749, lon: 80.9276 },
      { name: 'Malihabad', code: 'UP_LKO_MAL', lat: 26.9214, lon: 80.7126 },
      { name: 'Mohanlalganj', code: 'UP_LKO_MOH', lat: 26.6749, lon: 80.9982 },
      { name: 'Sarojininagar', code: 'UP_LKO_SAR', lat: 26.7490, lon: 80.8654 },
      { name: 'Gosainganj', code: 'UP_LKO_GOS', lat: 26.7725, lon: 81.1219 },
    ];

    const blockIds: Record<string, string> = {};

    for (const b of blocksData) {
      const bRes = await client.query(`
        INSERT INTO blocks (district_id, name, code, center_lat, center_lon, bbox)
        VALUES ($1, $2, $3, $4, $5, '{"minLatitude": 26.6, "minLongitude": 80.7, "maxLatitude": 27.1, "maxLongitude": 81.1}'::jsonb)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `, [districtId, b.name, b.code, b.lat, b.lon]);
      blockIds[b.code] = bRes.rows[0].id;
    }
    console.log(`  ✓ 5 Blocks seeded for Lucknow District.`);

    const bktId = blockIds['UP_LKO_BKT'];

    // 4. Seed Gram Panchayats in Bakshi Ka Talab
    const panchayatsData = [
      { name: 'Bhaisamau', code: 'UP_LKO_BKT_BHA', lat: 26.9856, lon: 80.9254 },
      { name: 'Rampur', code: 'UP_LKO_BKT_RAM', lat: 26.9620, lon: 80.9110 },
      { name: 'Mampur', code: 'UP_LKO_BKT_MAM', lat: 26.9890, lon: 80.9420 },
      { name: 'Kamalpur', code: 'UP_LKO_BKT_KAM', lat: 26.9710, lon: 80.9380 },
    ];

    const panchayatIds: Record<string, string> = {};
    for (const p of panchayatsData) {
      const pRes = await client.query(`
        INSERT INTO gram_panchayats (block_id, name, code, center_lat, center_lon)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `, [bktId, p.name, p.code, p.lat, p.lon]);
      panchayatIds[p.code] = pRes.rows[0].id;
    }
    console.log(`  ✓ 4 Gram Panchayats seeded for Bakshi Ka Talab block.`);

    const bhaisamauId = panchayatIds['UP_LKO_BKT_BHA'];

    // 5. Seed Demonstration Villages in Bhaisamau Panchayat
    const villagesData = [
      { name: 'Bhaisamau Kalan', code: 'UP_LKO_BKT_BHA_01', lat: 26.9856, lon: 80.9254 },
      { name: 'Bhaisamau Khurd', code: 'UP_LKO_BKT_BHA_02', lat: 26.9810, lon: 80.9300 },
    ];

    for (const v of villagesData) {
      await client.query(`
        INSERT INTO villages (panchayat_id, name, code, center_lat, center_lon)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;
      `, [bhaisamauId, v.name, v.code, v.lat, v.lon]);
    }
    console.log(`  ✓ 2 Villages seeded for Bhaisamau Gram Panchayat.`);

    // 6. Seed Demonstration Boundary Geometry for Bakshi Ka Talab
    // Explicitly labelled as DEMO / SYNTHETIC PILOT BOUNDARY per Section 10 & 46
    const bktDemoPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [80.850, 26.920],
            [80.990, 26.920],
            [81.010, 27.050],
            [80.870, 27.050],
            [80.850, 26.920]
          ]
        ]
      ]
    };

    await client.query(`
      INSERT INTO geographic_boundaries (
        entity_id,
        level,
        geometry,
        geometry_type,
        source,
        source_version,
        is_demo,
        area_sq_km
      )
      VALUES (
        $1,
        'BLOCK',
        $2::jsonb,
        'MultiPolygon',
        'DEMO / SYNTHETIC PILOT BOUNDARY (NON-AUTHORITATIVE)',
        'PHASE-2-PILOT-v1',
        true,
        342.5
      )
      ON CONFLICT DO NOTHING;
    `, [bktId, JSON.stringify(bktDemoPolygon)]);
    console.log(`  ✓ Demonstration boundary seeded for Bakshi Ka Talab (Explicitly non-authoritative).`);

    // 7. Seed Demonstration Users for All 5 Personas
    const demoUsers = [
      {
        fullName: 'Ramesh Kumar',
        phone: '+919876543210',
        email: 'ramesh.farmer@example.com',
        role: 'FARMER',
        passwordPlain: 'FarmerPassword123!',
        preferredLang: 'hi',
        assignedLocationId: bhaisamauId,
        permissions: [
          'farmer:profile:read',
          'farmer:profile:write',
          'farmer:advisory:read',
          'farmer:simulator:execute'
        ],
      },
      {
        fullName: 'Dr. Arvind Sharma (DAO Lucknow)',
        phone: '+919876543211',
        email: 'officer.lucknow@varshasetu.gov.in',
        role: 'OFFICER',
        passwordPlain: 'OfficerPassword123!',
        preferredLang: 'en',
        assignedLocationId: districtId,
        permissions: [
          'officer:district:read',
          'officer:panchayat:read',
          'officer:bulletin:broadcast',
          'officer:risk_map:read'
        ],
      },
      {
        fullName: 'Sunita Verma (Joint Director Met UP)',
        phone: '+919876543212',
        email: 'planner.up@varshasetu.gov.in',
        role: 'GOVERNMENT',
        passwordPlain: 'GovPassword123!',
        preferredLang: 'hi',
        assignedLocationId: stateId,
        permissions: [
          'gov:spatial_indicators:read',
          'gov:forecast_provenance:read',
          'gov:validation_reports:read'
        ],
      },
      {
        fullName: 'Vikram Patel (Climate Data Scientist)',
        phone: '+919876543213',
        email: 'analyst.climate@varshasetu.gov.in',
        role: 'ANALYST',
        passwordPlain: 'AnalystPassword123!',
        preferredLang: 'en',
        permissions: [
          'analyst:models:read',
          'analyst:features:read',
          'analyst:hindcasting:execute',
          'analyst:validation:write'
        ],
      },
      {
        fullName: 'VarshaSetu System Administrator',
        phone: '+919876543214',
        email: 'admin@varshasetu.gov.in',
        role: 'ADMIN',
        passwordPlain: 'AdminPassword123!',
        preferredLang: 'en',
        permissions: [
          'admin:users:manage',
          'admin:datasources:manage',
          'admin:system_health:read',
          'admin:audit_logs:read',
          'admin:config:write'
        ],
      },
    ];

    for (const u of demoUsers) {
      const hashed = await hashPassword(u.passwordPlain);
      await client.query(`
        INSERT INTO users (
          full_name,
          phone_number,
          email,
          role,
          password_hash,
          preferred_language,
          assigned_location_id,
          permissions,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          permissions = EXCLUDED.permissions,
          role = EXCLUDED.role;
      `, [
        u.fullName,
        u.phone,
        u.email,
        u.role,
        hashed,
        u.preferredLang,
        u.assignedLocationId || null,
        u.permissions,
      ]);
    }
    console.log(`  ✓ 5 Demo Persona Users seeded with encrypted credentials.`);

    // 8. Seed Data Source Metadata (Phase 2 Infrastructure Only)
    const dataSources = [
      {
        name: 'NOAA CPC ENSO Niño 3.4 SST Anomaly',
        provider: 'NOAA_CPC',
        type: 'ENSO_SST',
        baseUrl: 'https://www.cpc.ncep.noaa.gov/data/indices/sstoi.indices',
        provenanceUrl: 'https://psl.noaa.gov/data/correlation/nina34.data',
        frequency: 'WEEKLY',
      },
      {
        name: 'BoM Australia Indian Ocean Dipole DMI',
        provider: 'BOM_AUSTRALIA',
        type: 'IOD_DMI',
        baseUrl: 'http://www.bom.gov.au/climate/enso/indices.shtml',
        provenanceUrl: 'http://www.bom.gov.au/climate/iod/',
        frequency: 'WEEKLY',
      },
      {
        name: 'IMD High-Resolution Daily Gridded Rainfall (0.25°)',
        provider: 'IMD',
        type: 'GRIDDED_OBSERVATION',
        baseUrl: 'https://www.imdpune.gov.in/Clim_Pred_LRF_New/Grided_Data_Download.html',
        provenanceUrl: 'https://imdpune.gov.in',
        frequency: 'DAILY',
      },
      {
        name: 'ECMWF ERA5-Land Agrometeorological Reanalysis',
        provider: 'ECMWF_ERA5',
        type: 'REANALYSIS_AGROMET',
        baseUrl: 'https://cds.climate.copernicus.eu',
        provenanceUrl: 'https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land',
        frequency: 'DAILY',
      },
    ];

    for (const ds of dataSources) {
      await client.query(`
        INSERT INTO data_sources (name, provider, type, base_url, provenance_url, update_frequency, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'INACTIVE')
        ON CONFLICT DO NOTHING;
      `, [ds.name, ds.provider, ds.type, ds.baseUrl, ds.provenanceUrl, ds.frequency]);
    }
    console.log(`  ✓ Ingestion infrastructure data sources registered.`);

    await client.query('COMMIT');
    console.log('🎉 Demonstration seeds completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error executing demonstration seeds:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Allow direct CLI execution: tsx src/db/seeds/demo_seed.ts
if (require.main === module) {
  runSeeds()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal error running seeds:', err);
      await pool.end();
      process.exit(1);
    });
}
