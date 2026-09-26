import React from 'react';
import { GitBranch, Gauge, Eye, ShieldCheck, ArrowRight } from 'lucide-react';

interface TrustBlock {
  num: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const TrustIntegritySection: React.FC = () => {
  const blocks: TrustBlock[] = [
    {
      num: '01',
      title: 'Traceable',
      description: 'Data and scenario artifacts carry identifiable provenance.',
      icon: <GitBranch className="w-5 h-5 text-[#008F83]" />,
    },
    {
      num: '02',
      title: 'Calibrated',
      description: 'Probability outputs use explicit calibration methods.',
      icon: <Gauge className="w-5 h-5 text-[#008F83]" />,
    },
    {
      num: '03',
      title: 'Disclosed',
      description: 'Diagnostic limitations and operating constraints remain visible.',
      icon: <Eye className="w-5 h-5 text-[#008F83]" />,
    },
    {
      num: '04',
      title: 'Guarded',
      description: 'Safety gates prevent unsupported yield and financial claims.',
      icon: <ShieldCheck className="w-5 h-5 text-[#008F83]" />,
    },
  ];

  return (
    <section id="trust-integrity" className="py-20 lg:py-28 bg-[#0B1726] text-[#F7F3EA] relative overflow-hidden border-b border-[#0B1726]">
      {/* Subtle background grid pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #008F83 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-4 max-w-2xl">
            {/* Small Outlined Badge */}
            <a
              href="#scientific-grounding"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#008F83]/60 bg-[#008F83]/10 hover:bg-[#008F83]/20 text-[#99E1DC] text-xs font-mono font-bold tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008F83]"
            >
              <span>SCIENTIFIC INTEGRITY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#F7F3EA] tracking-tight leading-tight">
              Built to be inspected,{' '}
              <span className="text-[#008F83] block sm:inline">not blindly trusted.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed font-sans">
              Every intelligence layer is accompanied by provenance, operating-mode disclosure, and scientific boundaries.
            </p>
          </div>

          <div className="text-xs font-mono text-[#94A3B8] lg:text-right max-w-xs leading-relaxed">
            <span className="text-[#008F83] font-bold block mb-1">AUDITABLE BY DESIGN</span>
            Zero black-box assertions. Explicit calibration curves, empirical validation, and active safety gates.
          </div>
        </div>

        {/* 4 Trust Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {blocks.map((block) => (
            <div
              key={block.num}
              className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/10 p-6 flex flex-col justify-between space-y-4 hover:border-[#008F83]/60 hover:bg-white/[0.07] transition-all duration-200 group shadow-[3px_3px_0px_rgba(0,143,131,0.2)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#008F83] tracking-widest uppercase">
                  {block.num}
                </span>
                <div className="p-2 rounded-lg bg-[#008F83]/15 border border-[#008F83]/30 group-hover:scale-105 group-hover:bg-[#008F83]/25 transition-all duration-200">
                  {block.icon}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-black text-xl text-[#F7F3EA] tracking-tight group-hover:text-white">
                  {block.title}
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed font-sans">
                  {block.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-[#008F83]/80 group-hover:text-[#008F83]">
                <span>VERIFIABLE SPEC</span>
                <span>•</span>
                <span>GATED</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
