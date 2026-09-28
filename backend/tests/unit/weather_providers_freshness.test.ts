import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IMDProvider } from '../../src/services/providers/IMDProvider';
import { OpenMeteoProvider } from '../../src/services/providers/OpenMeteoProvider';
import { NASAPowerProvider } from '../../src/services/providers/NASAPowerProvider';
import { Era5BaselineProvider } from '../../src/services/providers/Era5BaselineProvider';
import { WeatherAggregatorService } from '../../src/services/weather/WeatherAggregatorService';

describe('Phase 11: Meteorological & Climate Data Ingestion Layer', () => {
  const mockLocation = {
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    blockId: 'UP_LKO_BKT',
    blockName: 'Bakshi Ka Talab',
    latitude: 26.9749,
    longitude: 80.9276,
  };

  describe('1. IMDProvider Adapter & Resilience', () => {
    it('initializes with official IMD parameters and handles missing API key gracefully', async () => {
      const imd = new IMDProvider();
      expect(imd.name).toContain('India Meteorological Department');
      expect(imd.providerId).toBe('IMD_NATIONAL_MET');
      expect(imd.isEnabled).toBe(true);

      // checkHealth should not crash even if operational key is absent
      const health = await imd.checkHealth();
      expect(['CONNECTED', 'DEGRADED', 'UNAVAILABLE']).toContain(health.status);
    });

    it('rejects unauthenticated live fetch cleanly to trigger fallback', async () => {
      const imd = new IMDProvider();
      await expect(imd.getCurrentConditions(mockLocation)).rejects.toThrow(
        /IMD operational API key not configured/
      );
    });
  });

  describe('2. OpenMeteoProvider & Canonical Normalization', () => {
    it('retrieves live current weather and normalizes into canonical schema', async () => {
      const om = new OpenMeteoProvider();
      const current = await om.getCurrentConditions(mockLocation);

      expect(current.source).toContain('Open-Meteo');
      expect(current.provider).toBe('OPEN_METEO_ECMWF');
      expect(current.freshnessStatus).toBe('LIVE');
      expect(current.isLive).toBe(true);
      expect(current.isHistorical).toBe(false);
      expect(current.isSimulated).toBe(false);

      expect(typeof current.temperatureC).toBe('number');
      expect(typeof current.humidityPercent).toBe('number');
      expect(typeof current.precipitationMm).toBe('number');
      expect(typeof current.surfacePressureHpa).toBe('number');
      expect(current.observedAtIST).toContain('IST');
    });

    it('retrieves multi-day forecast and computes risk states accurately', async () => {
      const om = new OpenMeteoProvider();
      const fc = await om.getForecast(mockLocation, 7);

      expect(fc.daily.length).toBe(7);
      expect(fc.freshnessStatus).toBe('LIVE');
      expect(fc.summary).toBeDefined();
      expect(typeof fc.summary.expectedTotalRainfall7dMm).toBe('number');
      expect(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).toContain(fc.summary.heavyRainAlertRisk);

      // Verify first day format
      const day1 = fc.daily[0];
      expect(day1.validFrom).toContain('+05:30');
      expect(typeof day1.rainfallProbability).toBe('number');
      expect(day1.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('3. NASAPowerProvider Agroclimatology', () => {
    it('checks health of NASA POWER endpoint', async () => {
      const np = new NASAPowerProvider();
      const health = await np.checkHealth();
      expect(['CONNECTED', 'DEGRADED', 'UNAVAILABLE']).toContain(health.status);
    });

    it('retrieves satellite agroclimatology with RECENT classification', async () => {
      const np = new NASAPowerProvider();
      const agro = await np.getCurrentConditions(mockLocation);

      expect(agro.source).toContain('NASA POWER');
      expect(agro.provider).toBe('NASA_POWER_AGRO');
      expect(agro.freshnessStatus).toBe('RECENT'); // Verified ~2-3 day satellite lag
      expect(agro.isLive).toBe(false);
      expect(typeof agro.temperatureC).toBe('number');
    });
  });

  describe('4. Era5BaselineProvider (30-Year Climatology Baseline)', () => {
    it('computes climatological normal anomalies against 1991–2020 ERA5-Land baseline', () => {
      const baselineProvider = new Era5BaselineProvider();
      const metrics = baselineProvider.getBaselineMetrics(mockLocation, {
        rainfallAccumMm: 165.2,
        meanTempC: 28.5,
        meanRhPercent: 70,
        soilMoisture: 30,
      });

      expect(metrics.baselinePeriod).toContain('1991–2020');
      expect(metrics.rainfall.baselineNormalMm).toBe(182.4); // BKT normal
      expect(metrics.rainfall.anomalyPercent).toBeDefined();
      expect(['DEFICIENT', 'NORMAL', 'EXCESS', 'LARGE_EXCESS']).toContain(metrics.rainfall.anomalyStatus);
    });

    it('provides traceable planetary climate signals (ENSO, IOD, MJO)', () => {
      const baselineProvider = new Era5BaselineProvider();
      const signals = baselineProvider.getClimateSignals();

      expect(signals.length).toBeGreaterThanOrEqual(3);
      const enso = signals.find((s) => s.symbol.includes('Niño'));
      expect(enso).toBeDefined();
      expect(enso?.classification).toBe('Observed');
      expect(enso?.provenance).toContain('NOAA');

      const mjo = signals.find((s) => s.symbol.includes('RMM'));
      expect(mjo).toBeDefined();
      expect(mjo?.classification).toBe('Observed');
    });
  });

  describe('5. WeatherAggregatorService Fallback & Orchestration', () => {
    let aggregator: WeatherAggregatorService;

    beforeEach(() => {
      aggregator = new WeatherAggregatorService();
    });

    it('transparently executes fallback when primary IMD is unauthenticated', async () => {
      const current = await aggregator.getCurrentConditions(mockLocation);
      expect(current.freshnessStatus).toBe('LIVE');
      expect(current.source).toContain('Open-Meteo');
      expect(current.fallbackChainUsed).toBeDefined();
      expect(current.fallbackChainUsed?.some((f) => f.includes('IMD'))).toBe(true);
    });

    it('returns officer block risk matrix across 8 Lucknow administrative centroids', async () => {
      const risks = await aggregator.getOfficerBlockRisks();
      expect(risks.length).toBe(8);
      expect(risks.some((r) => r.blockId === 'UP_LKO_BKT')).toBe(true);
      expect(risks.some((r) => r.blockName === 'Malihabad')).toBe(true);
      expect(risks[0].dataFreshness).toBe('LIVE');
    });

    it('aggregates government overview KPIs with accurate sync state', async () => {
      const gov = await aggregator.getGovernmentOverview();
      expect(gov.monitoredBlocks).toBe(8);
      expect(typeof gov.activeRainfallWarnings).toBe('number');
      expect(gov.overallDataFreshness).toBe('LIVE');
      expect(gov.lastSyncTimeIST).toContain('2026');
    });

    it('evaluates health across all providers without throwing uncaught exceptions', async () => {
      const statuses = await aggregator.checkAllProvidersHealth();
      expect(statuses.length).toBe(3);
      const openMeteoHealth = statuses.find((s) => s.providerId === 'OPEN_METEO_ECMWF');
      expect(openMeteoHealth?.status).toBe('CONNECTED');
    });
  });
});
