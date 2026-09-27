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
  Waves,
  Scale,
  CheckCircle2,
} from 'lucide-react';

export const ScientificGroundingSection: React.FC = () => {
  const subsystemStatuses = [
    {
      name: 'ML Intelligence Service',
      category: 'FastAPI / Downscaling Models',
      status: 'Healthy',
      statusType: 'healthy',
      icon: <Cpu className="w-4 h-4 text-[#0E7490]" />,
    },
    {
      name: 'Backend Application Gateway',
      category: 'Node.js / Express Core',
      status: 'Healthy',
      statusType: 'healthy',
      icon: <Server className="w-4 h-4 text-[#0E7490]" />,
    },
    {
      name: 'Geospatial Database',
      category: 'PostgreSQL 16 + PostGIS',
      status: 'Healthy',
      statusType: 'healthy',
      icon: <HardDrive className="w-4 h-4 text-[#0E7490]" />,
    },
    {
      name: 'External Weather APIs',
      category: 'CDS / OpenWeather / Satellite',
      status: 'Not Configured',
      statusType: 'unconfigured',
      icon: <CloudOff className="w-4 h-4 text-[#829AB1]" />,
    },
    {
      name: 'Notification Distribution',
      category: 'SMS & WhatsApp Gateways',
      status: 'Not Configured',
      statusType: 'unconfigured',
      icon: <BellOff className="w-4 h-4 text-[#829AB1]" />,
    },
    {
      name: 'Voice Accessibility',
      category: 'Bhashini / Speech Synthesis',
      status: 'Demo Only',
      statusType: 'demo',
      icon: <Volume2 className="w-4 h-4 text-[#D97706]" />,
    },
  ];

  const pipelineStages = [
    {
      step: '01',
      title: 'ATMOSPHERIC SIGNAL',
      subtitle: 'ENSO · IOD · MJO',
      desc: 'Synoptic boundary teleconnections',
      icon: <Radio className="w-4 h-4 text-[#0E7490]" />,
    },
    {
      step: '02',
      title: 'REGIONAL CONTEXT',
      subtitle: 'Moisture & Vorticity',
      desc: 'Synoptic dynamics down to basin',
      icon: <Waves className="w-4 h-4 text-[#0E7490]" />,
    },
    {
      step: '03',
      title: 'LOCAL DOWNSCALING',
      subtitle: 'PostGIS Spatial Grid',
      desc: 'Statistical & physical downscaling',
      icon: <Layers className="w-4 h-4 text-[#0E7490]" />,
    },
    {
      step: '04',
      title: 'GROUND ANCHOR',
      subtitle: 'UP_LKO_BKT (122d)',
      desc: 'Empirical station calibration',
      icon: <MapPin className="w-4 h-4 text-[#3F7D58]" />,
    },
    {
      step: '05',
      title: 'CALIBRATION',
      subtitle: 'Isotonic & Platt',
      desc: 'Reliability bounds & Brier scores',
      icon: <Scale className="w-4 h-4 text-[#0E7490]" />,
    },
    {
      step: '06',
      title: 'DECISION OUTPUT',
      subtitle: 'Agro-Advisories',
      desc: 'Multi-role operational delivery',
      icon: <CheckCircle2 className="w-4 h-4 text-[#0E7490]" />,
    },
  ];

  return (
    <section id="method" className="py-16 lg:py-20 border-b border-[#B8C5CC]/60 bg-[#EAF0F2] relative scroll-mt-24 sm:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* A. EDITORIAL SECTION INTRODUCTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#102A43]/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#E8F4F6] border border-[#0E7490]/40 text-[#0E7490] text-xs font-heading font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#102A43]">
              <span>SCIENTIFIC GROUNDING</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102A43] tracking-tight leading-tight">
              Built on evidence.{' '}
              <span className="text-[#0E7490] block sm:inline">Designed for clarity.</span>
            </h2>
            <p className="text-base text-[#486581] leading-relaxed font-sans">
              Every forecast signal, advisory and scenario is presented with its observational context, validation boundaries and operating status.
            </p>
          </div>

          {/* Right Micro Metadata Marker */}
          <div className="flex items-center gap-3 lg:pl-8 lg:border-l border-[#102A43]/15 shrink-0 self-start lg:self-end">
            <div>
              <div className="text-[10px] font-heading font-extrabold tracking-widest text-[#102A43] uppercase">
                SCIENTIFIC PROVENANCE
              </div>
              <div className="text-xs font-mono font-bold text-[#0E7490] tracking-wider mt-0.5">
                TRACEABLE • DISCLOSED • DIAGNOSTIC
              </div>
            </div>
          </div>
        </div>

        {/* CONTINUOUS SCIENTIFIC PIPELINE TIMELINE: Atmospheric to Agronomic Resolution */}
        <div className="bg-white rounded-2xl border-2 border-[#102A43] p-6 lg:p-8 shadow-[4px_4px_0px_#102A43]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-[#102A43]/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0E7490] animate-pulse" />
              <span className="font-heading font-extrabold text-xs tracking-wider text-[#102A43] uppercase">
                SCIENTIFIC INTELLIGENCE PIPELINE
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#829AB1]">
              PHYSICAL GROUNDING • UP_LKO_BKT ANCHOR
            </span>
          </div>

          {/* Continuous Editorial Timeline Container */}
          <div className="relative">
            {/* Desktop continuous track connector line */}
            <div 
              className="hidden lg:block absolute top-[26px] left-[4%] right-[4%] h-[2px] bg-[#102A43]/15 -z-0" 
              aria-hidden="true" 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 relative z-10">
              {pipelineStages.map((stage, idx) => (
                <div
                  key={stage.step}
                  className="flex flex-col justify-between p-4 rounded-xl bg-[#F8FAFB] border border-[#102A43]/15 hover:border-[#0E7490] transition-colors space-y-3"
                >
                  {/* Step Node Header */}
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-full bg-white border-2 border-[#102A43] flex items-center justify-center font-mono text-xs font-bold text-[#102A43] shadow-xs">
                      {stage.step}
                    </div>
                    <div className="p-1 rounded bg-[#EAF0F2]">
                      {stage.icon}
                    </div>
                  </div>

                  {/* Step Description */}
                  <div className="space-y-1">
                    <strong className="block font-heading text-xs font-bold text-[#102A43] uppercase tracking-tight">
                      {stage.title}
                    </strong>
                    <div className="text-[11px] font-mono text-[#0E7490] font-medium">
                      {stage.subtitle}
                    </div>
                    <p className="text-[11px] text-[#486581] font-sans leading-relaxed pt-1">
                      {stage.desc}
                    </p>
                  </div>

                  {/* Flow Arrow (Mobile/Desktop indicator) */}
                  <div className="pt-2 border-t border-[#102A43]/10 flex items-center justify-between text-[10px] font-mono text-[#829AB1]">
                    <span>STEP {idx + 1} OF 6</span>
                    {idx < 5 && <span className="font-bold text-[#0E7490]">→</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* B. CURRENT FOCUS / GROUND ANCHOR PANEL (Large Horizontal Card) */}
        <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-6 lg:p-8 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 7 Columns: Anchor Information */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#E8F4F6] border border-[#0E7490]/40 text-[#0E7490] text-[11px] font-heading font-extrabold uppercase tracking-wider">
                  CURRENT SCIENTIFIC FOCUS
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#E4F0E8] border border-[#3F7D58]/40 text-[#3F7D58] text-[11px] font-heading font-extrabold uppercase tracking-wider">
                  GROUND ANCHOR
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#102A43] tracking-tight">
                    UP_LKO_BKT
                  </span>
                  <span className="text-base sm:text-lg text-[#0E7490] font-heading font-semibold">
                    Bakshi Ka Talab Block
                  </span>
                </div>
                <p className="text-xs text-[#829AB1] font-sans mt-1">
                  Lucknow District, Central Plain Agro-Climatic Zone, Uttar Pradesh
                </p>
              </div>

              {/* Observation Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#EAF0F2] border border-[#102A43]/10">
                  <div className="flex items-center gap-1.5 text-[#0E7490] text-[10px] font-heading font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Season</span>
                  </div>
                  <div className="mt-1 font-heading font-bold text-sm text-[#102A43]">
                    Kharif 2024
                  </div>
                  <div className="text-[10px] text-[#829AB1]">Jun 1 – Sep 30</div>
                </div>

                <div className="p-3 rounded-xl bg-[#EAF0F2] border border-[#102A43]/10">
                  <div className="flex items-center gap-1.5 text-[#3F7D58] text-[10px] font-heading font-bold uppercase tracking-wider">
                    <Database className="w-3.5 h-3.5" />
                    <span>Records</span>
                  </div>
                  <div className="mt-1 font-heading font-bold text-sm text-[#102A43]">
                    122 Daily
                  </div>
                  <div className="text-[10px] text-[#829AB1]">Continuous series</div>
                </div>

                <div className="p-3 rounded-xl bg-[#EAF0F2] border border-[#102A43]/10">
                  <div className="flex items-center gap-1.5 text-[#D97706] text-[10px] font-heading font-bold uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Coverage</span>
                  </div>
                  <div className="mt-1 font-heading font-bold text-sm text-[#102A43]">
                    440 Villages
                  </div>
                  <div className="text-[10px] text-[#829AB1]">PostGIS boundaries</div>
                </div>

                <div className="p-3 rounded-xl bg-[#EAF0F2] border border-[#102A43]/10">
                  <div className="flex items-center gap-1.5 text-[#0E7490] text-[10px] font-heading font-bold uppercase tracking-wider">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Station</span>
                  </div>
                  <div className="mt-1 font-heading font-bold text-sm text-[#102A43]">
                    27.05° N
                  </div>
                  <div className="text-[10px] text-[#829AB1]">80.92° E Reference</div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Visual GIS Radar / Map Anchor Graphic */}
            <div className="lg:col-span-5 relative flex items-center justify-center p-6 bg-[#EAF0F2] rounded-xl border border-[#102A43]/15 shadow-inner">
              <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center">
                {/* Concentric Coordinate Range Rings */}
                <div className="absolute w-60 h-60 rounded-full border border-[#0E7490]/20" />
                <div className="absolute w-44 h-44 rounded-full border border-[#0E7490]/30" />
                <div className="absolute w-28 h-28 rounded-full border border-[#0E7490]/40" />
                
                {/* Compass Axes */}
                <div className="absolute w-full h-px bg-[#102A43]/15" />
                <div className="absolute h-full w-px bg-[#102A43]/15" />

                {/* Stylized Block Geometric Boundary Silhouette */}
                <svg className="w-48 h-48 text-[#0E7490]/20 fill-current" viewBox="0 0 100 100">
                  <polygon points="30,15 70,12 85,35 80,68 62,88 38,82 18,65 15,35" />
                </svg>
                <svg className="absolute w-24 h-24 text-[#0E7490]/30 fill-current" viewBox="0 0 100 100">
                  <polygon points="25,20 75,18 80,72 50,85 20,70" />
                </svg>

                {/* Ground Anchor Pin */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <span className="w-6 h-6 rounded-full bg-[#0E7490]/30 animate-ping absolute" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#0E7490] border-2 border-white shadow-[0_0_8px_#0E7490]" />
                  </div>
                  <div className="mt-2 px-2.5 py-1 rounded bg-[#102A43] text-white text-[10px] font-heading font-bold shadow-[2px_2px_0px_#0E7490] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0891B2]" />
                    <span>BKT (UP_LKO)</span>
                  </div>
                </div>

                {/* Coordinates Tag */}
                <span className="absolute top-1 left-2 text-[9px] font-mono text-[#829AB1]">27.05°N</span>
                <span className="absolute bottom-1 right-2 text-[9px] font-mono text-[#829AB1]">80.85°E</span>
              </div>
            </div>

          </div>
        </div>

        {/* C & D. TWO-COLUMN GRID: Scientific Operating Mode & Platform Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* C. SCIENTIFIC MODE CARD (Left 6 Columns) */}
          <div className="lg:col-span-6 bg-[#0B1F33] text-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#0891B2]">
                  SCIENTIFIC OPERATING MODE
                </span>
                <span className="px-2.5 py-0.5 rounded bg-[#102A43] text-[#0891B2] text-[10px] font-heading font-bold border border-[#0891B2]/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                  OPERATIONAL FORECAST: NOT ACTIVE
                </span>
              </div>

              <div>
                <h3 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                  DIAGNOSTIC ONLY
                </h3>
                <p className="text-sm text-[#B8C7D1] leading-relaxed font-sans mt-3">
                  Forecasts and advisories are presented for guidance, research and demonstration purposes. Technical service availability does not imply operational scientific validity.
                </p>
              </div>

              {/* Scientific Guardrails List */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2 text-xs text-[#B8C7D1]">
                  <ShieldCheck className="w-4 h-4 text-[#0891B2] shrink-0 mt-0.5" />
                  <span>Single-season empirical constraint strictly enforced (Kharif 2024 archive).</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#B8C7D1]">
                  <Activity className="w-4 h-4 text-[#0891B2] shrink-0 mt-0.5" />
                  <span>Crop yield, biomass, and financial loss predictions are strictly prohibited.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#B8C7D1]">
                  <ShieldCheck className="w-4 h-4 text-[#0891B2] shrink-0 mt-0.5" />
                  <span>Non-alarmist risk classification and calibrated probability thresholds active.</span>
                </div>
              </div>
            </div>

            {/* Bottom Caution Banner */}
            <div className="pt-4 border-t border-white/15 flex items-center gap-2 text-xs text-[#B8C7D1]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F59E0B]" />
              <span>Diagnostic sandbox mode only — not for unverified civil warning dispatch.</span>
            </div>
          </div>

          {/* D. PLATFORM STATUS CARD (Right 6 Columns) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#829AB1]">
                  PLATFORM STATUS
                </span>
                <span className="px-2.5 py-0.5 rounded bg-[#E4F0E8] text-[#3F7D58] text-[10px] font-heading font-bold border border-[#3F7D58]/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3F7D58]" />
                  ALL SYSTEMS AVAILABLE
                </span>
              </div>

              <h3 className="font-heading font-bold text-2xl text-[#102A43]">
                Core Subsystems Telemetry
              </h3>

              {/* Compact Subsystem Rows */}
              <div className="space-y-2 pt-1">
                {subsystemStatuses.map((sub) => (
                  <div
                    key={sub.name}
                    className="p-2.5 rounded-xl bg-[#F3F6F7] border border-[#102A43]/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="p-1 rounded bg-white border border-[#102A43]/10 shrink-0">
                        {sub.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="font-heading font-bold text-[#102A43] truncate">
                          {sub.name}
                        </div>
                        <div className="text-[10px] text-[#829AB1] truncate">
                          {sub.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold flex items-center gap-1.5 ${
                          sub.statusType === 'healthy'
                            ? 'bg-[#E4F0E8] text-[#3F7D58] border border-[#3F7D58]/30'
                            : sub.statusType === 'demo'
                            ? 'bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/40'
                            : 'bg-[#EAF0F2] text-[#829AB1] border border-[#829AB1]/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sub.statusType === 'healthy'
                              ? 'bg-[#3F7D58]'
                              : sub.statusType === 'demo'
                              ? 'bg-[#D97706]'
                              : 'bg-[#829AB1]'
                          }`}
                        />
                        {sub.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#102A43]/30 hidden sm:block" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distinction Disclosure Note */}
            <div className="pt-3 border-t border-[#102A43]/10 text-[11px] text-[#829AB1] font-sans flex items-start gap-1.5">
              <span className="font-heading font-bold text-[#102A43] shrink-0">Important Note:</span>
              <span>
                Technical uptime indicates API and database connectivity only; it does not constitute operational scientific validity.
              </span>
            </div>
          </div>

        </div>

        {/* E. HORIZONTAL PROVENANCE STRIP (Section E) */}
        <div id="provenance-strip" className="bg-[#0B1F33] text-white rounded-2xl border-2 border-[#102A43] p-6 lg:p-7 shadow-[4px_4px_0px_#102A43]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Motto */}
            <div className="space-y-1 max-w-sm">
              <div className="font-heading font-black text-lg text-white leading-snug">
                Better information. Stronger decisions. A more resilient tomorrow.
              </div>
              <div className="text-[11px] font-sans text-[#0891B2]">
                VarshaSetu Meteorological & Agronomic Foundation
              </div>
            </div>

            {/* Right Metadata Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/15 lg:pl-8">
              <div className="space-y-0.5">
                <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#0891B2]">
                  GROUND ANCHOR
                </div>
                <div className="font-mono font-bold text-sm text-white">UP_LKO_BKT</div>
                <div className="text-[10px] text-white/60">Bakshi Ka Talab</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#0891B2]">
                  OBSERVATIONAL ARCHIVE
                </div>
                <div className="font-mono font-bold text-sm text-white">KHARIF 2024</div>
                <div className="text-[10px] text-white/60">IMD & ERA5 Verified</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#0891B2]">
                  OBSERVATIONS
                </div>
                <div className="font-mono font-bold text-sm text-white">122 RECORDS</div>
                <div className="text-[10px] text-white/60">June 1 – Sept 30</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#0891B2]">
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
