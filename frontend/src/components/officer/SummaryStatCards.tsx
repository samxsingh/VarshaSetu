import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, AlertTriangle, CloudSun, Database, Radio, ArrowUpRight } from 'lucide-react';
import { useOperationalData } from '../../context/OperationalDataContext';

export const SummaryStatCards: React.FC = () => {
  const { t } = useTranslation();
  const { forecastWindowLabel } = useOperationalData();

  const stats = [
    {
      title: t('officer.monitoredPanchayats', { defaultValue: 'Monitored Panchayats' }),
      value: '440',
      subtitle: 'Across 6 Blocks (Lucknow District)',
      icon: <Building2 className="w-4 h-4 text-[#0E7490]" />,
      tag: '100% Synced',
      tagColor: 'bg-[#E8F4F6] text-[#155E75] border-[#0E7490]/30',
    },
    {
      title: t('officer.highRiskBlocks', { defaultValue: 'Dry Spell Exposure' }),
      value: '2 Blocks',
      subtitle: 'Malihabad & BKT (Watch Active)',
      icon: <AlertTriangle className="w-4 h-4 text-[#D97706]" />,
      tag: 'Watch Tier 2',
      tagColor: 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40',
    },
    {
      title: t('officer.heavyRainAlerts', { defaultValue: 'Heavy Rain Exposure' }),
      value: '3 Blocks',
      subtitle: `>65mm Threshold Projected (${forecastWindowLabel || 'Active Window'})`,
      icon: <CloudSun className="w-4 h-4 text-[#2563EB]" />,
      tag: 'Tier 2 Event',
      tagColor: 'bg-[#DBEAFE] text-[#1E40AF] border-[#2563EB]/30',
    },
    {
      title: t('officer.dataFreshness', { defaultValue: 'Scientific Provenance' }),
      value: 'UP_LKO_BKT',
      subtitle: '122 Observations • Kharif Baseline Anchor',
      icon: <Database className="w-4 h-4 text-[#0891B2]" />,
      tag: 'Diagnostic',
      tagColor: 'bg-[#E8F4F6] text-[#0E7490] border-[#0891B2]/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-white border-2 border-[#102A43] rounded-xl p-4 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-2 pb-2">
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#829AB1]">
              {s.title}
            </span>
            <div className="p-1.5 rounded-lg bg-[#F3F6F7] border border-[#102A43]/15">
              {s.icon}
            </div>
          </div>

          <div className="my-1.5">
            <span className="font-mono font-black text-2xl text-[#102A43] block tracking-tight">
              {s.value}
            </span>
            <p className="text-[11px] text-[#486581] mt-0.5 font-medium leading-tight">
              {s.subtitle}
            </p>
          </div>

          <div className="pt-2 border-t border-[#102A43]/10 flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${s.tagColor}`}>
              {s.tag}
            </span>
            <span className="text-[10px] font-mono text-[#829AB1] uppercase">
              Sig-0{i + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
