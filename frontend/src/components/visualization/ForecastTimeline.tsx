import React from 'react';
import { cn } from '../../utils/cn';

export interface TimelineStage {
  id: string;
  name: string;
  timestamp?: string;
  status: 'completed' | 'active' | 'pending' | 'gated';
  details?: string;
}

export interface RainfallDailyBar {
  date: string;
  label: string; // e.g. "Jun 26"
  rainfallMm: number;
  isPeak?: boolean;
}

export interface ForecastTimelineProps {
  mode?: 'process' | 'rainfall';
  stages?: TimelineStage[];
  rainfallData?: RainfallDailyBar[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ForecastTimeline: React.FC<ForecastTimelineProps> = ({
  mode = 'rainfall',
  stages = [],
  rainfallData = [],
  title,
  subtitle,
  className,
}) => {
  if (mode === 'process') {
    return (
      <div className={cn('space-y-3', className)} role="region" aria-label="Forecast generation pipeline lifecycle">
        {title && (
          <div className="flex items-baseline justify-between">
            <h4 className="font-heading font-black text-xs text-[#102A43] uppercase tracking-wider">
              {title}
            </h4>
            {subtitle && (
              <span className="text-[11px] text-[#486581] font-mono">{subtitle}</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
          {stages.map((stg, idx) => {
            const isCompleted = stg.status === 'completed';
            const isActive = stg.status === 'active';
            const isGated = stg.status === 'gated';

            return (
              <div
                key={stg.id}
                className={cn(
                  'p-3 rounded-xl border-2 transition-all',
                  isCompleted
                    ? 'bg-[#E4F0E8] border-[#3F7D58] shadow-[2px_2px_0px_#3F7D58]'
                    : isActive
                    ? 'bg-[#E8F4F6] border-[#0E7490] shadow-[2px_2px_0px_#0E7490]'
                    : isGated
                    ? 'bg-[#FEF3C7] border-[#D97706] shadow-[2px_2px_0px_#D97706]'
                    : 'bg-[#F3F6F7] border-[#102A43]/20'
                )}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="text-[#829AB1]">0{idx + 1}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded uppercase text-[9px]',
                      isCompleted
                        ? 'text-[#3F7D58]'
                        : isActive
                        ? 'text-[#0E7490]'
                        : isGated
                        ? 'text-[#D97706]'
                        : 'text-[#829AB1]'
                    )}
                  >
                    {stg.status}
                  </span>
                </div>
                <div className="font-heading font-black text-xs text-[#102A43] mt-1">
                  {stg.name}
                </div>
                {stg.timestamp && (
                  <div className="text-[10px] font-mono text-[#486581] mt-0.5">
                    {stg.timestamp}
                  </div>
                )}
                {stg.details && (
                  <div className="text-[10px] text-[#829AB1] mt-1 line-clamp-2">
                    {stg.details}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // mode === 'rainfall'
  const maxRain = Math.max(...rainfallData.map((d) => d.rainfallMm), 10);

  return (
    <div className={cn('space-y-3', className)} role="region" aria-label="Daily rainfall forecast timeline">
      {title && (
        <div className="flex items-baseline justify-between">
          <h4 className="font-heading font-black text-xs text-[#102A43] uppercase tracking-wider">
            {title}
          </h4>
          {subtitle && (
            <span className="text-[11px] text-[#486581] font-sans font-medium">{subtitle}</span>
          )}
        </div>
      )}

      {/* Accessible Table for Screen Readers */}
      <table className="sr-only">
        <caption>Daily rainfall distribution</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Rainfall (mm)</th>
          </tr>
        </thead>
        <tbody>
          {rainfallData.map((d) => (
            <tr key={d.date}>
              <td>{d.label}</td>
              <td>{d.rainfallMm} mm</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Visual Bars */}
      <div className="p-4 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15">
        <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
          {rainfallData.map((d) => {
            const heightPct = Math.min(100, Math.max(12, Math.round((d.rainfallMm / maxRain) * 100)));
            return (
              <div key={d.date} className="flex flex-col items-center justify-end h-full gap-1.5 group">
                <span className="text-[10px] font-mono font-bold text-[#102A43] group-hover:scale-110 transition-transform">
                  {d.rainfallMm}mm
                </span>
                <div className="w-full bg-[#EAF0F2] rounded-t-md h-full flex items-end overflow-hidden border border-[#102A43]/10">
                  <div
                    className={cn(
                      'w-full transition-all duration-300 rounded-t-md',
                      d.isPeak
                        ? 'bg-[#2563EB] shadow-sm'
                        : d.rainfallMm > 25
                        ? 'bg-[#0E7490]'
                        : 'bg-[#0891B2]'
                    )}
                    style={{ height: `${heightPct}%` }}
                    title={`${d.label}: ${d.rainfallMm} mm`}
                  />
                </div>
                <span className="text-[10px] font-heading font-bold text-[#486581] uppercase tracking-tight">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
