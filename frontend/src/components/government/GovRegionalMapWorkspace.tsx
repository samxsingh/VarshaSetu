import React from 'react';
import { MapContainer } from '../maps/MapContainer';
import { MapLayerControl } from '../maps/MapLayerControl';
import { MapLegend } from '../maps/MapLegend';
import { useOfficerStore } from '../../stores/useOfficerStore';
import { MapPin, Droplets, ShieldCheck, Database, Compass, Radio, ArrowUpRight, Activity } from 'lucide-react';

export const GovRegionalMapWorkspace: React.FC = () => {
  const { selectedBlock } = useOfficerStore();

  const blockIndicators: Record<string, {
    drySpellRisk: string;
    heavyRainRisk: string;
    onsetStatus: string;
    soilSaturation: string;
    advisoryCount: number;
    provenance: string;
  }> = {
    'Bakshi Ka Talab': {
      drySpellRisk: '34% (Moderate)',
      heavyRainRisk: '58.4% (Elevated Watch)',
      onsetStatus: 'Active Onset Captured',
      soilSaturation: '62% (Adequate)',
      advisoryCount: 2,
      provenance: 'Assimilated Ground Anchor (122 records)',
    },
    'Malihabad': {
      drySpellRisk: '74% (High Break Risk)',
      heavyRainRisk: '15% (Low)',
      onsetStatus: 'Spatial Prior Scaled',
      soilSaturation: '48% (Moderate)',
      advisoryCount: 1,
      provenance: 'Spatial Interpolation Prior (EPSG:4326)',
    },
    'Mohanlalganj': {
      drySpellRisk: '31% (Low)',
      heavyRainRisk: '22% (Moderate)',
      onsetStatus: 'Trough Axis Convergence',
      soilSaturation: '68% (Adequate)',
      advisoryCount: 1,
      provenance: 'Spatial Interpolation Prior (EPSG:4326)',
    },
    'Sarojininagar': {
      drySpellRisk: '42% (Moderate)',
      heavyRainRisk: '19% (Low)',
      onsetStatus: 'Peri-Urban Thermal Prior',
      soilSaturation: '55% (Moderate)',
      advisoryCount: 1,
      provenance: 'Spatial Interpolation Prior (EPSG:4326)',
    },
    'Gosainganj': {
      drySpellRisk: '36% (Moderate)',
      heavyRainRisk: '17% (Low)',
      onsetStatus: 'Gomti Catchment Moisture',
      soilSaturation: '64% (Adequate)',
      advisoryCount: 1,
      provenance: 'Spatial Interpolation Prior (EPSG:4326)',
    },
    'Chinhat': {
      drySpellRisk: '32% (Low)',
      heavyRainRisk: '20% (Moderate)',
      onsetStatus: 'Eastern Boundary Inflow',
      soilSaturation: '61% (Adequate)',
      advisoryCount: 1,
      provenance: 'Spatial Interpolation Prior (EPSG:4326)',
    },
  };

  const currentBlockData = blockIndicators[selectedBlock] || blockIndicators['Bakshi Ka Talab'];

  return (
    <section id="map" className="space-y-4">
      {/* Workspace Header */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0E7490] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              REGIONAL INTELLIGENCE
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#E8F4F6] text-[#155E75] text-[10px] font-mono font-bold border border-[#0E7490]/30">
              LUCKNOW REGION • EPSG:4326
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#102A43] mt-1 tracking-tight">
            Block-Level Diagnostic Geographic View
          </h2>
          <p className="text-xs text-[#486581]">
            Interactive GIS choropleths, downscaled hazard exposures, and administrative centroids across 6 blocks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MapLayerControl />
        </div>
      </div>

      {/* Grid: Map Workspace + Government Area Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Panel */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white border-2 border-[#102A43] rounded-2xl p-2 sm:p-3 shadow-[4px_4px_0px_#102A43]">
            <MapContainer />
          </div>
          <MapLegend />
        </div>

        {/* Selected Area Regional Inspection Panel */}
        <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43] flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#102A43]/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#E8F4F6] text-[#155E75] border border-[#0E7490]/30">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-[#102A43]">
                    {selectedBlock} Block
                  </h3>
                  <span className="text-[11px] font-mono text-[#829AB1]">
                    Administrative Unit • Lucknow District
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] border border-[#D97706] text-[#B45309] text-[10px] font-mono font-bold">
                DIAGNOSTIC
              </span>
            </div>

            {/* Signal Metrics for this Block */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/10 flex items-center justify-between">
                <span className="text-[#486581] font-medium">Dry Spell Exposure:</span>
                <strong className="text-[#102A43] font-mono">{currentBlockData.drySpellRisk}</strong>
              </div>

              <div className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/10 flex items-center justify-between">
                <span className="text-[#486581] font-medium">Heavy Rainfall Signal:</span>
                <strong className="text-[#0E7490] font-mono">{currentBlockData.heavyRainRisk}</strong>
              </div>

              <div className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/10 flex items-center justify-between">
                <span className="text-[#486581] font-medium">Onset Likelihood:</span>
                <strong className="text-[#3F7D58] font-mono">{currentBlockData.onsetStatus}</strong>
              </div>

              <div className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/10 flex items-center justify-between">
                <span className="text-[#486581] font-medium flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#0E7490]" />
                  Topsoil Saturation:
                </span>
                <strong className="text-[#102A43] font-mono">{currentBlockData.soilSaturation}</strong>
              </div>
            </div>

            {/* Scientific Provenance for Selected Block */}
            <div className="p-3.5 bg-[#FFFFFF] rounded-xl border-2 border-[#102A43]/15 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-[#102A43]">
                <Database className="w-3.5 h-3.5 text-[#0E7490]" />
                <span className="font-heading font-extrabold uppercase text-[10px] tracking-wider">
                  Scientific Provenance
                </span>
              </div>
              <p className="text-[11px] text-[#486581] leading-relaxed">
                {currentBlockData.provenance}. Downscaled to ~9 km centroid. Gated by Kharif 2024 empirical archive.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#102A43]/10 text-[11px] text-[#829AB1] font-mono flex items-center justify-between">
            <span>Centroid Active</span>
            <span>Advisories: {currentBlockData.advisoryCount} Active</span>
          </div>
        </div>
      </div>
    </section>
  );
};
