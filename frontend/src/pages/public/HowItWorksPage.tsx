import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Globe2, Layers, Cpu, Sprout, ArrowDown } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Global Climate Signal Ingestion',
      icon: <Globe2 className="w-5 h-5 text-brand-teal" />,
      desc: 'We continuously monitor planetary teleconnections including the El Niño-Southern Oscillation (Niño 3.4), the Indian Ocean Dipole (DMI), and Madden-Julian Oscillation (Wheeler-Hendon RMM phases).',
    },
    {
      step: '02',
      title: 'Regional Atmospheric Downscaling',
      icon: <Layers className="w-5 h-5 text-brand-azure" />,
      desc: 'Global signals combine with high-resolution regional weather observations (SST gradients, low-level wind shear, precipitable water depth) through spatial PostGIS indexing and machine learning downscaling.',
    },
    {
      step: '03',
      title: 'Probabilistic 7–30 Day Forecast Generation',
      icon: <Cpu className="w-5 h-5 text-brand-amber" />,
      desc: 'Rather than brittle deterministic point predictions, our ensemble pipelines evaluate onset timing, break monsoon risks, and heavy rainfall probabilities calibrated against 30-year climatological baselines.',
    },
    {
      step: '04',
      title: 'Explainable Agronomic Rule Matching',
      icon: <Sprout className="w-5 h-5 text-brand-emerald" />,
      desc: 'Probabilistic forecasts are mapped against specific crop stages (Paddy, Maize, Pulses, etc.) through validated ICAR agronomic rules to issue clear, explainable farm actions.',
    },
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-3">
        <Badge variant="teal" size="md">Methodology</Badge>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
          How VarshaSetu Works
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          From planetary atmospheric telemetry to village-level agricultural confidence.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((s, idx) => (
          <Card key={s.step} className="p-5 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-surface-muted border border-surface-border text-slate-900 font-heading font-bold text-base shrink-0">
              {s.step}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {s.icon}
                <h4 className="font-heading font-bold text-base text-slate-900">{s.title}</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
