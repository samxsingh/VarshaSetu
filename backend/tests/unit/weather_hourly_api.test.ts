import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { nasaPowerService } from '../../src/providers/nasaPower/nasaPowerService';

describe('Meteorological Data API Endpoints', () => {
  describe('GET /api/v1/weather/sources', () => {
    it('returns configured meteorological providers with keyless and latency classifications', async () => {
      const res = await request(app).get('/api/v1/weather/sources');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const sources = res.body.data;
      expect(Array.isArray(sources)).toBe(true);

      const nasa = sources.find((s: any) => s.source === 'NASA_POWER');
      expect(nasa).toBeDefined();
      expect(nasa.isKeyless).toBe(true);
      expect(nasa.latencyClassification).toBe('NEAR_REAL_TIME_LATENCY');
      expect(nasa.latencyNote).toContain('2 to 4 days');

      const imd = sources.find((s: any) => s.source === 'IMD');
      expect(imd).toBeDefined();
      expect(imd.role).toBe('OPERATIONAL_OBSERVATION');

      const ecmwf = sources.find((s: any) => s.source === 'ECMWF');
      expect(ecmwf).toBeDefined();
      expect(ecmwf.role).toBe('NUMERICAL_PREDICTION');
    });
  });

  describe('GET /api/v1/weather/hourly', () => {
    it('returns normalized hourly point observations with availability metadata', async () => {
      // Mock getHourlyPointData to avoid hitting NASA live network in automated tests
      const mockResult = {
        source: 'NASA_POWER' as const,
        availability: 'PARTIAL' as const,
        latestAvailableTimestamp: '2026-09-26T23:00:00.000Z',
        metadata: {
          source: 'NASA_POWER' as const,
          requestedStart: '2026-09-01T00:00:00.000Z',
          requestedEnd: '2026-09-28T23:59:59.000Z',
          latestAvailableTimestamp: '2026-09-26T23:00:00.000Z',
          availabilityStatus: 'PARTIAL' as const,
          totalRecordCount: 2,
          validRecordCount: 1,
          missingRecordCount: 1,
          retrievedAt: new Date().toISOString(),
          provenance: nasaPowerService.getProvenanceMetadata(),
        },
        data: [
          {
            timestamp: '2026-09-26T23:00:00.000Z',
            latitude: 26.9749,
            longitude: 80.9276,
            temperature2mC: 28.5,
            relativeHumidityPct: 70,
            precipitationMm: 0,
            windSpeed10mMs: 3.1,
            windDirection10mDeg: 120,
            surfacePressureKPa: 100.1,
            source: 'NASA_POWER' as const,
            availability: 'AVAILABLE' as const,
            retrievedAt: new Date().toISOString(),
          },
          {
            timestamp: '2026-09-27T00:00:00.000Z',
            latitude: 26.9749,
            longitude: 80.9276,
            temperature2mC: null, // Null coerced from -999
            relativeHumidityPct: null,
            precipitationMm: null,
            windSpeed10mMs: null,
            windDirection10mDeg: null,
            surfacePressureKPa: null,
            source: 'NASA_POWER' as const,
            availability: 'UNAVAILABLE' as const,
            retrievedAt: new Date().toISOString(),
          },
        ],
      };

      const spy = vi
        .spyOn(nasaPowerService, 'getHourlyPointData')
        .mockResolvedValueOnce(mockResult);

      const res = await request(app)
        .get('/api/v1/weather/hourly')
        .query({
          latitude: 26.9749,
          longitude: 80.9276,
          start: '2026-09-01',
          end: '2026-09-28',
          source: 'NASA_POWER',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data.source).toBe('NASA_POWER');
      expect(data.availability).toBe('PARTIAL');
      expect(data.latestAvailableTimestamp).toBe('2026-09-26T23:00:00.000Z');
      expect(data.data.length).toBe(2);
      expect(data.data[1].temperature2mC).toBeNull();
      expect(data.data[1].availability).toBe('UNAVAILABLE');

      // Verify no secrets leaked in response
      const jsonStr = JSON.stringify(res.body);
      expect(jsonStr).not.toContain('API_KEY');
      expect(jsonStr).not.toContain('secret');

      spy.mockRestore();
    });

    it('gracefully handles provider error without crashing the server', async () => {
      const spy = vi
        .spyOn(nasaPowerService, 'getHourlyPointData')
        .mockRejectedValueOnce({
          source: 'NASA_POWER',
          status: 'ERROR',
          errorCode: 'PROVIDER_UNAVAILABLE',
          message: 'NASA POWER data could not be retrieved: Timeout',
        });

      const res = await request(app)
        .get('/api/v1/weather/hourly')
        .query({
          latitude: 26.9749,
          longitude: 80.9276,
          start: '2026-09-01',
          end: '2026-09-28',
        });

      expect(res.status).toBe(502);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PROVIDER_UNAVAILABLE');
      expect(res.body.error.message).toContain('NASA POWER data could not be retrieved');

      spy.mockRestore();
    });
  });
});
