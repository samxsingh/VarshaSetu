import React from 'react';
import { ClimateSignalCard } from '../../components/analyst/ClimateSignalCard';
import { ProvenanceCard } from '../../components/analyst/ProvenanceCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Activity, Cpu, Layers } from 'lucide-react';

export const AnalystOverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-900">
              Climate Science & Teleconnection Analytics
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Macro-scale ocean-atmosphere drivers and high-dimensional feature representations
            </p>
          </div>
          <Badge variant="demo" size="sm">Analytical Prototype</Badge>
        </div>
      </Card>

      {/* Global Teleconnections */}
      <ClimateSignalCard />

      {/* Feature Attribution Weights (SHAP preview) */}
      <Card className="p-5">
        <CardHeader className="pb-3 border-b border-surface-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Feature Importance & Driver Attribution (SHAP Analysis)
            </CardTitle>
            <Badge variant="neutral" size="sm">Pre-trained Ensemble Weights</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Relative weight of planetary indices vs regional boundary layer variables in triggering the 14-day dry spell forecast in Central UP:
          </p>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>MJO Phase 3 Propagation Speed</span>
                <strong>+0.34 SHAP</strong>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-teal h-full rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>850 hPa Cross-Equatorial Westerly Jet Speed</span>
                <strong>+0.28 SHAP</strong>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-azure h-full rounded-full" style={{ width: '56%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Niño 3.4 SST Anomaly (-0.34°C)</span>
                <strong>+0.16 SHAP</strong>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-emerald h-full rounded-full" style={{ width: '32%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Precipitable Water Depth (TPW)</span>
                <strong>+0.12 SHAP</strong>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-amber h-full rounded-full" style={{ width: '24%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source Ingestion Status */}
      <ProvenanceCard />
    </div>
  );
};
