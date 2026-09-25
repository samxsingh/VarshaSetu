import React from 'react';
import { CloudRain, SunMedium, CloudLightning, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOfficerStore, RiskMapLayer } from '../../stores/useOfficerStore';
import { cn } from '../../utils/cn';

export const MapLayerControl: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const { activeRiskLayer, setActiveRiskLayer } = useOfficerStore();

  const layers: { id: RiskMapLayer; label: string; icon: React.ReactNode }[] = [
    { id: 'DRY_SPELL', label: t('targets.drySpell'), icon: <SunMedium className="w-4 h-4 text-brand-amber" /> },
    { id: 'ONSET', label: t('targets.onset'), icon: <CloudRain className="w-4 h-4 text-brand-teal" /> },
    { id: 'HEAVY_RAIN', label: t('targets.heavyRain'), icon: <CloudLightning className="w-4 h-4 text-brand-azure" /> },
    { id: 'ANOMALY', label: t('targets.anomaly'), icon: <TrendingUp className="w-4 h-4 text-brand-crimson" /> },
  ];

  return (
    <div
      role="group"
      aria-label="Map risk layer selector"
      className={cn('bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-surface-border shadow-elevated flex items-center gap-1 overflow-x-auto', className)}
    >
      <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-slate-500 px-2.5 hidden sm:inline">
        Layer:
      </span>
      {layers.map((layer) => {
        const isActive = activeRiskLayer === layer.id;
        return (
          <button
            key={layer.id}
            onClick={() => setActiveRiskLayer(layer.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all min-h-[36px] whitespace-nowrap',
              isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            {layer.icon}
            <span>{layer.label}</span>
          </button>
        );
      })}
    </div>
  );
};
