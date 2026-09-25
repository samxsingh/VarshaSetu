import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  PhoneCall,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const FarmerAdvisoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { crop, stage, location, irrigation } = useFarmerStore();

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-xl text-slate-900">
                Crop-Specific Agronomic Advisory
              </h1>
              <Badge variant="demo" size="sm">Simulated Rules</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Tailored for {t(`crops.${crop}`)} at {t(`stages.${stage}`)} stage in {location.village} ({irrigation.toLowerCase()})
            </p>
          </div>
          <Badge variant="emerald" size="md">
            Optimal Action Window
          </Badge>
        </div>
      </Card>

      {/* Main Advisory Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Key Advisory Card */}
          <Card variant="accent" className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-heading font-semibold uppercase text-brand-teal tracking-wider">
                  Primary Recommendation
                </span>
                <h3 className="font-heading font-bold text-base text-slate-900 mt-0.5">
                  Prepare Wet-Bed Nursery & Treat Seeds Before June 26 Arrival
                </h3>
              </div>
              <Badge variant="teal" size="sm">High Priority</Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Monsoon onset probability is favorable (84%) across Bakshi Ka Talab between June 26–28. With soil moisture rising to 65%, seeds should be sown in raised nurseries with adequate perimeter channels to handle runoff.
            </p>

            <div className="p-3 bg-surface-muted rounded-xl space-y-2 text-xs">
              <span className="font-heading font-semibold text-slate-900 block">
                Prescribed Agronomic Steps:
              </span>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li>Pre-soak seeds for 24 hours in water with salt solution to float off unfilled chaff.</li>
                <li>Incorporate well-decomposed FYM (Farmyard Manure) at 10 tonnes/ha in the nursery beds.</li>
                <li>Maintain a 10 cm gap between raised nursery beds for rapid water evacuation during the June 27 rain.</li>
              </ul>
            </div>
          </Card>

          {/* Dry Spell Mitigation Strategy */}
          <Card variant="warning" className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-brand-amber-dark">
              <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0" />
              <h4 className="font-heading font-bold text-sm">
                Anticipate Mid-Season Hiatus (Dry Spell) Strategy
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              14-day models indicate a 58% likelihood of a dry spell lasting 6–8 days after July 4. Ensure community tubewells or canal pumping schedules are reserved in advance for life-saving supplemental irrigation.
            </p>
          </Card>
        </div>

        {/* Sidebar Context & Helpline */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h4 className="font-heading font-semibold text-sm text-slate-900">
              Agronomic Rule Provenance
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Rule ID</span>
                <span className="font-mono text-slate-900 font-semibold">ICAR-UP-PADDY-04B</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Protocol Basis</span>
                <span>ICAR-CISH & KVK Lucknow Kharif Guidelines</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Issued At</span>
                <span>Today, 06:30 AM IST</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-brand-teal-tint/50 border-brand-teal-border space-y-2">
            <div className="flex items-center gap-2 text-brand-teal-dark font-heading font-bold text-xs uppercase tracking-wide">
              <PhoneCall className="w-4 h-4" />
              <span>Need Direct Guidance?</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Speak directly with an agronomist at Krishi Vigyan Kendra, Lucknow.
            </p>
            <div className="pt-2">
              <a
                href="tel:18001801551"
                className="inline-block text-xs font-heading font-bold text-brand-teal hover:underline"
              >
                Call Kisan Call Center (1800-180-1551)
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
