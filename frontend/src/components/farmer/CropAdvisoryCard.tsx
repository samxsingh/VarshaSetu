import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const CropAdvisoryCard: React.FC = () => {
  const { t } = useTranslation();
  const { crop, stage } = useFarmerStore();
  const [showWhyDetails, setShowWhyDetails] = useState(false);

  return (
    <Card variant="accent" className="mb-6">
      <CardHeader className="pb-3 border-b border-surface-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{t('farmer.whatItMeans')}</CardTitle>
              <Badge variant="demo" size="sm">
                {t('demo.badge')}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Specific to <span className="font-semibold text-slate-900">{t(`crops.${crop}`)}</span> in{' '}
              <span className="font-semibold text-slate-900">{t(`stages.${stage}`)}</span>
            </p>
          </div>

          <Badge variant="emerald" size="md">
            Optimal Sowing Window Open
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Core Headline Banner */}
        <div className="bg-brand-emerald-tint/60 border border-brand-emerald-border p-3.5 rounded-xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-brand-emerald shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            <p className="font-heading font-semibold text-brand-emerald-dark">
              Favorable rainfall arrival between June 26–28 supports nursery seeding.
            </p>
            <p className="text-slate-600 text-xs mt-0.5">
              Topsoil moisture index is projected to reach optimal 0.65–0.75 saturation.
            </p>
          </div>
        </div>

        {/* Recommended Actions */}
        <div>
          <h4 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-2 mb-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
            <span>{t('farmer.recommendedActions')}</span>
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2 bg-surface-muted/50 p-2.5 rounded-lg border border-surface-border/60">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald shrink-0 mt-2" />
              <span>
                <strong>Mat-type / Wet-bed nursery sowing:</strong> Proceed between June 26–28 to capture natural monsoon soil saturation.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-surface-muted/50 p-2.5 rounded-lg border border-surface-border/60">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald shrink-0 mt-2" />
              <span>
                <strong>Seed Treatment:</strong> Treat seeds with Carbendazim / Trichoderma (2g/kg) before overnight soaking to guard against seedling blight.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-surface-muted/50 p-2.5 rounded-lg border border-surface-border/60">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald shrink-0 mt-2" />
              <span>
                <strong>Field Drainage Gates:</strong> Clear bund outlet channels (मेड़ की निकासी) ahead of the June 27 localized downpour.
              </span>
            </li>
          </ul>
        </div>

        {/* Things to Avoid */}
        <div>
          <h4 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-2 mb-2.5">
            <XCircle className="w-4 h-4 text-brand-crimson" />
            <span>{t('farmer.thingsToAvoid')}</span>
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2 bg-brand-crimson-tint/30 p-2.5 rounded-lg border border-brand-crimson-border/50">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson shrink-0 mt-2" />
              <span>
                <strong>Direct Seeded Rice (DSR) broadcast:</strong> Do not broadcast bare seeds on sloping ground immediately before June 27 heavy rain to prevent surface runoff washaway.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-brand-crimson-tint/30 p-2.5 rounded-lg border border-brand-crimson-border/50">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson shrink-0 mt-2" />
              <span>
                <strong>Heavy Basal Nitrogen application:</strong> Avoid full urea application on parched soil; split doses once roots establish.
              </span>
            </li>
          </ul>
        </div>

        {/* Explainability Accordion: "Why this advice?" */}
        <div className="pt-2 border-t border-surface-border">
          <button
            onClick={() => setShowWhyDetails(!showWhyDetails)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-muted hover:bg-slate-200/60 transition-colors text-left text-xs text-slate-800 font-heading font-semibold"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-teal" />
              <span>{t('farmer.whyThisAdvice')}</span>
            </div>
            {showWhyDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showWhyDetails && (
            <div className="mt-3 p-3.5 bg-white border border-surface-border rounded-xl text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>Agronomic Rationale:</strong> In Lucknow district climatology, paddy varieties (e.g., Swarna, Sambha Mahsuri) require 21–25 days in nursery before transplanting. Sowing between June 26–28 ensures 22-day seedlings reach prime physiological vigor right when the second monsoon pulse arrives in mid-July.
              </p>
              <p>
                <strong>Scientific Teleconnections:</strong> Active MJO Phase 3 over the equatorial Indian Ocean coupled with a neutral-to-positive IOD condition provides strong confidence in uninterrupted low-level moisture transport across eastern Uttar Pradesh.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
