import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  modelService,
  HindcastStatusResponse,
  HindcastGateResponse,
  HindcastFoldsResponse,
  HindcastResultsResponse,
  HindcastStabilityResponse,
  HindcastDriftResponse,
  HindcastCoverageResponse,
} from '../../services/modelService';
import {
  forecastService,
  ScientificForecastRecord,
  ForecastGateStatusResponse,
} from '../../services/forecastService';
import { HindcastSummaryPanel } from '../../components/analyst/HindcastSummaryPanel';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Loader2,
  AlertCircle,
  Database,
  Cpu,
  Layers,
  Activity,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  Sliders,
  CheckCircle2,
  FileText,
  TrendingUp,
  Info,
  BellRing,
} from 'lucide-react';

export const ForecastLabPage: React.FC = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'chain' | 'hindcasting'>('chain');

  // Forecast Pipeline State
  const [selectedTarget, setSelectedTarget] = useState<string>('HEAVY_RAIN');
  const [selectedHorizon, setSelectedHorizon] = useState<number>(7);
  const [selectedModel, setSelectedModel] = useState<string>('xgboost');
  const [referenceDate, setReferenceDate] = useState<string>('2024-09-15');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeChainStep, setActiveChainStep] = useState<number>(0);

  const [forecastGate, setForecastGate] = useState<ForecastGateStatusResponse | null>(null);
  const [generatedForecast, setGeneratedForecast] = useState<ScientificForecastRecord | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);

  // Hindcasting State (Phase 4D)
  const [loadingHindcast, setLoadingHindcast] = useState<boolean>(false);
  const [hindcastError, setHindcastError] = useState<string | null>(null);
  const [isExecutingHindcast, setIsExecutingHindcast] = useState<boolean>(false);
  const [status, setStatus] = useState<HindcastStatusResponse | null>(null);
  const [gate, setGate] = useState<HindcastGateResponse | null>(null);
  const [folds, setFolds] = useState<HindcastFoldsResponse | null>(null);
  const [results, setResults] = useState<HindcastResultsResponse | null>(null);
  const [stability, setStability] = useState<HindcastStabilityResponse | null>(null);
  const [drift, setDrift] = useState<HindcastDriftResponse | null>(null);
  const [coverage, setCoverage] = useState<HindcastCoverageResponse | null>(null);

  // Initial gate check
  useEffect(() => {
    const fetchGate = async () => {
      try {
        const res = await forecastService.getStatus();
        if (res.success && res.data) {
          setForecastGate(res.data);
        }
      } catch (err: any) {
        // Fallback gate info
      }
    };
    fetchGate();
  }, []);

  // Fetch Hindcasting data when tab is switched
  useEffect(() => {
    if (activeTab === 'hindcasting' && !status) {
      fetchHindcastData();
    }
  }, [activeTab, selectedTarget, selectedHorizon]);

  const fetchHindcastData = async () => {
    try {
      setLoadingHindcast(true);
      setHindcastError(null);

      const [
        statusRes,
        gateRes,
        foldsRes,
        resultsRes,
        stabilityRes,
        driftRes,
        coverageRes,
      ] = await Promise.all([
        modelService.getHindcastStatus().catch(() => null),
        modelService.getHindcastGate().catch(() => null),
        modelService.getHindcastFolds().catch(() => null),
        modelService.getHindcastResults(selectedTarget, selectedHorizon).catch(() => null),
        modelService.getHindcastStability(selectedTarget, selectedHorizon).catch(() => null),
        modelService.getHindcastDrift().catch(() => null),
        modelService.getHindcastCoverage().catch(() => null),
      ]);

      if (statusRes?.success && statusRes.data) setStatus(statusRes.data);
      if (gateRes?.success && gateRes.data) setGate(gateRes.data);
      if (foldsRes?.success && foldsRes.data) setFolds(foldsRes.data);
      if (resultsRes?.success && resultsRes.data) setResults(resultsRes.data);
      if (stabilityRes?.success && stabilityRes.data) setStability(stabilityRes.data);
      if (driftRes?.success && driftRes.data) setDrift(driftRes.data);
      if (coverageRes?.success && coverageRes.data) setCoverage(coverageRes.data);
    } catch (err: any) {
      setHindcastError(err?.message || 'Failed to load hindcast evaluation data.');
    } finally {
      setLoadingHindcast(false);
    }
  };

  const handleRunHindcast = async () => {
    try {
      setIsExecutingHindcast(true);
      await modelService.runHindcast({
        target_name: selectedTarget,
        horizon_days: selectedHorizon,
        block_id: 'UP_LKO_BKT',
      });
      await fetchHindcastData();
    } catch (err: any) {
      setHindcastError(err?.message || 'Failed to execute hindcast pipeline.');
    } finally {
      setIsExecutingHindcast(false);
    }
  };

  const handleGenerateForecast = async () => {
    try {
      setIsGenerating(true);
      setForecastError(null);

      const res = await forecastService.generateForecast({
        target_type: selectedTarget,
        horizon_days: selectedHorizon,
        model_type: selectedModel,
        block_id: 'UP_LKO_BKT',
        reference_date: referenceDate,
        request_explanation: true,
      });

      if (res.success && res.data) {
        setGeneratedForecast(res.data);
      } else {
        setForecastError('Forecast generation failed.');
      }
    } catch (err: any) {
      setForecastError(err?.message || 'Error executing forecast pipeline.');
    } finally {
      setIsGenerating(false);
    }
  };

  const chainSteps = [
    { id: 0, title: 'DATA', subtitle: 'IMD AWS + ERA5', icon: Database },
    { id: 1, title: 'FEATURES', subtitle: '19 Predictors', icon: Sliders },
    { id: 2, title: 'MODEL', subtitle: selectedModel.toUpperCase(), icon: Cpu },
    { id: 3, title: 'CALIBRATION', subtitle: 'Isotonic/Platt', icon: Activity },
    { id: 4, title: 'FORECAST', subtitle: 'Probabilistic Product', icon: TrendingUp },
    { id: 5, title: 'EXPLANATION', subtitle: 'SHAP Attribution', icon: FileText },
    { id: 6, title: 'VALIDATION', subtitle: 'Hindcast Gate', icon: ShieldAlert },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-border gap-2 pb-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('chain')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'chain'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Forecast Generator & Scientific Chain
          </button>
          <button
            onClick={() => setActiveTab('hindcasting')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'hindcasting'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            Multi-Year Hindcasting & Skill Evaluation
          </button>
        </div>

        <Link
          to="/analyst/alerts"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20 transition-colors self-start sm:self-auto"
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Alert Center & Lifecycle Engine</span>
        </Link>
      </div>

      {activeTab === 'hindcasting' ? (
        <div className="space-y-6">
          {hindcastError && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 flex items-center gap-3 text-amber-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{hindcastError}</span>
              </CardContent>
            </Card>
          )}

          {loadingHindcast && !status ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
              <span className="text-sm font-medium">Loading Hindcasting & Skill Evaluation Lab...</span>
            </div>
          ) : (
            <HindcastSummaryPanel
              status={status}
              gate={gate}
              folds={folds}
              results={results}
              stability={stability}
              drift={drift}
              coverage={coverage}
              selectedTarget={selectedTarget}
              selectedHorizon={selectedHorizon}
              onTargetChange={setSelectedTarget}
              onHorizonChange={setSelectedHorizon}
              onRunHindcast={handleRunHindcast}
              isExecuting={isExecutingHindcast}
            />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Operational Status & Gating Disclosure */}
          <Card className="p-4 bg-slate-900 text-white border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-sm text-white">
                    Operational Forecast Pipeline Gating
                  </h3>
                  <Badge variant="amber" size="sm">
                    {forecastGate?.system_status || 'DIAGNOSTIC_ONLY'}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    Kharif 2024 Archive
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Target location: <strong>Bakshi Ka Talab (UP_LKO_BKT)</strong>. Data freshness is restricted to historical archive (2024-06-01 to 2024-09-30). Live operational forecasting is locked until real-time weather telemetries pass quality gates.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                <div className="bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">OPERATIONAL STATE</span>
                  <span className="text-amber-400 font-bold">{forecastGate?.system_status || 'DIAGNOSTIC_ONLY'}</span>
                </div>
                <div className="bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">SPATIAL EXTENT</span>
                  <span className="text-indigo-300 font-bold">1 Block (9 km)</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Controls Bar */}
          <Card className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Scientific Target
                </label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="HEAVY_RAIN">Heavy Rainfall (&ge;64.5mm)</option>
                  <option value="DRY_SPELL">Dry Spell (&ge;5 dry days)</option>
                  <option value="MONSOON_ONSET">Monsoon Onset</option>
                  <option value="SEASONAL_RAINFALL">Seasonal Cumulative</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Forecast Horizon
                </label>
                <select
                  value={selectedHorizon}
                  onChange={(e) => setSelectedHorizon(Number(e.target.value))}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={3}>3-Day Short-Range</option>
                  <option value={7}>7-Day Medium-Range</option>
                  <option value={14}>14-Day Extended-Range</option>
                  <option value={30}>30-Day Monthly Outlook</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Model Family
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="xgboost">XGBoost (Calibrated GBDT)</option>
                  <option value="lightgbm">LightGBM (Hist Gradient)</option>
                  <option value="baseline_linear">Linear / Logistic Baseline</option>
                  <option value="climatology">Empirical Climatology</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reference Date (Historical)
                </label>
                <input
                  type="date"
                  value={referenceDate}
                  min="2024-06-01"
                  max="2024-09-30"
                  onChange={(e) => setReferenceDate(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <button
                  onClick={handleGenerateForecast}
                  disabled={isGenerating}
                  className="w-full text-xs font-bold py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Executing Chain...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Generate Forecast
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>

          {forecastError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-center gap-3 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{forecastError}</span>
              </CardContent>
            </Card>
          )}

          {/* Scientific Chain Pipeline Visualizer */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-heading font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Scientific Forecasting Chain
              </CardTitle>
              <p className="text-xs text-slate-600 mt-0.5">
                Every forecast must transit 7 transparent scientific stages without lookahead leakage or fabricated parameters.
              </p>
            </CardHeader>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
              {chainSteps.map((step, idx) => {
                const IconComponent = step.icon;
                const isSelected = activeChainStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveChainStep(step.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <IconComponent
                        className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}
                      />
                      <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                    </div>
                    <div className="font-heading font-bold text-xs text-slate-900">{step.title}</div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">{step.subtitle}</div>
                  </button>
                );
              })}
            </div>

            {/* Active Chain Step Details */}
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              {activeChainStep === 0 && (
                <div>
                  <div className="font-bold text-slate-900 mb-1">Stage 1: Observation & Data Ingestion</div>
                  <p className="text-slate-600">
                    Ingested from Bakshi Ka Talab AWS (IMD) paired with ERA5 reanalysis for atmospheric profiles.
                    Station coverage: 1 station. Temporal range: Kharif 2024 (122 records). Missingness rate: 0.0%. Dataset fingerprint verification ensures reproducibility.
                  </p>
                </div>
              )}
              {activeChainStep === 1 && (
                <div>
                  <div className="font-bold text-slate-900 mb-1">Stage 2: Deterministic Feature Engineering</div>
                  <p className="text-slate-600">
                    19 core meteorological predictors engineered with strict zero-lookahead audit. Includes synoptic pressure gradients, vertical velocity (w700), 850hPa zonal/meridional wind vectors, convective moisture, and antecedent rainfall anomalies.
                  </p>
                </div>
              )}
              {activeChainStep === 2 && (
                <div>
                  <div className="font-bold text-slate-900 mb-1">Stage 3: Statistical & ML Model Resolution</div>
                  <p className="text-slate-600">
                    Model: {selectedModel}. Resolved via Phase 4B gradient-boosted ensemble pipeline or Phase 4A baseline. Pre-trained weights checked against SHA-256 fingerprint hash.
                  </p>
                </div>
              )}
              {activeChainStep === 3 && (
                <div>
                  <div className="font-bold text-slate-900 mb-1">Stage 4: Probabilistic Calibration Gate</div>
                  <p className="text-slate-600">
                    Raw logit scores calibrated via Phase 4C isotonic regression or Platt sigmoid scaling. Brier score and expected calibration error (ECE) audited against Phase 4C verification thresholds.
                  </p>
                </div>
              )}
              {activeChainStep === 4 && (
                <div>
                  <div className="font-bold text-slate-900 mb-1">Stage 5: Forecast Product Generation</div>
                  <p className="text-slate-600">
                    Synthesis into immutable forecast records with 90% confidence uncertainty intervals, categoric classification (LOW / MODERATE / HIGH / SEVERE), and spatial bounds (BLOCK resolution).
                  </p>
                </div>
              )}
              {activeChainStep === 5 && (
                <div>
                  <div className="font-bold text-slate-900 mb-1">Stage 6: Domain-Grouped Explainability (SHAP)</div>
                  <p className="text-slate-600">
                    TreeSHAP feature contributions grouped into atmospheric domains: Moisture & Convective, Synoptic Wind, Thermodynamic Instability, and Antecedent Precipitation. Non-causal scientific language enforced.
                  </p>
                </div>
              )}
              {activeChainStep === 6 && (
                <div>
                  <div className="font-bold text-slate-900 mb-1">Stage 7: Multi-Year Validation & Quality Gates</div>
                  <p className="text-slate-600">
                    Audited against Phase 4D hindcasting stability thresholds. Due to the single-season (Kharif 2024) ground truth record, operational gate enforces DIAGNOSTIC_ONLY status.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Generated Forecast Inspector */}
          {generatedForecast && (
            <div className="space-y-4">
              <Card className="p-5 border-indigo-200 bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                        {generatedForecast.forecast_id}
                      </span>
                      <Badge variant="amber" size="sm">
                        {generatedForecast.scientific_disclosure.status}
                      </Badge>
                    </div>
                    <h3 className="font-heading font-bold text-base text-slate-900 mt-1">
                      {generatedForecast.target.target_type} ({generatedForecast.horizon.horizon_label})
                    </h3>
                    <p className="text-xs text-slate-600">
                      Valid from {generatedForecast.valid_from} to {generatedForecast.valid_until} • Block: {generatedForecast.location.block_id}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium">Calibrated Probability</div>
                      <div className="text-2xl font-black font-mono text-indigo-700">
                        {generatedForecast.prediction.probability !== null && generatedForecast.prediction.probability !== undefined
                          ? `${(generatedForecast.prediction.probability * 100).toFixed(1)}%`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-b border-surface-border text-xs">
                  <div>
                    <span className="text-slate-500 block">Model Family</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {generatedForecast.model.model_family} (v{generatedForecast.model.model_version})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Calibration Status</span>
                    <span className="font-semibold text-emerald-700 font-mono">
                      {generatedForecast.calibration.status} ({generatedForecast.calibration.calibrator_type})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Uncertainty Bounds (90% CI)</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {generatedForecast.uncertainty.lower_bound !== null && generatedForecast.uncertainty.upper_bound !== null
                        ? `[${((generatedForecast.uncertainty.lower_bound || 0) * 100).toFixed(1)}% - ${((generatedForecast.uncertainty.upper_bound || 0) * 100).toFixed(1)}%]`
                        : 'Unavailable'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Data Freshness</span>
                    <span className="font-semibold text-amber-700 font-mono">
                      {generatedForecast.data.freshness_status}
                    </span>
                  </div>
                </div>

                {/* SHAP Drivers */}
                {generatedForecast.explainability.top_features.length > 0 && (
                  <div className="pt-4">
                    <h4 className="font-heading font-bold text-xs text-slate-900 mb-2">
                      Key Atmospheric Predictors (SHAP Attribution)
                    </h4>
                    <div className="space-y-2">
                      {generatedForecast.explainability.top_features.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="neutral" size="sm">
                              {item.category}
                            </Badge>
                            <span className="font-semibold text-slate-900">{item.feature}</span>
                            <span className="text-slate-500 text-[11px]">{item.description}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono shrink-0">
                            <span
                              className={`text-[11px] font-bold ${
                                item.direction === 'elevates' ? 'text-indigo-600' : 'text-slate-600'
                              }`}
                            >
                              {item.direction.toUpperCase()} ({item.shap_value > 0 ? '+' : ''}
                              {item.shap_value.toFixed(3)})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Immutable JSON Artifact Inspection */}
              <Card className="p-4">
                <details className="cursor-pointer">
                  <summary className="text-xs font-mono font-bold text-slate-700 flex items-center justify-between">
                    <span>Inspect Raw Scientific Forecast Artifact (JSON)</span>
                    <span className="text-indigo-600 text-[11px]">Click to expand</span>
                  </summary>
                  <pre className="mt-3 p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-96">
                    {JSON.stringify(generatedForecast, null, 2)}
                  </pre>
                </details>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
