import { query } from '../db/pool';
import { DataHealth, IDataHealth } from '../models/DataHealth';
import { isDatabaseConnected } from '../config/database';

export interface DataIngestionRunRow {
  id: string;
  source_id: string | null;
  source_name: string;
  provider: string;
  dataset_name: string;
  variable: string;
  started_at: Date;
  completed_at: Date | null;
  status: string;
  records_processed: number;
  records_failed: number;
  quality_summary: any;
  processing_version: string;
  error_message: string | null;
  file_path: string | null;
  coverage_start: string | null;
  coverage_end: string | null;
  spatial_resolution: string | null;
  temporal_resolution: string | null;
  created_at: Date;
}

export interface DataQualityReportRow {
  id: string;
  run_id: string;
  dataset_name: string;
  total_records: number;
  valid_records: number;
  missing_records: number;
  outlier_records: number;
  quality_score: number;
  quality_flag: string;
  details: any;
  created_at: Date;
}

export const dataIngestionRepository = {
  async listRuns(limit = 20, offset = 0, status?: string): Promise<{ runs: DataIngestionRunRow[]; total: number }> {
    if (isDatabaseConnected()) {
      try {
        const sources = await DataHealth.find();
        let allRuns: DataIngestionRunRow[] = [];
        for (const s of sources) {
          if (s.runs && s.runs.length > 0) {
            for (const r of s.runs) {
              if (!status || r.status === status.toUpperCase()) {
                allRuns.push({
                  id: r.runId,
                  source_id: s.sourceId,
                  source_name: s.name,
                  provider: s.provider,
                  dataset_name: s.name,
                  variable: r.variable,
                  started_at: r.startedAt,
                  completed_at: r.completedAt || null,
                  status: r.status,
                  records_processed: r.recordsProcessed || 0,
                  records_failed: r.recordsFailed || 0,
                  quality_summary: r.qualityReport || {},
                  processing_version: r.processingVersion,
                  error_message: r.errorMessage || null,
                  file_path: null,
                  coverage_start: r.coverageStart ? r.coverageStart.toISOString() : null,
                  coverage_end: r.coverageEnd ? r.coverageEnd.toISOString() : null,
                  spatial_resolution: r.spatialResolution || null,
                  temporal_resolution: null,
                  created_at: r.startedAt,
                });
              }
            }
          }
        }
        if (allRuns.length > 0) {
          allRuns.sort((a, b) => b.started_at.getTime() - a.started_at.getTime());
          const total = allRuns.length;
          const paged = allRuns.slice(offset, offset + limit);
          return { runs: paged, total };
        }
      } catch (err) {
        // Fallback
      }
    }

    const params: any[] = [];
    let whereClause = '';

    if (status) {
      params.push(status);
      whereClause = `WHERE status = $${params.length}`;
    }

    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM data_ingestion_runs ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const limitParamIndex = params.length + 1;
    const offsetParamIndex = params.length + 2;
    params.push(limit, offset);

    const res = await query<DataIngestionRunRow>(
      `SELECT * FROM data_ingestion_runs 
       ${whereClause} 
       ORDER BY started_at DESC 
       LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`,
      params
    );

    return { runs: res.rows, total };
  },

  async getRunById(id: string): Promise<{ run: DataIngestionRunRow; qualityReports: DataQualityReportRow[] } | null> {
    const runRes = await query<DataIngestionRunRow>(
      'SELECT * FROM data_ingestion_runs WHERE id = $1',
      [id]
    );

    if (!runRes.rows.length) {
      return null;
    }

    const reportsRes = await query<DataQualityReportRow>(
      'SELECT * FROM data_quality_reports WHERE run_id = $1 ORDER BY created_at ASC',
      [id]
    );

    return {
      run: runRes.rows[0],
      qualityReports: reportsRes.rows,
    };
  },

  async getOverview(): Promise<{
    totalSources: number;
    activeSources: number;
    freshSources: number;
    staleSources: number;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastSyncTime: Date | null;
    overallHealth: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'NO_DATA';
  }> {
    if (isDatabaseConnected()) {
      try {
        const sources = await DataHealth.find();
        if (sources.length > 0) {
          const totalSources = sources.length;
          const activeSources = sources.filter((s) => s.status === 'ACTIVE').length;
          const freshSources = sources.filter((s) => s.status === 'ACTIVE' && s.lastSuccessfulSync).length;
          let totalRuns = 0;
          let successfulRuns = 0;
          let failedRuns = 0;
          let lastSyncTime: Date | null = null;

          for (const s of sources) {
            if (s.lastSuccessfulSync && (!lastSyncTime || s.lastSuccessfulSync > lastSyncTime)) {
              lastSyncTime = s.lastSuccessfulSync;
            }
            if (s.runs) {
              totalRuns += s.runs.length;
              successfulRuns += s.runs.filter((r) => r.status === 'SUCCESS').length;
              failedRuns += s.runs.filter((r) => r.status === 'FAILED').length;
            }
          }

          let overallHealth: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'NO_DATA' = 'HEALTHY';
          if (failedRuns > 0 && successfulRuns > 0) overallHealth = 'DEGRADED';
          else if (failedRuns > 0 && successfulRuns === 0) overallHealth = 'UNHEALTHY';

          return {
            totalSources,
            activeSources,
            freshSources,
            staleSources: activeSources - freshSources,
            totalRuns,
            successfulRuns,
            failedRuns,
            lastSyncTime,
            overallHealth,
          };
        }
      } catch (err) {
        // Fallback
      }
    }

    const sourcesRes = await query<{
      total: string;
      fresh: string;
      inactive: string;
    }>(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'FRESH') as fresh,
        COUNT(*) FILTER (WHERE status = 'INACTIVE') as inactive
      FROM data_sources;
    `);

    const runsRes = await query<{
      total: string;
      success: string;
      failed: string;
      last_sync: Date | null;
    }>(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'SUCCESS') as success,
        COUNT(*) FILTER (WHERE status = 'FAILED') as failed,
        MAX(completed_at) as last_sync
      FROM data_ingestion_runs;
    `);

    const sRow = sourcesRes.rows[0];
    const rRow = runsRes.rows[0];

    const totalSources = parseInt(sRow?.total || '0', 10);
    const freshSources = parseInt(sRow?.fresh || '0', 10);
    const inactiveSources = parseInt(sRow?.inactive || '0', 10);
    const activeSources = totalSources - inactiveSources;

    const totalRuns = parseInt(rRow?.total || '0', 10);
    const successfulRuns = parseInt(rRow?.success || '0', 10);
    const failedRuns = parseInt(rRow?.failed || '0', 10);
    const lastSyncTime = rRow?.last_sync || null;

    let overallHealth: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'NO_DATA' = 'NO_DATA';
    if (totalRuns > 0) {
      if (failedRuns === 0 && freshSources > 0) {
        overallHealth = 'HEALTHY';
      } else if (successfulRuns > 0 && failedRuns > 0) {
        overallHealth = 'DEGRADED';
      } else if (successfulRuns === 0 && failedRuns > 0) {
        overallHealth = 'UNHEALTHY';
      } else {
        overallHealth = 'HEALTHY';
      }
    }

    return {
      totalSources,
      activeSources,
      freshSources,
      staleSources: activeSources - freshSources,
      totalRuns,
      successfulRuns,
      failedRuns,
      lastSyncTime,
      overallHealth,
    };
  },
};
