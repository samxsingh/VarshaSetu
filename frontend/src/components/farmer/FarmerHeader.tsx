import React from 'react';
import { MapPin, Sprout, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { Badge } from '../ui/Badge';

export const FarmerHeader: React.FC = () => {
  const { t } = useTranslation();
  const { location, crop, stage } = useFarmerStore();

  return (
    <div className="bg-white border border-surface-border rounded-2xl p-4 sm:p-5 shadow-card mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Location & Synchronized Time */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-brand-teal-tint text-brand-teal shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-bold text-lg text-slate-900">
                {location.village}, {location.block}
              </h2>
              <Badge variant="teal" size="sm">
                {t('common.verifiedLocation')}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {location.district} District, {location.state} • Radar Synced: Today 06:30 AM IST
            </p>
          </div>
        </div>

        {/* Crop Profile & Change Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-border/60 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-xl border border-surface-border">
            <Sprout className="w-4 h-4 text-brand-teal" />
            <div className="text-left">
              <span className="text-[11px] text-slate-500 font-medium block">
                Target Crop
              </span>
              <span className="text-xs font-heading font-bold text-slate-900 block">
                {t(`crops.${crop}`)} • {t(`stages.${stage}`)}
              </span>
            </div>
          </div>

          <Link
            to="/farmer/onboarding"
            className="p-2 text-slate-500 hover:text-brand-teal hover:bg-brand-teal-tint rounded-lg transition-colors"
            title="Edit farm details"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
