import React from 'react';
import { useTranslation } from 'react-i18next';
import { SummaryStatCards } from '../../components/officer/SummaryStatCards';
import { MapContainer } from '../../components/maps/MapContainer';
import { MapLayerControl } from '../../components/maps/MapLayerControl';
import { MapLegend } from '../../components/maps/MapLegend';
import { SelectedAreaPanel } from '../../components/maps/SelectedAreaPanel';
import { ScientificIntegrityStrip } from '../../components/officer/ScientificIntegrityStrip';
import { useOfficerStore } from '../../stores/useOfficerStore';
import { Send, MapPin, Compass, Eye, ShieldAlert, Sparkles } from 'lucide-react';

export const OfficerDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { setBulletinModalOpen, selectedDistrict } = useOfficerStore();

  return (
    <div className="space-y-6" data-testid="officer-dashboard-page">
      {/* 1. Editorial Header Strip */}
      <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#0B1726]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-[#008F83] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                COMMAND OVERVIEW
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#DCEFF0] text-[#006B65] text-[10px] font-mono font-bold border border-[#008F83]/30">
                {selectedDistrict} District (UP_LKO)
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-[#0B1726] tracking-tight">
              Understand what is changing across your blocks.
            </h1>
            <p className="text-xs sm:text-sm text-[#435466] max-w-3xl leading-relaxed">
              Synthesized agro-meteorological monitoring for extension personnel: track downscaled rainfall departures, dry-spell risk windows, active hazard advisories, and empirical station grounding across 440 Gram Panchayats.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setBulletinModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#008F83] text-white border-2 border-[#0B1726] shadow-[2px_2px_0px_#0B1726] hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs font-heading font-bold min-h-[42px]"
            >
              <Send className="w-4 h-4" />
              <span>{t('officer.broadcastBulletin', { defaultValue: 'Broadcast Agromet Bulletin' })}</span>
            </button>
          </div>
        </div>

        {/* Persistent Status Cluster */}
        <div className="mt-4 pt-4 border-t-2 border-[#0B1726]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[10px] font-mono font-bold uppercase tracking-wider">
              DIAGNOSTIC ONLY
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-[#0B1726]/20 text-[#0B1726] text-[10px] font-mono font-bold">
              GROUND ANCHOR: UP_LKO_BKT
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-[#0B1726]/20 text-[#0B1726] text-[10px] font-mono font-bold">
              KHARIF 2024 (122 OBS)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#62768A] font-mono">
            <Compass className="w-3.5 h-3.5 text-[#008F83]" />
            <span>Resolution: Administrative Block (~9 km)</span>
          </div>
        </div>
      </div>

      {/* 2. Top Intelligence Strip */}
      <SummaryStatCards />

      {/* 3. Primary GIS Map & Drill-Down Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#0B1726] tracking-tight">
              Spatial Block Intelligence Center
            </h2>
            <p className="text-xs text-[#435466]">
              Interactive block-level diagnostic choropleth with multi-layer hazard evaluation
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase bg-[#F7F3EA] border border-[#0B1726]/20 px-2.5 py-1 rounded-lg text-[#435466]">
            Active Centroids: 6 Blocks
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <MapLayerControl />
              <MapLegend />
            </div>

            <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-2 sm:p-3 shadow-[4px_4px_0px_#0B1726]">
              <MapContainer />
            </div>
          </div>

          {/* Selected Block / Panchayat Inspection Panel */}
          <div className="h-full">
            <SelectedAreaPanel />
          </div>
        </div>
      </div>

      {/* 4. Scientific Integrity Strip */}
      <ScientificIntegrityStrip />
    </div>
  );
};
