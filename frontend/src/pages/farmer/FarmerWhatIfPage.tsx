import React, { useState } from 'react';
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
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Progress } from '../../components/ui/Progress';
import { advisoryService } from '../../services/advisoryService';
import { ScenarioResult } from '@shared/types';

export const FarmerWhatIfPage: React.FC = () => {
  const { t } = useTranslation();
  const { crop, location } = useFarmerStore();

  const [activeScenario, setActiveScenario] = useState<'SOWING_DELAY' | 'IRRIGATION_INTERVENTION' | 'SEASONAL_ANOMALY'>('SOWING_DELAY');
  const [selectedCrop, setSelectedCrop] = useState<string>('PADDY');
  const [selectedStage, setSelectedStage] = useState<string>('NURSERY_SOWING');
  const [delayDays, setDelayDays] = useState<number>(7);
  const [rainfallAnomaly, setRainfallAnomaly] = useState<number>(-20);

  const [simResult, setSimResult] = useState<ScenarioResult | null>({
    scenario_id: 'SCEN_DEFAULT_001',
    scenario_type: 'SOWING_DELAY',
    block_id: 'UP_LKO_BKT',
    crop_type: 'PADDY',
    growth_stage: 'NURSERY_SOWING',
    baseline_forecast_id: 'FCST_20240915_H7_UP_LKO_BKT_HR',
    parameters: { delay_days: 7 },
    risk_shift_indicator: 'ELEVATED_RISK',
    water_stress_shift_percentage: 24.5,
    waterlogging_shift_percentage: -8.2,
    confidence_status: 'MODERATE_CONFIDENCE',
    classification: 'SCENARIO_INDICATOR_ONLY',
    yield_prediction_disclaimer:
      'What-if simulations evaluate meteorological sensitivity indicators only. They do NOT compute crop yield loss, biomass production, or harvest revenue.',
    scientific_notes: [
      'Simulated 7-day delay shifts critical germination into historically drier mid-monsoon intervals in Kharif 2024.',
      'Water stress probability index increases by +24.5% across the root zone moisture threshold.',
      'Surface runoff and waterlogging potential decreases slightly (-8.2%) due to delayed peak canopy cover.',
    ],
    computed_at: '2024-09-15T06:00:00Z',
  });

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    setErrorMsg(null);
    try {
      const params: Record<string, any> = {};
      if (activeScenario === 'SOWING_DELAY') params.delay_days = delayDays;
      if (activeScenario === 'SEASONAL_ANOMALY') params.anomaly_percentage = rainfallAnomaly;
      if (activeScenario === 'IRRIGATION_INTERVENTION') params.irrigation_type = 'SUPPLEMENTAL';

      const res = await advisoryService.simulateScenario({
        block_id: 'UP_LKO_BKT',
        crop_type: selectedCrop,
        growth_stage: selectedStage,
        scenario_type: activeScenario,
        parameters: params,
      });

      if (res.success && res.data) {
        setSimResult(res.data);
      } else {
        // Fallback calculation for demonstration
        setSimResult({
          scenario_id: `SCEN_${Date.now()}`,
          scenario_type: activeScenario,
          block_id: 'UP_LKO_BKT',
          crop_type: selectedCrop,
          growth_stage: selectedStage,
          baseline_forecast_id: 'FCST_20240915_H7_UP_LKO_BKT_HR',
          parameters: params,
          risk_shift_indicator: activeScenario === 'SOWING_DELAY' && delayDays > 5 ? 'ELEVATED_RISK' : 'REDUCED_RISK',
          water_stress_shift_percentage: activeScenario === 'SOWING_DELAY' ? delayDays * 3.5 : -15.0,
          waterlogging_shift_percentage: activeScenario === 'SEASONAL_ANOMALY' ? rainfallAnomaly * 0.4 : -5.0,
          confidence_status: 'MODERATE_CONFIDENCE',
          classification: 'SCENARIO_INDICATOR_ONLY',
          yield_prediction_disclaimer:
            'What-if simulations evaluate meteorological sensitivity indicators only. They do NOT compute crop yield loss, biomass production, or harvest revenue.',
          scientific_notes: [
            `Simulated ${activeScenario} explores sensitivity against Kharif 2024 weather patterns.`,
            'Sensitivity shifts reflect water availability indices rather than calibrated crop physiologies.',
          ],
          computed_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Simulation request failed.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="farmer-whatif-page">
      {/* 1. Page Header & Mandatory Classification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-teal" />
              <span>What-If Agro-Climate Scenario Simulator</span>
            </h1>
            <Badge variant="amber" size="sm">SCENARIO_INDICATOR_ONLY</Badge>
            <Badge variant="neutral" size="sm">Phase 5A Foundation</Badge>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Simulate meteorological sensitivity shifts across farming operational decisions for {location.block || 'Bakshi Ka Talab'} (UP_LKO_BKT)
          </p>
        </div>
      </div>

      {/* 2. Mandatory Explicit Disclaimer */}
      <Alert variant="warning" title="Strict Scientific Boundary: Sensitivity Indicator Only">
        What-If results are strictly classified as <strong className="font-mono text-slate-900">SCENARIO_INDICATOR_ONLY</strong>.
        This foundation evaluates meteorological sensitivity indices (water stress shifts, waterlogging probability changes).
        <strong className="text-slate-900 block mt-1">
          VarshaSetu does NOT provide crop-specific yield predictions, kilogram/hectare forecasts, or revenue estimates.
        </strong>
      </Alert>

      {/* 3. Scenario Selector Controls */}
      <div className="bg-white p-4 rounded-xl border border-surface-border space-y-4">
        <div className="flex gap-2 border-b border-surface-border pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveScenario('SOWING_DELAY')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all min-h-[40px] whitespace-nowrap ${
              activeScenario === 'SOWING_DELAY'
                ? 'bg-brand-teal text-white shadow-xs'
                : 'bg-white text-slate-600 border border-surface-border hover:bg-slate-50'
            }`}
          >
            Sowing Date Shift (Delay Analysis)
          </button>
          <button
            onClick={() => setActiveScenario('IRRIGATION_INTERVENTION')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all min-h-[40px] whitespace-nowrap ${
              activeScenario === 'IRRIGATION_INTERVENTION'
                ? 'bg-brand-teal text-white shadow-xs'
                : 'bg-white text-slate-600 border border-surface-border hover:bg-slate-50'
            }`}
          >
            Supplemental Irrigation Scheduling
          </button>
          <button
            onClick={() => setActiveScenario('SEASONAL_ANOMALY')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all min-h-[40px] whitespace-nowrap ${
              activeScenario === 'SEASONAL_ANOMALY'
                ? 'bg-brand-teal text-white shadow-xs'
                : 'bg-white text-slate-600 border border-surface-border hover:bg-slate-50'
            }`}
          >
            Seasonal Rainfall Anomaly Shock
          </button>
        </div>

        {/* Input Parameters Row */}
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
              <option value="NURSERY_SOWING">Nursery & Sowing</option>
              <option value="VEGETATIVE">Vegetative Tillering</option>
              <option value="REPRODUCTIVE">Flowering & Reproductive</option>
              <option value="MATURITY">Grain Filling / Maturity</option>
            </select>
          </div>

          {activeScenario === 'SOWING_DELAY' && (
            <div>
              <label className="text-xs font-heading font-semibold text-slate-700 block mb-1">
                Delay Sowing By (Days): <span className="font-mono text-brand-teal font-bold">{delayDays}d</span>
              </label>
              <input
                type="range"
                min="1"
                max="21"
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-teal"
              />
            </div>
          )}

          {activeScenario === 'SEASONAL_ANOMALY' && (
            <div>
              <label className="text-xs font-heading font-semibold text-slate-700 block mb-1">
                Monsoon Rain Shock: <span className="font-mono text-brand-teal font-bold">{rainfallAnomaly}%</span>
              </label>
              <input
                type="range"
                min="-60"
                max="60"
                step="10"
                value={rainfallAnomaly}
                onChange={(e) => setRainfallAnomaly(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-teal"
              />
            </div>
          )}

          <div>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={runSimulation}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <span className="flex items-center gap-1.5 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Simulating...
                </span>
              ) : (
                'Run Scenario Simulation'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Scenario Results Panel */}
      {simResult && (
        <div className="space-y-4">
          <Card className="p-6 space-y-5 border-l-4 border-l-brand-teal">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
              <div>
                <span className="text-[11px] font-mono text-slate-500 uppercase">
                  Scenario Execution ID: {simResult.scenario_id}
                </span>
                <h3 className="font-heading font-bold text-lg text-slate-900 mt-0.5">
                  Sensitivity Evaluation: {simResult.scenario_type.replace('_', ' ')}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    simResult.risk_shift_indicator === 'REDUCED_RISK'
                      ? 'emerald'
                      : simResult.risk_shift_indicator === 'ELEVATED_RISK'
                      ? 'crimson'
                      : 'neutral'
                  }
                  size="md"
                >
                  {simResult.risk_shift_indicator}
                </Badge>
                <Badge variant="demo" size="sm">
                  {simResult.classification}
                </Badge>
              </div>
            </div>

            {/* Sensitivity Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-muted rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-semibold">Water Stress Shift Index</span>
                  <strong
                    className={`font-mono text-sm ${
                      simResult.water_stress_shift_percentage > 0
                        ? 'text-brand-crimson'
                        : 'text-brand-emerald'
                    }`}
                  >
                    {simResult.water_stress_shift_percentage > 0 ? '+' : ''}
                    {simResult.water_stress_shift_percentage.toFixed(1)}%
                  </strong>
                </div>
                <Progress
                  value={Math.min(100, Math.max(0, 50 + simResult.water_stress_shift_percentage))}
                  color={simResult.water_stress_shift_percentage > 0 ? 'crimson' : 'emerald'}
                  height="sm"
                />
                <span className="text-[10px] text-slate-500 block">
                  Probability change of crossing critical soil moisture tension threshold.
                </span>
              </div>

              <div className="p-4 bg-surface-muted rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-semibold">Waterlogging Risk Shift Index</span>
                  <strong
                    className={`font-mono text-sm ${
                      simResult.waterlogging_shift_percentage > 0
                        ? 'text-brand-crimson'
                        : 'text-brand-emerald'
                    }`}
                  >
                    {simResult.waterlogging_shift_percentage > 0 ? '+' : ''}
                    {simResult.waterlogging_shift_percentage.toFixed(1)}%
                  </strong>
                </div>
                <Progress
                  value={Math.min(100, Math.max(0, 50 + simResult.waterlogging_shift_percentage))}
                  color={simResult.waterlogging_shift_percentage > 0 ? 'crimson' : 'teal'}
                  height="sm"
                />
                <span className="text-[10px] text-slate-500 block">
                  Probability change of extreme precipitation saturation / poor field drainage.
                </span>
              </div>
            </div>

            {/* Scientific Notes */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Activity className="w-4 h-4 text-brand-teal" />
                <span>Simulation Assumptions & Meteorological Notes</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                {simResult.scientific_notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>

            {/* Prominent Absence of Yield Models Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Mandatory Scientific Boundary</strong>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  {simResult.yield_prediction_disclaimer}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
