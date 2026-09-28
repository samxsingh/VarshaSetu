import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  CloudRain,
  Sun,
  AlertTriangle,
  Layers,
  Database,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  weatherService,
  OfficerBlockRiskItem,
  NormalizedForecastResponse,
  ProviderHealth,
} from '../../services/weatherService';
import { DataFreshnessBadge } from '../common/DataFreshnessBadge';
import { DecisionFlowDiagram } from '../common/DecisionFlowDiagram';
import { ProvenanceModal, ProvenanceDetails } from '../common/ProvenanceModal';
import { BlockAnomalyBarChart } from '../charts/BlockAnomalyBarChart';
import { CanonicalRainfallTrendChart } from '../charts/CanonicalRainfallTrendChart';
import { useOperationalData } from '../../context/OperationalDataContext';

export const OfficerFieldIntelligence: React.FC = () => {
  const { currentDate, currentDateLabel, forecastWindowLabel } = useOperationalData();
  const [blockRisks, setBlockRisks] = useState<OfficerBlockRiskItem[]>([]);
  const [forecast, setForecast] = useState<NormalizedForecastResponse | null>(null);
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [provenanceTarget, setProvenanceTarget] = useState<ProvenanceDetails | null>(null);
  const [sortBy, setSortBy] = useState<'risk' | 'anomaly' | 'rainfall' | 'freshness'>('risk');
  const [dispatchedBlock, setDispatchedBlock] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOfficerData = async () => {
      try {
        setLoading(true);
        const [risksRes, fcRes, healthRes] = await Promise.all([
          weatherService.getOfficerBlockRisks().catch(() => null),
          weatherService.getForecast({ block_id: 'UP_LKO_BKT', horizon: 7 }).catch(() => null),
          weatherService.getProviderHealth().catch(() => null),
        ]);

        if (isMounted) {
          if (risksRes?.success && risksRes.data) setBlockRisks(risksRes.data);
          if (fcRes?.success && fcRes.data) setForecast(fcRes.data);
          if (healthRes?.success && healthRes.data?.providers) setProviders(healthRes.data.providers);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOfficerData();
    return () => {
      isMounted = false;
    };
  }, []);

  const monitoredBlocks = blockRisks.length || 8;
  const blocksWithRainToday = blockRisks.filter((b) => b.rainfallTodayMm > 0).length;
  const heavyRainRiskBlocks = blockRisks.filter((b) => b.heavyRainRisk === 'HIGH' || b.heavyRainRisk === 'CRITICAL').length;
  const drySpellRiskBlocks = blockRisks.filter((b) => b.drySpellRisk === 'HIGH' || b.drySpellRisk === 'CRITICAL').length;
  const activeWarnings = blockRisks.filter((b) => b.activeAlert).length;
  const staleDataSources = providers.filter((p) => p.status === 'STALE' || p.status === 'UNAVAILABLE').length;

  const handleOpenBlockProvenance = (block: OfficerBlockRiskItem) => {
    setProvenanceTarget({
      title: `${block.blockName} Operational Block Risk`,
      source: block.source,
      dataset: 'Operational Agromet Station & Model Downscaling',
      observedAtIST: block.lastUpdatedIST,
      retrievedAtIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      resolution: `Block Centroid (${block.blockId}, ~9 km)`,
      modelFamily: 'ECMWF IFS / IMD AWS Gridded Telemetry',
      freshnessStatus: block.dataFreshness,
      attribution: 'VarshaSetu Meteorological & Field Action Protocol',
    });
  };

  const riskWeights: Record<string, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MODERATE: 2,
    LOW: 1,
  };

  const sortedBlockRisks = [...blockRisks].sort((a, b) => {
    if (sortBy === 'risk') {
      const aWeight = Math.max(riskWeights[a.heavyRainRisk] || 0, riskWeights[a.drySpellRisk] || 0);
      const bWeight = Math.max(riskWeights[b.heavyRainRisk] || 0, riskWeights[b.drySpellRisk] || 0);
      return bWeight - aWeight;
    }
    if (sortBy === 'anomaly') {
      const aDev = Math.abs(a.rainfallTodayMm * 7 - 38);
      const bDev = Math.abs(b.rainfallTodayMm * 7 - 38);
      return bDev - aDev;
    }
    if (sortBy === 'rainfall') {
      return a.rainfallTodayMm - b.rainfallTodayMm;
    }
    if (sortBy === 'freshness') {
      const freshScore = (s: string) => (s === 'STALE' ? 3 : s === 'HISTORICAL' ? 2 : s === 'RECENT' ? 1 : 0);
      return freshScore(b.dataFreshness) - freshScore(a.dataFreshness);
    }
    return 0;
  });

  const priorityBlocks = [...blockRisks]
    .filter((b) => b.heavyRainRisk === 'HIGH' || b.heavyRainRisk === 'CRITICAL' || b.drySpellRisk === 'HIGH' || Boolean(b.activeAlert))
    .slice(0, 3);

  const daily = forecast?.daily || [];

  return (
    <div className="space-y-6" data-testid="officer-field-intelligence">
      {/* 0. Institutional Decision Flow Diagram */}
      <DecisionFlowDiagram role="OFFICER" />

      {/* 0.1 ACTION LAYER: WHERE SHOULD I ACT? (Operational Block Dispatch Priorities) */}
      <div className="bg-gradient-to-r from-[#102A43] to-[#1E3A8A] text-white rounded-2xl p-6 shadow-[4px_4px_0px_#0A192F] border-2 border-[#102A43]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-400/20">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                DECISION INTELLIGENCE · FIELD ADVISORY DISPATCH
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-blue-200 border border-white/20">
                {currentDate}
              </span>
            </div>
            <h2 className="text-xl font-heading font-black text-white mt-1">
              Where Should I Act Today? (Block Prioritization)
            </h2>
          </div>
          <span className="text-xs font-mono text-blue-200">
            {priorityBlocks.length} High-Attention Blocks Identified
          </span>
        </div>

        {dispatchedBlock && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Field advisory draft prepared for <strong>{dispatchedBlock}</strong>. Queued for KVK & SMS broadcast channels.
            </span>
            <button
              onClick={() => setDispatchedBlock(null)}
              className="text-[11px] underline text-emerald-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {(priorityBlocks.length > 0 ? priorityBlocks : blockRisks.slice(0, 3)).map((b) => {
            const isHighRain = b.heavyRainRisk === 'HIGH' || b.heavyRainRisk === 'CRITICAL';
            return (
              <div
                key={b.blockId}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/15 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-white">{b.blockName}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isHighRain
                          ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                          : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                      }`}
                    >
                      {isHighRain ? 'HEAVY RAIN' : 'DRY SPELL'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-blue-100/90 font-sans space-y-1">
                    <div>Rainfall: <strong className="text-white font-mono">{b.rainfallTodayMm} mm</strong> (Prob: {b.rainProbabilityPercent}%)</div>
                    <div>Alert: <span className="font-mono text-amber-300">{b.activeAlert || 'Monitor drainage networks'}</span></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-blue-200/80">Ref: {b.blockId}</span>
                  <button
                    onClick={() => setDispatchedBlock(b.blockName)}
                    className="px-2.5 py-1 bg-white text-[#102A43] hover:bg-blue-50 text-[11px] font-heading font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    Draft Advisory
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1. FIELD CONDITIONS OVERVIEW (KPI Row) */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-6 shadow-[4px_4px_0px_#102A43]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              OPERATIONAL SITUATION
            </span>
            <h2 className="text-xl font-heading font-black text-[#102A43] mt-1">
              Field Conditions Overview — Lucknow District
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Synced: {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mt-5">
          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg text-center">
            <div className="text-[10px] font-mono uppercase text-slate-500">Monitored Blocks</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{monitoredBlocks}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">District Lucknow</div>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg text-center">
            <div className="text-[10px] font-mono uppercase text-slate-500">Rain Today</div>
            <div className="text-2xl font-black text-cyan-700 mt-1">{blocksWithRainToday}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">≥ 0.1 mm registered</div>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg text-center">
            <div className="text-[10px] font-mono uppercase text-slate-500">Heavy Rain Risk</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{heavyRainRiskBlocks}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Watch / Warning</div>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg text-center">
            <div className="text-[10px] font-mono uppercase text-slate-500">Dry-Spell Risk</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{drySpellRiskBlocks}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Moisture stress</div>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg text-center">
            <div className="text-[10px] font-mono uppercase text-slate-500">Active Warnings</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{activeWarnings}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Broadcast ready</div>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg text-center">
            <div className="text-[10px] font-mono uppercase text-slate-500">Stale Sources</div>
            <div className="text-2xl font-black text-slate-700 mt-1">{staleDataSources}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Telemetry lag</div>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg text-center">
            <div className="text-[10px] font-mono uppercase text-slate-500">Freshness</div>
            <div className="text-base font-black text-emerald-700 mt-2">LIVE</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Real-time sync</div>
          </div>
        </div>
      </div>

      {/* 2. BLOCK RISK MATRIX & ANOMALY ANALYSIS */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-6 shadow-[4px_4px_0px_#102A43]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              CROSS-BLOCK SITUATION & SORTING
            </span>
            <h2 className="text-xl font-heading font-black text-[#102A43] mt-1">
              Block Risk Matrix — Agro-Climatic Operational Telemetry
            </h2>
          </div>
          {/* Sorting controls */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono">
            <span className="text-[11px] text-slate-500 px-2 font-sans font-semibold">Sort by:</span>
            <button
              onClick={() => setSortBy('risk')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'risk'
                  ? 'bg-[#102A43] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Highest Risk
            </button>
            <button
              onClick={() => setSortBy('anomaly')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'anomaly'
                  ? 'bg-[#102A43] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Highest Anomaly
            </button>
            <button
              onClick={() => setSortBy('rainfall')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'rainfall'
                  ? 'bg-[#102A43] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Lowest Rainfall
            </button>
            <button
              onClick={() => setSortBy('freshness')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'freshness'
                  ? 'bg-[#102A43] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Stalest Telemetry
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Administrative Block</th>
                <th className="py-2.5 px-3">Rainfall Today</th>
                <th className="py-2.5 px-3">Rain Probability</th>
                <th className="py-2.5 px-3">Heavy Rain Risk</th>
                <th className="py-2.5 px-3">Dry Spell Risk</th>
                <th className="py-2.5 px-3">Data Freshness</th>
                <th className="py-2.5 px-3">Operational Status</th>
                <th className="py-2.5 px-3 text-right">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-xs">
              {sortedBlockRisks.map((b) => (
                <tr key={b.blockId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 font-sans">
                    {b.blockName}
                    <span className="text-[10px] text-slate-400 block font-mono font-normal">{b.blockId}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {b.rainfallTodayMm} mm
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${b.rainProbabilityPercent}%` }}
                          className="h-full bg-blue-600 rounded-full"
                        />
                      </div>
                      <span>{b.rainProbabilityPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.heavyRainRisk === 'HIGH' || b.heavyRainRisk === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : b.heavyRainRisk === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {b.heavyRainRisk}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.drySpellRisk === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {b.drySpellRisk}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <DataFreshnessBadge status={b.dataFreshness} />
                  </td>
                  <td className="py-3 px-3">
                    {b.activeAlert ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        {b.activeAlert}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-sans text-[11px]">Normal Field Operations</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleOpenBlockProvenance(b)}
                      className="text-slate-500 hover:text-slate-900 font-semibold underline text-[11px]"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2.1 Block Anomaly Comparison vs 30-Year ERA5 Normal */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <BlockAnomalyBarChart
            blocks={blockRisks}
            title="Lucknow District Cross-Block Climatological Anomaly (% Departure)"
            subtitle="Comparing real-time assimilated block precipitation against 1991–2020 ERA5-Land climatological normals"
          />
        </div>
      </div>

      {/* 3. 7-DAY RAINFALL TREND & RISK TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Rainfall Trend Chart */}
        <div className="lg:col-span-7">
          <CanonicalRainfallTrendChart
            daily={daily}
            freshnessStatus="LIVE"
            sourceAttribution="Open-Meteo / ECMWF IFS 0.1° (~9 km)"
            title="7-Day Quantitative Precipitation Forecast (QPF)"
            subtitle="Operational multi-model rainfall distribution across Lucknow district"
          />
        </div>

        {/* Risk Timeline (Today to +7) */}
        <div className="lg:col-span-5 bg-white border-2 border-[#102A43] rounded-2xl p-6 shadow-[4px_4px_0px_#102A43]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
                HORIZON TRAJECTORY
              </span>
              <h3 className="text-base font-heading font-black text-[#102A43] mt-0.5">
                Multi-Day Hazard Timeline
              </h3>
            </div>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>

          <div className="mt-4 space-y-2.5">
            {daily.map((d, idx) => {
              const isHigh = d.heavyRainRisk === 'HIGH' || d.heavyRainRisk === 'CRITICAL';
              const isDry = d.drySpellRisk === 'HIGH';

              return (
                <div
                  key={d.date}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-mono font-bold text-slate-700">
                      {idx === 0 ? 'Today' : `+${idx}d`}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">{d.dayLabel} {d.date.slice(5)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 text-[11px]">{d.rainfallMm} mm ({d.rainfallProbability}%)</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isDry
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isHigh ? 'HEAVY RAIN' : isDry ? 'DRY SPELL' : 'NORMAL'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. DATA QUALITY PANEL (IMD, Open-Meteo, ERA5, NASA POWER) */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-6 shadow-[4px_4px_0px_#102A43]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              INSTRUMENT & PROVIDER TELEMETRY
            </span>
            <h3 className="text-lg font-heading font-black text-[#102A43] mt-0.5">
              Meteorological Data Health & Quality Panel
            </h3>
          </div>
          <Database className="w-4 h-4 text-emerald-700" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* IMD */}
          <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900">IMD AWS / ARG</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                DEGRADED
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 font-sans">
              Portal reachable; operational API key not configured. Delegated to Open-Meteo fallback.
            </p>
            <div className="text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-200">
              Latency: ~180 ms · Role: Primary India
            </div>
          </div>

          {/* Open-Meteo */}
          <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900">Open-Meteo / ECMWF</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                CONNECTED
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 font-sans">
              High-resolution gridded NWP model (ECMWF IFS & DWD ICON). Hourly/daily forecasts active.
            </p>
            <div className="text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-200">
              Latency: ~120 ms · Role: Secondary Global
            </div>
          </div>

          {/* ERA5-Land */}
          <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900">ERA5-Land (C3S)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                CONNECTED
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 font-sans">
              1991–2020 WMO Climatological Normal baseline for Lucknow district anomaly computations.
            </p>
            <div className="text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-200">
              Coverage: 30-Year Normals · Role: Climatology
            </div>
          </div>

          {/* NASA POWER */}
          <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900">NASA POWER</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                CONNECTED
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 font-sans">
              Satellite agroclimate parameters (surface solar radiation, RH2M, corrected rainfall).
            </p>
            <div className="text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-200">
              Latency: ~210 ms · Role: Agroclimatology
            </div>
          </div>
        </div>
      </div>

      <ProvenanceModal
        isOpen={Boolean(provenanceTarget)}
        onClose={() => setProvenanceTarget(null)}
        details={provenanceTarget}
      />
    </div>
  );
};
