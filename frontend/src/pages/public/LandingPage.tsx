import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CloudRain,
  Sprout,
  ShieldCheck,
  ArrowRight,
  Waves,
  TrendingUp,
  MapPin,
  Droplets,
  Calendar,
} from 'lucide-react';
import { RoleGatewaySection } from '../../components/landing/RoleGatewaySection';
import { ScientificGroundingSection } from '../../components/landing/ScientificGroundingSection';
import { TrustIntegritySection } from '../../components/landing/TrustIntegritySection';
import { FinalCTASection } from '../../components/landing/FinalCTASection';
import { LandingFooter } from '../../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 bg-canvas text-[#102A43]">
      {/* 1. HERO SECTION — CINEMATIC AGRICULTURAL INTELLIGENCE EXPERIENCE */}
      <section 
        id="home" 
        className="relative min-h-[720px] lg:min-h-[780px] pt-8 pb-16 lg:pt-12 lg:pb-20 border-b border-[#B8C5CC]/60 bg-[#FAF7F2] overflow-hidden"
      >
        {/* Atmospheric Isobar & Terrain Contour Background (Low contrast 0.015–0.035, discovers naturally) */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.025]" 
          aria-hidden="true" 
        >
          <svg className="w-full h-full object-cover" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 160 C 250 110, 580 290, 1080 200 C 1300 160, 1480 240, 1600 260" stroke="#102A43" strokeWidth="1.2" />
            <path d="M-100 320 C 220 260, 680 440, 1030 350 C 1320 280, 1430 390, 1600 370" stroke="#0E7490" strokeWidth="1" strokeDasharray="5 5" />
            <path d="M-100 480 C 380 430, 760 610, 1180 490 C 1380 430, 1480 540, 1600 520" stroke="#102A43" strokeWidth="1.2" />
            <path d="M-100 660 C 320 600, 720 760, 1120 660 C 1350 610, 1460 690, 1600 680" stroke="#0E7490" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M-100 820 C 280 770, 650 910, 1050 820 C 1280 770, 1440 840, 1600 830" stroke="#102A43" strokeWidth="1" />
          </svg>
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,#0E7490_0%,transparent_70%)] opacity-20 blur-3xl pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main 2-column Fluid Hero Grid: Left ~45%, Right ~55% */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LAYER 2: LEFT COLUMN — Editorial Story & Primary CTA (5 cols on lg+) */}
            <div className="lg:col-span-5 flex flex-col justify-center max-w-[560px]">
              {/* Eyebrow Micro-Label — Understated & Compact */}
              <div className="mb-6 sm:mb-7">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E8F4F6]/80 border border-[#0E7490]/20 text-[#0E7490] text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider animate-fade-up animation-delay-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E7490]" />
                  <span>SCIENCE / DATA / BETTER DECISIONS</span>
                </div>
              </div>

              {/* Publication / Editorial Headline — CANONICAL HEADLINE, STRICTLY NO UNDERLINE */}
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4.25rem] text-[#102A43] tracking-tight leading-[1.0] lg:leading-[1.02] max-w-[560px] mb-6 animate-fade-up animation-delay-180">
                From monsoon predictions to{' '}
                <br />
                <span className="text-[#0E7490] font-black">
                  SMARTER FARM DECISIONS.
                </span>
              </h1>

              {/* Shortened Positioning Description (2-3 lines max) */}
              <p className="text-base sm:text-lg text-[#486581] leading-relaxed font-sans max-w-[500px] mb-7 sm:mb-8 animate-fade-up animation-delay-280">
                VarshaSetu turns monsoon forecasts and regional weather signals into practical intelligence for better farm decisions.
              </p>

              {/* Exactly ONE Primary CTA */}
              <div className="animate-fade-up animation-delay-380">
                <Link to="/auth" className="inline-block w-full sm:w-auto">
                  <button 
                    data-testid="hero-primary-cta"
                    className="btn-brutal-teal w-full sm:w-auto px-8 py-4 rounded-xl font-heading font-bold text-base inline-flex items-center justify-center gap-3 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490] focus-visible:ring-offset-2 active:translate-y-0.5 shadow-[3px_3px_0px_#102A43] hover:shadow-[5px_5px_0px_#102A43] transition-all"
                  >
                    <span>Explore Monsoon Intelligence</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
                  </button>
                </Link>
              </div>
            </div>

            {/* LAYER 3 & 4: RIGHT COLUMN — Blended Cinematic Photograph & Floating Indicators (7 cols on lg+) */}
            <div className="lg:col-span-7 relative mt-6 lg:mt-0">
              
              {/* ANNOTATION 1: Monsoon Forecast (Top-Right) */}
              <div 
                data-testid="floating-card-monsoon"
                className="absolute -top-2 right-3 sm:-top-3 sm:right-5 z-20 bg-white/85 sm:bg-white/90 backdrop-blur-md border border-[#102A43]/10 rounded-xl p-2.5 sm:p-3 shadow-[0_4px_16px_rgba(16,42,67,0.04)] animate-fade-up animation-delay-320 max-w-[205px]"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#486581]">
                  <CloudRain className="w-3.5 h-3.5 text-[#0E7490]" />
                  <span>MONSOON FORECAST</span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading font-black text-sm text-[#102A43]">Moderate Rain</span>
                  <span className="text-[10px] font-mono font-bold text-[#0E7490] bg-[#E8F4F6] px-1.5 py-0.5 rounded border border-[#0891B2]/30">7–10 DAYS</span>
                </div>
                <p className="text-[10px] text-[#486581] mt-0.5 font-sans">Probabilistic downscaled diagnostic</p>
              </div>

              {/* ANNOTATION 2: Soil Moisture (Mid-Right, hidden on compact mobile) */}
              <div 
                data-testid="floating-card-soil"
                className="absolute top-1/2 -right-1 sm:-right-3 -translate-y-1/2 z-20 bg-white/85 sm:bg-white/90 backdrop-blur-md border border-[#102A43]/10 rounded-xl p-2.5 sm:p-3 shadow-[0_4px_16px_rgba(16,42,67,0.04)] animate-fade-up animation-delay-460 max-w-[185px] hidden sm:block"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#486581]">
                  <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SOIL MOISTURE</span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading font-black text-sm text-[#102A43]">Adequate</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-[#486581] mt-0.5 font-sans">Kharif Root-Zone Context</p>
              </div>

              {/* ANNOTATION 3: Field Context (Bottom-Left) */}
              <div 
                data-testid="floating-card-field"
                className="absolute bottom-4 left-3 sm:bottom-6 sm:left-5 z-20 bg-white/85 sm:bg-white/90 backdrop-blur-md border border-[#102A43]/10 rounded-xl p-2.5 sm:p-3 shadow-[0_4px_16px_rgba(16,42,67,0.04)] animate-fade-up animation-delay-480 max-w-[205px]"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#486581]">
                  <MapPin className="w-3.5 h-3.5 text-[#0E7490]" />
                  <span>FIELD CONTEXT</span>
                </div>
                <div className="mt-1">
                  <span className="font-heading font-black text-sm text-[#102A43] block">Bakshi Ka Talab</span>
                  <span className="text-[10px] font-mono text-[#0E7490] font-bold">UP_LKO_BKT · Kharif 2024</span>
                </div>
              </div>

              {/* PRIMARY CINEMATIC FARMER PHOTOGRAPH — ENVIRONMENTAL DISSOLVE INTO #FAF7F2 */}
              <div 
                data-testid="hero-image-frame"
                className="relative animate-settle-in animation-delay-180 group cursor-default"
              >
                <div 
                  className="relative overflow-hidden w-full h-[420px] sm:h-[480px] md:h-[520px] lg:h-[550px] xl:h-[590px]"
                  style={{
                    WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 62% 44%, black 44%, rgba(0,0,0,0.88) 64%, rgba(0,0,0,0.32) 82%, transparent 100%)',
                    maskImage: 'radial-gradient(ellipse 90% 85% at 62% 44%, black 44%, rgba(0,0,0,0.88) 64%, rgba(0,0,0,0.32) 82%, transparent 100%)',
                  }}
                >
                  {/* Subtle desktop focus micro-interaction */}
                  <div className="w-full h-full transition-transform duration-700 lg:duration-1000 ease-out group-hover:scale-[1.015]">
                    <img
                      src="/images/hero-farmer.jpg"
                      alt="Indian farmer inspecting VarshaSetu agro-climate intelligence on a tablet in agricultural field"
                      className="w-full h-full object-cover object-[center_30%] sm:object-[center_35%] filter saturate-[1.03] contrast-[1.02] animate-cinematic-zoom"
                      loading="eager"
                      data-testid="hero-farmer-image"
                    />
                  </div>

                  {/* Soft atmospheric gradient edge masking seamlessly blending into #FAF7F2 canvas */}
                  {/* Left edge broad atmospheric blend */}
                  <div className="absolute inset-y-0 left-0 w-28 sm:w-40 lg:w-52 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/65 via-[#FAF7F2]/20 to-transparent pointer-events-none z-10" />
                  {/* Top edge sky fade */}
                  <div className="absolute inset-x-0 top-0 h-14 sm:h-20 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/45 to-transparent pointer-events-none z-10" />
                  {/* Bottom edge field dissolve into next section */}
                  <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 lg:h-44 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/75 via-[#FAF7F2]/30 to-transparent pointer-events-none z-10" />
                  {/* Right edge soft dissolve */}
                  <div className="absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-[#FAF7F2]/60 to-transparent pointer-events-none z-10" />

                  {/* Subtle tonal balance */}
                  <div className="absolute inset-0 bg-[#FAF7F2]/[0.015] mix-blend-overlay pointer-events-none" />
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 2. SIGNAL → CONTEXT → DECISION (INTELLIGENCE) */}
      <section 
        id="intelligence"
        data-testid="signal-context-decision-transition"
        className="relative py-20 lg:py-28 xl:py-32 bg-[#FAF7F2] border-b border-[#B8C5CC]/60 overflow-hidden scroll-mt-24 sm:scroll-mt-28"
      >
        {/* Subtle atmospheric flowline continuation (low opacity 0.02, aria-hidden) */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02]" 
          aria-hidden="true" 
        >
          <svg className="w-full h-full object-cover" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 160 C 350 110, 750 260, 1150 180 C 1380 130, 1480 220, 1600 200" stroke="#102A43" strokeWidth="1.2" />
            <path d="M-100 320 C 300 260, 700 400, 1100 320 C 1320 270, 1460 360, 1600 340" stroke="#0E7490" strokeWidth="1" strokeDasharray="5 5" />
            <path d="M-100 460 C 380 400, 780 520, 1180 440 C 1360 400, 1480 480, 1600 460" stroke="#102A43" strokeWidth="1" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Introduction */}
          <div className="max-w-3xl mb-12 lg:mb-16 animate-fade-up animation-delay-100">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#0E7490]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E7490]" aria-hidden="true" />
              <span>SIGNAL → CONTEXT → DECISION</span>
            </div>
            <h2 className="mt-4 font-heading font-black text-3xl sm:text-4xl lg:text-[2.65rem] text-[#102A43] tracking-tight leading-tight">
              From atmospheric signals to grounded farm intelligence.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#486581] font-sans leading-relaxed max-w-[700px]">
              VarshaSetu combines large-scale monsoon signals, local atmospheric context, and field observations to turn uncertain weather information into practical intelligence.
            </p>
          </div>

          {/* Three-Stage Editorial Connected Intelligence Pipeline */}
          <div className="relative">
            {/* Subtle desktop connecting flowline running behind the stages */}
            <div 
              className="hidden lg:block absolute top-7 left-12 right-12 h-px bg-gradient-to-r from-[#102A43]/15 via-[#0E7490]/30 to-[#102A43]/15 pointer-events-none" 
              aria-hidden="true" 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-14 xl:gap-16 relative">
              {/* Stage 01: Monsoon Signals */}
              <div className="space-y-4 relative group animate-fade-up animation-delay-180">
                <div className="flex items-center justify-between pb-3 border-b border-[#102A43]/10">
                  <span className="font-mono text-xs font-bold text-[#0E7490] tracking-wider uppercase">
                    01 / MONSOON SIGNALS
                  </span>
                  <span className="hidden lg:inline-flex text-[#0E7490]/40 font-mono text-sm select-none" aria-hidden="true">
                    ────────→
                  </span>
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-[#102A43] tracking-tight">
                  Synoptic Teleconnections
                </h3>
                <p className="text-sm sm:text-base text-[#486581] font-sans leading-relaxed">
                  Large-scale atmospheric patterns such as ENSO, IOD and MJO establish the broader monsoon signal across extended outlook periods.
                </p>
                <div className="pt-2 text-xs font-mono text-[#0E7490] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E7490]" aria-hidden="true" />
                  <span className="font-semibold tracking-wider uppercase">GLOBAL + REGIONAL SIGNALS</span>
                </div>

                {/* Subtle vertical connector on mobile between 01 and 02 */}
                <div className="lg:hidden flex justify-center py-2 text-[#0E7490]/40 font-mono text-sm select-none" aria-hidden="true">
                  ↓
                </div>
              </div>

              {/* Stage 02: Field Context */}
              <div className="space-y-4 relative group animate-fade-up animation-delay-280">
                <div className="flex items-center justify-between pb-3 border-b border-[#102A43]/10">
                  <span className="font-mono text-xs font-bold text-[#0E7490] tracking-wider uppercase">
                    02 / FIELD CONTEXT
                  </span>
                  <span className="hidden lg:inline-flex text-[#0E7490]/40 font-mono text-sm select-none" aria-hidden="true">
                    ────────→
                  </span>
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-[#102A43] tracking-tight">
                  Hyperlocal Downscaling
                </h3>
                <p className="text-sm sm:text-base text-[#486581] font-sans leading-relaxed">
                  Regional and block-level conditions translate those broader signals into localized context, grounded by observations and field records.
                </p>
                <div className="pt-2 text-xs font-mono text-[#0E7490] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E7490]" aria-hidden="true" />
                  <span className="font-semibold tracking-wider uppercase">BLOCK-LEVEL CONTEXT · UP_LKO_BKT</span>
                </div>

                {/* Subtle vertical connector on mobile between 02 and 03 */}
                <div className="lg:hidden flex justify-center py-2 text-[#0E7490]/40 font-mono text-sm select-none" aria-hidden="true">
                  ↓
                </div>
              </div>

              {/* Stage 03: Farm Decisions */}
              <div className="space-y-4 relative group animate-fade-up animation-delay-380">
                <div className="flex items-center justify-between pb-3 border-b border-[#102A43]/10">
                  <span className="font-mono text-xs font-bold text-[#0E7490] tracking-wider uppercase">
                    03 / FARM DECISIONS
                  </span>
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-[#102A43] tracking-tight">
                  Actionable Operations
                </h3>
                <p className="text-sm sm:text-base text-[#486581] font-sans leading-relaxed">
                  Rain windows, weather risk and localized advisories become practical inputs for day-to-day farm decisions.
                </p>
                <div className="pt-2 text-xs font-mono text-[#0E7490] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E7490]" aria-hidden="true" />
                  <span className="font-semibold tracking-wider uppercase">SOWING · SPRAYING · HARVEST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial transition marker pointing toward operational workspaces */}
          <div className="mt-16 lg:mt-20 pt-8 border-t border-[#102A43]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-mono font-bold text-[#0E7490] tracking-wider uppercase">
                INTELLIGENCE → OPERATIONAL VIEWS
              </span>
              <span className="text-[#829AB1] font-mono hidden sm:inline">/</span>
              <span className="text-[#486581] font-sans">
                Translating verified atmospheric context into dedicated workspaces across every tier of agricultural operations.
              </span>
            </div>
            <a
              href="#workspaces"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0E7490] hover:text-[#102A43] transition-colors shrink-0"
            >
              <span>Explore Roles Below</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>
 
      {/* 3. ROLE GATEWAY & CAPABILITIES (WORKSPACES) */}
      <RoleGatewaySection />
 
      {/* 4. SCIENTIFIC GROUNDING & PLATFORM STATUS (METHOD) */}
      <ScientificGroundingSection />

      {/* 5. TRUST & INTEGRITY BAND (TRUST) */}
      <TrustIntegritySection />

      {/* 6. FINAL EDITORIAL CTA SECTION */}
      <FinalCTASection />

      {/* 7. LANDING FOOTER */}
      <LandingFooter />
    </div>
  );
};
