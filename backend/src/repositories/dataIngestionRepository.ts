import { query } from '../db/pool';

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
  }
};
