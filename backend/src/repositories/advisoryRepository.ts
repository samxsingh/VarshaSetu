import { query } from '../db/pool';

export interface AgronomicAdvisoryRow {
  id: string;
  advisory_id: string;
  forecast_id: string;
  block_id: string;
  crop_type: string;
  growth_stage: string;
  rule_id: string;
  rule_name: string;
  severity: string;
  category: string;
  headline: string;
  advisory_text: string;
  valid_from: string;
  valid_until: string;
  operational_status: string;
  scientific_basis: string;
  uncertainty_caveat: string;
  confidence_status: string;
  evidence: any;
  explanation: any;
  deduplication_hash: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface AgronomicRuleEvaluationRow {
  id: string;
  evaluation_id: string;
  forecast_id: string;
  block_id: string;
  crop_type: string;
  growth_stage: string;
  safety_gate_passed: boolean;
  blocked_reasons: any;
  rules_evaluated: number;
  advisories_generated: number;
  evaluator: string;
  metadata: any;
  created_at: Date;
}

export interface ScenarioRunRow {
  id: string;
  scenario_id: string;
  user_id: string | null;
  block_id: string;
  crop_type: string;
  growth_stage: string;
  baseline_forecast_id: string;
  scenario_parameters: any;
  scenario_results: any;
  indicator_only_ack: boolean;
  created_at: Date;
}

export const advisoryRepository = {
  async listAdvisories(filters: {
    block_id?: string;
    crop_type?: string;
    severity?: string;
    status?: string;
    limit?: number;
  } = {}): Promise<AgronomicAdvisoryRow[]> {
    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters.block_id) {
        params.push(filters.block_id);
        conditions.push(`block_id = $${params.length}`);
      }

      if (filters.crop_type) {
        params.push(filters.crop_type.toUpperCase());
        conditions.push(`crop_type = $${params.length}`);
      }

      if (filters.severity) {
        params.push(filters.severity.toUpperCase());
        conditions.push(`severity = $${params.length}`);
      }

      if (filters.status) {
        params.push(filters.status.toUpperCase());
        conditions.push(`status = $${params.length}`);
      }

      const limit = filters.limit || 50;
      params.push(limit);

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const sql = `
        SELECT *
        FROM agronomic_advisories
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${params.length}
      `;

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      console.warn('Advisory query fallback: table empty or database unpopulated', error);
      return [];
    }
  },

  async getAdvisoryById(advisoryId: string): Promise<AgronomicAdvisoryRow | null> {
    try {
      const sql = `SELECT * FROM agronomic_advisories WHERE advisory_id = $1 LIMIT 1`;
      const result = await query(sql, [advisoryId]);
      return result.rows[0] || null;
    } catch (error) {
      return null;
    }
  },

  async insertAdvisory(data: Partial<AgronomicAdvisoryRow>): Promise<AgronomicAdvisoryRow | null> {
    try {
      const sql = `
        INSERT INTO agronomic_advisories (
          advisory_id, forecast_id, block_id, crop_type, growth_stage,
          rule_id, rule_name, severity, category, headline,
          advisory_text, valid_from, valid_until, operational_status,
          scientific_basis, uncertainty_caveat, confidence_status,
          evidence, explanation, deduplication_hash, status
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17,
          $18, $19, $20, $21
        )
        ON CONFLICT (advisory_id) DO UPDATE SET
          updated_at = NOW(),
          status = EXCLUDED.status
        RETURNING *
      `;
      const values = [
        data.advisory_id,
        data.forecast_id,
        data.block_id,
        data.crop_type,
        data.growth_stage,
        data.rule_id,
        data.rule_name,
        data.severity,
        data.category,
        data.headline,
        data.advisory_text,
        data.valid_from,
        data.valid_until,
        data.operational_status || 'DIAGNOSTIC_ONLY',
        data.scientific_basis,
        data.uncertainty_caveat,
        data.confidence_status,
        JSON.stringify(data.evidence || {}),
        JSON.stringify(data.explanation || {}),
        data.deduplication_hash,
        data.status || 'ACTIVE',
      ];
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.warn('Advisory insertion error:', error);
      return null;
    }
  },

  async insertRuleEvaluation(data: Partial<AgronomicRuleEvaluationRow>): Promise<AgronomicRuleEvaluationRow | null> {
    try {
      const sql = `
        INSERT INTO agronomic_rule_evaluations (
          evaluation_id, forecast_id, block_id, crop_type, growth_stage,
          safety_gate_passed, blocked_reasons, rules_evaluated,
          advisories_generated, evaluator, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const values = [
        data.evaluation_id,
        data.forecast_id,
        data.block_id,
        data.crop_type,
        data.growth_stage,
        data.safety_gate_passed,
        JSON.stringify(data.blocked_reasons || []),
        data.rules_evaluated || 0,
        data.advisories_generated || 0,
        data.evaluator || 'SYSTEM',
        JSON.stringify(data.metadata || {}),
      ];
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.warn('Rule evaluation insertion error:', error);
      return null;
    }
  },

  async insertScenarioRun(data: Partial<ScenarioRunRow>): Promise<ScenarioRunRow | null> {
    try {
      const sql = `
        INSERT INTO scenario_runs (
          scenario_id, user_id, block_id, crop_type, growth_stage,
          baseline_forecast_id, scenario_parameters, scenario_results, indicator_only_ack
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        data.scenario_id,
        data.user_id || null,
        data.block_id,
        data.crop_type,
        data.growth_stage,
        data.baseline_forecast_id,
        JSON.stringify(data.scenario_parameters || {}),
        JSON.stringify(data.scenario_results || {}),
        data.indicator_only_ack ?? true,
      ];
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.warn('Scenario run insertion error:', error);
      return null;
    }
  },

  async updateAdvisoryStatus(advisoryId: string, status: string): Promise<AgronomicAdvisoryRow | null> {
    try {
      const sql = `
        UPDATE agronomic_advisories
        SET status = $1, updated_at = NOW()
        WHERE advisory_id = $2
        RETURNING *
      `;
      const result = await query(sql, [status, advisoryId]);
      return result.rows[0] || null;
    } catch (error) {
      return null;
    }
  },
};
