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
        { label: 'Low (< 30%)', color: 'bg-emerald-500' },
        { label: 'Moderate (30-60%)', color: 'bg-amber-400' },
        { label: 'High (60-80%)', color: 'bg-orange-500' },
        { label: 'Critical (> 80%)', color: 'bg-rose-600' },
      ],
    },
    ONSET: {
      title: 'Monsoon Onset Window Likelihood',
      items: [
        { label: 'Probable (> 80%)', color: 'bg-teal-600' },
        { label: 'Moderate (50-80%)', color: 'bg-teal-400' },
        { label: 'Emerging (25-50%)', color: 'bg-teal-200' },
        { label: 'Unlikely (< 25%)', color: 'bg-slate-300' },
      ],
    },
    HEAVY_RAIN: {
      title: 'Heavy Rainfall Risk (> 65 mm / 24h)',
      items: [
        { label: 'Severe Alert (> 70%)', color: 'bg-blue-700' },
        { label: 'Moderate Watch (40-70%)', color: 'bg-blue-400' },
        { label: 'Low (< 40%)', color: 'bg-blue-200' },
      ],
    },
    ANOMALY: {
      title: 'Rainfall Departure vs Normal',
      items: [
        { label: 'Excess (+20% to +60%)', color: 'bg-sky-500' },
        { label: 'Normal (-19% to +19%)', color: 'bg-emerald-500' },
        { label: 'Deficit (-20% to -59%)', color: 'bg-amber-500' },
        { label: 'Large Deficit (< -60%)', color: 'bg-red-600' },
      ],
    },
  };

  const current = legendConfigs[activeRiskLayer];

  return (
    <div className={cn('bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-surface-border shadow-elevated text-xs', className)}>
      <h5 className="font-heading font-semibold text-slate-900 mb-2">{current.title}</h5>
      <div className="flex flex-wrap items-center gap-3">
        {current.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className={cn('w-3 h-3 rounded-full shrink-0', item.color)} />
            <span className="text-slate-600 text-[11px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
