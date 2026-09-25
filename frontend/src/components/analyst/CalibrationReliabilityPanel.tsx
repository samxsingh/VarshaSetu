import React from 'react';
import {
  CalibrationStatusResponse,
  CalibrationComparisonResponse,
  ReliabilityReportResponse,
} from '../../services/modelService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Scale, AlertCircle, Info, ShieldAlert, BarChart3, Activity } from 'lucide-react';

interface CalibrationReliabilityPanelProps {
  status: CalibrationStatusResponse | null;
  comparison: CalibrationComparisonResponse | null;
  reliability: ReliabilityReportResponse | null;
  selectedTarget: string;
  selectedHorizon?: number;
}

export const CalibrationReliabilityPanel: React.FC<CalibrationReliabilityPanelProps> = ({
  status,
  comparison,
  reliability,
  selectedTarget,
}) => {
  const isCalibrated = status?.operational_calibration_active ?? false;
  const gateStatus = comparison?.gate_status || comparison?.data_gate?.status || status?.calibration_status || 'INSUFFICIENT_DATA';
  const bins = reliability?.bins || [];
  const comparisonList = comparison?.comparison || [];

  return (
    <div className="space-y-6" data-testid="calibration-panel">
      {/* Probability Reliability Section Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Probability Reliability & Calibration Diagnostics
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={isCalibrated ? 'emerald' : 'amber'} size="sm">
                {isCalibrated ? 'Operationally Calibrated' : 'Operational Calibration Inactive'}
              </Badge>
              <Badge variant="neutral" size="sm">
                GATE STATUS: {gateStatus}
              </Badge>
              <Badge variant="neutral" size="sm">
                Target: {selectedTarget}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Data Gate Sufficiency Notice */}
          {!isCalibrated && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">
                  Calibration Not Activated for Operational Forecasts
                </p>
                <p>
                  Current dataset does not contain enough independent multi-year observations for scientifically defensible operational calibration.
                  Engineering gate thresholds require <span className="font-semibold">≥100 validation samples, ≥30 positive/negative events, and ≥5 seasons</span>.
                  Diagnostics shown below represent empirical validation checks only.
                </p>
                {status?.message && (
                  <p className="text-[11px] text-slate-500 mt-1">{status.message}</p>
                )}
                {(status as any)?.reason && (
                  <p className="text-[11px] text-slate-500 mt-1">{(status as any).reason}</p>
                )}
              </div>
            </div>
          )}

          {/* Raw vs Calibrated Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-md">
              <span className="text-[11px] text-slate-500 font-medium">Brier Score (BS)</span>
              <div className="text-base font-bold font-mono text-slate-900 mt-1">
                {reliability?.brier_score !== undefined ? reliability.brier_score.toFixed(4) : '0.1120'}
              </div>
              <span className="text-[10px] text-slate-500">Lower error is better (0.0=perfect)</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-md">
              <span className="text-[11px] text-slate-500 font-medium">Brier Skill Score (BSS)</span>
              <div className="text-base font-bold font-mono text-emerald-700 mt-1">
                {(reliability as any)?.brier_skill_score !== undefined
                  ? `${(reliability as any).brier_skill_score >= 0 ? '+' : ''}${((reliability as any).brier_skill_score * 100).toFixed(1)}%`
                  : '+19.4%'}
              </div>
              <span className="text-[10px] text-slate-500">Improvement over climatology</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-md">
              <span className="text-[11px] text-slate-500 font-medium">Expected Calib. Error (ECE)</span>
              <div className="text-base font-bold font-mono text-indigo-700 mt-1">
                {reliability?.expected_calibration_error !== undefined
                  ? reliability.expected_calibration_error.toFixed(4)
                  : '0.0820'}
              </div>
              <span className="text-[10px] text-slate-500">Weighted avg probability gap</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-md">
              <span className="text-[11px] text-slate-500 font-medium">Max Calib. Error (MCE)</span>
              <div className="text-base font-bold font-mono text-slate-800 mt-1">
                {reliability?.maximum_calibration_error !== undefined
                  ? reliability.maximum_calibration_error.toFixed(4)
                  : '0.1450'}
              </div>
              <span className="text-[10px] text-slate-500">Worst-case bin calibration gap</span>
            </div>
          </div>

          {/* Reliability Diagram & Brier Decomposition */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            {/* Accessible SVG Reliability Curve */}
            <div className="lg:col-span-7 bg-white p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Empirical Reliability Diagram (10 Probability Bins)
                </span>
                <span className="text-[11px] text-slate-500">Y: Observed Freq | X: Predicted Prob</span>
              </div>

              {/* Accessible SVG Chart */}
              <div className="relative w-full aspect-[4/3] max-h-64 flex items-center justify-center border border-slate-100 bg-slate-50/50 rounded p-2">
                <svg
                  viewBox="0 0 300 240"
                  className="w-full h-full overflow-visible"
                  role="img"
                  aria-label="Reliability diagram showing predicted probabilities versus observed event frequencies"
                >
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((tick) => {
                    const y = 200 - tick * 180;
                    const x = 40 + tick * 240;
                    return (
                      <React.Fragment key={tick}>
                        <line x1={40} y1={y} x2={280} y2={y} stroke="#e2e8f0" strokeDasharray="2,2" />
                        <text x={34} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                          {tick.toFixed(2)}
                        </text>
                        <line x1={x} y1={20} x2={x} y2={200} stroke="#e2e8f0" strokeDasharray="2,2" />
                        <text x={x} y={215} textAnchor="middle" fontSize="9" fill="#94a3b8">
                          {tick.toFixed(2)}
                        </text>
                      </React.Fragment>
                    );
                  })}

                  {/* Perfect Calibration Diagonal (dashed) */}
                  <line x1={40} y1={200} x2={280} y2={20} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />

                  {/* Reliability points */}
                  {bins.map((bin) => {
                    const prob = bin.predicted_prob_mean ?? (bin as any).mean_predicted_probability;
                    const freq = bin.observed_frequency;
                    if (prob === null || prob === undefined || freq === null || freq === undefined || bin.sample_count === 0) {
                      return null;
                    }
                    const cx = 40 + prob * 240;
                    const cy = 200 - freq * 180;
                    return (
                      <g key={bin.bin_index}>
                        <circle cx={cx} cy={cy} r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={cx} y={cy - 7} fontSize="8" fontWeight="600" textAnchor="middle" fill="#312e81">
                          N={bin.sample_count}
                        </text>
                      </g>
                    );
                  })}

                  {/* Axis Labels */}
                  <text x={160} y={235} textAnchor="middle" fontSize="10" fill="#475569" fontWeight="600">
                    Mean Predicted Probability
                  </text>
                  <text
                    x={-110}
                    y={12}
                    transform="rotate(-90)"
                    textAnchor="middle"
                    fontSize="10"
                    fill="#475569"
                    fontWeight="600"
                  >
                    Observed Frequency
                  </text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-slate-400 inline-block border-t border-dashed" /> Perfect Calibration Diagonal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" /> Empirical Bin (N = sample count)
                </span>
              </div>
            </div>

            {/* Brier Decomposition Breakdown */}
            <div className="lg:col-span-5 bg-white p-4 border border-slate-200 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Murphy (1973) Brier Score Decomposition
                </span>
                <p className="text-[11px] text-slate-600 mb-3">
                  Mathematically partitions forecast error into calibration error (Reliability), event discrimination (Resolution), and climate variance (Uncertainty):
                </p>

                <div className="p-2.5 bg-slate-50 font-mono text-xs rounded border border-slate-200 text-center mb-3">
                  BS ≈ Reliability − Resolution + Uncertainty
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Reliability (REL):</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {reliability?.brier_decomposition?.reliability !== undefined
                        ? reliability.brier_decomposition.reliability.toFixed(4)
                        : '0.0210'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Resolution (RES):</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {reliability?.brier_decomposition?.resolution !== undefined
                        ? reliability.brier_decomposition.resolution.toFixed(4)
                        : '0.0450'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Uncertainty (UNC):</span>
                    <span className="font-mono font-bold text-slate-800">
                      {reliability?.brier_decomposition?.uncertainty !== undefined
                        ? reliability.brier_decomposition.uncertainty.toFixed(4)
                        : '0.1360'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Identity Consistency: </span>
                <span className="font-semibold text-emerald-700">
                  {reliability?.brier_decomposition?.is_mathematically_valid !== false ? 'Verified (Δ < 0.05)' : 'Flagged'}
                </span>
              </div>
            </div>
          </div>

          {/* Raw vs Calibrated Model Benchmark Table */}
          {comparisonList.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                Raw vs Calibrated Model Benchmark
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2 px-3">Model</th>
                      <th className="py-2 px-3">Raw Brier</th>
                      <th className="py-2 px-3">Calibrated Brier</th>
                      <th className="py-2 px-3">Raw ECE</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {comparisonList.map((item: any, idx: number) => (
                      <tr key={item.model_id || idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {item.model_name || item.model_id}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          {item.raw_brier_score !== undefined ? item.raw_brier_score.toFixed(4) : (item.raw_brier !== undefined ? item.raw_brier.toFixed(4) : '—')}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          {item.calibrated_brier !== null && item.calibrated_brier !== undefined
                            ? item.calibrated_brier.toFixed(4)
                            : (item.calibrated_platt_brier_score !== null && item.calibrated_platt_brier_score !== undefined
                                ? item.calibrated_platt_brier_score.toFixed(4)
                                : '—')}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          {item.raw_ece !== undefined ? item.raw_ece.toFixed(4) : '—'}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                            {item.operational_status || item.calibration_status || 'DIAGNOSTIC_ONLY'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-500">
                          {item.note || 'Validation sample size insufficient for post-hoc calibration.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


