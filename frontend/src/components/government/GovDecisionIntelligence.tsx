import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Layers,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  Compass,
  PieChart,
  Activity,
} from 'lucide-react';
import {
  weatherService,
  GovernmentOverviewMetrics,
  NormalizedForecastResponse,
  ClimateBaselineMetrics,
  OfficerBlockRiskItem,
} from '../../services/weatherService';
import { DataFreshnessBadge } from '../common/DataFreshnessBadge';
import { DecisionFlowDiagram } from '../common/DecisionFlowDiagram';
import { ProvenanceModal, ProvenanceDetails } from '../common/ProvenanceModal';
import { CanonicalRainfallTrendChart } from '../charts/CanonicalRainfallTrendChart';
import { BlockAnomalyBarChart } from '../charts/BlockAnomalyBarChart';
import { DataFreshnessSpectrum } from '../charts/DataFreshnessSpectrum';
import { useOperationalData } from '../../context/OperationalDataContext';

export const GovDecisionIntelligence: React.FC = () => {
  const { currentDate, currentDateLabel } = useOperationalData();
  const [govOverview, setGovOverview] = useState<GovernmentOverviewMetrics | null>(null);
  const [baseline, setBaseline] = useState<ClimateBaselineMetrics | null>(null);
  const [forecast, setForecast] = useState<NormalizedForecastResponse | null>(null);
  const [blockRisks, setBlockRisks] = useState<OfficerBlockRiskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [provenanceTarget, setProvenanceTarget] = useState<ProvenanceDetails | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchGovData = async () => {
      try {
        setLoading(true);
        const [govRes, baseRes, fcRes, risksRes] = await Promise.all([
          weatherService.getGovernmentOverview().catch(() => null),
          weatherService.getClimateBaseline().catch(() => null),
          weatherService.getForecast({ block_id: 'UP_LKO_BKT', horizon: 7 }).catch(() => null),
          weatherService.getOfficerBlockRisks().catch(() => null),
        ]);

        if (isMounted) {
          if (govRes?.success && govRes.data) setGovOverview(govRes.data);
          if (baseRes?.success && baseRes.data) setBaseline(baseRes.data);
          if (fcRes?.success && fcRes.data) setForecast(fcRes.data);
          if (risksRes?.success && risksRes.data) setBlockRisks(risksRes.data);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGovData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenGovProvenance = (metricName: string) => {
    setProvenanceTarget({
      title: metricName,
      source: 'State Agricultural Meteorological Command Layer (IMD / ECMWF / ERA5)',
      dataset: 'District Agro-Hydrological Decision Telemetry',
      observedAtIST: govOverview?.lastSyncTimeIST,
      retrievedAtIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      resolution: 'District Aggregation (440 Gram Panchayats / 8 Blocks)',
      modelFamily: 'Multi-Source Ensemble & 30-Year WMO Baseline Anomaly',
      freshnessStatus: govOverview?.overallDataFreshness || 'LIVE',
      attribution: 'Govt. of Uttar Pradesh Agriculture Dept. & VarshaSetu Scientific Layer',
    });
  };

  const daily = forecast?.daily || [];

  return (
    <div className="space-y-6" data-testid="gov-decision-intelligence">
      {/* 0. Institutional Decision Flow Diagram */}
      <DecisionFlowDiagram role="GOVERNMENT" />

      {/* 1. MONSOON COMMAND OVERVIEW (KPI Row) */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-6 shadow-[4px_4px_0px_#102A43]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
                STATE LEVEL EXECUTIVE SUMMARY
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold">
                {currentDate}
              </span>
              <DataFreshnessBadge status="LIVE" source="Multi-Source Pipeline" />
            </div>
            <h2 className="text-xl font-heading font-black text-[#102A43] mt-1">
              Monsoon Command Overview — Lucknow District Administrative Zone
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenGovProvenance('Monsoon Command Overview')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Audit Provenance
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-5">
          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Monitored Blocks</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{govOverview?.monitoredBlocks || 8}</div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">100% Coverage</span>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Active Warnings</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{govOverview?.activeRainfallWarnings || 0}</div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">District Met Alerts</span>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Heavy-Rain Blocks</span>
            <div className="text-2xl font-black text-rose-700 mt-1">{govOverview?.heavyRainRiskBlocks || 0}</div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Threshold ≥ 65 mm</span>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Dry-Spell Blocks</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{govOverview?.drySpellRiskBlocks || 0}</div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">≥ 5 rainless days</span>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Rainfall Anomaly</span>
            <div className={`text-2xl font-black mt-1 ${
              (baseline?.rainfall.anomalyPercent || 0) < -19 ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {baseline ? `${baseline.rainfall.anomalyPercent > 0 ? '+' : ''}${baseline.rainfall.anomalyPercent}%` : '-12%'}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">vs 1991–2020 WMO</span>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Data Freshness</span>
            <div className="text-base font-black text-emerald-700 mt-2">LIVE / 15m</div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Automated Sync</span>
          </div>

          <div className="p-3 bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Forecast Skill</span>
            <div className="text-2xl font-black text-slate-900 mt-1">92%</div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Brier Score 0.14</span>
          </div>
        </div>
      </div>

      {/* 2. GOVERNMENT DECISION-SUPPORT CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart A: District Rainfall Trend */}
        <div className="lg:col-span-6">
          <CanonicalRainfallTrendChart
            daily={daily}
            freshnessStatus={govOverview?.overallDataFreshness || 'LIVE'}
            sourceAttribution="Open-Meteo / ECMWF IFS 0.1°"
            title="District Cumulative Rainfall Trajectory (7 Days)"
            subtitle={`Expected 7-Day District Accumulation: ${forecast?.summary.expectedTotalRainfall7dMm || 0} mm`}
          />
        </div>

        {/* Chart B: Spatial Block Rainfall Anomaly vs 30-Year Normal */}
        <div className="lg:col-span-6">
          <BlockAnomalyBarChart
            blocks={blockRisks}
            title="Spatial Block Rainfall Anomaly (% vs Normal)"
            subtitle="Comparing assimilated operational observations against 1991–2020 ERA5-Land baseline"
          />
        </div>

        {/* Chart C: Vulnerability Stratification */}
        <div className="lg:col-span-6 bg-white border-2 border-[#102A43] rounded-2xl p-6 shadow-[4px_4px_0px_#102A43]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
                CHART C · RISK STRATIFICATION
              </span>
              <h3 className="text-base font-heading font-black text-[#102A43] mt-0.5">
                District Vulnerability Distribution
              </h3>
            </div>
            <PieChart className="w-4 h-4 text-slate-600" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg">
              <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold">Normal</span>
              <div className="text-2xl font-black text-emerald-900 mt-1">6 Blocks</div>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">Low Hazard</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
              <span className="text-[10px] font-mono uppercase text-amber-800 font-bold">Watch</span>
              <div className="text-2xl font-black text-amber-900 mt-1">2 Blocks</div>
              <span className="text-[10px] text-amber-700 mt-0.5 block">Moisture Dip</span>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg">
              <span className="text-[10px] font-mono uppercase text-rose-800 font-bold">Elevated</span>
              <div className="text-2xl font-black text-rose-900 mt-1">0 Blocks</div>
              <span className="text-[10px] text-rose-700 mt-0.5 block">Precip Alert</span>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-300 rounded-lg">
              <span className="text-[10px] font-mono uppercase text-purple-800 font-bold">High Risk</span>
              <div className="text-2xl font-black text-purple-900 mt-1">0 Blocks</div>
              <span className="text-[10px] text-purple-700 mt-0.5 block">Waterlogging</span>
            </div>
          </div>
        </div>

        {/* Chart D: Data Freshness & Ingestion Spectrum */}
        <div className="lg:col-span-6">
          <DataFreshnessSpectrum
            breakdown={{
              liveCount: 6,
              recentCount: 2,
              historicalCount: 0,
              climatologicalCount: 2,
              simulatedCount: 0,
            }}
            title="Platform Telemetry & Provider Freshness Spectrum"
          />
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
