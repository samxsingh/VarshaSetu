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
  ChevronRight,
  TrendingUp,
  MapPin,
  FileCheck2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { RoleGatewaySection } from '../../components/landing/RoleGatewaySection';
import { ScientificGroundingSection } from '../../components/landing/ScientificGroundingSection';

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

      {/* 2. THE PROBLEM */}
      <section className="py-16 border-b border-surface-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-amber">
              The Critical Resolution Disconnect
            </span>
            <h2 className="font-heading font-bold text-3xl text-slate-900 mt-2">
              Why District-Level Weather Fails Indian Agriculture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-crimson-tint text-brand-crimson flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                False Monsoon Onsets
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transient pre-monsoon storm surges prompt farmers to sow nurseries immediately, only for rains to halt for 15 parched days, destroying 100% of germinated seedlings.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-amber-tint text-brand-amber flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                Coarse 25km Grid Blanks
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Broad regional forecasts cannot capture micro-watershed rainfall variations across Lucknow’s 440 Panchayats, parching northern blocks while southern areas flood.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-teal-tint text-brand-teal flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                No Agronomic Meaning
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Raw millimeter graphs leave farmers stranded. They need to know: <em>"What if I wait 7 days to sow? Will soil moisture hold?"</em>
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE TARGETS */}
      <section className="py-16 border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-teal">
              Scientific Precision
            </span>
            <h2 className="font-heading font-bold text-3xl text-slate-900 mt-2">
              Four Core Monsoon Forecast Targets
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Probabilistic outputs delivered at 7, 14, 21, and 30-day decision horizons.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-5 border-t-4 border-t-brand-teal">
              <h4 className="font-heading font-bold text-base text-slate-900 mb-1">
                1. Monsoon Onset
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Calculates probability window for sustained low-level westerly surge, guarding against false starts.
              </p>
              <Badge variant="teal" size="sm">Onset Window + Risk</Badge>
            </Card>

            <Card className="p-5 border-t-4 border-t-brand-amber">
              <h4 className="font-heading font-bold text-base text-slate-900 mb-1">
                2. Dry Spell Break
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Identifies consecutive dry spells (≥5 days rain &lt;2.5mm) and predicts exact moisture revival dates.
              </p>
              <Badge variant="amber" size="sm">Hiatus Duration</Badge>
            </Card>

            <Card className="p-5 border-t-4 border-t-brand-azure">
              <h4 className="font-heading font-bold text-base text-slate-900 mb-1">
                3. Heavy Rainfall
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Early warning for localized cloudbursts (&gt;65 mm / 24h) to safeguard field bunds and drainage.
              </p>
              <Badge variant="azure" size="sm">24h Threshold Watch</Badge>
            </Card>

            <Card className="p-5 border-t-4 border-t-brand-crimson">
              <h4 className="font-heading font-bold text-base text-slate-900 mb-1">
                4. Rainfall Anomaly
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Estimates cumulative percentage departure from the 30-year local historical normal.
              </p>
              <Badge variant="neutral" size="sm">Departure vs Baseline</Badge>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. FARMER EXPERIENCE & DECISION SIMULATOR */}
      <section className="py-16 bg-white border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <Badge variant="teal" size="md">
                Farmer Experience
              </Badge>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 leading-tight">
                "Complex intelligence underneath. Simple decisions on top."
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Farmers don't need to decipher vorticity equations or Sea Surface Temperature anomalies. VarshaSetu turns complex atmospheric dynamics into plain spoken Hindi and English guidance with voice audio playback.
              </p>

              <div className="space-y-3 pt-2 text-sm text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-brand-emerald shrink-0" />
                  <span>3-Step zero friction onboarding (Location → Crop → Stage)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-brand-emerald shrink-0" />
                  <span>One-tap Hindi/Awadhi audio briefing playback</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-brand-emerald shrink-0" />
                  <span>Interactive "What if I wait 7 days?" decision simulator</span>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/farmer/onboarding">
                  <Button variant="primary" size="md" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Experience Farmer Onboarding
                  </Button>
                </Link>
              </div>
            </div>

            {/* Feature Mock Card */}
            <div className="bg-canvas border border-surface-border rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-surface-border">
                <span className="font-heading font-bold text-sm text-slate-900">
                  What-If Sowing Simulator
                </span>
                <Badge variant="demo" size="sm">Simulated Model</Badge>
              </div>

              <div className="bg-white p-4 rounded-xl border border-surface-border space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <strong className="text-slate-900">Option A: Sow Now (June 26)</strong>
                  <Badge variant="emerald" size="sm">Recommended</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Optimal 18% moisture stress risk; captures natural monsoon onset saturation.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-surface-border space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <strong className="text-slate-900">Option B: Wait 7 Days (July 3)</strong>
                  <Badge variant="amber" size="sm">Higher Risk (+42%)</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Postpones germination directly into projected 6-day dry hiatus period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SCIENTIFIC TRANSPARENCY & OFFICER COMMAND */}
      <section className="py-16 border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-card space-y-4 order-2 lg:order-1">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <span className="font-heading font-bold text-sm text-slate-900">
                  Officer GIS Command Center
                </span>
                <Badge variant="teal" size="sm">Lucknow District</Badge>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-surface-muted rounded-xl flex justify-between items-center">
                  <span>Bakshi Ka Talab Block</span>
                  <strong className="text-amber-700">Dry Spell Watch (58%)</strong>
                </div>
                <div className="p-3 bg-surface-muted rounded-xl flex justify-between items-center">
                  <span>Malihabad Block</span>
                  <strong className="text-rose-700">High Hiatus Risk (74%)</strong>
                </div>
                <div className="p-3 bg-surface-muted rounded-xl flex justify-between items-center">
                  <span>Mohanlalganj Block</span>
                  <strong className="text-teal-700">Optimal Onset (91%)</strong>
                </div>
              </div>
              <div className="pt-2">
                <Link to="/officer">
                  <Button variant="outline" size="sm" fullWidth>
                    Open Officer Command Center
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-5 order-1 lg:order-2">
              <Badge variant="azure" size="md">
                Institutional Authority
              </Badge>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 leading-tight">
                Empowering Block Officers & State Planners
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Agriculture officers and KVK scientists gain complete spatial oversight with choropleth risk heatmaps, panchayat vulnerability rankings, and one-click advisory bulletin broadcasts.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Link to="/analyst">
                  <Button variant="secondary" size="md" leftIcon={<FileCheck2 className="w-4 h-4 text-brand-teal" />}>
                    View Model Registry & Benchmarks
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA BANNER */}
      <section className="py-20 bg-brand-teal text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="font-heading font-bold text-3xl sm:text-5xl tracking-tight">
            Climate-Resilient Agriculture Starts Here
          </h2>
          <p className="text-teal-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Explore the live demonstration shell calibrated for Lucknow District, Uttar Pradesh.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/farmer/dashboard">
              <Button variant="secondary" size="lg" className="bg-white text-brand-teal-dark hover:bg-teal-50">
                Launch Farmer Dashboard
              </Button>
            </Link>
            <Link to="/officer">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Open Officer Center
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
