import React from 'react';
import { Database, ShieldCheck, AlertTriangle, Layers, Radio, CheckCircle2, XCircle } from 'lucide-react';
import { ForecastStatusResponse, ForecastAvailabilityResponse } from '../../services/forecastService';

interface GovIntelligenceStripProps {
  forecastStatus: ForecastStatusResponse | null;
  availability: ForecastAvailabilityResponse | null;
}

export const GovIntelligenceStrip: React.FC<GovIntelligenceStripProps> = ({
  forecastStatus,
  availability,
}) => {
  const metrics = [
    {
      label: 'Statewide Coverage',
      value: '1 / 826 Blocks',
      detail: 'Assimilated: UP_LKO_BKT',
      icon: <Layers className="w-4 h-4 text-[#008F83]" />,
      tag: '825 Pending',
      tagColor: 'bg-[#FEF6E9] text-[#9A6218] border-[#E5A33D]/40',
    },
    {
      label: 'Data Freshness',
      value: availability?.data_freshness || 'HISTORICAL_ONLY',
      detail: `Archive: ${availability?.latest_observation_date || '2024-09-30'}`,
      icon: <Database className="w-4 h-4 text-[#2F7D4A]" />,
      tag: 'Station Truth',
      tagColor: 'bg-[#EBF5EE] text-[#2F7D4A] border-[#2F7D4A]/30',
    },
    {
      label: 'Operational Gating',
      value: forecastStatus?.system_status || 'DIAGNOSTIC_ONLY',
      detail: 'Operational Dissemination: Blocked',
      icon: <ShieldCheck className="w-4 h-4 text-[#E5A33D]" />,
      tag: 'Single-Season',
      tagColor: 'bg-[#FEF6E9] text-[#9A6218] border-[#E5A33D]/40',
    },
    {
      label: 'Feature Matrix',
      value: '19 / 19 Features',
      detail: '100% Core Features Validated',
      icon: <CheckCircle2 className="w-4 h-4 text-[#008F83]" />,
      tag: 'Complete',
      tagColor: 'bg-[#DCEFF0] text-[#006B65] border-[#008F83]/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className="bg-white border-2 border-[#0B1726] rounded-xl p-4 shadow-[3px_3px_0px_#0B1726] flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
        >
          <div className="flex items-start justify-between gap-2 pb-2">
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#62768A]">
              {m.label}
            </span>
            <div className="p-1.5 rounded-lg bg-[#F7F3EA] border border-[#0B1726]/15">
              {m.icon}
            </div>
          </div>

          <div className="my-1.5">
            <span className="font-mono font-black text-xl sm:text-2xl text-[#0B1726] block tracking-tight truncate">
              {m.value}
            </span>
            <p className="text-[11px] text-[#435466] mt-0.5 font-medium leading-tight truncate">
              {m.detail}
            </p>
          </div>

          <div className="pt-2 border-t border-[#0B1726]/10 flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${m.tagColor}`}>
              {m.tag}
            </span>
            <span className="text-[10px] font-mono text-[#62768A] uppercase">
              Metric-0{idx + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
