import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, Eye, Languages, ShieldCheck, Database, Volume2 } from 'lucide-react';

export const GovAdvisoryOversight: React.FC = () => {
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');

  const advisories = [
    {
      id: 'ADV_20240915_UP_LKO_BKT_AGRO_HEAVY_RAIN_001',
      titleEN: 'Heavy Rainfall Risk Identified During Paddy Maturity Window',
      titleHI: 'धान परिपक्वता अवधि के दौरान भारी वर्षा जोखिम की पहचान',
      crop: 'PADDY (धान)',
      stage: 'MATURITY',
      severity: 'WATCH',
      severityColor: 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40',
      status: 'ACTIVE',
      languageSupport: 'EN / HI (Deterministic)',
      reviewState: 'Duty Officer Reviewed',
      scientificSource: 'IMD Heavy Rain Threshold (>= 64.5 mm) & Kharif 2024 Archive',
      validUntil: '2024-09-22',
    },
    {
      id: 'ADV_20240710_UP_LKO_BKT_AGRO_DRY_SPELL_001',
      titleEN: 'Prolonged Dry Spell Risk Indicator in Vegetative Rice',
      titleHI: 'वानस्पतिक धान में लंबे शुष्क दौर का जोखिम सूचक',
      crop: 'PADDY (धान)',
      stage: 'VEGETATIVE',
      severity: 'ELEVATED',
      severityColor: 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30',
      status: 'ACTIVE',
      languageSupport: 'EN / HI (Deterministic)',
      reviewState: 'Duty Officer Reviewed',
      scientificSource: 'IMD Consecutive Dry Days Criteria (>= 5 days < 2.5 mm)',
      validUntil: '2024-07-24',
    },
    {
      id: 'ADV_20240625_UP_LKO_BKT_AGRO_ONSET_001',
      titleEN: 'Monsoon Onset Window Sowing Preparedness Directive',
      titleHI: 'मानसून आगमन अवधि में बुवाई तैयारी निर्देश',
      crop: 'PULSES (अरहर)',
      stage: 'PRE-SOWING',
      severity: 'INFO',
      severityColor: 'bg-[#DBEAFE] text-[#1E40AF] border-[#2563EB]/30',
      status: 'ACTIVE',
      languageSupport: 'EN / HI (Deterministic)',
      reviewState: 'Duty Officer Reviewed',
      scientificSource: 'Onset Surge Model (Threshold >= 25 mm soaking rain)',
      validUntil: '2024-07-05',
    },
  ];

  return (
    <section id="advisories" className="space-y-4">
      {/* Header */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0E7490] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              ADVISORY OVERSIGHT
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#E8F4F6] text-[#155E75] text-[10px] font-mono font-bold border border-[#0E7490]/30">
              MULTILINGUAL DELIVERY
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#102A43] mt-1 tracking-tight">
            Government Advisory Catalog & Translation Audit
          </h2>
          <p className="text-xs text-[#486581]">
            Review published agronomic bulletins, controlled deterministic translations, and extension officer verification logs
          </p>
        </div>

        {/* Bilingual Selector */}
        <div className="flex items-center bg-[#F3F6F7] p-1 rounded-xl border-2 border-[#102A43] self-start sm:self-auto">
          <button
            onClick={() => setLang('EN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all ${
              lang === 'EN' ? 'bg-[#0E7490] text-white shadow-xs' : 'text-[#486581]'
            }`}
          >
            English View
          </button>
          <button
            onClick={() => setLang('HI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all ${
              lang === 'HI' ? 'bg-[#0E7490] text-white shadow-xs' : 'text-[#486581]'
            }`}
          >
            हिन्दी View
          </button>
        </div>
      </div>

      {/* Oversight Table */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl shadow-[4px_4px_0px_#102A43] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F6F7] border-b-2 border-[#102A43]/15 font-heading text-[#102A43] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-extrabold">Advisory Title ({lang})</th>
                <th className="py-3 px-3 font-extrabold">Target Crop</th>
                <th className="py-3 px-3 font-extrabold">Growth Stage</th>
                <th className="py-3 px-3 font-extrabold">Severity</th>
                <th className="py-3 px-3 font-extrabold">Language & Method</th>
                <th className="py-3 px-3 font-extrabold">Officer Review</th>
                <th className="py-3 px-4 font-extrabold">Scientific Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102A43]/10 font-sans text-xs">
              {advisories.map((adv) => (
                <tr key={adv.id} className="hover:bg-[#FFFFFF] transition-colors">
                  <td className="py-3.5 px-4 font-heading font-bold text-[#102A43]">
                    <div>{lang === 'EN' ? adv.titleEN : adv.titleHI}</div>
                    <div className="text-[10px] font-mono text-[#829AB1] font-normal">{adv.id}</div>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-[#102A43]">
                    {adv.crop}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#486581]">
                    {adv.stage}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${adv.severityColor}`}>
                      {adv.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-[#0E7490]">
                    {adv.languageSupport}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#3F7D58] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {adv.reviewState}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#486581] text-[11px] leading-tight max-w-xs">
                    {adv.scientificSource}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
