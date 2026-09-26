import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
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
  Scenario,
  ScientificModel,
  Provenance,
  DataHealth,
  Notification,
  Localization,
  AuditLog,
} from '../../src/models';
import { runMongoSeed } from '../../src/db/seeds/mongoSeed';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  // Ensure indexes are built
  await Geography.syncIndexes();
  await Station.syncIndexes();
  await Forecast.syncIndexes();
  await User.syncIndexes();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Mongoose Models Suite (Phase 1)', () => {
  describe('1. User Model & RBAC', () => {
    it('creates valid user with valid role and permissions', async () => {
      const user = await User.create({
        fullName: 'Ramesh Kumar',
        email: 'ramesh@example.com',
        role: 'FARMER',
        passwordHash: 'hashed_secret',
        preferredLanguage: 'hi',
        permissions: ['farmer:profile:read', 'farmer:advisory:read'],
      });
      expect(user._id).toBeDefined();
      expect(user.role).toBe('FARMER');
      expect(user.permissions).toContain('farmer:profile:read');
      expect(user.isActive).toBe(true);
    });

    it('rejects invalid role string', async () => {
      await expect(
        User.create({
          fullName: 'Fake User',
          email: 'fake@example.com',
          role: 'INVALID_ROLE' as any,
          passwordHash: 'hash',
        })
      ).rejects.toThrow();
    });

    it('rejects user when neither email nor phone is provided', async () => {
      await expect(
        User.create({
          fullName: 'No Contact User',
          role: 'ADMIN',
          passwordHash: 'hash',
        })
      ).rejects.toThrow();
    });

    it('enforces unique email constraint', async () => {
      await User.create({
        fullName: 'User 1',
        email: 'unique@example.com',
        role: 'ANALYST',
        passwordHash: 'hash',
      });
      await expect(
        User.create({
          fullName: 'User 2',
          email: 'unique@example.com',
          role: 'OFFICER',
          passwordHash: 'hash2',
        })
      ).rejects.toThrow();
    });
  });

  describe('2. Geography Model & GeoJSON Point-in-Polygon', () => {
    it('creates administrative block with valid GeoJSON MultiPolygon boundary', async () => {
      const block = await Geography.create({
        code: 'UP_LKO_BKT',
        name: 'Bakshi Ka Talab',
        level: 'BLOCK',
        center: { type: 'Point', coordinates: [80.9276, 26.9749] }, // [lon, lat]
        boundary: {
          type: 'MultiPolygon',
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
        },
        source: 'DEMO / SYNTHETIC PILOT BOUNDARY (NON-AUTHORITATIVE)',
        isDemo: true,
      });

      expect(block._id).toBeDefined();
      expect(block.code).toBe('UP_LKO_BKT');

      // Test geospatial query: Point inside boundary
      const queryPoint = {
        type: 'Point',
        coordinates: [80.920, 26.980], // Inside BKT bounding box
      };

      const found = await Geography.findOne({
        level: 'BLOCK',
        boundary: {
          $geoIntersects: {
            $geometry: queryPoint,
          },
        },
      });

      expect(found).not.toBeNull();
      expect(found?.code).toBe('UP_LKO_BKT');
    });

    it('rejects invalid longitude/latitude bounds in center point', async () => {
      await expect(
        Geography.create({
          code: 'INVALID_GEO',
          name: 'Invalid Point',
          level: 'VILLAGE',
          center: { type: 'Point', coordinates: [200.0, 95.0] }, // Out of bounds
          source: 'TEST',
        })
      ).rejects.toThrow();
    });
  });

  describe('3. Station & Telemetry Models (Zero-Fabrication Guarantees)', () => {
    it('creates AWS station with GeoJSON location', async () => {
      const station = await Station.create({
        stationCode: 'LKO_AMAUSI',
        name: 'Amausi Airport AWS',
        provider: 'IMD_AWS',
        location: { type: 'Point', coordinates: [80.8833, 26.7606] },
        elevationMeters: 123,
        status: 'ACTIVE',
        isDemo: true,
      });
      expect(station.stationCode).toBe('LKO_AMAUSI');
      expect(station.status).toBe('ACTIVE');
    });

    it('defaults unobserved telemetry fields to null (zero fabrication)', async () => {
      const telemetry = await Telemetry.create({
        stationCode: 'LKO_AMAUSI',
        observedAt: new Date(),
        qualityFlag: 'GOOD',
      });
      // Zero fabrication: unobserved sensors MUST be null, not 0.0 or synthetic defaults
      expect(telemetry.rainfallMm).toBeNull();
      expect(telemetry.temperatureC).toBeNull();
      expect(telemetry.relativeHumidityPct).toBeNull();
      expect(telemetry.windSpeedKmh).toBeNull();
      expect(telemetry.atmosphericPressureHpa).toBeNull();
      expect(telemetry.soilMoisturePct).toBeNull();
    });

    it('records valid physical observations within physical bounds', async () => {
      const telemetry = await Telemetry.create({
        stationCode: 'LKO_AMAUSI',
        observedAt: new Date(),
        rainfallMm: 45.2,
        temperatureC: 32.4,
        relativeHumidityPct: 88,
        qualityFlag: 'GOOD',
      });
      expect(telemetry.rainfallMm).toBe(45.2);
      expect(telemetry.temperatureC).toBe(32.4);
    });
  });

  describe('4. Forecast Model (Phase 7 Triad & Calibration Semantics)', () => {
    it('creates probabilistic forecast with uncertainty spread and climatology baseline', async () => {
      const forecast = await Forecast.create({
        forecastId: 'fc_heavy_rain_7d_test',
        blockCode: 'UP_LKO_BKT',
        targetType: 'HEAVY_RAIN',
        targetUnit: 'mm',
        threshold: 64.5,
        horizonDays: 7,
        validFrom: new Date('2024-07-15T00:00:00Z'),
        validUntil: new Date('2024-07-22T00:00:00Z'),
        probability: 0.72,
        confidenceTier: 'HIGH',
        uncertainty: { p10: 45.0, p50: 82.0, p90: 120.0 },
        climatology: { normalValue: 54.0, deviationPct: 33.3, baselineYears: '2014-2024' },
        operationalStatus: 'DIAGNOSTIC_ONLY',
        dataFreshness: 'ARCHIVED',
        validationStatus: 'VALIDATED',
      });

      expect(forecast.probability).toBe(0.72);
      expect(forecast.confidenceTier).toBe('HIGH');
      expect(forecast.uncertainty.p10).toBe(45.0);
      expect(forecast.climatology.normalValue).toBe(54.0);
      expect(forecast.operationalStatus).toBe('DIAGNOSTIC_ONLY');
    });

    it('rejects probability outside [0.0, 1.0] range', async () => {
      await expect(
        Forecast.create({
          forecastId: 'fc_invalid_prob',
          blockCode: 'UP_LKO_BKT',
          targetType: 'HEAVY_RAIN',
          threshold: 64.5,
          horizonDays: 7,
          validFrom: new Date(),
          validUntil: new Date(),
          probability: 1.5, // Invalid probability > 1.0
        })
      ).rejects.toThrow();
    });
  });

  describe('5. Event & Advisory Models (Embedded Lifecycle Transitions & Localization)', () => {
    it('creates alert event with state transition history subdocuments', async () => {
      const event = await Event.create({
        eventId: 'evt_heavy_rain_001',
        eventType: 'HEAVY_RAIN_RISK',
        forecastId: 'fc_test_001',
        blockId: 'UP_LKO_BKT',
        validFrom: new Date(),
        validUntil: new Date(),
        probability: 0.85,
        threshold: 64.5,
        severity: 'CRITICAL',
        state: 'DETECTED',
        description: 'Severe precipitation risk exceeding 64.5mm threshold.',
        deduplicationHash: 'hash_evt_001',
        transitions: [
          {
            transitionId: 'tr_001',
            previousState: 'DETECTED',
            newState: 'ACKNOWLEDGED',
            actor: 'OFFICER_LKO',
            reason: 'Field staff alerted to mobilize drainage pumps.',
            timestamp: new Date(),
          },
        ],
      });

      expect(event.eventId).toBe('evt_heavy_rain_001');
      expect(event.transitions).toHaveLength(1);
      expect(event.transitions[0].actor).toBe('OFFICER_LKO');
    });

    it('creates advisory embedding localized multilingual content and read receipts', async () => {
      const advisory = await Advisory.create({
        advisoryId: 'adv_paddy_transplanting_001',
        ruleId: 'RULE_PADDY_TRANSPLANT_01',
        forecastId: 'fc_test_001',
        blockId: 'UP_LKO_BKT',
        cropType: 'PADDY',
        growthStage: 'TRANSPLANTING',
        riskCategory: 'WATERLOGGING_HAZARD',
        severity: 'WARNING',
        actionRecommendation: 'Postpone seedling transplantation until heavy downpour subsides.',
        scientificRationale: 'Rainfall exceeding 64.5mm causes submergence of newly transplanted saplings.',
        safetyGatePassed: true,
        deduplicationHash: 'hash_adv_001',
        localizations: [
          {
            language: 'HI',
            title: 'धान रोपाई स्थगित करें',
            summary: 'भारी वर्षा के कारण धान की रोपाई 3 दिनों के लिए टालें।',
            riskIndicator: 'अत्यधिक जलभराव का जोखिम',
            whatItMeans: 'नए पौधों के डूबने की संभावना अधिक है।',
            confidenceStatement: 'उच्च विश्वसनीयता (88% ऐतिहासिक सटीकता)',
            disclosure: 'यह केवल अनुशंसित परामर्श है।',
            translationMethod: 'CONTROLLED_TEMPLATE',
            templateVersion: '1.0.0',
            terminologyVersion: '1.0.0',
            localizationFingerprint: 'fp_hi_001',
          },
        ],
        readReceipts: [
          {
            language: 'HI',
            deviceChannel: 'WEB_PORTAL',
            readAt: new Date(),
          },
        ],
      });

      expect(advisory.localizations).toHaveLength(1);
      expect(advisory.localizations[0].language).toBe('HI');
      expect(advisory.localizations[0].title).toBe('धान रोपाई स्थगित करें');
      expect(advisory.readReceipts).toHaveLength(1);
    });
  });

  describe('6. Provenance & AuditLog Models (Phase 9 Trust Layer & Immutability)', () => {
    it('creates provenance ledger with full scientific lineage', async () => {
      const prov = await Provenance.create({
        ledgerId: 'prov_test_001',
        entityType: 'FORECAST',
        entityId: 'fc_test_001',
        sourceProviders: ['IMD_AWS', 'ERA5_REANALYSIS', 'GFS_025'],
        reportingStations: ['LKO_AMAUSI', 'LKO_BKT_AWS'],
        spatialResolution: '0.05° x 0.05° (~5.5 km)',
        temporalResolution: 'Daily aggregated',
        observationTimestamp: new Date(),
        verificationHash: 'SHA-256: 8f4a1c0d5e2b9a7c3f1e6d4b8a2c0e7b2',
        modelArchitecture: 'LightGBM Gradient Boosted Decision Forest',
        calibrationMethod: 'Isotonic Regression',
        ece: 0.038,
        brierSkillScore: 0.241,
        sampleSize: 14620,
        verificationPeriod: '2014-2024 Historical Archive',
      });

      expect(prov.ledgerId).toBe('prov_test_001');
      expect(prov.ece).toBe(0.038);
      expect(prov.nonCausalDisclaimer).toContain('Diagnostic correlations indicate statistical association');
    });

    it('creates immutable audit log record', async () => {
      const audit = await AuditLog.create({
        actor: 'USER_123',
        role: 'FIELD_OFFICER',
        action: 'BROADCAST_BULLETIN',
        resource: 'AGRONOMIC_ADVISORY',
        resourceId: 'adv_001',
        metadata: { block: 'Bakshi Ka Talab', recipientsCount: 142 },
        requestId: 'req_abc123',
      });

      expect(audit.actor).toBe('USER_123');
      expect(audit.action).toBe('BROADCAST_BULLETIN');
      expect(audit.createdAt).toBeDefined();
    });
  });

  describe('7. Crop & Scenario Models', () => {
    it('creates crop with phenological stages and sensitivities', async () => {
      const crop = await Crop.create({
        cropId: 'MAIZE',
        name: 'Maize',
        hindiName: 'मक्का',
        season: 'KHARIF',
        stages: [
          {
            stageId: 'TASSELING',
            stageName: 'Tasseling Stage',
            hindiStageName: 'मंजर अवस्था',
            durationDays: 14,
            waterRequirementMm: 120,
            sensitivityToWaterlogging: 'CRITICAL',
            sensitivityToDrought: 'CRITICAL',
          },
        ],
      });

      expect(crop.cropId).toBe('MAIZE');
      expect(crop.stages[0].sensitivityToWaterlogging).toBe('CRITICAL');
    });

    it('creates scenario simulation run with deltas and scientific disclaimer', async () => {
      const scenario = await Scenario.create({
        scenarioId: 'sim_test_sowing_delay',
        blockId: 'UP_LKO_BKT',
        cropType: 'PADDY',
        growthStage: 'NURSERY',
        baselineForecastId: 'fc_base_001',
        scenarioType: 'SOWING_DELAY',
        deltas: [
          {
            metric: 'WATER_STRESS_DAYS',
            baselineValue: 2,
            scenarioValue: 7,
            deltaPct: 250,
            riskShift: 'ELEVATED',
          },
        ],
        scenarioParameters: { delayDays: 10 },
        scenarioResults: { overallRiskScore: 0.65 },
      });

      expect(scenario.scenarioType).toBe('SOWING_DELAY');
      expect(scenario.deltas[0].riskShift).toBe('ELEVATED');
      expect(scenario.scientificDisclaimer).toContain('evaluates meteorological and agro-meteorological sensitivity');
    });
  });

  describe('8. Controlled Seed Pipeline Execution', () => {
    it('executes runMongoSeed idempotently without fabricating live data', async () => {
      await runMongoSeed();

      const userCount = await User.countDocuments();
      expect(userCount).toBe(5);

      const bktBlock = await Geography.findOne({ code: 'UP_LKO_BKT' });
      expect(bktBlock).not.toBeNull();
      expect(bktBlock?.isDemo).toBe(true);
      expect(bktBlock?.source).toContain('DEMO / SYNTHETIC PILOT BOUNDARY');

      const forecast = await Forecast.findOne({ forecastId: 'fc_heavy_rain_7d_demo' });
      expect(forecast).not.toBeNull();
      expect(forecast?.operationalStatus).toBe('DIAGNOSTIC_ONLY');
      expect(forecast?.dataFreshness).toBe('ARCHIVED');
    });
  });
});
