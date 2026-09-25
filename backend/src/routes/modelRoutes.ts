import { Router } from 'express';
import { modelController } from '../controllers/modelController';

export const modelRoutes = Router();

// ML Model Readiness & Operational Disclosure
modelRoutes.get('/status', modelController.getStatus);

// List all baseline experiments
modelRoutes.get('/experiments', modelController.listExperiments);

// Get specific experiment manifest and metrics
modelRoutes.get('/experiments/:id', modelController.getExperimentById);

// Trigger on-demand baseline model training
modelRoutes.post('/baselines/train', modelController.triggerBaselineTraining);
