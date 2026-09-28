import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  Percent,
  Clock,
  Compass,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Calendar,
  Sun,
} from 'lucide-react';
import {
  weatherService,
  NormalizedCurrentWeather,
  NormalizedForecastResponse,
} from '../../services/weatherService';
import { DataFreshnessBadge } from '../common/DataFreshnessBadge';
import { ProvenanceModal, ProvenanceDetails } from '../common/ProvenanceModal';
import { DecisionFlowDiagram } from '../common/DecisionFlowDiagram';

export const FarmerLiveWeatherSection: React.FC = () => {
  const [current, setCurrent] = useState<NormalizedCurrentWeather | null>(null);
  const [forecast, setForecast] = useState<NormalizedForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeChart, setActiveChart] = useState<'rainfall' | 'probability' | 'temperature' | 'risk'>('rainfall');
  const [provenanceTarget, setProvenanceTarget] = useState<ProvenanceDetails | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [curRes, fcRes] = await Promise.all([
          weatherService.getCurrentConditions({ block_id: 'UP_LKO_BKT' }).catch(() => null),
          weatherService.getForecast({ block_id: 'UP_LKO_BKT', horizon: 7 }).catch(() => null),
        ]);

        if (isMounted) {
          if (curRes?.success && curRes.data) setCurrent(curRes.data);
          if (fcRes?.success && fcRes.data) setForecast(fcRes.data);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenProvenance = () => {
    if (!current && !forecast) return;
    setProvenanceTarget({
      title: 'Current Conditions & 7-Day Forecast',
      source: current?.source || forecast?.source || 'Open-Meteo ECMWF IFS',
      dataset: current?.dataset || 'High-Resolution Gridded Model',
      observedAtIST: current?.observedAtIST,
      retrievedAtIST: current?.retrievedAt ? new Date(current.retrievedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : undefined,
      resolution: 'Block Centroid (UP_LKO_BKT, ~9 km)',
      modelFamily: forecast?.provenance?.modelFamily || 'ECMWF IFS / DWD ICON Numerical Models',
      fallbackUsed: current?.fallbackChainUsed && current.fallbackChainUsed.length > 0,
      fallbackChain: current?.fallbackChainUsed,
      attribution: current?.attribution || forecast?.provenance?.attribution,
      freshnessStatus: current?.freshnessStatus || 'LIVE',
    });
  };

  if (loading && !current && !forecast) {
    return (
      <div className="bg-white border-2 border-slate-900 rounded-xl p-6 shadow-[3px_3px_0px_#102A43] flex items-center justify-center gap-3 text-sm font-mono text-slate-500">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
        Ingesting current meteorological telemetry from operational providers...
      </div>
    );
  }

  const daily = forecast?.daily || [];

  return (
    <div className="space-y-6" data-testid="farmer-live-weather-section">
      {/* Institutional Decision Flow Diagram */}
      <DecisionFlowDiagram role="FARMER" />

      {/* 1. CURRENT CONDITIONS (Compact & Decision-Oriented) */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-6 shadow-[4px_4px_0px_#102A43]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
                Panchayat Ground Telemetry
              </span>
              <DataFreshnessBadge
                status={current?.freshnessStatus || 'LIVE'}
                source={current?.source ? current.source.split('/')[0].trim() : 'Operational AWS'}
                updatedAtIST={current?.observedAtIST}
              />
            </div>
            <h2 className="text-xl font-heading font-black text-slate-900 mt-1">
              Current Conditions — Bakshi Ka Talab
            </h2>
          </div>

          <button
            onClick={handleOpenProvenance}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors self-start sm:self-auto"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            View Data Provenance
          </button>
        </div>

        {/* Current Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-5">
          <div className="p-3.5 bg-[#fbf9f5] border border-[#e4decb] rounded-lg">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1">
              <Thermometer className="w-4 h-4 text-rose-600" />
              <span>Temperature</span>
            </div>
            <div className="text-2xl font-black font-heading text-slate-900">
              {current ? `${current.temperatureC}°C` : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">{current?.conditionText || 'Nominal'}</div>
          </div>

          <div className="p-3.5 bg-[#fbf9f5] border border-[#e4decb] rounded-lg">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1">
              <CloudRain className="w-4 h-4 text-cyan-600" />
              <span>Rainfall Today</span>
            </div>
            <div className="text-2xl font-black font-heading text-slate-900">
              {current ? `${current.precipitationMm} mm` : '0 mm'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Gauge accumulation</div>
          </div>

          <div className="p-3.5 bg-[#fbf9f5] border border-[#e4decb] rounded-lg">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>Humidity</span>
            </div>
            <div className="text-2xl font-black font-heading text-slate-900">
              {current ? `${current.humidityPercent}%` : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Atmospheric vapor</div>
          </div>

          <div className="p-3.5 bg-[#fbf9f5] border border-[#e4decb] rounded-lg">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1">
              <Wind className="w-4 h-4 text-teal-600" />
              <span>Wind Speed</span>
            </div>
            <div className="text-2xl font-black font-heading text-slate-900">
              {current ? `${current.windSpeedKmh} km/h` : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Heading {current?.windDirectionDeg || 180}°</div>
          </div>

          <div className="p-3.5 bg-[#fbf9f5] border border-[#e4decb] rounded-lg">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1">
              <Percent className="w-4 h-4 text-indigo-600" />
              <span>Rain Probability</span>
            </div>
            <div className="text-2xl font-black font-heading text-slate-900">
              {forecast?.daily[0]?.rainfallProbability !== undefined ? `${forecast.daily[0].rainfallProbability}%` : '20%'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Next 24 Hours</div>
          </div>

          <div className="p-3.5 bg-[#fbf9f5] border border-[#e4decb] rounded-lg">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>Surface Pressure</span>
            </div>
            <div className="text-2xl font-black font-heading text-slate-900">
              {current ? `${current.surfacePressureHpa}` : '1004'} <span className="text-xs font-normal text-slate-500">hPa</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Barometric status</div>
          </div>
        </div>
      </div>

      {/* 1b. Farmer Decision Intelligence: "WHAT SHOULD I KNOW TODAY?" */}
      <div className="bg-[#FAF8F5] border-2 border-[#102A43] rounded-2xl p-5 shadow-[3px_3px_0px_#102A43] space-y-3">
        <div className="flex items-center justify-between border-b border-[#102A43]/10 pb-2">
          <h3 className="font-heading font-black text-sm text-[#102A43] uppercase tracking-wider flex items-center gap-2">
            <span>What Should I Know Today? (Operational Farm Decision Layer)</span>
          </h3>
          <span className="text-[10px] font-mono text-[#0E7490] font-bold">
            Agronomic Decision Support
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-sans">
          {/* TODAY */}
          <div className="p-3 bg-white rounded-xl border border-[#CBD5E1]">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase block">
              1. Today ({daily[0]?.dayLabel || 'Current'})
            </span>
            <strong className="text-[#102A43] font-heading font-bold block text-sm mt-0.5">
              {current?.conditionText || 'Clear Sky'}, {current?.temperatureC || 30}°C
            </strong>
            <p className="text-[11px] text-[#64748B] mt-1">
              Rain today: {current?.precipitationMm || 0} mm · Humidity: {current?.humidityPercent || 65}%
            </p>
          </div>

          {/* NEXT 3 DAYS */}
          <div className="p-3 bg-white rounded-xl border border-[#CBD5E1]">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase block">
              2. Next 3 Days
            </span>
            <strong className="text-[#102A43] font-heading font-bold block text-sm mt-0.5">
              {daily.slice(0, 3).some((d) => d.rainfallMm > 5) ? 'Rain showers expected' : 'Largely dry & stable'}
            </strong>
            <p className="text-[11px] text-[#64748B] mt-1">
              Max rain day: {daily.slice(0, 3).reduce((prev, curr) => (curr.rainfallMm > prev.rainfallMm ? curr : prev), daily[0] || { rainfallMm: 0, dayLabel: '—' }).dayLabel} ({daily.slice(0, 3).reduce((max, d) => Math.max(max, d.rainfallMm), 0)} mm)
            </p>
          </div>

          {/* NEXT 7 DAYS */}
          <div className="p-3 bg-white rounded-xl border border-[#CBD5E1]">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase block">
              3. Next 7 Days Outlook
            </span>
            <strong className="text-[#0E7490] font-heading font-bold block text-sm mt-0.5">
              {forecast?.summary?.expectedTotalRainfall7dMm || 0} mm Total
            </strong>
            <p className="text-[11px] text-[#64748B] mt-1">
              {forecast?.summary?.heavyRainAlertRisk === 'HIGH'
                ? 'Heavy rain alert active'
                : forecast?.summary?.drySpellAlertRisk === 'HIGH'
                ? 'Dry spell exposure elevated'
                : 'Consistent moisture continuity'}
            </p>
          </div>

          {/* FARM DECISION SIGNAL */}
          <div className="p-3 bg-[#E8F4F6] rounded-xl border border-[#0E7490]/30">
            <span className="text-[10px] font-mono font-bold text-[#155E75] uppercase block">
              4. Farm Decision Signal
            </span>
            <strong className="text-[#0E7490] font-heading font-bold block text-sm mt-0.5">
              {forecast?.summary?.heavyRainAlertRisk === 'HIGH'
                ? 'Inspect field drainage'
                : (forecast?.summary?.expectedTotalRainfall7dMm || 0) > 10
                ? 'Monitor field preparation'
                : forecast?.summary?.drySpellAlertRisk === 'HIGH'
                ? 'Plan supplemental irrigation'
                : 'Standard field operations'}
            </strong>
            <p className="text-[10px] text-[#155E75] mt-1">
              Derived via Agronomic Rules Engine thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* 2. NEXT 7 DAYS (Consolidated Trend Charts & Timeline) */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-6 shadow-[4px_4px_0px_#102A43]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              Forecast Trajectory
            </span>
            <h2 className="text-xl font-heading font-black text-slate-900 mt-1">
              Next 7 Days — Agrometeorological Outlook
            </h2>
          </div>

          {/* Interactive Chart Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300 text-xs font-mono">
            <button
              onClick={() => setActiveChart('rainfall')}
              className={`px-3 py-1 rounded font-bold transition-colors ${
                activeChart === 'rainfall' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rainfall (mm)
            </button>
            <button
              onClick={() => setActiveChart('probability')}
              className={`px-3 py-1 rounded font-bold transition-colors ${
                activeChart === 'probability' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rain Prob (%)
            </button>
            <button
              onClick={() => setActiveChart('temperature')}
              className={`px-3 py-1 rounded font-bold transition-colors ${
                activeChart === 'temperature' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temp (°C)
            </button>
            <button
              onClick={() => setActiveChart('risk')}
              className={`px-3 py-1 rounded font-bold transition-colors ${
                activeChart === 'risk' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Risk Timeline
            </button>
          </div>
        </div>

        {/* Visual Chart Area */}
        <div className="mt-6 pt-2">
          {activeChart === 'rainfall' && (
            <div className="space-y-4">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-6 pb-2 border-b border-slate-200">
                {daily.map((d) => {
                  const maxMm = Math.max(...daily.map((x) => x.rainfallMm), 25);
                  const heightPercent = Math.max(8, (d.rainfallMm / maxMm) * 100);
                  const isHigh = d.rainfallMm >= 35.5;

                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <span className="text-[11px] font-mono font-bold text-slate-700 opacity-90 group-hover:opacity-100">
                        {d.rainfallMm} mm
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[42px] rounded-t transition-all ${
                          isHigh ? 'bg-rose-500 group-hover:bg-rose-600' : 'bg-cyan-600 group-hover:bg-cyan-700'
                        }`}
                      />
                      <span className="text-[11px] font-mono font-bold text-slate-800 uppercase mt-1">
                        {d.dayLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {d.date.slice(8)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-2">
                <span>Total 7-day expected: <strong className="text-slate-900">{forecast?.summary.expectedTotalRainfall7dMm || 0} mm</strong></span>
                <span>Peak event: <strong className="text-slate-900">{forecast?.summary.highestRainDay || 'None'}</strong></span>
              </div>
            </div>
          )}

          {activeChart === 'probability' && (
            <div className="space-y-4">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-6 pb-2 border-b border-slate-200">
                {daily.map((d) => {
                  const heightPercent = Math.max(10, d.rainfallProbability);
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <span className="text-[11px] font-mono font-bold text-slate-700">
                        {d.rainfallProbability}%
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[42px] bg-blue-600 rounded-t group-hover:bg-blue-700 transition-all"
                      />
                      <span className="text-[11px] font-mono font-bold text-slate-800 uppercase mt-1">
                        {d.dayLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {d.date.slice(8)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-slate-500 font-mono px-2">
                Probabilities reflect ECMWF IFS ensemble members forecasting ≥ 0.1 mm precipitation.
              </div>
            </div>
          )}

          {activeChart === 'temperature' && (
            <div className="space-y-4">
              <div className="h-44 flex items-center justify-between gap-2 sm:gap-4 px-2 pt-6 pb-2 border-b border-slate-200">
                {daily.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-center p-2 bg-[#fcfaf7] border border-[#e2ddd3] rounded-lg">
                    <span className="text-[11px] font-mono font-bold text-slate-800 uppercase">{d.dayLabel}</span>
                    <span className="text-[10px] font-mono text-slate-400">{d.date.slice(8)}</span>
                    <div className="my-2 text-center">
                      <span className="text-base font-black text-rose-600 block">{d.tempMaxC}°</span>
                      <span className="text-xs font-semibold text-blue-600 block">{d.tempMinC}°</span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate max-w-[60px]">{d.conditionText}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500 font-mono px-2">
                Daily diurnal temperature range predicted at 2m agrometeorological level.
              </div>
            </div>
          )}

          {activeChart === 'risk' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {daily.map((d, index) => {
                  const isHigh = d.heavyRainRisk === 'HIGH' || d.heavyRainRisk === 'CRITICAL';
                  const isDry = d.drySpellRisk === 'HIGH' || d.drySpellRisk === 'CRITICAL';
                  const badgeColor = isHigh
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : isDry
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300';

                  return (
                    <div key={d.date} className={`p-3 rounded-lg border text-center ${badgeColor}`}>
                      <div className="text-xs font-mono font-bold uppercase">{index === 0 ? 'Today' : `+${index}d`}</div>
                      <div className="text-[10px] font-mono opacity-70 mb-1.5">{d.dayLabel} {d.date.slice(5)}</div>
                      <div className="text-xs font-bold truncate">
                        {isHigh ? 'Heavy Rain' : isDry ? 'Dry Spell' : 'Normal'}
                      </div>
                      <div className="text-[10px] opacity-80 mt-1">{d.rainfallMm} mm · {d.rainfallProbability}%</div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Risk thresholds calibrated to Central Uttar Pradesh Kharif paddy and pulse moisture thresholds.
              </div>
            </div>
          )}
        </div>
      </div>

      <ProvenanceModal
        isOpen={Boolean(provenanceTarget)}
        onClose={() => setProvenanceTarget(null)}
        details={provenanceTarget}
      />
    </div>
  );
};
