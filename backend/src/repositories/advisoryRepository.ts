import { query } from '../db/pool';
import { Advisory, IAdvisory } from '../models/Advisory';
import { Scenario } from '../models/Scenario';
import { isDatabaseConnected } from '../config/database';

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

function docToAdvisoryRow(doc: IAdvisory): AgronomicAdvisoryRow {
  const meta: any = doc.metadata || {};
  return {
    id: (doc._id as any).toString(),
    advisory_id: doc.advisoryId,
    forecast_id: doc.forecastId,
    block_id: doc.blockId,
    crop_type: doc.cropType,
    growth_stage: doc.growthStage,
    rule_id: doc.ruleId,
    rule_name: (meta.ruleName as string) || doc.ruleId,
    severity: doc.severity,
    category: doc.riskCategory,
    headline: (meta.headline as string) || (doc.localizations?.[0]?.title || 'Agro-Meteorological Advisory'),
    advisory_text: doc.actionRecommendation,
    valid_from: (meta.validFrom as string) || new Date().toISOString(),
    valid_until: (meta.validUntil as string) || new Date(Date.now() + 7 * 86400000).toISOString(),
    operational_status: (meta.operationalStatus as string) || 'DIAGNOSTIC_ONLY',
    scientific_basis: doc.scientificRationale,
    uncertainty_caveat: (meta.uncertaintyCaveat as string) || 'Based on empirical Kharif 2024 distribution',
    confidence_status: (meta.confidenceStatus as string) || 'CALIBRATED',
    evidence: doc.evidence || {},
    explanation: (meta.explanation as any) || {},
    deduplication_hash: doc.deduplicationHash || '',
    status: doc.status,
    created_at: doc.createdAt || new Date(),
    updated_at: doc.updatedAt || new Date(),
  };
}

export const advisoryRepository = {
  async listAdvisories(filters: {
    block_id?: string;
    crop_type?: string;
    severity?: string;
    status?: string;
    limit?: number;
  } = {}): Promise<AgronomicAdvisoryRow[]> {
    if (isDatabaseConnected()) {
      try {
        const mongoFilter: any = {};
        if (filters.block_id) mongoFilter.blockId = filters.block_id;
        if (filters.crop_type) mongoFilter.cropType = filters.crop_type.toUpperCase();
        if (filters.severity) mongoFilter.severity = filters.severity.toUpperCase();
        if (filters.status) mongoFilter.status = filters.status.toUpperCase();

        const limit = filters.limit || 50;
        const docs = await Advisory.find(mongoFilter).sort({ createdAt: -1 }).limit(limit);
        return docs.map(docToAdvisoryRow);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

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

      const result = await query<AgronomicAdvisoryRow>(sql, params);
      return result.rows;
    } catch (error) {
      console.warn('Advisory query fallback: table empty or database unpopulated', error);
      return [];
    }
  },

  async getAdvisoryById(advisoryId: string): Promise<AgronomicAdvisoryRow | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await Advisory.findOne({ advisoryId });
        if (doc) return docToAdvisoryRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

    try {
      const sql = `SELECT * FROM agronomic_advisories WHERE advisory_id = $1 LIMIT 1`;
      const result = await query<AgronomicAdvisoryRow>(sql, [advisoryId]);
      return result.rows[0] || null;
    } catch (error) {
      return null;
    }
  },

  async insertAdvisory(data: Partial<AgronomicAdvisoryRow>): Promise<AgronomicAdvisoryRow | null> {
    if (isDatabaseConnected() && data.advisory_id) {
      try {
        const doc = await Advisory.findOneAndUpdate(
          { advisoryId: data.advisory_id },
          {
            advisoryId: data.advisory_id,
            ruleId: data.rule_id || 'RULE_DEFAULT',
            forecastId: data.forecast_id || '',
            blockId: data.block_id || '',
            cropType: (data.crop_type || '').toUpperCase(),
            growthStage: (data.growth_stage || '').toUpperCase(),
            riskCategory: data.category || 'AGRONOMIC',
            severity: (data.severity || 'INFO') as any,
            actionRecommendation: data.advisory_text || '',
            scientificRationale: data.scientific_basis || '',
            evidence: data.evidence || {},
            safetyGatePassed: true,
            status: (data.status || 'ACTIVE') as any,
            deduplicationHash: data.deduplication_hash || '',
            metadata: {
              ruleName: data.rule_name,
              headline: data.headline,
              validFrom: data.valid_from,
              validUntil: data.valid_until,
              operationalStatus: data.operational_status,
              uncertaintyCaveat: data.uncertainty_caveat,
              confidenceStatus: data.confidence_status,
              explanation: data.explanation,
            },
          },
          { upsert: true, new: true }
        );
        if (doc) return docToAdvisoryRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

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
      const result = await query<AgronomicAdvisoryRow>(sql, values);
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
      const result = await query<AgronomicRuleEvaluationRow>(sql, values);
      return result.rows[0];
    } catch (error) {
      console.warn('Rule evaluation insertion error:', error);
      return null;
    }
  },

  async insertScenarioRun(data: Partial<ScenarioRunRow>): Promise<ScenarioRunRow | null> {
    if (isDatabaseConnected() && data.scenario_id) {
      try {
        const scDoc = await Scenario.findOneAndUpdate(
          { scenarioId: data.scenario_id },
          {
            scenarioId: data.scenario_id,
            blockId: data.block_id || '',
            cropType: (data.crop_type || '').toUpperCase(),
            growthStage: (data.growth_stage || '').toUpperCase(),
            baselineForecastId: data.baseline_forecast_id || '',
            scenarioType: 'SOWING_DELAY',
            classification: 'SCENARIO_INDICATOR_ONLY',
            scenarioParameters: data.scenario_parameters || {},
            scenarioResults: data.scenario_results || {},
            scientificDisclaimer:
              'This scenario evaluates meteorological and agro-meteorological sensitivity indicators only. It does NOT predict crop yields, biomass production, revenue, or guaranteed agronomic outcomes.',
          },
          { upsert: true, new: true }
        );
        if (scDoc) {
          return {
            id: (scDoc._id as any).toString(),
            scenario_id: scDoc.scenarioId,
            user_id: data.user_id || null,
            block_id: scDoc.blockId,
            crop_type: scDoc.cropType,
            growth_stage: scDoc.growthStage,
            baseline_forecast_id: scDoc.baselineForecastId,
            scenario_parameters: scDoc.scenarioParameters,
            scenario_results: scDoc.scenarioResults,
            indicator_only_ack: true,
            created_at: scDoc.createdAt || new Date(),
          };
        }
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

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
      const result = await query<ScenarioRunRow>(sql, values);
      return result.rows[0];
    } catch (error) {
      console.warn('Scenario run insertion error:', error);
      return null;
    }
  },

  async updateAdvisoryStatus(advisoryId: string, status: string): Promise<AgronomicAdvisoryRow | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await Advisory.findOneAndUpdate(
          { advisoryId },
          { status: status.toUpperCase() as any, updatedAt: new Date() },
          { new: true }
        );
        if (doc) return docToAdvisoryRow(doc);
      } catch (err) {
        // Fallback to PostgreSQL
      }
    }

    try {
      const sql = `
        UPDATE agronomic_advisories
        SET status = $1, updated_at = NOW()
        WHERE advisory_id = $2
        RETURNING *
      `;
      const result = await query<AgronomicAdvisoryRow>(sql, [status, advisoryId]);
      return result.rows[0] || null;
    } catch (error) {
      return null;
    }
  },
};
