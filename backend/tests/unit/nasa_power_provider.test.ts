import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NasaPowerService } from '../../src/providers/nasaPower/nasaPowerService';
import { ProviderCache } from '../../src/providers/common/providerCache';
import { env, getProviderConfigStatus } from '../../src/config/env';

describe('NASA POWER Meteorological Data Provider Integration', () => {
  let service: NasaPowerService;

  beforeEach(() => {
    service = new NasaPowerService('https://power.larc.nasa.gov/api');
  });

  describe('1. Coordinate & Date Validation', () => {
    it('accepts valid coordinates within global boundaries', () => {
      expect(() => service.validateCoordinates(26.9749, 80.9276)).not.toThrow();
      expect(() => service.validateCoordinates(-90, 180)).not.toThrow();
      expect(() => service.validateCoordinates(0, 0)).not.toThrow();
    });

    it('rejects invalid latitudes beyond -90 to 90', () => {
      expect(() => service.validateCoordinates(95.0, 80.0)).toThrow(/Invalid latitude/);
      expect(() => service.validateCoordinates(-91.5, 80.0)).toThrow(/Invalid latitude/);
      expect(() => service.validateCoordinates(NaN, 80.0)).toThrow(/Invalid latitude/);
    });

    it('rejects invalid longitudes beyond -180 to 180', () => {
      expect(() => service.validateCoordinates(26.0, 181.0)).toThrow(/Invalid longitude/);
      expect(() => service.validateCoordinates(26.0, -180.5)).toThrow(/Invalid longitude/);
      expect(() => service.validateCoordinates(26.0, NaN)).toThrow(/Invalid longitude/);
    });

    it('formats dates consistently to YYYYMMDD across multiple input types', () => {
      // Date object
      const d = new Date(Date.UTC(2026, 8, 28)); // 2026-09-28
      expect(service.formatDateToYYYYMMDD(d)).toBe('20260928');

      // ISO string
      expect(service.formatDateToYYYYMMDD('2026-09-28T14:30:00.000Z')).toBe('20260928');

      // Date string
      expect(service.formatDateToYYYYMMDD('2026-09-28')).toBe('20260928');

      // Clean YYYYMMDD
      expect(service.formatDateToYYYYMMDD('20260928')).toBe('20260928');
    });

    it('throws when start date is chronologically after end date', () => {
      expect(() =>
        service.buildUrl({
          start: '2026-09-28',
          end: '2026-09-01',
          latitude: 26.9749,
          longitude: 80.9276,
        })
      ).toThrow(/Start date .* cannot be after end date/);
    });
  });

  describe('2. URL Construction & Parameter Requirements', () => {
    it('constructs correct NASA POWER point URL with required parameters', () => {
      const { url, startYmd, endYmd } = service.buildUrl({
        start: '2026-09-01',
        end: '2026-09-28',
        latitude: 26.9749,
        longitude: 80.9276,
      });

      expect(startYmd).toBe('20260901');
      expect(endYmd).toBe('20260928');

      const parsed = new URL(url);
      expect(parsed.origin).toBe('https://power.larc.nasa.gov');
      expect(parsed.pathname).toBe('/api/temporal/hourly/point');

      const p = parsed.searchParams;
      expect(p.get('start')).toBe('20260901');
      expect(p.get('end')).toBe('20260928');
      expect(p.get('latitude')).toBe('26.9749');
      expect(p.get('longitude')).toBe('80.9276');
      expect(p.get('community')).toBe('ag');
      expect(p.get('parameters')).toBe('T2M,RH2M,PRECTOTCORR,WS10M,WD10M,PS');
      expect(p.get('format')).toBe('json');
      expect(p.get('units')).toBe('metric');
      expect(p.get('user')).toBe('VarshaSetu');
      expect(p.get('header')).toBe('false');
      expect(p.get('time-standard')).toBe('utc');
    });
  });

  describe('3. Scientific Data Normalization & -999 Null Coercion', () => {
    it('coerces -999 and -999.0 to null and never converts to zero', () => {
      expect(service.normalizeNasaValue(-999)).toBeNull();
      expect(service.normalizeNasaValue(-999.0)).toBeNull();
      expect(service.normalizeNasaValue('-999')).toBeNull();
      expect(service.normalizeNasaValue(null)).toBeNull();
      expect(service.normalizeNasaValue(undefined)).toBeNull();

      // Zero is a legitimate meteorological measurement (e.g. 0°C or 0mm rainfall)
      expect(service.normalizeNasaValue(0)).toBe(0);
      expect(service.normalizeNasaValue(0.0)).toBe(0);

      // Valid measurements
      expect(service.normalizeNasaValue(28.456)).toBe(28.46);
      expect(service.normalizeNasaValue(101.32)).toBe(101.32);
    });

    it('correctly maps hourly YYYYMMDDHH keys to UTC ISO timestamps', () => {
      expect(service.parseHourKeyToIso('2026090100')).toBe('2026-09-01T00:00:00.000Z');
      expect(service.parseHourKeyToIso('2026090114')).toBe('2026-09-01T14:00:00.000Z');
      expect(service.parseHourKeyToIso('2026092823')).toBe('2026-09-28T23:00:00.000Z');
    });

    it('normalizes raw NASA response into canonical WeatherObservation records', () => {
      const mockRawNasa = {
        properties: {
          parameter: {
            T2M: { '2026090100': 26.5, '2026090101': -999 },
            RH2M: { '2026090100': 75.0, '2026090101': -999 },
            PRECTOTCORR: { '2026090100': 0.0, '2026090101': -999 },
            WS10M: { '2026090100': 3.2, '2026090101': -999 },
            WD10M: { '2026090100': 120.0, '2026090101': -999 },
            PS: { '2026090100': 100.2, '2026090101': -999 },
          },
        },
      };

      const result = service.parseNasaResponse(
        mockRawNasa,
        { start: '20260901', end: '20260901', latitude: 26.9749, longitude: 80.9276 },
        '20260901',
        '20260901'
      );

      expect(result.source).toBe('NASA_POWER');
      expect(result.data.length).toBe(2);

      // Hour 00: Available
      const obs0 = result.data[0];
      expect(obs0.timestamp).toBe('2026-09-01T00:00:00.000Z');
      expect(obs0.temperature2mC).toBe(26.5);
      expect(obs0.relativeHumidityPct).toBe(75.0);
      expect(obs0.precipitationMm).toBe(0.0);
      expect(obs0.windSpeed10mMs).toBe(3.2);
      expect(obs0.surfacePressureKPa).toBe(100.2);
      expect(obs0.availability).toBe('AVAILABLE');

      // Hour 01: -999 coerced to null, marked UNAVAILABLE
      const obs1 = result.data[1];
      expect(obs1.timestamp).toBe('2026-09-01T01:00:00.000Z');
      expect(obs1.temperature2mC).toBeNull();
      expect(obs1.relativeHumidityPct).toBeNull();
      expect(obs1.precipitationMm).toBeNull();
      expect(obs1.windSpeed10mMs).toBeNull();
      expect(obs1.surfacePressureKPa).toBeNull();
      expect(obs1.availability).toBe('UNAVAILABLE');

      // Availability summary
      expect(result.availability).toBe('PARTIAL');
      expect(result.latestAvailableTimestamp).toBe('2026-09-01T00:00:00.000Z');
      expect(result.metadata.validRecordCount).toBe(1);
      expect(result.metadata.missingRecordCount).toBe(1);
      expect(result.metadata.totalRecordCount).toBe(2);
    });
  });

  describe('4. Availability & Operational Latency Handling', () => {
    it('accurately detects latestAvailableTimestamp and PARTIAL status when recent dates are missing', () => {
      // Simulate NASA POWER containing records from 2026-09-01 to 2026-09-03, where 09-03 is -999
      const mockParameters: any = {
        T2M: {
          '2026090100': 27.0,
          '2026090200': 28.1,
          '2026090300': -999, // Unprocessed recent record
        },
        RH2M: { '2026090100': 70, '2026090200': 68, '2026090300': -999 },
        PRECTOTCORR: { '2026090100': 0, '2026090200': 1.2, '2026090300': -999 },
        WS10M: { '2026090100': 2.5, '2026090200': 3.0, '2026090300': -999 },
        WD10M: { '2026090100': 90, '2026090200': 100, '2026090300': -999 },
        PS: { '2026090100': 100.1, '2026090200': 100.0, '2026090300': -999 },
      };

      const result = service.parseNasaResponse(
        { properties: { parameter: mockParameters } },
        { start: '20260901', end: '20260903', latitude: 26.9749, longitude: 80.9276 },
        '20260901',
        '20260903'
      );

      expect(result.availability).toBe('PARTIAL');
      expect(result.latestAvailableTimestamp).toBe('2026-09-02T00:00:00.000Z');
      expect(result.metadata.validRecordCount).toBe(2);
      expect(result.metadata.missingRecordCount).toBe(1);

      // Verify provenance explicitly notes latency
      expect(result.metadata.provenance.isKeyless).toBe(true);
      expect(result.metadata.provenance.latencyClassification).toBe('NEAR_REAL_TIME_LATENCY');
      expect(result.metadata.provenance.latencyNote).toContain('latency of ~2 to 4 days');
    });

    it('identifies UNAVAILABLE when all records in range are missing (-999)', () => {
      const mockAllMissing: any = {
        T2M: { '2026092700': -999, '2026092800': -999 },
        RH2M: { '2026092700': -999, '2026092800': -999 },
        PRECTOTCORR: { '2026092700': -999, '2026092800': -999 },
        WS10M: { '2026092700': -999, '2026092800': -999 },
        WD10M: { '2026092700': -999, '2026092800': -999 },
        PS: { '2026092700': -999, '2026092800': -999 },
      };

      const result = service.parseNasaResponse(
        { properties: { parameter: mockAllMissing } },
        { start: '20260927', end: '20260928', latitude: 26.9749, longitude: 80.9276 },
        '20260927',
        '20260928'
      );

      expect(result.availability).toBe('UNAVAILABLE');
      expect(result.latestAvailableTimestamp).toBeNull();
      expect(result.metadata.validRecordCount).toBe(0);
      expect(result.metadata.missingRecordCount).toBe(2);
    });
  });

  describe('5. In-Memory Caching & Performance', () => {
    it('generates consistent deterministic cache keys', () => {
      const cache = new ProviderCache(15);
      const key1 = cache.generateKey('NASA_POWER', 26.9749, 80.9276, '20260901', '20260905');
      const key2 = cache.generateKey('NASA_POWER', 26.9749, 80.9276, '20260901', '20260905');
      const keyDiff = cache.generateKey('NASA_POWER', 26.9749, 80.9276, '20260901', '20260906');

      expect(key1).toBe(key2);
      expect(key1).not.toBe(keyDiff);
      expect(key1).toContain('NASA_POWER:26.9749:80.9276:20260901:20260905');
    });

    it('caches successful responses and does not cache error objects', () => {
      const cache = new ProviderCache(15);
      const key = 'TEST_KEY';

      const validResponse = { status: 'OK', data: [1, 2, 3] };
      cache.set(key, validResponse);
      expect(cache.get(key)).toEqual(validResponse);

      // Attempt to cache an error response
      const errorResponse = { status: 'ERROR', errorCode: 'PROVIDER_UNAVAILABLE' };
      cache.set('ERROR_KEY', errorResponse);
      expect(cache.get('ERROR_KEY')).toBeNull();
    });
  });

  describe('6. Error Handling & Provider Status Integrity', () => {
    it('returns structured provider error when fetch fails or times out', () => {
      const structured = service.createStructuredError('Connection timed out');
      expect(structured.source).toBe('NASA_POWER');
      expect(structured.status).toBe('ERROR');
      expect(structured.errorCode).toBe('PROVIDER_UNAVAILABLE');
      expect(structured.message).toContain('Connection timed out');
      expect(structured.retrievedAt).toBeDefined();
    });

    it('reports NASA POWER as CONFIGURED and KEYLESS in provider status', () => {
      const status = getProviderConfigStatus();
      expect(status.nasaPower.status).toBe('CONFIGURED');
      expect(status.nasaPower.hasKey).toBe(false);
      expect(status.nasaPower.isKeyless).toBe(true);
      expect(status.nasaPower.serviceRole).toContain('HISTORICAL_REANALYSIS');
    });
  });

  describe('7. Offline Simulation Mode', () => {
    it('generates simulated historical observations without external network requests', () => {
      const result = service.generateSimulatedResponse(
        {
          start: '2026-09-01',
          end: '2026-09-02',
          latitude: 26.9749,
          longitude: 80.9276,
        },
        '20260901',
        '20260902'
      );

      expect(result.source).toBe('NASA_POWER');
      expect(result.data.length).toBe(48); // 2 days * 24 hours
      expect(result.data[0].temperature2mC).toBeGreaterThan(20);
      expect(result.data[0].relativeHumidityPct).toBeGreaterThan(40);
      expect(result.metadata.provenance.isKeyless).toBe(true);
    });
  });
});
