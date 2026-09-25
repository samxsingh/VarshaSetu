import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';
import { scenarioRepository } from '../repositories/scenarioRepository';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const scenarioController = {
  async getRegistry(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/scenario-registry`);
        if (mlRes.ok) {
          const data: any = await mlRes.json();
          return sendSuccess(res, data);
        }
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
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/scenarios?limit=${limit}`);
        if (mlRes.ok) {
          const data: any = await mlRes.json();
          return sendSuccess(res, data);
        }
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
        const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/scenarios/${encodeURIComponent(id)}`);
        if (mlRes.ok) {
          const data: any = await mlRes.json();
          return sendSuccess(res, data);
        }
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
      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/scenarios/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!mlRes.ok) {
        const errData: any = await mlRes.json().catch(() => ({}));
        return sendError(
          res,
          'SCENARIO_BLOCKED',
          errData.detail || 'Scenario simulation blocked by safety gate.',
          mlRes.status
        );
      }

      const result: any = await mlRes.json();

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
      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/scenarios/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!mlRes.ok) {
        const errData: any = await mlRes.json().catch(() => ({}));
        return sendError(
          res,
          'COMPARISON_FAILED',
          errData.detail || 'Scenario comparison failed.',
          mlRes.status
        );
      }

      const comparison: any = await mlRes.json();

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
      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/scenarios/sensitivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!mlRes.ok) {
        const errData: any = await mlRes.json().catch(() => ({}));
        return sendError(
          res,
          'SENSITIVITY_FAILED',
          errData.detail || 'Sensitivity analysis failed.',
          mlRes.status
        );
      }

      const sens: any = await mlRes.json();

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
      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/scenarios/${encodeURIComponent(id)}/sensitivity`);
      if (!mlRes.ok) {
        const errData: any = await mlRes.json().catch(() => ({}));
        return sendError(res, 'NOT_FOUND', errData.detail || 'Sensitivity data not found.', mlRes.status);
      }
      const data: any = await mlRes.json();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getScenarioExplanation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/scenarios/${encodeURIComponent(id)}/explanation`);
      if (!mlRes.ok) {
        const errData: any = await mlRes.json().catch(() => ({}));
        return sendError(res, 'NOT_FOUND', errData.detail || 'Explanation not found.', mlRes.status);
      }
      const data: any = await mlRes.json();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getScenarioProvenance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mlRes = await fetch(`${ML_SERVICE_URL}/agronomy/scenarios/${encodeURIComponent(id)}/provenance`);
      if (!mlRes.ok) {
        const errData: any = await mlRes.json().catch(() => ({}));
        return sendError(res, 'NOT_FOUND', errData.detail || 'Provenance not found.', mlRes.status);
      }
      const data: any = await mlRes.json();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};
