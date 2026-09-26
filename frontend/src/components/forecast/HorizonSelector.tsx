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
        'inline-flex items-center bg-[#EAF0F2] p-1.5 rounded-xl border-2 border-[#102A43] overflow-x-auto no-scrollbar max-w-full shadow-[2px_2px_0px_#102A43] gap-1',
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
              'flex items-center justify-center font-heading font-bold transition-all rounded-lg whitespace-nowrap select-none min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm',
              isActive
                ? 'bg-[#0E7490] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43]'
                : 'text-[#486581] hover:text-[#102A43] hover:bg-white/70 border-2 border-transparent active:translate-x-0.5 active:translate-y-0.5'
            )}
          >
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
