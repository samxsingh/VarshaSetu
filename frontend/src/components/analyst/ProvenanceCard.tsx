import React from 'react';
import { Database, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FreshnessStatus } from '@shared/types';

export interface DataSourceHealth {
  name: string;
  category: 'GLOBAL_CLIMATE' | 'REGIONAL_MET' | 'SPATIAL_GIS';
  provider: string;
  updateFrequency: string;
  lastSuccessfulUpdate: string;
  status: FreshnessStatus;
  connectionState: 'CONNECTED' | 'NOT_CONNECTED' | 'DEMO_MOCK';
  details: string;
}

export const ProvenanceCard: React.FC = () => {
  const dataSources: DataSourceHealth[] = [
    {
      name: 'NOAA Climate Prediction Center (ENSO / ONI)',
      category: 'GLOBAL_CLIMATE',
      provider: 'NOAA CPC (US Dept of Commerce)',
      updateFrequency: 'Monthly / Weekly Indices',
      lastSuccessfulUpdate: 'Scheduled Phase 3 Integration',
      status: 'UNAVAILABLE',
      connectionState: 'NOT_CONNECTED',
      details: 'Live FTP/HTTP pipeline not connected yet in Phase 1B.',
    },
    {
      name: 'Bureau of Meteorology (Indian Ocean Dipole)',
      category: 'GLOBAL_CLIMATE',
      provider: 'BoM Australia',
      updateFrequency: 'Weekly DMI NetCDF',
      lastSuccessfulUpdate: 'Scheduled Phase 3 Integration',
      status: 'UNAVAILABLE',
      connectionState: 'NOT_CONNECTED',
      details: 'Live BoM Southern Ocean pipeline pending Phase 3.',
    },
    {
      name: 'NOAA / BoM Real-Time Multivariate MJO (RMM)',
      category: 'GLOBAL_CLIMATE',
      provider: 'BoM / NOAA CPC',
      updateFrequency: 'Daily RMM1/RMM2 indices',
      lastSuccessfulUpdate: 'Scheduled Phase 3 Integration',
      status: 'UNAVAILABLE',
      connectionState: 'NOT_CONNECTED',
      details: 'MJO Wheeler-Hendon indices pipeline pending Phase 3.',
    },
    {
      name: 'IMD Gridded Daily Rainfall & Weather Observations',
      category: 'REGIONAL_MET',
      provider: 'India Meteorological Department (IMD)',
      updateFrequency: 'Daily 0.25° gridded NetCDF',
      lastSuccessfulUpdate: 'Scheduled Phase 3 Integration',
      status: 'UNAVAILABLE',
      connectionState: 'NOT_CONNECTED',
      details: 'High-resolution surface telemetry pending Phase 3.',
    },
    {
      name: 'Administrative Boundaries (Lucknow District Panchayats)',
      category: 'SPATIAL_GIS',
      provider: 'Survey of India / LGD Directory',
      updateFrequency: 'Static Boundary Geometries',
      lastSuccessfulUpdate: 'Phase 1A Baseline Geometry Seed',
      status: 'FRESH',
      connectionState: 'DEMO_MOCK',
      details: 'Active demo SVG/GeoJSON boundaries for 6 blocks in Lucknow.',
    },
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 border-b border-surface-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-surface-muted border border-surface-border text-slate-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Data Pipeline Health & External Provider Lineage</CardTitle>
              <p className="text-xs text-slate-500">
                Live monitoring of external ingestion streams and freshness statuses
              </p>
            </div>
          </div>
          <Badge variant="demo" size="sm">
            Phase 1B Pipeline Audit
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-slate-500 font-heading font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-2.5">Data Feed</th>
                <th className="pb-2.5">Provider</th>
                <th className="pb-2.5">Update Cycle</th>
                <th className="pb-2.5">Connection State</th>
                <th className="pb-2.5">Freshness Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {dataSources.map((ds, i) => (
                <tr key={i} className="hover:bg-surface-muted/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-900 pr-4">
                    <div>{ds.name}</div>
                    <span className="text-[11px] text-slate-500 font-normal">{ds.details}</span>
                  </td>
                  <td className="py-3 text-slate-700 pr-4">{ds.provider}</td>
                  <td className="py-3 text-slate-600 pr-4">{ds.updateFrequency}</td>
                  <td className="py-3 pr-4">
                    {ds.connectionState === 'NOT_CONNECTED' ? (
                      <Badge variant="neutral" size="sm">
                        Not Connected Yet
                      </Badge>
                    ) : (
                      <Badge variant="demo" size="sm">
                        Demo Mock Active
                      </Badge>
                    )}
                  </td>
                  <td className="py-3">
                    {ds.status === 'FRESH' ? (
                      <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                        FRESH (Mock)
                      </Badge>
                    ) : (
                      <Badge variant="crimson" size="sm" icon={<XCircle className="w-3 h-3" />}>
                        UNAVAILABLE
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
