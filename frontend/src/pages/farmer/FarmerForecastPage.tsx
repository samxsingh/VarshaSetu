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
  Info,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { HorizonSelector } from '../../components/forecast/HorizonSelector';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { forecastService, ScientificForecastRecord } from '../../services/forecastService';
import { ForecastHorizonDays } from '@shared/types';

export const FarmerForecastPage: React.FC = () => {
  const { t } = useTranslation();
  const { horizon, setHorizon, location } = useFarmerStore();
  const [openWhyId, setOpenWhyId] = useState<string | null>(null);
  const [forecasts, setForecasts] = useState<ScientificForecastRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const toggleWhy = (id: string) => {
    setOpenWhyId(openWhyId === id ? null : id);
  };

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        setLoading(true);
        const res = await forecastService.getForecasts({
          horizon: horizon,
          block_id: 'UP_LKO_BKT',
        });
        if (res.success && res.data?.forecasts) {
          setForecasts(res.data.forecasts);
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchForecasts();
  }, [horizon]);

  // Map icons for standard targets
  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'HEAVY_RAIN':
        return <CloudLightning className="w-5 h-5 text-brand-azure" />;
      case 'DRY_SPELL':
        return <SunMedium className="w-5 h-5 text-brand-amber" />;
      case 'MONSOON_ONSET':
        return <CloudRain className="w-5 h-5 text-brand-teal" />;
      case 'RAINFALL_AMOUNT':
        return <TrendingUp className="w-5 h-5 text-indigo-600" />;
      default:
        return <CloudRain className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="farmer-forecast-page">
      {/* 1. Header Card with Prominent Scientific Honesty Banners */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading font-bold text-xl text-slate-900">
                Hyperlocal Scientific Forecast Products
              </h1>
              <Badge variant="amber" size="sm">
                Diagnostic forecast — not operational
              </Badge>
              <Badge variant="neutral" size="sm">
                Historical dataset — not current weather
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 inline" />
              Location: {location.village}, {location.block}, {location.district} District (Block centroid UP_LKO_BKT, ~9 km gridded)
            </p>
          </div>

          <HorizonSelector value={horizon} onChange={setHorizon} />
        </div>
      </Card>

      {/* 2. Scientific Disclosure & Non-Operational Truth Notice */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 space-y-1.5 leading-relaxed">
          <div className="font-semibold text-amber-900 flex items-center gap-2">
            Scientific Meteorological Scope Notice (Phase 4E)
            <Badge variant="amber" size="sm" className="font-mono text-[10px]">
              DIAGNOSTIC ONLY
            </Badge>
          </div>
          <p>
            Forecasts displayed below are raw scientific model outputs evaluated on the historical Kharif 2024 observation record.
            Because operational multi-year validation requires ≥5 complete seasons, operational certification remains gated.
          </p>
          <p className="text-[11px] text-amber-800">
            • Note: These are meteorological probabilities and rainfall amounts. Agronomic decision advice (such as whether to sow, spray, irrigate, or harvest) is intentionally excluded from this forecast layer and will be provided by the Agronomic Rules Engine in Phase 5.
          </p>
        </div>
      </div>

      {/* 3. Target Forecasts Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-600" />
          <span className="text-xs font-medium">Loading scientific forecast models...</span>
        </div>
      ) : forecasts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forecasts.map((fc) => {
            const isWhyOpen = openWhyId === fc.forecast_id;
            const prob = fc.prediction.probability !== null && fc.prediction.probability !== undefined
              ? Math.round(fc.prediction.probability * 100)
              : null;
            const isContinuous = fc.prediction.predicted_value !== null && fc.prediction.predicted_value !== undefined;

            return (
              <Card key={fc.forecast_id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-surface-border">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-surface-muted border border-surface-border">
                        {getTargetIcon(fc.target.target_type)}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-sm text-slate-900">
                          {fc.target.target_type.replace(/_/g, ' ')}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-medium font-mono">
                          {fc.horizon.horizon_days}-Day Horizon ({fc.valid_from} → {fc.valid_until})
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        fc.scientific_disclosure.status === 'OPERATIONAL'
                          ? 'emerald'
                          : fc.scientific_disclosure.status === 'DIAGNOSTIC_ONLY'
                          ? 'amber'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {fc.scientific_disclosure.status}
                    </Badge>
                  </div>

                  {/* Main Metric Section */}
                  <div className="my-4">
                    {prob !== null ? (
                      <div>
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="text-xs font-semibold text-slate-600">Event Probability</span>
                          <strong className="font-heading font-bold text-2xl text-slate-900">
                            {prob}%
                          </strong>
                        </div>
                        <Progress value={prob} color="teal" height="sm" />
                        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                          <span>Category: <strong className="text-slate-700">{fc.prediction.category}</strong></span>
                          <span>Calibration: <strong className="font-mono text-slate-600">{fc.calibration.status}</strong></span>
                        </div>
                      </div>
                    ) : isContinuous ? (
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-semibold text-slate-600">Expected Rainfall</span>
                          <strong className="font-heading font-bold text-2xl text-indigo-700">
                            {fc.prediction.predicted_value?.toFixed(1)} mm
                          </strong>
                        </div>
                        {fc.uncertainty.status === 'CALCULATED' && (
                          <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 flex justify-between">
                            <span>Uncertainty (P10–P90):</span>
                            <span className="font-mono font-semibold text-slate-800">
                              {fc.uncertainty.lower_bound} mm — {fc.uncertainty.upper_bound} mm
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Model & Metadata Bar */}
                  <div className="p-2.5 bg-surface-muted/60 rounded-lg border border-surface-border text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Model: <strong className="font-mono text-slate-700">{fc.model.model_id}</strong> ({fc.model.model_family})</span>
                      <span>Validation: <strong className="font-mono text-amber-800">{fc.validation.validation_status}</strong></span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Resolution: {fc.location.spatial_resolution} (~9 km)</span>
                      <span>Freshness: {fc.data.freshness_status}</span>
                    </div>
                  </div>
                </div>

                {/* Progressive Scientific Explanation Drawer */}
                <div className="pt-3 border-t border-surface-border mt-4">
                  <button
                    onClick={() => toggleWhy(fc.forecast_id)}
                    className="w-full flex items-center justify-between text-xs font-heading font-semibold text-brand-teal hover:text-brand-teal-dark"
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Why this forecast? (Evidence & Model Signals)
                    </span>
                    {isWhyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isWhyOpen && (
                    <div className="mt-2.5 p-3 rounded-lg bg-white border border-surface-border text-[11px] text-slate-600 leading-relaxed space-y-2 animate-fadeIn">
                      <div className="font-semibold text-slate-800">Associated Model Signals (SHAP Contributions):</div>
                      {fc.explainability.top_features && fc.explainability.top_features.length > 0 ? (
                        <div className="space-y-1 font-mono text-[10px]">
                          {fc.explainability.top_features.map((feat) => (
                            <div key={feat.feature} className="flex justify-between p-1 bg-slate-50 rounded">
                              <span className="font-sans font-medium text-slate-700">{feat.description}</span>
                              <span className={feat.direction === 'elevates' ? 'text-emerald-700' : 'text-slate-500'}>
                                {feat.direction === 'elevates' ? '+' : ''}{feat.shap_value.toFixed(3)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">
                          Empirical climatological baseline comparison applied.
                        </p>
                      )}

                      <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
                        * Feature contributions indicate statistical model correlation, not agronomic causality.
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-500">
          <p className="text-xs">No forecast records available for horizon {horizon} days.</p>
        </Card>
      )}
    </div>
  );
};
