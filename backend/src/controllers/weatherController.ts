import { Request, Response, NextFunction } from 'express';
import { weatherAggregatorService } from '../services/weather/WeatherAggregatorService';
import { meteorologicalDataService } from '../services/weather/MeteorologicalDataService';
import { MeteorologicalProviderSource } from '../providers/types';
import { env } from '../config/env';
import { sendSuccess, sendError } from '../utils/responseEnvelope';

export const weatherController = {
  async getCurrentConditions(req: Request, res: Response, next: NextFunction) {
    try {
      const rawLat = (req.query.lat || req.query.latitude) as string | undefined;
      const rawLon = (req.query.lon || req.query.lng || req.query.longitude) as string | undefined;
      const lat = rawLat ? parseFloat(rawLat) : undefined;
      const lon = rawLon ? parseFloat(rawLon) : undefined;
      const blockId = (req.query.block_id || req.query.blockId) as string | undefined;

      const data = await weatherAggregatorService.getCurrentConditions({
        latitude: lat,
        longitude: lon,
        blockId,
      });
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getForecast(req: Request, res: Response, next: NextFunction) {
    try {
      const rawLat = (req.query.lat || req.query.latitude) as string | undefined;
      const rawLon = (req.query.lon || req.query.lng || req.query.longitude) as string | undefined;
      const lat = rawLat ? parseFloat(rawLat) : undefined;
      const lon = rawLon ? parseFloat(rawLon) : undefined;
      const blockId = (req.query.block_id || req.query.blockId) as string | undefined;
      const horizonDays = req.query.horizon ? parseInt(req.query.horizon as string, 10) : 7;

      const data = await weatherAggregatorService.getForecast(
        { latitude: lat, longitude: lon, blockId },
        horizonDays
      );
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getSyncStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = weatherAggregatorService.getSyncStatus();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getOfficerBlockRisks(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await weatherAggregatorService.getOfficerBlockRisks();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getGovernmentOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await weatherAggregatorService.getGovernmentOverview();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getClimateBaseline(req: Request, res: Response, next: NextFunction) {
    try {
      const blockId = req.query.block_id as string | undefined;
      const data = await weatherAggregatorService.getClimateBaseline({ blockId });
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getClimateSignals(req: Request, res: Response, next: NextFunction) {
    try {
      const data = weatherAggregatorService.getClimateSignals();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getProviderHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await weatherAggregatorService.checkAllProvidersHealth();
      return sendSuccess(res, {
        overall: weatherAggregatorService.getSyncStatus().overallStatus,
        providers: data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getDataContext(req: Request, res: Response, next: NextFunction) {
    try {
      const rawLat = (req.query.lat || req.query.latitude) as string | undefined;
      const rawLon = (req.query.lon || req.query.lng || req.query.longitude) as string | undefined;
      const lat = rawLat ? parseFloat(rawLat) : undefined;
      const lon = rawLon ? parseFloat(rawLon) : undefined;
      const blockId = (req.query.block_id || req.query.blockId) as string | undefined;

      const data = await weatherAggregatorService.getOperationalDataContext({
        latitude: lat,
        longitude: lon,
        blockId,
      });
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getHourlyWeather(req: Request, res: Response, next: NextFunction) {
    try {
      const rawLat = (req.query.lat || req.query.latitude) as string | undefined;
      const rawLon = (req.query.lon || req.query.lng || req.query.longitude) as string | undefined;
      const lat = rawLat ? parseFloat(rawLat) : env.DEFAULT_DEMO_LATITUDE;
      const lon = rawLon ? parseFloat(rawLon) : env.DEFAULT_DEMO_LONGITUDE;

      // Default historical start: 7 days ago in UTC
      const defaultStart = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
      const defaultEnd = new Date().toISOString().split('T')[0];

      const start = (req.query.start as string) || defaultStart;
      const end = (req.query.end as string) || defaultEnd;
      const source = (req.query.source as MeteorologicalProviderSource) || 'NASA_POWER';

      const data = await meteorologicalDataService.getHourlyData({
        latitude: lat,
        longitude: lon,
        start,
        end,
        source,
      });

      return sendSuccess(res, data);
    } catch (error: any) {
      if (error && error.status === 'ERROR') {
        return sendError(res, error.errorCode || 'PROVIDER_ERROR', error.message, 502);
      }
      next(error);
    }
  },

  async getMeteorologicalSources(req: Request, res: Response, next: NextFunction) {
    try {
      const sources = meteorologicalDataService.getSources();
      return sendSuccess(res, sources);
    } catch (error) {
      next(error);
    }
  },
};
