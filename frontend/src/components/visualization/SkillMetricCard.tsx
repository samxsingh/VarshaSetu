import React from 'react';
import { cn } from '../../utils/cn';

export interface SkillMetricCardProps {
  label: string;
  metricKey?: string;
  value: string | number;
  benchmarkRef?: string; // e.g. "Climatology BS: 0.138"
  benchmarkDelta?: string; // e.g. "+19.4% improvement"
  interpretation: string; // e.g. "Lower error is better (0.0 = perfect score)"
  statusTag?: string; // e.g. "SKILL CONFIRMED", "GATED"
  statusVariant?: 'positive' | 'warning' | 'neutral' | 'info';
  className?: string;
}

export const SkillMetricCard: React.FC<SkillMetricCardProps> = ({
  label,
  metricKey,
  value,
  benchmarkRef,
  benchmarkDelta,
  interpretation,
  statusTag,
  statusVariant = 'neutral',
  className,
}) => {
  const statusStyles = {
    positive: 'bg-[#E4F0E8] text-[#3F7D58] border-[#3F7D58]/40',
    warning: 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]/40',
    info: 'bg-[#E8F4F6] text-[#0E7490] border-[#0E7490]/40',
    neutral: 'bg-[#F3F6F7] text-[#486581] border-[#102A43]/20',
  }[statusVariant];

  return (
    <div
      className={cn(
        'p-4 bg-white rounded-xl border-2 border-[#102A43] shadow-[3px_3px_0px_#102A43] flex flex-col justify-between space-y-3',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-heading font-black text-[#102A43] block">
            {label}
          </span>
          {metricKey && (
            <span className="text-[10px] font-mono text-[#829AB1] uppercase block">
              {metricKey}
            </span>
          )}
        </div>
        {statusTag && (
          <span
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border shrink-0',
              statusStyles
            )}
          >
            {statusTag}
          </span>
        )}
      </div>

      <div>
        <div className="font-mono font-black text-2xl sm:text-3xl text-[#102A43] tracking-tight">
          {value}
        </div>
        {benchmarkDelta && (
          <div className="text-xs font-mono font-bold text-[#3F7D58] mt-0.5">
            {benchmarkDelta}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[#102A43]/10 space-y-0.5 text-[10px]">
        {benchmarkRef && (
          <div className="text-[#486581] font-mono">
            <span className="text-[#829AB1]">Ref:</span> {benchmarkRef}
          </div>
        )}
        <div className="text-[#829AB1] font-sans">
          {interpretation}
        </div>
      </div>
    </div>
  );
};
