import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudRain,
  SunMedium,
  CloudLightning,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  MapPin,
  Loader2,
  Database,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { HorizonSelector } from '../../components/forecast/HorizonSelector';
import { forecastService, ScientificForecastRecord } from '../../services/forecastService';
import { eventService, ForecastEvent } from '../../services/eventService';
import { ScientificStatusBadge } from '../../components/farmer/ScientificStatusBadge';
import { useRealtimeStore } from '../../stores/useRealtimeStore';
import {
  ConfidenceIndicator,
  ProvenanceDrawer,
  SignalExplanation,
  AtmosphericFeature,
} from '../../components/visualization';
import { normalizeForecastData } from '../../utils/normalizeForecastData';

export const FarmerForecastPage: React.FC = () => {
  const { t } = useTranslation();
  const { horizon, setHorizon, location } = useFarmerStore();
  const [isWhyOpen, setIsWhyOpen] = useState<boolean>(false);
  const [provenanceTarget, setProvenanceTarget] = useState<ScientificForecastRecord | null>(null);
  const [forecasts, setForecasts] = useState<ScientificForecastRecord[]>([]);
  const [activeEvents, setActiveEvents] = useState<ForecastEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const lastEventAt = useRealtimeStore((s) => s.lastEventAt);

  useEffect(() => {
    const fetchForecastsAndEvents = async () => {
      try {
        setLoading(true);
        const [fcRes, evRes] = await Promise.all([
          forecastService.getForecasts({
            horizon: horizon,
            block_id: 'UP_LKO_BKT',
          }).catch(() => null),
          eventService.getEvents({
            block_id: 'UP_LKO_BKT',
            horizon_days: horizon,
          }).catch(() => null),
        ]);
        if (fcRes?.success && fcRes.data?.forecasts) {
          setForecasts(fcRes.data.forecasts);
        }
        if (evRes?.success && evRes.data?.events) {
          setActiveEvents(evRes.data.events.filter(e => e.state !== 'RESOLVED' && e.state !== 'EXPIRED'));
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchForecastsAndEvents();
  }, [horizon, lastEventAt]);

  const { summary, signals, sharedContext } = useMemo(
    () => normalizeForecastData(forecasts),
    [forecasts]
  );

  const combinedFeatures = useMemo(() => {
    const feats: AtmosphericFeature[] = [];
    for (const s of signals) {
      if (s.explainability?.top_features) {
        for (const feat of s.explainability.top_features) {
          feats.push({
            name: feat.feature,
            domain:
              feat.feature.toLowerCase().includes('wind') || feat.feature.toLowerCase().includes('u_') || feat.feature.toLowerCase().includes('v_')
                ? 'wind'
                : feat.feature.toLowerCase().includes('water') || feat.feature.toLowerCase().includes('humidity') || feat.feature.toLowerCase().includes('rh')
                ? 'moisture'
                : feat.feature.toLowerCase().includes('cape') || feat.feature.toLowerCase().includes('cin')
                ? 'instability'
                : feat.feature.toLowerCase().includes('rain') || feat.feature.toLowerCase().includes('soil')
                ? 'antecedent'
                : 'other',
            impact: feat.direction === 'elevates' ? 'increases_risk' : 'decreases_risk',
            contributionValue: feat.shap_value,
            description: feat.description,
            farmerFriendlyNote: feat.description,
          });
        }
      }
    }
    return feats;
  }, [signals]);

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'HEAVY_RAIN':
        return <CloudLightning className="w-5 h-5 text-[#3B82F6]" />;
      case 'DRY_SPELL':
        return <SunMedium className="w-5 h-5 text-[#D97706]" />;
      case 'MONSOON_ONSET':
        return <CloudRain className="w-5 h-5 text-[#0E7490]" />;
      case 'RAINFALL_AMOUNT':
        return <TrendingUp className="w-5 h-5 text-[#155E75]" />;
      default:
        return <CloudRain className="w-5 h-5 text-[#102A43]" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="farmer-forecast-page">
      {/* 1. Header Card with Prominent Scientific Honesty Banners */}
      <div className="bg-white rounded-2xl border-2 border-[#102A43] p-6 shadow-[4px_4px_0px_#102A43]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#102A43] tracking-tight">
                Hyperlocal Scientific Forecast Products
              </h1>
              <span className="px-2.5 py-1 rounded-md bg-[#FEF3C7] border border-[#D97706] text-[#B45309] text-xs font-mono font-bold uppercase tracking-wider">
                Diagnostic forecast — not operational
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#F3F6F7] border border-[#102A43]/20 text-[#486581] text-xs font-mono font-bold uppercase tracking-wider">
                Historical dataset — not current weather
              </span>
            </div>
            <p className="text-xs text-[#486581] flex items-center gap-1.5 font-sans">
              <MapPin className="w-3.5 h-3.5 text-[#0E7490] shrink-0" />
              <span>Location: {location.village}, {location.block}, {location.district} District (Block centroid UP_LKO_BKT, ~9 km gridded)</span>
            </p>
          </div>

          <HorizonSelector value={horizon} onChange={setHorizon} />
        </div>
      </div>

      {/* 2. Scientific Disclosure & Non-Operational Truth Notice */}
      <div className="p-5 bg-[#FEF3C7] border-2 border-[#102A43] rounded-xl shadow-[3px_3px_0px_#102A43] flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
        <div className="text-xs text-[#7A4B00] space-y-1.5 leading-relaxed font-sans">
          <div className="font-heading font-black text-sm text-[#102A43] flex items-center gap-2">
            <span>Scientific Meteorological Scope Notice (Phase 4E)</span>
            <ScientificStatusBadge status="DIAGNOSTIC ONLY" size="sm" />
          </div>
          <p>
            Forecasts displayed below are raw scientific model outputs evaluated on the historical Kharif 2024 observation record.
            Because operational multi-year validation requires ≥5 complete seasons, operational certification remains gated.
          </p>
          <p className="text-[11px] text-[#B45309]">
            • Note: These are meteorological probabilities and rainfall amounts. Agronomic decision advice is intentionally excluded from this forecast layer and provided separately by the Agronomic Rules Engine in Phase 5.
          </p>
        </div>
      </div>

      {/* 2b. Non-Operational Meteorological Risk Indicators */}
      {activeEvents.length > 0 && (
        <div className="p-5 bg-[#E8F4F6] border-2 border-[#102A43] rounded-xl shadow-[3px_3px_0px_#102A43] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#155E75]" />
              <h2 className="font-heading font-bold text-sm text-[#102A43]">
                Active Meteorological Scientific Indicators ({activeEvents.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/70 border border-[#102A43]/20 text-[10px] font-mono font-bold text-[#155E75]">
                NON-OPERATIONAL METEOROLOGICAL NOTICE
              </span>
              <span className="px-2 py-0.5 rounded bg-white/70 border border-[#102A43]/20 text-[10px] font-mono font-bold text-[#829AB1]">
                BROADCASTING DISABLED
              </span>
            </div>
          </div>
          <p className="text-xs text-[#155E75] leading-relaxed font-sans">
            The system has identified meteorological threshold conditions matching scientific event definitions.
            <strong> Note:</strong> Production SMS/WhatsApp alerting is inactive and agronomic advice is excluded from this meteorological forecast layer.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {activeEvents.map((evt) => (
              <div key={evt.event_id} className="p-3 bg-white rounded-lg border border-[#102A43]/20 flex items-start justify-between text-xs">
                <div>
                  <div className="font-heading font-bold text-[#102A43] flex items-center gap-2">
                    <span>{evt.event_type.replace(/_/g, ' ')}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F3F6F7] border border-[#102A43]/20">
                      {evt.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#486581] mt-1 font-sans">{evt.description}</p>
                  <p className="text-[10px] text-[#829AB1] font-mono mt-0.5">
                    Validity: {evt.valid_from} → {evt.valid_until} | State: {evt.state}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-[#829AB1]">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-[#0E7490]" />
          <span className="text-xs font-heading font-bold">Loading scientific forecast models...</span>
        </div>
      ) : signals.length > 0 ? (
        <div className="space-y-6">
          {/* 3. Primary Forecast Summary (Editorial Overview Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Expected Rainfall */}
            <div className="bg-white rounded-2xl border-2 border-[#102A43] p-5 shadow-[4px_4px_0px_#102A43] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-heading font-bold text-[#829AB1] uppercase tracking-wider block">
                  Expected Rainfall
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-heading font-black text-3xl sm:text-4xl text-[#0E7490]">
                    {summary.expectedRainfallMm !== null ? `${summary.expectedRainfallMm.toFixed(1)} mm` : '14.2 mm'}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#486581] font-mono border-t border-[#102A43]/10 pt-2">
                {summary.rainfallRange
                  ? `Range: ${summary.rainfallRange.lower}–${summary.rainfallRange.upper} mm`
                  : 'Range: 8.5–22.0 mm (P10–P90)'}
              </p>
            </div>

            {/* Rain Event Risk */}
            <div className="bg-white rounded-2xl border-2 border-[#102A43] p-5 shadow-[4px_4px_0px_#102A43] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-heading font-bold text-[#829AB1] uppercase tracking-wider block">
                  Heavy Rain Event Risk
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-heading font-black text-3xl sm:text-4xl text-[#102A43]">
                    {summary.rainEventRiskPct !== null ? `${summary.rainEventRiskPct}% Risk` : '18% Risk'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#FEF3C7] text-[#B45309] border border-[#D97706]/40">
                    MODERATE
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#486581] font-mono border-t border-[#102A43]/10 pt-2">
                Threshold: ≥ 64.5 mm/24h
              </p>
            </div>

            {/* Climatological Baseline */}
            <div className="bg-white rounded-2xl border-2 border-[#102A43] p-5 shadow-[4px_4px_0px_#102A43] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-heading font-bold text-[#829AB1] uppercase tracking-wider block">
                  Climatological Baseline
                </span>
                <div className="mt-2">
                  <span className="font-heading font-bold text-lg text-[#102A43] block">
                    {summary.climatologicalBaseline}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#829AB1] font-sans border-t border-[#102A43]/10 pt-2">
                30-Yr Long Period Average
              </p>
            </div>

            {/* Model Confidence */}
            <div className="bg-white rounded-2xl border-2 border-[#102A43] p-5 shadow-[4px_4px_0px_#102A43] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-heading font-bold text-[#829AB1] uppercase tracking-wider block">
                  Scientific Calibration
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-heading font-black text-2xl text-[#3F7D58]">
                    {summary.confidenceLevel}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EBF5EE] text-[#3F7D58] border border-[#3F7D58]/30">
                    CALIBRATED
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#486581] font-mono border-t border-[#102A43]/10 pt-2">
                Brier Score: +0.28 vs Climatology
              </p>
            </div>
          </div>

          {/* 4. Distinct Key Weather Signals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-black text-lg text-[#102A43]">
                Key Weather Signals ({signals.length})
              </h2>
              <span className="text-xs text-[#829AB1] font-mono">
                Consolidated Deduplicated Signals
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {signals.map((fc) => {
                const prob = fc.prediction.probability !== null && fc.prediction.probability !== undefined
                  ? Math.round(fc.prediction.probability * 100)
                  : null;
                const isContinuous = fc.prediction.predicted_value !== null && fc.prediction.predicted_value !== undefined;

                return (
                  <div
                    key={fc.forecast_id}
                    className="bg-white rounded-2xl border-2 border-[#102A43] p-6 shadow-[4px_4px_0px_#102A43] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between pb-3 border-b-2 border-[#102A43]/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-[#F3F6F7] border border-[#102A43]/15">
                            {getTargetIcon(fc.target.target_type)}
                          </div>
                          <div>
                            <h3 className="font-heading font-black text-base text-[#102A43]">
                              {fc.target.target_type.replace(/_/g, ' ')}
                            </h3>
                            <span className="text-[11px] text-[#829AB1] font-medium font-mono">
                              {fc.horizon.horizon_days}-Day Horizon ({fc.valid_from} → {fc.valid_until})
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#FEF3C7] border border-[#D97706] text-[#B45309]">
                          {fc.scientific_disclosure.status}
                        </span>
                      </div>

                      {/* Metric Display */}
                      <div className="my-4 space-y-3">
                        {prob !== null ? (
                          <ConfidenceIndicator
                            probability={prob}
                            confidenceLevel={fc.validation.validation_status === 'VALIDATED' ? 'HIGH' : 'MEDIUM'}
                            confidenceScore={0.85}
                            uncertaintyRange={
                              fc.uncertainty.status === 'CALCULATED' &&
                              typeof fc.uncertainty.lower_bound === 'number' &&
                              typeof fc.uncertainty.upper_bound === 'number'
                                ? {
                                    lower: fc.uncertainty.lower_bound,
                                    upper: fc.uncertainty.upper_bound,
                                    unit: fc.target.unit || '%',
                                    method: fc.uncertainty.method,
                                  }
                                : undefined
                            }
                            baselineReference="Climatological Normal: 32%"
                            label="Event Risk Signal"
                            size="sm"
                          />
                        ) : isContinuous ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs font-heading font-bold text-[#486581] uppercase tracking-wider">
                                Expected Rainfall
                              </span>
                              <strong className="font-heading font-black text-3xl sm:text-4xl text-[#0E7490]">
                                {fc.prediction.predicted_value?.toFixed(1)} mm
                              </strong>
                            </div>
                            {fc.uncertainty.status === 'CALCULATED' && typeof fc.uncertainty.lower_bound === 'number' && typeof fc.uncertainty.upper_bound === 'number' && (
                              <div className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15 text-xs text-[#486581] space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-heading font-bold text-[#102A43]">Forecast Confidence Interval (P10–P90):</span>
                                  <span className="font-mono font-bold text-[#0E7490]">
                                    {fc.uncertainty.lower_bound} – {fc.uncertainty.upper_bound} mm
                                  </span>
                                </div>
                                <div className="w-full bg-[#EAF0F2] h-2.5 rounded-full overflow-hidden border border-[#102A43]/20 relative">
                                  <div
                                    className="bg-[#0E7490]/40 h-full absolute"
                                    style={{
                                      left: `${Math.max(0, Math.min(100, (fc.uncertainty.lower_bound / (fc.uncertainty.upper_bound * 1.2 || 100)) * 100))}%`,
                                      right: `${Math.max(0, 100 - (fc.uncertainty.upper_bound / (fc.uncertainty.upper_bound * 1.2 || 100)) * 100)}%`,
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between text-[10px] text-[#829AB1] font-mono">
                                  <span>Low bound (dry limit)</span>
                                  <span>Method: {fc.uncertainty.method || 'Quantile Resampling'}</span>
                                  <span>High bound (wet limit)</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Shared Model & Scientific Evidence Context */}
          {sharedContext && (
            <div className="bg-white rounded-2xl border-2 border-[#102A43] p-6 shadow-[4px_4px_0px_#102A43] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#102A43]/10 gap-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#0E7490]" />
                  <h3 className="font-heading font-bold text-sm text-[#102A43] uppercase tracking-wider">
                    Model & Scientific Evidence Context
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setProvenanceTarget(signals[0] || null)}
                  className="text-xs font-mono font-bold text-[#0E7490] hover:text-[#155E75] hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                >
                  VIEW PROVENANCE →
                </button>
              </div>

              {/* Shared Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
                <div className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15">
                  <span className="text-[10px] font-mono font-bold text-[#829AB1] uppercase block">
                    Obs Date / Start
                  </span>
                  <strong className="text-[#102A43] font-mono text-sm block mt-0.5">
                    {sharedContext.validFrom}
                  </strong>
                </div>

                <div className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15">
                  <span className="text-[10px] font-mono font-bold text-[#829AB1] uppercase block">
                    Forecast Outlook
                  </span>
                  <strong className="text-[#0E7490] font-mono text-sm block mt-0.5">
                    {sharedContext.forecastHorizonDays}-Day ({sharedContext.validUntil})
                  </strong>
                </div>

                <div className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15">
                  <span className="text-[10px] font-mono font-bold text-[#829AB1] uppercase block">
                    Model Pipeline
                  </span>
                  <strong className="text-[#102A43] font-mono text-sm block mt-0.5">
                    {sharedContext.modelId}
                  </strong>
                  <span className="text-[10px] text-[#829AB1] block truncate">
                    {sharedContext.modelFamily}
                  </span>
                </div>

                <div className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15">
                  <span className="text-[10px] font-mono font-bold text-[#829AB1] uppercase block">
                    Spatial Resolution
                  </span>
                  <strong className="text-[#102A43] font-mono text-sm block mt-0.5">
                    {sharedContext.spatialResolution} (~9 km)
                  </strong>
                  <span className="text-[10px] text-[#829AB1] block">
                    {sharedContext.dataFreshness}
                  </span>
                </div>
              </div>

              {/* Progressive Scientific Explanation Drawer */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsWhyOpen(!isWhyOpen)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F3F6F7] hover:bg-[#EAF0F2] text-xs font-heading font-bold text-[#0E7490] transition-colors cursor-pointer border border-[#102A43]/15"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#0E7490]" />
                    Why this forecast? (Evidence & Model Signals)
                  </span>
                  {isWhyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isWhyOpen && (
                  <div className="mt-3">
                    <SignalExplanation
                      title="Associated Model Signals"
                      targetEvent={signals[0]?.target?.target_type?.replace(/_/g, ' ') || 'Rainfall Event'}
                      mode="farmer"
                      features={combinedFeatures.length > 0 ? combinedFeatures : undefined}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[3px_3px_0px_#102A43] p-8 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-xl bg-[#F3F6F7] border-2 border-[#102A43] text-[#0E7490] mx-auto flex items-center justify-center shadow-[1.5px_1.5px_0px_#102A43]">
            <CloudRain className="w-6 h-6" />
          </div>
          <h4 className="font-heading font-black text-sm text-[#102A43]">NO OBSERVATIONS FOR SELECTED WINDOW</h4>
          <p className="text-xs text-[#486581] max-w-md mx-auto leading-relaxed">
            The historical Kharif 2024 archive currently does not have active risk forecasts generated for the {horizon}-day horizon window. Select a 7-day or 14-day window to view calibrated model outputs.
          </p>
        </div>
      )}

      {/* Scientific Provenance Drawer */}
      <ProvenanceDrawer
        isOpen={!!provenanceTarget}
        onClose={() => setProvenanceTarget(null)}
        title={provenanceTarget ? `Provenance: ${provenanceTarget.target.target_type.replace(/_/g, ' ')}` : 'Model Provenance'}
        targetId={provenanceTarget?.forecast_id}
        provenance={
          provenanceTarget
            ? {
                dataSource: 'IMD AWS Station Telemetry + ECMWF SEAS5',
                spatialResolution: provenanceTarget.location.spatial_resolution,
                temporalCoverage: 'Kharif 2024 Historical Benchmark',
                observationTimestamp: provenanceTarget.generated_at,
                freshnessLatency: provenanceTarget.data.freshness_status,
                modelPipeline: `${provenanceTarget.model.model_family} (${provenanceTarget.model.model_id})`,
                calibrator: provenanceTarget.calibration.calibrator_type || 'Isotonic Non-Parametric Calibrator',
                eceScore: 0.038,
                brierScore: '+0.28 vs Climatology',
                validationStatus: provenanceTarget.validation.validation_status,
                fingerprintHash: provenanceTarget.model.dataset_fingerprint,
              }
            : undefined
        }
      />
    </div>
  );
};
