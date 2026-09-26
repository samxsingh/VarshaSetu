import React from 'react';
import { MapContainer } from '../../components/maps/MapContainer';
import { MapLayerControl } from '../../components/maps/MapLayerControl';
import { MapLegend } from '../../components/maps/MapLegend';
import { SelectedAreaPanel } from '../../components/maps/SelectedAreaPanel';
import { ScientificIntegrityStrip } from '../../components/officer/ScientificIntegrityStrip';
import { Map, Layers, Compass, Info, ShieldCheck } from 'lucide-react';

export const OfficerMapPage: React.FC = () => {
  return (
    <div className="space-y-6" data-testid="officer-map-page">
      {/* 1. Header Strip */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#0E7490] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                GIS SPATIAL WORKSPACE
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] border border-[#D97706] text-[#B45309] text-[10px] font-mono font-bold">
                DIAGNOSTIC VIEW
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#102A43] tracking-tight">
              Geographic Information System (GIS) Risk Map
            </h2>
            <p className="text-xs text-[#486581]">
              Interactive block choropleths, downscaled rainfall departures, and localized risk gradients for Lucknow District, UP
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <MapLayerControl />
          </div>
        </div>

        {/* Spatial Source Notice */}
        <div className="mt-4 pt-3 border-t border-[#102A43]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#486581]">
            <Compass className="w-3.5 h-3.5 text-[#0E7490]" />
            <span className="font-mono text-[11px]">
              PostGIS Vector Layer: 6 Administrative Blocks • Centroid Spatial Projection EPSG:4326
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#F3F6F7] border border-[#102A43]/15 text-[10px] font-mono text-[#829AB1]">
            Anchor: Bakshi Ka Talab
          </span>
        </div>
      </div>

      {/* 2. Main Map & Selected Block Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white border-2 border-[#102A43] rounded-2xl p-2 sm:p-3 shadow-[4px_4px_0px_#102A43]">
            <MapContainer />
          </div>
          <MapLegend />
        </div>

        <div className="lg:col-span-1">
          <SelectedAreaPanel />
        </div>
      </div>

      {/* 3. Scientific Integrity Strip */}
      <ScientificIntegrityStrip />
    </div>
  );
};
