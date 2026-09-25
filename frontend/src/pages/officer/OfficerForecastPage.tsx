import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { HorizonSelector } from '../../components/forecast/HorizonSelector';
import { ForecastHorizonDays } from '@shared/types';
import { forecastService, ScientificForecastRecord } from '../../services/forecastService';
import { eventService, ForecastEvent, OperationalStatusResponse } from '../../services/eventService';
import { Info, MapPin, ShieldAlert, CheckCircle2, Clock, Bell, Radio } from 'lucide-react';

export const OfficerForecastPage: React.FC = () => {
  const [horizon, setHorizon] = useState<ForecastHorizonDays>(7);
  const [forecasts, setForecasts] = useState<ScientificForecastRecord[]>([]);
  const [events, setEvents] = useState<ForecastEvent[]>([]);
  const [opStatus, setOpStatus] = useState<OperationalStatusResponse | null>(null);

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
    },
  ];

  return (
    <div className="space-y-6" data-testid="officer-forecast-page">
      {/* 1. Command Header */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-bold text-lg text-slate-900">
                Block-Level Forecast Comparison Matrix
              </h2>
              <Badge variant="amber" size="sm">
                Diagnostic Only (Kharif 2024)
              </Badge>
              <Badge variant="neutral" size="sm">
                Neutral Comparison
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Objective meteorological comparison across administrative blocks in Lucknow District without subjective ranking
            </p>
          </div>

          <HorizonSelector value={horizon} onChange={setHorizon} />
        </div>
      </Card>

      {/* 2. Neutrality & Data Anchor Notice */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-900">Observational Anchor Disclosure:</strong> Bakshi Ka Talab (UP_LKO_BKT) currently contains the assimilated Kharif 2024 daily meteorological ground truth record. Surrounding blocks are shown with spatial interpolation priors and remain unassimilated. Per scientific governance rules, blocks are not ranked as "best" or "worst".
        </p>
      </div>

      {/* 3. Objective Forecast Matrix Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-surface-border font-heading text-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Administrative Block</th>
                <th className="py-3 px-3">Data Status</th>
                <th className="py-3 px-3 text-right">Onset Prob</th>
                <th className="py-3 px-3 text-right">Dry Spell Prob</th>
                <th className="py-3 px-3 text-right">Heavy Rain Prob</th>
                <th className="py-3 px-3 text-right">Expected Rain (mm)</th>
                <th className="py-3 px-3">Validation Gate</th>
                <th className="py-3 px-4 text-center">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border font-mono text-xs">
              {districtBlocks.map((b) => (
                <tr key={b.code} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                    <div>{b.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 font-normal">{b.code}</div>
                  </td>
                  <td className="py-3.5 px-3 font-sans">
                    <Badge
                      variant={b.assimilationStatus === 'ASSIMILATED_GROUND_ANCHOR' ? 'emerald' : 'neutral'}
                      size="sm"
                    >
                      {b.assimilationStatus === 'ASSIMILATED_GROUND_ANCHOR' ? 'GROUND ANCHOR' : 'INTERPOLATED'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-800">
                    {b.onsetProb}%
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-amber-700">
                    {b.drySpellProb}%
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-indigo-700">
                    {b.heavyRainProb}%
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                    {b.rainfallAmount.toFixed(1)} mm
                  </td>
                  <td className="py-3.5 px-3 font-sans text-[11px] text-amber-900">
                    {b.validation}
                  </td>
                  <td className="py-3.5 px-4 text-center font-sans">
                    <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                      {b.resolution}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. Active Forecast Lifecycle & Event Intelligence (Phase 4F) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-teal" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Forecast Lifecycle & Delivery Status
              </h3>
            </div>
            <Badge variant="amber" size="sm">
              DIAGNOSTIC ONLY
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-surface-muted/60 rounded-lg">
              <span className="text-slate-600 font-medium">Operational Status:</span>
              <span className="font-bold font-mono text-amber-800">
                {opStatus?.delivery_status || 'DIAGNOSTIC_ONLY'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-surface-muted/60 rounded-lg">
              <span className="text-slate-600 font-medium">Data Freshness:</span>
              <span className="font-mono text-slate-800">
                {opStatus?.data_freshness_status || 'HISTORICAL_ONLY'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-surface-muted/60 rounded-lg">
              <span className="text-slate-600 font-medium">Active Events Count:</span>
              <span className="font-bold text-slate-900">
                {events.filter(e => e.state !== 'RESOLVED' && e.state !== 'EXPIRED').length} Detected
              </span>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>Notice:</strong> Broadcast alerts via external telecommunication channels (SMS, WhatsApp, Voice) remain NOT CONFIGURED. All current events are evaluated on the Kharif 2024 historical observation record.
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Block-Level Meteorological Event Timeline
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {events.length} Total Registered
            </span>
          </div>

          {events.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {events.slice(0, 5).map((evt) => (
                <div key={evt.event_id} className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 font-heading">
                      {evt.event_type.replace(/_/g, ' ')}
                    </span>
                    <Badge
                      variant={
                        evt.severity === 'CRITICAL' ? 'crimson' :
                        evt.severity === 'WARNING' ? 'amber' :
                        evt.severity === 'WATCH' ? 'azure' : 'neutral'
                      }
                      size="sm"
                    >
                      {evt.severity}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600">{evt.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-100">
                    <span>Block: {evt.block_id}</span>
                    <span>State: <strong className="text-slate-700">{evt.state}</strong></span>
                    <span>Prob: {evt.probability ? `${Math.round(evt.probability * 100)}%` : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
              No active meteorological event alerts for this horizon.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
