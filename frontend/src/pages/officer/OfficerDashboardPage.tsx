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
import { RiskDistribution, ForecastTimeline } from '../../components/visualization';
import { OperationalSignalCenter } from '../../components/operations/OperationalSignalCenter';
import { OfficerFieldIntelligence } from '../../components/officer/OfficerFieldIntelligence';

export const OfficerDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { setBulletinModalOpen, selectedDistrict } = useOfficerStore();

  return (
    <div className="space-y-6" data-testid="officer-dashboard-page">
      {/* 1. Editorial Header Strip */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#102A43]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-[#0E7490] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                COMMAND OVERVIEW
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#E8F4F6] text-[#155E75] text-[10px] font-mono font-bold border border-[#0E7490]/30">
                {selectedDistrict} District (UP_LKO)
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-[#102A43] tracking-tight">
              Understand what is changing across your blocks.
            </h1>
            <p className="text-xs sm:text-sm text-[#486581] max-w-3xl leading-relaxed">
              Synthesized agro-meteorological monitoring for extension personnel: track downscaled rainfall departures, dry-spell risk windows, active hazard advisories, and empirical station grounding across 440 Gram Panchayats.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setBulletinModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7490] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs font-heading font-bold min-h-[42px]"
            >
              <Send className="w-4 h-4" />
              <span>{t('officer.broadcastBulletin', { defaultValue: 'Broadcast Agromet Bulletin' })}</span>
            </button>
          </div>
        </div>

        {/* Persistent Status Cluster */}
        <div className="mt-4 pt-4 border-t-2 border-[#102A43]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider">
              LIVE INGESTION
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-[#102A43]/20 text-[#102A43] text-[10px] font-mono font-bold">
              GROUND ANCHOR: UP_LKO_BKT
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-[#102A43]/20 text-[#102A43] text-[10px] font-mono font-bold">
              OPERATIONAL CYCLE 2026
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#829AB1] font-mono">
            <Compass className="w-3.5 h-3.5 text-[#0E7490]" />
            <span>Resolution: Administrative Block (~9 km)</span>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Operational Field Conditions & Block Risk Matrix */}
      <OfficerFieldIntelligence />

      {/* 3. Top Intelligence Strip */}
      <SummaryStatCards />

      {/* 2b. Spatial Risk Distribution & Instrument Pipeline (Phase 7C) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43]">
          <RiskDistribution
            title="Block Signal Distribution"
            subtitle="Observed administrative status across 6 monitoring centroids"
            totalLabel="Active Centroids"
            items={[
              {
                key: 'watch',
                label: 'WATCH',
                count: 2,
                color: '#D97706',
                description: 'Chinhat, Sarojininagar: Dry spell break risk exceeds 50%',
              },
              {
                key: 'elevated',
                label: 'ELEVATED',
                count: 1,
                color: '#B45309',
                description: 'Mohanlalganj: Localized rainfall deficit (-28% departure)',
              },
              {
                key: 'normal',
                label: 'NORMAL',
                count: 3,
                color: '#0891B2',
                description: 'Bakshi Ka Talab, Malihabad, Gosainganj: Climatological bounds',
              },
            ]}
          />
        </div>

        <div className="lg:col-span-7 bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43] flex flex-col justify-between">
          <ForecastTimeline
            mode="process"
            title="Scientific Pipeline & Verification Lifecycle"
            subtitle="Operational lineage: IMD Centroid UP_LKO_BKT"
            stages={[
              {
                id: 'obs',
                name: 'OBSERVATION',
                timestamp: 'Kharif 2024 Archive',
                status: 'completed',
                details: '122 daily IMD AWS observations ingested without gaps',
              },
              {
                id: 'run',
                name: 'MODEL RUN',
                timestamp: 'SEAS5 / ERA5 Downscaled',
                status: 'completed',
                details: '4km grid resolution numerical atmospheric prediction',
              },
              {
                id: 'calib',
                name: 'CALIBRATION',
                timestamp: 'Sample Gate: 18 Test Bins',
                status: 'gated',
                details: 'Engineering gate active: empirical validation only',
              },
              {
                id: 'window',
                name: 'FORECAST WINDOW',
                timestamp: '7–14 Day Horizon',
                status: 'active',
                details: 'Centroid risk evaluations for agricultural extension',
              },
              {
                id: 'val',
                name: 'VALIDATION',
                timestamp: 'Skill Score Audit',
                status: 'pending',
                details: 'Post-event verification against verified rain gauges',
              },
            ]}
          />
        </div>
      </div>

      {/* 2b. Operational Intelligence Signals */}
      <OperationalSignalCenter
        blockId="UP_LKO_BKT"
        persona="OFFICER"
        title="Block Operational Intelligence Signals"
        description="Active meteorological risk signals and advisory verification items for extension officers."
      />

      {/* 3. Primary GIS Map & Drill-Down Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#102A43] tracking-tight">
              Spatial Block Intelligence Center
            </h2>
            <p className="text-xs text-[#486581]">
              Interactive block-level diagnostic choropleth with multi-layer hazard evaluation
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase bg-[#F3F6F7] border border-[#102A43]/20 px-2.5 py-1 rounded-lg text-[#486581]">
            Active Centroids: 6 Blocks
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <MapLayerControl />
              <MapLegend />
            </div>

            <div className="bg-white border-2 border-[#102A43] rounded-2xl p-2 sm:p-3 shadow-[4px_4px_0px_#102A43]">
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
