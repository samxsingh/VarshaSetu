import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      aria-label="Simulation and scientific transparency notice"
      className="bg-[#FFFFFF] border-b border-[#B8C5CC] text-[#486581] text-xs transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Scientific amber badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FEF3C7] border border-[#D97706]/60 text-[#102A43] font-heading font-bold text-[11px] tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            {t('demo.banner', { defaultValue: 'DEMO / SIMULATED DATA' })}
          </span>

          <span className="hidden sm:inline font-sans text-xs text-[#486581] font-medium">
            {t('demo.bannerSub', {
              defaultValue: 'Development environment: Observational anchor Lucknow (UP_LKO_BKT, Kharif 2024). Operational mode: DIAGNOSTIC_ONLY.'
            })}
          </span>
          <span className="sm:hidden font-sans text-xs text-[#486581]">
            Simulated development data. No live APIs active.
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="text-[#102A43] hover:text-[#0E7490] flex items-center gap-1 font-heading font-semibold text-xs tracking-tight shrink-0 transition-colors py-0.5 px-1.5 rounded hover:bg-[#EAF0F2]"
        >
          <span>{isExpanded ? 'Less' : 'Why?'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#0E7490]" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-[#B8C5CC] bg-[#EAF0F2] px-4 sm:px-6 lg:px-8 py-2.5 text-xs text-[#486581] leading-relaxed animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <p>
                <strong className="text-[#102A43] font-heading font-semibold">Scientific Transparency Rule: </strong>
                VarshaSetu does not invent forecast accuracy or present simulated estimates as verified operational meteorology. In this platform release, climate patterns and crop models reflect controlled development scenarios calibrated against Lucknow District (UP_LKO_BKT) climatological baselines.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
