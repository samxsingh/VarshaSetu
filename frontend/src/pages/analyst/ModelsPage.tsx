import React, { useEffect, useState } from 'react';
import {
  modelService,
  ModelStatusResponse,
  ExperimentRecordItem,
} from '../../services/modelService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Cpu,
  AlertCircle,
  Activity,
  CheckCircle2,
  RefreshCw,
  GitCommit,
  FlaskConical,
  Scale,
  Calendar,
  Layers,
} from 'lucide-react';

export const ModelsPage: React.FC = () => {
  const [status, setStatus] = useState<ModelStatusResponse | null>(null);
  const [experiments, setExperiments] = useState<ExperimentRecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [training, setTraining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [statusRes, expRes] = await Promise.all([
        modelService.getStatus(),
        modelService.getExperiments(),
      ]);

      if (statusRes.success) setStatus(statusRes.data);
      if (expRes.success) setExperiments(expRes.data.experiments);
    } catch (err: any) {
      setError(err?.message || 'Failed to load model registry telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleTrain = async () => {
    try {
      setTraining(true);
      await modelService.trainBaselines('ALL');
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to train baseline models.');
    } finally {
      setTraining(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st.toUpperCase()) {
      case 'EVALUATED':
      case 'BASELINE_EVALUATION_ACTIVE':
      case 'HEALTHY':
        return <Badge variant="emerald" size="sm">{st}</Badge>;
      case 'TRAINING':
      case 'WARNING':
        return <Badge variant="amber" size="sm">{st}</Badge>;
      case 'NOT_CALIBRATED':
      case 'INSUFFICIENT_DATA':
        return <Badge variant="neutral" size="sm">{st}</Badge>;
      case 'FAILED':
        return <Badge variant="crimson" size="sm">{st}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-2xl text-slate-900">
                Machine Learning Model & Experiment Registry
              </h1>
              <Badge variant="teal" size="sm">Phase 4A Baseline Stage</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Tracking model versions, empirical climatology benchmarks, chronological splits, and probability calibration.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTrain}
              disabled={training}
              className="flex items-center gap-1.5 text-xs"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              {training ? 'Training Baselines...' : 'Train Baselines'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Scientific Transparency Notice */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong>Scientific Principle — "Complex intelligence underneath. Simple decisions on top."</strong>
          <p className="mt-0.5 text-emerald-800">
            Phase 4A establishes transparent baseline models (Penalized Logistic Regression & Ridge Regression) evaluated strictly against historical climatology on non-overlapping chronological splits. Operational ensemble downscaling (XGBoost/LightGBM) will be introduced in Phase 4B.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Readiness & Active Baselines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pipeline Stage</span>
            <Cpu className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-lg font-heading font-bold text-slate-900">
            {status ? status.phase : 'Loading...'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {status?.message || 'Connecting to ML microservice...'}
          </span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Operational Inference</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-lg font-heading font-bold text-amber-700">
            {status?.operational_inference_available ? 'OPERATIONAL' : 'INACTIVE (Baseline Stage)'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Zero fake forecasts; production model pending Phase 4B.
          </span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Audited Experiments</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-xl font-heading font-bold text-slate-900">
            {experiments.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Logged to reproducible JSON artifact registry
          </span>
        </Card>
      </div>

      {/* Experiments Registry Table */}
      <Card className="p-5">
        <CardHeader className="pb-3 border-b border-surface-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-600" />
              <CardTitle>Baseline Forecasting Experiments</CardTitle>
            </div>
            <Badge variant="neutral" size="sm">
              Non-Random Chronological Split (70/15/15)
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-border text-slate-500 font-heading font-semibold uppercase tracking-wider text-[11px]">
                  <th className="pb-2.5">Experiment / Target</th>
                  <th className="pb-2.5">Model</th>
                  <th className="pb-2.5">Horizon</th>
                  <th className="pb-2.5">Test Metrics</th>
                  <th className="pb-2.5">Climatology Comparison</th>
                  <th className="pb-2.5">Calibration</th>
                  <th className="pb-2.5">Git Commit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {experiments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      {loading ? 'Loading experiments...' : 'No baseline experiments registered yet. Click "Train Baselines" to execute.'}
                    </td>
                  </tr>
                ) : (
                  experiments.map((exp) => {
                    const testM = exp.metrics?.test || {};
                    const comp = exp.comparison_to_climatology || {};
                    return (
                      <tr key={exp.experiment_id} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="py-3">
                          <span className="font-medium text-slate-900 block">{exp.target_name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{exp.experiment_id}</span>
                        </td>
                        <td className="py-3 font-mono text-[11px] text-slate-700">{exp.model_name}</td>
                        <td className="py-3 text-slate-600">{exp.horizon_days} Days</td>
                        <td className="py-3">
                          {testM.brier_score !== undefined && (
                            <span className="block font-mono text-[11px]">
                              Brier: <strong>{testM.brier_score}</strong>
                            </span>
                          )}
                          {testM.mae !== undefined && (
                            <span className="block font-mono text-[11px]">
                              MAE: <strong>{testM.mae} mm</strong>
                            </span>
                          )}
                          {testM.sample_count !== undefined && (
                            <span className="text-[10px] text-slate-400">
                              (N={testM.sample_count})
                            </span>
                          )}
                        </td>
                        <td className="py-3 max-w-[260px]">
                          {comp.brier_skill_score !== undefined && comp.brier_skill_score !== null ? (
                            <span className={`inline-block font-mono text-[11px] px-1.5 py-0.5 rounded ${comp.has_skill_over_climatology ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                              BSS: {comp.brier_skill_score > 0 ? `+${comp.brier_skill_score}` : comp.brier_skill_score}
                            </span>
                          ) : comp.mae_skill_score !== undefined && comp.mae_skill_score !== null ? (
                            <span className={`inline-block font-mono text-[11px] px-1.5 py-0.5 rounded ${comp.has_skill_over_climatology ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                              MSS: {comp.mae_skill_score > 0 ? `+${comp.mae_skill_score}` : comp.mae_skill_score}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Near-zero variance</span>
                          )}
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {comp.scientific_summary || 'Evaluated against climatology.'}
                          </p>
                        </td>
                        <td className="py-3">
                          {getStatusBadge(exp.calibration_status)}
                        </td>
                        <td className="py-3 font-mono text-[11px] text-slate-500">
                          {exp.git_commit ? (
                            <span className="flex items-center gap-1">
                              <GitCommit className="w-3 h-3 text-slate-400" />
                              {exp.git_commit}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
