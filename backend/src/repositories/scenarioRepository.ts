import { query } from '../db/pool';

export interface ScenarioRunRecord {
  id: string;
  scenario_id: string;
  user_id: string | null;
  block_id: string;
  crop_type: string;
  growth_stage: string;
  scenario_type: string;
  classification: string;
  baseline_forecast_id: string;
  scenario_parameters: any;
  scenario_results: any;
  deltas: any;
  envelope: any;
  explanation: any;
  provenance: any;
  scientific_disclaimer: string;
  indicator_only_ack: boolean;
  created_at: Date;
}

export interface ScenarioComparisonRecord {
  id: string;
  scenario_id: string;
  baseline_reference: string;
  scenario_type: string;
  crop: string;
  crop_stage: string;
  applicability: string;
  deltas: any;
  envelope: any;
  explanation: any;
  provenance: any;
  scientific_disclaimer: string;
  created_at: Date;
}

export interface ScenarioSensitivityRecord {
  id: string;
  scenario_id: string;
  scenario_type: string;
  parameter_name: string;
  parameter_range: any;
  curve_points: any;
  envelope: any;
  scientific_notes: any;
  created_at: Date;
}

export const scenarioRepository = {
  async insertScenario(data: {
    scenario_id: string;
    user_id?: string | null;
    block_id: string;
    crop: string;
    crop_stage: string;
    scenario_type: string;
    classification?: string;
    baseline_forecast_id?: string;
    inputs: any;
    baseline_summary: any;
    simulated_summary: any;
    hypothetical_risk_indicators: any;
    deltas: any;
    envelope?: any;
    explanation?: any;
    provenance?: any;
    scientific_disclaimer?: string;
  }): Promise<ScenarioRunRecord | null> {
    try {
      const sql = `
        INSERT INTO scenario_runs (
          scenario_id, user_id, block_id, crop_type, growth_stage,
          scenario_type, classification, baseline_forecast_id,
          scenario_parameters, scenario_results, deltas, envelope,
          explanation, provenance, scientific_disclaimer, indicator_only_ack
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (scenario_id) DO UPDATE SET
          scenario_results = EXCLUDED.scenario_results,
          deltas = EXCLUDED.deltas,
          envelope = EXCLUDED.envelope,
          explanation = EXCLUDED.explanation,
          provenance = EXCLUDED.provenance
        RETURNING *
      `;
      const values = [
        data.scenario_id,
        data.user_id || null,
        data.block_id,
        data.crop,
        data.crop_stage,
        data.scenario_type || 'SOWING_DELAY',
        data.classification || 'SCENARIO_INDICATOR_ONLY',
        data.baseline_forecast_id || 'fc_kharif2024_anchor',
        JSON.stringify(data.inputs || {}),
        JSON.stringify({
          baseline_summary: data.baseline_summary,
          simulated_summary: data.simulated_summary,
          hypothetical_risk_indicators: data.hypothetical_risk_indicators,
        }),
        JSON.stringify(data.deltas || []),
        data.envelope ? JSON.stringify(data.envelope) : null,
        data.explanation ? JSON.stringify(data.explanation) : null,
        data.provenance ? JSON.stringify(data.provenance) : null,
        data.scientific_disclaimer || 'This scenario evaluates meteorological and agro-meteorological sensitivity indicators only. It does NOT predict crop yields, biomass production, revenue, or guaranteed agronomic outcomes.',
        true,
      ];
      const res = await query(sql, values);
      return res.rows[0];
    } catch (error) {
      console.warn('Scenario persistence error:', error);
      return null;
    }
  },

  async getScenarioById(scenarioId: string): Promise<ScenarioRunRecord | null> {
    try {
      const res = await query('SELECT * FROM scenario_runs WHERE scenario_id = $1', [scenarioId]);
      return res.rows[0] || null;
    } catch (error) {
      console.warn('Get scenario by id error:', error);
      return null;
    }
  },

  async listScenarios(limit = 20): Promise<ScenarioRunRecord[]> {
    try {
      const res = await query(
        'SELECT * FROM scenario_runs ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      return res.rows;
    } catch (error) {
      console.warn('List scenarios error:', error);
      return [];
    }
  },

  async insertComparison(data: {
    scenario_id: string;
    baseline_reference: string;
    scenario_type: string;
    crop: string;
    crop_stage: string;
    applicability?: string;
    deltas: any;
    envelope?: any;
    explanation?: any;
    provenance?: any;
    scientific_disclaimer?: string;
  }): Promise<ScenarioComparisonRecord | null> {
    try {
      const sql = `
        INSERT INTO scenario_comparisons (
          scenario_id, baseline_reference, scenario_type, crop, crop_stage,
          applicability, deltas, envelope, explanation, provenance, scientific_disclaimer
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const values = [
        data.scenario_id,
        data.baseline_reference,
        data.scenario_type,
        data.crop,
        data.crop_stage,
        data.applicability || 'APPLICABLE',
        JSON.stringify(data.deltas || []),
        data.envelope ? JSON.stringify(data.envelope) : null,
        JSON.stringify(data.explanation || {}),
        JSON.stringify(data.provenance || {}),
        data.scientific_disclaimer || 'This scenario evaluates meteorological and agro-meteorological sensitivity indicators only. It does NOT predict crop yields, biomass production, revenue, or guaranteed agronomic outcomes.',
      ];
      const res = await query(sql, values);
      return res.rows[0];
    } catch (error) {
      console.warn('Insert scenario comparison error:', error);
      return null;
    }
  },

  async insertSensitivity(data: {
    scenario_id: string;
    scenario_type: string;
    parameter_name: string;
    parameter_range: any;
    curve_points: any;
    envelope: any;
    scientific_notes?: any;
  }): Promise<ScenarioSensitivityRecord | null> {
    try {
      const sql = `
        INSERT INTO scenario_sensitivities (
          scenario_id, scenario_type, parameter_name, parameter_range,
          curve_points, envelope, scientific_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [
        data.scenario_id,
        data.scenario_type,
        data.parameter_name,
        JSON.stringify(data.parameter_range || []),
        JSON.stringify(data.curve_points || []),
        JSON.stringify(data.envelope || {}),
        JSON.stringify(data.scientific_notes || []),
      ];
      const res = await query(sql, values);
      return res.rows[0];
    } catch (error) {
      console.warn('Insert scenario sensitivity error:', error);
      return null;
    }
  },
};
