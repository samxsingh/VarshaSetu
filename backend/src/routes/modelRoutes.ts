import { Router } from 'express';
import { modelController } from '../controllers/modelController';

export const modelRoutes = Router();

// ML Model Readiness & Operational Disclosure
modelRoutes.get('/status', modelController.getStatus);

// Model registry & metadata
modelRoutes.get('/registry', modelController.getRegistry);

// Multi-model benchmark comparison (Climatology vs Logistic/Ridge vs XGBoost vs LightGBM)
modelRoutes.get('/comparison', modelController.getComparison);

// Scientific datasets catalog & integrity checksums
modelRoutes.get('/datasets', modelController.getDatasetsCatalog);

// Baseline & Tree experiments (fixed path before /:id)
modelRoutes.get('/experiments', modelController.listExperiments);
modelRoutes.get('/experiments/:id', modelController.getExperimentById);
modelRoutes.post('/baselines/train', modelController.triggerBaselineTraining);

// Model training & evaluation pipeline
modelRoutes.post('/train', modelController.trainModel);

// Specific model details & explanations (parameterized /:id paths last)
modelRoutes.get('/:id', modelController.getModelById);
modelRoutes.get('/:id/explanations', modelController.getModelExplanations);
modelRoutes.post('/:id/explain', modelController.explainModel);
