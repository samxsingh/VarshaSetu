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
    <div className="flex-1 bg-canvas text-slate-900">
      {/* 1. HERO SECTION — EDITORIAL & NEO-BRUTALIST REBUILD */}
      <section className="relative overflow-hidden pt-6 pb-16 lg:pt-10 lg:pb-20 border-b border-[#0B1726]/15 bg-editorial-grain">
        {/* Subtle contour texture overlay */}
        <div className="absolute inset-0 opacity-25 pointer-events-none bg-subtle-contour" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Editorial Typography & Strategic CTAs (55% width on xl) */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-6">
              {/* Eyebrow Micro-Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#DCEFF0] border border-[#008F83]/40 text-[#006B65] text-xs font-heading font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#0B1726] animate-fade-up">
                <span className="w-2 h-2 rounded-full bg-[#008F83] animate-pulse" />
                <span>SCIENCE / DATA / BETTER DECISIONS</span>
              </div>

              {/* High-Impact Editorial Headline */}
              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#0B1726] tracking-tight leading-[1.08] animate-fade-up">
                From climate signals to{' '}
                <span className="text-[#008F83] block sm:inline">
                  confident farm decisions.
                </span>
              </h1>

              {/* Concise Scientific Description */}
              <p className="text-base sm:text-lg text-[#435466] leading-relaxed font-sans max-w-xl animate-fade-up">
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
                      <Sprout className="w-4 h-4 text-[#008F83]" />
                      <span>I’m a Farmer</span>
                    </button>
                  </Link>

                  <Link to="/officer" className="flex-1 sm:flex-none">
                    <button className="btn-brutal-secondary w-full sm:w-auto px-4 sm:px-5 py-3.5 rounded-xl font-heading font-medium text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer">
                      <ShieldCheck className="w-4 h-4 text-[#008F83]" />
                      <span>I’m an Officer</span>
                    </button>
                  </Link>
                </div>
              </div>

              {/* Scientific Anchor Metadata Badge */}
              <div className="pt-3 border-t border-[#0B1726]/10 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#62768A] font-sans">
                <span className="font-heading font-bold text-[#0B1726] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#008F83]" />
                  Ground Anchor:
                </span>
                <span>Bakshi Ka Talab Block (UP_LKO_BKT)</span>
                <span className="hidden sm:inline text-[#0B1726]/30">|</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5A33D]" />
                  Observational Archive: Kharif 2024 (122d)
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Agricultural Imagery with Floating Intelligence Cards (45% width on xl) */}
            <div className="lg:col-span-6 xl:col-span-5 relative mt-4 lg:mt-0">
              {/* Primary Image Frame with Crisp Neo-Brutalist Border */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#0B1726] bg-[#FFFFFF] shadow-[6px_6px_0px_#0B1726] group">
                <img
                  src="/images/hero-farmer.jpg"
                  alt="Indian farmer inspecting VarshaSetu agro-climate intelligence on a tablet in agricultural field"
                  className="w-full h-[360px] sm:h-[440px] lg:h-[480px] object-cover object-center filter saturate-[1.08] transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="eager"
                />

                {/* Soft gradient bottom fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1726]/75 via-[#0B1726]/10 to-transparent pointer-events-none" />

                {/* Integrated Photo Caption Pill */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white text-xs font-sans flex items-center justify-between px-3 py-2 rounded-xl bg-[#0B1726]/85 backdrop-blur-md border border-white/20">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
                    <span className="font-heading font-medium text-[11px] sm:text-xs">
                      Hyperlocal Intelligence in Action
                    </span>
                  </div>
                  <span className="text-[#99E1DC] font-heading font-bold text-[11px]">
                    UP_LKO_BKT Pilot
                  </span>
                </div>
              </div>

              {/* FLOATING CARD 1: Rain Event Intelligence (Top Left) */}
              <div className="absolute -top-4 -left-3 sm:-top-5 sm:-left-6 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#0B1726] rounded-xl p-3 shadow-[3px_3px_0px_#0B1726] animate-float-slow max-w-[210px] sm:max-w-[230px]">
                <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#435466] font-heading font-bold">
                  <span className="flex items-center gap-1 text-[#008F83]">
                    <CloudRain className="w-3.5 h-3.5" />
                    RAIN EVENT
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#DCEFF0] text-[#006B65] text-[9px] font-bold">
                    7–10 DAYS
                  </span>
                </div>
                <div className="mt-1 font-heading font-bold text-sm text-[#0B1726]">
                  Moderate Risk
                </div>
                <div className="text-[10px] text-[#62768A] mt-0.5">
                  Probabilistic Downscaled Model
                </div>
              </div>

              {/* FLOATING CARD 2: Forecast Reliability Score (Bottom Left) */}
              <div className="absolute -bottom-5 -left-2 sm:-bottom-6 sm:-left-4 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#0B1726] rounded-xl p-3 shadow-[3px_3px_0px_#0B1726] animate-float-alt max-w-[220px] sm:max-w-[240px]">
                <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#435466] font-heading font-bold">
                  <span className="flex items-center gap-1 text-[#2F7D4A]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    CONFIDENCE
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#DDEBDD] text-[#2F7D4A] text-[9px] font-bold">
                    CALIBRATED
                  </span>
                </div>
                <div className="mt-1 font-heading font-extrabold text-lg text-[#0B1726] flex items-baseline gap-1.5">
                  <span>68%</span>
                  <span className="text-xs font-medium text-[#435466] font-sans">Medium Skill</span>
                </div>
                <div className="text-[10px] text-[#62768A] mt-0.5">
                  Isotonic & Platt Reliability Curve
                </div>
              </div>

              {/* FLOATING CARD 3: Climate Teleconnections (Top Right) */}
              <div className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#0B1726] rounded-xl p-2.5 shadow-[3px_3px_0px_#0B1726] max-w-[190px]">
                <div className="text-[9px] uppercase tracking-wider text-[#435466] font-heading font-bold flex items-center gap-1">
                  <Waves className="w-3 h-3 text-[#008F83]" />
                  CLIMATE SIGNALS
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-[#F7F3EA] border border-[#0B1726]/20 font-heading font-bold text-[#0B1726]">
                    ENSO
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F7F3EA] border border-[#0B1726]/20 font-heading font-bold text-[#0B1726]">
                    IOD
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F7F3EA] border border-[#0B1726]/20 font-heading font-bold text-[#0B1726]">
                    MJO
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* End-to-End Decision Architecture Flow (Integrated Editorial Cards) */}
          <div className="mt-16 bg-[#FFFFFF] rounded-2xl border-2 border-[#0B1726] p-5 sm:p-6 shadow-[4px_4px_0px_#0B1726]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#0B1726]/10">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#435466]">
                Seven-Stage Scientific Decision Architecture
              </span>
              <span className="text-[11px] font-sans text-[#62768A]">
                End-to-End Grounded Pipeline · Lucknow Pilot
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center text-xs">
              <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15 hover:border-[#008F83] transition-colors">
                <Globe2 className="w-5 h-5 text-[#008F83] mx-auto mb-1.5" />
                <strong className="block font-heading text-[#0B1726]">Global Climate</strong>
                <span className="text-[10px] text-[#435466]">ENSO, IOD, MJO</span>
              </div>
              <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15 hover:border-[#008F83] transition-colors">
                <Waves className="w-5 h-5 text-[#0284C7] mx-auto mb-1.5" />
                <strong className="block font-heading text-[#0B1726]">Atmosphere</strong>
                <span className="text-[10px] text-[#435466]">Moisture & Wind</span>
              </div>
              <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15 hover:border-[#008F83] transition-colors">
                <MapPin className="w-5 h-5 text-[#E5A33D] mx-auto mb-1.5" />
                <strong className="block font-heading text-[#0B1726]">Block Scale</strong>
                <span className="text-[10px] text-[#435466]">PostGIS Downscaling</span>
              </div>
              <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15 hover:border-[#008F83] transition-colors">
                <CloudRain className="w-5 h-5 text-[#008F83] mx-auto mb-1.5" />
                <strong className="block font-heading text-[#0B1726]">Panchayat Risk</strong>
                <span className="text-[10px] text-[#435466]">7–30d Probabilities</span>
              </div>
              <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15 hover:border-[#008F83] transition-colors">
                <Sprout className="w-5 h-5 text-[#2F7D4A] mx-auto mb-1.5" />
                <strong className="block font-heading text-[#0B1726]">Crop Impact</strong>
                <span className="text-[10px] text-[#435466]">Agronomic Rules</span>
              </div>
              <div className="p-3 bg-[#008F83] text-white rounded-xl border border-[#006B65] shadow-[2px_2px_0px_#0B1726]">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1.5 text-[#99E1DC]" />
                <strong className="block font-heading">Action</strong>
                <span className="text-[10px] text-[#DCEFF0]">Confident Decision</span>
              </div>
            </div>
          </div>
        </div>
      </section>
 
      {/* 2. ROLE GATEWAY & CAPABILITIES SECTION (PHASE 2) */}
      <RoleGatewaySection />
 
      {/* 3. SCIENTIFIC GROUNDING & PLATFORM STATUS SECTION (PHASE 3) */}
      <ScientificGroundingSection />

      {/* 4. DECISION PATHWAYS SECTION (PHASE 4) */}
      <DecisionPathwaysSection />

      {/* 5. TRUST & INTEGRITY BAND (PHASE 4) */}
      <TrustIntegritySection />

      {/* 6. FINAL EDITORIAL CTA SECTION (PHASE 4) */}
      <FinalCTASection />

      {/* 7. LANDING FOOTER (PHASE 4) */}
      <LandingFooter />
    </div>
  );
};
