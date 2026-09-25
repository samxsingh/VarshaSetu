import React from 'react';
import { Cpu, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface ModelMetadata {
  id: string;
  name: string;
  target: string;
  version: string;
  algorithm: string;
  lastTrained: string;
  lastValidated: string;
  dataPeriod: string;
  status: 'NOT_TRAINED' | 'TRAINING' | 'BENCHMARKED' | 'ACTIVE';
  brierSkillScore?: number;
  crpsScore?: number;
  rocAuc?: number;
  climatologyBaselineReference: string;
}

export const ModelMetricCard: React.FC<{ model: ModelMetadata }> = ({ model }) => {
  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 border-b border-surface-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-surface-muted border border-surface-border text-slate-700">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base">{model.name}</CardTitle>
                <p className="text-xs text-slate-500 font-mono">v{model.version} • {model.algorithm}</p>
              </div>
            </div>
            <Badge
              variant={
                model.status === 'ACTIVE'
                  ? 'emerald'
                  : model.status === 'BENCHMARKED'
                  ? 'azure'
                  : 'neutral'
              }
              size="sm"
            >
              {model.status === 'NOT_TRAINED' ? 'Not Trained' : model.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-3 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div>
              <span className="text-[11px] text-slate-400 block uppercase">Target</span>
              <strong className="text-slate-900">{model.target}</strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block uppercase">Data Period</span>
              <span className="text-slate-700">{model.dataPeriod}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block uppercase">Last Trained</span>
              <span className="text-slate-700">{model.lastTrained}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block uppercase">Last Validated</span>
              <span className="text-slate-700">{model.lastValidated}</span>
            </div>
          </div>

          {/* Validation Metrics Section */}
          <div className="bg-surface-muted/70 p-3 rounded-xl border border-surface-border space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Validation Metrics</span>
              <span>vs Climatology Baseline</span>
            </div>

            {model.status === 'NOT_TRAINED' ? (
              <div className="py-2 text-center text-slate-500 flex items-center justify-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Not evaluated yet (Model implementation scheduled for Phase 4)</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white p-2 rounded-lg border border-surface-border">
                  <span className="text-[10px] text-slate-400 block">Brier Skill</span>
                  <strong className="text-slate-900 font-heading text-sm">
                    {model.brierSkillScore !== undefined ? model.brierSkillScore.toFixed(3) : 'N/A'}
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-surface-border">
                  <span className="text-[10px] text-slate-400 block">CRPS</span>
                  <strong className="text-slate-900 font-heading text-sm">
                    {model.crpsScore !== undefined ? model.crpsScore.toFixed(2) : 'N/A'}
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-surface-border">
                  <span className="text-[10px] text-slate-400 block">ROC-AUC</span>
                  <strong className="text-slate-900 font-heading text-sm">
                    {model.rocAuc !== undefined ? model.rocAuc.toFixed(3) : 'N/A'}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </div>

      <div className="p-3 bg-slate-50 border-t border-surface-border rounded-b-xl text-[11px] text-slate-500 flex items-center justify-between">
        <span>Baseline: {model.climatologyBaselineReference}</span>
        <span className="font-mono text-[10px]">Phase 1B Shell</span>
      </div>
    </Card>
  );
};
