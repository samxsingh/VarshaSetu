import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { ScientificStatusBadge } from './ScientificStatusBadge';

export const CropAdvisoryCard: React.FC = () => {
  const { t } = useTranslation();
  const { crop, stage } = useFarmerStore();
  const [showWhyDetails, setShowWhyDetails] = useState(false);

  return (
    <div className="bg-white rounded-2xl border-2 border-[#0B1726] shadow-[4px_4px_0px_#0B1726] mb-6 overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b-2 border-[#0B1726]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-heading font-black text-xl text-[#0B1726]">
              {t('farmer.whatItMeans') || 'What this means for your crop'}
            </h3>
            <ScientificStatusBadge status="DETERMINISTIC RULE" size="sm" />
          </div>
          <p className="text-xs text-[#435466] mt-1 font-sans">
            Specific to <strong className="text-[#0B1726]">{t(`crops.${crop}`)}</strong> in{' '}
            <strong className="text-[#0B1726]">{t(`stages.${stage}`)}</strong>
          </p>
        </div>

        <span className="px-3 py-1 rounded-lg bg-[#EBF5EE] border-2 border-[#2F7D4A] text-[#2F7D4A] text-xs font-heading font-extrabold uppercase tracking-wide self-start sm:self-auto shadow-[1.5px_1.5px_0px_#0B1726]">
          Optimal Sowing Window Open
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Core Headline Banner */}
        <div className="bg-[#EBF5EE] border-2 border-[#2F7D4A]/50 p-4 rounded-xl flex items-start gap-3.5 shadow-[2px_2px_0px_#0B1726]">
          <Sparkles className="w-5 h-5 text-[#2F7D4A] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#0B1726] leading-relaxed">
            <p className="font-heading font-bold text-[#2F7D4A]">
              Favorable rainfall arrival between June 26–28 supports nursery seeding.
            </p>
            <p className="text-[#435466] text-xs mt-0.5 font-sans">
              Topsoil moisture index is projected to reach optimal 0.65–0.75 saturation.
            </p>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-3">
          <h4 className="font-heading font-black text-sm text-[#0B1726] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2F7D4A]" />
            <span>{t('farmer.recommendedActions') || 'Recommended Actions'}</span>
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#435466] font-sans">
            <li className="flex items-start gap-2.5 bg-[#F7F3EA] p-3 rounded-xl border border-[#0B1726]/15">
              <span className="w-2 h-2 rounded-full bg-[#2F7D4A] shrink-0 mt-1.5" />
              <span>
                <strong className="text-[#0B1726]">Mat-type / Wet-bed nursery sowing:</strong> Proceed between June 26–28 to capture natural monsoon soil saturation.
              </span>
            </li>
            <li className="flex items-start gap-2.5 bg-[#F7F3EA] p-3 rounded-xl border border-[#0B1726]/15">
              <span className="w-2 h-2 rounded-full bg-[#2F7D4A] shrink-0 mt-1.5" />
              <span>
                <strong className="text-[#0B1726]">Seed Treatment:</strong> Treat seeds with Carbendazim / Trichoderma (2g/kg) before overnight soaking to guard against seedling blight.
              </span>
            </li>
            <li className="flex items-start gap-2.5 bg-[#F7F3EA] p-3 rounded-xl border border-[#0B1726]/15">
              <span className="w-2 h-2 rounded-full bg-[#2F7D4A] shrink-0 mt-1.5" />
              <span>
                <strong className="text-[#0B1726]">Field Drainage Gates:</strong> Clear bund outlet channels (मेड़ की निकासी) ahead of the June 27 localized downpour.
              </span>
            </li>
          </ul>
        </div>

        {/* Things to Avoid */}
        <div className="space-y-3">
          <h4 className="font-heading font-black text-sm text-[#0B1726] flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[#E53E3E]" />
            <span>{t('farmer.thingsToAvoid') || 'Things to Avoid'}</span>
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#435466] font-sans">
            <li className="flex items-start gap-2.5 bg-[#FEF2F2] p-3 rounded-xl border border-[#E53E3E]/30">
              <span className="w-2 h-2 rounded-full bg-[#E53E3E] shrink-0 mt-1.5" />
              <span>
                <strong className="text-[#0B1726]">Direct Seeded Rice (DSR) broadcast:</strong> Do not broadcast bare seeds on sloping ground immediately before June 27 heavy rain to prevent surface runoff washaway.
              </span>
            </li>
            <li className="flex items-start gap-2.5 bg-[#FEF2F2] p-3 rounded-xl border border-[#E53E3E]/30">
              <span className="w-2 h-2 rounded-full bg-[#E53E3E] shrink-0 mt-1.5" />
              <span>
                <strong className="text-[#0B1726]">Heavy Basal Nitrogen application:</strong> Avoid full urea application on parched soil; split doses once roots establish.
              </span>
            </li>
          </ul>
        </div>

        {/* Explainability Accordion: "Why this advice?" */}
        <div className="pt-3 border-t-2 border-[#0B1726]/10">
          <button
            onClick={() => setShowWhyDetails(!showWhyDetails)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F7F3EA] hover:bg-[#DCEFF0] transition-colors text-left text-xs text-[#0B1726] font-heading font-bold border border-[#0B1726]/20"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#008F83]" />
              <span>{t('farmer.whyThisAdvice') || 'Why this advice?'}</span>
            </div>
            {showWhyDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showWhyDetails && (
            <div className="mt-3 p-4 bg-white border-2 border-[#0B1726] rounded-xl text-xs text-[#435466] space-y-2.5 leading-relaxed font-sans shadow-[2px_2px_0px_#0B1726]">
              <p>
                <strong className="text-[#0B1726]">Agronomic Rationale:</strong> In Lucknow district climatology, paddy varieties (e.g., Swarna, Sambha Mahsuri) require 21–25 days in nursery before transplanting. Sowing between June 26–28 ensures 22-day seedlings reach prime physiological vigor right when the second monsoon pulse arrives in mid-July.
              </p>
              <p>
                <strong className="text-[#0B1726]">Scientific Teleconnections:</strong> Active MJO Phase 3 over the equatorial Indian Ocean coupled with a neutral-to-positive IOD condition provides strong confidence in uninterrupted low-level moisture transport across eastern Uttar Pradesh.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
