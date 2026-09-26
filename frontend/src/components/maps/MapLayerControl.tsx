import React from 'react';
import { CloudRain, SunMedium, CloudLightning, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOfficerStore, RiskMapLayer } from '../../stores/useOfficerStore';
import { cn } from '../../utils/cn';

export const MapLayerControl: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const { activeRiskLayer, setActiveRiskLayer } = useOfficerStore();

  const layers: { id: RiskMapLayer; label: string; icon: React.ReactNode }[] = [
    { id: 'DRY_SPELL', label: t('targets.drySpell', { defaultValue: 'Dry Spell' }), icon: <SunMedium className="w-3.5 h-3.5 text-[#E5A33D]" /> },
    { id: 'ONSET', label: t('targets.onset', { defaultValue: 'Onset Window' }), icon: <CloudRain className="w-3.5 h-3.5 text-[#008F83]" /> },
    { id: 'HEAVY_RAIN', label: t('targets.heavyRain', { defaultValue: 'Heavy Rain' }), icon: <CloudLightning className="w-3.5 h-3.5 text-[#3B82F6]" /> },
    { id: 'ANOMALY', label: t('targets.anomaly', { defaultValue: 'Departure' }), icon: <TrendingUp className="w-3.5 h-3.5 text-[#EF4444]" /> },
  ];

  return (
    <div
      role="group"
      aria-label="Map risk layer selector"
      className={cn(
        'bg-white border-2 border-[#0B1726] p-1 rounded-xl shadow-[2px_2px_0px_#0B1726] flex items-center gap-1 overflow-x-auto',
        className
      )}
    >
      <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#62768A] px-2.5 hidden sm:inline">
        LAYER:
      </span>
      {layers.map((layer) => {
        const isActive = activeRiskLayer === layer.id;
        return (
          <button
            key={layer.id}
            onClick={() => setActiveRiskLayer(layer.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all min-h-[36px] whitespace-nowrap border',
              isActive
                ? 'bg-[#0B1726] text-white border-[#0B1726] shadow-xs'
                : 'bg-white text-[#435466] border-transparent hover:text-[#0B1726] hover:bg-[#F7F3EA]'
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
