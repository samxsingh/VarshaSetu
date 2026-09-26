import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Sprout, AlertTriangle, Droplets, MapPin, ShieldAlert, Sparkles, Compass } from 'lucide-react';
import { ScientificIntegrityStrip } from '../../components/officer/ScientificIntegrityStrip';

export const OfficerCropsPage: React.FC = () => {
  const cropVulnerabilities = [
    {
      name: 'Paddy (धान)',
      acreage: '72,000 Hectares',
      vulnerableBlocks: 'Malihabad (Dry Break Vulnerability)',
      riskLevel: 'MODERATE',
      advisoryNote:
        'Advise nursery raising on raised beds; encourage short duration Swarna Sub-1 varieties in flood-prone riverine tracts.',
      phenology: 'Nursery / Early Vegetative',
      soilRequirement: 'Clay Loam / Heavy Silt',
    },
    {
      name: 'Pulses (अरहर / मूंग)',
      acreage: '18,500 Hectares',
      vulnerableBlocks: 'Bakshi Ka Talab & Sarojininagar',
      riskLevel: 'HIGH',
      advisoryNote:
        'High susceptibility to waterlogging on clay soils. Ensure ridge-furrow planting to prevent root rot during heavy rainfall surges.',
      phenology: 'Sowing / Seedling Emergence',
      soilRequirement: 'Well-Drained Sandy Loam',
    },
    {
      name: 'Kharif Maize (मक्का)',
      acreage: '12,200 Hectares',
      vulnerableBlocks: 'Mohanlalganj & Gosainganj',
      riskLevel: 'LOW',
      advisoryNote:
        'Tolerant of anticipated onset conditions. Sowing recommended immediately following initial 25mm soaking rain.',
      phenology: 'Pre-Sowing Field Prep',
      soilRequirement: 'Medium Loam',
    },
    {
      name: 'Commercial Vegetables',
      acreage: '9,800 Hectares',
      vulnerableBlocks: 'Chinhat & Sarojininagar',
      riskLevel: 'HIGH',
      advisoryNote:
        'High economic sensitivity from June 27 heavy rain (>65mm). Stake tomato and cucurbit vines to avoid direct soil-borne blight.',
      phenology: 'Active Fruiting / Flowering',
      soilRequirement: 'Sandy Loam Beds',
    },
  ];

  return (
    <div className="space-y-6" data-testid="officer-crops-page">
      {/* 1. Header Strip */}
      <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#0B1726]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#008F83] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                AGRONOMIC CONTINGENCY
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[10px] font-mono font-bold">
                Kharif Season 2026
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0B1726] tracking-tight">
              Crop Vulnerability Matrix & Agricultural Contingency
            </h2>
            <p className="text-xs text-[#435466]">
              Assessing localized climate risks against Lucknow district crop acreages and phenological sensitivity windows
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-[#F7F3EA] border-2 border-[#0B1726] font-mono font-bold text-xs text-[#0B1726]">
              Total Acreage: 112,500 Ha
            </span>
          </div>
        </div>
      </div>

      {/* 2. Crop Vulnerability Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cropVulnerabilities.map((c) => (
          <div
            key={c.name}
            className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 shadow-[4px_4px_0px_#0B1726] flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-transform"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between pb-3 border-b-2 border-[#0B1726]/10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#EBF5EE] text-[#2F7D4A] border border-[#2F7D4A]/25">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#0B1726]">
                      {c.name}
                    </h3>
                    <span className="text-[11px] font-mono text-[#62768A]">
                      Phenology: {c.phenology}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                    c.riskLevel === 'HIGH'
                      ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30'
                      : c.riskLevel === 'MODERATE'
                      ? 'bg-[#FEF6E9] text-[#9A6218] border-[#E5A33D]/40'
                      : 'bg-[#EBF5EE] text-[#2F7D4A] border-[#2F7D4A]/30'
                  }`}
                >
                  {c.riskLevel} RISK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/10">
                  <span className="text-[10px] font-mono uppercase text-[#62768A] block">
                    Cultivation Area
                  </span>
                  <strong className="text-sm font-mono font-bold text-[#0B1726] block">
                    {c.acreage}
                  </strong>
                </div>

                <div className="p-2.5 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/10">
                  <span className="text-[10px] font-mono uppercase text-[#62768A] block">
                    Soil Adaptation
                  </span>
                  <strong className="text-xs font-heading font-bold text-[#0B1726] block truncate">
                    {c.soilRequirement}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-xs text-[#435466]">
                <MapPin className="w-3.5 h-3.5 text-[#008F83] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#0B1726]">Vulnerable Clusters:</strong>{' '}
                  <span className="text-[#9A6218] font-medium">{c.vulnerableBlocks}</span>
                </span>
              </div>

              <div className="p-3.5 bg-[#FDFBF7] rounded-xl text-xs text-[#435466] leading-relaxed border-2 border-[#0B1726]/15 space-y-1">
                <strong className="text-[#0B1726] font-heading font-extrabold block uppercase tracking-wide text-[10px]">
                  Agronomic Advisory Directive:
                </strong>
                <p className="text-[11px] leading-relaxed">{c.advisoryNote}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#0B1726]/10 flex items-center justify-between text-[10px] font-mono text-[#62768A]">
              <span>Contingency Rule: IMD Agro-Met Gate</span>
              <span>Status: Active Monitoring</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Scientific Integrity Strip */}
      <ScientificIntegrityStrip />
    </div>
  );
};
