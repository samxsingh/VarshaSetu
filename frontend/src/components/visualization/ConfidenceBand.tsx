import React from 'react';
import { cn } from '../../utils/cn';

export interface ConfidenceBandProps {
  label: string;
  pointEstimate: number; // e.g. 42 mm or 65%
  unit?: string; // e.g. "mm" or "%"
  lowerBound: number; // e.g. P10 (28 mm)
  upperBound: number; // e.g. P90 (62 mm)
  ensembleMembers?: number; // e.g. 51 ensemble members
  ensembleSpreadStdDev?: number; // e.g. 8.4 mm
  minScale?: number;
  maxScale?: number;
  confidenceTier?: string; // e.g. "HIGH CONFIDENCE (84% ENSEMBLE CONVERGENCE)"
  methodology?: string; // e.g. "Quantile Regression & SEAS5 Multi-Model Ensemble"
  className?: string;
}

export const ConfidenceBand: React.FC<ConfidenceBandProps> = ({
  label,
  pointEstimate,
  unit = 'mm',
  lowerBound,
  upperBound,
  ensembleMembers = 51,
  ensembleSpreadStdDev,
  minScale = 0,
  maxScale = 100,
  confidenceTier = 'MODERATE SPREAD',
  methodology = 'Parametric Resampling & Quantile Bounds',
  className,
}) => {
  const range = Math.max(maxScale - minScale, 1);
  const leftPct = Math.max(0, Math.min(100, ((lowerBound - minScale) / range) * 100));
  const rightPct = Math.max(0, Math.min(100, ((upperBound - minScale) / range) * 100));
  const bandWidth = Math.max(4, rightPct - leftPct);
  const pointPct = Math.max(0, Math.min(100, ((pointEstimate - minScale) / range) * 100));

  return (
    <div
      role="region"
      aria-label={`${label} forecast probability distribution and uncertainty band`}
      className={cn(
        'p-4 bg-white rounded-xl border-2 border-[#102A43] shadow-[3px_3px_0px_#102A43] space-y-3',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <span className="text-xs font-heading font-black text-[#102A43] uppercase tracking-wider block">
            {label}
          </span>
          <span className="text-[10px] text-[#486581] font-mono">
            {methodology}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#E8F4F6] border border-[#0E7490]/30 text-[#0E7490] self-start sm:self-auto">
          {confidenceTier}
        </span>
      </div>

      {/* Numerical breakdown with explicit separation */}
      <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F3F6F7] rounded-lg border border-[#102A43]/10 text-center">
        <div>
          <span className="text-[10px] font-mono text-[#829AB1] block uppercase">P10 Lower</span>
          <span className="font-mono font-bold text-sm text-[#486581]">
            {lowerBound} {unit}
          </span>
        </div>
        <div className="border-x border-[#102A43]/15">
          <span className="text-[10px] font-mono text-[#0E7490] block uppercase font-bold">Point Estimate</span>
          <span className="font-mono font-black text-lg text-[#102A43]">
            {pointEstimate} {unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-[#829AB1] block uppercase">P90 Upper</span>
          <span className="font-mono font-bold text-sm text-[#486581]">
            {upperBound} {unit}
          </span>
        </div>
      </div>

      {/* Visual Uncertainty Band */}
      <div className="space-y-1 pt-1">
        <div className="relative h-6 bg-[#EAF0F2] rounded-full border border-[#102A43]/20 overflow-hidden">
          {/* P10 - P90 Band */}
          <div
            className="absolute top-0 bottom-0 bg-[#0891B2]/30 border-x-2 border-[#0891B2] transition-all"
            style={{ left: `${leftPct}%`, width: `${bandWidth}%` }}
            title={`90% Confidence Interval: ${lowerBound} to ${upperBound} ${unit}`}
          />
          {/* Median / Point Estimate Marker */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-[#102A43] -ml-[3px] z-10 transition-all"
            style={{ left: `${pointPct}%` }}
            title={`Point Estimate: ${pointEstimate} ${unit}`}
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-[#829AB1] px-1">
          <span>{minScale} {unit}</span>
          <span className="text-[#486581]">
            Ensemble: {ensembleMembers} members
            {ensembleSpreadStdDev !== undefined && ` (σ = ${ensembleSpreadStdDev} ${unit})`}
          </span>
          <span>{maxScale} {unit}</span>
        </div>
      </div>
    </div>
  );
};
