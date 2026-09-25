import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  CloudRain,
  SunMedium,
  CloudLightning,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { HorizonSelector } from '../../components/forecast/HorizonSelector';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { ForecastHorizonDays } from '@shared/types';

export const FarmerForecastPage: React.FC = () => {
  const { t } = useTranslation();
  const { horizon, setHorizon, location } = useFarmerStore();
  const [openWhyId, setOpenWhyId] = useState<string | null>(null);

  const toggleWhy = (id: string) => {
    setOpenWhyId(openWhyId === id ? null : id);
  };

  const detailedCards: {
    id: string;
    title: string;
    icon: React.ReactNode;
    prob: number;
    status: string;
    statusVariant: 'teal' | 'amber' | 'azure' | 'emerald' | 'crimson' | 'neutral' | 'demo';
    explanation: string;
    scientificReason: string;
  }[] = [
    {
      id: 'onset',
      title: t('targets.onset'),
      icon: <CloudRain className="w-5 h-5 text-brand-teal" />,
      prob: 84,
      status: 'Probable (Window: June 26–28)',
      statusVariant: 'teal',
      explanation: 'Sustained low-level monsoon westerlies will establish deep atmospheric moisture, initiating the Kharif season across Lucknow.',
      scientificReason: 'Supported by positive cross-equatorial Somali jet velocity and active MJO convection over the Indian Ocean.',
    },
    {
      id: 'dry_spell',
      title: t('targets.drySpell'),
      icon: <SunMedium className="w-5 h-5 text-brand-amber" />,
      prob: horizon === 7 ? 22 : horizon === 14 ? 58 : 72,
      status: horizon === 7 ? 'Low Risk' : 'Watch Active (>5 consecutive dry days)',
      statusVariant: horizon === 7 ? 'emerald' : 'amber',
      explanation: horizon === 7
        ? 'Adequate regular moisture is expected through the next 7 days.'
        : 'A monsoon trough northward displacement toward the Himalayas is projected to produce a 6–8 day break hiatus around July 4–11.',
      scientificReason: 'Northward shift of the monsoon trough line toward the foothills causing temporary subsidence over the Gangetic Plain.',
    },
    {
      id: 'heavy_rain',
      title: t('targets.heavyRain'),
      icon: <CloudLightning className="w-5 h-5 text-brand-azure" />,
      prob: 65,
      status: 'Alert Tier 2 (>65 mm / 24 hrs)',
      statusVariant: 'amber' as const,
      explanation: 'Localized convective cloudburst projected on June 27 evening. Clear drainage channels to prevent seedling subversion.',
      scientificReason: 'Low-pressure circulation forming over the Bay of Bengal propagating northwestward into Eastern UP.',
    },
    {
      id: 'anomaly',
      title: t('targets.anomaly'),
      icon: <TrendingUp className="w-5 h-5 text-brand-crimson" />,
      prob: 70,
      status: 'Above Normal (+18%)',
      statusVariant: 'emerald' as const,
      explanation: 'Cumulative rainfall over the outlook period is expected to meet or slightly exceed the 30-year climatological normal.',
      scientificReason: 'Climatological normal for Lucknow in late June is 98 mm; projected accumulation is 110–145 mm.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-xl text-slate-900">
                Hyperlocal Forecast Timeline
              </h1>
              <Badge variant="demo" size="sm">Simulated Data</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Probabilistic outlook for {location.village}, {location.block}, {location.district} District
            </p>
          </div>

          <HorizonSelector value={horizon} onChange={setHorizon} />
        </div>
      </Card>

      {/* Target Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detailedCards.map((card) => {
          const isWhyOpen = openWhyId === card.id;

          return (
            <Card key={card.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-surface-border">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-surface-muted border border-surface-border">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-slate-900">{card.title}</h3>
                      <span className="text-[11px] text-slate-500 font-medium">{horizon}-Day Horizon</span>
                    </div>
                  </div>
                  <Badge variant={card.statusVariant} size="sm">
                    {card.status}
                  </Badge>
                </div>

                <div className="my-4">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">Model Probability</span>
                    <strong className="font-heading font-bold text-2xl text-slate-900">
                      {card.prob}%
                    </strong>
                  </div>
                  <Progress value={card.prob} color="teal" height="sm" />
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-surface-muted/50 p-3 rounded-xl border border-surface-border/60">
                  {card.explanation}
                </p>
              </div>

              {/* Progressive Scientific Explanation ("Why?") */}
              <div className="pt-3 border-t border-surface-border mt-4">
                <button
                  onClick={() => toggleWhy(card.id)}
                  className="w-full flex items-center justify-between text-xs font-heading font-semibold text-brand-teal hover:text-brand-teal-dark"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why are we forecasting this?
                  </span>
                  {isWhyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isWhyOpen && (
                  <div className="mt-2.5 p-3 rounded-lg bg-white border border-surface-border text-[11px] text-slate-600 leading-relaxed animate-fadeIn">
                    <strong>Underlying Teleconnection / Dynamic:</strong> {card.scientificReason}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
