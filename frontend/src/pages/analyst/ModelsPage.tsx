import React from 'react';
import { ModelMetricCard, ModelMetadata } from '../../components/analyst/ModelMetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Cpu, AlertCircle } from 'lucide-react';

export const ModelsPage: React.FC = () => {
  const models: ModelMetadata[] = [
    {
      id: 'MOD-ONSET-XGB',
      name: 'Monsoon Onset Ensemble Model',
      target: 'MONSOON_ONSET',
      version: '0.4.1-alpha',
      algorithm: 'Gradient Boosted Trees (XGBoost) + MJO Lag Vectors',
      lastTrained: 'Scheduled Phase 4',
      lastValidated: 'Pending ML Engine',
      dataPeriod: '1982–2022 ERA5 / IMD',
      status: 'NOT_TRAINED',
      climatologyBaselineReference: 'Lucknow IMD 1991–2020 Normal',
    },
    {
      id: 'MOD-DRY-LGBM',
      name: 'Break Monsoon & Dry-Spell Hiatus Classifier',
      target: 'DRY_SPELL_BREAK',
      version: '0.3.0-alpha',
      algorithm: 'LightGBM Multi-output Binary Classifier',
      lastTrained: 'Scheduled Phase 4',
      lastValidated: 'Pending ML Engine',
      dataPeriod: '1982–2022 ERA5 / IMD',
      status: 'NOT_TRAINED',
      climatologyBaselineReference: 'Lucknow Daily Dry Day Frequency',
    },
    {
      id: 'MOD-HEAVY-RF',
      name: 'Heavy Rainfall Exceedance Probabilistic Model',
      target: 'HEAVY_RAIN',
      version: '0.2.8-alpha',
      algorithm: 'Random Forest Probability Calibrated Estimator',
      lastTrained: 'Scheduled Phase 4',
      lastValidated: 'Pending ML Engine',
      dataPeriod: '1990–2023 High-Res IMD Gridded',
      status: 'NOT_TRAINED',
      climatologyBaselineReference: '>65mm Historical Return Intervals',
    },
    {
      id: 'MOD-ANOMALY-RIDGE',
      name: 'Cumulative Precipitation Departure Regressor',
      target: 'RAINFALL_ANOMALY',
      version: '0.2.1-alpha',
      algorithm: 'Quantile Ridge Regression + Teleconnection Covariates',
      lastTrained: 'Scheduled Phase 4',
      lastValidated: 'Pending ML Engine',
      dataPeriod: '1980–2023 Monthly Climatology',
      status: 'NOT_TRAINED',
      climatologyBaselineReference: '30-Year Normal Lucknow (98.4mm late June)',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-2xl text-slate-900">
                Machine Learning Model Registry
              </h1>
              <Badge variant="demo" size="sm">Phase 1B Registry Shell</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Tracking model versions, hyperparameter sets, training cutoffs, and calibration benchmarks.
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            Status: All Models "Not Trained" (Phase 1B)
          </Badge>
        </div>
      </Card>

      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Scientific Transparency Invariant:</strong> In compliance with Phase 1A/1B guidelines, zero ML models have been pre-trained or falsely evaluated. Accuracy metrics display strictly as <em>"Not evaluated yet"</em> until the Python ML microservice is deployed in Phase 4.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((m) => (
          <ModelMetricCard key={m.id} model={m} />
        ))}
      </div>
    </div>
  );
};
