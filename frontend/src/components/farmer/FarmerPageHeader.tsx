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
      className={`bg-white rounded-2xl border-2 border-[#0B1726] p-6 lg:p-7 shadow-[4px_4px_0px_#0B1726] mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden ${className}`}
    >
      <div className="space-y-3 max-w-2xl relative z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#DCEFF0] border border-[#008F83]/40 text-[#006B65] text-xs font-heading font-extrabold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#0B1726]">
            <span>{eyebrow}</span>
          </div>

          <ScientificStatusBadge status={status} size="sm" />

          {badgeLabel && (
            <span className="px-2 py-0.5 rounded bg-[#F7F3EA] border border-[#0B1726]/20 text-[#0B1726] text-[10px] font-mono font-bold uppercase tracking-wider">
              {badgeLabel}
            </span>
          )}
        </div>

        <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#0B1726] tracking-tight leading-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm sm:text-base text-[#435466] leading-relaxed font-sans">
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
