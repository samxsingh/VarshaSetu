import React, { useState } from 'react';
import { CloudRain, SunMedium, TrendingUp, AlertTriangle, Droplets, MapPin, CheckCircle2, Database } from 'lucide-react';
import { ProvenanceDrawer } from '../visualization/ProvenanceDrawer';

export const GovRegionalSignalMatrix: React.FC = () => {
  const [selectedSignal, setSelectedSignal] = useState<any | null>(null);
  const signalRows = [
    {
      signal: 'HEAVY RAINFALL',
      signalIcon: <CloudRain className="w-3.5 h-3.5 text-[#0E7490]" />,
      area: 'Bakshi Ka Talab (UP_LKO_BKT)',
      indicator: 'Threshold Exceedance >= 64.5 mm / 24h',
      severity: 'WATCH',
      severityColor: 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40',
      probability: '58.4%',
      status: 'ASSIMILATED GROUND ANCHOR',
      statusColor: 'bg-[#EBF5EE] text-[#3F7D58] border-[#3F7D58]/30',
      timeframe: '7-Day Window',
    },
    {
      signal: 'DRY SPELL BREAK',
      signalIcon: <SunMedium className="w-3.5 h-3.5 text-[#D97706]" />,
      area: 'Malihabad (UP_LKO_MLH)',
      indicator: '>= 5 Consecutive Dry Days (< 2.5 mm)',
      severity: 'ELEVATED',
      severityColor: 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30',
      probability: '74.0%',
      status: 'SPATIAL PRIOR INTERPOLATED',
      statusColor: 'bg-white text-[#486581] border-[#102A43]/20',
      timeframe: '14-Day Window',
    },
    {
      signal: 'WATERLOGGING INDICATOR',
      signalIcon: <Droplets className="w-3.5 h-3.5 text-[#2563EB]" />,
      area: 'Sarojininagar (UP_LKO_SRJ)',
      indicator: 'Heavy Soil Saturation > 80% with Pulse Inflow',
      severity: 'WATCH',
      severityColor: 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40',
      probability: '42.0%',
      status: 'SPATIAL PRIOR INTERPOLATED',
      statusColor: 'bg-white text-[#486581] border-[#102A43]/20',
      timeframe: '7-Day Window',
    },
    {
      signal: 'MONSOON ONSET SURGE',
      signalIcon: <CloudRain className="w-3.5 h-3.5 text-[#2563EB]" />,
      area: 'Mohanlalganj (UP_LKO_MHL)',
      indicator: 'Active Trough Axis Convergence (> 25 mm soaking)',
      severity: 'FAVORABLE',
      severityColor: 'bg-[#EBF5EE] text-[#3F7D58] border-[#3F7D58]/30',
      probability: '84.0%',
      status: 'SPATIAL PRIOR INTERPOLATED',
      statusColor: 'bg-white text-[#486581] border-[#102A43]/20',
      timeframe: 'June 26–28 Window',
    },
    {
      signal: 'RAINFALL DEPARTURE',
      signalIcon: <TrendingUp className="w-3.5 h-3.5 text-[#0E7490]" />,
      area: 'Chinhat (UP_LKO_CHN)',
      indicator: 'Positive Departure vs Normal (+14% Anomaly)',
      severity: 'NORMAL/EXCESS',
      severityColor: 'bg-[#E8F4F6] text-[#155E75] border-[#0E7490]/30',
      probability: '85.0%',
      status: 'SPATIAL PRIOR INTERPOLATED',
      statusColor: 'bg-white text-[#486581] border-[#102A43]/20',
      timeframe: 'Cumulative Kharif',
    },
    {
      signal: 'CATCHMENT RUNOFF',
      signalIcon: <Droplets className="w-3.5 h-3.5 text-[#2563EB]" />,
      area: 'Gosainganj (UP_LKO_GSN)',
      indicator: 'Gomti Riverine Influx with 40.5 mm Event Potential',
      severity: 'WATCH',
      severityColor: 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40',
      probability: '36.0%',
      status: 'SPATIAL PRIOR INTERPOLATED',
      statusColor: 'bg-white text-[#486581] border-[#102A43]/20',
      timeframe: '7-Day Window',
    },
  ];

  return (
    <section id="signals" className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0E7490] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              REGIONAL SIGNAL MATRIX
            </span>
            <span className="text-[11px] font-mono text-[#829AB1]">6 Centroids Monitored</span>
          </div>
          <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#102A43] mt-0.5">
            Geographic Hazard Signals & Meteorological Indicators
          </h2>
        </div>

        <span className="px-3 py-1 rounded-xl bg-[#F3F6F7] border border-[#102A43]/15 text-xs font-mono text-[#486581] self-start sm:self-auto">
          Baseline: Kharif 2024 Archive
        </span>
      </div>

      <div className="bg-white border-2 border-[#102A43] rounded-2xl shadow-[4px_4px_0px_#102A43] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F6F7] border-b-2 border-[#102A43]/15 font-heading text-[#102A43] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-extrabold">Meteorological Signal</th>
                <th className="py-3 px-3 font-extrabold">Administrative Area</th>
                <th className="py-3 px-3 font-extrabold">Detected Indicator</th>
                <th className="py-3 px-3 font-extrabold">Severity Tier</th>
                <th className="py-3 px-3 text-right font-extrabold">Probability</th>
                <th className="py-3 px-4 font-extrabold">Data Status</th>
                <th className="py-3 px-3 font-extrabold">Timeframe</th>
                <th className="py-3 px-3 font-extrabold text-right">Traceability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102A43]/10 font-sans text-xs">
              {signalRows.map((r, i) => (
                <tr key={i} className="hover:bg-[#FFFFFF] transition-colors">
                  <td className="py-3.5 px-4 font-heading font-bold text-[#102A43]">
                    <div className="flex items-center gap-2">
                      {r.signalIcon}
                      <span>{r.signal}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-medium text-[#102A43]">
                    <div>{r.area}</div>
                  </td>
                  <td className="py-3.5 px-3 text-[#486581] text-[11px] leading-tight">
                    {r.indicator}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${r.severityColor}`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#102A43]">
                    {r.probability}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${r.statusColor}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-[#829AB1]">
                    {r.timeframe}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedSignal(r)}
                      className="text-[10px] font-mono font-bold text-[#0E7490] hover:text-[#102A43] bg-[#E8F4F6] hover:bg-[#F3F6F7] px-2 py-0.5 rounded border border-[#0E7490]/30 transition-colors cursor-pointer"
                    >
                      PROVENANCE →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signal Provenance Drawer */}
      <ProvenanceDrawer
        isOpen={!!selectedSignal}
        onClose={() => setSelectedSignal(null)}
        title={selectedSignal ? `Signal Provenance: ${selectedSignal.signal} (${selectedSignal.area})` : 'Signal Provenance'}
        provenance={
          selectedSignal
            ? {
                dataSource: 'IMD Lucknow Mesonet (AWS) + ERA5 Reanalysis Downscaling',
                spatialResolution: '0.25° (~27 km) to Administrative Block Centroid',
                stationsCovered: selectedSignal.area.includes('BKT') ? 'Bakshi Ka Talab AWS (Ground Anchor)' : 'Interpolated Regional Prior',
                temporalCoverage: 'Kharif 2024 Reference Climatology',
                observationTimestamp: '2024-09-15T06:00:00Z',
                freshnessLatency: 'HISTORICAL_DATASET',
                modelPipeline: 'VarshaSetu Ensemble Engine v2.3 (Calibrated Probabilities)',
                calibrator: 'Isotonic Probability Calibrator',
                eceScore: '0.038',
                brierScore: '+0.28 BSS',
                validationStatus: selectedSignal.area.includes('BKT') ? 'ASSIMILATED_GROUND_ANCHOR' : 'SPATIAL_PRIOR_UNASSIMILATED',
                pipelineNotes: `Active trigger criteria: ${selectedSignal.indicator}. Dissemination blocked pending multi-year validation gate.`,
              }
            : undefined
        }
      />
    </section>
  );
};
