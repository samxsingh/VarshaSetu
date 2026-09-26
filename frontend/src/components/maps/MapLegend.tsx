import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOfficerStore } from '../../stores/useOfficerStore';
import { cn } from '../../utils/cn';

export const MapLegend: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const { activeRiskLayer } = useOfficerStore();

  const legendConfigs = {
    DRY_SPELL: {
      title: 'Dry Spell Risk (% probability)',
      items: [
        { label: 'Low (< 30%)', color: 'bg-[#3F7D58]' },
        { label: 'Moderate (30-60%)', color: 'bg-[#D97706]' },
        { label: 'High (60-80%)', color: 'bg-[#B45309]' },
        { label: 'Critical (> 80%)', color: 'bg-[#DC2626]' },
      ],
    },
    ONSET: {
      title: 'Monsoon Onset Window Likelihood',
      items: [
        { label: 'Probable (> 80%)', color: 'bg-[#0E7490]' },
        { label: 'Moderate (50-80%)', color: 'bg-[#0891B2]' },
        { label: 'Emerging (25-50%)', color: 'bg-[#155E75]' },
        { label: 'Unlikely (< 25%)', color: 'bg-[#829AB1]' },
      ],
    },
    HEAVY_RAIN: {
      title: 'Heavy Rainfall Risk (> 65 mm / 24h)',
      items: [
        { label: 'Severe Alert (> 70%)', color: 'bg-[#1D4ED8]' },
        { label: 'Moderate Watch (40-70%)', color: 'bg-[#2563EB]' },
        { label: 'Low (< 40%)', color: 'bg-[#93C5FD]' },
      ],
    },
    ANOMALY: {
      title: 'Rainfall Departure vs 30-Year Normal',
      items: [
        { label: 'Excess (+20% to +60%)', color: 'bg-[#2563EB]' },
        { label: 'Normal (-19% to +19%)', color: 'bg-[#0891B2]' },
        { label: 'Deficit (-20% to -59%)', color: 'bg-[#D97706]' },
        { label: 'Large Deficit (< -60%)', color: 'bg-[#B45309]' },
      ],
    },
  };

  const current = legendConfigs[activeRiskLayer];

  return (
    <div className={cn('bg-white border-2 border-[#102A43] p-3 rounded-xl shadow-[2px_2px_0px_#102A43] text-xs', className)}>
      <h5 className="font-heading font-bold text-[#102A43] text-xs mb-2 uppercase tracking-wide">
        {current.title}
      </h5>
      <div className="flex flex-wrap items-center gap-3">
        {current.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className={cn('w-2.5 h-2.5 rounded-full border border-[#102A43]/20 shrink-0', item.color)} />
            <span className="text-[#486581] text-[11px] font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
