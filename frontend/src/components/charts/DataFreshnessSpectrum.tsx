import React from 'react';
import { FreshnessClassification } from '../../services/weatherService';

interface FreshnessBreakdown {
  liveCount: number;
  recentCount: number;
  historicalCount: number;
  climatologicalCount: number;
  simulatedCount: number;
}

interface Props {
  breakdown: FreshnessBreakdown;
  title?: string;
  className?: string;
}

export const DataFreshnessSpectrum: React.FC<Props> = ({
  breakdown,
  title = 'Platform Telemetry & Data Freshness Spectrum',
  className = '',
}) => {
  const total =
    breakdown.liveCount +
    breakdown.recentCount +
    breakdown.historicalCount +
    breakdown.climatologicalCount +
    breakdown.simulatedCount;

  if (total === 0) {
    return (
      <div className={`bg-white rounded-xl border border-[#CBD5E1] p-6 text-center text-[#64748B] ${className}`}>
        <p className="font-heading font-medium text-sm">Data Freshness Spectrum Unavailable</p>
        <p className="text-xs text-[#94A3B8] mt-1">No active telemetry or channel records detected for this period.</p>
      </div>
    );
  }

  const getPct = (cnt: number) => (total > 0 ? (cnt / total) * 100 : 0);

  const segments = [
    { label: 'LIVE (<3h)', count: breakdown.liveCount, pct: getPct(breakdown.liveCount), bg: 'bg-emerald-500', text: 'text-emerald-800' },
    { label: 'RECENT (3–24h)', count: breakdown.recentCount, pct: getPct(breakdown.recentCount), bg: 'bg-amber-500', text: 'text-amber-800' },
    { label: 'HISTORICAL (>24h)', count: breakdown.historicalCount, pct: getPct(breakdown.historicalCount), bg: 'bg-slate-400', text: 'text-slate-700' },
    { label: 'CLIMATOLOGY (30-Yr)', count: breakdown.climatologicalCount, pct: getPct(breakdown.climatologicalCount), bg: 'bg-cyan-600', text: 'text-cyan-800' },
    { label: 'SIMULATED (What-If)', count: breakdown.simulatedCount, pct: getPct(breakdown.simulatedCount), bg: 'bg-purple-500', text: 'text-purple-800' },
  ].filter((s) => s.count > 0 || total === 0);

  return (
    <div className={`bg-white rounded-2xl border-2 border-[#102A43] shadow-[3px_3px_0px_#102A43] p-5 sm:p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
        <h4 className="font-heading font-bold text-base text-[#102A43]">
          {title}
        </h4>
        <span className="text-[10px] font-mono text-[#0E7490] font-bold">
          {total} Active Data Ingestion Channels
        </span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="mt-4 h-4 w-full bg-[#F1F5F9] rounded-full overflow-hidden flex border border-[#CBD5E1]">
        {segments.map((seg) => (
          <div
            key={seg.label}
            style={{ width: `${seg.pct}%` }}
            className={`${seg.bg} h-full transition-all duration-300`}
            title={`${seg.label}: ${seg.count} channels (${seg.pct.toFixed(0)}%)`}
          />
        ))}
      </div>

      {/* Legend Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs font-sans">
            <span className={`w-3 h-3 rounded-full shrink-0 ${seg.bg}`} />
            <div>
              <span className="block font-heading font-bold text-[#102A43] text-[11px]">
                {seg.count} {seg.label.split(' ')[0]}
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">
                {seg.pct.toFixed(0)}% of platform
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
