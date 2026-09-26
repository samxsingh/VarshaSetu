import React from 'react';
import { Globe2, Layers, Cpu, Sprout } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Global Climate Signal Ingestion',
      icon: <Globe2 className="w-5 h-5 text-[#008F83]" />,
      desc: 'We continuously monitor planetary teleconnections including the El Niño-Southern Oscillation (Niño 3.4), the Indian Ocean Dipole (DMI), and Madden-Julian Oscillation (Wheeler-Hendon RMM phases).',
    },
    {
      step: '02',
      title: 'Regional Atmospheric Downscaling',
      icon: <Layers className="w-5 h-5 text-[#008F83]" />,
      desc: 'Global signals combine with high-resolution regional weather observations (SST gradients, low-level wind shear, precipitable water depth) through spatial PostGIS indexing and machine learning downscaling.',
    },
    {
      step: '03',
      title: 'Probabilistic 7–30 Day Forecast Generation',
      icon: <Cpu className="w-5 h-5 text-[#E5A33D]" />,
      desc: 'Rather than brittle deterministic point predictions, our ensemble pipelines evaluate onset timing, break monsoon risks, and heavy rainfall probabilities calibrated against 30-year climatological baselines.',
    },
    {
      step: '04',
      title: 'Explainable Agronomic Rule Matching',
      icon: <Sprout className="w-5 h-5 text-[#2F7D4A]" />,
      desc: 'Probabilistic forecasts are mapped against specific crop stages (Paddy, Maize, Pulses, etc.) through validated ICAR agronomic rules to issue clear, explainable farm actions.',
    },
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-10 space-y-8 font-sans">
      <div className="text-center space-y-3">
        <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#008F83] text-white font-mono text-xs font-bold uppercase tracking-wider border border-[#0B1726] shadow-[2px_2px_0px_#0B1726]">
          Methodology & Architecture
        </span>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#0B1726] tracking-tight">
          How VarshaSetu Works
        </h1>
        <p className="text-[#435466] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
          From planetary atmospheric telemetry to village-level agricultural confidence.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.step} className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-[4px_4px_0px_#0B1726] hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#F7F3EA] border-2 border-[#0B1726] text-[#0B1726] font-mono font-black text-lg flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#0B1726]">
              {s.step}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {s.icon}
                <h4 className="font-heading font-black text-base text-[#0B1726]">{s.title}</h4>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
