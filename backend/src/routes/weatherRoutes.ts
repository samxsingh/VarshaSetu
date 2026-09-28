import { Router } from 'express';
import { weatherController } from '../controllers/weatherController';

export const weatherRoutes = Router();

weatherRoutes.get('/current', weatherController.getCurrentConditions);
weatherRoutes.get('/forecast', weatherController.getForecast);
weatherRoutes.get('/sync-status', weatherController.getSyncStatus);
weatherRoutes.get('/officer-block-risks', weatherController.getOfficerBlockRisks);
weatherRoutes.get('/government-overview', weatherController.getGovernmentOverview);
weatherRoutes.get('/provider-health', weatherController.getProviderHealth);
weatherRoutes.get('/context', weatherController.getDataContext);
weatherRoutes.get('/hourly', weatherController.getHourlyWeather);
weatherRoutes.get('/sources', weatherController.getMeteorologicalSources);
