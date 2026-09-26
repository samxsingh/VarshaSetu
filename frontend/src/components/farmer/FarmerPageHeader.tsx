import React from 'react';
import { ScientificStatusBadge } from './ScientificStatusBadge';

interface FarmerPageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  status?: string;
  badgeLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const FarmerPageHeader: React.FC<FarmerPageHeaderProps> = ({
  eyebrow = 'FARMER INTELLIGENCE',
  title,
  subtitle,
  status = 'DIAGNOSTIC ONLY',
  badgeLabel,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border-2 border-[#102A43] p-6 lg:p-7 shadow-[4px_4px_0px_#102A43] mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden ${className}`}
    >
      <div className="space-y-3 max-w-2xl relative z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#E8F4F6] border border-[#0E7490]/40 text-[#155E75] text-xs font-heading font-extrabold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#102A43]">
            <span>{eyebrow}</span>
          </div>

          <ScientificStatusBadge status={status} size="sm" />

          {badgeLabel && (
            <span className="px-2 py-0.5 rounded bg-[#F3F6F7] border border-[#102A43]/20 text-[#102A43] text-[10px] font-mono font-bold uppercase tracking-wider">
              {badgeLabel}
            </span>
          )}
        </div>

        <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#102A43] tracking-tight leading-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm sm:text-base text-[#486581] leading-relaxed font-sans">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="shrink-0 self-start md:self-end relative z-10">
          {actions}
        </div>
      )}
    </div>
  );
};
