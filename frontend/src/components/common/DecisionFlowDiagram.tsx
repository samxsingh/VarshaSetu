import React from 'react';
import { ArrowRight } from 'lucide-react';

interface DecisionFlowProps {
  role: 'FARMER' | 'OFFICER' | 'GOVERNMENT' | 'ANALYST';
}

const FLOWS = {
  FARMER: [
    { label: 'WEATHER', desc: 'Live AWS & Radar Signals' },
    { label: 'CROP STAGE', desc: 'Vegetative / Flowering' },
    { label: 'RISK', desc: 'Dry-Spell / Waterlogging' },
    { label: 'RECOMMENDATION', desc: 'Targeted Farm Advisory' },
  ],
  OFFICER: [
    { label: 'OBSERVATION', desc: 'IMD & Station Gauges' },
    { label: 'BLOCK CONDITION', desc: 'Panchayat Moisture Index' },
    { label: 'RISK', desc: 'Heavy Rain / Sowing Delay' },
    { label: 'FIELD ACTION', desc: 'Advisory Dispatch & Survey' },
  ],
  GOVERNMENT: [
    { label: 'DATA', desc: 'Multi-Source Regional Telemetry' },
    { label: 'RISK', desc: 'District Anomalies & Alerts' },
    { label: 'BLOCK IMPACT', desc: 'Vulnerable Population & Crop' },
    { label: 'ALERT', desc: 'State Warning Escalation' },
    { label: 'ACTION', desc: 'Resource & Relief Allocation' },
  ],
  ANALYST: [
    { label: 'SOURCE', desc: 'IMD, Open-Meteo, NASA, ERA5' },
    { label: 'FEATURE', desc: 'SST, MJO, Zonal Shear Vectors' },
    { label: 'MODEL', desc: 'ECMWF IFS / Calibrated ML' },
    { label: 'FORECAST', desc: 'Hyperlocal Probabilistic Signal' },
    { label: 'VALIDATION', desc: 'Skill Scores & Brier Reliability' },
  ],
};

export const DecisionFlowDiagram: React.FC<DecisionFlowProps> = ({ role }) => {
  const steps = FLOWS[role];

  return (
    <div className="bg-[#fcfaf7] border border-[#d8d2c4] rounded-lg p-3.5 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Scientific Decision Pipeline ({role})
        </span>
        <span className="text-[11px] font-mono text-slate-400">VarshaSetu Protocol</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-flow-col sm:auto-cols-fr gap-2 items-center">
        {steps.map((step, idx) => (
          <React.Fragment key={step.label}>
            <div className="bg-white border border-[#e2ddd3] rounded p-2 text-center shadow-xs">
              <div className="text-[12px] font-mono font-bold text-slate-800">{step.label}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{step.desc}</div>
            </div>
            {idx < steps.length - 1 && (
              <div className="hidden sm:flex justify-center text-slate-400">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
