import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { cn } from '../../utils/cn';

export interface TargetRiskCardProps {
  title: string;
  icon: React.ReactNode;
  probabilityPercent: number; // 0 to 100 integer
  statusLabel: string;
  variant?: 'teal' | 'amber' | 'azure' | 'emerald' | 'crimson';
  description?: string;
  timeframeText?: string;
  confidenceText?: string;
  isSimulated?: boolean;
  className?: string;
}

export const TargetRiskCard: React.FC<TargetRiskCardProps> = ({
  title,
  icon,
  probabilityPercent,
  statusLabel,
  variant = 'teal',
  description,
  timeframeText,
  confidenceText,
  isSimulated = true,
  className,
}) => {
  const roundedPercent = Math.round(probabilityPercent);

  const variantStyles = {
    teal: {
      bg: 'bg-[#E8F4F6]/50',
      text: 'text-[#0E7490]',
      badge: 'bg-[#E8F4F6] text-[#0E7490] border-[#0E7490]/40',
    },
    amber: {
      bg: 'bg-[#FEF3C7]/60',
      text: 'text-[#D97706]',
      badge: 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40',
    },
    azure: {
      bg: 'bg-[#DBEAFE]/40',
      text: 'text-[#2563EB]',
      badge: 'bg-[#DBEAFE] text-[#1E40AF] border-[#2563EB]/40',
    },
    emerald: {
      bg: 'bg-[#EBF5EE]',
      text: 'text-[#3F7D58]',
      badge: 'bg-[#EBF5EE] text-[#3F7D58] border-[#3F7D58]/40',
    },
    crimson: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#DC2626]',
      badge: 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/40',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] p-5 flex flex-col justify-between',
        style.bg,
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={cn('p-2 rounded-xl bg-white border border-[#102A43]/20 shadow-[1px_1px_0px_#102A43]', style.text)}>
              {icon}
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#102A43]">
                {title}
              </h4>
              {timeframeText && (
                <span className="text-[10px] text-[#486581] font-mono block mt-0.5">
                  {timeframeText}
                </span>
              )}
            </div>
          </div>

          <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border', style.badge)}>
            {statusLabel}
          </span>
        </div>

        <div className="my-3.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-black text-3xl sm:text-4xl text-[#102A43] tracking-tight">
              {roundedPercent}%
            </span>
            <span className="text-xs text-[#829AB1] font-medium font-sans">probability</span>
          </div>

          {confidenceText && (
            <span className="text-[11px] text-[#486581] font-medium font-sans block mt-0.5">
              Confidence: <strong className="text-[#102A43]">{confidenceText}</strong>
            </span>
          )}
        </div>

        <Progress value={roundedPercent} color={variant} height="sm" />

        {description && (
          <p className="text-xs text-[#486581] font-sans mt-3 leading-relaxed bg-white p-2.5 rounded-xl border border-[#102A43]/15">
            {description}
          </p>
        )}
      </div>

      {isSimulated && (
        <div className="mt-3.5 pt-2.5 border-t border-[#102A43]/10 flex justify-between items-center text-[10px] font-mono text-[#829AB1]">
          <span>Diagnostic Prior</span>
          <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] border border-[#D97706]/40 text-[#B45309] font-bold">
            SIMULATED DATA
          </span>
        </div>
      )}
    </div>
  );
};
