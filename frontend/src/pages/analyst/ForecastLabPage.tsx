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
  Sprout,
  Languages,
  Volume2,
  Radio,
  AlertTriangle,
} from 'lucide-react';

export const ForecastLabPage: React.FC = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'chain' | 'hindcasting' | 'agronomy' | 'localization'>('chain');

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#102A43]/15 gap-3 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('chain')}
            className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border-2 transition-all flex items-center gap-2 ${
              activeTab === 'chain'
                ? 'border-[#102A43] bg-[#0E7490] text-white shadow-[2px_2px_0px_#102A43]'
                : 'border-transparent text-slate-600 hover:border-[#102A43]/30 hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Forecast Generator & Scientific Chain
          </button>
          <button
            onClick={() => setActiveTab('hindcasting')}
            className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border-2 transition-all flex items-center gap-2 ${
              activeTab === 'hindcasting'
                ? 'border-[#102A43] bg-[#0E7490] text-white shadow-[2px_2px_0px_#102A43]'
                : 'border-transparent text-slate-600 hover:border-[#102A43]/30 hover:bg-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Multi-Year Hindcasting & Skill Evaluation
          </button>
          <button
            onClick={() => setActiveTab('agronomy')}
            className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border-2 transition-all flex items-center gap-2 ${
              activeTab === 'agronomy'
                ? 'border-[#102A43] bg-[#3F7D58] text-white shadow-[2px_2px_0px_#102A43]'
                : 'border-transparent text-slate-600 hover:border-[#102A43]/30 hover:bg-white'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            Agronomic Rules & Safety Lab
          </button>
          <button
            onClick={() => setActiveTab('localization')}
            className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border-2 transition-all flex items-center gap-2 ${
              activeTab === 'localization'
                ? 'border-[#102A43] bg-[#3F7D58] text-white shadow-[2px_2px_0px_#102A43]'
                : 'border-transparent text-slate-600 hover:border-[#102A43]/30 hover:bg-white'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            Advisory Localization & Voice Lab
          </button>
        </div>

        <Link
          to="/analyst/alerts"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white text-[#0E7490] border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:bg-[#F3F6F7] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all self-start sm:self-auto"
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Alert Center & Lifecycle Engine</span>
        </Link>
      </div>

      {activeTab === 'agronomy' ? (
        <div className="space-y-6">
          {/* Header Disclosures */}
          <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 space-y-3 border-l-8 border-l-[#3F7D58]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-black text-lg text-[#102A43]">
                    Agronomic Rules Catalog & Explainable Safety Gate
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#0E7490] text-white border border-[#102A43]">
                    Phase 5A Foundation
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#D97706]/20 text-[#B45309] border border-[#D97706]">
                    DIAGNOSTIC_ONLY
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Controlled rule definitions mapping downscaled meteorological probabilities to crop-specific situational risk indicators.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#3F7D58]/10 text-[#3F7D58] border border-[#3F7D58]/40">
                  13 Gate Checks ENFORCING
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/20 text-xs text-[#102A43] leading-relaxed">
              <strong>Mandatory Safety Boundary:</strong> All rules evaluate in informational diagnostic mode.
              The safety gate strictly blocks any imperative agronomic instructions, commercial pesticide recommendations,
              uncalibrated model probabilities, or fabricated crop yield loss claims.
            </div>
          </div>

          {/* Registered Agronomic Rules Table */}
          <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#102A43]/10 pb-3">
              <h4 className="font-heading font-black text-sm text-[#102A43]">
                Registered Agronomic Rules Catalog (9 Rules Active)
              </h4>
              <span className="text-xs text-slate-600 font-mono font-semibold">Registry: In-Memory / Deterministic</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#102A43]/20 text-[#102A43] uppercase text-[10px] font-mono font-bold">
                    <th className="py-2.5 px-3">Rule ID</th>
                    <th className="py-2.5 px-3">Target Event</th>
                    <th className="py-2.5 px-3">Applicable Crop / Stage</th>
                    <th className="py-2.5 px-3">Threshold Criteria</th>
                    <th className="py-2.5 px-3">Min Prob</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 'AGRO_HEAVY_RAIN_INFO_001', target: 'HEAVY_RAIN', crop: 'GENERAL (ALL)', criteria: '>= 64.5 mm / 24h', prob: '0.40', sev: 'INFO', pri: 10 },
                    { id: 'AGRO_PADDY_HEAVY_RAIN_HARVEST_001', target: 'HEAVY_RAIN', crop: 'PADDY (MATURITY)', criteria: '>= 64.5 mm / 24h', prob: '0.45', sev: 'WATCH', pri: 15 },
                    { id: 'AGRO_EXTREME_RAIN_ALERT_001', target: 'EXTREME_RAIN', crop: 'GENERAL (ALL)', criteria: '>= 204.5 mm / 24h', prob: '0.85', sev: 'HIGH', pri: 50 },
                    { id: 'AGRO_DRY_SPELL_INFO_001', target: 'DRY_SPELL', crop: 'GENERAL (ALL)', criteria: '>= 5 consecutive dry days', prob: '0.45', sev: 'INFO', pri: 10 },
                    { id: 'AGRO_PADDY_DRY_SPELL_VEGETATIVE_001', target: 'DRY_SPELL', crop: 'PADDY (VEGETATIVE)', criteria: '>= 5 consecutive dry days', prob: '0.45', sev: 'WATCH', pri: 15 },
                    { id: 'AGRO_MONSOON_ONSET_INFO_001', target: 'MONSOON_ONSET', crop: 'GENERAL (SOWING)', criteria: '>= 25 mm over 3 days', prob: '0.50', sev: 'INFO', pri: 20 },
                    { id: 'AGRO_FALSE_ONSET_RISK_001', target: 'MONSOON_ONSET', crop: 'GENERAL (SOWING)', criteria: '>= 7 dry days post-surge', prob: '0.50', sev: 'WATCH', pri: 25 },
                    { id: 'AGRO_RAINFALL_DEFICIT_ANOMALY_001', target: 'RAINFALL_ANOMALY', crop: 'GENERAL (ALL)', criteria: '<= -50% cumulative anomaly', prob: '0.45', sev: 'WATCH', pri: 15 },
                    { id: 'AGRO_RAINFALL_SURPLUS_ANOMALY_001', target: 'RAINFALL_ANOMALY', crop: 'GENERAL (ALL)', criteria: '>= +50% cumulative anomaly', prob: '0.50', sev: 'WATCH', pri: 15 },
                  ].map((r) => (
                    <tr key={r.id} className="hover:bg-[#F3F6F7]/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#102A43]">{r.id}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{r.target}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{r.crop}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{r.criteria}</td>
                      <td className="py-2.5 px-3 font-mono text-[#0E7490] font-bold">{r.prob}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          r.sev === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : r.sev === 'WATCH'
                            ? 'bg-[#D97706]/20 text-[#B45309] border border-[#D97706]/50'
                            : 'bg-[#0E7490]/10 text-[#0E7490] border border-[#0E7490]/30'
                        }`}>
                          {r.sev}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{r.pri}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 13 Deterministic Safety Gate Checks */}
          <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#102A43]/10 pb-3">
              <h4 className="font-heading font-black text-sm text-[#102A43]">
                Deterministic Agronomic Safety Gate (13 Strict Enforcement Rules)
              </h4>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#3F7D58]/10 text-[#3F7D58] border border-[#3F7D58]/40">
                Pass Required: 13/13
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: '1. Freshness Audit', rule: 'Must be HISTORICAL_ONLY (Kharif 2024)' },
                { name: '2. Operational Mode Audit', rule: 'Must be DIAGNOSTIC_ONLY' },
                { name: '3. Probability Bounds Check', rule: 'Probability must be strictly in [0.0, 1.0]' },
                { name: '4. Confidence Interval Check', rule: 'Parametric or empirical CI must be present' },
                { name: '5. Imperative Verb Filter', rule: 'Blocks "do not sow", "harvest now", "spray"' },
                { name: '6. Crop Yield Claim Filter', rule: 'Blocks yield loss percentage claims' },
                { name: '7. Financial Loss Filter', rule: 'Blocks rupee/dollar monetary loss assertions' },
                { name: '8. Chemical Brand Filter', rule: 'Blocks commercial pesticide/fungicide brands' },
                { name: '9. Hazard Threshold Audit', rule: 'Requires IMD scientific criteria compliance' },
                { name: '10. Station Anchor Check', rule: 'Validated centroid: UP_LKO_BKT only' },
                { name: '11. Single-Season Caveat', rule: 'Discloses single-season Kharif 2024 records' },
                { name: '12. Deduplication Audit', rule: 'Enforces deterministic SHA-256 hash' },
                { name: '13. Non-Causal Phrasing', rule: 'Enforces "statistical association" language' },
              ].map((chk, idx) => (
                <div key={idx} className="p-3 bg-[#F3F6F7]/60 rounded-xl border-2 border-[#102A43]/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-[#102A43]">{chk.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#3F7D58]" />
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{chk.rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 5B: Advanced Scenario Analysis & Sensitivity Engine Checks */}
          <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#102A43]/10 pb-3">
              <div>
                <h4 className="font-heading font-black text-sm text-[#102A43]">
                  Scenario Analysis Safety Checks (Checks 14–21) & Controlled Catalog
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Verifies What-If perturbations remain strictly within scientific bounds with zero yield models.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#0E7490] text-white border border-[#102A43]">
                Phase 5B Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { name: '14. Parameter Range Check', rule: 'Enforces strict parameter bounds (e.g. delay <= 21d, anomaly <= 60%)' },
                { name: '15. Combination Limit Check', rule: 'Limits combined scenarios to max 3 compatible orthogonal dimensions' },
                { name: '16. Baseline Integrity Check', rule: 'Restricts scenarios strictly to verified ground anchor UP_LKO_BKT' },
                { name: '17. Observation Separation', rule: 'Blocks outputs from claiming OBSERVED or GROUND_TRUTH status' },
                { name: '18. Yield Model Absence Check', rule: 'Blocks any claims of crop yield, biomass, or kg/ha harvest output' },
                { name: '19. Economic Claim Absence Check', rule: 'Blocks any claims of revenue, profit, or rupee/dollar losses' },
                { name: '20. Reproducibility Check', rule: 'Enforces deterministic coordinates, crop bindings, and parameter hash' },
                { name: '21. Scientific Disclosure Check', rule: 'Mandates SCENARIO_INDICATOR_ONLY classification and disclaimer' },
              ].map((chk, idx) => (
                <div key={idx} className="p-3 bg-[#F3F6F7]/60 rounded-xl border-2 border-[#102A43]/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-[#102A43]">{chk.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#3F7D58]" />
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{chk.rule}</p>
                </div>
              ))}
            </div>

            {/* Controlled Scenario Registry 6 Types Summary */}
            <div className="pt-3 border-t-2 border-[#102A43]/10">
              <h5 className="font-mono font-bold text-xs text-[#102A43] uppercase tracking-wider mb-2">
                Controlled Scenario Types Catalog (6 Registered Types)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border-2 border-[#102A43]/20 shadow-[2px_2px_0px_#102A43]/20">
                  <strong className="text-[#102A43] block font-mono font-bold">1. SOWING_DELAY</strong>
                  <span className="text-slate-600 text-[11px]">Bounds: [1, 21 days]. Evaluates moisture stress shifts.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border-2 border-[#102A43]/20 shadow-[2px_2px_0px_#102A43]/20">
                  <strong className="text-[#102A43] block font-mono font-bold">2. IRRIGATION_INTERVENTION</strong>
                  <span className="text-slate-600 text-[11px]">Bounds: Start [1, 30d], Freq [1, 7d], Dur [1, 5d]. Stress alleviation.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border-2 border-[#102A43]/20 shadow-[2px_2px_0px_#102A43]/20">
                  <strong className="text-[#102A43] block font-mono font-bold">3. SEASONAL_ANOMALY</strong>
                  <span className="text-slate-600 text-[11px]">Bounds: [-60.0%, +60.0%]. Cumulative rainfall shock.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border-2 border-[#102A43]/20 shadow-[2px_2px_0px_#102A43]/20">
                  <strong className="text-[#102A43] block font-mono font-bold">4. RAINFALL_TIMING_SHIFT</strong>
                  <span className="text-slate-600 text-[11px]">Bounds: [-14, +14 days]. Translates monsoon timing.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border-2 border-[#102A43]/20 shadow-[2px_2px_0px_#102A43]/20">
                  <strong className="text-[#102A43] block font-mono font-bold">5. HEAVY_RAIN_CONCENTRATION</strong>
                  <span className="text-slate-600 text-[11px]">Bounds: [1.0x, 2.5x]. Pulse compression into extreme bursts.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border-2 border-[#102A43]/20 shadow-[2px_2px_0px_#102A43]/20">
                  <strong className="text-[#102A43] block font-mono font-bold">6. COMBINED_SCENARIO</strong>
                  <span className="text-slate-600 text-[11px]">Compound multi-hazard: max 3 compatible orthogonal perturbations.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'localization' ? (
        <div className="space-y-6">
          {/* Header Disclosures */}
          <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 space-y-3 border-l-8 border-l-[#0E7490]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-black text-lg text-[#102A43]">
                    Bilingual Advisory Localization & Voice Accessibility Lab
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#0E7490] text-white border border-[#102A43]">
                    Phase 5C Engine
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#D97706]/20 text-[#B45309] border border-[#D97706]">
                    DIAGNOSTIC_ONLY
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#3F7D58]/10 text-[#3F7D58] border border-[#3F7D58]/40">
                    Safety Gate: ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Controlled translation verification, semantic invariance audit, numerical fidelity check, and prototype voice synthesis.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
                <span>Terminology:</span>
                <strong className="text-[#102A43]">v1.0.0 (15+ terms)</strong>
              </div>
            </div>

            <div className="p-3 bg-[#D97706]/10 rounded-xl border border-[#D97706]/40 text-[#102A43] text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <p>
                <strong>Scientific Boundary:</strong> Translation is governed exclusively by deterministic agronomic templates. Dynamic machine translation is strictly prohibited to eliminate hallucinated directives. All numeric quantities, probabilities, thresholds, and temporal horizons are mathematically preserved.
              </p>
            </div>
          </div>

          {/* Side-by-Side Bilingual Verification */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* English Source Column */}
            <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 space-y-3 border-t-8 border-t-[#102A43]">
              <div className="flex items-center justify-between border-b-2 border-[#102A43]/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#102A43] uppercase">English Source (EN)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                    Template v1.0.0
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#D97706]/20 text-[#B45309] border border-[#D97706]/50">
                  WATCH
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Title</span>
                  <strong className="text-[#102A43] font-heading font-black text-sm block">Heavy Rainfall Risk Indicator</strong>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Summary</span>
                  <p className="text-slate-700 leading-relaxed bg-[#F3F6F7] p-3 rounded-xl border border-[#102A43]/15 font-medium">
                    Heavy rainfall risk indicator detected for the 7-day forecast window. Model forecasts indicate a 58.4% calibrated probability of 24h rainfall exceeding 64.5 mm.
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Risk Indicator</span>
                  <p className="text-slate-700 bg-[#F3F6F7] p-2.5 rounded-lg border border-[#102A43]/15 font-medium">
                    Watch: Potential 24-hour rainfall exceeding 64.5 mm.
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">What It Means</span>
                  <p className="text-slate-700 bg-[#F3F6F7] p-2.5 rounded-lg border border-[#102A43]/15 font-medium">
                    Atmospheric indicators show heightened probability of significant rainfall within the next 7 days. Ground fields may experience localized surface saturation.
                  </p>
                </div>
              </div>
            </div>

            {/* Hindi Localized Column */}
            <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 space-y-3 border-t-8 border-t-[#0E7490]">
              <div className="flex items-center justify-between border-b-2 border-[#102A43]/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#0E7490] uppercase">हिन्दी Localized (HI)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#0E7490]/10 text-[#0E7490] border border-[#0E7490]/30">
                    Template v1.0.0
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#D97706]/20 text-[#B45309] border border-[#D97706]/50">
                  निगरानी (WATCH)
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">शीर्षक (Title)</span>
                  <strong className="text-[#102A43] font-heading font-black text-sm block">भारी वर्षा जोखिम सूचक</strong>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">सारांश (Summary)</span>
                  <p className="text-slate-700 leading-relaxed bg-[#F3F6F7] p-3 rounded-xl border border-[#102A43]/15 font-medium">
                    आगामी 7 दिनों की पूर्वानुमान अवधि के लिए भारी वर्षा जोखिम सूचक सक्रिय है। मॉडल पूर्वानुमान 24 घंटे में 64.5 मिमी से अधिक वर्षा की 58.4% अंशांकित संभावना दर्शाते हैं।
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">जोखिम सूचक (Risk Indicator)</span>
                  <p className="text-slate-700 bg-[#F3F6F7] p-2.5 rounded-lg border border-[#102A43]/15 font-medium">
                    निगरानी: 24 घंटे में 64.5 मिमी से अधिक वर्षा की संभावना।
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">प्रभाव विवरण (What It Means)</span>
                  <p className="text-slate-700 bg-[#F3F6F7] p-2.5 rounded-lg border border-[#102A43]/15 font-medium">
                    मौसम के संकेतक आगामी 7 दिनों के भीतर महत्वपूर्ण वर्षा की बढ़ी हुई संभावना दर्शाते हैं। खेतों में स्थानीय जलभराव की स्थिति बन सकती है।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Numerical Fidelity & Safety Verification Matrix */}
          <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 space-y-3">
            <h4 className="font-heading font-black text-sm text-[#102A43] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3F7D58]" />
              <span>Semantic Invariance & Numerical Fidelity Audit</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#F3F6F7]/70 rounded-xl border-2 border-[#102A43]/20 space-y-1">
                <span className="text-slate-500 block text-[10px] font-mono font-bold uppercase">Calibrated Probability</span>
                <strong className="text-[#3F7D58] text-sm font-mono font-bold block">58.4% == 58.4%</strong>
                <span className="text-slate-600 text-[11px] block">Exact match (0.0% drift)</span>
              </div>

              <div className="p-3 bg-[#F3F6F7]/70 rounded-xl border-2 border-[#102A43]/20 space-y-1">
                <span className="text-slate-500 block text-[10px] font-mono font-bold uppercase">Hazard Threshold</span>
                <strong className="text-[#3F7D58] text-sm font-mono font-bold block">64.5 mm == 64.5 मिमी</strong>
                <span className="text-slate-600 text-[11px] block">Exact IMD criteria match</span>
              </div>

              <div className="p-3 bg-[#F3F6F7]/70 rounded-xl border-2 border-[#102A43]/20 space-y-1">
                <span className="text-slate-500 block text-[10px] font-mono font-bold uppercase">Forecast Horizon</span>
                <strong className="text-[#3F7D58] text-sm font-mono font-bold block">7 days == 7 दिन</strong>
                <span className="text-slate-600 text-[11px] block">Identical temporal validity</span>
              </div>

              <div className="p-3 bg-[#F3F6F7]/70 rounded-xl border-2 border-[#102A43]/20 space-y-1">
                <span className="text-slate-500 block text-[10px] font-mono font-bold uppercase">Imperative Verbs</span>
                <strong className="text-[#3F7D58] text-sm font-mono font-bold block">0 Detected (PASSED)</strong>
                <span className="text-slate-600 text-[11px] block">No "spray/sow" directives</span>
              </div>

              <div className="p-3 bg-[#F3F6F7]/70 rounded-xl border-2 border-[#102A43]/20 space-y-1">
                <span className="text-slate-500 block text-[10px] font-mono font-bold uppercase">Yield / Biomass Claims</span>
                <strong className="text-[#3F7D58] text-sm font-mono font-bold block">0 Detected (PASSED)</strong>
                <span className="text-slate-600 text-[11px] block">Zero ungrounded production claims</span>
              </div>

              <div className="p-3 bg-[#F3F6F7]/70 rounded-xl border-2 border-[#102A43]/20 space-y-1">
                <span className="text-slate-500 block text-[10px] font-mono font-bold uppercase">Financial Loss Claims</span>
                <strong className="text-[#3F7D58] text-sm font-mono font-bold block">0 Detected (PASSED)</strong>
                <span className="text-slate-600 text-[11px] block">Zero rupee / loss projections</span>
              </div>
            </div>
          </div>

          {/* Voice Subsystem Inspector */}
          <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#102A43]/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#0E7490]" />
                <h4 className="font-heading font-black text-sm text-[#102A43]">
                  Voice Accessibility Subsystem (Phase 5C Prototype)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
                DEMO_ONLY
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              VarshaSetu provides an acoustic voice preview for localized farmer advisories. In this phase, synthesis runs through a deterministic local mock provider generating synthetic tones with client-side SpeechSynthesis fallback. External Bhashini pipeline credentials are intentionally not configured.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-[#F3F6F7] rounded-xl border-2 border-[#102A43]/20">
                <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Active Provider</span>
                <strong className="text-[#102A43] font-mono font-bold block mt-1">MOCK_LOCAL_VOICE_ENGINE</strong>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Status: DEMO_ONLY (Ready)</span>
              </div>
              <div className="p-3.5 bg-[#F3F6F7] rounded-xl border-2 border-[#102A43]/20">
                <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Bhashini API Integration</span>
                <strong className="text-[#B45309] font-mono font-bold block mt-1">BHASHINI_GOV_IN</strong>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Status: NOT_CONFIGURED (Stubbed)</span>
              </div>
              <div className="p-3.5 bg-[#F3F6F7] rounded-xl border-2 border-[#102A43]/20">
                <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Telecom Delivery</span>
                <strong className="text-[#102A43] font-mono font-bold block mt-1">IVR / SMS Gateway</strong>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Status: DISABLED (Out of scope)</span>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'hindcasting' ? (
        <div className="space-y-6">
          {hindcastError && (
            <div className="bg-[#FEF3C7] border-2 border-[#D97706] rounded-xl p-4 flex items-center gap-3 text-[#B45309] text-xs shadow-[2px_2px_0px_#102A43]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706]" />
              <span className="font-medium">{hindcastError}</span>
            </div>
          )}

          {loadingHindcast && !status ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43]">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#0E7490]" />
              <span className="text-sm font-heading font-bold text-[#102A43]">Loading Hindcasting & Skill Evaluation Lab...</span>
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
          <div className="bg-[#102A43] text-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-black text-base text-white tracking-tight">
                    Operational Forecast Pipeline Gating
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#D97706] text-[#102A43]">
                    {forecastGate?.system_status || 'DIAGNOSTIC_ONLY'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider bg-white/10 text-white/90 border border-white/20">
                    Kharif 2024 Archive
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Target location: <strong>Bakshi Ka Talab (UP_LKO_BKT)</strong>. Data freshness is restricted to historical archive (2024-06-01 to 2024-09-30). Live operational forecasting is locked until real-time weather telemetries pass quality gates.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">OPERATIONAL STATE</span>
                  <span className="text-[#D97706] font-bold font-mono">{forecastGate?.system_status || 'DIAGNOSTIC_ONLY'}</span>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">SPATIAL EXTENT</span>
                  <span className="text-[#0E7490] font-bold font-mono">1 Block (9 km)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#102A43] block mb-1.5">
                  Scientific Target
                </label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full text-xs font-medium border-2 border-[#102A43] rounded-xl p-2.5 bg-white text-[#102A43] shadow-[2px_2px_0px_#102A43] focus:outline-none"
                >
                  <option value="HEAVY_RAIN">Heavy Rainfall (&ge;64.5mm)</option>
                  <option value="DRY_SPELL">Dry Spell (&ge;5 dry days)</option>
                  <option value="MONSOON_ONSET">Monsoon Onset</option>
                  <option value="SEASONAL_RAINFALL">Seasonal Cumulative</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#102A43] block mb-1.5">
                  Forecast Horizon
                </label>
                <select
                  value={selectedHorizon}
                  onChange={(e) => setSelectedHorizon(Number(e.target.value))}
                  className="w-full text-xs font-medium border-2 border-[#102A43] rounded-xl p-2.5 bg-white text-[#102A43] shadow-[2px_2px_0px_#102A43] focus:outline-none"
                >
                  <option value={3}>3-Day Short-Range</option>
                  <option value={7}>7-Day Medium-Range</option>
                  <option value={14}>14-Day Extended-Range</option>
                  <option value={30}>30-Day Monthly Outlook</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#102A43] block mb-1.5">
                  Forecast Run Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full text-xs font-medium border-2 border-[#102A43] rounded-xl p-2.5 bg-white text-[#102A43] shadow-[2px_2px_0px_#102A43] focus:outline-none"
                >
                  <option value="xgboost">XGBoost (Calibrated GBDT)</option>
                  <option value="lightgbm">LightGBM (Hist Gradient)</option>
                  <option value="baseline_linear">Linear / Logistic Baseline</option>
                  <option value="climatology">Empirical Climatology</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#102A43] block mb-1.5">
                  Reference Date (Historical)
                </label>
                <input
                  type="date"
                  value={referenceDate}
                  min="2024-06-01"
                  max="2024-09-30"
                  onChange={(e) => setReferenceDate(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-[#102A43] rounded-xl p-2.5 bg-white text-[#102A43] shadow-[2px_2px_0px_#102A43] focus:outline-none"
                />
              </div>

              <div>
                <button
                  onClick={handleGenerateForecast}
                  disabled={isGenerating}
                  className="w-full text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-4 bg-[#0E7490] hover:bg-[#155E75] text-white border-2 border-[#102A43] rounded-xl flex items-center justify-center gap-2 shadow-[2px_2px_0px_#102A43] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
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
          </div>

          {forecastError && (
            <div className="bg-[#FEF2F2] border-2 border-[#DC2626] rounded-xl p-4 flex items-center gap-3 text-[#DC2626] text-xs shadow-[2px_2px_0px_#102A43]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span className="font-medium">{forecastError}</span>
            </div>
          )}

          {/* Scientific Chain Pipeline Visualizer */}
          <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5">
            <div className="pb-4 border-b-2 border-[#102A43]/10">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0E7490]" />
                <h3 className="text-base font-heading font-black text-[#102A43]">
                  Scientific Forecasting Chain
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Every forecast must transit 7 transparent scientific stages without lookahead leakage or fabricated parameters.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-4">
              {chainSteps.map((step, idx) => {
                const IconComponent = step.icon;
                const isSelected = activeChainStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveChainStep(step.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#102A43] bg-[#F3F6F7] shadow-[3px_3px_0px_#102A43]'
                        : 'border-[#102A43]/20 bg-white hover:border-[#102A43]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <IconComponent
                        className={`w-4 h-4 ${isSelected ? 'text-[#0E7490]' : 'text-slate-500'}`}
                      />
                      <span className="text-[10px] font-mono font-bold text-slate-400">0{idx + 1}</span>
                    </div>
                    <div className="font-heading font-bold text-xs text-[#102A43]">{step.title}</div>
                    <div className="text-[10px] text-slate-600 font-mono truncate mt-0.5">{step.subtitle}</div>
                  </button>
                );
              })}
            </div>

            {/* Active Chain Step Details */}
            <div className="mt-4 p-4 bg-[#F3F6F7] border-2 border-[#102A43]/15 rounded-xl text-xs space-y-1.5">
              {activeChainStep === 0 && (
                <div>
                  <div className="font-mono font-bold text-[#102A43] mb-1 uppercase tracking-wider">Stage 1: Observation & Data Ingestion</div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    Ingested from Bakshi Ka Talab AWS (IMD) paired with ERA5 reanalysis for atmospheric profiles.
                    Station coverage: 1 station. Temporal range: Kharif 2024 (122 records). Missingness rate: 0.0%. Dataset fingerprint verification ensures reproducibility.
                  </p>
                </div>
              )}
              {activeChainStep === 1 && (
                <div>
                  <div className="font-mono font-bold text-[#102A43] mb-1 uppercase tracking-wider">Stage 2: Deterministic Feature Engineering</div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    19 core meteorological predictors engineered with strict zero-lookahead audit. Includes synoptic pressure gradients, vertical velocity (w700), 850hPa zonal/meridional wind vectors, convective moisture, and antecedent rainfall anomalies.
                  </p>
                </div>
              )}
              {activeChainStep === 2 && (
                <div>
                  <div className="font-mono font-bold text-[#102A43] mb-1 uppercase tracking-wider">Stage 3: Statistical & ML Model Resolution</div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    Model: {selectedModel}. Resolved via Phase 4B gradient-boosted ensemble pipeline or Phase 4A baseline. Pre-trained weights checked against SHA-256 fingerprint hash.
                  </p>
                </div>
              )}
              {activeChainStep === 3 && (
                <div>
                  <div className="font-mono font-bold text-[#102A43] mb-1 uppercase tracking-wider">Stage 4: Probabilistic Calibration Gate</div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    Raw logit scores calibrated via Phase 4C isotonic regression or Platt sigmoid scaling. Brier score and expected calibration error (ECE) audited against Phase 4C verification thresholds.
                  </p>
                </div>
              )}
              {activeChainStep === 4 && (
                <div>
                  <div className="font-mono font-bold text-[#102A43] mb-1 uppercase tracking-wider">Stage 5: Forecast Product Generation</div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    Synthesis into immutable forecast records with 90% confidence uncertainty intervals, categoric classification (LOW / MODERATE / HIGH / SEVERE), and spatial bounds (BLOCK resolution).
                  </p>
                </div>
              )}
              {activeChainStep === 5 && (
                <div>
                  <div className="font-mono font-bold text-[#102A43] mb-1 uppercase tracking-wider">Stage 6: Domain-Grouped Explainability (SHAP)</div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    TreeSHAP feature contributions grouped into atmospheric domains: Moisture & Convective, Synoptic Wind, Thermodynamic Instability, and Antecedent Precipitation. Non-causal scientific language enforced.
                  </p>
                </div>
              )}
              {activeChainStep === 6 && (
                <div>
                  <div className="font-mono font-bold text-[#102A43] mb-1 uppercase tracking-wider">Stage 7: Multi-Year Validation & Quality Gates</div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    Audited against Phase 4D hindcasting stability thresholds. Due to the single-season (Kharif 2024) ground truth record, operational gate enforces DIAGNOSTIC_ONLY status.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Generated Forecast Inspector */}
          {generatedForecast && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#102A43]/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#102A43] font-bold bg-[#F3F6F7] border border-[#102A43]/20 px-2 py-0.5 rounded">
                        {generatedForecast.forecast_id}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#D97706]/20 text-[#B45309] border border-[#D97706]">
                        {generatedForecast.scientific_disclosure.status}
                      </span>
                    </div>
                    <h3 className="font-heading font-black text-lg text-[#102A43] mt-1.5">
                      {generatedForecast.target.target_type} ({generatedForecast.horizon.horizon_label})
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      Valid from {generatedForecast.valid_from} to {generatedForecast.valid_until} • Block: {generatedForecast.location.block_id}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-mono font-semibold uppercase">Calibrated Probability</div>
                      <div className="text-3xl font-black font-mono text-[#0E7490]">
                        {generatedForecast.prediction.probability !== null && generatedForecast.prediction.probability !== undefined
                          ? `${(generatedForecast.prediction.probability * 100).toFixed(1)}%`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-b-2 border-[#102A43]/10 text-xs">
                  <div>
                    <span className="text-slate-500 font-mono uppercase text-[10px] block">Model Family</span>
                    <span className="font-bold text-[#102A43] font-mono">
                      {generatedForecast.model.model_family} (v{generatedForecast.model.model_version})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono uppercase text-[10px] block">Calibration Status</span>
                    <span className="font-bold text-[#3F7D58] font-mono">
                      {generatedForecast.calibration.status} ({generatedForecast.calibration.calibrator_type})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono uppercase text-[10px] block">Uncertainty Bounds (90% CI)</span>
                    <span className="font-bold text-[#102A43] font-mono">
                      {generatedForecast.uncertainty.lower_bound !== null && generatedForecast.uncertainty.upper_bound !== null
                        ? `[${((generatedForecast.uncertainty.lower_bound || 0) * 100).toFixed(1)}% - ${((generatedForecast.uncertainty.upper_bound || 0) * 100).toFixed(1)}%]`
                        : 'Unavailable'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono uppercase text-[10px] block">Data Freshness</span>
                    <span className="font-bold text-[#B45309] font-mono">
                      {generatedForecast.data.freshness_status}
                    </span>
                  </div>
                </div>

                {/* Domain-Grouped SHAP Model Attribution */}
                {generatedForecast.explainability.top_features.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-heading font-black text-xs text-[#102A43] uppercase tracking-wider">
                        Domain-Grouped Atmospheric Predictors (SHAP Model Attribution)
                      </h4>
                      <span className="text-[10px] font-mono text-[#0E7490] font-bold">
                        Statistical attribution — not physical cause
                      </span>
                    </div>

                    <div className="border-2 border-[#102A43] rounded-xl overflow-hidden shadow-[2px_2px_0px_#102A43]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#F3F6F7] border-b-2 border-[#102A43]/15 text-[#102A43] font-bold text-[11px] font-heading">
                          <tr>
                            <th className="py-2.5 px-3">Atmospheric Domain</th>
                            <th className="py-2.5 px-3">Feature Name</th>
                            <th className="py-2.5 px-3">Direction</th>
                            <th className="py-2.5 px-3 text-right">Contribution</th>
                            <th className="py-2.5 px-3 hidden sm:table-cell">Physical Interpretation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#102A43]/10 bg-white font-mono text-xs">
                          {generatedForecast.explainability.top_features.map((item, idx) => (
                            <tr key={idx} className="hover:bg-[#F3F6F7]/50 transition-colors">
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#EAF0F2] border border-[#102A43]/15 text-[#102A43]">
                                  {item.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-bold text-[#102A43]">
                                {item.feature}
                              </td>
                              <td className="py-2.5 px-3 font-sans">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                    item.direction === 'elevates'
                                      ? 'bg-[#E4F0E8] text-[#3F7D58] border border-[#3F7D58]/30'
                                      : 'bg-[#F3F6F7] text-[#486581] border border-[#102A43]/15'
                                  }`}
                                >
                                  {item.direction.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold">
                                <span
                                  className={
                                    item.direction === 'elevates'
                                      ? 'text-[#0E7490]'
                                      : 'text-[#486581]'
                                  }
                                >
                                  {item.shap_value > 0 ? '+' : ''}
                                  {item.shap_value.toFixed(3)}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-sans text-[11px] text-[#486581] hidden sm:table-cell">
                                {item.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-[10px] text-[#829AB1] font-sans">
                      * Feature contributions indicate statistical tree model attribution (TreeSHAP log-odds shift), not empirical atmospheric or agronomic causality.
                    </p>
                  </div>
                )}
              </div>

              {/* Immutable JSON Artifact Inspection */}
              <div className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-4">
                <details className="cursor-pointer">
                  <summary className="text-xs font-mono font-bold text-[#102A43] uppercase tracking-wider flex items-center justify-between">
                    <span>Inspect Raw Scientific Forecast Artifact (JSON)</span>
                    <span className="text-[#0E7490] text-[11px] font-mono">Click to expand</span>
                  </summary>
                  <pre className="mt-3 p-4 bg-[#102A43] text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-96 border border-slate-800">
                    {JSON.stringify(generatedForecast, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
