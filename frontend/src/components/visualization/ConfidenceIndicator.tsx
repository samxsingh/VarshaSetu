import React from 'react';
import { cn } from '../../utils/cn';
import { ShieldAlert, Info, HelpCircle } from 'lucide-react';

export interface ConfidenceIndicatorProps {
  probability?: number | null; // e.g. 78 or 0.78
  confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_CONFIGURED';
  confidenceScore?: number; // e.g. 0.84
  uncertaintyRange?: {
    lower: number;
    upper: number;
    unit?: string;
    method?: string;
  };
  baselineReference?: string; // e.g. "Climatological Normal: 35%"
  label?: string; // e.g. "Heavy Rain Risk"
  showDefinitions?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  probability,
  confidenceLevel = 'NOT_CONFIGURED',
  confidenceScore,
  uncertaintyRange,
  baselineReference,
  label = 'Precipitation Risk Signal',
  showDefinitions = false,
  size = 'md',
  className,
}) => {
  // Normalize probability to percentage
  const normalizedProb =
    probability !== undefined && probability !== null
      ? probability <= 1 && probability >= 0
        ? Math.round(probability * 100)
        : Math.round(probability)
      : null;

  const confidenceBadge = {
    HIGH: {
      bg: 'bg-[#E4F0E8] text-[#3F7D58] border-[#3F7D58]/40',
      label: 'HIGH CONFIDENCE',
      desc: 'Ensemble agreement > 80% & low calibration error (ECE < 0.05)',
    },
    MEDIUM: {
      bg: 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]/40',
      label: 'MODERATE CONFIDENCE',
      desc: 'Moderate ensemble spread; historical holdout skill confirmed',
    },
    LOW: {
      bg: 'bg-[#F3F6F7] text-[#486581] border-[#102A43]/20',
      label: 'LOW CONFIDENCE',
      desc: 'High ensemble divergence or extended multi-week horizon variance',
    },
    NOT_CONFIGURED: {
      bg: 'bg-[#F3F6F7] text-[#829AB1] border-[#102A43]/15',
      label: 'CONFIDENCE NOT CONFIGURED',
      desc: 'Ensemble dispersion telemetry not serialized for active product',
    },
  }[confidenceLevel];

  return (
    <div
      role="region"
      aria-label={`${label} probability, confidence, and uncertainty distribution`}
      className={cn(
        'p-3.5 bg-white rounded-xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] space-y-3 text-xs',
        className
      )}
    >
      {/* Header with Title and Distinction Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[#102A43]/10">
        <div>
          <span className="font-heading font-black text-xs text-[#102A43] uppercase tracking-wider block">
            {label}
          </span>
          <span className="text-[10px] text-[#486581] font-mono">
            Statistical Probability ≠ Predictive Certainty
          </span>
        </div>
        <span
          className={cn(
            'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border self-start sm:self-auto',
            confidenceBadge.bg
          )}
        >
          {confidenceBadge.label}
          {confidenceScore !== undefined && ` (${confidenceScore.toFixed(2)})`}
        </span>
      </div>

      {/* Triad Metric Grid: Probability, Confidence, Uncertainty */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center font-mono">
        {/* 1. Probability */}
        <div className="p-2.5 bg-[#F3F6F7] rounded-lg border border-[#102A43]/10">
          <span className="text-[9px] uppercase font-bold text-[#829AB1] block">
            Event Probability
          </span>
          <div className="text-xl font-heading font-black text-[#102A43] mt-0.5">
            {normalizedProb !== null ? `${normalizedProb}%` : '—'}
          </div>
          <span className="text-[9px] text-[#486581] block">
            Calibrated likelihood
          </span>
        </div>

        {/* 2. Uncertainty Band */}
        <div className="p-2.5 bg-[#F3F6F7] rounded-lg border border-[#102A43]/10">
          <span className="text-[9px] uppercase font-bold text-[#829AB1] block">
            Uncertainty (P10–P90)
          </span>
          <div className="text-base font-mono font-bold text-[#0E7490] mt-1">
            {uncertaintyRange ? (
              uncertaintyRange.unit === '%'
                ? `${uncertaintyRange.lower} – ${uncertaintyRange.upper}%`
                : `${uncertaintyRange.lower} – ${uncertaintyRange.upper} ${uncertaintyRange.unit || 'mm'}`
            ) : (
              <span className="text-xs text-[#829AB1]">Not configured</span>
            )}
          </div>
          <span className="text-[9px] text-[#486581] block">
            90% confidence spread
          </span>
        </div>

        {/* 3. Reference Baseline */}
        <div className="p-2.5 bg-[#F3F6F7] rounded-lg border border-[#102A43]/10">
          <span className="text-[9px] uppercase font-bold text-[#829AB1] block">
            Reference Baseline
          </span>
          <div className="text-xs font-mono font-bold text-[#102A43] mt-1.5 truncate">
            {baselineReference || 'Climatology: Kharif 2024'}
          </div>
          <span className="text-[9px] text-[#486581] block">
            Long-term normal
          </span>
        </div>
      </div>

      {/* Scientific Distinction Footnote */}
      {showDefinitions && (
        <div className="p-2 bg-[#EAF0F2] rounded-lg border border-[#102A43]/10 text-[10px] text-[#486581] leading-relaxed">
          <strong className="text-[#102A43]">Scientific Definition:</strong> Probability reflects the calibrated fraction of ensemble members exceeding threshold. Confidence indicates model reliability across historical holdout validation.
        </div>
      )}
    </div>
  );
};
