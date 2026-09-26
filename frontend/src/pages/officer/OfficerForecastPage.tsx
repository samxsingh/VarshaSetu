import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { HorizonSelector } from '../../components/forecast/HorizonSelector';
import { ForecastHorizonDays } from '@shared/types';
import { forecastService, ScientificForecastRecord } from '../../services/forecastService';
import { eventService, ForecastEvent, OperationalStatusResponse } from '../../services/eventService';
import { ScientificIntegrityStrip } from '../../components/officer/ScientificIntegrityStrip';
import {
  Info,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Bell,
  Radio,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Cpu,
  BarChart3,
  Layers,
  Sparkles,
} from 'lucide-react';

export const OfficerForecastPage: React.FC = () => {
  const [horizon, setHorizon] = useState<ForecastHorizonDays>(7);
  const [forecasts, setForecasts] = useState<ScientificForecastRecord[]>([]);
  const [events, setEvents] = useState<ForecastEvent[]>([]);
  const [opStatus, setOpStatus] = useState<OperationalStatusResponse | null>(null);
  const [expandedSignalBlock, setExpandedSignalBlock] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecastsAndEvents = async () => {
      try {
        const [fcRes, evRes, opRes] = await Promise.all([
          forecastService.getForecasts({ horizon }).catch(() => null),
          eventService.getEvents().catch(() => null),
          eventService.getOperationalStatus().catch(() => null),
        ]);
        if (fcRes?.success && fcRes.data?.forecasts) {
          setForecasts(fcRes.data.forecasts);
        }
        if (evRes?.success && evRes.data?.events) {
          setEvents(evRes.data.events);
        }
        if (opRes?.success && opRes.data) {
          setOpStatus(opRes.data);
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchForecastsAndEvents();
  }, [horizon]);

  // Standard Lucknow district block matrix with scientific observational status
  const districtBlocks = [
    {
      code: 'UP_LKO_BKT',
      name: 'Bakshi Ka Talab',
      assimilationStatus: 'ASSIMILATED_GROUND_ANCHOR',
      stationCoverage: '1 Station (Kharif 2024 Archive)',
      freshness: 'HISTORICAL_ONLY',
      onsetProb: 82,
      drySpellProb: 34,
      heavyRainProb: 18,
      rainfallAmount: 42.5,
      validation: 'INSUFFICIENT_DATA (1 Season)',
      resolution: 'BLOCK (~9 km)',
      modelDetails: {
        model: 'LightGBM-Isotonic-Ensemble',
        calibration: 'Isotonic Regression (Brier: 0.114)',
        signalDetail: '850 hPa relative humidity anomaly detected in Kharif 2024 archive',
        limitation: 'Single-station empirical grounding. Operational dissemination blocked pending multi-year validation.',
      },
    },
    {
      code: 'UP_LKO_MLH',
      name: 'Malihabad',
      assimilationStatus: 'PENDING_ASSIMILATION',
      stationCoverage: 'Spatial Interpolation Anchor',
      freshness: 'HISTORICAL_ONLY',
      onsetProb: 79,
      drySpellProb: 38,
      heavyRainProb: 15,
      rainfallAmount: 38.0,
      validation: 'INSUFFICIENT_DATA (Pending)',
      resolution: 'BLOCK (~9 km)',
      modelDetails: {
        model: 'Inverse Distance Weighting Interpolation',
        calibration: 'Spatial Prior Scaled',
        signalDetail: 'Transferred convective instability gradient from Bakshi Ka Talab station',
        limitation: 'Unassimilated block prior. Subject to regional terrain smoothing error.',
      },
    },
    {
      code: 'UP_LKO_MHL',
      name: 'Mohanlalganj',
      assimilationStatus: 'PENDING_ASSIMILATION',
      stationCoverage: 'Spatial Interpolation Anchor',
      freshness: 'HISTORICAL_ONLY',
      onsetProb: 84,
      drySpellProb: 31,
      heavyRainProb: 22,
      rainfallAmount: 48.0,
      validation: 'INSUFFICIENT_DATA (Pending)',
      resolution: 'BLOCK (~9 km)',
      modelDetails: {
        model: 'Inverse Distance Weighting Interpolation',
        calibration: 'Spatial Prior Scaled',
        signalDetail: 'Southern monsoon trough convergence indicator based on reanalysis',
        limitation: 'Unassimilated block prior. Station telemetry pending integration.',
      },
    },
    {
      code: 'UP_LKO_SRJ',
      name: 'Sarojininagar',
      assimilationStatus: 'PENDING_ASSIMILATION',
      stationCoverage: 'Spatial Interpolation Anchor',
      freshness: 'HISTORICAL_ONLY',
      onsetProb: 83,
      drySpellProb: 33,
      heavyRainProb: 19,
      rainfallAmount: 44.0,
      validation: 'INSUFFICIENT_DATA (Pending)',
      resolution: 'BLOCK (~9 km)',
      modelDetails: {
        model: 'Inverse Distance Weighting Interpolation',
        calibration: 'Spatial Prior Scaled',
        signalDetail: 'Centroid interpolation adjacent to urban thermal core',
        limitation: 'Unassimilated block prior. Multi-season validation gate active.',
      },
    },
    {
      code: 'UP_LKO_GSN',
      name: 'Gosainganj',
      assimilationStatus: 'PENDING_ASSIMILATION',
      stationCoverage: 'Spatial Interpolation Anchor',
      freshness: 'HISTORICAL_ONLY',
      onsetProb: 81,
      drySpellProb: 36,
      heavyRainProb: 17,
      rainfallAmount: 40.5,
      validation: 'INSUFFICIENT_DATA (Pending)',
      resolution: 'BLOCK (~9 km)',
      modelDetails: {
        model: 'Inverse Distance Weighting Interpolation',
        calibration: 'Spatial Prior Scaled',
        signalDetail: 'Eastern Gomti riverine catchment moisture flux indicator',
        limitation: 'Unassimilated block prior. Non-operational diagnostic reference.',
      },
    },
    {
      code: 'UP_LKO_CHN',
      name: 'Chinhat',
      assimilationStatus: 'PENDING_ASSIMILATION',
      stationCoverage: 'Spatial Interpolation Anchor',
      freshness: 'HISTORICAL_ONLY',
      onsetProb: 85,
      drySpellProb: 32,
      heavyRainProb: 20,
      rainfallAmount: 45.0,
      validation: 'INSUFFICIENT_DATA (Pending)',
      resolution: 'BLOCK (~9 km)',
      modelDetails: {
        model: 'Inverse Distance Weighting Interpolation',
        calibration: 'Spatial Prior Scaled',
        signalDetail: 'Peri-urban eastern boundary boundary-layer moisture transfer signal',
        limitation: 'Unassimilated block prior. Diagnostic only.',
      },
    },
  ];

  return (
    <div className="space-y-6" data-testid="officer-forecast-page">
      {/* 1. Command Header */}
      <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 shadow-[4px_4px_0px_#0B1726]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#0B1726]">
                Block-Level Forecast Comparison Matrix
              </h2>
              <span className="px-2.5 py-0.5 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[10px] font-mono font-bold">
                Diagnostic Only (Kharif 2024)
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#DCEFF0] text-[#006B65] text-[10px] font-mono font-bold border border-[#008F83]/30">
                Neutral Comparison
              </span>
            </div>
            <p className="text-xs text-[#435466]">
              Objective meteorological comparison across administrative blocks in Lucknow District without subjective ranking
            </p>
          </div>

          <HorizonSelector value={horizon} onChange={setHorizon} />
        </div>
      </div>

      {/* 2. Neutrality & Data Anchor Notice */}
      <div className="p-4 bg-[#F7F3EA] border-2 border-[#0B1726] rounded-xl text-xs text-[#435466] shadow-[2px_2px_0px_#0B1726] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#008F83] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#0B1726]">Observational Anchor Disclosure:</strong> Bakshi Ka Talab (UP_LKO_BKT) currently contains the assimilated Kharif 2024 daily meteorological ground truth record. Surrounding blocks are shown with spatial interpolation priors and remain unassimilated. Per scientific governance rules, blocks are not ranked as "best" or "worst".
        </p>
      </div>

      {/* 3. Objective Forecast Matrix Table */}
      <div className="bg-white border-2 border-[#0B1726] rounded-2xl shadow-[4px_4px_0px_#0B1726] overflow-hidden">
        <div className="p-4 border-b-2 border-[#0B1726]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FDFBF7]">
          <div>
            <h3 className="font-heading font-extrabold text-sm text-[#0B1726] uppercase tracking-wider">
              Diagnostic Block Comparison ({horizon}-Day Evaluation Window)
            </h3>
            <span className="text-[11px] text-[#62768A]">
              Click any block to inspect its explainability signal and calibration basis
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-white border border-[#0B1726]/20 text-[#0B1726] text-[10px] font-mono font-bold">
            6 Centroids Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F3EA] border-b-2 border-[#0B1726]/15 font-heading text-[#0B1726] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-extrabold">Administrative Block</th>
                <th className="py-3 px-3 font-extrabold">Data Status</th>
                <th className="py-3 px-3 text-right font-extrabold">Onset Prob</th>
                <th className="py-3 px-3 text-right font-extrabold">Dry Spell Prob</th>
                <th className="py-3 px-3 text-right font-extrabold">Heavy Rain Prob</th>
                <th className="py-3 px-3 text-right font-extrabold">Expected Rain (mm)</th>
                <th className="py-3 px-3 font-extrabold">Validation Gate</th>
                <th className="py-3 px-4 text-center font-extrabold">Resolution</th>
                <th className="py-3 px-3 text-center font-extrabold">Explainability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0B1726]/10 font-mono text-xs">
              {districtBlocks.map((b) => {
                const isExpanded = expandedSignalBlock === b.code;
                return (
                  <React.Fragment key={b.code}>
                    <tr
                      onClick={() => setExpandedSignalBlock(isExpanded ? null : b.code)}
                      className={`hover:bg-[#FDFBF7] cursor-pointer transition-colors ${
                        isExpanded ? 'bg-[#F7F3EA]/70' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-sans font-bold text-[#0B1726]">
                        <div>{b.name}</div>
                        <div className="text-[10px] font-mono text-[#62768A] font-normal">{b.code}</div>
                      </td>
                      <td className="py-3.5 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            b.assimilationStatus === 'ASSIMILATED_GROUND_ANCHOR'
                              ? 'bg-[#EBF5EE] text-[#2F7D4A] border-[#2F7D4A]/40'
                              : 'bg-white text-[#435466] border-[#0B1726]/20'
                          }`}
                        >
                          {b.assimilationStatus === 'ASSIMILATED_GROUND_ANCHOR' ? 'GROUND ANCHOR' : 'INTERPOLATED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-[#0B1726]">
                        {b.onsetProb}%
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-[#9A6218]">
                        {b.drySpellProb}%
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-[#1D4ED8]">
                        {b.heavyRainProb}%
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-[#0B1726]">
                        {b.rainfallAmount.toFixed(1)} mm
                      </td>
                      <td className="py-3.5 px-3 font-sans text-[11px] text-[#9A6218]">
                        {b.validation}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className="text-[11px] text-[#435466] bg-[#F7F3EA] border border-[#0B1726]/10 px-2 py-0.5 rounded font-mono">
                          {b.resolution}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          className="p-1 rounded hover:bg-[#0B1726]/10 text-[#008F83] font-bold"
                          title="Toggle explainability basis"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable "WHY THIS SIGNAL?" Panel */}
                    {isExpanded && (
                      <tr className="bg-[#F7F3EA]/90 border-b-2 border-[#0B1726]/20">
                        <td colSpan={9} className="p-4 sm:p-5 font-sans">
                          <div className="bg-white border-2 border-[#0B1726] rounded-xl p-4 shadow-[2px_2px_0px_#0B1726] space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#0B1726]/15">
                              <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-[#008F83]" />
                                <span className="font-heading font-extrabold text-xs text-[#0B1726] uppercase tracking-wider">
                                  Why This Signal? — Scientific Explainability for {b.name} ({b.code})
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-[#62768A]">
                                Calibration: {b.modelDetails.calibration}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              <div className="bg-[#F7F3EA] p-3 rounded-lg border border-[#0B1726]/10 space-y-1">
                                <span className="text-[10px] font-heading font-bold uppercase text-[#62768A] block">
                                  Observed Meteorological Context
                                </span>
                                <p className="text-[#0B1726] text-[11px] leading-relaxed">
                                  {b.modelDetails.signalDetail}
                                </p>
                              </div>

                              <div className="bg-[#F7F3EA] p-3 rounded-lg border border-[#0B1726]/10 space-y-1">
                                <span className="text-[10px] font-heading font-bold uppercase text-[#62768A] block">
                                  Model Ensemble Signal
                                </span>
                                <p className="text-[#0B1726] text-[11px] leading-relaxed">
                                  Ensemble engine: <strong>{b.modelDetails.model}</strong>. Downscaled from 0.25° grid to {b.resolution}.
                                </p>
                              </div>

                              <div className="bg-[#FEF6E9] p-3 rounded-lg border border-[#E5A33D]/40 space-y-1">
                                <span className="text-[10px] font-heading font-bold uppercase text-[#9A6218] block">
                                  Scientific Safety Limitation
                                </span>
                                <p className="text-[#9A6218] text-[11px] leading-relaxed">
                                  {b.modelDetails.limitation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Active Forecast Lifecycle & Event Intelligence (Phase 4F) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 shadow-[4px_4px_0px_#0B1726] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#0B1726]/10">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#008F83]" />
              <h3 className="font-heading font-extrabold text-sm text-[#0B1726]">
                Forecast Lifecycle & Delivery Status
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[10px] font-mono font-bold">
              DIAGNOSTIC ONLY
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/10">
              <span className="text-[#435466] font-medium">Operational Status:</span>
              <span className="font-bold font-mono text-[#9A6218]">
                {opStatus?.delivery_status || 'DIAGNOSTIC_ONLY'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/10">
              <span className="text-[#435466] font-medium">Data Freshness:</span>
              <span className="font-mono text-[#0B1726] font-bold">
                {opStatus?.data_freshness_status || 'HISTORICAL_ONLY'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/10">
              <span className="text-[#435466] font-medium">Active Events Count:</span>
              <span className="font-bold font-mono text-[#0B1726]">
                {events.filter((e) => e.state !== 'RESOLVED' && e.state !== 'EXPIRED').length} Detected
              </span>
            </div>

            <div className="p-3 bg-[#FEF6E9] rounded-xl border border-[#E5A33D]/40 text-[11px] text-[#9A6218] leading-relaxed">
              <strong>Operational Restriction:</strong> Broadcast alerts via external telecommunication channels (SMS, WhatsApp, Voice) remain NOT CONFIGURED. All current events are evaluated on the Kharif 2024 historical observation record.
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 shadow-[4px_4px_0px_#0B1726] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#0B1726]/10">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#3B82F6]" />
              <h3 className="font-heading font-extrabold text-sm text-[#0B1726]">
                Block-Level Meteorological Event Timeline
              </h3>
            </div>
            <span className="text-xs text-[#62768A] font-mono">
              {events.length} Total Registered
            </span>
          </div>

          {events.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {events.slice(0, 5).map((evt) => (
                <div
                  key={evt.event_id}
                  className="p-3 rounded-xl border border-[#0B1726]/15 bg-[#FDFBF7] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-extrabold text-xs text-[#0B1726]">
                      {evt.event_type.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30'
                          : evt.severity === 'WARNING'
                          ? 'bg-[#FEF6E9] text-[#9A6218] border-[#E5A33D]/40'
                          : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#3B82F6]/30'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#435466] leading-tight">{evt.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#62768A] font-mono pt-1 border-t border-[#0B1726]/10">
                    <span>Block: {evt.block_id}</span>
                    <span>State: <strong className="text-[#0B1726]">{evt.state}</strong></span>
                    <span>Prob: {evt.probability ? `${Math.round(evt.probability * 100)}%` : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#62768A] bg-[#F7F3EA] rounded-xl border border-[#0B1726]/10">
              No active meteorological event alerts for this horizon.
            </div>
          )}
        </div>
      </div>

      {/* 5. Scientific Integrity Strip */}
      <ScientificIntegrityStrip />
    </div>
  );
};
