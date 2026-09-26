import React from 'react';
import { Landmark, Compass, ShieldAlert, Activity, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

interface GovCommandHeaderProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const GovCommandHeader: React.FC<GovCommandHeaderProps> = ({
  activeSection,
  onSelectSection,
}) => {
  const sections = [
    { id: 'overview', label: 'Command Overview' },
    { id: 'map', label: 'Regional Map' },
    { id: 'signals', label: 'Signal Matrix' },
    { id: 'forecasts', label: 'Forecast Lab' },
    { id: 'agronomy', label: 'Agronomic Risks' },
    { id: 'advisories', label: 'Advisories' },
    { id: 'alerts', label: 'Alert Lifecycle' },
    { id: 'system', label: 'System Health' },
  ];

  return (
    <header className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#0B1726] space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0B1726] text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-[#008F83]" />
              GOVERNMENT INTELLIGENCE CENTER
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#DCEFF0] text-[#006B65] text-[10px] font-mono font-bold border border-[#008F83]/30">
              State of Uttar Pradesh • Lucknow Division
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[10px] font-mono font-bold">
              PHASE 4E/5C SCIENTIFIC LAYER
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B1726] tracking-tight">
            See the agricultural weather picture at a glance.
          </h1>

          <p className="text-xs sm:text-sm text-[#435466] max-w-3xl leading-relaxed">
            Consolidated agro-meteorological monitoring for public-sector planning: downscaled precipitation departures, block-level hazard indicators, crop phenological vulnerabilities, and empirical scientific provenance across monitored administrative units.
          </p>
        </div>

        {/* Persistent Status Cluster */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FEF6E9] border-2 border-[#E5A33D] text-[11px] font-mono font-bold text-[#9A6218]">
            <span className="w-2 h-2 rounded-full bg-[#E5A33D] animate-pulse" />
            <span>DIAGNOSTIC ONLY</span>
            <span className="text-[#0B1726]/30">•</span>
            <span>UP_LKO_BKT</span>
            <span className="text-[#0B1726]/30">•</span>
            <span>KHARIF 2024</span>
            <span className="text-[#0B1726]/30">•</span>
            <span>122 OBS</span>
          </div>
        </div>
      </div>

      {/* Quick Jump Section Bar */}
      <nav aria-label="Government workspace navigation" className="pt-3 border-t-2 border-[#0B1726]/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {sections.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSection(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all whitespace-nowrap border min-h-[36px] ${
                isActive
                  ? 'bg-[#008F83] text-white border-[#0B1726] shadow-[2px_2px_0px_#0B1726]'
                  : 'bg-[#F7F3EA] text-[#435466] border-[#0B1726]/15 hover:border-[#0B1726] hover:text-[#0B1726]'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
