import React, { useState, useEffect } from 'react';
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
  Cpu,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { HorizonSelector } from '../../components/forecast/HorizonSelector';
import { forecastService, ScientificForecastRecord } from '../../services/forecastService';
import { eventService, ForecastEvent } from '../../services/eventService';
import { ScientificStatusBadge } from '../../components/farmer/ScientificStatusBadge';

export const FarmerForecastPage: React.FC = () => {
  const { t } = useTranslation();
  const { horizon, setHorizon, location } = useFarmerStore();
  const [openWhyId, setOpenWhyId] = useState<string | null>(null);
  const [forecasts, setForecasts] = useState<ScientificForecastRecord[]>([]);
  const [activeEvents, setActiveEvents] = useState<ForecastEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const toggleWhy = (id: string) => {
    setOpenWhyId(openWhyId === id ? null : id);
  };

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
  }, [horizon]);

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'HEAVY_RAIN':
        return <CloudLightning className="w-5 h-5 text-[#3B82F6]" />;
      case 'DRY_SPELL':
        return <SunMedium className="w-5 h-5 text-[#E5A33D]" />;
      case 'MONSOON_ONSET':
        return <CloudRain className="w-5 h-5 text-[#008F83]" />;
      case 'RAINFALL_AMOUNT':
        return <TrendingUp className="w-5 h-5 text-[#006B65]" />;
      default:
        return <CloudRain className="w-5 h-5 text-[#0B1726]" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="farmer-forecast-page">
      {/* 1. Header Card with Prominent Scientific Honesty Banners */}
      <div className="bg-white rounded-2xl border-2 border-[#0B1726] p-6 shadow-[4px_4px_0px_#0B1726]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#0B1726] tracking-tight">
                Hyperlocal Scientific Forecast Products
              </h1>
              <span className="px-2.5 py-1 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-xs font-mono font-bold uppercase tracking-wider">
                Diagnostic forecast — not operational
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#F7F3EA] border border-[#0B1726]/20 text-[#435466] text-xs font-mono font-bold uppercase tracking-wider">
                Historical dataset — not current weather
              </span>
            </div>
            <p className="text-xs text-[#435466] flex items-center gap-1.5 font-sans">
              <MapPin className="w-3.5 h-3.5 text-[#008F83] shrink-0" />
              <span>Location: {location.village}, {location.block}, {location.district} District (Block centroid UP_LKO_BKT, ~9 km gridded)</span>
            </p>
          </div>

          <HorizonSelector value={horizon} onChange={setHorizon} />
        </div>
      </div>

      {/* 2. Scientific Disclosure & Non-Operational Truth Notice */}
      <div className="p-5 bg-[#FEF6E9] border-2 border-[#0B1726] rounded-xl shadow-[3px_3px_0px_#0B1726] flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-[#E5A33D] shrink-0 mt-0.5" />
        <div className="text-xs text-[#7A4B00] space-y-1.5 leading-relaxed font-sans">
          <div className="font-heading font-black text-sm text-[#0B1726] flex items-center gap-2">
            <span>Scientific Meteorological Scope Notice (Phase 4E)</span>
            <ScientificStatusBadge status="DIAGNOSTIC ONLY" size="sm" />
          </div>
          <p>
            Forecasts displayed below are raw scientific model outputs evaluated on the historical Kharif 2024 observation record.
            Because operational multi-year validation requires ≥5 complete seasons, operational certification remains gated.
          </p>
          <p className="text-[11px] text-[#9A6218]">
            • Note: These are meteorological probabilities and rainfall amounts. Agronomic decision advice is intentionally excluded from this forecast layer and provided separately by the Agronomic Rules Engine in Phase 5.
          </p>
        </div>
      </div>

      {/* 2b. Non-Operational Meteorological Risk Indicators */}
      {activeEvents.length > 0 && (
        <div className="p-5 bg-[#DCEFF0] border-2 border-[#0B1726] rounded-xl shadow-[3px_3px_0px_#0B1726] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#006B65]" />
              <h2 className="font-heading font-bold text-sm text-[#0B1726]">
                Active Meteorological Scientific Indicators ({activeEvents.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/70 border border-[#0B1726]/20 text-[10px] font-mono font-bold text-[#006B65]">
                NON-OPERATIONAL METEOROLOGICAL NOTICE
              </span>
              <span className="px-2 py-0.5 rounded bg-white/70 border border-[#0B1726]/20 text-[10px] font-mono font-bold text-[#62768A]">
                BROADCASTING DISABLED
              </span>
            </div>
          </div>
          <p className="text-xs text-[#006B65] leading-relaxed font-sans">
            The system has identified meteorological threshold conditions matching scientific event definitions.
            <strong> Note:</strong> Production SMS/WhatsApp alerting is inactive and agronomic advice is excluded from this meteorological forecast layer.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {activeEvents.map((evt) => (
              <div key={evt.event_id} className="p-3 bg-white rounded-lg border border-[#0B1726]/20 flex items-start justify-between text-xs">
                <div>
                  <div className="font-heading font-bold text-[#0B1726] flex items-center gap-2">
                    <span>{evt.event_type.replace(/_/g, ' ')}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F7F3EA] border border-[#0B1726]/20">
                      {evt.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#435466] mt-1 font-sans">{evt.description}</p>
                  <p className="text-[10px] text-[#62768A] font-mono mt-0.5">
                    Validity: {evt.valid_from} → {evt.valid_until} | State: {evt.state}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Target Forecasts Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-[#62768A]">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-[#008F83]" />
          <span className="text-xs font-heading font-bold">Loading scientific forecast models...</span>
        </div>
      ) : forecasts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forecasts.map((fc) => {
            const isWhyOpen = openWhyId === fc.forecast_id;
            const prob = fc.prediction.probability !== null && fc.prediction.probability !== undefined
              ? Math.round(fc.prediction.probability * 100)
              : null;
            const isContinuous = fc.prediction.predicted_value !== null && fc.prediction.predicted_value !== undefined;

            return (
              <div
                key={fc.forecast_id}
                className="bg-white rounded-2xl border-2 border-[#0B1726] p-6 shadow-[4px_4px_0px_#0B1726] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b-2 border-[#0B1726]/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#F7F3EA] border border-[#0B1726]/15">
                        {getTargetIcon(fc.target.target_type)}
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-base text-[#0B1726]">
                          {fc.target.target_type.replace(/_/g, ' ')}
                        </h3>
                        <span className="text-[11px] text-[#62768A] font-medium font-mono">
                          {fc.horizon.horizon_days}-Day Horizon ({fc.valid_from} → {fc.valid_until})
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218]">
                      {fc.scientific_disclosure.status}
                    </span>
                  </div>

                  {/* Main Metric Section */}
                  <div className="my-5">
                    {prob !== null ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-heading font-bold text-[#435466] uppercase tracking-wider">
                            Event Probability
                          </span>
                          <strong className="font-heading font-black text-3xl sm:text-4xl text-[#0B1726]">
                            {prob}%
                          </strong>
                        </div>
                        {/* Neo-brutalist Progress Bar */}
                        <div className="w-full bg-[#F7F3EA] h-3 rounded-full border border-[#0B1726]/30 overflow-hidden">
                          <div
                            className="bg-[#008F83] h-full transition-all duration-300"
                            style={{ width: `${prob}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-[#62768A] pt-1">
                          <span>Category: <strong className="text-[#0B1726]">{fc.prediction.category}</strong></span>
                          <span>Calibration: <strong className="font-mono text-[#006B65]">{fc.calibration.status}</strong></span>
                        </div>
                      </div>
                    ) : isContinuous ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-heading font-bold text-[#435466] uppercase tracking-wider">
                            Expected Rainfall
                          </span>
                          <strong className="font-heading font-black text-3xl sm:text-4xl text-[#008F83]">
                            {fc.prediction.predicted_value?.toFixed(1)} mm
                          </strong>
                        </div>
                        {fc.uncertainty.status === 'CALCULATED' && (
                          <div className="p-2.5 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15 text-[11px] text-[#435466] flex justify-between">
                            <span>Uncertainty (P10–P90):</span>
                            <span className="font-mono font-bold text-[#0B1726]">
                              {fc.uncertainty.lower_bound} mm — {fc.uncertainty.upper_bound} mm
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Model & Metadata Bar */}
                  <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15 text-[11px] text-[#435466] space-y-1.5 font-sans">
                    <div className="flex justify-between">
                      <span>Model: <strong className="font-mono text-[#0B1726]">{fc.model.model_id}</strong> ({fc.model.model_family})</span>
                      <span>Validation: <strong className="font-mono text-[#9A6218]">{fc.validation.validation_status}</strong></span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[#62768A]">
                      <span>Resolution: {fc.location.spatial_resolution} (~9 km)</span>
                      <span>Freshness: {fc.data.freshness_status}</span>
                    </div>
                  </div>
                </div>

                {/* Progressive Scientific Explanation Drawer */}
                <div className="pt-3 border-t-2 border-[#0B1726]/10 mt-5">
                  <button
                    onClick={() => toggleWhy(fc.forecast_id)}
                    className="w-full flex items-center justify-between text-xs font-heading font-bold text-[#008F83] hover:text-[#006B65] transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Why this forecast? (Evidence & Model Signals)
                    </span>
                    {isWhyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isWhyOpen && (
                    <div className="mt-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#0B1726]/20 text-[11px] text-[#435466] leading-relaxed space-y-2">
                      <div className="font-heading font-bold text-xs text-[#0B1726]">
                        Associated Model Signals (SHAP Contributions):
                      </div>
                      {fc.explainability.top_features && fc.explainability.top_features.length > 0 ? (
                        <div className="space-y-1 font-mono text-[10px]">
                          {fc.explainability.top_features.map((feat) => (
                            <div key={feat.feature} className="flex justify-between p-1.5 bg-white rounded border border-[#0B1726]/10">
                              <span className="font-sans font-medium text-[#0B1726]">{feat.description}</span>
                              <span className={feat.direction === 'elevates' ? 'text-[#2F7D4A] font-bold' : 'text-[#62768A]'}>
                                {feat.direction === 'elevates' ? '+' : ''}{feat.shap_value.toFixed(3)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-[#62768A] italic">
                          Empirical climatological baseline comparison applied.
                        </p>
                      )}

                      <div className="text-[10px] text-[#62768A] border-t border-[#0B1726]/10 pt-2">
                        * Feature contributions indicate statistical model correlation, not agronomic causality.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-[#0B1726] shadow-[3px_3px_0px_#0B1726] p-8 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-xl bg-[#F7F3EA] border-2 border-[#0B1726] text-[#008F83] mx-auto flex items-center justify-center shadow-[1.5px_1.5px_0px_#0B1726]">
            <CloudRain className="w-6 h-6" />
          </div>
          <h4 className="font-heading font-black text-sm text-[#0B1726]">NO OBSERVATIONS FOR SELECTED WINDOW</h4>
          <p className="text-xs text-[#435466] max-w-md mx-auto leading-relaxed">
            The historical Kharif 2024 archive currently does not have active risk forecasts generated for the {horizon}-day horizon window. Select a 3-day or 7-day window to view calibrated model outputs.
          </p>
        </div>
      )}
    </div>
  );
};
