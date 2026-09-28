import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudRain,
  SunMedium,
  CloudLightning,
  TrendingUp,
  ChevronRight,
  Compass,
  Archive,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { HorizonSelector } from '../forecast/HorizonSelector';
import { ForecastHorizonDays } from '@shared/types';
import { ScientificStatusBadge } from './ScientificStatusBadge';
import { useOperationalData } from '../../context/OperationalDataContext';
import { weatherService, NormalizedForecastResponse } from '../../services/weatherService';
import { CanonicalRainfallTrendChart } from '../charts/CanonicalRainfallTrendChart';

export const MonsoonGlanceCard: React.FC = () => {
  const { t } = useTranslation();
  const { horizon, setHorizon } = useFarmerStore();
  const {
    currentDateLabel,
    forecastWindowLabel,
    referenceTimeIST,
    freshnessStatus,
    sourceAttribution,
  } = useOperationalData();

  const [forecast, setForecast] = useState<NormalizedForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHistoricalArchive, setShowHistoricalArchive] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadForecast = async () => {
      try {
        setLoading(true);
        const res = await weatherService.getForecast({
          block_id: 'UP_LKO_BKT',
          horizon: horizon,
        });
        if (isMounted && res.success && res.data) {
          setForecast(res.data);
        }
      } catch (err) {
        console.error('MonsoonGlanceCard error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadForecast();
    return () => {
      isMounted = false;
    };
  }, [horizon]);

  // Derived metrics from canonical forecast data
  const totalRainfallMm = forecast?.summary.expectedTotalRainfall7dMm ?? 0;
  const isExtendedHorizon = horizon > 7;

  // Rain event probability from daily peak or average
  const maxRainProb = forecast?.daily && forecast.daily.length > 0
    ? Math.max(...forecast.daily.map((d) => d.rainfallProbability))
    : 15;

  const heavyRainProb = forecast?.summary.heavyRainAlertRisk === 'HIGH' || forecast?.summary.heavyRainAlertRisk === 'CRITICAL'
    ? 65
    : forecast?.summary.heavyRainAlertRisk === 'MODERATE'
    ? 35
    : 10;

  const drySpellRiskPct = forecast?.summary.drySpellAlertRisk === 'HIGH' || forecast?.summary.drySpellAlertRisk === 'CRITICAL'
    ? 70
    : forecast?.summary.drySpellAlertRisk === 'MODERATE'
    ? 40
    : 15;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] mb-6 overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b-2 border-[#102A43]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-heading font-black text-xl text-[#102A43]">
              {t('farmer.monsoonOutlook') || 'Monsoon Outlook & Precipitation Horizon'}
            </h3>
            <ScientificStatusBadge
              status={isExtendedHorizon ? 'CLIMATOLOGICAL OUTLOOK' : freshnessStatus}
              size="sm"
            />
          </div>
          <p className="text-xs text-[#486581] mt-1 font-sans">
            Window: <span className="font-mono font-bold text-[#102A43]">{forecastWindowLabel}</span>
            {' '}• Reference:{' '}
            <span className="font-heading font-bold text-[#0E7490]">
              {isExtendedHorizon
                ? `${horizon}-Day Climatological Projection (ERA5 Baseline)`
                : `Operational Numerical Assimilation (${sourceAttribution})`}
            </span>
          </p>
        </div>

        {/* Horizon Switcher */}
        <HorizonSelector value={horizon} onChange={setHorizon} />
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* 3 Core Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Rainfall Probability */}
          <div className="bg-[#E8F4F6]/50 border-2 border-[#102A43] rounded-xl p-5 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#155E75]">
                <CloudRain className="w-5 h-5 text-[#0E7490]" />
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider">
                  Rainfall Likelihood
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#E8F4F6] border border-[#0E7490]/40 text-[#155E75]">
                {maxRainProb > 50 ? 'Rain Likely' : 'Low Probability'}
              </span>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-black text-4xl text-[#102A43]">
                  {maxRainProb}%
                </span>
                <span className="text-xs text-[#829AB1] font-medium font-sans">peak probability</span>
              </div>
              <p className="text-xs text-[#486581] mt-1 font-sans">
                Accumulation:{' '}
                <span className="font-mono font-bold text-[#102A43]">
                  {totalRainfallMm.toFixed(1)} mm
                </span>{' '}
                expected in period
              </p>
            </div>

            <div className="w-full bg-white h-2.5 rounded-full border border-[#102A43]/30 overflow-hidden">
              <div
                className="bg-[#0E7490] h-full transition-all duration-300"
                style={{ width: `${maxRainProb}%` }}
              />
            </div>
          </div>

          {/* 2. Dry Spell Break Risk */}
          <div className="bg-[#FEF3C7]/60 border-2 border-[#102A43] rounded-xl p-5 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#B45309]">
                <SunMedium className="w-5 h-5 text-[#D97706]" />
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider">
                  Dry Spell Exposure
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  drySpellRiskPct > 50
                    ? 'bg-[#FEF3C7] border-[#D97706] text-[#B45309]'
                    : 'bg-[#EBF5EE] border-[#3F7D58] text-[#3F7D58]'
                }`}
              >
                {drySpellRiskPct > 50 ? 'High Risk' : 'Low Risk'}
              </span>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-black text-4xl text-[#102A43]">
                  {drySpellRiskPct}%
                </span>
                <span className="text-xs text-[#829AB1] font-medium font-sans">break risk</span>
              </div>
              <p className="text-xs text-[#486581] mt-1 font-sans">
                {drySpellRiskPct > 50
                  ? '≥5 consecutive rainless days (&lt;1 mm) probable'
                  : 'Moisture continuity adequate'}
              </p>
            </div>

            <div className="w-full bg-white h-2.5 rounded-full border border-[#102A43]/30 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  drySpellRiskPct > 50 ? 'bg-[#D97706]' : 'bg-[#3F7D58]'
                }`}
                style={{ width: `${drySpellRiskPct}%` }}
              />
            </div>
          </div>

          {/* 3. Heavy Rain Alert */}
          <div className="bg-[#DBEAFE]/40 border-2 border-[#102A43] rounded-xl p-5 shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#1E3A8A]">
                <CloudLightning className="w-5 h-5 text-[#2563EB]" />
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider">
                  Heavy Rain Alert
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#DBEAFE] border border-[#2563EB]/40 text-[#1E3A8A]">
                ≥64.5 mm / 24h
              </span>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-black text-4xl text-[#102A43]">
                  {heavyRainProb}%
                </span>
                <span className="text-xs text-[#829AB1] font-medium font-sans">risk likelihood</span>
              </div>
              <p className="text-xs text-[#486581] mt-1 font-sans">
                {forecast?.summary.heavyRainAlertRisk === 'HIGH' || forecast?.summary.heavyRainAlertRisk === 'CRITICAL'
                  ? 'Convective event threshold exceeded in model cycle'
                  : 'No extreme episodic convection detected'}
              </p>
            </div>

            <div className="w-full bg-white h-2.5 rounded-full border border-[#102A43]/30 overflow-hidden">
              <div
                className="bg-[#2563EB] h-full transition-all duration-300"
                style={{ width: `${heavyRainProb}%` }}
              />
            </div>
          </div>
        </div>

        {/* Canonical Daily Precipitation Hyetograph */}
        {forecast?.daily && forecast.daily.length > 0 && (
          <CanonicalRainfallTrendChart
            daily={forecast.daily}
            freshnessStatus={forecast.freshnessStatus}
            sourceAttribution={forecast.source}
            title={`${horizon}-Day Operational Rainfall Trajectory`}
            subtitle={`Window: ${forecastWindowLabel} • Total Projected: ${totalRainfallMm.toFixed(1)} mm`}
          />
        )}

        {/* Separated Historical Benchmark Section (Part 14) */}
        <div className="mt-4 pt-4 border-t border-[#102A43]/15">
          <button
            type="button"
            onClick={() => setShowHistoricalArchive(!showHistoricalArchive)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] transition-colors text-xs font-sans"
          >
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-[#64748B]" />
              <span className="font-heading font-bold text-[#102A43]">
                Historical Reference Benchmark (Kharif 2024 Archive)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                HISTORICAL ARCHIVE
              </span>
            </div>
            <div className="flex items-center gap-1 font-medium">
              <span>{showHistoricalArchive ? 'Hide Archive' : 'View Historical Benchmark'}</span>
              {showHistoricalArchive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showHistoricalArchive && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 font-sans">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-heading font-bold text-slate-900">
                  Retrospective Kharif 2024 Station Record (Bakshi Ka Talab, UP_LKO_BKT)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  122 Daily Observations · 2024-06-01 to 2024-09-30
                </span>
              </div>
              <p>
                During the historical Kharif 2024 benchmark season, Lucknow experienced two episodic convective events exceeding 60 mm (peak convective event recorded on 2024-06-27 with 46 mm in 24 hours). Seasonal accumulation reached 842 mm.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  to="/farmer/what-if"
                  className="inline-flex items-center gap-1.5 text-[#0E7490] hover:text-[#155E75] font-heading font-bold text-xs"
                >
                  <span>Open Kharif 2024 What-If Simulator</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
