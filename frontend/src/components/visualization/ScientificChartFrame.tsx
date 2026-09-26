import React from 'react';
import { cn } from '../../utils/cn';

export interface ScientificChartFrameProps {
  title: string;
  subtitle?: string;
  provenance?: string;
  statusBadge?: React.ReactNode;
  actions?: React.ReactNode;
  ariaLabel: string;
  ariaDescription?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  variant?: 'surface' | 'canvas' | 'inset';
}

export const ScientificChartFrame: React.FC<ScientificChartFrameProps> = ({
  title,
  subtitle,
  provenance,
  statusBadge,
  actions,
  ariaLabel,
  ariaDescription,
  children,
  footer,
  className,
  variant = 'surface',
}) => {
  const bgClass =
    variant === 'canvas'
      ? 'bg-[#F3F6F7]'
      : variant === 'inset'
      ? 'bg-[#EAF0F2]'
      : 'bg-white';

  return (
    <figure
      role="region"
      aria-label={ariaLabel}
      className={cn(
        'rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] overflow-hidden',
        bgClass,
        className
      )}
    >
      <header className="p-4 sm:p-5 border-b-2 border-[#102A43]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-heading font-black text-base sm:text-lg text-[#102A43] tracking-tight">
              {title}
            </h3>
            {statusBadge}
          </div>
          {subtitle && (
            <p className="text-xs text-[#486581] mt-0.5 font-sans font-medium">
              {subtitle}
            </p>
          )}
          {provenance && (
            <span className="inline-block text-[10px] font-mono text-[#829AB1] mt-1">
              {provenance}
            </span>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </header>

      {ariaDescription && (
        <div className="sr-only" aria-live="polite">
          {ariaDescription}
        </div>
      )}

      <div className="p-4 sm:p-5">{children}</div>

      {footer && (
        <footer className="px-4 sm:px-5 py-3 border-t border-[#102A43]/10 bg-[#F3F6F7] text-xs text-[#486581]">
          {footer}
        </footer>
      )}
    </figure>
  );
};
