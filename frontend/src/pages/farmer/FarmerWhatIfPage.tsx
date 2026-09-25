import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, AlertCircle, ArrowRightLeft, Droplets, Calendar, Sprout, CheckCircle2 } from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Progress } from '../../components/ui/Progress';

export const FarmerWhatIfPage: React.FC = () => {
  const { t } = useTranslation();
  const { crop, location } = useFarmerStore();
  const [activeScenario, setActiveScenario] = useState<'SOWING_DATE' | 'IRRIGATION' | 'CROP_SUBSTITUTION'>('SOWING_DATE');

  return (
    <div className="space-y-6">
      {/* Page Title & Mandatory Scientific Disclaimer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-teal" />
              <span>{t('simulator.title')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Simulate the agronomic and financial trade-offs of different farming decisions under projected monsoon behavior.
            </p>
          </div>
          <Badge variant="demo" size="sm">Simulated Engine</Badge>
        </div>

        {/* Mandatory Explicit Disclaimer */}
        <Alert variant="warning" title="Model-Based Agronomic Estimate">
          {t('common.disclaimer')}
        </Alert>
      </div>

      {/* Scenario Type Selector */}
      <div className="flex gap-2 border-b border-surface-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveScenario('SOWING_DATE')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all min-h-[40px] whitespace-nowrap ${
            activeScenario === 'SOWING_DATE'
              ? 'bg-brand-teal text-white shadow-xs'
              : 'bg-white text-slate-600 border border-surface-border hover:bg-slate-50'
          }`}
        >
          Sow Now vs Wait 7 Days
        </button>
        <button
          onClick={() => setActiveScenario('IRRIGATION')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all min-h-[40px] whitespace-nowrap ${
            activeScenario === 'IRRIGATION'
              ? 'bg-brand-teal text-white shadow-xs'
              : 'bg-white text-slate-600 border border-surface-border hover:bg-slate-50'
          }`}
        >
          Irrigate Now vs Wait for Rain
        </button>
        <button
          onClick={() => setActiveScenario('CROP_SUBSTITUTION')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all min-h-[40px] whitespace-nowrap ${
            activeScenario === 'CROP_SUBSTITUTION'
              ? 'bg-brand-teal text-white shadow-xs'
              : 'bg-white text-slate-600 border border-surface-border hover:bg-slate-50'
          }`}
        >
          Paddy vs Short-Duration Pulses
        </button>
      </div>

      {/* SCENARIO 1: SOWING TIMING COMPARISON */}
      {activeScenario === 'SOWING_DATE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OPTION A: SOW NOW */}
          <Card variant="accent" className="p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-surface-border">
                <div>
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-brand-teal">
                    Option A
                  </span>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mt-0.5">
                    Sow Nursery Now (June 26)
                  </h3>
                </div>
                <Badge variant="emerald" size="sm">Recommended</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Moisture Stress Risk</span>
                  <strong className="text-brand-emerald font-heading">18% (Low)</strong>
                </div>
                <Progress value={18} color="emerald" height="sm" />
              </div>

              <div className="p-3.5 bg-surface-muted rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                  <span>Key Advantages:</span>
                </div>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Germination coincides with peak monsoon arrival (June 26–28).</li>
                  <li>Produces healthy 22-day seedlings for transplanting by July 18.</li>
                  <li>Saves approx ₹1,800/acre in groundwater diesel pumping costs.</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-border text-xs text-slate-500">
              Verdict: Favorable soil saturation projected to exceed 65%.
            </div>
          </Card>

          {/* OPTION B: WAIT 7 DAYS */}
          <Card variant="warning" className="p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-surface-border">
                <div>
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-brand-amber">
                    Option B
                  </span>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mt-0.5">
                    Wait 7 Days (July 3)
                  </h3>
                </div>
                <Badge variant="amber" size="sm">High Risk</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Moisture Stress Risk</span>
                  <strong className="text-brand-amber font-heading">60% (High Alert)</strong>
                </div>
                <Progress value={60} color="amber" height="sm" />
              </div>

              <div className="p-3.5 bg-brand-amber-tint/40 rounded-xl space-y-2 text-xs border border-brand-amber-border/60">
                <div className="flex items-center gap-1.5 font-semibold text-brand-amber-dark">
                  <AlertCircle className="w-4 h-4 text-brand-amber" />
                  <span>Anticipated Complications:</span>
                </div>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  <li>Delayed sowing enters directly into projected 6-day dry break window.</li>
                  <li>Seedlings may require mandatory tubewell watering to avoid mortality.</li>
                  <li>Transplanting pushed into August, risking reduced Swarna panicle yields.</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-border text-xs text-slate-500">
              Verdict: Not recommended unless supplemental irrigation is guaranteed.
            </div>
          </Card>
        </div>
      )}

      {/* SCENARIO 2: IRRIGATION DECISION */}
      {activeScenario === 'IRRIGATION' && (
        <Card className="p-6 text-center space-y-3">
          <Droplets className="w-10 h-10 text-brand-azure mx-auto" />
          <h3 className="font-heading font-bold text-lg text-slate-900">
            Supplemental Irrigation Decision Module
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Compares water pump expenditure against forecast rainfall arrival to optimize water conservation.
          </p>
          <Badge variant="neutral" size="sm">Phase 5 Calculation Model</Badge>
        </Card>
      )}

      {/* SCENARIO 3: CROP SUBSTITUTION */}
      {activeScenario === 'CROP_SUBSTITUTION' && (
        <Card className="p-6 text-center space-y-3">
          <Sprout className="w-10 h-10 text-brand-emerald mx-auto" />
          <h3 className="font-heading font-bold text-lg text-slate-900">
            Crop Substitution & Contingency Planning
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Evaluates short-duration pulses (Moong/Urad) vs Paddy in the event of late July onset anomalies.
          </p>
          <Badge variant="neutral" size="sm">Phase 5 Calculation Model</Badge>
        </Card>
      )}
    </div>
  );
};
