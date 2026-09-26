import { query } from '../db/pool';
import { Advisory } from '../models/Advisory';
import { isDatabaseConnected } from '../config/database';

export interface LocalizedAdvisoryRow {
  id: string;
  advisory_id: string;
  language: string;
  title: string;
  summary: string;
  risk_indicator: string;
  what_it_means: string;
  evidence: any;
  confidence_statement: string;
  disclosure: string;
  historical_limitation_disclosure: string;
  classification: string;
  translation_method: string;
  template_version: string;
  terminology_version: string;
  localization_fingerprint: string;
  created_at: Date;
}

export interface AdvisoryReadRow {
  id: string;
  advisory_id: string;
  user_id: string | null;
  language: string;
  device_channel: string;
  read_at: Date;
}

export interface VoiceSynthesisLogRow {
  id: string;
  advisory_id: string;
  language: string;
  provider: string;
  status: string;
  duration_seconds: number;
  requested_at: Date;
}

export const localizationRepository = {
  async saveLocalizedAdvisory(data: Omit<LocalizedAdvisoryRow, 'id' | 'created_at'>): Promise<LocalizedAdvisoryRow> {
    if (isDatabaseConnected()) {
      try {
        const localizedItem = {
          language: data.language as 'EN' | 'HI',
          title: data.title,
          summary: data.summary,
          riskIndicator: data.risk_indicator,
          whatItMeans: data.what_it_means,
          confidenceStatement: data.confidence_statement,
          disclosure: data.disclosure,
          historicalLimitationDisclosure: data.historical_limitation_disclosure,
          translationMethod: data.translation_method || 'CONTROLLED_TEMPLATE',
          templateVersion: data.template_version || '1.0.0',
          terminologyVersion: data.terminology_version || '1.0.0',
          localizationFingerprint: data.localization_fingerprint,
        };

        await Advisory.findOneAndUpdate(
          { advisoryId: data.advisory_id },
          {
            $pull: { localizations: { language: data.language } },
          }
        );
        await Advisory.findOneAndUpdate(
          { advisoryId: data.advisory_id },
          {
            $push: { localizations: localizedItem },
          }
        );
      } catch (err) {
        // Fallback
      }
    }

    const sql = `
      INSERT INTO localized_advisories (
        advisory_id, language, title, summary, risk_indicator, what_it_means,
        evidence, confidence_statement, disclosure, historical_limitation_disclosure,
        classification, translation_method, template_version, terminology_version,
        localization_fingerprint
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (advisory_id, language) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        risk_indicator = EXCLUDED.risk_indicator,
        what_it_means = EXCLUDED.what_it_means,
        evidence = EXCLUDED.evidence,
        confidence_statement = EXCLUDED.confidence_statement,
        disclosure = EXCLUDED.disclosure,
        historical_limitation_disclosure = EXCLUDED.historical_limitation_disclosure,
        localization_fingerprint = EXCLUDED.localization_fingerprint,
        created_at = NOW()
      RETURNING *;
    `;
    const res = await query(sql, [
      data.advisory_id,
      data.language,
      data.title,
      data.summary,
      data.risk_indicator,
      data.what_it_means,
      JSON.stringify(data.evidence || {}),
      data.confidence_statement,
      data.disclosure,
      data.historical_limitation_disclosure,
      data.classification || 'DIAGNOSTIC_ONLY',
      data.translation_method || 'CONTROLLED_TEMPLATE',
      data.template_version || '1.0.0',
      data.terminology_version || '1.0.0',
      data.localization_fingerprint,
    ]);
    return res.rows[0];
  },

  async getLocalizedAdvisory(advisoryId: string, language: string): Promise<LocalizedAdvisoryRow | null> {
    if (isDatabaseConnected()) {
      try {
        const adv = await Advisory.findOne({ advisoryId });
        if (adv && adv.localizations) {
          const loc = adv.localizations.find((l) => l.language === language.toUpperCase());
          if (loc) {
            return {
              id: `${advisoryId}_${loc.language}`,
              advisory_id: advisoryId,
              language: loc.language,
              title: loc.title,
              summary: loc.summary,
              risk_indicator: loc.riskIndicator,
              what_it_means: loc.whatItMeans,
              evidence: adv.evidence || {},
              confidence_statement: loc.confidenceStatement,
              disclosure: loc.disclosure,
              historical_limitation_disclosure: loc.historicalLimitationDisclosure || '',
              classification: 'DIAGNOSTIC_ONLY',
              translation_method: loc.translationMethod,
              template_version: loc.templateVersion,
              terminology_version: loc.terminologyVersion,
              localization_fingerprint: loc.localizationFingerprint,
              created_at: adv.createdAt,
            };
          }
        }
      } catch (err) {
        // Fallback
      }
    }

    const sql = `
      SELECT * FROM localized_advisories
      WHERE advisory_id = $1 AND language = $2
      LIMIT 1;
    `;
    const res = await query(sql, [advisoryId, language]);
    return res.rows[0] || null;
  },

  async listLocalizedAdvisories(language: string = 'HI', limit: number = 50): Promise<LocalizedAdvisoryRow[]> {
    const sql = `
      SELECT * FROM localized_advisories
      WHERE language = $1
      ORDER BY created_at DESC
      LIMIT $2;
    `;
    const res = await query(sql, [language, limit]);
    return res.rows;
  },

  async recordReadReceipt(
    advisoryId: string,
    userId: string | null = null,
    language: string = 'EN',
    deviceChannel: string = 'WEB_PORTAL'
  ): Promise<AdvisoryReadRow> {
    if (isDatabaseConnected()) {
      try {
        await Advisory.findOneAndUpdate(
          { advisoryId },
          {
            $push: {
              readReceipts: {
                language,
                deviceChannel,
                readAt: new Date(),
              },
            },
          }
        );
      } catch (err) {
        // Fallback
      }
    }

    const sql = `
      INSERT INTO advisory_reads (advisory_id, user_id, language, device_channel)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await query(sql, [advisoryId, userId, language, deviceChannel]);
    return res.rows[0];
  },

  async getReadReceipts(advisoryId: string): Promise<AdvisoryReadRow[]> {
    if (isDatabaseConnected()) {
      try {
        const adv = await Advisory.findOne({ advisoryId });
        if (adv && adv.readReceipts) {
          return adv.readReceipts.map((r, idx) => ({
            id: `${advisoryId}_read_${idx}`,
            advisory_id: advisoryId,
            user_id: r.userId ? r.userId.toString() : null,
            language: r.language,
            device_channel: r.deviceChannel,
            read_at: r.readAt,
          }));
        }
      } catch (err) {
        // Fallback
      }
    }

    const sql = `
      SELECT * FROM advisory_reads
      WHERE advisory_id = $1
      ORDER BY read_at DESC;
    `;
    const res = await query(sql, [advisoryId]);
    return res.rows;
  },

  async recordVoiceSynthesisLog(
    advisoryId: string,
    language: string,
    provider: string,
    status: string,
    durationSeconds: number
  ): Promise<VoiceSynthesisLogRow> {
    const sql = `
      INSERT INTO voice_synthesis_logs (advisory_id, language, provider, status, duration_seconds)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const res = await query(sql, [advisoryId, language, provider, status, durationSeconds]);
    return res.rows[0];
  },

  async getVoiceLogs(limit: number = 50): Promise<VoiceSynthesisLogRow[]> {
    const sql = `
      SELECT * FROM voice_synthesis_logs
      ORDER BY requested_at DESC
      LIMIT $1;
    `;
    const res = await query(sql, [limit]);
    return res.rows;
  },
};
