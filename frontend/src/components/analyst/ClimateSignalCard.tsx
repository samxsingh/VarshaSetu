import React from 'react';
import { Globe2, Waves, Wind, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const ClimateSignalCard: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 border-b-2 border-[#102A43]/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E8F4F6] text-[#0E7490] border border-[#0891B2]/30">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-heading font-extrabold text-[#102A43]">
                Large-Scale Global Climate Teleconnections
              </CardTitle>
              <p className="text-xs text-[#486581]">
                Planetary drivers modulating regional moisture flux across the Indian subcontinent
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-[#FEF3C7] border border-[#D97706] text-[#B45309] text-[10px] font-mono font-bold self-start sm:self-auto">
            DIAGNOSTIC TELEMETRY
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="bg-[#FEF3C7] border-2 border-[#D97706] p-3 rounded-xl text-xs text-[#B45309] shadow-[2px_2px_0px_#102A43]">
          <strong className="text-[#102A43]">Pipeline Status:</strong> Teleconnection values shown below are simulated development indicators. Live FTP/NetCDF ingestion pipelines from NOAA CPC and Australia BoM connect in Phase 3.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ENSO (Niño 3.4) */}
          <div className="bg-[#F3F6F7] p-4 rounded-xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#102A43]">
                <Waves className="w-4 h-4 text-[#0E7490]" />
                <span className="font-heading font-extrabold text-xs uppercase tracking-wider">
                  ENSO / Niño 3.4
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white text-[#0E7490] border border-[#102A43]/20 font-mono text-[10px] font-bold">
                ENSO Neutral
              </span>
            </div>
            <div className="my-3">
              <div className="font-mono font-black text-3xl text-[#102A43] tracking-tight">
                -0.34 °C
              </div>
              <p className="text-xs text-[#486581] mt-0.5 font-sans">
                SST Anomaly (Pacific Equatorial)
              </p>
            </div>
            <div className="text-[11px] text-[#486581] border-t border-[#102A43]/10 pt-2 font-sans leading-relaxed">
              No adverse El Niño suppression detected; favorable for normal onset dynamics.
            </div>
          </div>

          {/* IOD (Dipole Mode Index) */}
          <div className="bg-[#F3F6F7] p-4 rounded-xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#102A43]">
                <Activity className="w-4 h-4 text-[#2563EB]" />
                <span className="font-heading font-extrabold text-xs uppercase tracking-wider">
                  Indian Ocean Dipole
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#DBEAFE] text-[#1E40AF] border border-[#2563EB]/30 font-mono text-[10px] font-bold">
                Neutral-Positive
              </span>
            </div>
            <div className="my-3">
              <div className="font-mono font-black text-3xl text-[#102A43] tracking-tight">
                +0.28 °C
              </div>
              <p className="text-xs text-[#486581] mt-0.5 font-sans">
                DMI Gradient (Western vs Eastern IO)
              </p>
            </div>
            <div className="text-[11px] text-[#486581] border-t border-[#102A43]/10 pt-2 font-sans leading-relaxed">
              Enhances Arabian Sea cross-equatorial low-level jet moisture convergence.
            </div>
          </div>

          {/* MJO (Madden-Julian Oscillation) */}
          <div className="bg-[#F3F6F7] p-4 rounded-xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#102A43]">
                <Wind className="w-4 h-4 text-[#D97706]" />
                <span className="font-heading font-extrabold text-xs uppercase tracking-wider">
                  MJO (Wheeler-Hendon)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#E8F4F6] text-[#0E7490] border border-[#0891B2]/30 font-mono text-[10px] font-bold">
                Phase 3 (Active)
              </span>
            </div>
            <div className="my-3">
              <div className="font-mono font-black text-3xl text-[#102A43] tracking-tight">
                Amp 1.42
              </div>
              <p className="text-xs text-[#486581] mt-0.5 font-sans">
                Equatorial Indian Ocean Convection
              </p>
            </div>
            <div className="text-[11px] text-[#486581] border-t border-[#102A43]/10 pt-2 font-sans leading-relaxed">
              Active eastward propagating convective envelope triggering northern monsoon pulse.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
