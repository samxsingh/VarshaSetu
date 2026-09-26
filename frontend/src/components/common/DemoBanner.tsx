import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      aria-label="Simulation and scientific transparency notice"
      className="bg-[#FBF8F1] border-b border-[#E5DFD3] text-[#435466] text-xs transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Intentional warm amber badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F7E8C7] border border-[#E5A33D]/60 text-[#0B1726] font-heading font-bold text-[11px] tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5A33D] animate-pulse" />
            {t('demo.banner', { defaultValue: 'DEMO / SIMULATED DATA' })}
          </span>

          <span className="hidden sm:inline font-sans text-xs text-[#435466] font-medium">
            {t('demo.bannerSub', {
              defaultValue: 'Development environment: Observational anchor Lucknow (UP_LKO_BKT, Kharif 2024). Operational mode: DIAGNOSTIC_ONLY.'
            })}
          </span>
          <span className="sm:hidden font-sans text-xs text-[#435466]">
            Simulated development data. No live APIs active.
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="text-[#0B1726] hover:text-[#008F83] flex items-center gap-1 font-heading font-semibold text-xs tracking-tight shrink-0 transition-colors py-0.5 px-1.5 rounded hover:bg-[#F2ECE0]"
        >
          <span>{isExpanded ? 'Less' : 'Why?'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#008F83]" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-[#E5DFD3] bg-[#F7F3EA] px-4 sm:px-6 lg:px-8 py-2.5 text-xs text-[#435466] leading-relaxed animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#E5A33D] shrink-0 mt-0.5" />
            <div>
              <p>
                <strong className="text-[#0B1726] font-heading font-semibold">Scientific Transparency Rule: </strong>
                VarshaSetu does not invent forecast accuracy or present simulated estimates as verified operational meteorology. In this platform release, climate patterns and crop models reflect controlled development scenarios calibrated against Lucknow District (UP_LKO_BKT) climatological baselines.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
