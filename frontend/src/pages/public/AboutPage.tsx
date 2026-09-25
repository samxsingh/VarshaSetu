import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, HeartHandshake, Eye, BookOpen } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-3">
        <Badge variant="teal" size="md">About the Platform</Badge>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
          About VarshaSetu (वर्षासेतु)
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Bridging the chasm between large-scale climate signals and village-level farm decisions.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-heading font-bold text-xl text-slate-900">Our Institutional Mission</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Over 50% of net cultivated area in India is rainfed, subjecting millions of marginal and smallholder farmers to the devastating intraseasonal swings of the South Asian monsoon. Conventional weather forecasts are delivered at 12–25 km grid resolutions or broad district summaries that fail to capture localized convective breaks and false onsets.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          VarshaSetu builds a digital bridge (सेतु) that transforms global teleconnections (ENSO, IOD, MJO) into block- and panchayat-scale probabilistic forecasts, paired with explainable, crop-specific decision support.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5">
          <ShieldCheck className="w-6 h-6 text-brand-teal mb-3" />
          <h4 className="font-heading font-bold text-slate-900 mb-1">Scientific Integrity</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Zero fabricated predictions. All models evaluated against 30-year climatology baselines and verified ground truth.
          </p>
        </Card>

        <Card className="p-5">
          <HeartHandshake className="w-6 h-6 text-brand-emerald mb-3" />
          <h4 className="font-heading font-bold text-slate-900 mb-1">Farmer-First UX</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            High contrast, bilingual typography, voice audio playback, and simple actionable choices over raw meteorological jargon.
          </p>
        </Card>

        <Card className="p-5">
          <Eye className="w-6 h-6 text-brand-azure mb-3" />
          <h4 className="font-heading font-bold text-slate-900 mb-1">Open Provenance</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every forecast exposes its issue timestamp, data freshness state, model version, and underlying driving factors.
          </p>
        </Card>
      </div>
    </div>
  );
};
