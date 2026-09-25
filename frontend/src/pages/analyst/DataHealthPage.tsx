import React from 'react';
import { ProvenanceCard } from '../../components/analyst/ProvenanceCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Database, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const DataHealthPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-900">
              Data Pipeline & Telemetry Health
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              External data source ingestion status, schema validation logs, and data freshness metrics.
            </p>
          </div>
          <Badge variant="demo" size="sm">Pipeline Health Monitor</Badge>
        </div>
      </Card>

      {/* Reusable Data Lineage and Provider Provenance Table */}
      <ProvenanceCard />

      {/* Ingestion Run Logs (Mock / Future Contract) */}
      <Card className="p-5">
        <CardHeader className="pb-3 border-b border-surface-border">
          <CardTitle className="text-base">
            Recent Data Ingestion Runs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="text-xs text-slate-600 space-y-2">
            <div className="p-3 bg-surface-muted rounded-xl flex items-center justify-between border border-surface-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Run #RUN-20260624-001 (Lucknow Boundary Ingestion)</span>
              </div>
              <Badge variant="emerald" size="sm">SUCCESS (440 Panchayats)</Badge>
            </div>
            <div className="p-3 bg-surface-muted rounded-xl flex items-center justify-between border border-surface-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Run #RUN-20260624-002 (NOAA CPC Teleconnections)</span>
              </div>
              <Badge variant="neutral" size="sm">NOT CONNECTED (Phase 3)</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
