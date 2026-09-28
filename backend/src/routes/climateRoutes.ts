import { Router } from 'express';
import { weatherController } from '../controllers/weatherController';

export const climateRoutes = Router();

climateRoutes.get('/signals', weatherController.getClimateSignals);
climateRoutes.get('/signals/latest', weatherController.getClimateSignals);
climateRoutes.get('/baseline', weatherController.getClimateBaseline);
