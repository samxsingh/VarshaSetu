import React, { useState } from 'react';
import { NormalizedDailyForecast, FreshnessClassification } from '../../services/weatherService';
import { CloudRain, Info, Droplets } from 'lucide-react';

interface Props {
  daily: NormalizedDailyForecast[];
  freshnessStatus?: FreshnessClassification;
  sourceAttribution?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const CanonicalRainfallTrendChart: React.FC<Props> = ({
  daily,
  freshnessStatus = 'LIVE',
  sourceAttribution = 'Open-Meteo / ECMWF IFS & DWD ICON',
  title = '7-Day Operational Rainfall Trajectory',
  subtitle,
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!daily || daily.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-[#CBD5E1] p-6 text-center text-[#64748B] ${className}`}>
        <CloudRain className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
        <p className="font-heading font-medium text-sm">Forecast trajectory unavailable</p>
        <p className="text-xs text-[#94A3B8] mt-1">Awaiting next numerical weather model assimilation cycle</p>
      </div>
    );
  }

  const maxRainfall = Math.max(...daily.map((d) => d.rainfallMm), 10);
  const totalRainfall = daily.reduce((acc, d) => acc + d.rainfallMm, 0);

  return (
    <div className={`bg-white rounded-2xl border-2 border-[#102A43] shadow-[3px_3px_0px_#102A43] p-5 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-heading font-bold text-base sm:text-lg text-[#102A43]">
              {title}
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8F4F6] text-[#0E7490] border border-[#0E7490]/30 font-bold uppercase">
              {freshnessStatus}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-sans">
            {subtitle || `7-Day Expected District Accumulation: ${totalRainfall.toFixed(1)} mm`}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-[#64748B] block truncate max-w-[240px]">
            {sourceAttribution}
          </span>
          <span className="text-[10px] font-mono text-[#0E7490] font-bold">
            IMD / WMO Thresholds Applied
          </span>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="pt-6 pb-2">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44">
          {daily.map((day, idx) => {
            const heightPct = Math.max((day.rainfallMm / maxRainfall) * 100, 6);
            const isHovered = hoveredIdx === idx;
            const isHeavy = day.heavyRainRisk === 'HIGH' || day.heavyRainRisk === 'CRITICAL';
            const isDry = day.rainfallMm < 1.0;

            return (
              <div
                key={day.date}
                className="flex flex-col items-center h-full justify-end cursor-pointer group relative"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-16 z-20 bg-[#102A43] text-white p-2 rounded-lg shadow-lg text-[11px] whitespace-nowrap font-mono pointer-events-none">
                    <p className="font-bold text-white">{day.dayLabel}, {day.date}</p>
                    <p className="text-[#38BDF8]">Rain: {day.rainfallMm} mm ({day.rainfallProbability}%)</p>
                    <p className="text-[#94A3B8]">Temp: {day.tempMinC}°C – {day.tempMaxC}°C</p>
                  </div>
                )}

                {/* Rain mm label above bar */}
                <span className="text-[10px] sm:text-xs font-mono font-bold text-[#102A43] mb-1">
                  {day.rainfallMm > 0 ? `${day.rainfallMm}` : '0'}
                </span>

                {/* Bar */}
                <div className="w-full bg-[#F1F5F9] rounded-t-lg h-36 flex items-end overflow-hidden border border-[#CBD5E1]">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all duration-300 ${
                      isHeavy
                        ? 'bg-[#2563EB]'
                        : isDry
                        ? 'bg-[#E2E8F0]'
                        : 'bg-[#0E7490]'
                    } ${isHovered ? 'brightness-110 ring-2 ring-[#0E7490]' : ''}`}
                  />
                </div>

                {/* Day and Date label below bar */}
                <div className="text-center mt-2">
                  <span className="block text-xs font-heading font-bold text-[#102A43]">
                    {day.dayLabel}
                  </span>
                  <span className="block text-[10px] font-mono text-[#64748B]">
                    {day.date.slice(8)}
                  </span>
                </div>

                {/* Probability pill */}
                <span className="text-[9px] font-mono text-[#0E7490] mt-0.5">
                  {day.rainfallProbability}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Scientific Thresholds */}
      <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between text-[11px] text-[#64748B] font-sans gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0E7490]" />
            <span>Normal Rain (&lt;64.5 mm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
            <span>Heavy Rain Alert (≥64.5 mm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#E2E8F0] border border-[#CBD5E1]" />
            <span>Dry (&lt;1.0 mm)</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-[#0E7490]">
          Units: mm / 24h Accumulation
        </span>
      </div>
    </div>
  );
};
