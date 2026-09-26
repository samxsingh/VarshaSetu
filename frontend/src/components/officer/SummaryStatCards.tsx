import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, AlertTriangle, CloudSun, Database, Radio, ArrowUpRight } from 'lucide-react';

export const SummaryStatCards: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('officer.monitoredPanchayats', { defaultValue: 'Monitored Panchayats' }),
      value: '440',
      subtitle: 'Across 6 Blocks (Lucknow District)',
      icon: <Building2 className="w-4 h-4 text-[#008F83]" />,
      tag: '100% Synced',
      tagColor: 'bg-[#DCEFF0] text-[#006B65] border-[#008F83]/30',
    },
    {
      title: t('officer.highRiskBlocks', { defaultValue: 'Dry Spell Exposure' }),
      value: '2 Blocks',
      subtitle: 'Malihabad & BKT (Watch Active)',
      icon: <AlertTriangle className="w-4 h-4 text-[#E5A33D]" />,
      tag: 'Watch Tier 2',
      tagColor: 'bg-[#FEF6E9] text-[#9A6218] border-[#E5A33D]/40',
    },
    {
      title: t('officer.heavyRainAlerts', { defaultValue: 'Heavy Rain Exposure' }),
      value: '3 Blocks',
      subtitle: '>65mm Threshold Projected June 27',
      icon: <CloudSun className="w-4 h-4 text-[#3B82F6]" />,
      tag: 'Tier 2 Event',
      tagColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#3B82F6]/30',
    },
    {
      title: t('officer.dataFreshness', { defaultValue: 'Scientific Provenance' }),
      value: 'UP_LKO_BKT',
      subtitle: '122 Observations • Kharif 2024 Archive',
      icon: <Database className="w-4 h-4 text-[#2F7D4A]" />,
      tag: 'Diagnostic',
      tagColor: 'bg-[#EBF5EE] text-[#2F7D4A] border-[#2F7D4A]/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-white border-2 border-[#0B1726] rounded-xl p-4 shadow-[3px_3px_0px_#0B1726] flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
        >
          <div className="flex items-start justify-between gap-2 pb-2">
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#62768A]">
              {s.title}
            </span>
            <div className="p-1.5 rounded-lg bg-[#F7F3EA] border border-[#0B1726]/15">
              {s.icon}
            </div>
          </div>

          <div className="my-1.5">
            <span className="font-mono font-black text-2xl text-[#0B1726] block tracking-tight">
              {s.value}
            </span>
            <p className="text-[11px] text-[#435466] mt-0.5 font-medium leading-tight">
              {s.subtitle}
            </p>
          </div>

          <div className="pt-2 border-t border-[#0B1726]/10 flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${s.tagColor}`}>
              {s.tag}
            </span>
            <span className="text-[10px] font-mono text-[#62768A] uppercase">
              Sig-0{i + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
