import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';
import { advisoryRepository } from '../repositories/advisoryRepository';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const advisoryController = {
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/status`);
        if (mlRes.ok) {
          const data: any = await mlRes.json();
          return sendSuccess(res, data);
        }
      } catch (e) {
        // Fallback below
      }

      return sendSuccess(res, {
        status: 'active',
        phase: 'PHASE_5A_AGRONOMIC_RULES_FOUNDATION',
        operational_mode: 'DIAGNOSTIC_ONLY',
        operational_advisory_allowed: false,
        active_dataset: 'Kharif 2024 (Bakshi Ka Talab, UP_LKO_BKT)',
        station_coverage: '1 Station (Bakshi Ka Talab centroid)',
        total_registered_rules: 9,
        total_supported_crops: 6,
        total_active_advisories: 0,
        safety_gate: {
          status: 'ENFORCING',
          evaluated_checks_count: 13,
          blocked_imperative_directives: true,
        },
        scientific_disclosure:
          'Agronomic intelligence products are currently based on historical Kharif 2024 observations. All advisories operate in informational diagnostic mode. Field-level crop interventions are not certified.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  async listRules(req: Request, res: Response, next: NextFunction) {
    try {
      const { target, crop, stage } = req.query;
      const queryParams = new URLSearchParams();
      if (target) queryParams.append('target', String(target));
      if (crop) queryParams.append('crop', String(crop));
      if (stage) queryParams.append('stage', String(stage));

      try {
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/rules?${queryParams.toString()}`);
        if (mlRes.ok) {
          const data: any = await mlRes.json();
          return sendSuccess(res, data);
        }
      } catch (e) {
        // Fallback
      }

      return sendSuccess(res, {
        total_rules: 0,
        rules: [],
        filters_applied: { target, crop, stage },
        notice: 'ML service currently unreachable. Live rules not loaded.',
      });
    } catch (error) {
      next(error);
    }
  },

  async getRuleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      try {
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/rules/${encodeURIComponent(id)}`);
        if (mlRes.ok) {
          const data: any = await mlRes.json();
          return sendSuccess(res, data);
        }
        if (mlRes.status === 404) {
          return sendError(res, 'NOT_FOUND', `Agronomic rule '${id}' not found.`, 404);
        }
      } catch (e) {
        // Fallback
      }

      return sendError(res, 'NOT_FOUND', `Agronomic rule '${id}' not found or ML service unavailable.`, 404);
    } catch (error) {
      next(error);
    }
  },

  async listCrops(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/crops`);
        if (mlRes.ok) {
          const data: any = await mlRes.json();
          return sendSuccess(res, data);
        }
      } catch (e) {
        // Fallback
      }

      return sendSuccess(res, {
        total_crops: 6,
        crops: [
          { crop: 'GENERAL', scientific_name: 'All Crops', status: 'INFORMATIONAL_ONLY' },
          { crop: 'PADDY', scientific_name: 'Oryza sativa', status: 'INFORMATIONAL_ONLY' },
          { crop: 'WHEAT', scientific_name: 'Triticum aestivum', status: 'INFORMATIONAL_ONLY' },
          { crop: 'MAIZE', scientific_name: 'Zea mays', status: 'INFORMATIONAL_ONLY' },
          { crop: 'PULSES', scientific_name: 'Fabaceae spp.', status: 'INFORMATIONAL_ONLY' },
          { crop: 'MUSTARD', scientific_name: 'Brassica juncea', status: 'INFORMATIONAL_ONLY' },
        ],
      });
    } catch (error) {
      next(error);
    }
  },

  async getCropById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      try {
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/crops/${encodeURIComponent(id)}`);
        if (mlRes.ok) {
          const data: any = await mlRes.json();
          return sendSuccess(res, data);
        }
        if (mlRes.status === 404) {
          return sendError(res, 'NOT_FOUND', `Crop '${id}' not found in agronomic registry.`, 404);
        }
      } catch (e) {
        // Fallback
      }

      return sendError(res, 'NOT_FOUND', `Crop '${id}' not found.`, 404);
    } catch (error) {
      next(error);
    }
  },

  async evaluateAdvisories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!mlRes.ok) {
        const errData: any = await mlRes.json().catch(() => ({}));
        return sendError(res, 'EVALUATION_FAILED', errData.detail || 'Failed to evaluate agronomic rules.', mlRes.status);
      }

      const evaluationData: any = await mlRes.json();

      // Persist generated advisories and evaluation audit record if available
      if (evaluationData.advisories && Array.isArray(evaluationData.advisories)) {
        for (const adv of evaluationData.advisories) {
          await advisoryRepository.insertAdvisory(adv);
        }
      }

      await advisoryRepository.insertRuleEvaluation({
        evaluation_id: `EVAL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        forecast_id: body.forecast?.forecast_id || body.forecast_id || 'UNKNOWN',
        block_id: body.forecast?.block_id || body.block_id || 'UP_LKO_BKT',
        crop_type: body.crop_type || 'GENERAL',
        growth_stage: body.growth_stage || 'ALL',
        safety_gate_passed: evaluationData.safety_gate_passed ?? true,
        blocked_reasons: evaluationData.safety_gate_results || [],
        rules_evaluated: evaluationData.rules_evaluated || 0,
        advisories_generated: evaluationData.advisories_generated || 0,
        evaluator: req.user?.id || 'SYSTEM',
        metadata: { request: body },
      });

      return sendSuccess(res, evaluationData);
    } catch (error) {
      next(error);
    }
  },

  async generateAdvisories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { block_id, crop_type, growth_stage, target_date } = req.body;
      const queryParams = new URLSearchParams();
      if (block_id) queryParams.append('block_id', block_id);
      if (crop_type) queryParams.append('crop_type', crop_type);
      if (growth_stage) queryParams.append('growth_stage', growth_stage);
      if (target_date) queryParams.append('target_date', target_date);

      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/advisories/generate?${queryParams.toString()}`, {
        method: 'POST',
      });

      if (!mlRes.ok) {
        const errData: any = await mlRes.json().catch(() => ({}));
        return sendError(res, 'GENERATION_FAILED', errData.detail || 'Advisory generation failed', mlRes.status);
      }

      const data: any = await mlRes.json();

      if (data.advisories && Array.isArray(data.advisories)) {
        for (const adv of data.advisories) {
          await advisoryRepository.insertAdvisory(adv);
        }
      }

      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async listAdvisories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let blockId = req.query.block_id as string | undefined;

      // Farmers are restricted to their assigned block
      if (req.user?.role === 'FARMER') {
        blockId = req.user.assignedLocationId || 'UP_LKO_BKT';
      }

      const cropType = req.query.crop_type as string | undefined;
      const severity = req.query.severity as string | undefined;
      const status = req.query.status as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      // 1. Try ML Service
      try {
        const queryParams = new URLSearchParams();
        if (blockId) queryParams.append('block_id', blockId);
        if (cropType) queryParams.append('crop_type', cropType);
        if (severity) queryParams.append('severity', severity);
        queryParams.append('limit', String(limit));

        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/advisories?${queryParams.toString()}`);
        if (mlRes.ok) {
          const data: any = await mlRes.json();
          return sendSuccess(res, data);
        }
      } catch (e) {
        // Fallback to database
      }

      // 2. Database Fallback
      const dbAdvisories = await advisoryRepository.listAdvisories({
        block_id: blockId,
        crop_type: cropType,
        severity,
        status,
        limit,
      });

      return sendSuccess(res, {
        total_advisories: dbAdvisories.length,
        advisories: dbAdvisories,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAdvisoryById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      try {
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/advisories/${encodeURIComponent(id)}`);
        if (mlRes.ok) {
          const data: any = await mlRes.json();
          return sendSuccess(res, data);
        }
      } catch (e) {
        // Fallback to database
      }

      const dbAdv = await advisoryRepository.getAdvisoryById(id);
      if (dbAdv) {
        return sendSuccess(res, dbAdv);
      }

      return sendError(res, 'NOT_FOUND', `Advisory '${id}' not found.`, 404);
    } catch (error) {
      next(error);
    }
  },

  async simulateScenario(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!mlRes.ok) {
        const errData: any = await mlRes.json().catch(() => ({}));
        return sendError(res, 'SIMULATION_FAILED', errData.detail || 'Scenario simulation failed.', mlRes.status);
      }

      const simResult: any = await mlRes.json();

      // Persist scenario run
      await advisoryRepository.insertScenarioRun({
        scenario_id: simResult.scenario_id || `SCEN_${Date.now()}`,
        user_id: req.user?.id || null,
        block_id: simResult.block_id || body.block_id || 'UP_LKO_BKT',
        crop_type: simResult.crop_type || body.crop_type || 'GENERAL',
        growth_stage: simResult.growth_stage || body.growth_stage || 'ALL',
        baseline_forecast_id: simResult.baseline_forecast_id || body.baseline_forecast_id || 'UNKNOWN',
        scenario_parameters: simResult.parameters || {},
        scenario_results: simResult,
        indicator_only_ack: true,
      });

      return sendSuccess(res, simResult);
    } catch (error) {
      next(error);
    }
  },

  async dismissAdvisory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await advisoryRepository.updateAdvisoryStatus(id, 'DISMISSED');
      if (!updated) {
        return sendError(res, 'UPDATE_FAILED', `Advisory '${id}' not found or could not be updated.`, 404);
      }
      return sendSuccess(res, {
        message: `Advisory '${id}' marked as DISMISSED.`,
        advisory: updated,
      });
    } catch (error) {
      next(error);
    }
  },
};
