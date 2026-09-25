import React from 'react';
import { useTranslation } from 'react-i18next';
import { SummaryStatCards } from '../../components/officer/SummaryStatCards';
import { MapContainer } from '../../components/maps/MapContainer';
import { MapLayerControl } from '../../components/maps/MapLayerControl';
import { MapLegend } from '../../components/maps/MapLegend';
import { SelectedAreaPanel } from '../../components/maps/SelectedAreaPanel';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useOfficerStore } from '../../stores/useOfficerStore';
import { Send, MapPin } from 'lucide-react';

export const OfficerDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { setBulletinModalOpen, selectedDistrict } = useOfficerStore();

  return (
    <div className="space-y-6">
      {/* Officer Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900">
              {t('officer.title')}
            </h1>
            <Badge variant="teal" size="sm">
              {selectedDistrict} District
            </Badge>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Spatial monitoring & agricultural contingency command across 440 Gram Panchayats
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Send className="w-4 h-4" />}
            onClick={() => setBulletinModalOpen(true)}
          >
            {t('officer.broadcastBulletin')}
          </Button>
        </div>
      </div>

      {/* Aggregate Overview Metrics */}
      <SummaryStatCards />

      {/* Primary GIS Map & Drill-Down Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <MapLayerControl />
            <MapLegend />
          </div>

          <MapContainer />
        </div>

        {/* Selected Block / Panchayat Inspection Panel */}
        <div className="h-full">
          <SelectedAreaPanel />
        </div>
      </div>
    </div>
  );
};
