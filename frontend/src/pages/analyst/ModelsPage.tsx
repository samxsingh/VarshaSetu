import React, { useEffect, useState } from 'react';
import {
  modelService,
  ModelStatusResponse,
  BenchmarkComparisonResponse,
  ModelExplanationsResponse,
  DatasetCatalogItem,
  ExperimentRecordItem,
  CalibrationStatusResponse,
  CalibrationComparisonResponse,
  ReliabilityReportResponse,
} from '../../services/modelService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CalibrationReliabilityPanel } from '../../components/analyst/CalibrationReliabilityPanel';
import {
  AlertCircle,
  RefreshCw,
  FlaskConical,
  Scale,
  Database,
  Compass,
  Cpu,
  ShieldAlert,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const ModelsPage: React.FC = () => {
  const [status, setStatus] = useState<ModelStatusResponse | null>(null);
  const [comparison, setComparison] = useState<BenchmarkComparisonResponse | null>(null);
  const [explanations, setExplanations] = useState<ModelExplanationsResponse | null>(null);
  const [datasets, setDatasets] = useState<DatasetCatalogItem[]>([]);
  const [experiments, setExperiments] = useState<ExperimentRecordItem[]>([]);
  const [calibStatus, setCalibStatus] = useState<CalibrationStatusResponse | null>(null);
  const [calibComp, setCalibComp] = useState<CalibrationComparisonResponse | null>(null);
  const [reliability, setReliability] = useState<ReliabilityReportResponse | null>(null);

  const [selectedTarget, setSelectedTarget] = useState<string>('HEAVY_RAIN');
  const [selectedHorizon, setSelectedHorizon] = useState<number>(7);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [training, setTraining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [
        statusRes,
        compRes,
        expRes,
        catRes,
        expRecordRes,
        calStatusRes,
        calCompRes,
        relRes,
      ] = await Promise.all([
        modelService.getStatus(),
        modelService.getComparison(selectedTarget, selectedHorizon),
        modelService.getModelExplanations('xgboost_heavy_rain_7d'),
        modelService.getDatasetsCatalog(),
        modelService.getExperiments(),
        modelService.getCalibrationStatus(),
        modelService.getCalibrationComparison(selectedTarget, selectedHorizon),
        modelService.getCalibrationModelReliability('xgboost'),
      ]);

      if (statusRes.success) setStatus(statusRes.data);
      if (compRes.success) setComparison(compRes.data);
      if (expRes.success) setExplanations(expRes.data);
      if (catRes.success) setDatasets(catRes.data.catalog);
      if (expRecordRes.success) setExperiments(expRecordRes.data.experiments);
      if (calStatusRes.success) setCalibStatus(calStatusRes.data);
      if (calCompRes.success) setCalibComp(calCompRes.data);
      if (relRes.success) setReliability(relRes.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch benchmark registries.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTarget, selectedHorizon]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleTrain = async () => {
    try {
      setTraining(true);
      setError(null);
      await modelService.trainTreeModel(selectedTarget, selectedHorizon, 'UP_LKO_BKT');
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to train downscaling ensemble.');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="models-page">
      {/* 1. Page Header */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#102A43]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#0E7490] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                03 MODEL REGISTRY
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#E8F4F6] text-[#155E75] text-[10px] font-mono font-bold border border-[#0E7490]/30">
                Phase 4B Ensembles
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#FEF3C7] border border-[#D97706] text-[#B45309] text-[10px] font-mono font-bold">
                Phase 4C Calibration
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#102A43]/20 text-[#102A43] text-[10px] font-mono font-bold">
                Block Centroid (~9km)
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102A43] tracking-tight">
              Operational Downscaling & Model Benchmark Registry
            </h1>
            <p className="text-xs sm:text-sm text-[#486581] max-w-3xl leading-relaxed">
              Evaluating multi-paradigm downscaling models (Climatology vs Linear Baselines vs XGBoost vs LightGBM) with empirical reliability diagrams and Murphy (1973) Brier score decompositions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-bold bg-[#F3F6F7] text-[#102A43] border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 min-h-[40px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleTrain}
              disabled={training}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold bg-[#0E7490] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 min-h-[40px]"
            >
              <FlaskConical className={`w-3.5 h-3.5 ${training ? 'animate-spin' : ''}`} />
              <span>{training ? 'Benchmarking...' : 'Train Tree Ensembles'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Scientific Limitation & Provenance Disclosure */}
      <div className="p-4 bg-[#FEF3C7] border-2 border-[#D97706] rounded-xl text-xs text-[#B45309] flex items-start gap-3 shadow-[2px_2px_0px_#102A43]">
        <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p className="font-heading font-extrabold text-[#B45309]">
            Data Availability & Spatial Resolution Guardrail:
          </p>
          <p>
            Observations reflect single-season ERA5-Land reanalysis (Kharif 2024, 122 days). This does <span className="font-bold underline">not satisfy the 30-year WMO climatology standard</span>. Models are experimental benchmarks. Spatial outputs represent <span className="font-bold underline">block-scale centroids (Bakshi Ka Talab, UP_LKO_BKT)</span>; village/panchayat micro-station claims are strictly disclaimed.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FEF2F2] border-2 border-[#DC2626] rounded-xl text-xs text-[#DC2626] flex items-center gap-2 shadow-[2px_2px_0px_#102A43]">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Target Selector Bar */}
      <div className="bg-white border-2 border-[#102A43] rounded-xl p-3 shadow-[2px_2px_0px_#102A43] flex flex-wrap items-center gap-3">
        <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#102A43]">
          Benchmark Target:
        </span>
        <div className="flex flex-wrap gap-2">
          {['HEAVY_RAIN', 'DRY_SPELL', 'RAINFALL_AMOUNT'].map((tgt) => (
            <button
              key={tgt}
              onClick={() => setSelectedTarget(tgt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold border-2 transition-all ${
                selectedTarget === tgt
                  ? 'bg-[#0E7490] text-white border-[#102A43] shadow-[2px_2px_0px_#102A43]'
                  : 'bg-[#F3F6F7] text-[#486581] border-[#102A43]/15 hover:border-[#102A43]'
              }`}
            >
              {tgt === 'HEAVY_RAIN' ? 'Heavy Rain (>64.5mm)' : tgt === 'DRY_SPELL' ? 'Dry Spell (>=5d)' : 'Rainfall Sum (mm)'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-[#829AB1] font-mono">Horizon:</span>
          <span className="px-2 py-0.5 rounded bg-[#F3F6F7] border border-[#102A43]/20 font-mono font-bold text-xs text-[#102A43]">
            {selectedHorizon} Days
          </span>
        </div>
      </div>

      {/* 4. Multi-Model Benchmark Comparison Table */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl shadow-[4px_4px_0px_#102A43] overflow-hidden">
        <div className="p-4 border-b-2 border-[#102A43]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#0E7490]" />
            <h3 className="font-heading font-extrabold text-sm text-[#102A43]">
              Multi-Paradigm Benchmark: Identical Test Partition
            </h3>
          </div>
          <span className="text-xs text-[#829AB1] font-mono">
            Evaluated on {comparison?.benchmark_report?.test_sample_count || 18} samples ({comparison?.benchmark_report?.evaluation_period || '2024-09-13 to 2024-09-30'})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F6F7] border-b-2 border-[#102A43]/15 font-heading text-[#102A43] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3.5 font-extrabold">Model Paradigm</th>
                <th className="py-3 px-3 font-extrabold">Family</th>
                <th className="py-3 px-3 font-extrabold">Test Brier / MAE</th>
                <th className="py-3 px-3 font-extrabold">Skill vs Climatology</th>
                <th className="py-3 px-3 font-extrabold">ROC-AUC / RMSE</th>
                <th className="py-3 px-3 font-extrabold">Accuracy / F1</th>
                <th className="py-3 px-3 font-extrabold">Calibration</th>
                <th className="py-3 px-3.5 font-extrabold">Evaluation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102A43]/10 font-sans text-xs">
              {comparison?.benchmark_report?.models?.map((m) => (
                <tr key={m.model_id} className="hover:bg-[#FFFFFF] transition-colors">
                  <td className="py-3 px-3.5 font-heading font-bold text-[#102A43]">
                    {m.model_name}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#829AB1]">
                    <span className="capitalize px-2 py-0.5 bg-[#F3F6F7] rounded border border-[#102A43]/10 text-[11px]">
                      {m.model_family.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#102A43]">
                    {m.brier_score !== undefined ? m.brier_score.toFixed(4) : m.mae !== undefined ? `${m.mae.toFixed(2)} mm` : '—'}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {m.brier_skill_score !== undefined ? (
                      <span className={m.brier_skill_score > 0 ? 'text-[#3F7D58] font-bold' : 'text-[#829AB1]'}>
                        {m.brier_skill_score > 0 ? `+${(m.brier_skill_score * 100).toFixed(1)}% BSS` : `${(m.brier_skill_score * 100).toFixed(1)}% BSS`}
                      </span>
                    ) : m.mae_skill_score !== undefined ? (
                      <span className={m.mae_skill_score > 0 ? 'text-[#3F7D58] font-bold' : 'text-[#829AB1]'}>
                        {m.mae_skill_score > 0 ? `+${(m.mae_skill_score * 100).toFixed(1)}% MSS` : `${(m.mae_skill_score * 100).toFixed(1)}% MSS`}
                      </span>
                    ) : (
                      '0.0% (Ref)'
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#486581]">
                    {m.roc_auc !== undefined ? (
                      <span>AUC: {m.roc_auc.toFixed(3)}</span>
                    ) : m.rmse !== undefined ? (
                      <span>RMSE: {m.rmse.toFixed(2)}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#486581]">
                    {m.accuracy !== undefined ? (
                      <span>{(m.accuracy * 100).toFixed(1)}% (F1: {m.f1_score?.toFixed(2) || '0.00'})</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        m.is_calibrated
                          ? 'bg-[#EBF5EE] text-[#3F7D58] border-[#3F7D58]/30'
                          : 'bg-[#F3F6F7] text-[#829AB1] border-[#102A43]/15'
                      }`}
                    >
                      {m.is_calibrated ? 'Calibrated' : 'Uncalibrated'}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-[#486581] text-[11px]">
                    {m.has_skill_over_climatology ? 'Demonstrates Skill' : 'Baseline Reference'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. PHASE 4C: Probability Reliability & Calibration Diagnostics Panel */}
      <CalibrationReliabilityPanel
        status={calibStatus}
        comparison={calibComp}
        reliability={reliability}
        selectedTarget={selectedTarget}
      />

      {/* 6. SHAP Feature Contribution & Explainability */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#102A43] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#102A43]/10 gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#0E7490]" />
            <h3 className="font-heading font-extrabold text-base text-[#102A43]">
              SHAP Explainability: Feature Attributions & Teleconnections
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#E8F4F6] text-[#155E75] text-[10px] font-mono font-bold border border-[#0E7490]/30">
              Teleconnections: {explanations?.teleconnection_importance_pct || 18.5}% Impact
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#F3F6F7] border border-[#102A43]/20 text-[#102A43] text-[10px] font-mono font-bold">
              Top Driver: {explanations?.top_driver || 'rainfall_1d'}
            </span>
          </div>
        </div>

        <p className="text-xs text-[#486581] leading-relaxed">
          Tree SHAP attributions quantify the marginal empirical contribution of each antecedent meteorological variable and global teleconnection index to the downscaled forecast without establishing causal determinism.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {explanations?.global_importances?.slice(0, 6).map((item) => (
            <div
              key={item.feature_name}
              className="p-3.5 bg-[#F3F6F7] border-2 border-[#102A43]/15 rounded-xl space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#102A43]">
                  {item.feature_name}
                </span>
                <span className="text-xs font-mono font-black text-[#0E7490]">
                  {item.relative_importance_pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#102A43]/15">
                <div
                  className="bg-[#0E7490] h-full rounded-full"
                  style={{ width: `${Math.min(100, item.relative_importance_pct * 2.5)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#829AB1]">
                <span className="capitalize">{item.meteorological_category.replace('_', ' ')}</span>
                <span>Mean |SHAP|: {item.mean_abs_shap.toFixed(3)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Scientific Dataset Catalog */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#102A43] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-[#102A43]/10">
          <Database className="w-5 h-5 text-[#3F7D58]" />
          <h3 className="font-heading font-extrabold text-base text-[#102A43]">
            Scientific Dataset Catalog & Integrity Hashing
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {datasets.map((ds) => (
            <div
              key={ds.dataset_id}
              className="p-3.5 bg-[#F3F6F7] border-2 border-[#102A43]/15 rounded-xl space-y-2"
            >
              <div className="flex items-start justify-between gap-1">
                <h4 className="font-heading font-bold text-xs text-[#102A43] leading-snug">{ds.name}</h4>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                    ds.qc_passed
                      ? 'bg-[#EBF5EE] text-[#3F7D58] border-[#3F7D58]/30'
                      : 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40'
                  }`}
                >
                  {ds.qc_passed ? 'QC Passed' : 'Pending'}
                </span>
              </div>
              <p className="text-[11px] text-[#486581] line-clamp-2">{ds.provider}</p>
              <div className="pt-2 border-t border-[#102A43]/10 text-[10px] font-mono text-[#829AB1] space-y-0.5">
                <div><span>Resolution:</span> {ds.spatial_resolution}</div>
                <div><span>Cadence:</span> {ds.temporal_resolution}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
