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

      {/* Feature Attribution Architecture (SHAP) */}
      <Card className="p-5">
        <CardHeader className="pb-3 border-b border-surface-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Feature Importance & Driver Attribution (SHAP Architecture)
            </CardTitle>
            <Badge variant="neutral" size="sm">Not Evaluated (Phase 1C Shell)</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
            <strong>Scientific Transparency Standard:</strong> Feature attribution values (SHAP / TreeSHAP) will be calculated dynamically by the Python FastAPI ML microservice upon model training in Phase 4. Zero synthetic SHAP scores are fabricated in this frontend shell.
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-heading font-semibold text-slate-700 uppercase tracking-wider text-[11px] block">
              Configured Feature Inputs for Downscaling Engine:
            </span>

            {[
              { name: 'MJO Phase & Amplitude (Wheeler-Hendon RMM Coordinates)', source: 'NOAA CPC / BoM' },
              { name: '850 hPa Cross-Equatorial Low-Level Westerly Jet Speed', source: 'NCMRWF / IMD Telemetry' },
              { name: 'Niño 3.4 Sea Surface Temperature Anomaly (°C)', source: 'NOAA CPC Monthly' },
              { name: 'Total Precipitable Water (TPW) Moisture Depth', source: 'INSAT-3D Satellite Radiometer' },
            ].map((feat, idx) => (
              <div key={idx} className="p-2.5 bg-surface-muted rounded-lg flex items-center justify-between border border-surface-border/60">
                <div>
                  <span className="font-medium text-slate-900 block">{feat.name}</span>
                  <span className="text-[10px] text-slate-500">Source: {feat.source}</span>
                </div>
                <Badge variant="neutral" size="sm">
                  Pending Phase 4 Model
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Source Ingestion Status */}
      <ProvenanceCard />
    </div>
  );
};
