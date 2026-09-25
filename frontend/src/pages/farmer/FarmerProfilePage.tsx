import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, MapPin, Sprout, Droplets, Layers, RotateCcw, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LanguageToggle } from '../../components/common/LanguageToggle';

export const FarmerProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { location, crop, stage, irrigation, soil, farmSizeAcres, resetOnboarding } = useFarmerStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center font-heading font-bold text-lg">
              RL
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-slate-900">
                Ram Lakhan
              </h2>
              <p className="text-xs text-slate-500">
                Registered Marginal Farmer • Bhaisamau Village
              </p>
            </div>
          </div>
          <Badge variant="teal" size="sm">Verified Account</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
          <div className="p-3 bg-surface-muted rounded-xl space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px] block">Farm Location</span>
            <strong className="text-slate-900 block text-sm">{location.village}, {location.block}</strong>
            <span className="text-slate-600 block">{location.district} District, {location.state}</span>
          </div>

          <div className="p-3 bg-surface-muted rounded-xl space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px] block">Current Crop</span>
            <strong className="text-slate-900 block text-sm">{t(`crops.${crop}`)}</strong>
            <span className="text-slate-600 block">{t(`stages.${stage}`)}</span>
          </div>

          <div className="p-3 bg-surface-muted rounded-xl space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px] block">Irrigation & Soil</span>
            <strong className="text-slate-900 block text-sm">{irrigation} Facility</strong>
            <span className="text-slate-600 block">{soil} Soil • {farmSizeAcres} Acres</span>
          </div>

          <div className="p-3 bg-surface-muted rounded-xl space-y-1">
            <span className="text-slate-500 uppercase font-semibold text-[10px] block">Language & Audio</span>
            <div className="pt-1">
              <LanguageToggle />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-surface-border">
          <Link to="/farmer/onboarding" className="w-full sm:w-auto">
            <Button variant="secondary" size="sm" fullWidth>
              Reconfigure Farm Details
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={resetOnboarding}
          >
            Reset to Demonstration Default
          </Button>
        </div>
      </Card>
    </div>
  );
};
