import React from 'react';
import { cn } from '../../utils/cn';

export interface ProbabilityBarProps {
  label: string;
  probability: number; // 0 to 100 or 0.0 to 1.0
  confidenceLabel?: string; // e.g. "High Confidence", "Moderate Confidence"
  confidenceLevel?: 'low' | 'moderate' | 'high';
  horizonLabel?: string; // e.g. "7-Day Planning Outlook"
  threshold?: number; // e.g. 50 (50% risk threshold marker)
  thresholdLabel?: string; // e.g. "Climatological Normal: 35%"
  categoryLabel?: string; // e.g. "Active Convective"
  colorVariant?: 'climate' | 'rain' | 'amber' | 'agri';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showNumericValue?: boolean;
}

export const ProbabilityBar: React.FC<ProbabilityBarProps> = ({
  label,
  probability,
  confidenceLabel,
  confidenceLevel = 'high',
  horizonLabel,
  threshold,
  thresholdLabel,
  categoryLabel,
  colorVariant = 'climate',
  size = 'md',
  className,
  showNumericValue = true,
}) => {
  // Normalize probability to 0-100
  const normalizedProb = Math.min(
    100,
    Math.max(0, probability <= 1 && probability >= 0 ? Math.round(probability * 100) : Math.round(probability))
  );

  const fillColors = {
    climate: 'bg-[#0E7490]',
    rain: 'bg-[#2563EB]',
    amber: 'bg-[#D97706]',
    agri: 'bg-[#3F7D58]',
  };

  const confidenceBadge = {
    low: 'bg-[#F3F6F7] text-[#486581] border-[#102A43]/20',
    moderate: 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]/40',
    high: 'bg-[#E4F0E8] text-[#3F7D58] border-[#3F7D58]/40',
  }[confidenceLevel];

  const heightClass = {
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
  }[size];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#102A43] block">
            {label}
          </span>
          {categoryLabel && (
            <span className="text-[11px] text-[#486581] font-medium block">
              {categoryLabel}
            </span>
          )}
        </div>

        {showNumericValue && (
          <div className="text-right">
            <span className="font-heading font-black text-2xl sm:text-3xl text-[#102A43]">
              {normalizedProb}%
            </span>
            <span className="text-[10px] uppercase font-bold text-[#829AB1] ml-1 block">
              probability
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="relative">
        <div
          role="progressbar"
          aria-label={`${label} probability`}
          aria-valuenow={normalizedProb}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${normalizedProb}% ${label}`}
          className={cn(
            'w-full bg-[#EAF0F2] rounded-full border-2 border-[#102A43] overflow-hidden shadow-[1.5px_1.5px_0px_#102A43]',
            heightClass
          )}
        >
          <div
            className={cn('h-full transition-all duration-300', fillColors[colorVariant])}
            style={{ width: `${normalizedProb}%` }}
          />
        </div>

        {/* Optional Threshold Reference Tick */}
        {threshold !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#102A43] z-10"
            style={{ left: `${threshold}%` }}
            title={thresholdLabel || `Threshold: ${threshold}%`}
            aria-hidden="true"
          >
            <div className="w-1.5 h-1.5 bg-[#102A43] rounded-full -ml-[2px] -mt-[3px]" />
          </div>
        )}
      </div>

      {/* Supporting Provenance / Confidence / Horizon Row */}
      <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5 flex-wrap">
        <div className="flex items-center gap-2">
          {confidenceLabel && (
            <span
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border',
                confidenceBadge
              )}
            >
              Confidence: {confidenceLabel}
            </span>
          )}
          {thresholdLabel && (
            <span className="text-[10px] text-[#829AB1] font-mono">
              Ref: {thresholdLabel}
            </span>
          )}
        </div>

        {horizonLabel && (
          <span className="text-[10px] text-[#486581] font-mono font-medium">
            Horizon: {horizonLabel}
          </span>
        )}
      </div>
    </div>
  );
};
