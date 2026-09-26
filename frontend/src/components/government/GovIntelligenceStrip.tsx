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
      label: 'Spatial Assimilation',
      value: '1 / 826 Blocks',
      detail: 'Assimilated Anchor: UP_LKO_BKT',
      icon: <Layers className="w-4 h-4 text-[#0E7490]" />,
      tag: 'Single-Block Anchor',
      tagColor: 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40',
    },
    {
      label: 'Data Freshness',
      value: availability?.data_freshness || 'HISTORICAL_ONLY',
      detail: `Archive: ${availability?.latest_observation_date || '2024-09-30'}`,
      icon: <Database className="w-4 h-4 text-[#0891B2]" />,
      tag: 'Station Truth',
      tagColor: 'bg-[#E8F4F6] text-[#0E7490] border-[#0891B2]/30',
    },
    {
      label: 'Operational Gating',
      value: forecastStatus?.system_status || 'DIAGNOSTIC_ONLY',
      detail: 'Operational Dissemination: Blocked',
      icon: <ShieldCheck className="w-4 h-4 text-[#D97706]" />,
      tag: 'Single-Season',
      tagColor: 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40',
    },
    {
      label: 'Feature Matrix',
      value: '19 / 19 Features',
      detail: '100% Core Features Validated',
      icon: <CheckCircle2 className="w-4 h-4 text-[#0E7490]" />,
      tag: 'Complete',
      tagColor: 'bg-[#E8F4F6] text-[#155E75] border-[#0E7490]/30',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Primary & Secondary Institutional Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Primary: ACTIVE SIGNALS */}
        <div className="bg-white border-2 border-[#102A43] rounded-xl p-4 shadow-[3px_3px_0px_#102A43] flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between gap-2 pb-2">
            <span className="text-[10px] font-heading font-black uppercase tracking-wider text-[#0E7490]">
              Primary • Active Signals
            </span>
            <div className="p-1.5 rounded-lg bg-[#E8F4F6] border border-[#0E7490]/30 text-[#0E7490]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="font-mono font-black text-3xl text-[#102A43] block tracking-tight">
              6 Signals
            </span>
            <p className="text-[11px] text-[#486581] mt-0.5 font-medium leading-tight">
              3 Watch • 1 Elevated • 2 Baseline
            </p>
          </div>
          <div className="pt-2 border-t border-[#102A43]/10 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/40">
              Escalation: WATCH
            </span>
            <span className="text-[10px] font-mono text-[#829AB1] uppercase">PRI-01</span>
          </div>
        </div>

        {/* 2. Secondary: Spatial Assimilation */}
        <div className="bg-white border-2 border-[#102A43] rounded-xl p-4 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 pb-2">
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#829AB1]">
              Spatial Assimilation
            </span>
            <div className="p-1.5 rounded-lg bg-[#F3F6F7] border border-[#102A43]/15">
              <Layers className="w-4 h-4 text-[#0E7490]" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="font-mono font-black text-2xl text-[#102A43] block tracking-tight">
              1 / 826
            </span>
            <p className="text-[11px] text-[#486581] mt-0.5 font-medium leading-tight">
              UP_LKO_BKT Ground Anchor
            </p>
          </div>
          <div className="pt-2 border-t border-[#102A43]/10 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E8F4F6] text-[#0E7490] border border-[#0E7490]/30">
              Assimilated
            </span>
            <span className="text-[10px] font-mono text-[#829AB1]">SEC-01</span>
          </div>
        </div>

        {/* 3. Secondary: Rainfall Departure */}
        <div className="bg-white border-2 border-[#102A43] rounded-xl p-4 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 pb-2">
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#829AB1]">
              Rainfall Departure
            </span>
            <div className="p-1.5 rounded-lg bg-[#F3F6F7] border border-[#102A43]/15">
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="font-mono font-black text-2xl text-[#2563EB] block tracking-tight">
              +14%
            </span>
            <p className="text-[11px] text-[#486581] mt-0.5 font-medium leading-tight">
              Above 30-Year Normal
            </p>
          </div>
          <div className="pt-2 border-t border-[#102A43]/10 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#DBEAFE] text-[#1D4ED8] border border-[#2563EB]/30">
              Normal/Excess
            </span>
            <span className="text-[10px] font-mono text-[#829AB1]">SEC-02</span>
          </div>
        </div>

        {/* 4. Secondary: Drought Exposure */}
        <div className="bg-white border-2 border-[#102A43] rounded-xl p-4 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 pb-2">
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#829AB1]">
              Drought Exposure
            </span>
            <div className="p-1.5 rounded-lg bg-[#F3F6F7] border border-[#102A43]/15">
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="font-mono font-black text-2xl text-[#D97706] block tracking-tight">
              1 Block
            </span>
            <p className="text-[11px] text-[#486581] mt-0.5 font-medium leading-tight">
              Malihabad (Dry Spell 74%)
            </p>
          </div>
          <div className="pt-2 border-t border-[#102A43]/10 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#B45309] border border-[#D97706]/40">
              Elevated Risk
            </span>
            <span className="text-[10px] font-mono text-[#829AB1]">SEC-03</span>
          </div>
        </div>

        {/* 5. Secondary: Waterlogging Exposure */}
        <div className="bg-white border-2 border-[#102A43] rounded-xl p-4 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 pb-2">
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#829AB1]">
              Waterlogging Exposure
            </span>
            <div className="p-1.5 rounded-lg bg-[#F3F6F7] border border-[#102A43]/15">
              <Database className="w-4 h-4 text-[#0891B2]" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="font-mono font-black text-2xl text-[#102A43] block tracking-tight">
              2 Blocks
            </span>
            <p className="text-[11px] text-[#486581] mt-0.5 font-medium leading-tight">
              Sarojininagar & Gosainganj
            </p>
          </div>
          <div className="pt-2 border-t border-[#102A43]/10 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E8F4F6] text-[#0E7490] border border-[#0891B2]/30">
              Soil Saturation Watch
            </span>
            <span className="text-[10px] font-mono text-[#829AB1]">SEC-04</span>
          </div>
        </div>
      </div>

      {/* Tertiary: Institutional Provenance & Verification Strip */}
      <div className="p-3 bg-[#EAF0F2] border border-[#102A43]/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#486581]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#102A43]">PROVENANCE:</span>
          <span>IMD AWS Centroid (UP_LKO_BKT) & ERA5 Reanalysis</span>
          <span>•</span>
          <span>Freshness: {availability?.data_freshness || 'HISTORICAL_ONLY'} ({availability?.latest_observation_date || '2024-09-30'})</span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="px-2 py-0.5 rounded bg-white border border-[#102A43]/20 text-[10px] font-bold text-[#102A43]">
            STATUS: {forecastStatus?.system_status || 'DIAGNOSTIC_ONLY'}
          </span>
          <span className="text-[10px] text-[#829AB1]">
            Synced: Kharif 2024
          </span>
        </div>
      </div>
    </div>
  );
};
