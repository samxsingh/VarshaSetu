import React, { useState } from 'react';
import { HorizonSelector } from '../forecast/HorizonSelector';
import { ForecastHorizonDays } from '@shared/types';
import { Cpu, ChevronDown, ChevronUp, ShieldAlert, Radio, HelpCircle, Layers, BarChart3, Database } from 'lucide-react';

export const GovForecastWorkspace: React.FC = () => {
  const [horizon, setHorizon] = useState<ForecastHorizonDays>(7);
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  const forecastSignals = [
    {
      id: 'FCST_SIG_01',
      target: 'HEAVY RAINFALL (> 64.5 mm)',
      block: 'Bakshi Ka Talab (UP_LKO_BKT)',
      probability: 58.4,
      model: 'LightGBM-Isotonic-Ensemble',
      calibration: 'Isotonic Regression',
      brierScore: 0.114,
      grounding: 'UP_LKO_BKT (122 Records)',
      status: 'DIAGNOSTIC ONLY',
      observedSignal: '850 hPa relative humidity anomaly detected in Kharif 2024 archive coupled with convective vorticity surge.',
      scientificLimitation: 'Single-station empirical grounding (UP_LKO_BKT). Operational delivery blocked pending multi-year validation.',
    },
    {
      id: 'FCST_SIG_02',
      target: 'DRY SPELL BREAK (>= 5 Days)',
      block: 'Malihabad (UP_LKO_MLH)',
      probability: 74.0,
      model: 'XGBoost-Isotonic-Calibrated',
      calibration: 'Isotonic Regression',
      brierScore: 0.128,
      grounding: 'Spatial Prior (EPSG:4326)',
      status: 'DIAGNOSTIC ONLY',
      observedSignal: 'Weakening monsoon trough axis leading to extended rainfall hiatus during early Kharif vegetative phase.',
      scientificLimitation: 'Interpolated prior from Bakshi Ka Talab centroid. Unassimilated station record.',
    },
    {
      id: 'FCST_SIG_03',
      target: 'MONSOON ONSET SURGE',
      block: 'Mohanlalganj (UP_LKO_MHL)',
      probability: 84.0,
      model: 'GradientBoosted-Platt-Calibrated',
      calibration: 'Platt Scaling (Sigmoid)',
      brierScore: 0.098,
      grounding: 'Spatial Prior (EPSG:4326)',
      status: 'DIAGNOSTIC ONLY',
      observedSignal: 'Monsoon surge index crossing 3.2 threshold with positive equatorial moisture advection.',
      scientificLimitation: 'Diagnostic scenario indicator. Requires ground truth station telemetry integration.',
    },
  ];

  return (
    <section id="forecasts" className="space-y-4">
      {/* Workspace Header */}
      <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 shadow-[4px_4px_0px_#0B1726] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#008F83] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              FORECAST MONITORING
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[10px] font-mono font-bold">
              DIAGNOSTIC WORKSPACE
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#0B1726] mt-1 tracking-tight">
            Scientific Downscaling & Calibration Oversight
          </h2>
          <p className="text-xs text-[#435466]">
            Examine probabilistic weather signals, calibrated reliability curves, and explainability evidence across evaluation horizons
          </p>
        </div>

        <HorizonSelector value={horizon} onChange={setHorizon} />
      </div>

      {/* Forecast Signal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {forecastSignals.map((sig) => {
          const isExpanded = expandedSignal === sig.id;
          return (
            <div
              key={sig.id}
              className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 shadow-[4px_4px_0px_#0B1726] flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-transform"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between pb-2 border-b border-[#0B1726]/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#62768A] block">
                      {sig.id} • {horizon}-Day Horizon
                    </span>
                    <h3 className="font-heading font-extrabold text-sm text-[#0B1726]">
                      {sig.target}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[9px] font-mono font-bold">
                    {sig.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#62768A]">Calibrated Likelihood</span>
                    <div className="font-mono font-black text-2xl text-[#008F83]">
                      {sig.probability}%
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-[#435466] font-mono">
                    <div>Brier: {sig.brierScore}</div>
                    <div className="text-[#62768A] text-[10px]">{sig.calibration}</div>
                  </div>
                </div>

                {/* Progress Visualizer */}
                <div className="w-full bg-[#F7F3EA] h-2 rounded-full overflow-hidden border border-[#0B1726]/15">
                  <div
                    className="bg-[#008F83] h-full rounded-full"
                    style={{ width: `${sig.probability}%` }}
                  />
                </div>

                <div className="text-xs text-[#435466] space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span className="text-[#62768A]">Block Centroid:</span>
                    <strong className="text-[#0B1726] font-medium">{sig.block}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#62768A]">Model Architecture:</span>
                    <span className="font-mono text-[#0B1726] text-[11px]">{sig.model}</span>
                  </div>
                </div>
              </div>

              {/* Expandable "WHY THIS SIGNAL?" */}
              <div className="pt-2 border-t border-[#0B1726]/10">
                <button
                  type="button"
                  onClick={() => setExpandedSignal(isExpanded ? null : sig.id)}
                  className="w-full flex items-center justify-between text-xs font-heading font-bold text-[#008F83] hover:text-[#0B1726] py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why This Signal?
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#F7F3EA] border border-[#0B1726]/15 text-xs space-y-2">
                    <div>
                      <span className="font-heading font-bold text-[10px] uppercase text-[#62768A] block">
                        Observed Signal Basis:
                      </span>
                      <p className="text-[#0B1726] text-[11px] leading-relaxed mt-0.5">
                        {sig.observedSignal}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-[#0B1726]/10">
                      <span className="font-heading font-bold text-[10px] uppercase text-[#9A6218] block">
                        Scientific Limitation:
                      </span>
                      <p className="text-[#9A6218] text-[11px] leading-relaxed mt-0.5">
                        {sig.scientificLimitation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
