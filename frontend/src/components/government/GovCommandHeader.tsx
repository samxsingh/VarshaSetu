import React from 'react';
import { Landmark } from 'lucide-react';

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
    <header className="bg-white border-2 border-[#102A43] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#102A43] space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-[#102A43] text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-[#0891B2]" />
              GOVERNMENT INTELLIGENCE CENTER
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#E8F4F6] text-[#0E7490] text-[10px] font-mono font-bold border border-[#0891B2]/30">
              State of Uttar Pradesh • Lucknow Division
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#EAF0F2] border border-[#102A43]/30 text-[#102A43] text-[10px] font-mono font-bold">
              EMPIRICAL SCIENTIFIC LAYER
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102A43] tracking-tight">
            See the agricultural weather picture at a glance.
          </h1>

          <p className="text-xs sm:text-sm text-[#486581] max-w-3xl leading-relaxed">
            Consolidated agro-meteorological monitoring for public-sector planning: downscaled precipitation departures, block-level hazard indicators, crop phenological vulnerabilities, and empirical scientific provenance across monitored administrative units.
          </p>
        </div>

        {/* Persistent Status Cluster */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FEF3C7] border-2 border-[#D97706] text-[11px] font-mono font-bold text-[#B45309]">
            <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
            <span>DIAGNOSTIC ONLY</span>
            <span className="text-[#102A43]/30">•</span>
            <span>UP_LKO_BKT</span>
            <span className="text-[#102A43]/30">•</span>
            <span>KHARIF 2024</span>
            <span className="text-[#102A43]/30">•</span>
            <span>122 OBS</span>
          </div>
        </div>
      </div>

      {/* Quick Jump Section Bar */}
      <nav aria-label="Government workspace navigation" className="pt-3 border-t-2 border-[#102A43]/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {sections.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSection(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all whitespace-nowrap border min-h-[36px] ${
                isActive
                  ? 'bg-[#0E7490] text-white border-[#102A43] shadow-[2px_2px_0px_#102A43]'
                  : 'bg-[#EAF0F2] text-[#486581] border-[#102A43]/15 hover:border-[#102A43] hover:text-[#102A43]'
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
