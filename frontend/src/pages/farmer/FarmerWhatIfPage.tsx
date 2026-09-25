import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  AlertCircle,
  ArrowRightLeft,
  Droplets,
  Calendar,
  Sprout,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Layers,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Hash,
  Database,
  Sliders,
  BarChart2,
  FileText,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Progress } from '../../components/ui/Progress';
import { advisoryService } from '../../services/advisoryService';
import {
  ScenarioResult,
  IndicatorDelta,
  ScenarioEnvelope,
  SensitivityAnalysisResult,
  ScenarioExplanation,
  ScenarioProvenance,
  ScenarioRegistryItem,
} from '@shared/types';

export const FarmerWhatIfPage: React.FC = () => {
  const { t } = useTranslation();
  const { crop, location } = useFarmerStore();

  const [activeScenario, setActiveScenario] = useState<string>('SOWING_DELAY');
  const [selectedCrop, setSelectedCrop] = useState<string>('PADDY');
  const [selectedStage, setSelectedStage] = useState<string>('VEGETATIVE');

  // Parameter states conforming to scientific bounds
  const [delayDays, setDelayDays] = useState<number>(7);
  const [rainfallAnomaly, setRainfallAnomaly] = useState<number>(-20);
  const [shiftDays, setShiftDays] = useState<number>(7);
  const [concentrationFactor, setConcentrationFactor] = useState<number>(1.5);
  const [interventionStart, setInterventionStart] = useState<number>(5);
  const [interventionFreq, setInterventionFreq] = useState<number>(3);
  const [interventionDur, setInterventionDur] = useState<number>(2);
  const [combinedTypes, setCombinedTypes] = useState<string[]>(['SOWING_DELAY', 'SEASONAL_ANOMALY']);

  // Results & Sensitivity states
  const [simResult, setSimResult] = useState<ScenarioResult | null>(null);
  const [sensitivityResult, setSensitivityResult] = useState<SensitivityAnalysisResult | null>(null);
  const [registryItems, setRegistryItems] = useState<ScenarioRegistryItem[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load registry on mount
  useEffect(() => {
    advisoryService.getScenarioRegistry().then((res) => {
      if (res.success && res.data?.registry) {
        setRegistryItems(res.data.registry);
      }
    }).catch(() => {});

    // Initial simulation
    runSimulation('SOWING_DELAY');
  }, []);

  const runSimulation = async (scenarioTypeToRun = activeScenario) => {
    setIsSimulating(true);
    setErrorMsg(null);
    try {
      const payload: any = {
        scenario_type: scenarioTypeToRun,
        block_id: 'UP_LKO_BKT',
        crop: selectedCrop,
        crop_stage: selectedStage,
      };

      if (scenarioTypeToRun === 'SOWING_DELAY') {
        payload.delay_days = delayDays;
      } else if (scenarioTypeToRun === 'SEASONAL_ANOMALY') {
        payload.rainfall_anomaly_pct = rainfallAnomaly;
      } else if (scenarioTypeToRun === 'RAINFALL_TIMING_SHIFT') {
        payload.shift_days = shiftDays;
      } else if (scenarioTypeToRun === 'HEAVY_RAIN_CONCENTRATION') {
        payload.concentration_factor = concentrationFactor;
      } else if (scenarioTypeToRun === 'IRRIGATION_INTERVENTION') {
        payload.intervention_start_day = interventionStart;
        payload.intervention_frequency = interventionFreq;
        payload.intervention_duration = interventionDur;
      } else if (scenarioTypeToRun === 'COMBINED_SCENARIO') {
        payload.combined_types = combinedTypes;
        payload.delay_days = delayDays;
        payload.rainfall_anomaly_pct = rainfallAnomaly;
      }

      // Execute simulation
      const res = await advisoryService.runScenario(payload);
      if (res.success && res.data) {
        setSimResult(res.data);
      } else {
        setErrorMsg((res as any).error?.message || 'Simulation blocked or failed.');
      }

      // Execute sensitivity analysis
      const sensRes = await advisoryService.runSensitivity(payload);
      if (sensRes.success && sensRes.data) {
        setSensitivityResult(sensRes.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Simulation request failed.');
    } finally {
      setIsSimulating(false);
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return 'emerald';
      case 'MODERATE':
        return 'teal';
      case 'HIGH':
        return 'amber';
      case 'SEVERE':
        return 'crimson';
      default:
        return 'neutral';
    }
  };

  const renderDirectionIcon = (direction: string) => {
    if (direction === 'INCREASED') return <TrendingUp className="w-3.5 h-3.5 text-brand-crimson" />;
    if (direction === 'DECREASED') return <TrendingDown className="w-3.5 h-3.5 text-brand-emerald" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="space-y-6" data-testid="farmer-whatif-page">
      {/* 1. Header & Mandatory Classification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-teal" />
              <span>What-If Agro-Climate Scenario Simulator</span>
            </h1>
            <Badge variant="amber" size="sm">SCENARIO_INDICATOR_ONLY</Badge>
            <Badge variant="neutral" size="sm">Phase 5B Engine</Badge>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Simulate agro-meteorological sensitivity shifts across farming operational decisions for {location.block || 'Bakshi Ka Talab'} (UP_LKO_BKT, Kharif 2024 Ground Anchor)
          </p>
        </div>
      </div>

      {/* 2. Mandatory Strict Scientific Boundary Notice */}
      <Alert variant="warning" title="Strict Scientific Boundary: Sensitivity Indicators Only">
        What-If scenario analyses are strictly classified as <strong className="font-mono text-slate-900">SCENARIO_INDICATOR_ONLY</strong>.
        This engine models deterministic sensitivity indicators (moisture stress exposure, waterlogging risk, dry spell duration) relative to the verified Kharif 2024 meteorological baseline.
        <strong className="text-slate-900 block mt-1">
          VarshaSetu does NOT predict crop yields, biomass production, quintals per hectare, or monetary/revenue outcomes.
        </strong>
      </Alert>

      {/* 3. Scenario Type Selection Tabs (All 6 Types) */}
      <div className="bg-white p-4 rounded-xl border border-surface-border space-y-4">
        <label className="text-xs font-heading font-bold text-slate-800 uppercase tracking-wider block">
          Select Scenario Exploration Mode:
        </label>
        <div className="flex gap-2 border-b border-surface-border pb-3 overflow-x-auto">
          {[
            { id: 'SOWING_DELAY', label: 'Sowing Date Shift', icon: Calendar },
            { id: 'IRRIGATION_INTERVENTION', label: 'Supplemental Irrigation', icon: Droplets },
            { id: 'SEASONAL_ANOMALY', label: 'Seasonal Rainfall Anomaly', icon: Sliders },
            { id: 'RAINFALL_TIMING_SHIFT', label: 'Rainfall Timing Shift', icon: ArrowRightLeft },
            { id: 'HEAVY_RAIN_CONCENTRATION', label: 'Heavy Rain Concentration', icon: AlertCircle },
            { id: 'COMBINED_SCENARIO', label: 'Compound Multi-Hazard', icon: Layers },
          ].map((scen) => {
            const Icon = scen.icon;
            const isSelected = activeScenario === scen.id;
            return (
              <button
                key={scen.id}
                onClick={() => {
                  setActiveScenario(scen.id);
                  runSimulation(scen.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all min-h-[40px] whitespace-nowrap ${
                  isSelected
                    ? 'bg-brand-teal text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-surface-border hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{scen.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Parameters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end pt-1">
          <div>
            <label className="text-xs font-heading font-semibold text-slate-700 block mb-1">Crop Type:</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 bg-surface-muted rounded-lg text-xs font-semibold text-slate-800 border border-surface-border"
            >
              <option value="PADDY">Paddy (धान)</option>
              <option value="MAIZE">Maize (मक्का)</option>
              <option value="WHEAT">Wheat (गेहूं)</option>
              <option value="PULSES">Pulses (दलहन)</option>
              <option value="MUSTARD">Mustard (सरसों)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-heading font-semibold text-slate-700 block mb-1">Growth Stage:</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 bg-surface-muted rounded-lg text-xs font-semibold text-slate-800 border border-surface-border"
            >
              <option value="SOWING">Sowing</option>
              <option value="GERMINATION">Germination</option>
              <option value="VEGETATIVE">Vegetative Tillering</option>
              <option value="FLOWERING">Flowering & Reproductive</option>
              <option value="GRAIN_FILLING">Grain Filling</option>
              <option value="MATURITY">Maturity</option>
            </select>
          </div>

          {/* Conditional Parameter Sliders Conforming to Scientific Limits */}
          {activeScenario === 'SOWING_DELAY' && (
            <div>
              <label className="text-xs font-heading font-semibold text-slate-700 block mb-1">
                Delay Sowing By: <span className="font-mono text-brand-teal font-bold">{delayDays} days</span>
              </label>
              <input
                type="range"
                min="1"
                max="21"
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-teal"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Scientific range: [1, 21 days]</span>
            </div>
          )}

          {activeScenario === 'SEASONAL_ANOMALY' && (
            <div>
              <label className="text-xs font-heading font-semibold text-slate-700 block mb-1">
                Rainfall Anomaly: <span className="font-mono text-brand-teal font-bold">{rainfallAnomaly}%</span>
              </label>
              <input
                type="range"
                min="-60"
                max="60"
                step="5"
                value={rainfallAnomaly}
                onChange={(e) => setRainfallAnomaly(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-teal"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Scientific range: [-60%, +60%]</span>
            </div>
          )}

          {activeScenario === 'RAINFALL_TIMING_SHIFT' && (
            <div>
              <label className="text-xs font-heading font-semibold text-slate-700 block mb-1">
                Pulse Shift: <span className="font-mono text-brand-teal font-bold">{shiftDays > 0 ? `+${shiftDays}` : shiftDays} days</span>
              </label>
              <input
                type="range"
                min="-14"
                max="14"
                value={shiftDays}
                onChange={(e) => setShiftDays(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-teal"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Shift window: [-14, +14 days]</span>
            </div>
          )}

          {activeScenario === 'HEAVY_RAIN_CONCENTRATION' && (
            <div>
              <label className="text-xs font-heading font-semibold text-slate-700 block mb-1">
                Concentration Multiplier: <span className="font-mono text-brand-teal font-bold">{concentrationFactor}x</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={concentrationFactor}
                onChange={(e) => setConcentrationFactor(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-teal"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Multiplier range: [1.0x, 2.5x]</span>
            </div>
          )}

          {activeScenario === 'IRRIGATION_INTERVENTION' && (
            <>
              <div>
                <label className="text-xs font-heading font-semibold text-slate-700 block mb-1">
                  Start Day: <span className="font-mono text-brand-teal font-bold">Day {interventionStart}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={interventionStart}
                  onChange={(e) => setInterventionStart(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-teal"
                />
              </div>
            </>
          )}

          {activeScenario === 'COMBINED_SCENARIO' && (
            <div>
              <label className="text-xs font-heading font-semibold text-slate-700 block mb-1">
                Delay ({delayDays}d) & Anomaly ({rainfallAnomaly}%)
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="1"
                  max="21"
                  value={delayDays}
                  onChange={(e) => setDelayDays(parseInt(e.target.value, 10))}
                  className="w-1/2 h-2 bg-slate-200 rounded-lg accent-brand-teal"
                />
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={rainfallAnomaly}
                  onChange={(e) => setRainfallAnomaly(parseInt(e.target.value, 10))}
                  className="w-1/2 h-2 bg-slate-200 rounded-lg accent-brand-teal"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Max 3 orthogonal dimensions</span>
            </div>
          )}

          <div>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => runSimulation(activeScenario)}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <span className="flex items-center gap-1.5 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating...
                </span>
              ) : (
                'Run Scenario Simulation'
              )}
            </Button>
          </div>
        </div>

        {errorMsg && (
          <Alert variant="danger" title="Scenario Simulation Blocked">
            {errorMsg}
          </Alert>
        )}
      </div>

      {/* 4. Results Section: Baseline vs Scenario Comparative Deltas Table */}
      {simResult && (
        <div className="space-y-6">
          <Card className="p-6 space-y-5 border-l-4 border-l-brand-teal">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
              <div>
                <span className="text-[11px] font-mono text-slate-500 uppercase">
                  Scenario Execution ID: {simResult.scenario_id}
                </span>
                <h3 className="font-heading font-bold text-lg text-slate-900 mt-0.5">
                  Comparative Delta Evaluation: {simResult.scenario_type.replace(/_/g, ' ')}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="teal" size="sm">
                  {simResult.applicability || 'APPLICABLE'}
                </Badge>
                <Badge variant="demo" size="sm">
                  {simResult.classification}
                </Badge>
              </div>
            </div>

            {/* Baseline vs Scenario Delta Table */}
            {simResult.deltas && simResult.deltas.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-heading font-semibold">
                      <th className="py-2.5 px-3">Indicator</th>
                      <th className="py-2.5 px-3 text-right">Baseline</th>
                      <th className="py-2.5 px-3 text-right">Scenario</th>
                      <th className="py-2.5 px-3 text-right">Absolute Delta</th>
                      <th className="py-2.5 px-3 text-right">Relative Shift</th>
                      <th className="py-2.5 px-3 text-center">Baseline Severity</th>
                      <th className="py-2.5 px-3 text-center">Scenario Severity</th>
                      <th className="py-2.5 px-3 text-center">Direction</th>
                      <th className="py-2.5 px-3">Scientific Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {simResult.deltas.map((d: IndicatorDelta, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {d.indicator_name.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          {d.baseline_value.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {d.scenario_value.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          <span className={d.absolute_delta > 0 ? 'text-brand-crimson' : d.absolute_delta < 0 ? 'text-brand-emerald' : 'text-slate-500'}>
                            {d.absolute_delta > 0 ? `+${d.absolute_delta.toFixed(1)}` : d.absolute_delta.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {d.relative_delta_pct !== null && d.relative_delta_pct !== undefined ? (
                            <span className={d.relative_delta_pct > 0 ? 'text-brand-crimson font-semibold' : d.relative_delta_pct < 0 ? 'text-brand-emerald font-semibold' : 'text-slate-500'}>
                              {d.relative_delta_pct > 0 ? `+${d.relative_delta_pct.toFixed(1)}%` : `${d.relative_delta_pct.toFixed(1)}%`}
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={getSeverityBadgeVariant(d.baseline_category)} size="sm">
                            {d.baseline_category}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={getSeverityBadgeVariant(d.scenario_category)} size="sm">
                            {d.scenario_category}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1 font-semibold text-[11px]">
                            {renderDirectionIcon(d.direction)}
                            <span>{d.direction}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px] leading-relaxed max-w-xs">
                          {d.scientific_interpretation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Scenario Envelope Card */}
            {simResult.envelope && (
              <div className="p-4 bg-surface-muted rounded-xl border border-surface-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-brand-teal" />
                    <h4 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Parameter Range Envelope: {simResult.envelope.indicator_name.replace(/_/g, ' ')}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Deterministic Extremes & Central Tendency
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Minimum Boundary</span>
                    <strong className="text-sm font-mono text-slate-800">{simResult.envelope.min_value.toFixed(1)}</strong>
                    <div className="mt-1">
                      <Badge variant={getSeverityBadgeVariant(simResult.envelope.min_category)} size="sm">
                        {simResult.envelope.min_category}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Baseline Reference</span>
                    <strong className="text-sm font-mono text-brand-teal">{simResult.envelope.baseline_value.toFixed(1)}</strong>
                    <div className="mt-1">
                      <Badge variant={getSeverityBadgeVariant(simResult.envelope.baseline_category)} size="sm">
                        {simResult.envelope.baseline_category}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Median Envelope</span>
                    <strong className="text-sm font-mono text-slate-800">{simResult.envelope.median_value.toFixed(1)}</strong>
                    <div className="mt-1">
                      <Badge variant={getSeverityBadgeVariant(simResult.envelope.median_category)} size="sm">
                        {simResult.envelope.median_category}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Maximum Boundary</span>
                    <strong className="text-sm font-mono text-brand-crimson">{simResult.envelope.max_value.toFixed(1)}</strong>
                    <div className="mt-1">
                      <Badge variant={getSeverityBadgeVariant(simResult.envelope.max_category)} size="sm">
                        {simResult.envelope.max_category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deterministic Sensitivity Response Curve Data */}
            {sensitivityResult && sensitivityResult.curve_points && sensitivityResult.curve_points.length > 0 && (
              <div className="p-4 bg-white rounded-xl border border-surface-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-teal" />
                    <h4 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Deterministic Parameter Response Curve ({sensitivityResult.parameter_name})
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Step-Wise Perturbation Points (No ML Fitting)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {sensitivityResult.curve_points.map((pt, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 block">{pt.parameter_label}</span>
                      <strong className="text-xs font-mono text-slate-900 block">
                        {pt.indicator_values?.moisture_stress_pct !== undefined
                          ? `${pt.indicator_values.moisture_stress_pct.toFixed(1)}%`
                          : pt.indicator_values?.waterlogging_risk_pct !== undefined
                          ? `${pt.indicator_values.waterlogging_risk_pct.toFixed(1)}%`
                          : '—'}
                      </strong>
                      <span className="text-[9px] text-slate-400 block">
                        Δ {pt.deltas?.moisture_stress_pct !== undefined ? `${pt.deltas.moisture_stress_pct > 0 ? '+' : ''}${pt.deltas.moisture_stress_pct.toFixed(1)}%` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Causal Explanation & Assumptions */}
            {simResult.explanation && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <FileText className="w-4 h-4 text-brand-teal" />
                  <span>Scientific Explanation & Non-Causal Attribution</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Baseline Observation:</strong> {simResult.explanation.baseline_description}
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Perturbations Applied:</strong> {simResult.explanation.perturbations_applied.join(', ')}
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Indicator Shift Summary:</strong> {simResult.explanation.indicator_shift_summary}
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 italic">
                  "{simResult.explanation.non_causal_statement}"
                </div>
              </div>
            )}

            {/* Cryptographic Lineage & Provenance */}
            {simResult.provenance && (
              <div className="p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1 mb-1">
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-brand-teal" /> Cryptographic Provenance & Lineage Fingerprint
                  </span>
                  <span>Version {simResult.provenance.scenario_version}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                  <div>Parameter SHA-256: <span className="text-white">{simResult.provenance.parameter_hash.substring(0, 16)}...</span></div>
                  <div>Dataset Fingerprint: <span className="text-white">{simResult.provenance.dataset_fingerprint}</span></div>
                  <div>Ground Anchor: <span className="text-white">{simResult.provenance.baseline_reference}</span></div>
                  <div>Engine Release: <span className="text-white">{simResult.provenance.engine_version}</span></div>
                </div>
              </div>
            )}

            {/* Explicit Disclaimer Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Mandatory Scientific Boundary</strong>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  {simResult.scientific_disclaimer}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
