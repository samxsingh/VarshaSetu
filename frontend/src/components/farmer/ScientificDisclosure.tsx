import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface ScientificDisclosureProps {
  title?: string;
  message?: string;
  anchorText?: string;
  className?: string;
  variant?: 'warning' | 'info';
}

export const ScientificDisclosure: React.FC<ScientificDisclosureProps> = ({
  title = 'Scientific Operational Disclosure',
  message = 'Diagnostic demonstration mode anchored to UP_LKO_BKT (Kharif 2024 archive). This system does not generate operational weather forecasts or commercial crop yield projections.',
  anchorText = 'UP_LKO_BKT · Kharif 2024 · 122 observations',
  className = '',
  variant = 'warning',
}) => {
  const isWarning = variant === 'warning';

  return (
    <div
      className={`rounded-xl border-2 border-[#0B1726] p-4 text-xs font-sans shadow-[3px_3px_0px_#0B1726] ${
        isWarning
          ? 'bg-[#FEF6E9] border-[#0B1726] text-[#7A4B00]'
          : 'bg-[#DCEFF0] border-[#0B1726] text-[#006B65]'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        {isWarning ? (
          <ShieldAlert className="w-4 h-4 text-[#E5A33D] shrink-0 mt-0.5" />
        ) : (
          <Info className="w-4 h-4 text-[#008F83] shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap font-heading font-bold text-xs uppercase tracking-wide text-[#0B1726]">
            <span>{title}</span>
            {anchorText && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/70 border border-[#0B1726]/20">
                {anchorText}
              </span>
            )}
          </div>
          <p className="leading-relaxed text-[#435466]">{message}</p>
        </div>
      </div>
    </div>
  );
};
