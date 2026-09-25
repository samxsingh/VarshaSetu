import React from 'react';
import { Globe2, Waves, Wind, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const ClimateSignalCard: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 border-b border-surface-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-teal-tint text-brand-teal">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Large-Scale Global Climate Teleconnections</CardTitle>
              <p className="text-xs text-slate-500">
                Planetary drivers modulating regional moisture flux across the Indian subcontinent
              </p>
            </div>
          </div>
          <Badge variant="demo" size="sm">
            Simulated Indicators
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900">
          <strong>Pipeline Status:</strong> Teleconnection values shown below are simulated development indicators. Live FTP/NetCDF ingestion pipelines from NOAA CPC and Australia BoM connect in Phase 3.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ENSO (Niño 3.4) */}
          <div className="bg-surface-muted/60 p-4 rounded-xl border border-surface-border flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Waves className="w-4 h-4 text-brand-teal" />
                <span className="font-heading font-semibold text-xs uppercase tracking-wider">
                  ENSO / Niño 3.4
                </span>
              </div>
              <Badge variant="emerald" size="sm">
                ENSO Neutral
              </Badge>
            </div>
            <div className="my-3">
              <div className="font-heading font-bold text-2xl text-slate-900">
                -0.34 °C
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                SST Anomaly (Pacific Equatorial)
              </p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-surface-border pt-2">
              No adverse El Niño suppression detected; favorable for normal onset dynamics.
            </div>
          </div>

          {/* IOD (Dipole Mode Index) */}
          <div className="bg-surface-muted/60 p-4 rounded-xl border border-surface-border flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Activity className="w-4 h-4 text-brand-azure" />
                <span className="font-heading font-semibold text-xs uppercase tracking-wider">
                  Indian Ocean Dipole
                </span>
              </div>
              <Badge variant="azure" size="sm">
                Neutral-Positive
              </Badge>
            </div>
            <div className="my-3">
              <div className="font-heading font-bold text-2xl text-slate-900">
                +0.28 °C
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                DMI Gradient (Western vs Eastern IO)
              </p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-surface-border pt-2">
              Enhances Arabian Sea cross-equatorial low-level jet moisture convergence.
            </div>
          </div>

          {/* MJO (Madden-Julian Oscillation) */}
          <div className="bg-surface-muted/60 p-4 rounded-xl border border-surface-border flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Wind className="w-4 h-4 text-brand-amber" />
                <span className="font-heading font-semibold text-xs uppercase tracking-wider">
                  MJO (Wheeler-Hendon)
                </span>
              </div>
              <Badge variant="teal" size="sm">
                Phase 3 (Active)
              </Badge>
            </div>
            <div className="my-3">
              <div className="font-heading font-bold text-2xl text-slate-900">
                Amp 1.42
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Equatorial Indian Ocean Convection
              </p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-surface-border pt-2">
              Active eastward propagating convective envelope triggering northern monsoon pulse.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
