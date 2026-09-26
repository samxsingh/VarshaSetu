import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  AlertCircle,
  ArrowRightLeft,
  Droplets,
  Calendar,
  Layers,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Database,
  Sliders,
  BarChart2,
  FileText,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { advisoryService } from '../../services/advisoryService';
import {
  ScenarioResult,
  IndicatorDelta,
  SensitivityAnalysisResult,
  ScenarioRegistryItem,
} from '@shared/types';
import { ScientificStatusBadge } from '../../components/farmer/ScientificStatusBadge';

export const FarmerWhatIfPage: React.FC = () => {
  const { t } = useTranslation();
  const { location } = useFarmerStore();

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

  const resetParameters = () => {
    setDelayDays(7);
    setRainfallAnomaly(-20);
    setShiftDays(7);
    setConcentrationFactor(1.5);
    setInterventionStart(5);
    setInterventionFreq(3);
    setInterventionDur(2);
    setCombinedTypes(['SOWING_DELAY', 'SEASONAL_ANOMALY']);
  };

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
        return 'bg-[#EBF5EE] text-[#2F7D4A] border border-[#2F7D4A]';
      case 'MODERATE':
        return 'bg-[#DCEFF0] text-[#006B65] border border-[#008F83]';
      case 'HIGH':
        return 'bg-[#FEF6E9] text-[#9A6218] border border-[#E5A33D]';
      case 'SEVERE':
        return 'bg-[#FEF2F2] text-[#E53E3E] border border-[#E53E3E]';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-300';
    }
  };

  const renderDirectionIcon = (direction: string) => {
    if (direction === 'INCREASED') return <TrendingUp className="w-3.5 h-3.5 text-[#E53E3E]" />;
    if (direction === 'DECREASED') return <TrendingDown className="w-3.5 h-3.5 text-[#2F7D4A]" />;
    return <Minus className="w-3.5 h-3.5 text-[#62768A]" />;
  };

  return (
    <div className="space-y-6" data-testid="farmer-whatif-page">
      {/* 1. Header & Mandatory Classification */}
      <div className="bg-white rounded-2xl border-2 border-[#0B1726] p-6 shadow-[4px_4px_0px_#0B1726]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#0B1726] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#008F83]" />
                <span>What-If Agro-Climate Scenario Simulator</span>
              </h1>
              <ScientificStatusBadge status="SCENARIO_INDICATOR_ONLY" size="sm" />
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#F7F3EA] border border-[#0B1726]/20 text-[#0B1726]">
                Phase 5B Engine
              </span>
            </div>
            <p className="text-xs text-[#435466] font-sans">
              Explore how meteorological conditions change under different scenarios for {location.block || 'Bakshi Ka Talab'} (UP_LKO_BKT, Kharif 2024 Ground Anchor).
            </p>
          </div>
        </div>
      </div>

      {/* 2. Mandatory Strict Scientific Boundary Notice */}
      <div className="p-5 bg-[#FEF6E9] border-2 border-[#0B1726] rounded-xl shadow-[3px_3px_0px_#0B1726] text-xs text-[#7A4B00] space-y-1.5 font-sans leading-relaxed">
        <div className="font-heading font-black text-xs text-[#0B1726] uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-[#E5A33D]" />
          <span>Strict Scientific Boundary: Sensitivity Indicators Only</span>
        </div>
        <p>
          What-If scenario analyses are strictly classified as <strong className="font-mono text-[#0B1726]">SCENARIO_INDICATOR_ONLY</strong>.
          This engine models deterministic sensitivity indicators (moisture stress exposure, waterlogging risk, dry spell duration) relative to the verified Kharif 2024 meteorological baseline.
          <strong className="text-[#0B1726] block mt-1">
            VarshaSetu does NOT predict crop yields, biomass production, quintals per hectare, or monetary/revenue outcomes.
          </strong>
        </p>
      </div>

      {/* 3. Scenario Type Selection Tabs (All 6 Types) */}
      <div className="bg-white p-6 rounded-2xl border-2 border-[#0B1726] shadow-[4px_4px_0px_#0B1726] space-y-5">
        <div className="flex items-center justify-between border-b-2 border-[#0B1726]/10 pb-3">
          <span className="text-xs font-heading font-black text-[#0B1726] uppercase tracking-wider block">
            WHAT-IF SCENARIOS (EXPLORATION MODES)
          </span>
          <button
            onClick={resetParameters}
            className="flex items-center gap-1 text-[11px] font-heading font-bold text-[#62768A] hover:text-[#0B1726] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Instrument Parameters</span>
          </button>
        </div>

        {/* 6 Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { id: 'SOWING_DELAY', num: '01', label: 'Sowing Date Shift', icon: Calendar },
            { id: 'IRRIGATION_INTERVENTION', num: '02', label: 'Supplemental Irrigation', icon: Droplets },
            { id: 'SEASONAL_ANOMALY', num: '03', label: 'Seasonal Rainfall Anomaly', icon: Sliders },
            { id: 'RAINFALL_TIMING_SHIFT', num: '04', label: 'Rainfall Timing Shift', icon: ArrowRightLeft },
            { id: 'HEAVY_RAIN_CONCENTRATION', num: '05', label: 'Heavy Rain Concentration', icon: AlertCircle },
            { id: 'COMBINED_SCENARIO', num: '06', label: 'Compound Multi-Hazard', icon: Layers },
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
                className={`flex flex-col items-start p-3 rounded-xl text-left transition-all min-h-[56px] border-2 ${
                  isSelected
                    ? 'bg-brand-teal text-white border-[#0B1726] shadow-[2px_2px_0px_#0B1726]'
                    : 'bg-[#F7F3EA] text-[#435466] border-[#0B1726]/20 hover:border-[#0B1726] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[#DCEFF0]' : 'text-[#62768A]'}`}>
                    {scen.num}
                  </span>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-heading font-bold text-xs truncate w-full mt-1">
                  {scen.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Input Parameters Controls Styled as Scientific Instruments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end pt-2 border-t-2 border-[#0B1726]/10">
          <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
            <label className="text-[11px] font-heading font-bold text-[#62768A] uppercase tracking-wider block mb-1">
              Crop Focus
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg text-xs font-semibold text-[#0B1726] border border-[#0B1726]/30 focus:outline-none focus:ring-2 focus:ring-[#008F83]"
            >
              <option value="PADDY">Paddy (धान)</option>
              <option value="MAIZE">Maize (मक्का)</option>
              <option value="WHEAT">Wheat (गेहूं)</option>
              <option value="PULSES">Pulses (दलहन)</option>
              <option value="MUSTARD">Mustard (सरसों)</option>
            </select>
          </div>

          <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
            <label className="text-[11px] font-heading font-bold text-[#62768A] uppercase tracking-wider block mb-1">
              Growth Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg text-xs font-semibold text-[#0B1726] border border-[#0B1726]/30 focus:outline-none focus:ring-2 focus:ring-[#008F83]"
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
            <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] font-heading font-bold text-[#62768A] uppercase tracking-wider">
                  Sowing Delay:
                </span>
                <span className="font-mono text-base font-black text-[#008F83]">{delayDays} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="21"
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#008F83]"
              />
              <span className="text-[9px] text-[#62768A] font-mono block mt-1">Instrument Range: [1 – 21 days]</span>
            </div>
          )}

          {activeScenario === 'SEASONAL_ANOMALY' && (
            <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] font-heading font-bold text-[#62768A] uppercase tracking-wider">
                  Rainfall Anomaly:
                </span>
                <span className="font-mono text-base font-black text-[#008F83]">{rainfallAnomaly}%</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                step="5"
                value={rainfallAnomaly}
                onChange={(e) => setRainfallAnomaly(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#008F83]"
              />
              <span className="text-[9px] text-[#62768A] font-mono block mt-1">Instrument Range: [-60% to +60%]</span>
            </div>
          )}

          {activeScenario === 'RAINFALL_TIMING_SHIFT' && (
            <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] font-heading font-bold text-[#62768A] uppercase tracking-wider">
                  Pulse Shift:
                </span>
                <span className="font-mono text-base font-black text-[#008F83]">{shiftDays > 0 ? `+${shiftDays}` : shiftDays} days</span>
              </div>
              <input
                type="range"
                min="-14"
                max="14"
                value={shiftDays}
                onChange={(e) => setShiftDays(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#008F83]"
              />
              <span className="text-[9px] text-[#62768A] font-mono block mt-1">Shift window: [-14 to +14 days]</span>
            </div>
          )}

          {activeScenario === 'HEAVY_RAIN_CONCENTRATION' && (
            <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] font-heading font-bold text-[#62768A] uppercase tracking-wider">
                  Concentration:
                </span>
                <span className="font-mono text-base font-black text-[#008F83]">{concentrationFactor}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={concentrationFactor}
                onChange={(e) => setConcentrationFactor(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#008F83]"
              />
              <span className="text-[9px] text-[#62768A] font-mono block mt-1">Multiplier: [1.0x – 2.5x]</span>
            </div>
          )}

          {activeScenario === 'IRRIGATION_INTERVENTION' && (
            <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] font-heading font-bold text-[#62768A] uppercase tracking-wider">
                  Start Day:
                </span>
                <span className="font-mono text-base font-black text-[#008F83]">Day {interventionStart}</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={interventionStart}
                onChange={(e) => setInterventionStart(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#008F83]"
              />
              <span className="text-[9px] text-[#62768A] font-mono block mt-1">Window: Day 1 to 30</span>
            </div>
          )}

          {activeScenario === 'COMBINED_SCENARIO' && (
            <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] font-heading font-bold text-[#62768A] uppercase tracking-wider">
                  Delay & Anomaly:
                </span>
                <span className="font-mono text-xs font-black text-[#008F83]">{delayDays}d / {rainfallAnomaly}%</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="1"
                  max="21"
                  value={delayDays}
                  onChange={(e) => setDelayDays(parseInt(e.target.value, 10))}
                  className="w-1/2 h-2 bg-slate-300 rounded-lg accent-[#008F83]"
                />
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={rainfallAnomaly}
                  onChange={(e) => setRainfallAnomaly(parseInt(e.target.value, 10))}
                  className="w-1/2 h-2 bg-slate-300 rounded-lg accent-[#008F83]"
                />
              </div>
              <span className="text-[9px] text-[#62768A] font-mono block mt-1">Max 3 orthogonal dimensions</span>
            </div>
          )}

          <div>
            <button
              onClick={() => runSimulation(activeScenario)}
              disabled={isSimulating}
              className="w-full px-5 py-3 min-h-[44px] rounded-xl bg-[#008F83] text-white border-2 border-[#0B1726] font-heading font-bold text-xs shadow-[2px_2px_0px_#0B1726] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0B1726] transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <span className="flex items-center gap-1.5 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating...
                </span>
              ) : (
                'Run Scenario Simulation'
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FEF2F2] border border-[#E53E3E] rounded-xl text-xs text-[#E53E3E] font-medium">
            {errorMsg}
          </div>
        )}
      </div>

      {/* 4. Results Section: Baseline vs Scenario Comparative Deltas Table */}
      {simResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-[#0B1726] p-6 shadow-[4px_4px_0px_#0B1726] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-[#0B1726]/10 gap-3">
              <div>
                <span className="text-[10px] font-mono text-[#62768A] uppercase">
                  Scenario Execution ID: {simResult.scenario_id}
                </span>
                <h3 className="font-heading font-black text-xl text-[#0B1726] mt-0.5">
                  Comparative Delta Evaluation: {simResult.scenario_type.replace(/_/g, ' ')}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#DCEFF0] border border-[#008F83]/40 text-[#006B65] text-xs font-mono font-bold uppercase">
                  {simResult.applicability || 'APPLICABLE'}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-xs font-mono font-bold uppercase">
                  {simResult.classification}
                </span>
              </div>
            </div>

            {/* Baseline vs Scenario Delta Table */}
            {simResult.deltas && simResult.deltas.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F7F3EA] border-b-2 border-[#0B1726]/20 text-[#0B1726] font-heading font-black">
                      <th className="py-3 px-3">Indicator</th>
                      <th className="py-3 px-3 text-right">Baseline</th>
                      <th className="py-3 px-3 text-right">Scenario</th>
                      <th className="py-3 px-3 text-right">Absolute Delta</th>
                      <th className="py-3 px-3 text-right">Relative Shift</th>
                      <th className="py-3 px-3 text-center">Baseline Severity</th>
                      <th className="py-3 px-3 text-center">Scenario Severity</th>
                      <th className="py-3 px-3 text-center">Direction</th>
                      <th className="py-3 px-3">Scientific Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0B1726]/10">
                    {simResult.deltas.map((d: IndicatorDelta, idx: number) => (
                      <tr key={idx} className="hover:bg-[#FDFBF7] transition-colors">
                        <td className="py-3 px-3 font-heading font-bold text-[#0B1726]">
                          {d.indicator_name.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#62768A]">
                          {d.baseline_value.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#0B1726]">
                          {d.scenario_value.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          <span className={d.absolute_delta > 0 ? 'text-[#E53E3E]' : d.absolute_delta < 0 ? 'text-[#2F7D4A]' : 'text-[#62768A]'}>
                            {d.absolute_delta > 0 ? `+${d.absolute_delta.toFixed(1)}` : d.absolute_delta.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          {d.relative_delta_pct !== null && d.relative_delta_pct !== undefined ? (
                            <span className={d.relative_delta_pct > 0 ? 'text-[#E53E3E]' : d.relative_delta_pct < 0 ? 'text-[#2F7D4A]' : 'text-[#62768A]'}>
                              {d.relative_delta_pct > 0 ? `+${d.relative_delta_pct.toFixed(1)}%` : `${d.relative_delta_pct.toFixed(1)}%`}
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getSeverityBadgeVariant(d.baseline_category)}`}>
                            {d.baseline_category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getSeverityBadgeVariant(d.scenario_category)}`}>
                            {d.scenario_category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1 font-heading font-bold text-[11px]">
                            {renderDirectionIcon(d.direction)}
                            <span>{d.direction}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#435466] text-[11px] leading-relaxed max-w-xs font-sans">
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
              <div className="p-5 bg-[#F7F3EA] rounded-xl border-2 border-[#0B1726] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#008F83]" />
                    <h4 className="font-heading font-black text-xs text-[#0B1726] uppercase tracking-wider">
                      Parameter Range Envelope: {simResult.envelope.indicator_name.replace(/_/g, ' ')}
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#62768A] font-mono">
                    Deterministic Extremes & Central Tendency
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15">
                    <span className="text-[10px] text-[#62768A] uppercase font-heading font-bold block">Minimum Boundary</span>
                    <strong className="text-base font-mono text-[#0B1726]">{simResult.envelope.min_value.toFixed(1)}</strong>
                    <div className="mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${getSeverityBadgeVariant(simResult.envelope.min_category)}`}>
                        {simResult.envelope.min_category}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15">
                    <span className="text-[10px] text-[#62768A] uppercase font-heading font-bold block">Baseline Reference</span>
                    <strong className="text-base font-mono text-[#008F83]">{simResult.envelope.baseline_value.toFixed(1)}</strong>
                    <div className="mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${getSeverityBadgeVariant(simResult.envelope.baseline_category)}`}>
                        {simResult.envelope.baseline_category}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15">
                    <span className="text-[10px] text-[#62768A] uppercase font-heading font-bold block">Median Envelope</span>
                    <strong className="text-base font-mono text-[#0B1726]">{simResult.envelope.median_value.toFixed(1)}</strong>
                    <div className="mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${getSeverityBadgeVariant(simResult.envelope.median_category)}`}>
                        {simResult.envelope.median_category}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15">
                    <span className="text-[10px] text-[#62768A] uppercase font-heading font-bold block">Maximum Boundary</span>
                    <strong className="text-base font-mono text-[#E53E3E]">{simResult.envelope.max_value.toFixed(1)}</strong>
                    <div className="mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${getSeverityBadgeVariant(simResult.envelope.max_category)}`}>
                        {simResult.envelope.max_category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deterministic Sensitivity Response Curve Data */}
            {sensitivityResult && sensitivityResult.curve_points && sensitivityResult.curve_points.length > 0 && (
              <div className="p-5 bg-white rounded-xl border-2 border-[#0B1726] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#008F83]" />
                    <h4 className="font-heading font-black text-xs text-[#0B1726] uppercase tracking-wider">
                      Deterministic Parameter Response Curve ({sensitivityResult.parameter_name})
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#62768A] font-mono">
                    Step-Wise Perturbation Points (No ML Fitting)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {sensitivityResult.curve_points.map((pt, idx) => (
                    <div key={idx} className="bg-[#F7F3EA] p-3 rounded-xl border border-[#0B1726]/15 text-center space-y-1">
                      <span className="text-[10px] font-mono text-[#62768A] block">{pt.parameter_label}</span>
                      <strong className="text-xs font-mono text-[#0B1726] block">
                        {pt.indicator_values?.moisture_stress_pct !== undefined
                          ? `${pt.indicator_values.moisture_stress_pct.toFixed(1)}%`
                          : pt.indicator_values?.waterlogging_risk_pct !== undefined
                          ? `${pt.indicator_values.waterlogging_risk_pct.toFixed(1)}%`
                          : '—'}
                      </strong>
                      <span className="text-[9px] text-[#62768A] font-mono block">
                        Δ {pt.deltas?.moisture_stress_pct !== undefined ? `${pt.deltas.moisture_stress_pct > 0 ? '+' : ''}${pt.deltas.moisture_stress_pct.toFixed(1)}%` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Causal Explanation & Assumptions */}
            {simResult.explanation && (
              <div className="p-4 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-heading font-bold text-[#0B1726]">
                  <FileText className="w-4 h-4 text-[#008F83]" />
                  <span>Scientific Explanation & Non-Causal Attribution</span>
                </div>
                <p className="text-[#435466] leading-relaxed">
                  <strong className="text-[#0B1726]">Baseline Observation:</strong> {simResult.explanation.baseline_description}
                </p>
                <p className="text-[#435466] leading-relaxed">
                  <strong className="text-[#0B1726]">Perturbations Applied:</strong> {simResult.explanation.perturbations_applied.join(', ')}
                </p>
                <p className="text-[#435466] leading-relaxed">
                  <strong className="text-[#0B1726]">Indicator Shift Summary:</strong> {simResult.explanation.indicator_shift_summary}
                </p>
                <div className="p-3 bg-white rounded-lg border border-[#0B1726]/10 text-[11px] text-[#435466] italic font-sans">
                  "{simResult.explanation.non_causal_statement}"
                </div>
              </div>
            )}

            {/* Cryptographic Lineage & Provenance */}
            {simResult.provenance && (
              <div className="p-4 bg-[#0B1726] text-white rounded-xl font-mono text-[10px] space-y-1.5">
                <div className="flex items-center justify-between text-[#94A3B8] border-b border-white/10 pb-1 mb-1">
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-[#008F83]" /> Cryptographic Provenance & Lineage Fingerprint
                  </span>
                  <span>Version {simResult.provenance.scenario_version}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  <div>Parameter SHA-256: <span className="text-[#99E1DC]">{simResult.provenance.parameter_hash.substring(0, 16)}...</span></div>
                  <div>Dataset Fingerprint: <span className="text-white">{simResult.provenance.dataset_fingerprint}</span></div>
                  <div>Ground Anchor: <span className="text-white">{simResult.provenance.baseline_reference}</span></div>
                  <div>Engine Release: <span className="text-white">{simResult.provenance.engine_version}</span></div>
                </div>
              </div>
            )}

            {/* Explicit Disclaimer Notice */}
            <div className="p-4 bg-[#FEF6E9] rounded-xl border border-[#E5A33D] text-[#7A4B00] text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#E5A33D] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-heading font-black text-[#0B1726]">Mandatory Scientific Boundary</strong>
                <p className="text-[11px] text-[#7A4B00] leading-relaxed mt-0.5">
                  {simResult.scientific_disclaimer}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
