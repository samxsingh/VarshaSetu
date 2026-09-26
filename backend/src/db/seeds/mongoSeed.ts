import bcrypt from 'bcryptjs';
import { connectDatabase, closeDatabase } from '../../config/database';
import {
  User,
  Geography,
  Station,
  Telemetry,
  Forecast,
  ForecastRun,
  Event,
  Advisory,
  Crop,
  ScientificModel,
  Provenance,
  DataHealth,
  Localization,
  AuditLog,
} from '../../models';

const BCRYPT_SALT_ROUNDS = 10;

export async function runMongoSeed(options: { uri?: string; dbName?: string } = {}): Promise<void> {
  console.info('🌱 Starting VarshaSetu MongoDB Seed Pipeline...');
  console.info('⚠️  NOTE: All seeded scientific records are marked DEMO / SYNTHETIC / DIAGNOSTIC_ONLY.');

  await connectDatabase(options);

  try {
    // 1. Seed Administrative Hierarchy (State -> District -> Block -> Panchayat -> Village)
    const stateDoc = await Geography.findOneAndUpdate(
      { code: 'UP' },
      {
        code: 'UP',
        name: 'Uttar Pradesh',
        level: 'STATE',
        center: { type: 'Point', coordinates: [80.9462, 26.8467] }, // [lon, lat]
        source: 'SURVEY_OF_INDIA_2024',
        isDemo: false,
      },
      { upsert: true, new: true }
    );

    const districtDoc = await Geography.findOneAndUpdate(
      { code: 'UP_LKO' },
      {
        code: 'UP_LKO',
        name: 'Lucknow',
        level: 'DISTRICT',
        parentId: stateDoc._id,
        center: { type: 'Point', coordinates: [80.9462, 26.8467] },
        source: 'SURVEY_OF_INDIA_2024',
        isDemo: false,
      },
      { upsert: true, new: true }
    );

    // MultiPolygon for Bakshi Ka Talab demo boundary
    const bktBoundary = {
      type: 'MultiPolygon' as const,
      coordinates: [
        [
          [
            [80.850, 26.920],
            [80.990, 26.920],
            [81.010, 27.050],
            [80.870, 27.050],
            [80.850, 26.920],
          ],
        ],
      ],
    };

    const bktBlockDoc = await Geography.findOneAndUpdate(
      { code: 'UP_LKO_BKT' },
      {
        code: 'UP_LKO_BKT',
        name: 'Bakshi Ka Talab',
        level: 'BLOCK',
        parentId: districtDoc._id,
        center: { type: 'Point', coordinates: [80.9276, 26.9749] },
        boundary: bktBoundary,
        areaSqKm: 342.5,
        source: 'DEMO / SYNTHETIC PILOT BOUNDARY (NON-AUTHORITATIVE)',
        sourceVersion: 'KHARIF-2024-PILOT-v1',
        isDemo: true,
      },
      { upsert: true, new: true }
    );

    const panchayatDoc = await Geography.findOneAndUpdate(
      { code: 'UP_LKO_BKT_BHA' },
      {
        code: 'UP_LKO_BKT_BHA',
        name: 'Bhaisamau',
        level: 'PANCHAYAT',
        parentId: bktBlockDoc._id,
        center: { type: 'Point', coordinates: [80.9254, 26.9856] },
        source: 'DEMO / PILOT PANCHAYAT',
        isDemo: true,
      },
      { upsert: true, new: true }
    );

    await Geography.findOneAndUpdate(
      { code: 'UP_LKO_BKT_BHA_01' },
      {
        code: 'UP_LKO_BKT_BHA_01',
        name: 'Bhaisamau Kalan',
        level: 'VILLAGE',
        parentId: panchayatDoc._id,
        center: { type: 'Point', coordinates: [80.9254, 26.9856] },
        source: 'DEMO / PILOT VILLAGE',
        isDemo: true,
      },
      { upsert: true, new: true }
    );
    console.info('  ✓ Administrative hierarchy and GeoJSON boundaries seeded.');

    // 2. Seed AWS Meteorological Stations
    const stationsData = [
      {
        stationCode: 'LKO_AMAUSI',
        name: 'Lucknow AMAUSI Airport IMD Observatory',
        provider: 'IMD_AWS' as const,
        location: { type: 'Point' as const, coordinates: [80.8833, 26.7606] },
        elevationMeters: 123,
        status: 'ACTIVE' as const,
        blockId: districtDoc._id,
        isDemo: true,
        sensors: [
          { variable: 'RAINFALL', unit: 'mm', isHealthy: true },
          { variable: 'TEMPERATURE', unit: 'C', isHealthy: true },
          { variable: 'HUMIDITY', unit: '%', isHealthy: true },
        ],
      },
      {
        stationCode: 'LKO_BKT_AWS',
        name: 'Bakshi Ka Talab Agromet Mesonet Station',
        provider: 'RESEARCH_MESONET' as const,
        location: { type: 'Point' as const, coordinates: [80.9276, 26.9749] },
        elevationMeters: 128,
        status: 'ACTIVE' as const,
        blockId: bktBlockDoc._id,
        isDemo: true,
        sensors: [
          { variable: 'RAINFALL', unit: 'mm', isHealthy: true },
          { variable: 'SOIL_MOISTURE', unit: '%', isHealthy: true },
        ],
      },
    ];

    for (const s of stationsData) {
      await Station.findOneAndUpdate({ stationCode: s.stationCode }, s, { upsert: true });
    }
    console.info('  ✓ Meteorological AWS stations seeded.');

    // 3. Seed Users for All 5 Operational Roles
    const demoUsers = [
      {
        fullName: 'Ramesh Kumar (Farmer Lead)',
        phone: '+919876543210',
        email: 'ramesh.farmer@example.com',
        role: 'FARMER' as const,
        passwordPlain: 'FarmerPassword123!',
        preferredLang: 'hi',
        assignedLocationId: panchayatDoc._id,
        permissions: [
          'farmer:profile:read',
          'farmer:profile:write',
          'farmer:advisory:read',
          'farmer:simulator:execute',
        ],
      },
      {
        fullName: 'Dr. Arvind Sharma (DAO Lucknow)',
        phone: '+919876543211',
        email: 'officer.lucknow@varshasetu.gov.in',
        role: 'OFFICER' as const,
        passwordPlain: 'OfficerPassword123!',
        preferredLang: 'en',
        assignedLocationId: districtDoc._id,
        permissions: [
          'officer:district:read',
          'officer:panchayat:read',
          'officer:bulletin:broadcast',
          'officer:risk_map:read',
        ],
      },
      {
        fullName: 'Sunita Verma (Joint Director Met UP)',
        phone: '+919876543212',
        email: 'planner.up@varshasetu.gov.in',
        role: 'GOVERNMENT' as const,
        passwordPlain: 'GovPassword123!',
        preferredLang: 'hi',
        assignedLocationId: stateDoc._id,
        permissions: [
          'gov:spatial_indicators:read',
          'gov:forecast_provenance:read',
          'gov:validation_reports:read',
        ],
      },
      {
        fullName: 'Vikram Patel (Climate Data Scientist)',
        phone: '+919876543213',
        email: 'analyst.climate@varshasetu.gov.in',
        role: 'ANALYST' as const,
        passwordPlain: 'AnalystPassword123!',
        preferredLang: 'en',
        permissions: [
          'analyst:models:read',
          'analyst:features:read',
          'analyst:hindcasting:execute',
          'analyst:validation:write',
        ],
      },
      {
        fullName: 'VarshaSetu System Administrator',
        phone: '+919876543214',
        email: 'admin@varshasetu.gov.in',
        role: 'ADMIN' as const,
        passwordPlain: 'AdminPassword123!',
        preferredLang: 'en',
        permissions: [
          'admin:users:manage',
          'admin:datasources:manage',
          'admin:system_health:read',
          'admin:audit_logs:read',
          'admin:config:write',
        ],
      },
    ];

    for (const u of demoUsers) {
      const passwordHash = await bcrypt.hash(u.passwordPlain, BCRYPT_SALT_ROUNDS);
      await User.findOneAndUpdate(
        { email: u.email },
        {
          fullName: u.fullName,
          phoneNumber: u.phone,
          email: u.email,
          role: u.role,
          passwordHash,
          preferredLanguage: u.preferredLang,
          assignedLocationId: u.assignedLocationId || null,
          permissions: u.permissions,
          isActive: true,
        },
        { upsert: true }
      );
    }
    console.info('  ✓ 5 RBAC persona accounts seeded with bcrypt hashes.');

    // 4. Seed Crops (Paddy, Maize, Mustard, Wheat, Potato)
    const cropsData = [
      {
        cropId: 'PADDY',
        name: 'Paddy (Rice)',
        hindiName: 'धान (चावल)',
        season: 'KHARIF' as const,
        stages: [
          {
            stageId: 'NURSERY',
            stageName: 'Nursery / Seedbed',
            hindiStageName: 'नर्सरी / बीजबेड',
            durationDays: 25,
            waterRequirementMm: 200,
            sensitivityToWaterlogging: 'LOW' as const,
            sensitivityToDrought: 'HIGH' as const,
          },
          {
            stageId: 'TRANSPLANTING',
            stageName: 'Transplanting',
            hindiStageName: 'रोपाई',
            durationDays: 15,
            waterRequirementMm: 250,
            sensitivityToWaterlogging: 'LOW' as const,
            sensitivityToDrought: 'CRITICAL' as const,
          },
          {
            stageId: 'TILLERING',
            stageName: 'Tillering',
            hindiStageName: 'कल्ले फूटना',
            durationDays: 30,
            waterRequirementMm: 350,
            sensitivityToWaterlogging: 'LOW' as const,
            sensitivityToDrought: 'HIGH' as const,
          },
        ],
        soilSuitability: ['ALLUVIAL', 'CLAY_LOAM'],
        rules: ['RULE_PADDY_DRY_SPELL_IRRIGATION', 'RULE_PADDY_HEAVY_RAIN_SOWING_HALT'],
      },
      {
        cropId: 'MUSTARD',
        name: 'Mustard',
        hindiName: 'सरसों',
        season: 'RABI' as const,
        stages: [
          {
            stageId: 'SOWING',
            stageName: 'Sowing & Germination',
            hindiStageName: 'बुवाई एवं अंकुरण',
            durationDays: 10,
            waterRequirementMm: 50,
            sensitivityToWaterlogging: 'CRITICAL' as const,
            sensitivityToDrought: 'HIGH' as const,
          },
        ],
        soilSuitability: ['LOAMY_SAND', 'ALLUVIAL'],
        rules: ['RULE_MUSTARD_WATERLOGGING_ALERT'],
      },
    ];

    for (const c of cropsData) {
      await Crop.findOneAndUpdate({ cropId: c.cropId }, c, { upsert: true });
    }
    console.info('  ✓ Agronomic crops and phenological growth stages seeded.');

    // 5. Seed Scientific Model & Provenance
    const provDoc = await Provenance.findOneAndUpdate(
      { ledgerId: 'prov_kharif_2024_pilot_001' },
      {
        ledgerId: 'prov_kharif_2024_pilot_001',
        entityType: 'FORECAST',
        entityId: 'fc_heavy_rain_7d_demo',
        sourceProviders: ['IMD_AWS', 'ERA5_REANALYSIS', 'GFS_025', 'INSAT_3DR'],
        reportingStations: ['LKO_AMAUSI', 'LKO_BKT_AWS'],
        spatialResolution: '0.05° x 0.05° (~5.5 km)',
        temporalResolution: 'Daily aggregated 08:30 IST',
        observationTimestamp: new Date('2024-07-15T03:00:00Z'),
        ingestionLatencyMin: 12.4,
        verificationHash: 'SHA-256: 8f4a1c0d5e2b9a7c3f1e6d4b8a2c0e7b2',
        modelArchitecture: 'LightGBM Gradient Boosted Decision Forest + Temporal Attention',
        calibrationMethod: 'Isotonic Regression (Calibrated against 10-Year IMD Ground Truth)',
        ece: 0.038,
        brierSkillScore: 0.241,
        sampleSize: 14620,
        verificationPeriod: '2014-2024 Historical Archive',
        nonCausalDisclaimer:
          'Diagnostic correlations indicate statistical association, not confirmed physical causality. Feature contribution weights represent local SHAP attributions within the ML model and must not be interpreted as physical atmospheric cause-and-effect.',
      },
      { upsert: true, new: true }
    );

    // 6. Seed Calibrated Forecast
    await Forecast.findOneAndUpdate(
      { forecastId: 'fc_heavy_rain_7d_demo' },
      {
        forecastId: 'fc_heavy_rain_7d_demo',
        locationId: bktBlockDoc._id,
        blockCode: 'UP_LKO_BKT',
        targetType: 'HEAVY_RAIN',
        targetUnit: 'mm',
        threshold: 64.5,
        horizonDays: 7,
        validFrom: new Date('2024-07-15T00:00:00Z'),
        validUntil: new Date('2024-07-22T00:00:00Z'),
        probability: 0.68,
        confidenceTier: 'HIGH',
        uncertainty: { p10: 42.0, p50: 78.5, p90: 115.0 },
        climatology: { normalValue: 52.4, deviationPct: 30.7, baselineYears: '2014-2024' },
        operationalStatus: 'DIAGNOSTIC_ONLY',
        dataFreshness: 'ARCHIVED',
        validationStatus: 'VALIDATED',
        provenanceId: provDoc._id,
        scientificDisclaimer:
          'Diagnostic probabilistic indicators indicate statistical likelihood, not guaranteed meteorological certainty. Ground operational decisions according to verified IMD protocols.',
      },
      { upsert: true }
    );
    console.info('  ✓ Calibrated probabilistic forecast and provenance ledger seeded.');

    // 7. Seed Data Sources (DataHealth)
    const sourcesData = [
      {
        sourceId: 'src_imd_gridded',
        provider: 'IMD',
        name: 'IMD High-Resolution Daily Gridded Rainfall (0.25°)',
        type: 'GRIDDED_OBSERVATION',
        status: 'ACTIVE' as const,
        updateFrequency: 'DAILY' as const,
        latestQualityScore: 0.98,
      },
      {
        sourceId: 'src_ecmwf_era5',
        provider: 'ECMWF_ERA5',
        name: 'ECMWF ERA5-Land Agrometeorological Reanalysis',
        type: 'REANALYSIS_AGROMET',
        status: 'ACTIVE' as const,
        updateFrequency: 'DAILY' as const,
        latestQualityScore: 0.95,
      },
    ];

    for (const src of sourcesData) {
      await DataHealth.findOneAndUpdate({ sourceId: src.sourceId }, src, { upsert: true });
    }
    console.info('  ✓ DataHealth catalog sources seeded.');

    console.info('🎉 VarshaSetu MongoDB Seed completed successfully!');
  } catch (err: any) {
    console.error('❌ Error executing MongoDB seeds:', err.message);
    throw err;
  }
}

// Allow direct CLI execution: tsx src/db/seeds/mongoSeed.ts
if (require.main === module) {
  runMongoSeed()
    .then(async () => {
      await closeDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal error during seed CLI run:', err);
      await closeDatabase();
      process.exit(1);
    });
}
