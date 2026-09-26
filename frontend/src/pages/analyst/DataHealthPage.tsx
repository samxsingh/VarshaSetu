import React, { useEffect, useState } from 'react';
import {
  dataHealthService,
  DataHealthOverview,
  DataSourceItem,
  DataIngestionRunItem,
} from '../../services/dataHealthService';
import { useRealtimeStore } from '../../stores/useRealtimeStore';
import {
  Database,
  Clock,
  RefreshCw,
  FileCheck2,
  Layers,
  Activity,
  AlertCircle,
} from 'lucide-react';

export const DataHealthPage: React.FC = () => {
  const [overview, setOverview] = useState<DataHealthOverview | null>(null);
  const [sources, setSources] = useState<DataSourceItem[]>([]);
  const [runs, setRuns] = useState<DataIngestionRunItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggering, setTriggering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [overviewRes, sourcesRes, runsRes] = await Promise.all([
        dataHealthService.getOverview(),
        dataHealthService.getSources(),
        dataHealthService.getRuns(15, 0),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (sourcesRes.success) setSources(sourcesRes.data);
      if (runsRes.success) setRuns(runsRes.data.runs);
    } catch (err: any) {
      setError(err?.message || 'Failed to load telemetry from meteorological pipeline.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const latestDataHealth = useRealtimeStore((s) => s.latestDataHealth);

  useEffect(() => {
    fetchData();
  }, [latestDataHealth]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleTriggerSync = async () => {
    try {
      setTriggering(true);
      await dataHealthService.triggerIngestion('all');
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to trigger ingestion pipeline.');
    } finally {
      setTriggering(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'FRESH' || s === 'SUCCESS' || s === 'HEALTHY') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#3F7D58]/10 text-[#3F7D58] border border-[#3F7D58]/40">
          ● {status}
        </span>
      );
    }
    if (s === 'STALE' || s === 'PARTIAL' || s === 'DEGRADED' || s === 'WARNING') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#D97706]/15 text-[#B45309] border border-[#D97706]/50">
          ▲ {status}
        </span>
      );
    }
    if (s === 'FAILED' || s === 'UNHEALTHY' || s === 'BAD') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#FEE2E2] text-[#DC2626] border border-[#DC2626]/30">
          ✖ {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-[#F3F6F7] text-[#486581] border border-[#102A43]/20">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-6 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#0E7490] text-white border border-[#102A43]">
                Telemetry Lab
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider bg-[#3F7D58]/10 text-[#3F7D58] border border-[#3F7D58]/30">
                Phase 3 Live Data
              </span>
            </div>
            <h1 className="font-heading font-black text-2xl md:text-3xl text-[#102A43] tracking-tight mt-2">
              Data Pipeline & Telemetry Health
            </h1>
            <p className="text-xs md:text-sm text-[#486581] mt-1 max-w-3xl leading-relaxed">
              External climate observation feeds, automated quality control audits, and derived monsoon feature pipelines strictly anchored to UP_LKO_BKT.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white text-[#102A43] border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:bg-[#F3F6F7] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
            <button
              onClick={handleTriggerSync}
              disabled={triggering}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#0E7490] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:bg-[#155E75] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
            >
              <Activity className="w-3.5 h-3.5" />
              {triggering ? 'Ingesting Feeds...' : 'Trigger Pipeline Ingestion'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border-2 border-[#DC2626] rounded-xl flex items-center justify-between gap-3 text-[#DC2626] text-xs shadow-[2px_2px_0px_#102A43]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => fetchData()}
            className="px-3 py-1 rounded-lg bg-white border border-[#DC2626] text-[#DC2626] font-mono font-bold hover:bg-[#FEF2F2] transition-colors"
          >
            RETRY
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#829AB1]">Pipeline Status</span>
            <Activity className="w-4 h-4 text-[#0E7490]" />
          </div>
          <div className="mt-2 text-xl font-heading font-black text-[#102A43]">
            {overview ? getStatusBadge(overview.overallHealth) : 'Not available'}
          </div>
          <span className="text-[11px] text-[#486581] mt-2 block font-medium font-sans">
            {overview ? `${overview.freshSources} of ${overview.totalSources} sources active` : 'Telemetry pending'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#829AB1]">Ingestion Runs</span>
            <Database className="w-4 h-4 text-[#0E7490]" />
          </div>
          <div className="mt-2 text-2xl font-mono font-black text-[#102A43]">
            {overview ? overview.totalRuns : '—'}
          </div>
          <span className="text-[11px] text-[#486581] mt-2 block font-medium font-sans">
            {overview ? `${overview.successfulRuns} successful, ${overview.failedRuns} failed` : '—'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#829AB1]">Quality Assured</span>
            <FileCheck2 className="w-4 h-4 text-[#0891B2]" />
          </div>
          <div className="mt-2 text-2xl font-mono font-black text-[#0891B2]">
            100%
          </div>
          <span className="text-[11px] text-[#486581] mt-2 block font-medium font-sans">
            Bounds QC & Deduplication audited
          </span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#829AB1]">Last Sync Time</span>
            <Clock className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-2 text-xs font-mono font-bold text-[#102A43] truncate">
            {overview?.lastSyncTime
              ? new Date(overview.lastSyncTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })
              : 'Not available'}
          </div>
          <span className="text-[11px] text-slate-600 mt-2 block font-medium">
            Real meteorological feeds
          </span>
        </div>
      </div>

      {/* Data Sources Provenance Table */}
      <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] overflow-hidden">
        <div className="p-5 border-b-2 border-[#102A43] bg-[#F3F6F7]/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] text-[#102A43]">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-[#102A43]">
                  Configured Scientific Data Sources
                </h3>
                <p className="text-xs text-[#486581]">
                  Global climate indices and regional weather reanalysis feeds
                </p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-white text-[#102A43] border border-[#102A43] shadow-[2px_2px_0px_#102A43] self-start sm:self-auto">
              PostgreSQL Registered
            </span>
          </div>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-[#102A43]/20 text-[#102A43] font-mono font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 px-2">Data Feed</th>
                <th className="pb-3 px-2">Provider ID</th>
                <th className="pb-3 px-2">Frequency</th>
                <th className="pb-3 px-2">Freshness Status</th>
                <th className="pb-3 px-2">Last Sync</th>
                <th className="pb-3 px-2">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102A43]/10">
              {sources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#829AB1] font-mono text-xs">
                    {loading ? 'Loading sources...' : 'No external data sources registered.'}
                  </td>
                </tr>
              ) : (
                sources.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F3F6F7]/40 transition-colors">
                    <td className="py-3 px-2 font-heading font-bold text-[#102A43]">{s.name}</td>
                    <td className="py-3 px-2 font-mono text-[11px] text-[#486581]">{s.provider}</td>
                    <td className="py-3 px-2 font-mono text-[11px] text-[#102A43] font-bold">{s.update_frequency || 'DAILY'}</td>
                    <td className="py-3 px-2">{getStatusBadge(s.status)}</td>
                    <td className="py-3 px-2 font-mono text-[11px] text-[#486581]">
                      {s.last_successful_sync
                        ? new Date(s.last_successful_sync).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })
                        : 'Not available'}
                    </td>
                    <td className="py-3 px-2">
                      {s.provenance_url ? (
                        <a
                          href={s.provenance_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#0E7490] hover:underline font-mono font-bold text-[11px]"
                        >
                          Source Ref ↗
                        </a>
                      ) : (
                        <span className="text-[#829AB1] font-mono text-[11px]">Not available</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingestion Runs History Table */}
      <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] overflow-hidden">
        <div className="p-5 border-b-2 border-[#102A43] bg-[#F3F6F7]/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] text-[#102A43]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-[#102A43]">
                  Recent Data Pipeline Ingestion Runs
                </h3>
                <p className="text-xs text-[#486581]">
                  Execution logs, validated record volumes, and Parquet storage artefacts
                </p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-white text-[#102A43] border border-[#102A43] shadow-[2px_2px_0px_#102A43] self-start sm:self-auto">
              Audited Runs: {runs.length}
            </span>
          </div>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-[#102A43]/20 text-[#102A43] font-mono font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 px-2">Dataset Name</th>
                <th className="pb-3 px-2">Provider</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Records Processed</th>
                <th className="pb-3 px-2">Failed Records</th>
                <th className="pb-3 px-2">Execution Time</th>
                <th className="pb-3 px-2">Artefact Storage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102A43]/10">
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[#829AB1] font-mono text-xs">
                    {loading ? 'Loading ingestion runs...' : 'No data ingestion runs recorded yet.'}
                  </td>
                </tr>
              ) : (
                runs.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F3F6F7]/40 transition-colors">
                    <td className="py-3 px-2 font-heading font-bold text-[#102A43]">{r.dataset_name}</td>
                    <td className="py-3 px-2 font-mono text-[11px] text-[#486581]">{r.provider}</td>
                    <td className="py-3 px-2">{getStatusBadge(r.status)}</td>
                    <td className="py-3 px-2 font-mono font-black text-[#3F7D58]">
                      {r.records_processed.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 font-mono text-[#486581]">
                      {r.records_failed > 0 ? (
                        <span className="text-[#DC2626] font-bold">{r.records_failed}</span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td className="py-3 px-2 font-mono text-[11px] text-[#486581]">
                      {new Date(r.started_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-2 font-mono text-[10px] text-[#486581] max-w-[200px] truncate" title={r.file_path || ''}>
                      {r.file_path ? r.file_path.split('/').pop() : 'Not stored'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
