import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Activity, Wind, CloudRain, Droplets, Info, ChevronDown, ChevronUp } from 'lucide-react';

export interface AtmosphericFeature {
  name: string;
  domain?: 'moisture' | 'wind' | 'instability' | 'antecedent' | 'other';
  impact: 'increases_risk' | 'decreases_risk' | 'neutral';
  contributionValue?: number; // e.g. SHAP value +0.24 or -0.12
  unit?: string;
  observationValue?: string | number;
  description: string;
  farmerFriendlyNote?: string;
}

export interface SignalExplanationProps {
  title?: string;
  features?: AtmosphericFeature[];
  mode?: 'compact' | 'detailed' | 'farmer';
  targetEvent?: string; // e.g. "Heavy Rainfall > 64.5mm"
  className?: string;
}

export const SignalExplanation: React.FC<SignalExplanationProps> = ({
  title = 'Atmospheric Signal Attribution',
  features = [],
  mode = 'detailed',
  targetEvent = 'Monsoon Event',
  className,
}) => {
  const [activeDomain, setActiveDomain] = useState<string>('all');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(mode === 'detailed');

  // Fallback realistic atmospheric features if none supplied
  const defaultFeatures: AtmosphericFeature[] = [
    {
      name: 'Precipitable Water / Total Column Moisture',
      domain: 'moisture',
      impact: 'increases_risk',
      contributionValue: 0.38,
      observationValue: '58 mm',
      description: 'High columnar atmospheric moisture influx over the western ghats corridor.',
      farmerFriendlyNote: 'High moisture in the air clouds building up over the region.',
    },
    {
      name: 'Low-Level Monsoon Jet (850 hPa)',
      domain: 'wind',
      impact: 'increases_risk',
      contributionValue: 0.29,
      observationValue: '34 kts',
      description: 'Strong westerly Arabian Sea synoptic flow advecting humid maritime boundary layer air.',
      farmerFriendlyNote: 'Strong sea-breeze winds carrying rain-bearing clouds inland.',
    },
    {
      name: 'Convective Available Potential Energy (CAPE)',
      domain: 'instability',
      impact: 'increases_risk',
      contributionValue: 0.21,
      observationValue: '1850 J/kg',
      description: 'Substantial thermodynamic instability supporting localized deep convection.',
      farmerFriendlyNote: 'Warm rising air creating thundercloud potential.',
    },
    {
      name: '7-Day Antecedent Soil Moisture',
      domain: 'antecedent',
      impact: 'decreases_risk',
      contributionValue: -0.14,
      observationValue: '32% Saturation',
      description: 'Deficit in soil moisture allows initial precipitation buffering and percolation.',
      farmerFriendlyNote: 'Dry topsoil can absorb initial rainfall before surface runoff occurs.',
    },
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  const domainIcons: Record<string, React.ReactNode> = {
    moisture: <Droplets className="w-3.5 h-3.5 text-[#0E7490]" />,
    wind: <Wind className="w-3.5 h-3.5 text-[#0891B2]" />,
    instability: <Activity className="w-3.5 h-3.5 text-[#D97706]" />,
    antecedent: <CloudRain className="w-3.5 h-3.5 text-[#3F7D58]" />,
    other: <Info className="w-3.5 h-3.5 text-[#486581]" />,
  };

  const filteredFeatures =
    activeDomain === 'all'
      ? displayFeatures
      : displayFeatures.filter((f) => (f.domain || 'other') === activeDomain);

  return (
    <div
      role="region"
      aria-label={`${title} for ${targetEvent}`}
      className={cn(
        'p-4 bg-white rounded-xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] space-y-3.5',
        className
      )}
    >
      {/* Title & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#102A43]/10">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-black text-xs text-[#102A43] uppercase tracking-wider">
              {title}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#EAF0F2] text-[#102A43] rounded border border-[#102A43]/20">
              TARGET: {targetEvent}
            </span>
          </div>
          <p className="text-[11px] text-[#486581] mt-0.5">
            Key physical indicators driving the active forecast calculation.
          </p>
        </div>

        {mode !== 'farmer' && (
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold text-[#102A43] bg-[#F3F6F7] hover:bg-[#EAF0F2] border border-[#102A43] rounded transition-colors self-start sm:self-auto cursor-pointer"
            aria-expanded={showTechnicalDetails}
          >
            {showTechnicalDetails ? 'Simplified View' : 'Technical Attribution'}
            {showTechnicalDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Domain Filters (if more than 3 features) */}
      {displayFeatures.length > 2 && (
        <div className="flex flex-wrap gap-1.5">
          {['all', 'moisture', 'wind', 'instability', 'antecedent'].map((domainKey) => (
            <button
              key={domainKey}
              type="button"
              onClick={() => setActiveDomain(domainKey)}
              className={cn(
                'px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border transition-colors cursor-pointer',
                activeDomain === domainKey
                  ? 'bg-[#102A43] text-white border-[#102A43]'
                  : 'bg-[#F3F6F7] text-[#486581] border-[#102A43]/20 hover:border-[#102A43]'
              )}
            >
              {domainKey === 'all' ? 'All Factors' : domainKey}
            </button>
          ))}
        </div>
      )}

      {/* Feature Attribution List */}
      <div className="space-y-2">
        {filteredFeatures.map((feat, idx) => {
          const isPositive = feat.contributionValue !== undefined ? feat.contributionValue > 0 : feat.impact === 'increases_risk';
          const domain = feat.domain || 'other';

          return (
            <div
              key={`${feat.name}-${idx}`}
              className="p-2.5 bg-[#F3F6F7] rounded-lg border border-[#102A43]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-white rounded border border-[#102A43]/20 mt-0.5 shrink-0">
                  {domainIcons[domain] || domainIcons.other}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-heading font-bold text-xs text-[#102A43]">
                      {feat.name}
                    </span>
                    {feat.observationValue && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white text-[#486581] border border-[#102A43]/10 rounded">
                        Obs: {feat.observationValue}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#486581] mt-0.5 leading-snug">
                    {mode === 'farmer' && feat.farmerFriendlyNote
                      ? feat.farmerFriendlyNote
                      : feat.description}
                  </p>
                </div>
              </div>

              {/* Attribution Impact Tag */}
              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 shrink-0 font-mono">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
                    isPositive
                      ? 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]/40'
                      : 'bg-[#E4F0E8] text-[#3F7D58] border-[#3F7D58]/40'
                  )}
                >
                  {isPositive ? 'Elevates Risk' : 'Reduces Risk'}
                </span>
                {showTechnicalDetails && feat.contributionValue !== undefined && (
                  <span className="text-[10px] text-[#829AB1]">
                    SHAP: {feat.contributionValue > 0 ? `+${feat.contributionValue.toFixed(2)}` : feat.contributionValue.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Non-Causal Scientific Disclaimer */}
      <div className="p-2 bg-[#EAF0F2] rounded-lg border border-[#102A43]/15 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-[#0E7490] shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#486581] leading-tight">
          <strong className="text-[#102A43]">Non-Causal Diagnostic Disclaimer:</strong> Physical signals
          describe empirical statistical contributions identified by the calibrated model ensemble. They reflect
          observed atmospheric co-variability and do not represent isolated deterministic physical causes.
        </p>
      </div>
    </div>
  );
};
