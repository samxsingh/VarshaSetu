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
      bg: 'bg-brand-teal-tint/40 border-brand-teal-border/70',
      text: 'text-brand-teal-dark',
    },
    amber: {
      bg: 'bg-brand-amber-tint/40 border-brand-amber-border/70',
      text: 'text-brand-amber-dark',
    },
    azure: {
      bg: 'bg-brand-azure-tint/40 border-brand-azure-border/70',
      text: 'text-brand-azure-dark',
    },
    emerald: {
      bg: 'bg-brand-emerald-tint/40 border-brand-emerald-border/70',
      text: 'text-brand-emerald-dark',
    },
    crimson: {
      bg: 'bg-brand-crimson-tint/40 border-brand-crimson-border/70',
      text: 'text-brand-crimson-dark',
    },
  };

  const style = variantStyles[variant];

  return (
    <Card className={cn('p-4 flex flex-col justify-between border', style.bg, className)}>
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg bg-white/80 border border-surface-border/60', style.text)}>
              {icon}
            </div>
            <div>
              <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-900">
                {title}
              </h4>
              {timeframeText && (
                <span className="text-[10px] text-slate-500 font-medium block">
                  {timeframeText}
                </span>
              )}
            </div>
          </div>

          <Badge variant={variant} size="sm">
            {statusLabel}
          </Badge>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-bold text-3xl text-slate-900">
              {roundedPercent}%
            </span>
            <span className="text-xs text-slate-500 font-medium">probability</span>
          </div>

          {confidenceText && (
            <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
              Confidence: {confidenceText}
            </span>
          )}
        </div>

        <Progress value={roundedPercent} color={variant} height="sm" />

        {description && (
          <p className="text-xs text-slate-700 mt-2.5 leading-relaxed bg-white/70 p-2 rounded-lg border border-surface-border/50">
            {description}
          </p>
        )}
      </div>

      {isSimulated && (
        <div className="mt-3 pt-2 border-t border-surface-border/50 flex justify-between items-center text-[10px] text-slate-500">
          <span>Demo Model Calibration</span>
          <span className="font-semibold text-amber-800">SIMULATED DATA</span>
        </div>
      )}
    </Card>
  );
};
