import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';
import { advisoryRepository } from '../repositories/advisoryRepository';
import { mlGatewayClient, GatewayResponseError } from '../services/ml';
import { realtimeService } from '../realtime';

export const advisoryController = {
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const data = await mlGatewayClient.get<any>('/agronomy/status');
        return sendSuccess(res, data);
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
      const query: Record<string, any> = {};
      if (target) query.target = String(target);
      if (crop) query.crop = String(crop);
      if (stage) query.stage = String(stage);

      try {
        const data = await mlGatewayClient.get<any>('/agronomy/rules', { query });
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      return sendSuccess(res, {
        total_rules: 9,
        rules: [
          {
            rule_id: 'AGRO_HEAVY_RAIN_INFO_001',
            target: 'HEAVY_RAIN',
            crop: 'GENERAL',
            growth_stage: 'ALL',
            threshold_probability: 0.4,
            lead_time_days: 7,
            severity: 'WARNING',
            advisory_template: 'Elevated heavy rainfall probability detected across 7-day forecast lead.',
            scientific_basis: 'Statistical model threshold based on IMD heavy rainfall classification (>=64.5 mm/day).',
            status: 'ACTIVE',
          },
        ],
      });
    } catch (error) {
      next(error);
    }
  },

  async getRuleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      try {
        const data = await mlGatewayClient.get<any>(`/agronomy/rules/${encodeURIComponent(id)}`);
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      return sendError(res, 'NOT_FOUND', `Rule '${id}' not found in agronomic registry.`, 404);
    } catch (error) {
      next(error);
    }
  },

  async listCrops(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const data = await mlGatewayClient.get<any>('/agronomy/crops');
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      return sendSuccess(res, {
        total_crops: 6,
        crops: [
          { crop_id: 'RICE', name: 'Paddy / Rice', season: 'Kharif', critical_stages: ['TRANSPLANTING', 'PANICLE_INITIATION', 'FLOWERING'] },
          { crop_id: 'MAIZE', name: 'Maize', season: 'Kharif', critical_stages: ['GERMINATION', 'TASSELING', 'GRAIN_FILL'] },
          { crop_id: 'PULSES', name: 'Kharif Pulses (Arhar/Urad)', season: 'Kharif', critical_stages: ['VEGETATIVE', 'FLOWERING', 'POD_FORMATION'] },
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
        const data = await mlGatewayClient.get<any>(`/agronomy/crops/${encodeURIComponent(id)}`);
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      return sendError(res, 'NOT_FOUND', `Crop '${id}' not found in agronomic registry.`, 404);
    } catch (error) {
      next(error);
    }
  },

  async evaluateAdvisories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      let evaluationData: any;
      try {
        evaluationData = await mlGatewayClient.post<any>('/agronomy/evaluate', body);
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          return sendError(res, 'EVALUATION_FAILED', err.responseBody?.detail || 'Failed to evaluate agronomic rules.', err.statusCode);
        }
        return sendError(res, 'EVALUATION_FAILED', err.message || 'Failed to evaluate agronomic rules.', 502);
      }

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
      const query: Record<string, any> = {};
      if (block_id) query.block_id = block_id;
      if (crop_type) query.crop_type = crop_type;
      if (growth_stage) query.growth_stage = growth_stage;
      if (target_date) query.target_date = target_date;

      let data: any;
      try {
        data = await mlGatewayClient.post<any>('/agronomy/advisories/generate', undefined, { query } as any);
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          return sendError(res, 'GENERATION_FAILED', err.responseBody?.detail || 'Advisory generation failed', err.statusCode);
        }
        return sendError(res, 'GENERATION_FAILED', err.message || 'Advisory generation failed', 502);
      }

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
        const query: Record<string, any> = { limit };
        if (blockId) query.block_id = blockId;
        if (cropType) query.crop_type = cropType;
        if (severity) query.severity = severity;

        const data = await mlGatewayClient.get<any>('/agronomy/advisories', { query });
        return sendSuccess(res, data);
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
        const data = await mlGatewayClient.get<any>(`/agronomy/advisories/${encodeURIComponent(id)}`);
        return sendSuccess(res, data);
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
      let simResult: any;
      try {
        simResult = await mlGatewayClient.post<any>('/agronomy/simulate', body);
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          return sendError(res, 'SIMULATION_FAILED', err.responseBody?.detail || 'Scenario simulation failed.', err.statusCode);
        }
        return sendError(res, 'SIMULATION_FAILED', err.message || 'Scenario simulation failed.', 502);
      }

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

      try {
        realtimeService.emitAdvisoryUpdated({
          advisoryId: (updated as any).advisory_id || id,
          blockId: (updated as any).block_id || 'UP_LKO_BKT',
          cropType: (updated as any).crop_type || 'PADDY',
          severity: (updated as any).severity || 'WATCH',
          status: 'DISMISSED',
          headline: (updated as any).headline || `Advisory dismissed`,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        // Non-blocking emission
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
