import React from 'react';
import {
  MapPin,
  Calendar,
  Database,
  Layers,
  Compass,
  Activity,
  ShieldCheck,
  ChevronRight,
  Server,
  Cpu,
  HardDrive,
  CloudOff,
  BellOff,
  Volume2,
  AlertCircle,
  Radio,
} from 'lucide-react';

export const ScientificGroundingSection: React.FC = () => {
  const subsystemStatuses = [
    {
      name: 'ML Intelligence Service',
      category: 'FastAPI / Downscaling Models',
      status: 'Healthy',
      statusType: 'healthy',
      icon: <Cpu className="w-4 h-4 text-[#008F83]" />,
    },
    {
      name: 'Backend Application Gateway',
      category: 'Node.js / Express Core',
      status: 'Healthy',
      statusType: 'healthy',
      icon: <Server className="w-4 h-4 text-[#008F83]" />,
    },
    {
      name: 'Geospatial Database',
      category: 'PostgreSQL 16 + PostGIS',
      status: 'Healthy',
      statusType: 'healthy',
      icon: <HardDrive className="w-4 h-4 text-[#008F83]" />,
    },
    {
      name: 'External Weather APIs',
      category: 'CDS / OpenWeather / Satellite',
      status: 'Not Configured',
      statusType: 'unconfigured',
      icon: <CloudOff className="w-4 h-4 text-[#62768A]" />,
    },
    {
      name: 'Notification Distribution',
      category: 'SMS & WhatsApp Gateways',
      status: 'Not Configured',
      statusType: 'unconfigured',
      icon: <BellOff className="w-4 h-4 text-[#62768A]" />,
    },
    {
      name: 'Voice Accessibility',
      category: 'Bhashini / Mock TTS Fallback',
      status: 'Demo Only',
      statusType: 'demo',
      icon: <Volume2 className="w-4 h-4 text-[#E5A33D]" />,
    },
  ];

  return (
    <section className="py-16 lg:py-24 border-b border-[#0B1726]/15 bg-[#F7F3EA] relative">
      {/* Subtle contour texture */}
      <div className="absolute inset-0 opacity-25 pointer-events-none bg-subtle-contour" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* A. EDITORIAL SECTION INTRODUCTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#0B1726]/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#DCEFF0] border border-[#008F83]/40 text-[#006B65] text-xs font-heading font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#0B1726]">
              <span>SCIENTIFIC GROUNDING</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#0B1726] tracking-tight leading-tight">
              Built on evidence.{' '}
              <span className="text-[#008F83] block sm:inline">Designed for clarity.</span>
            </h2>
            <p className="text-base text-[#435466] leading-relaxed font-sans">
              Every forecast signal, advisory and scenario is presented with its observational context, validation boundaries and operating status.
            </p>
          </div>

          {/* Right Micro Metadata Marker */}
          <div className="flex items-center gap-3 lg:pl-8 lg:border-l border-[#0B1726]/15 shrink-0 self-start lg:self-end">
            <div>
              <div className="text-[10px] font-heading font-extrabold tracking-widest text-[#0B1726] uppercase">
                SCIENTIFIC PROVENANCE
              </div>
              <div className="text-xs font-mono font-bold text-[#006B65] tracking-wider mt-0.5">
                TRACEABLE • DISCLOSED • DIAGNOSTIC
              </div>
            </div>
          </div>
        </div>

        {/* B. CURRENT FOCUS / GROUND ANCHOR PANEL (Large Horizontal Card) */}
        <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#0B1726] shadow-[4px_4px_0px_#0B1726] p-6 lg:p-8 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 7 Columns: Anchor Information */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#DCEFF0] border border-[#008F83]/40 text-[#006B65] text-[11px] font-heading font-extrabold uppercase tracking-wider">
                  CURRENT SCIENTIFIC FOCUS
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#DDEBDD] border border-[#2F7D4A]/40 text-[#2F7D4A] text-[11px] font-heading font-extrabold uppercase tracking-wider">
                  GROUND ANCHOR
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#0B1726] tracking-tight">
                    UP_LKO_BKT
                  </span>
                  <span className="text-base sm:text-lg text-[#008F83] font-heading font-semibold">
                    Bakshi Ka Talab Block
                  </span>
                </div>
                <p className="text-xs text-[#62768A] font-sans mt-1">
                  Lucknow District, Central Plain Agro-Climatic Zone, Uttar Pradesh
                </p>
              </div>

              {/* Observation Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#F7F3EA] border border-[#0B1726]/10">
                  <div className="flex items-center gap-1.5 text-[#008F83] text-[10px] font-heading font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Season</span>
                  </div>
                  <div className="mt-1 font-heading font-bold text-sm text-[#0B1726]">
                    Kharif 2024
                  </div>
                  <div className="text-[10px] text-[#62768A]">Jun 1 – Sep 30</div>
                </div>

                <div className="p-3 rounded-xl bg-[#F7F3EA] border border-[#0B1726]/10">
                  <div className="flex items-center gap-1.5 text-[#2F7D4A] text-[10px] font-heading font-bold uppercase tracking-wider">
                    <Database className="w-3.5 h-3.5" />
                    <span>Records</span>
                  </div>
                  <div className="mt-1 font-heading font-bold text-sm text-[#0B1726]">
                    122 Daily
                  </div>
                  <div className="text-[10px] text-[#62768A]">Continuous series</div>
                </div>

                <div className="p-3 rounded-xl bg-[#F7F3EA] border border-[#0B1726]/10">
                  <div className="flex items-center gap-1.5 text-[#E5A33D] text-[10px] font-heading font-bold uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Resolution</span>
                  </div>
                  <div className="mt-1 font-heading font-bold text-sm text-[#0B1726]">
                    Block Scale
                  </div>
                  <div className="text-[10px] text-[#62768A]">PostGIS boundaries</div>
                </div>

                <div className="p-3 rounded-xl bg-[#F7F3EA] border border-[#0B1726]/10">
                  <div className="flex items-center gap-1.5 text-[#0284C7] text-[10px] font-heading font-bold uppercase tracking-wider">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Centroid</span>
                  </div>
                  <div className="mt-1 font-heading font-bold text-sm text-[#0B1726]">
                    26.97° N
                  </div>
                  <div className="text-[10px] text-[#62768A]">80.92° E Reference</div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Abstract Geographic Radar / Coordinate Display */}
            <div className="lg:col-span-5 relative flex items-center justify-center p-6 bg-[#FDFBF7] rounded-xl border border-[#0B1726]/15 shadow-inner">
              
              {/* Radar Grid Graphic */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Concentric Radar Rings */}
                <div className="absolute w-60 h-60 rounded-full border border-[#008F83]/20" />
                <div className="absolute w-44 h-44 rounded-full border border-[#008F83]/30" />
                <div className="absolute w-28 h-28 rounded-full border border-[#008F83]/40" />

                {/* Grid Crosshairs */}
                <div className="absolute w-full h-px bg-[#0B1726]/15" />
                <div className="absolute h-full w-px bg-[#0B1726]/15" />

                {/* Abstract District & Block Polygons */}
                <svg className="w-48 h-48 text-[#008F83]/20 fill-current" viewBox="0 0 100 100">
                  <polygon points="30,20 65,15 80,45 70,85 35,80 20,50" />
                </svg>
                <svg className="absolute w-24 h-24 text-[#008F83]/40 fill-current" viewBox="0 0 100 100">
                  <polygon points="40,30 65,25 70,55 50,70 30,50" />
                </svg>

                {/* Ground Anchor Coordinate Center Pulsing Marker */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <span className="w-6 h-6 rounded-full bg-[#008F83]/30 animate-ping absolute" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#008F83] border-2 border-white shadow-[0_0_8px_#008F83]" />
                  </div>
                  <div className="mt-2 px-2.5 py-1 rounded bg-[#0B1726] text-white text-[10px] font-heading font-bold shadow-[2px_2px_0px_#008F83] flex items-center gap-1">
                    <Radio className="w-3 h-3 text-[#99E1DC]" />
                    <span>UP_LKO_BKT</span>
                  </div>
                </div>

                {/* Coordinate Markers */}
                <span className="absolute top-1 left-2 text-[9px] font-mono text-[#62768A]">27.05°N</span>
                <span className="absolute bottom-1 right-2 text-[9px] font-mono text-[#62768A]">80.85°E</span>
              </div>
            </div>

          </div>
        </div>

        {/* C & D. TWO-COLUMN GRID: Scientific Operating Mode & Platform Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* C. SCIENTIFIC MODE CARD (Left 6 Columns) */}
          <div className="lg:col-span-6 bg-[#004D47] text-[#FAF7F2] rounded-2xl border-2 border-[#0B1726] shadow-[4px_4px_0px_#0B1726] p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#99E1DC]">
                  SCIENTIFIC OPERATING MODE
                </span>
                <span className="px-2.5 py-0.5 rounded bg-[#003833] text-[#99E1DC] text-[10px] font-heading font-bold border border-[#99E1DC]/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5A33D]" />
                  OPERATIONAL FORECAST: NOT ACTIVE
                </span>
              </div>

              <div>
                <h3 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                  DIAGNOSTIC ONLY
                </h3>
                <p className="text-sm text-[#DCEFF0] leading-relaxed font-sans mt-3">
                  Forecasts and advisories are presented for guidance, research and demonstration purposes. Technical service availability does not imply operational scientific validity.
                </p>
              </div>

              {/* Scientific Guardrails List */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2 text-xs text-[#DCEFF0]">
                  <ShieldCheck className="w-4 h-4 text-[#99E1DC] shrink-0 mt-0.5" />
                  <span>Single-season empirical constraint strictly enforced (Kharif 2024 archive).</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#DCEFF0]">
                  <Activity className="w-4 h-4 text-[#99E1DC] shrink-0 mt-0.5" />
                  <span>Crop yield, biomass, and financial loss predictions are strictly prohibited.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#DCEFF0]">
                  <ShieldCheck className="w-4 h-4 text-[#99E1DC] shrink-0 mt-0.5" />
                  <span>Non-alarmist risk classification and calibrated probability thresholds active.</span>
                </div>
              </div>
            </div>

            {/* Bottom Caution Banner */}
            <div className="pt-4 border-t border-white/15 flex items-center gap-2 text-xs text-[#99E1DC]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E5A33D]" />
              <span>Diagnostic sandbox mode only — not for unverified civil warning dispatch.</span>
            </div>
          </div>

          {/* D. PLATFORM STATUS CARD (Right 6 Columns) */}
          <div className="lg:col-span-6 bg-[#FFFFFF] rounded-2xl border-2 border-[#0B1726] shadow-[4px_4px_0px_#0B1726] p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#62768A]">
                  PLATFORM STATUS
                </span>
                <span className="px-2.5 py-0.5 rounded bg-[#DDEBDD] text-[#2F7D4A] text-[10px] font-heading font-bold border border-[#2F7D4A]/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D4A]" />
                  ALL SYSTEMS AVAILABLE
                </span>
              </div>

              <h3 className="font-heading font-bold text-2xl text-[#0B1726]">
                Core Subsystems Telemetry
              </h3>

              {/* Compact Subsystem Rows */}
              <div className="space-y-2 pt-1">
                {subsystemStatuses.map((sub) => (
                  <div
                    key={sub.name}
                    className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#0B1726]/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="p-1 rounded bg-white border border-[#0B1726]/10 shrink-0">
                        {sub.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="font-heading font-bold text-[#0B1726] truncate">
                          {sub.name}
                        </div>
                        <div className="text-[10px] text-[#62768A] truncate">
                          {sub.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold flex items-center gap-1.5 ${
                          sub.statusType === 'healthy'
                            ? 'bg-[#DDEBDD] text-[#2F7D4A] border border-[#2F7D4A]/30'
                            : sub.statusType === 'demo'
                            ? 'bg-[#F7E8C7] text-[#B87A1E] border border-[#E5A33D]/40'
                            : 'bg-[#E2DDD2] text-[#62768A] border border-[#0B1726]/15'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sub.statusType === 'healthy'
                              ? 'bg-[#2F7D4A]'
                              : sub.statusType === 'demo'
                              ? 'bg-[#E5A33D]'
                              : 'bg-[#62768A]'
                          }`}
                        />
                        {sub.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#0B1726]/30 hidden sm:block" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distinction Disclosure Note */}
            <div className="pt-3 border-t border-[#0B1726]/10 text-[11px] text-[#62768A] font-sans flex items-start gap-1.5">
              <span className="font-heading font-bold text-[#0B1726] shrink-0">Important Note:</span>
              <span>
                Technical uptime indicates API and database connectivity only; it does not constitute operational scientific validity.
              </span>
            </div>
          </div>

        </div>

        {/* E. HORIZONTAL PROVENANCE STRIP (Section E) */}
        <div className="bg-[#0B1726] text-[#F7F3EA] rounded-2xl border-2 border-[#0B1726] p-6 lg:p-7 shadow-[5px_5px_0px_#008F83]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Motto */}
            <div className="space-y-1 max-w-sm">
              <div className="font-heading font-black text-lg text-white leading-snug">
                Better information. Stronger decisions. A more resilient tomorrow.
              </div>
              <div className="text-[11px] font-sans text-[#99E1DC]">
                VarshaSetu Meteorological & Agronomic Foundation
              </div>
            </div>

            {/* Right Metadata Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/15 lg:pl-8">
              <div className="space-y-0.5">
                <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#99E1DC]">
                  GROUND ANCHOR
                </div>
                <div className="font-mono font-bold text-sm text-white">UP_LKO_BKT</div>
                <div className="text-[10px] text-white/60">Bakshi Ka Talab</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#99E1DC]">
                  OBSERVATIONAL ARCHIVE
                </div>
                <div className="font-mono font-bold text-sm text-white">KHARIF 2024</div>
                <div className="text-[10px] text-white/60">IMD & ERA5 Verified</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#99E1DC]">
                  OBSERVATIONS
                </div>
                <div className="font-mono font-bold text-sm text-white">122 RECORDS</div>
                <div className="text-[10px] text-white/60">June 1 – Sept 30</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#99E1DC]">
                  SPATIAL RESOLUTION
                </div>
                <div className="font-mono font-bold text-sm text-white">BLOCK SCALE</div>
                <div className="text-[10px] text-white/60">PostGIS Downscaled</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
