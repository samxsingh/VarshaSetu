import React from 'react';
import { useTranslation } from 'react-i18next';
import { ForecastHorizonDays } from '@shared/types';
import { cn } from '../../utils/cn';

export interface HorizonSelectorProps {
  value: ForecastHorizonDays;
  onChange: (horizon: ForecastHorizonDays) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const HorizonSelector: React.FC<HorizonSelectorProps> = ({
  value,
  onChange,
  className,
  size = 'md',
}) => {
  const { t } = useTranslation();

  const horizons: { days: ForecastHorizonDays; label: string }[] = [
    { days: 7, label: t('farmer.sevenDay') },
    { days: 14, label: t('farmer.fourteenDay') },
    { days: 21, label: t('farmer.twentyOneDay') },
    { days: 30, label: t('farmer.thirtyDay') },
  ];

  return (
    <div
      role="tablist"
      aria-label="Forecast horizon selection"
      className={cn(
        'inline-flex items-center bg-surface-muted p-1 rounded-full border border-surface-border overflow-x-auto no-scrollbar max-w-full',
        className
      )}
    >
      {horizons.map(({ days, label }) => {
        const isActive = value === days;

        return (
          <button
            key={days}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(days)}
            className={cn(
              'flex items-center justify-center font-heading font-semibold transition-all rounded-full whitespace-nowrap select-none min-h-[36px]',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm',
              isActive
                ? 'bg-brand-teal text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            )}
          >
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
