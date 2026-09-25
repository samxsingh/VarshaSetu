import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const DemoBanner: React.FC = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-amber-500/10 border-b border-amber-300 text-amber-950 px-4 py-2 text-xs transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Badge variant="demo" size="sm">
            {t('demo.banner')}
          </Badge>
          <span className="hidden sm:inline font-medium">
            {t('demo.bannerSub')}
          </span>
          <span className="sm:hidden font-medium">
            Simulated development data. No live APIs active.
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-amber-900 hover:text-amber-950 flex items-center gap-1 font-semibold underline text-[11px] shrink-0"
        >
          <span>{isExpanded ? 'Less' : 'Why?'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-200 text-amber-900 leading-relaxed text-xs">
          <p className="flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Scientific Transparency Rule:</strong> VarshaSetu does not invent forecast accuracy or present simulated estimates as verified operational meteorology. In this Phase 1B frontend shell, climate patterns and crop models reflect controlled development scenarios calibrated against Lucknow District, UP climatological baselines.
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
