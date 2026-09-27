import React from 'react';
import { GitBranch, Gauge, Eye, ShieldCheck, ArrowRight } from 'lucide-react';

interface TrustBlock {
  num: string;
  title: string;
  description: string;
  mechanism: string;
  icon: React.ReactNode;
}

export const TrustIntegritySection: React.FC = () => {
  const blocks: TrustBlock[] = [
    {
      num: '01',
      title: 'Traceable',
      description: 'Data and scenario artifacts carry identifiable provenance.',
      mechanism: 'SHA-256 manifests & data provenance hashes',
      icon: <GitBranch className="w-5 h-5 text-[#0891B2]" />,
    },
    {
      num: '02',
      title: 'Calibrated',
      description: 'Probability outputs use explicit calibration methods.',
      mechanism: 'Isotonic & Platt reliability calibration curves',
      icon: <Gauge className="w-5 h-5 text-[#0891B2]" />,
    },
    {
      num: '03',
      title: 'Disclosed',
      description: 'Diagnostic limitations and operating constraints remain visible.',
      mechanism: 'Single-season boundary & offline gate disclosure',
      icon: <Eye className="w-5 h-5 text-[#0891B2]" />,
    },
    {
      num: '04',
      title: 'Guarded',
      description: 'Safety gates prevent unsupported yield and financial claims.',
      mechanism: 'Deterministic safety filters & non-alarmist thresholds',
      icon: <ShieldCheck className="w-5 h-5 text-[#0891B2]" />,
    },
  ];

  return (
    <section id="trust" className="py-20 lg:py-28 bg-[#0B1F33] text-white relative overflow-hidden border-b border-[#102A43] scroll-mt-24 sm:scroll-mt-28">
      {/* Subtle atmospheric background grid pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0891B2 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-4 max-w-2xl">
            {/* Outlined Badge */}
            <a
              href="#method"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#0891B2]/60 bg-[#0891B2]/10 hover:bg-[#0891B2]/20 text-[#0891B2] text-xs font-mono font-bold tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0891B2]"
            >
              <span>SCIENTIFIC INTEGRITY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Built to be inspected,{' '}
              <span className="text-[#0891B2] block sm:inline">not blindly trusted.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#B8C7D1] leading-relaxed font-sans">
              Every intelligence layer is accompanied by provenance, operating-mode disclosure, and scientific boundaries.
            </p>
          </div>

          <div className="text-xs font-mono text-[#B8C7D1] lg:text-right max-w-xs leading-relaxed">
            <span className="text-[#0891B2] font-bold block mb-1">AUDITABLE BY DESIGN</span>
            Zero black-box assertions. Explicit calibration curves, empirical validation, and active safety gates.
          </div>
        </div>

        {/* Unified Editorial Four-Part Integrity Structure */}
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-white/10 shadow-[4px_4px_0px_rgba(8,145,178,0.15)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {blocks.map((block) => (
              <div
                key={block.num}
                className="p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:bg-white/[0.04] transition-colors duration-200 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#0891B2] tracking-widest uppercase">
                      PILLAR {block.num}
                    </span>
                    <div className="p-2 rounded-lg bg-[#0891B2]/15 border border-[#0891B2]/30 group-hover:scale-105 group-hover:bg-[#0891B2]/25 transition-all duration-200">
                      {block.icon}
                    </div>
                  </div>

                  <h3 className="font-heading font-black text-xl text-white tracking-tight">
                    {block.title}
                  </h3>

                  <p className="text-sm text-[#B8C7D1] leading-relaxed font-sans">
                    {block.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 text-[11px] font-mono text-[#0891B2]/90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0891B2]" aria-hidden="true" />
                  <span>{block.mechanism}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
