import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScientificStatusBadge } from './ScientificStatusBadge';

export const WhatIfPreviewCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border-2 border-[#0B1726] shadow-[4px_4px_0px_#0B1726] p-5 sm:p-6 mb-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-1.5 rounded-lg bg-[#008F83] text-white shadow-[1.5px_1.5px_0px_#0B1726]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-heading font-black text-lg text-[#0B1726]">
              {t('simulator.title') || 'What-If Sowing Decision Simulator'}
            </h3>
            <ScientificStatusBadge status="SCENARIO SIMULATOR" size="sm" />
          </div>
          <p className="text-xs text-[#435466] max-w-xl leading-relaxed font-sans">
            Unsure whether to sow this week or hold off? Compare risk scores, soil moisture projections, and nursery timing for <em>"Sow Now"</em> versus <em>"Wait 7 Days"</em>.
          </p>
        </div>

        <Link to="/farmer/what-if" className="shrink-0 self-start sm:self-auto">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#008F83] text-white border-2 border-[#0B1726] font-heading font-bold text-xs shadow-[2px_2px_0px_#0B1726] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0B1726] transition-all">
            <span>Open Decision Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Mini Comparison Teaser */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t-2 border-[#0B1726]/10">
        <div className="bg-[#F7F3EA] p-4 rounded-xl border border-[#0B1726]/20 text-xs flex items-center justify-between gap-3">
          <div>
            <span className="font-heading font-black text-sm text-[#0B1726] block">
              Option A: Sow Now (June 26)
            </span>
            <span className="text-[#2F7D4A] font-semibold mt-0.5 block">
              Optimal 18% moisture stress risk
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-[#EBF5EE] border border-[#2F7D4A] text-[#2F7D4A] font-mono text-[10px] font-bold shrink-0">
            Recommended
          </span>
        </div>

        <div className="bg-[#F7F3EA] p-4 rounded-xl border border-[#0B1726]/20 text-xs flex items-center justify-between gap-3">
          <div>
            <span className="font-heading font-black text-sm text-[#0B1726] block">
              Option B: Wait 7 Days (July 3)
            </span>
            <span className="text-[#9A6218] font-semibold mt-0.5 block">
              +42% risk due to dry break window
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] font-mono text-[10px] font-bold shrink-0">
            Higher Risk
          </span>
        </div>
      </div>
    </div>
  );
};
