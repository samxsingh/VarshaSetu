import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Radio, CloudRain, MapPin, AlertTriangle, ShieldCheck, Sprout } from 'lucide-react';

export const FinalCTASection: React.FC = () => {
  const pipelineSteps = [
    { label: 'CLIMATE SIGNAL', sub: 'Planetary Indices (ENSO, IOD)', icon: <Radio className="w-3.5 h-3.5 text-[#0E7490]" /> },
    { label: 'ATMOSPHERE', sub: 'Regional Moisture & Dynamics', icon: <CloudRain className="w-3.5 h-3.5 text-[#2563EB]" /> },
    { label: 'BLOCK RESOLUTION', sub: 'UP_LKO_BKT Ground Anchor', icon: <MapPin className="w-3.5 h-3.5 text-[#D97706]" /> },
    { label: 'RISK HORIZONS', sub: 'Calibrated Probabilities (7-30d)', icon: <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" /> },
    { label: 'AGRONOMIC ADVISORY', sub: 'Deterministic Agronomic Rules', icon: <ShieldCheck className="w-3.5 h-3.5 text-[#0E7490]" /> },
    { label: 'CONTEXTUAL DECISION', sub: 'Farmer, Officer & State Actions', icon: <Sprout className="w-3.5 h-3.5 text-[#3F7D58]" /> },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F3F6F7] border-b border-[#B8C5CC]/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Asymmetric Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#E8F4F6] border border-[#0E7490]/40 text-[#0E7490] text-xs font-heading font-extrabold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#102A43]">
              BETTER INFORMATION. BETTER DECISIONS.
            </div>

            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#102A43] tracking-tight leading-tight">
              Explore the monsoon{' '}
              <span className="text-[#0E7490]">intelligence layer.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#486581] leading-relaxed font-sans">
              Move from climate signals to contextual agricultural intelligence across farmer, officer, government, and analyst workflows.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-xl bg-[#0E7490] text-white border-2 border-[#102A43] font-heading font-bold text-sm shadow-[4px_4px_0px_#102A43] hover:-translate-y-0.5 hover:bg-[#155E75] hover:shadow-[6px_6px_0px_#102A43] transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]"
              >
                <span>Explore Monsoon Intelligence</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <a
                href="#method"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-white text-[#102A43] border-2 border-[#102A43] font-heading font-bold text-sm shadow-[4px_4px_0px_#102A43] hover:-translate-y-0.5 hover:bg-[#EAF0F2] hover:shadow-[6px_6px_0px_#102A43] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]"
              >
                <Compass className="w-4 h-4 text-[#0E7490]" />
                <span>View Scientific Grounding</span>
              </a>
            </div>

            {/* Safe Operational Disclosure Marker */}
            <div className="pt-4 border-t border-[#102A43]/10 flex items-center gap-3 text-xs text-[#829AB1]">
              <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
              <span>Diagnostic Demonstration Mode • Anchored to UP_LKO_BKT (Kharif 2024)</span>
            </div>
          </div>

          {/* Right Column: Abstract Signal-to-Decision Radar Pipeline Visual */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-6 sm:p-8 relative overflow-hidden">
              
              {/* Abstract Background Radar Concentric Rings */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[340px] h-[340px] pointer-events-none opacity-20">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <circle cx="200" cy="200" r="190" fill="none" stroke="#0E7490" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="200" cy="200" r="140" fill="none" stroke="#0E7490" strokeWidth="1" />
                  <circle cx="200" cy="200" r="90" fill="none" stroke="#0E7490" strokeWidth="1" strokeDasharray="2 4" />
                  <circle cx="200" cy="200" r="40" fill="none" stroke="#0E7490" strokeWidth="1.5" />
                  <line x1="200" y1="0" x2="200" y2="400" stroke="#0E7490" strokeWidth="0.75" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#0E7490" strokeWidth="0.75" />
                  {/* Slow rotating radar sweep */}
                  <g className="origin-center motion-safe:animate-[spin_16s_linear_infinite]">
                    <line x1="200" y1="200" x2="390" y2="200" stroke="#0E7490" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                  </g>
                </svg>
              </div>

              {/* Pipeline Flow Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#102A43]/10 mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0E7490] animate-pulse" />
                  <span className="font-heading font-extrabold text-xs tracking-wider text-[#102A43] uppercase">
                    INTELLIGENCE PIPELINE SCHEMATIC
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#829AB1]">6 STAGES</span>
              </div>

              {/* Vertical Stepped Architecture Flow */}
              <div className="space-y-3 relative z-10">
                {pipelineSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#EAF0F2]/70 border border-[#102A43]/10 hover:border-[#0E7490]/40 hover:bg-[#EAF0F2] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#102A43]/15 flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#102A43]">
                      {step.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-xs text-[#102A43] tracking-tight">
                          {step.label}
                        </span>
                        <span className="text-[9px] font-mono text-[#829AB1]">
                          0{idx + 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#486581] truncate font-sans">
                        {step.sub}
                      </p>
                    </div>

                    {idx < pipelineSteps.length - 1 && (
                      <div className="text-[#0E7490] text-xs font-mono font-bold shrink-0">
                        ↓
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Annotation */}
              <div className="mt-5 pt-3 border-t border-[#102A43]/10 flex items-center justify-between text-[10px] font-mono text-[#829AB1] relative z-10">
                <span>SIGNAL SYNTHESIS</span>
                <span>•</span>
                <span>DETERMINISTIC GATES</span>
                <span>•</span>
                <span>AUDITABLE</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
