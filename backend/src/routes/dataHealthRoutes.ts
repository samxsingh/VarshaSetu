import { Router } from 'express';
import { dataHealthController } from '../controllers/dataHealthController';

export const dataHealthRoutes = Router();

// Overview stats across all providers & ingestion status
dataHealthRoutes.get('/', dataHealthController.getOverview);

// List of all configured data sources and freshness
dataHealthRoutes.get('/sources', dataHealthController.listSources);

// Ingestion runs list with pagination and status filters
dataHealthRoutes.get('/runs', dataHealthController.listRuns);

// Specific run details and data quality report
dataHealthRoutes.get('/runs/:id', dataHealthController.getRunById);

// Trigger ingestion pipeline run
dataHealthRoutes.post('/trigger', dataHealthController.triggerIngestion);
