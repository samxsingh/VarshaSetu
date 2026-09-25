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

// Phase 4C Probabilistic Calibration & Reliability Endpoints (before /:id)
modelRoutes.get('/calibration/status', modelController.getCalibrationStatus);
modelRoutes.get('/calibration/comparison', modelController.getCalibrationComparison);
modelRoutes.post('/calibration/run', modelController.runCalibration);
modelRoutes.get('/calibration/:id/reliability', modelController.getCalibrationModelReliability);
modelRoutes.get('/calibration/:id', modelController.getCalibrationModelById);

// Phase 4D Multi-Year Validation, Hindcasting & Stability Endpoints (before /:id)
modelRoutes.get('/hindcasting/status', modelController.getHindcastStatus);
modelRoutes.get('/hindcasting/gate', modelController.getHindcastGate);
modelRoutes.get('/hindcasting/folds', modelController.getHindcastFolds);
modelRoutes.get('/hindcasting/results', modelController.getHindcastResults);
modelRoutes.get('/hindcasting/results/:experimentId', modelController.getHindcastResultById);
modelRoutes.get('/hindcasting/stability', modelController.getHindcastStability);
modelRoutes.get('/hindcasting/drift', modelController.getHindcastDrift);
modelRoutes.get('/hindcasting/coverage', modelController.getHindcastCoverage);
modelRoutes.post('/hindcasting/run', modelController.runHindcast);


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
