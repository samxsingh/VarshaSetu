import React from 'react';
import { ClimateSignalCard } from '../../components/analyst/ClimateSignalCard';
import { ProvenanceCard } from '../../components/analyst/ProvenanceCard';
import {
  Activity,
  Cpu,
  Layers,
  Database,
  Compass,
  ArrowRight,
  ShieldAlert,
  Wind,
  Droplets,
  Waves,
  Globe2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnalystOverviewPage: React.FC = () => {
  const researchStages = [
    { id: '01', name: 'CLIMATE SIGNAL', desc: 'ENSO, IOD, MJO planetary telemetry', to: '/analyst' },
    { id: '02', name: 'ATMOSPHERE', desc: '850 hPa jet & precipitable water', to: '/analyst' },
    { id: '03', name: 'DOWNSCALING', desc: '0.25° GFS grid downscaled to block', to: '/analyst/models' },
    { id: '04', name: 'FORECAST LAB', desc: 'Multi-horizon probability distributions', to: '/analyst/forecast-lab' },
    { id: '05', name: 'CALIBRATION', desc: 'Isotonic regression & Platt scaling', to: '/analyst/forecast-lab' },
    { id: '06', name: 'AGRONOMIC RISK', desc: 'Phenological sensitivity indicators', to: '/officer/advisories' },
  ];

  return (
    <div className="space-y-6" data-testid="analyst-overview-page">
      {/* 1. Research Overview Header */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#102A43]">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: Editorial Heading */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#0E7490] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                01 RESEARCH OVERVIEW
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#E8F4F6] text-[#155E75] text-[10px] font-mono font-bold border border-[#0E7490]/30">
                SCIENTIFIC TELEMETRY
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102A43] tracking-tight">
              Inspect the signals behind the forecast.
            </h1>
            <p className="text-xs sm:text-sm text-[#486581] leading-relaxed">
              Trace climate signals, atmospheric diagnostics, model behavior, calibration, and scientific provenance through one analytical workspace.
            </p>
          </div>

          {/* Right: Scientific Scope Panel */}
          <div className="bg-[#F3F6F7] border-2 border-[#102A43] rounded-xl p-4 shadow-[2px_2px_0px_#102A43] space-y-2 self-start lg:w-80 shrink-0 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#102A43]/15">
              <span className="font-heading font-extrabold text-[10px] uppercase tracking-wider text-[#102A43]">
                Scientific Scope
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FEF3C7] border border-[#D97706] text-[#B45309] text-[9px] font-mono font-bold">
                DIAGNOSTIC ONLY
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-[#829AB1] block text-[9px] uppercase">Anchor</span>
                <strong className="text-[#102A43]">UP_LKO_BKT</strong>
              </div>
              <div>
                <span className="text-[#829AB1] block text-[9px] uppercase">Archive</span>
                <strong className="text-[#102A43]">Kharif 2024</strong>
              </div>
              <div>
                <span className="text-[#829AB1] block text-[9px] uppercase">Records</span>
                <strong className="text-[#0891B2]">122 Daily Obs</strong>
              </div>
              <div>
                <span className="text-[#829AB1] block text-[9px] uppercase">Resolution</span>
                <strong className="text-[#102A43]">BLOCK (~9 km)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Intelligence Strip */}
        <div className="mt-5 pt-4 border-t-2 border-[#102A43]/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="p-2.5 bg-[#F3F6F7] rounded-lg border border-[#102A43]/10">
            <span className="text-[9px] font-mono uppercase text-[#829AB1] block">Ground Anchor</span>
            <strong className="font-mono font-bold text-[#102A43] block">UP_LKO_BKT</strong>
          </div>
          <div className="p-2.5 bg-[#F3F6F7] rounded-lg border border-[#102A43]/10">
            <span className="text-[9px] font-mono uppercase text-[#829AB1] block">Observation Archive</span>
            <strong className="font-mono font-bold text-[#102A43] block">Kharif 2024</strong>
          </div>
          <div className="p-2.5 bg-[#F3F6F7] rounded-lg border border-[#102A43]/10">
            <span className="text-[9px] font-mono uppercase text-[#829AB1] block">Forecast Horizons</span>
            <strong className="font-mono font-bold text-[#0E7490] block">7D, 14D, 21D, 30D</strong>
          </div>
          <div className="p-2.5 bg-[#F3F6F7] rounded-lg border border-[#102A43]/10">
            <span className="text-[9px] font-mono uppercase text-[#829AB1] block">Calibration State</span>
            <strong className="font-mono font-bold text-[#0E7490] block">Enforced (Isotonic)</strong>
          </div>
          <div className="p-2.5 bg-[#F3F6F7] rounded-lg border border-[#102A43]/10">
            <span className="text-[9px] font-mono uppercase text-[#829AB1] block">Spatial Grid</span>
            <strong className="font-mono font-bold text-[#102A43] block">Block (~9 km)</strong>
          </div>
          <div className="p-2.5 bg-[#F3F6F7] rounded-lg border border-[#102A43]/10">
            <span className="text-[9px] font-mono uppercase text-[#829AB1] block">Operational Mode</span>
            <strong className="font-mono font-bold text-[#B45309] block">DIAGNOSTIC ONLY</strong>
          </div>
        </div>
      </div>

      {/* 2. Visual Research Pipeline */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#102A43]/10">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0E7490]" />
            <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#102A43]">
              End-to-End Scientific Translation Architecture
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#829AB1]">6 Pipeline Nodes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {researchStages.map((stage) => (
            <Link
              key={stage.id}
              to={stage.to}
              className="p-3 bg-[#F3F6F7] hover:bg-white rounded-xl border-2 border-[#102A43]/15 hover:border-[#102A43] transition-all flex flex-col justify-between space-y-2 group shadow-xs hover:shadow-[2px_2px_0px_#102A43]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-xs text-[#0E7490]">{stage.id}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#829AB1] group-hover:text-[#0E7490] group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <strong className="font-heading font-extrabold text-xs text-[#102A43] block leading-tight">
                  {stage.name}
                </strong>
                <p className="text-[10px] text-[#486581] mt-0.5 leading-snug">
                  {stage.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Global Climate Teleconnections */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-4 shadow-[4px_4px_0px_#102A43]">
        <ClimateSignalCard />
      </div>

      {/* 4. Atmospheric Analysis Workspace */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#102A43]/10 gap-2">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-[#0E7490]" />
            <h3 className="font-heading font-extrabold text-base text-[#102A43]">
              Atmospheric Circulation & Boundary Layer Dynamics
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-[#FEF3C7] border border-[#D97706] text-[#B45309] text-[10px] font-mono font-bold">
            DIAGNOSTIC INDICATORS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-[10px] uppercase text-[#829AB1]">
                850 hPa Low-Level Jet
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#E8F4F6] text-[#0E7490] text-[9px] font-mono font-bold">
                NORMAL FLUX
              </span>
            </div>
            <div className="font-mono font-bold text-lg text-[#102A43]">
              14.2 m/s Westerly
            </div>
            <p className="text-[11px] text-[#486581] leading-snug">
              Cross-equatorial Somali jet axis position aligns with typical active monsoon onset trajectories over northern plains.
            </p>
          </div>

          <div className="p-3.5 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-[10px] uppercase text-[#829AB1]">
                Total Precipitable Water (TPW)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#E8F4F6] text-[#155E75] text-[9px] font-mono font-bold">
                ELEVATED
              </span>
            </div>
            <div className="font-mono font-bold text-lg text-[#0E7490]">
              54.8 mm Depth
            </div>
            <p className="text-[11px] text-[#486581] leading-snug">
              Column-integrated tropospheric water vapor content exceeds convective trigger threshold (&gt;= 50 mm) for Central UP.
            </p>
          </div>

          <div className="p-3.5 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-[10px] uppercase text-[#829AB1]">
                Monsoon Trough Latitude
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] text-[9px] font-mono font-bold">
                SOUTH OF NORMAL
              </span>
            </div>
            <div className="font-mono font-bold text-lg text-[#D97706]">
              24.6° N Axis
            </div>
            <p className="text-[11px] text-[#486581] leading-snug">
              Trough positioned slightly south of normal Gangetic alignment, suppressing immediate convective activity over Lucknow.
            </p>
          </div>
        </div>

        {/* Interpretation Boundary */}
        <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#102A43]/15 text-xs text-[#486581] leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#0E7490] shrink-0 mt-0.5" />
          <p>
            <strong className="text-[#102A43]">Scientific Interpretation Boundary:</strong> Atmospheric variables reflect diagnostic indicators from observational archives and ECMWF/GFS boundary conditions. They do not constitute deterministic forecasts or causal proof of precipitation onset.
          </p>
        </div>
      </div>

      {/* 5. Feature Attribution Architecture (SHAP) */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#102A43]/10">
          <div>
            <h3 className="font-heading font-extrabold text-base text-[#102A43]">
              Feature Importance & Driver Attribution (SHAP Architecture)
            </h3>
            <span className="text-[11px] text-[#829AB1]">
              Model Explanation ≠ Causal Explanation • TreeSHAP Local Attributions
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-[#E8F4F6] text-[#155E75] text-[10px] font-mono font-bold border border-[#0E7490]/30">
            Model Registry v1.0.0
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <span className="font-heading font-bold text-[#829AB1] uppercase tracking-wider text-[10px] block">
            Configured Feature Inputs for Downscaling Engine:
          </span>

          {[
            { name: 'MJO Phase & Amplitude (Wheeler-Hendon RMM Coordinates)', source: 'NOAA CPC / BoM', weight: 'High' },
            { name: '850 hPa Cross-Equatorial Low-Level Westerly Jet Speed', source: 'NCMRWF / IMD Telemetry', weight: 'High' },
            { name: 'Niño 3.4 Sea Surface Temperature Anomaly (°C)', source: 'NOAA CPC Monthly', weight: 'Moderate' },
            { name: 'Total Precipitable Water (TPW) Moisture Depth', source: 'INSAT-3D Satellite Radiometer', weight: 'Critical' },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#F3F6F7] rounded-xl flex items-center justify-between border border-[#102A43]/10"
            >
              <div>
                <span className="font-heading font-bold text-[#102A43] block text-xs">{feat.name}</span>
                <span className="text-[10px] text-[#829AB1] font-mono">Source: {feat.source}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white border border-[#102A43]/15 font-mono text-[10px] text-[#102A43]">
                Importance: {feat.weight}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Scientific Provenance Evidence Ledger */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-4 shadow-[4px_4px_0px_#102A43]">
        <ProvenanceCard />
      </div>
    </div>
  );
};
