import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Radio, CloudRain, MapPin, AlertTriangle, ShieldCheck, Sprout } from 'lucide-react';

export const FinalCTASection: React.FC = () => {
  const pipelineSteps = [
    { label: 'CLIMATE SIGNAL', sub: 'Planetary Indices (ENSO, IOD)', icon: <Radio className="w-3.5 h-3.5 text-[#008F83]" /> },
    { label: 'ATMOSPHERE', sub: 'Regional Moisture & Dynamics', icon: <CloudRain className="w-3.5 h-3.5 text-[#008F83]" /> },
    { label: 'BLOCK RESOLUTION', sub: 'UP_LKO_BKT Ground Anchor', icon: <MapPin className="w-3.5 h-3.5 text-[#2F7D4A]" /> },
    { label: 'RISK HORIZONS', sub: 'Calibrated Probabilities (7-30d)', icon: <AlertTriangle className="w-3.5 h-3.5 text-[#E5A33D]" /> },
    { label: 'AGRONOMIC ADVISORY', sub: 'Deterministic Agronomic Rules', icon: <ShieldCheck className="w-3.5 h-3.5 text-[#008F83]" /> },
    { label: 'CONTEXTUAL DECISION', sub: 'Farmer, Officer & State Actions', icon: <Sprout className="w-3.5 h-3.5 text-[#2F7D4A]" /> },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F7F3EA] border-b border-[#0B1726]/15 relative overflow-hidden">
      {/* Subtle contour overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-subtle-contour" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Asymmetric Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#DCEFF0] border border-[#008F83]/40 text-[#006B65] text-xs font-heading font-extrabold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#0B1726]">
              BETTER INFORMATION. BETTER DECISIONS.
            </div>

            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#0B1726] tracking-tight leading-tight">
              Explore the monsoon{' '}
              <span className="text-[#008F83]">intelligence layer.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#435466] leading-relaxed font-sans">
              Move from climate signals to contextual agricultural intelligence across farmer, officer, government, and analyst workflows.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                to="/farmer/dashboard"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-xl bg-[#0B1726] text-white border-2 border-[#0B1726] font-heading font-bold text-sm shadow-[3px_3px_0px_#008F83] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#008F83] transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008F83]"
              >
                <span>Explore Monsoon Intelligence</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <a
                href="#scientific-grounding"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-white text-[#0B1726] border-2 border-[#0B1726] font-heading font-bold text-sm shadow-[3px_3px_0px_#0B1726] hover:-translate-y-0.5 hover:bg-[#FDFBF7] hover:shadow-[5px_5px_0px_#0B1726] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008F83]"
              >
                <Compass className="w-4 h-4 text-[#008F83]" />
                <span>View Scientific Grounding</span>
              </a>
            </div>

            {/* Safe Operational Disclosure Marker */}
            <div className="pt-4 border-t border-[#0B1726]/10 flex items-center gap-3 text-xs text-[#62768A]">
              <span className="w-2 h-2 rounded-full bg-[#E5A33D] shrink-0" />
              <span>Diagnostic Demonstration Mode • Anchored to UP_LKO_BKT (Kharif 2024)</span>
            </div>
          </div>

          {/* Right Column: Abstract Signal-to-Decision Radar Pipeline Visual */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border-2 border-[#0B1726] shadow-[6px_6px_0px_#0B1726] p-6 sm:p-8 relative overflow-hidden">
              
              {/* Abstract Background Radar Concentric Rings */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[340px] h-[340px] pointer-events-none opacity-20">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <circle cx="200" cy="200" r="190" fill="none" stroke="#008F83" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="200" cy="200" r="140" fill="none" stroke="#008F83" strokeWidth="1" />
                  <circle cx="200" cy="200" r="90" fill="none" stroke="#008F83" strokeWidth="1" strokeDasharray="2 4" />
                  <circle cx="200" cy="200" r="40" fill="none" stroke="#008F83" strokeWidth="1.5" />
                  <line x1="200" y1="0" x2="200" y2="400" stroke="#008F83" strokeWidth="0.75" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#008F83" strokeWidth="0.75" />
                  {/* Slow rotating radar sweep */}
                  <g className="origin-center motion-safe:animate-[spin_16s_linear_infinite]">
                    <line x1="200" y1="200" x2="390" y2="200" stroke="#008F83" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                  </g>
                </svg>
              </div>

              {/* Pipeline Flow Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#0B1726]/10 mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#008F83] animate-pulse" />
                  <span className="font-heading font-extrabold text-xs tracking-wider text-[#0B1726] uppercase">
                    INTELLIGENCE PIPELINE SCHEMATIC
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#62768A]">6 STAGES</span>
              </div>

              {/* Vertical Stepped Architecture Flow */}
              <div className="space-y-3 relative z-10">
                {pipelineSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F7F3EA]/70 border border-[#0B1726]/10 hover:border-[#008F83]/40 hover:bg-[#F7F3EA] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#0B1726]/15 flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#0B1726]">
                      {step.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-xs text-[#0B1726] tracking-tight">
                          {step.label}
                        </span>
                        <span className="text-[9px] font-mono text-[#62768A]">
                          0{idx + 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#435466] truncate font-sans">
                        {step.sub}
                      </p>
                    </div>

                    {idx < pipelineSteps.length - 1 && (
                      <div className="text-[#008F83] text-xs font-mono font-bold shrink-0">
                        ↓
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Abstract Bottom Annotation */}
              <div className="mt-5 pt-3 border-t border-[#0B1726]/10 flex items-center justify-between text-[10px] font-mono text-[#62768A] relative z-10">
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
