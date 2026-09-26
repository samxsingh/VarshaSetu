import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';
import { scenarioRepository } from '../repositories/scenarioRepository';
import { mlGatewayClient, GatewayResponseError } from '../services/ml';

export const scenarioController = {
  async getRegistry(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const data = await mlGatewayClient.get<any>('/agronomy/scenario-registry');
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      // Hardcoded fallback conforming to controlled catalog
      return sendSuccess(res, {
        status: 'active',
        phase: 'PHASE_5B_ADVANCED_SCENARIO_ANALYSIS',
        classification: 'SCENARIO_INDICATOR_ONLY',
        total_scenario_types: 6,
        registry: [
          {
            scenario_type: 'SOWING_DELAY',
            display_name: 'Sowing Date Delay Simulation',
            description: 'Explores sensitivity of moisture stress to delayed sowing dates [1, 21 days].',
            allowed_parameters: { delay_days: { type: 'int', min: 1, max: 21, default: 7 } },
            evaluated_indicators: ['moisture_stress_pct', 'dry_spell_exposure_days'],
            max_dimensions: 1,
          },
          {
            scenario_type: 'IRRIGATION_INTERVENTION',
            display_name: 'Supplemental Irrigation Intervention',
            description: 'Evaluates moisture stress alleviation from scheduled supplemental irrigation.',
            allowed_parameters: {
              intervention_start_day: { type: 'int', min: 1, max: 30, default: 5 },
              intervention_frequency: { type: 'int', min: 1, max: 7, default: 3 },
              intervention_duration: { type: 'int', min: 1, max: 5, default: 2 },
            },
            evaluated_indicators: ['moisture_stress_pct', 'cumulative_rain_mm'],
            max_dimensions: 1,
          },
          {
            scenario_type: 'SEASONAL_ANOMALY',
            display_name: 'Seasonal Rainfall Anomaly',
            description: 'Evaluates seasonal precipitation shifts from -60% to +60%.',
            allowed_parameters: { rainfall_anomaly_pct: { type: 'float', min: -60.0, max: 60.0, default: 0.0 } },
            evaluated_indicators: ['cumulative_rain_mm', 'moisture_stress_pct', 'waterlogging_risk_pct'],
            max_dimensions: 1,
          },
          {
            scenario_type: 'RAINFALL_TIMING_SHIFT',
            display_name: 'Monsoon Intra-Seasonal Timing Shift',
            description: 'Simulates forward or backward intra-seasonal rainfall timing shifts [-14, +14 days].',
            allowed_parameters: { shift_days: { type: 'int', min: -14, max: 14, default: 0 } },
            evaluated_indicators: ['dry_spell_exposure_days', 'moisture_stress_pct'],
            max_dimensions: 1,
          },
          {
            scenario_type: 'HEAVY_RAIN_CONCENTRATION',
            display_name: 'Extreme Rainfall Concentration',
            description: 'Explores waterlogging sensitivity to concentrated precipitation pulses [1.0x - 2.5x].',
            allowed_parameters: { concentration_factor: { type: 'float', min: 1.0, max: 2.5, default: 1.5 } },
            evaluated_indicators: ['waterlogging_risk_pct', 'cumulative_rain_mm'],
            max_dimensions: 1,
          },
          {
            scenario_type: 'COMBINED_SCENARIO',
            display_name: 'Combined Multi-Hazard Scenario',
            description: 'Evaluates up to 3 orthogonal meteorological adjustments simultaneously.',
            allowed_parameters: { combined_types: { type: 'list', min_items: 2, max_items: 3 } },
            evaluated_indicators: ['moisture_stress_pct', 'waterlogging_risk_pct', 'dry_spell_exposure_days'],
            max_dimensions: 3,
          },
        ],
        scientific_disclaimer:
          'This scenario evaluates meteorological and agro-meteorological sensitivity indicators only. It does NOT predict crop yields, biomass production, revenue, or guaranteed agronomic outcomes.',
      });
    } catch (error) {
      next(error);
    }
  },

  async listScenarios(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 20;
      try {
        const data = await mlGatewayClient.get<any>('/agronomy/scenarios', { query: { limit } });
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      const rows = await scenarioRepository.listScenarios(limit);
      return sendSuccess(res, {
        total_scenarios: rows.length,
        scenarios: rows,
      });
    } catch (error) {
      next(error);
    }
  },

  async getScenarioById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      try {
        const data = await mlGatewayClient.get<any>(`/agronomy/scenarios/${encodeURIComponent(id)}`);
        return sendSuccess(res, data);
      } catch (e) {
        // Fallback
      }

      const row = await scenarioRepository.getScenarioById(id);
      if (row) {
        return sendSuccess(res, row);
      }
      return sendError(res, 'NOT_FOUND', `Scenario '${id}' not found.`, 404);
    } catch (error) {
      next(error);
    }
  },

  async runScenario(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      let result: any;
      try {
        result = await mlGatewayClient.post<any>('/agronomy/scenarios/run', body);
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          const detail = err.responseBody?.detail || err.responseBody?.message || 'Scenario simulation blocked by safety gate.';
          return sendError(res, 'SCENARIO_BLOCKED', detail, err.statusCode);
        }
        return sendError(res, 'SCENARIO_BLOCKED', err.message || 'Scenario simulation failed', 502);
      }

      // Persist in repository
      await scenarioRepository.insertScenario({
        scenario_id: result.scenario_id,
        user_id: req.user?.id || null,
        block_id: result.block_id || body.block_id || 'UP_LKO_BKT',
        crop: result.crop || body.crop || 'GENERAL',
        crop_stage: result.crop_stage || body.crop_stage || 'VEGETATIVE',
        scenario_type: result.scenario_type || body.scenario_type || 'SOWING_DELAY',
        classification: result.classification || 'SCENARIO_INDICATOR_ONLY',
        inputs: result.inputs || body,
        baseline_summary: result.baseline_summary || {},
        simulated_summary: result.simulated_summary || {},
        hypothetical_risk_indicators: result.hypothetical_risk_indicators || [],
        deltas: result.deltas || [],
        envelope: result.envelope || null,
        explanation: result.explanation || null,
        provenance: result.provenance || null,
        scientific_disclaimer: result.scientific_disclaimer,
      });

      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async compareScenario(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      let comparison: any;
      try {
        comparison = await mlGatewayClient.post<any>('/agronomy/scenarios/compare', body);
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          const detail = err.responseBody?.detail || err.responseBody?.message || 'Scenario comparison failed.';
          return sendError(res, 'COMPARISON_FAILED', detail, err.statusCode);
        }
        return sendError(res, 'COMPARISON_FAILED', err.message || 'Scenario comparison failed.', 502);
      }

      // Persist comparison
      await scenarioRepository.insertComparison({
        scenario_id: comparison.scenario_id,
        baseline_reference: comparison.baseline_reference,
        scenario_type: comparison.scenario_type,
        crop: comparison.crop,
        crop_stage: comparison.crop_stage,
        applicability: comparison.applicability,
        deltas: comparison.deltas,
        envelope: comparison.envelope,
        explanation: comparison.explanation,
        provenance: comparison.provenance,
        scientific_disclaimer: comparison.scientific_disclaimer,
      });

      return sendSuccess(res, comparison);
    } catch (error) {
      next(error);
    }
  },

  async runSensitivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      let sens: any;
      try {
        sens = await mlGatewayClient.post<any>('/agronomy/scenarios/sensitivity', body);
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          const detail = err.responseBody?.detail || err.responseBody?.message || 'Sensitivity analysis failed.';
          return sendError(res, 'SENSITIVITY_FAILED', detail, err.statusCode);
        }
        return sendError(res, 'SENSITIVITY_FAILED', err.message || 'Sensitivity analysis failed.', 502);
      }

      // Persist sensitivity
      await scenarioRepository.insertSensitivity({
        scenario_id: sens.scenario_id,
        scenario_type: sens.scenario_type,
        parameter_name: sens.parameter_name,
        parameter_range: sens.parameter_range,
        curve_points: sens.curve_points,
        envelope: sens.envelope,
        scientific_notes: sens.scientific_notes,
      });

      return sendSuccess(res, sens);
    } catch (error) {
      next(error);
    }
  },

  async getScenarioSensitivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      try {
        const data = await mlGatewayClient.get<any>(`/agronomy/scenarios/${encodeURIComponent(id)}/sensitivity`);
        return sendSuccess(res, data);
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          return sendError(res, 'NOT_FOUND', err.responseBody?.detail || 'Sensitivity data not found.', err.statusCode);
        }
        return sendError(res, 'NOT_FOUND', 'Sensitivity data not found.', 404);
      }
    } catch (error) {
      next(error);
    }
  },

  async getScenarioExplanation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      try {
        const data = await mlGatewayClient.get<any>(`/agronomy/scenarios/${encodeURIComponent(id)}/explanation`);
        return sendSuccess(res, data);
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          return sendError(res, 'NOT_FOUND', err.responseBody?.detail || 'Explanation not found.', err.statusCode);
        }
        return sendError(res, 'NOT_FOUND', 'Explanation not found.', 404);
      }
    } catch (error) {
      next(error);
    }
  },

  async getScenarioProvenance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      try {
        const data = await mlGatewayClient.get<any>(`/agronomy/scenarios/${encodeURIComponent(id)}/provenance`);
        return sendSuccess(res, data);
      } catch (err: any) {
        if (err instanceof GatewayResponseError) {
          return sendError(res, 'NOT_FOUND', err.responseBody?.detail || 'Provenance not found.', err.statusCode);
        }
        return sendError(res, 'NOT_FOUND', 'Provenance not found.', 404);
      }
    } catch (error) {
      next(error);
    }
  },
};
