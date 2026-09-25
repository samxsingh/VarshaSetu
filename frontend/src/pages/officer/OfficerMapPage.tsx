import React from 'react';
import { MapContainer } from '../../components/maps/MapContainer';
import { MapLayerControl } from '../../components/maps/MapLayerControl';
import { MapLegend } from '../../components/maps/MapLegend';
import { SelectedAreaPanel } from '../../components/maps/SelectedAreaPanel';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const OfficerMapPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-surface-border">
        <div>
          <h2 className="font-heading font-bold text-lg text-slate-900">
            Geographic Information System (GIS) Risk Map
          </h2>
          <p className="text-xs text-slate-600">
            Interactive block choropleths and risk gradients for Lucknow District, UP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="demo" size="sm">PostGIS Demo Fixture</Badge>
          <MapLayerControl />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-3">
          <MapContainer />
          <MapLegend />
        </div>
        <div className="lg:col-span-1">
          <SelectedAreaPanel />
        </div>
      </div>
    </div>
  );
};
