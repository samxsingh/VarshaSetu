import {
  HourlyPointQuery,
  NormalizedHourlyPointResponse,
  MeteorologicalProviderSource,
  WeatherObservation,
} from '../../providers/types';
import { nasaPowerService } from '../../providers/nasaPower/nasaPowerService';
import { imdService, ImdCurrentWeatherResult } from '../../providers/imd/imdService';
import { ecmwfService } from '../../providers/ecmwf/ecmwfService';
import { env } from '../../config/env';

export interface MeteorologicalSourceCapability {
  source: MeteorologicalProviderSource;
  name: string;
  role: 'HISTORICAL_REANALYSIS' | 'OPERATIONAL_OBSERVATION' | 'NUMERICAL_PREDICTION' | 'CLIMATOLOGY';
  isKeyless: boolean;
  status: 'CONFIGURED' | 'NOT_CONFIGURED';
  latencyClassification: 'LIVE' | 'NEAR_REAL_TIME_LATENCY' | 'HISTORICAL' | 'CLIMATOLOGY';
  latencyNote: string;
  attribution: string;
  provenanceUrl: string;
}

export class MeteorologicalDataService {
  /**
   * Retrieves normalized hourly meteorological data from the designated provider
   * (defaulting to NASA POWER for historical reanalysis & agroclimatology).
   */
  public async getHourlyData(
    query: HourlyPointQuery
  ): Promise<NormalizedHourlyPointResponse> {
    const selectedSource: MeteorologicalProviderSource = query.source || 'NASA_POWER';

    switch (selectedSource) {
      case 'NASA_POWER':
        return await nasaPowerService.getHourlyPointData(query);

      case 'ECMWF':
        return await ecmwfService.getHourlyPointData(query);

      case 'IMD':
        // IMD does not provide multi-day hourly point reanalysis through a single call;
        // we retrieve current weather or delegate to NASA POWER if historical hourly is required
        try {
          const currentWeather = await imdService.getCurrentWeather({});
          const obs = currentWeather.observation;
          return {
            source: 'IMD',
            availability: 'AVAILABLE',
            latestAvailableTimestamp: obs.timestamp,
            metadata: {
              source: 'IMD',
              requestedStart: typeof query.start === 'string' ? query.start : query.start.toISOString(),
              requestedEnd: typeof query.end === 'string' ? query.end : query.end.toISOString(),
              latestAvailableTimestamp: obs.timestamp,
              availabilityStatus: 'AVAILABLE',
              totalRecordCount: 1,
              validRecordCount: 1,
              missingRecordCount: 0,
              retrievedAt: new Date().toISOString(),
              provenance: {
                providerName: 'India Meteorological Department (IMD)',
                dataset: 'IMD Station / AWS Surface Observations',
                isKeyless: false,
                dataRole: 'OPERATIONAL_OBSERVATION',
                latencyClassification: 'LIVE',
                latencyNote: 'Real-time observation from AWS network.',
                attribution: 'India Meteorological Department (IMD)',
                provenanceUrl: 'https://api.imd.gov.in/',
              },
            },
            data: [obs],
          };
        } catch {
          // If IMD fails or lacks historical range, fallback to NASA POWER
          return await nasaPowerService.getHourlyPointData(query);
        }

      default:
        return await nasaPowerService.getHourlyPointData(query);
    }
  }

  /**
   * Returns list of configured meteorological sources with keyless/latency metadata.
   */
  public getSources(): MeteorologicalSourceCapability[] {
    const ecmwfStatus = ecmwfService.getStatus();

    return [
      {
        source: 'NASA_POWER',
        name: 'NASA POWER Agroclimatology & Reanalysis',
        role: 'HISTORICAL_REANALYSIS',
        isKeyless: true,
        status: env.NASA_POWER_ENABLED ? 'CONFIGURED' : 'NOT_CONFIGURED',
        latencyClassification: 'NEAR_REAL_TIME_LATENCY',
        latencyNote:
          'Observational latency is ~2 to 4 days. Used strictly for historical baselines, validation, and agroclimatology. Never represented as live weather.',
        attribution: 'NASA Langley Research Center (LaRC) POWER Project',
        provenanceUrl: 'https://power.larc.nasa.gov/',
      },
      {
        source: 'IMD',
        name: 'India Meteorological Department (IMD)',
        role: 'OPERATIONAL_OBSERVATION',
        isKeyless: false,
        status: env.IMD_ENABLED ? 'CONFIGURED' : 'NOT_CONFIGURED',
        latencyClassification: 'LIVE',
        latencyNote: 'Official real-time surface observations, nowcasts, and district warnings.',
        attribution: 'India Meteorological Department, Ministry of Earth Sciences (MoES)',
        provenanceUrl: 'https://api.imd.gov.in/',
      },
      {
        source: 'ECMWF',
        name: 'European Centre for Medium-Range Weather Forecasts',
        role: 'NUMERICAL_PREDICTION',
        isKeyless: false,
        status: ecmwfStatus.status,
        latencyClassification: 'LIVE',
        latencyNote: 'Global atmospheric modeling and numerical weather prediction runs.',
        attribution: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
        provenanceUrl: 'https://www.ecmwf.int/',
      },
      {
        source: 'OPEN_METEO',
        name: 'Open-Meteo Weather API',
        role: 'OPERATIONAL_OBSERVATION',
        isKeyless: true,
        status: env.OPEN_METEO_ENABLED ? 'CONFIGURED' : 'NOT_CONFIGURED',
        latencyClassification: 'LIVE',
        latencyNote: 'High-resolution global numerical weather prediction ensembles.',
        attribution: 'Open-Meteo (under CC BY 4.0)',
        provenanceUrl: 'https://open-meteo.com/',
      },
    ];
  }
}

export const meteorologicalDataService = new MeteorologicalDataService();
