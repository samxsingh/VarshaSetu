import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CloudRain,
  Sprout,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sparkles,
  Waves,
  Globe2,
  Volume2,
  Languages,
  CheckCircle2,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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
      <section className="relative overflow-hidden pt-6 pb-16 lg:pt-10 lg:pb-20 border-b border-[#102A43]/15 bg-editorial-grain">
        {/* Subtle contour texture overlay */}
        <div className="absolute inset-0 opacity-25 pointer-events-none bg-subtle-contour" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Editorial Typography & Strategic CTAs (55% width on xl) */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-6">
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
              <p className="text-base sm:text-lg text-[#486581] leading-relaxed font-sans max-w-xl animate-fade-up">
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

            {/* RIGHT COLUMN: Atmospheric & Field Imagery with Floating Intelligence Cards */}
            <div className="lg:col-span-6 xl:col-span-5 relative mt-4 lg:mt-0">
              {/* Primary Image Frame with Crisp Neo-Brutalist Border & Attached Status Rail */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#102A43] bg-white shadow-[6px_6px_0px_#102A43] group">
                <img
                  src="/images/hero-farmer.jpg"
                  alt="Indian farmer inspecting VarshaSetu agro-climate intelligence on a tablet in agricultural field"
                  className="w-full h-[320px] sm:h-[400px] lg:h-[460px] object-cover object-center filter saturate-[1.04] transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="eager"
                />

                {/* Attached Caption Rail immediately below the photo */}
                <div className="border-t-2 border-[#102A43] bg-[#0B1F33] px-3.5 sm:px-4 py-2.5 text-white flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0891B2] animate-pulse shrink-0" />
                    <span className="font-heading font-semibold text-[11px] sm:text-xs tracking-wide">
                      Hyperlocal Field Intelligence
                    </span>
                    <span className="text-[#829AB1] hidden sm:inline">•</span>
                    <span className="text-[#EAF0F2] text-[11px] hidden sm:inline">
                      1 Action Recommended
                    </span>
                  </div>
                  <span className="text-[#0891B2] font-heading font-bold text-[11px] tracking-wide shrink-0">
                    UP_LKO_BKT Pilot
                  </span>
                </div>
              </div>

              {/* DESKTOP FLOATING CARD 1: Rain Event Intelligence (Perimeter Top Left) */}
              <div className="hidden md:block absolute -top-4 -left-6 lg:-top-5 lg:-left-8 z-20 bg-white/95 backdrop-blur-md border border-[#102A43] rounded-xl p-3 shadow-[3px_3px_0px_#102A43] animate-float-slow max-w-[210px] sm:max-w-[220px]">
                <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#486581] font-heading font-bold">
                  <span className="flex items-center gap-1 text-[#2563EB]">
                    <CloudRain className="w-3.5 h-3.5" />
                    RAIN EVENT
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#DBEAFE] text-[#2563EB] text-[9px] font-bold">
                    7–10 DAYS
                  </span>
                </div>
                <div className="mt-1 font-heading font-bold text-sm text-[#102A43]">
                  Moderate Risk
                </div>
                <div className="text-[10px] text-[#486581] mt-0.5">
                  Probabilistic Downscaled Model
                </div>
              </div>

              {/* DESKTOP FLOATING CARD 2: Forecast Reliability Score (Perimeter Lower Left) */}
              <div className="hidden md:block absolute bottom-12 -left-6 lg:bottom-14 lg:-left-8 z-20 bg-white/95 backdrop-blur-md border border-[#102A43] rounded-xl p-3 shadow-[3px_3px_0px_#102A43] animate-float-alt max-w-[210px] sm:max-w-[220px]">
                <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#486581] font-heading font-bold">
                  <span className="flex items-center gap-1 text-[#0E7490]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    CONFIDENCE
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#E8F4F6] text-[#0E7490] text-[9px] font-bold">
                    CALIBRATED
                  </span>
                </div>
                <div className="mt-1 font-heading font-extrabold text-lg text-[#102A43] flex items-baseline gap-1.5">
                  <span>68%</span>
                  <span className="text-xs font-medium text-[#486581] font-sans">Medium Skill</span>
                </div>
                <div className="text-[10px] text-[#829AB1] mt-0.5">
                  Isotonic & Platt Reliability Curve
                </div>
              </div>

              {/* DESKTOP FLOATING CARD 3: Climate Teleconnections (Perimeter Top Right) */}
              <div className="hidden md:block absolute top-3 -right-4 lg:top-4 lg:-right-6 z-20 bg-white/95 backdrop-blur-md border border-[#B8C5CC] rounded-xl p-2.5 shadow-[3px_3px_0px_#102A43] max-w-[190px]">
                <div className="text-[9px] uppercase tracking-wider text-[#486581] font-heading font-bold flex items-center gap-1 text-[#102A43]">
                  <Waves className="w-3 h-3 text-[#0E7490]" />
                  CLIMATE SIGNALS
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-[#EAF0F2] border border-[#102A43]/20 font-heading font-bold text-[#102A43]">
                    ENSO
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#EAF0F2] border border-[#102A43]/20 font-heading font-bold text-[#102A43]">
                    IOD
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#EAF0F2] border border-[#102A43]/20 font-heading font-bold text-[#102A43]">
                    MJO
                  </span>
                </div>
              </div>

              {/* MOBILE ONLY: 3 stacked intelligence cards beneath the image frame (normal document flow) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 md:hidden">
                {/* Mobile Card 1: Rain Event */}
                <div className="bg-white rounded-xl border border-[#102A43] p-3 shadow-[2px_2px_0px_#102A43]">
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#486581] font-heading font-bold">
                    <span className="flex items-center gap-1 text-[#2563EB]">
                      <CloudRain className="w-3.5 h-3.5" />
                      RAIN EVENT
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#DBEAFE] text-[#2563EB] text-[9px] font-bold">
                      7–10 DAYS
                    </span>
                  </div>
                  <div className="mt-1 font-heading font-bold text-sm text-[#102A43]">
                    Moderate Risk
                  </div>
                  <div className="text-[10px] text-[#486581] mt-0.5">
                    Probabilistic Downscaled Model
                  </div>
                </div>

                {/* Mobile Card 2: Confidence */}
                <div className="bg-white rounded-xl border border-[#102A43] p-3 shadow-[2px_2px_0px_#102A43]">
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#486581] font-heading font-bold">
                    <span className="flex items-center gap-1 text-[#0E7490]">
                      <TrendingUp className="w-3.5 h-3.5" />
                      CONFIDENCE
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#E8F4F6] text-[#0E7490] text-[9px] font-bold">
                      CALIBRATED
                    </span>
                  </div>
                  <div className="mt-1 font-heading font-extrabold text-base text-[#102A43] flex items-baseline gap-1.5">
                    <span>68%</span>
                    <span className="text-xs font-medium text-[#486581] font-sans">Medium Skill</span>
                  </div>
                  <div className="text-[10px] text-[#829AB1] mt-0.5">
                    Isotonic & Platt Reliability Curve
                  </div>
                </div>

                {/* Mobile Card 3: Climate Signals */}
                <div className="bg-white rounded-xl border border-[#B8C5CC] p-3 shadow-[2px_2px_0px_#102A43]">
                  <div className="text-[10px] uppercase tracking-wider text-[#486581] font-heading font-bold flex items-center gap-1 text-[#102A43]">
                    <Waves className="w-3.5 h-3.5 text-[#0E7490]" />
                    CLIMATE SIGNALS
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-[#EAF0F2] border border-[#102A43]/20 font-heading font-bold text-[#102A43]">
                      ENSO
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#EAF0F2] border border-[#102A43]/20 font-heading font-bold text-[#102A43]">
                      IOD
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#EAF0F2] border border-[#102A43]/20 font-heading font-bold text-[#102A43]">
                      MJO
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* End-to-End Decision Architecture Flow (Integrated Scientific Cards) */}
          <div className="mt-16 bg-white rounded-2xl border-2 border-[#102A43] p-5 sm:p-6 shadow-[4px_4px_0px_#102A43]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#102A43]/10">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#486581]">
                Seven-Stage Scientific Decision Architecture
              </span>
              <span className="text-[11px] font-sans text-[#829AB1]">
                End-to-End Grounded Pipeline · Lucknow Pilot
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center text-xs">
              <div className="p-3 bg-[#EAF0F2] rounded-xl border border-[#102A43]/15 hover:border-[#0E7490] transition-colors">
                <Globe2 className="w-5 h-5 text-[#0E7490] mx-auto mb-1.5" />
                <strong className="block font-heading text-[#102A43]">Global Climate</strong>
                <span className="text-[10px] text-[#486581]">ENSO, IOD, MJO</span>
              </div>
              <div className="p-3 bg-[#EAF0F2] rounded-xl border border-[#102A43]/15 hover:border-[#0E7490] transition-colors">
                <Waves className="w-5 h-5 text-[#2563EB] mx-auto mb-1.5" />
                <strong className="block font-heading text-[#102A43]">Atmosphere</strong>
                <span className="text-[10px] text-[#486581]">Moisture & Wind</span>
              </div>
              <div className="p-3 bg-[#EAF0F2] rounded-xl border border-[#102A43]/15 hover:border-[#0E7490] transition-colors">
                <MapPin className="w-5 h-5 text-[#D97706] mx-auto mb-1.5" />
                <strong className="block font-heading text-[#102A43]">Block Scale</strong>
                <span className="text-[10px] text-[#486581]">PostGIS Downscaling</span>
              </div>
              <div className="p-3 bg-[#EAF0F2] rounded-xl border border-[#102A43]/15 hover:border-[#0E7490] transition-colors">
                <CloudRain className="w-5 h-5 text-[#0E7490] mx-auto mb-1.5" />
                <strong className="block font-heading text-[#102A43]">Panchayat Risk</strong>
                <span className="text-[10px] text-[#486581]">7–30d Probabilities</span>
              </div>
              <div className="p-3 bg-[#EAF0F2] rounded-xl border border-[#102A43]/15 hover:border-[#0E7490] transition-colors">
                <Sprout className="w-5 h-5 text-[#3F7D58] mx-auto mb-1.5" />
                <strong className="block font-heading text-[#102A43]">Crop Impact</strong>
                <span className="text-[10px] text-[#486581]">Agronomic Rules</span>
              </div>
              <div className="p-3 bg-[#0E7490] text-white rounded-xl border border-[#102A43] shadow-[2px_2px_0px_#102A43]">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1.5 text-[#E8F4F6]" />
                <strong className="block font-heading">Action</strong>
                <span className="text-[10px] text-[#E8F4F6]">Confident Decision</span>
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
