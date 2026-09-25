import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FlaskConical, Play, Clock, CheckCircle2, History } from 'lucide-react';

export const ForecastLabPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-2xl text-slate-900">
                Forecast Validation & Hindcasting Lab
              </h1>
              <Badge variant="demo" size="sm">Phase 1B Shell</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Time-series walk-forward benchmarking against historical IMD 0.25° gridded rainfall data (1980–present)
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Play className="w-3.5 h-3.5" />}
            disabled
          >
            Run Hindcast Benchmark (Phase 4)
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reliability & Probability Calibration */}
        <Card className="p-5 space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-surface-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Probability Calibration Curve
              </CardTitle>
              <Badge variant="neutral" size="sm">Isotonic Scaling</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <p className="text-xs text-slate-600">
              Evaluates whether a predicted 70% dry-spell likelihood results in observed dry conditions exactly 70% of the time.
            </p>
            <div className="h-44 bg-surface-muted/60 rounded-xl border border-dashed border-surface-border flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
              <FlaskConical className="w-8 h-8 text-slate-400 mb-2" />
              <strong className="text-slate-800">Calibration Engine Scheduled for Phase 4</strong>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Walk-forward calibration curve will render using scikit-learn isotonic regression upon Python ML service connection.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Brier Skill Score Verification */}
        <Card className="p-5 space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-surface-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Brier Skill Score (BSS) vs Climatology
              </CardTitle>
              <Badge variant="neutral" size="sm">Strict Benchmarks</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <p className="text-xs text-slate-600">
              A model is only scientifically valid if its BSS exceeds 0.0 relative to the 30-year empirical climatology baseline.
            </p>
            <div className="h-44 bg-surface-muted/60 rounded-xl border border-dashed border-surface-border flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
              <History className="w-8 h-8 text-slate-400 mb-2" />
              <strong className="text-slate-800">30-Year Historical Baselines Configured</strong>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Climatological daily distributions for Lucknow District (1991–2020) will provide reference scores.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
