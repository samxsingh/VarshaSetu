import { Router } from 'express';
import { forecastController } from '../controllers/forecastController';

export const forecastRoutes = Router();

// Metadata & registries (must come before parameterized routes)
forecastRoutes.get('/status', forecastController.getStatus);
forecastRoutes.get('/availability', forecastController.getAvailability);
forecastRoutes.get('/targets', forecastController.getTargets);
forecastRoutes.get('/horizons', forecastController.getHorizons);
forecastRoutes.get('/history', forecastController.getHistory);
forecastRoutes.get('/location/:blockId', forecastController.getLocationForecasts);

// Forecast listing & generation
forecastRoutes.get('/', forecastController.listForecasts);
forecastRoutes.post('/generate', forecastController.generateForecast);
forecastRoutes.post('/process-expiry', forecastController.processExpiry);

// Parameterized by forecast ID
forecastRoutes.get('/:id/explanation', forecastController.getForecastExplanation);
forecastRoutes.get('/:id', forecastController.getForecastById);
