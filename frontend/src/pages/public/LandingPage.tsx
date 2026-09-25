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

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 bg-canvas text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-surface-border">
        {/* Subtle decorative background grid pattern */}
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-tint border border-brand-teal-border text-brand-teal-dark text-xs font-heading font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
              <span>Hyperlocal Monsoon Intelligence Platform</span>
            </div>

            <h1 className="font-heading font-bold text-4xl sm:text-6xl text-slate-950 tracking-tight leading-tight">
              From climate signals to{' '}
              <span className="text-brand-teal inline-block">confident farm decisions.</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
              Translating planetary climate teleconnections (ENSO, IOD, MJO) and regional atmospheric patterns into 7–30 day probabilistic block and panchayat advisories for Indian agriculture.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/farmer/dashboard">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Monsoon Intelligence
                </Button>
              </Link>
              <div className="flex gap-2">
                <Link to="/farmer/onboarding">
                  <Button variant="secondary" size="lg" leftIcon={<Sprout className="w-4 h-4 text-brand-teal" />}>
                    I'm a Farmer
                  </Button>
                </Link>
                <Link to="/officer">
                  <Button variant="secondary" size="lg" leftIcon={<ShieldCheck className="w-4 h-4 text-brand-teal" />}>
                    I'm an Officer
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Visual Concept Flow Diagram */}
          <div className="mt-14 max-w-5xl mx-auto bg-white rounded-2xl border border-surface-border p-6 shadow-card">
            <div className="text-center mb-5">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400">
                End-to-End Decision Architecture
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-3 bg-surface-muted rounded-xl border border-surface-border">
                <Globe2 className="w-5 h-5 text-brand-teal mx-auto mb-1.5" />
                <strong className="block font-heading text-slate-900">Global Climate</strong>
                <span className="text-[10px] text-slate-500">ENSO, IOD, MJO</span>
              </div>
              <div className="p-3 bg-surface-muted rounded-xl border border-surface-border">
                <Waves className="w-5 h-5 text-brand-azure mx-auto mb-1.5" />
                <strong className="block font-heading text-slate-900">Atmosphere</strong>
                <span className="text-[10px] text-slate-500">Moisture & Wind</span>
              </div>
              <div className="p-3 bg-surface-muted rounded-xl border border-surface-border">
                <MapPin className="w-5 h-5 text-brand-amber mx-auto mb-1.5" />
                <strong className="block font-heading text-slate-900">Block Scale</strong>
                <span className="text-[10px] text-slate-500">PostGIS Downscaling</span>
              </div>
              <div className="p-3 bg-surface-muted rounded-xl border border-surface-border">
                <CloudRain className="w-5 h-5 text-brand-teal mx-auto mb-1.5" />
                <strong className="block font-heading text-slate-900">Panchayat Risk</strong>
                <span className="text-[10px] text-slate-500">7–30d Probabilities</span>
              </div>
              <div className="p-3 bg-surface-muted rounded-xl border border-surface-border">
                <Sprout className="w-5 h-5 text-brand-emerald mx-auto mb-1.5" />
                <strong className="block font-heading text-slate-900">Crop Impact</strong>
                <span className="text-[10px] text-slate-500">Agronomic Rules</span>
              </div>
              <div className="p-3 bg-brand-teal text-white rounded-xl shadow-xs">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1.5" />
                <strong className="block font-heading">Action</strong>
                <span className="text-[10px] text-teal-100">Confident Decision</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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
