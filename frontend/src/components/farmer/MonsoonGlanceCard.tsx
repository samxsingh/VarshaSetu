import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudRain,
  SunMedium,
  CloudLightning,
  TrendingUp,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { HorizonSelector } from '../forecast/HorizonSelector';
import { ForecastHorizonDays } from '@shared/types';

export const MonsoonGlanceCard: React.FC = () => {
  const { t } = useTranslation();
  const { horizon, setHorizon } = useFarmerStore();

  // Controlled Demo Scenarios calibrated per horizon (explicitly simulated)
  const demoOutlookData: Record<
    ForecastHorizonDays,
    {
      dates: string;
      phaseLabel: string;
      onsetProb: number;
      drySpellRisk: number;
      heavyRainProb: number;
      expectedRainfallMm: string;
      departureText: string;
      confidence: string;
    }
  > = {
    7: {
      dates: 'Next 7 Days (June 25 - July 1)',
      phaseLabel: 'Active Monsoon Surge (सक्रिय चरण)',
      onsetProb: 84,
      drySpellRisk: 22,
      heavyRainProb: 65,
      expectedRainfallMm: '110 - 145 mm',
      departureText: '+18% above 30-year Lucknow normal',
      confidence: t('common.highConfidence'),
    },
    14: {
      dates: '14-Day Outlook (June 25 - July 8)',
      phaseLabel: 'Surge Followed by Potential Hiatus',
      onsetProb: 92,
      drySpellRisk: 58,
      heavyRainProb: 40,
      expectedRainfallMm: '160 - 210 mm',
      departureText: '+5% normal range',
      confidence: t('common.moderateConfidence'),
    },
    21: {
      dates: '21-Day Outlook (June 25 - July 15)',
      phaseLabel: 'Intraseasonal Break Risk',
      onsetProb: 96,
      drySpellRisk: 72,
      heavyRainProb: 30,
      expectedRainfallMm: '220 - 275 mm',
      departureText: '-12% below normal',
      confidence: t('common.moderateConfidence'),
    },
    30: {
      dates: '30-Day Outlook (June 25 - July 24)',
      phaseLabel: 'Revival Phase Expected Mid-July',
      onsetProb: 98,
      drySpellRisk: 45,
      heavyRainProb: 50,
      expectedRainfallMm: '310 - 380 mm',
      departureText: 'Near normal (-4%)',
      confidence: t('common.lowConfidence'),
    },
  };

  const current = demoOutlookData[horizon];

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-3 border-b border-surface-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{t('farmer.monsoonOutlook')}</CardTitle>
              <Badge variant="demo" size="sm">
                {t('demo.badge')}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {current.dates} • <span className="font-semibold text-brand-teal-dark">{current.phaseLabel}</span>
            </p>
          </div>

          {/* Horizon Switcher */}
          <HorizonSelector value={horizon} onChange={setHorizon} />
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* 3 Core Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* 1. Monsoon Onset */}
          <div className="bg-brand-teal-tint/40 border border-brand-teal-border/70 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-brand-teal-dark">
                <CloudRain className="w-5 h-5" />
                <span className="text-xs font-heading font-semibold uppercase tracking-wider">
                  {t('targets.onset')}
                </span>
              </div>
              <Badge variant="teal" size="sm">
                Favorable
              </Badge>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-3xl text-slate-900">
                  {current.onsetProb}%
                </span>
                <span className="text-xs text-slate-500 font-medium">likelihood</span>
              </div>
              <p className="text-xs text-slate-700 mt-1 font-medium">
                Window: June 26–28 • {current.confidence}
              </p>
            </div>

            <Progress value={current.onsetProb} color="teal" height="sm" />
          </div>

          {/* 2. Dry Spell Break Risk */}
          <div className="bg-brand-amber-tint/40 border border-brand-amber-border/70 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-brand-amber-dark">
                <SunMedium className="w-5 h-5" />
                <span className="text-xs font-heading font-semibold uppercase tracking-wider">
                  {t('targets.drySpell')}
                </span>
              </div>
              <Badge variant={current.drySpellRisk > 50 ? 'amber' : 'emerald'} size="sm">
                {current.drySpellRisk > 50 ? t('common.riskHigh') : t('common.riskLow')}
              </Badge>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-3xl text-slate-900">
                  {current.drySpellRisk}%
                </span>
                <span className="text-xs text-slate-500 font-medium">break risk</span>
              </div>
              <p className="text-xs text-slate-700 mt-1 font-medium">
                {current.drySpellRisk > 50 ? 'hiatus expected after day 6' : 'consistent moisture continuity'}
              </p>
            </div>

            <Progress
              value={current.drySpellRisk}
              color={current.drySpellRisk > 50 ? 'amber' : 'emerald'}
              height="sm"
            />
          </div>

          {/* 3. Heavy Rain Alert */}
          <div className="bg-brand-azure-tint/40 border border-brand-azure-border/70 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-brand-azure-dark">
                <CloudLightning className="w-5 h-5" />
                <span className="text-xs font-heading font-semibold uppercase tracking-wider">
                  {t('targets.heavyRain')}
                </span>
              </div>
              <Badge variant={current.heavyRainProb > 60 ? 'amber' : 'azure'} size="sm">
                &gt; 65 mm / 24h
              </Badge>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-3xl text-slate-900">
                  {current.heavyRainProb}%
                </span>
                <span className="text-xs text-slate-500 font-medium">probability</span>
              </div>
              <p className="text-xs text-slate-700 mt-1 font-medium">
                Peak convective event: June 27 evening
              </p>
            </div>

            <Progress
              value={current.heavyRainProb}
              color={current.heavyRainProb > 60 ? 'amber' : 'azure'}
              height="sm"
            />
          </div>
        </div>

        {/* Cumulative Rainfall Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-surface-muted rounded-xl border border-surface-border text-xs">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-brand-teal shrink-0" />
            <div>
              <span className="font-semibold text-slate-900">
                Projected Rainfall: {current.expectedRainfallMm}
              </span>
              <span className="text-slate-600 block sm:inline sm:ml-2">
                ({current.departureText})
              </span>
            </div>
          </div>

          <Link
            to="/farmer/forecast"
            className="inline-flex items-center gap-1 font-heading font-semibold text-brand-teal hover:text-brand-teal-dark hover:underline"
          >
            <span>Detailed Forecast View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
