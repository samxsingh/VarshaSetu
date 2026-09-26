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
} from 'lucide-react';
import { RoleGatewaySection } from '../../components/landing/RoleGatewaySection';
import { ScientificGroundingSection } from '../../components/landing/ScientificGroundingSection';
import { DecisionPathwaysSection } from '../../components/landing/DecisionPathwaysSection';
import { TrustIntegritySection } from '../../components/landing/TrustIntegritySection';
import { FinalCTASection } from '../../components/landing/FinalCTASection';
import { LandingFooter } from '../../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 bg-canvas text-[#102A43]">
      {/* 1. HERO SECTION — CLIMATE INTELLIGENCE & MONSOON OBSERVATORY */}
      <section className="relative pt-6 pb-16 lg:pt-10 lg:pb-20 border-b border-[#B8C5CC]/60 bg-[#F3F6F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Editorial Typography & Strategic CTAs (50% on lg+) */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-6 max-w-xl">
              {/* Eyebrow Micro-Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#E8F4F6] border border-[#0E7490]/40 text-[#0E7490] text-xs font-heading font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#102A43] animate-fade-up">
                <span className="w-2 h-2 rounded-full bg-[#0E7490] animate-pulse" />
                <span>SCIENCE / DATA / BETTER DECISIONS</span>
              </div>

              {/* High-Impact Editorial Headline */}
              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#102A43] tracking-tight leading-[1.08] animate-fade-up">
                From climate signals to{' '}
                <span className="text-[#0E7490] block sm:inline">
                  confident farm decisions.
                </span>
              </h1>

              {/* Concise Scientific Description */}
              <p className="text-base sm:text-lg text-[#486581] leading-relaxed font-sans animate-fade-up">
                VarshaSetu translates planetary climate data, weather patterns and regional atmospheric insights into probabilistic forecasts and agricultural intelligence.
              </p>

              {/* Action Buttons (Neo-brutalist depth & clear hierarchy) */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-up">
                <Link to="/farmer/dashboard" className="inline-block">
                  <button className="btn-brutal-teal w-full sm:w-auto px-6 py-3.5 rounded-xl font-heading font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 group cursor-pointer">
                    <span>Explore Monsoon Intelligence</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>

                <div className="flex items-center gap-2.5">
                  <Link to="/farmer/onboarding" className="flex-1 sm:flex-none">
                    <button className="btn-brutal-secondary w-full sm:w-auto px-4 sm:px-5 py-3.5 rounded-xl font-heading font-medium text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer">
                      <Sprout className="w-4 h-4 text-[#0E7490]" />
                      <span>I’m a Farmer</span>
                    </button>
                  </Link>

                  <Link to="/officer" className="flex-1 sm:flex-none">
                    <button className="btn-brutal-secondary w-full sm:w-auto px-4 sm:px-5 py-3.5 rounded-xl font-heading font-medium text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer">
                      <ShieldCheck className="w-4 h-4 text-[#0E7490]" />
                      <span>I’m an Officer</span>
                    </button>
                  </Link>
                </div>
              </div>

              {/* Scientific Anchor Metadata Badge */}
              <div className="pt-3 border-t border-[#102A43]/10 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#486581] font-sans">
                <span className="font-heading font-bold text-[#102A43] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0E7490]" />
                  Ground Anchor:
                </span>
                <span>Bakshi Ka Talab Block (UP_LKO_BKT)</span>
                <span className="hidden sm:inline text-[#102A43]/30">|</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                  Observational Archive: Kharif 2024 (122d)
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Field Observation Frame & Scientific Annotation Rail System */}
            <div className="lg:col-span-6 xl:col-span-6 relative mt-4 lg:mt-0">
              
              {/* DESKTOP/TABLET: Compact Scientific Annotation Strip directly ABOVE image frame */}
              <div className="hidden md:grid md:grid-cols-12 gap-3 mb-3">
                {/* Module A: RAIN SIGNAL */}
                <div className="md:col-span-7 bg-white border border-[#B8C5CC] rounded-xl px-3.5 py-2.5 shadow-[2px_2px_0px_#102A43]">
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#486581] font-heading font-bold">
                    <span className="flex items-center gap-1.5 text-[#102A43]">
                      <CloudRain className="w-3.5 h-3.5 text-[#0E7490]" />
                      RAIN SIGNAL
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#DBEAFE] text-[#2563EB] text-[9px] font-bold">
                      7–10 DAYS
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <div className="font-heading font-bold text-xs sm:text-sm text-[#102A43]">
                      Moderate Risk
                    </div>
                    <div className="text-[10px] text-[#486581] font-sans truncate">
                      Probabilistic downscaled diagnostic
                    </div>
                  </div>
                </div>

                {/* Module B: CLIMATE SIGNALS */}
                <div className="md:col-span-5 bg-white border border-[#B8C5CC] rounded-xl px-3 py-2.5 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
                  <div className="text-[10px] uppercase tracking-wider text-[#486581] font-heading font-bold flex items-center gap-1 text-[#102A43]">
                    <Waves className="w-3.5 h-3.5 text-[#0E7490]" />
                    CLIMATE SIGNALS
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded bg-[#EAF0F2] border border-[#B8C5CC] font-heading font-bold text-[10px] text-[#102A43]">
                      ENSO
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#EAF0F2] border border-[#B8C5CC] font-heading font-bold text-[10px] text-[#102A43]">
                      IOD
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#EAF0F2] border border-[#B8C5CC] font-heading font-bold text-[10px] text-[#102A43]">
                      MJO
                    </span>
                  </div>
                </div>
              </div>

              {/* PRIMARY FIELD OBSERVATION FRAME */}
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#102A43] bg-white shadow-[4px_4px_0px_#102A43]">
                <img
                  src="/images/hero-farmer.jpg"
                  alt="Indian farmer inspecting VarshaSetu agro-climate intelligence on a tablet in agricultural field"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[430px] object-cover object-center filter saturate-[1.03]"
                  loading="eager"
                />

                {/* Attached Field Observation Rail immediately beneath the photo */}
                <div className="border-t-2 border-[#102A43] bg-[#0B1F33] px-3.5 sm:px-4 py-2.5 text-white font-sans">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0891B2] animate-pulse shrink-0" />
                      <span className="font-heading font-bold text-[11px] sm:text-xs tracking-wider uppercase text-white">
                        FIELD OBSERVATION
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#0891B2]">
                      <span className="font-bold">UP_LKO_BKT</span>
                      <span className="text-white/30">•</span>
                      <span className="text-[#EAF0F2]">122 OBS</span>
                    </div>
                  </div>
                  <div className="mt-1 text-[11px] text-[#829AB1] font-sans flex items-center justify-between">
                    <span>Bakshi Ka Talab · Kharif 2024 Observational Archive</span>
                    <span className="text-[10px] text-[#829AB1] hidden sm:inline">Ground Anchor</span>
                  </div>
                </div>
              </div>

              {/* DESKTOP/TABLET: Module C — MODEL CALIBRATION Module below the observation frame */}
              <div className="hidden md:flex items-center justify-between bg-white border border-[#B8C5CC] rounded-xl px-3.5 py-2 mt-3 shadow-[2px_2px_0px_#102A43] text-xs font-sans">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#0E7490] shrink-0" />
                  <span className="font-heading font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-[#486581]">
                    MODEL CALIBRATION
                  </span>
                  <span className="text-[#B8C5CC]">•</span>
                  <span className="font-heading font-extrabold text-[#102A43]">
                    68%
                  </span>
                  <span className="text-[#486581] text-[11px]">
                    Medium Skill
                  </span>
                </div>
                <div className="text-[10px] text-[#829AB1] font-mono">
                  Isotonic + Platt Curves
                </div>
              </div>

              {/* MOBILE ONLY: Annotation Modules in strict normal document flow */}
              <div className="space-y-2.5 mt-3 md:hidden">
                {/* Mobile Rain Signal */}
                <div className="bg-white border border-[#B8C5CC] rounded-xl p-3 shadow-[2px_2px_0px_#102A43]">
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#486581] font-heading font-bold">
                    <span className="flex items-center gap-1.5 text-[#102A43]">
                      <CloudRain className="w-3.5 h-3.5 text-[#0E7490]" />
                      RAIN SIGNAL
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#DBEAFE] text-[#2563EB] text-[9px] font-bold">
                      7–10 DAYS
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <div className="font-heading font-bold text-sm text-[#102A43]">
                      Moderate Risk
                    </div>
                    <div className="text-[10px] text-[#486581] font-sans">
                      Probabilistic downscaled diagnostic
                    </div>
                  </div>
                </div>

                {/* Mobile Climate Signals */}
                <div className="bg-white border border-[#B8C5CC] rounded-xl p-3 shadow-[2px_2px_0px_#102A43]">
                  <div className="text-[10px] uppercase tracking-wider text-[#486581] font-heading font-bold flex items-center gap-1.5 text-[#102A43] mb-1.5">
                    <Waves className="w-3.5 h-3.5 text-[#0E7490]" />
                    CLIMATE SIGNALS
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-center py-1 rounded bg-[#EAF0F2] border border-[#B8C5CC] font-heading font-bold text-[10px] text-[#102A43]">
                      ENSO
                    </span>
                    <span className="flex-1 text-center py-1 rounded bg-[#EAF0F2] border border-[#B8C5CC] font-heading font-bold text-[10px] text-[#102A43]">
                      IOD
                    </span>
                    <span className="flex-1 text-center py-1 rounded bg-[#EAF0F2] border border-[#B8C5CC] font-heading font-bold text-[10px] text-[#102A43]">
                      MJO
                    </span>
                  </div>
                </div>

                {/* Mobile Model Calibration */}
                <div className="bg-white border border-[#B8C5CC] rounded-xl p-3 shadow-[2px_2px_0px_#102A43]">
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#486581] font-heading font-bold">
                    <span className="flex items-center gap-1.5 text-[#0E7490]">
                      <TrendingUp className="w-3.5 h-3.5" />
                      MODEL CALIBRATION
                    </span>
                    <span className="text-[10px] text-[#829AB1] font-mono">
                      Isotonic + Platt
                    </span>
                  </div>
                  <div className="mt-1 font-heading font-extrabold text-base text-[#102A43] flex items-baseline gap-2">
                    <span>68%</span>
                    <span className="text-xs font-medium text-[#486581] font-sans">Medium Skill</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
 
      {/* 2. ROLE GATEWAY & CAPABILITIES SECTION */}
      <RoleGatewaySection />
 
      {/* 3. SCIENTIFIC GROUNDING & PLATFORM STATUS SECTION */}
      <ScientificGroundingSection />

      {/* 4. DECISION PATHWAYS SECTION */}
      <DecisionPathwaysSection />

      {/* 5. TRUST & INTEGRITY BAND */}
      <TrustIntegritySection />

      {/* 6. FINAL EDITORIAL CTA SECTION */}
      <FinalCTASection />

      {/* 7. LANDING FOOTER */}
      <LandingFooter />
    </div>
  );
};
