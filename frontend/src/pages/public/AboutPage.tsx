import React from 'react';
import { ShieldCheck, HeartHandshake, Eye } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-10 space-y-8 font-sans">
      <div className="text-center space-y-3">
        <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#0E7490] text-white font-mono text-xs font-bold uppercase tracking-wider border border-[#102A43] shadow-[2px_2px_0px_#102A43]">
          Institutional Framework
        </span>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#102A43] tracking-tight">
          About VarshaSetu (वर्षासेतु)
        </h1>
        <p className="text-[#486581] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
          Bridging the chasm between large-scale climate teleconnections and village-level farm decisions.
        </p>
      </div>

      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[4px_4px_0px_#102A43]">
        <h3 className="font-heading font-black text-xl text-[#102A43]">Our Institutional Mission</h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          Over 50% of net cultivated area in India is rainfed, subjecting millions of marginal and smallholder farmers to the devastating intraseasonal swings of the South Asian monsoon. Conventional weather forecasts are delivered at 12–25 km grid resolutions or broad district summaries that fail to capture localized convective breaks and false onsets.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          VarshaSetu builds a digital bridge (सेतु) that transforms global teleconnections (ENSO, IOD, MJO) into block- and panchayat-scale probabilistic forecasts, paired with explainable, crop-specific decision support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-[#102A43] rounded-2xl p-6 shadow-[4px_4px_0px_#102A43] hover:-translate-y-0.5 transition-all">
          <ShieldCheck className="w-6 h-6 text-[#0E7490] mb-3" />
          <h4 className="font-heading font-black text-[#102A43] text-base mb-1.5">Scientific Integrity</h4>
          <p className="text-xs text-[#486581] leading-relaxed">
            Zero fabricated predictions. All models evaluated against 30-year climatology baselines and verified empirical ground truth (UP_LKO_BKT).
          </p>
        </div>

        <div className="bg-white border-2 border-[#102A43] rounded-2xl p-6 shadow-[4px_4px_0px_#102A43] hover:-translate-y-0.5 transition-all">
          <HeartHandshake className="w-6 h-6 text-[#3F7D58] mb-3" />
          <h4 className="font-heading font-black text-[#102A43] text-base mb-1.5">Farmer-First UX</h4>
          <p className="text-xs text-[#486581] leading-relaxed">
            High contrast, bilingual typography, voice audio playback, and simple actionable choices over raw meteorological jargon.
          </p>
        </div>

        <div className="bg-white border-2 border-[#102A43] rounded-2xl p-6 shadow-[4px_4px_0px_#102A43] hover:-translate-y-0.5 transition-all">
          <Eye className="w-6 h-6 text-[#0E7490] mb-3" />
          <h4 className="font-heading font-black text-[#102A43] text-base mb-1.5">Open Provenance</h4>
          <p className="text-xs text-[#486581] leading-relaxed">
            Every forecast exposes its issue timestamp, data freshness state, model version, and underlying atmospheric driving factors.
          </p>
        </div>
      </div>
    </div>
  );
};
