import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudRain,
  SunMedium,
  CloudLightning,
  TrendingUp,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { HorizonSelector } from '../forecast/HorizonSelector';
import { ForecastHorizonDays } from '@shared/types';
import { ScientificStatusBadge } from './ScientificStatusBadge';

export const MonsoonGlanceCard: React.FC = () => {
  const { t } = useTranslation();
  const { horizon, setHorizon } = useFarmerStore();

  // Controlled Demo Scenarios calibrated per horizon (explicitly simulated)
  const demoOutlookData: Record<
    ForecastHorizonDays,
    {
      dates: string;
      phaseLabel: string;
      onsetProb: number;
      drySpellRisk: number;
      heavyRainProb: number;
      expectedRainfallMm: string;
      departureText: string;
      confidence: string;
    }
  > = {
    7: {
      dates: 'Next 7 Days (June 25 - July 1)',
      phaseLabel: 'Active Monsoon Surge (सक्रिय चरण)',
      onsetProb: 84,
      drySpellRisk: 22,
      heavyRainProb: 65,
      expectedRainfallMm: '110 - 145 mm',
      departureText: '+18% above 30-year Lucknow normal',
      confidence: t('common.highConfidence') || 'High Confidence',
    },
    14: {
      dates: '14-Day Outlook (June 25 - July 8)',
      phaseLabel: 'Surge Followed by Potential Hiatus',
      onsetProb: 92,
      drySpellRisk: 58,
      heavyRainProb: 40,
      expectedRainfallMm: '160 - 210 mm',
      departureText: '+5% normal range',
      confidence: t('common.moderateConfidence') || 'Moderate Confidence',
    },
    21: {
      dates: '21-Day Outlook (June 25 - July 15)',
      phaseLabel: 'Intraseasonal Break Risk',
      onsetProb: 96,
      drySpellRisk: 72,
      heavyRainProb: 30,
      expectedRainfallMm: '220 - 275 mm',
      departureText: '-12% below normal',
      confidence: t('common.moderateConfidence') || 'Moderate Confidence',
    },
    30: {
      dates: '30-Day Outlook (June 25 - July 24)',
      phaseLabel: 'Revival Phase Expected Mid-July',
      onsetProb: 98,
      drySpellRisk: 45,
      heavyRainProb: 50,
      expectedRainfallMm: '310 - 380 mm',
      departureText: 'Near normal (-4%)',
      confidence: t('common.lowConfidence') || 'Low Confidence',
    },
  };

  const current = demoOutlookData[horizon];

  return (
    <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] mb-6 overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b-2 border-[#102A43]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-heading font-black text-xl text-[#102A43]">
              {t('farmer.monsoonOutlook') || 'Monsoon Outlook'}
            </h3>
            <ScientificStatusBadge status="DIAGNOSTIC ARCHIVE" size="sm" />
          </div>
          <p className="text-xs text-[#486581] mt-1 font-sans">
            {current.dates} • <span className="font-heading font-bold text-[#0E7490]">{current.phaseLabel}</span>
          </p>
        </div>

        {/* Horizon Switcher */}
        <HorizonSelector value={horizon} onChange={setHorizon} />
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* 3 Core Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* 1. Monsoon Onset */}
          <div className="bg-[#E8F4F6]/50 border-2 border-[#102A43] rounded-xl p-5 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#155E75]">
                <CloudRain className="w-5 h-5 text-[#0E7490]" />
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider">
                  {t('targets.onset') || 'Monsoon Onset'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#E8F4F6] border border-[#0E7490]/40 text-[#155E75]">
                Favorable
              </span>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-black text-4xl text-[#102A43]">
                  {current.onsetProb}%
                </span>
                <span className="text-xs text-[#829AB1] font-medium font-sans">likelihood</span>
              </div>
              <p className="text-xs text-[#486581] mt-1 font-sans">
                Window: June 26–28 • <span className="font-medium text-[#155E75]">{current.confidence}</span>
              </p>
            </div>

            {/* Neo-brutalist Progress Bar */}
            <div className="w-full bg-white h-2.5 rounded-full border border-[#102A43]/30 overflow-hidden">
              <div
                className="bg-[#0E7490] h-full transition-all duration-300"
                style={{ width: `${current.onsetProb}%` }}
              />
            </div>
          </div>

          {/* 2. Dry Spell Break Risk */}
          <div className="bg-[#FEF3C7]/60 border-2 border-[#102A43] rounded-xl p-5 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#B45309]">
                <SunMedium className="w-5 h-5 text-[#D97706]" />
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider">
                  {t('targets.drySpell') || 'Dry Spell Break'}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  current.drySpellRisk > 50
                    ? 'bg-[#FEF3C7] border-[#D97706] text-[#B45309]'
                    : 'bg-[#EBF5EE] border-[#3F7D58] text-[#3F7D58]'
                }`}
              >
                {current.drySpellRisk > 50 ? t('common.riskHigh') || 'High Risk' : t('common.riskLow') || 'Low Risk'}
              </span>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-black text-4xl text-[#102A43]">
                  {current.drySpellRisk}%
                </span>
                <span className="text-xs text-[#829AB1] font-medium font-sans">break risk</span>
              </div>
              <p className="text-xs text-[#486581] mt-1 font-sans">
                {current.drySpellRisk > 50 ? 'hiatus expected after day 6' : 'consistent moisture continuity'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white h-2.5 rounded-full border border-[#102A43]/30 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  current.drySpellRisk > 50 ? 'bg-[#D97706]' : 'bg-[#3F7D58]'
                }`}
                style={{ width: `${current.drySpellRisk}%` }}
              />
            </div>
          </div>

          {/* 3. Heavy Rain Alert */}
          <div className="bg-[#DBEAFE]/40 border-2 border-[#102A43] rounded-xl p-5 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#1E3A8A]">
                <CloudLightning className="w-5 h-5 text-[#2563EB]" />
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider">
                  {t('targets.heavyRain') || 'Heavy Rain'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#DBEAFE] border border-[#2563EB]/40 text-[#1E3A8A]">
                &gt; 65 mm / 24h
              </span>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-black text-4xl text-[#102A43]">
                  {current.heavyRainProb}%
                </span>
                <span className="text-xs text-[#829AB1] font-medium font-sans">probability</span>
              </div>
              <p className="text-xs text-[#486581] mt-1 font-sans">
                Peak convective event: June 27 evening
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white h-2.5 rounded-full border border-[#102A43]/30 overflow-hidden">
              <div
                className="bg-[#2563EB] h-full transition-all duration-300"
                style={{ width: `${current.heavyRainProb}%` }}
              />
            </div>
          </div>

        </div>

        {/* Cumulative Rainfall Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F3F6F7] rounded-xl border border-[#102A43]/20 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white border border-[#102A43]/10 text-[#0E7490]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-[#102A43]">
                Projected Rainfall: {current.expectedRainfallMm}
              </span>
              <span className="text-[#829AB1] block sm:inline sm:ml-2">
                ({current.departureText})
              </span>
            </div>
          </div>

          <Link
            to="/farmer/forecast"
            className="inline-flex items-center gap-1.5 font-heading font-bold text-[#0E7490] hover:text-[#155E75] transition-colors"
          >
            <span>Detailed Forecast View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
