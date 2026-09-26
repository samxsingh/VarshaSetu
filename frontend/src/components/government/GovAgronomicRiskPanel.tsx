import React from 'react';
import { Sprout, CloudRain, ShieldAlert, ArrowRight, Layers, Info } from 'lucide-react';

export const GovAgronomicRiskPanel: React.FC = () => {
  const riskWorkflows = [
    {
      weatherSignal: 'Heavy Rainfall Signal (> 64.5 mm / 24h)',
      agronomicIndicator: 'Waterlogging & Stand Lodging Hazard Detected',
      crop: 'Paddy (धान)',
      stage: 'Maturity / Harvest Window',
      acreage: '72,000 Ha',
      severity: 'WATCH',
      severityColor: 'bg-[#FEF6E9] text-[#9A6218] border-[#E5A33D]/40',
      explanation:
        'Sustained wet surface conditions may induce pre-harvest grain sprouting and field machine tractability impairment. Non-causal diagnostic indicator.',
      ruleId: 'AGRO_PADDY_HEAVY_RAIN_HARVEST_001',
    },
    {
      weatherSignal: 'Extended Dry Break (>= 5 Consecutive Days)',
      agronomicIndicator: 'Root Zone Moisture Deficit Indicator Detected',
      crop: 'Paddy (धान)',
      stage: 'Early Vegetative / Tillering',
      acreage: '72,000 Ha',
      severity: 'ELEVATED',
      severityColor: 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30',
      explanation:
        'Tillering phase exhibits high sensitivity to topsoil desaturation below 40% field capacity. Diagnostic sensitivity envelope evaluated.',
      ruleId: 'AGRO_PADDY_DRY_SPELL_VEGETATIVE_001',
    },
    {
      weatherSignal: 'Convective Inflow & High Saturation',
      agronomicIndicator: 'Collar Rot & Root Asphyxiation Susceptibility',
      crop: 'Pulses (अरहर / मूंग)',
      stage: 'Seedling Emergence',
      acreage: '18,500 Ha',
      severity: 'WATCH',
      severityColor: 'bg-[#FEF6E9] text-[#9A6218] border-[#E5A33D]/40',
      explanation:
        'Heavy textured soils in Bakshi Ka Talab demonstrate elevated ponding exposure during onset episodic rainfall peaks.',
      ruleId: 'AGRO_PULSES_WATERLOGGING_002',
    },
    {
      weatherSignal: 'Precipitation Concentration Surge',
      agronomicIndicator: 'Soil-Borne Fungal Blight Risk Indicator',
      crop: 'Commercial Vegetables',
      stage: 'Active Flowering & Fruiting',
      acreage: '9,800 Ha',
      severity: 'ELEVATED',
      severityColor: 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30',
      explanation:
        'High economic sensitivity from rainfall surges impacting tomato and cucurbit vine stands. Requires field extension monitoring.',
      ruleId: 'AGRO_VEG_EPISODIC_SURGE_003',
    },
  ];

  return (
    <section id="agronomy" className="space-y-4">
      {/* Header */}
      <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 shadow-[4px_4px_0px_#0B1726] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#008F83] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              AGRONOMIC OVERSIGHT
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#DCEFF0] text-[#006B65] text-[10px] font-mono font-bold border border-[#008F83]/30">
              PHASE 5A/5B RULES CATALOG
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#0B1726] mt-1 tracking-tight">
            Agronomic Sensitivity & Risk Chain Oversight
          </h2>
          <p className="text-xs text-[#435466]">
            Transparent 4-step translation from downscaled meteorological signals to crop phenological vulnerability indicators
          </p>
        </div>

        <span className="px-3 py-1 rounded-xl bg-[#F7F3EA] border border-[#0B1726]/15 text-xs font-mono text-[#0B1726]">
          Non-Imperative Safety Model
        </span>
      </div>

      {/* 4-Step Chain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskWorkflows.map((r) => (
          <div
            key={r.ruleId}
            className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 shadow-[4px_4px_0px_#0B1726] flex flex-col justify-between space-y-3.5 hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#0B1726]/10">
              <span className="text-[10px] font-mono font-bold text-[#62768A]">
                {r.ruleId}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${r.severityColor}`}>
                {r.severity}
              </span>
            </div>

            {/* 4-Step Chain Visual */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/10">
                <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-[#62768A] block">
                  1. Meteorological Signal
                </span>
                <strong className="text-[#0B1726] text-xs font-heading font-bold block mt-0.5">
                  {r.weatherSignal}
                </strong>
              </div>

              <div className="p-2.5 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/10">
                <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-[#62768A] block">
                  2. Agronomic Indicator
                </span>
                <strong className="text-[#008F83] text-xs font-heading font-bold block mt-0.5">
                  {r.agronomicIndicator}
                </strong>
              </div>

              <div className="p-2.5 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-[#62768A] block">
                    3. Affected Crop & Stage
                  </span>
                  <strong className="text-[#0B1726] text-xs block mt-0.5">
                    {r.crop} • <span className="font-mono text-[11px] text-[#435466]">{r.stage}</span>
                  </strong>
                </div>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#0B1726]/15 text-[#0B1726]">
                  {r.acreage}
                </span>
              </div>

              <div className="p-2.5 bg-[#FDFBF7] rounded-xl border border-[#0B1726]/15">
                <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-[#E5A33D] block">
                  4. Scientific Explanation & Disclosure
                </span>
                <p className="text-[#435466] text-[11px] leading-relaxed mt-0.5">
                  {r.explanation}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#0B1726]/10 text-[10px] font-mono text-[#62768A] flex justify-between">
              <span>Anchor: UP_LKO_BKT</span>
              <span>Yield Estimates: PROHIBITED</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
