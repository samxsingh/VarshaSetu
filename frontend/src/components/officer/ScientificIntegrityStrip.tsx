import React from 'react';
import { ShieldAlert, Database, MapPin, Calendar, Activity, AlertOctagon } from 'lucide-react';

export const ScientificIntegrityStrip: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`bg-[#F3F6F7] border-2 border-[#102A43] rounded-xl p-4 sm:p-5 shadow-[2px_2px_0px_#102A43] space-y-3 ${className}`}
      data-testid="scientific-integrity-strip"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#102A43]/15">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#102A43] text-[#D97706]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-extrabold text-xs sm:text-sm text-[#102A43] uppercase tracking-wider">
              Scientific Integrity & Operational Boundaries
            </h4>
            <span className="text-[11px] text-[#486581]">
              Diagnostic constraints and empirical anchoring specifications
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-[#FEF3C7] border border-[#D97706] text-[#B45309] text-[10px] font-mono font-bold uppercase tracking-wider">
            DIAGNOSTIC ONLY
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-[#102A43]/20 text-[#102A43] text-[10px] font-mono font-bold">
            GATED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1 text-xs">
        <div className="bg-white p-2.5 rounded-lg border border-[#102A43]/10">
          <span className="text-[10px] font-mono uppercase text-[#829AB1] block">Station Anchor</span>
          <strong className="font-mono font-bold text-[#102A43] text-xs">Grid UP_LKO_BKT</strong>
          <span className="text-[10px] text-[#829AB1] block truncate">Centroid Station</span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-[#102A43]/10">
          <span className="text-[10px] font-mono uppercase text-[#829AB1] block">Archive Season</span>
          <strong className="font-mono font-bold text-[#102A43] text-xs">Kharif 2024</strong>
          <span className="text-[10px] text-[#829AB1] block">June–Sept</span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-[#102A43]/10">
          <span className="text-[10px] font-mono uppercase text-[#829AB1] block">Observations</span>
          <strong className="font-mono font-bold text-[#102A43] text-xs">122 Records</strong>
          <span className="text-[10px] text-[#3F7D58] block font-medium">Daily Station</span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-[#102A43]/10">
          <span className="text-[10px] font-mono uppercase text-[#829AB1] block">Spatial Grid</span>
          <strong className="font-mono font-bold text-[#102A43] text-xs">Block Level</strong>
          <span className="text-[10px] text-[#829AB1] block">~9 km centroid</span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-[#102A43]/10">
          <span className="text-[10px] font-mono uppercase text-[#829AB1] block">Operational Fcst</span>
          <strong className="font-mono font-bold text-[#D97706] text-xs">NOT ACTIVE</strong>
          <span className="text-[10px] text-[#829AB1] block">Single-Season</span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-[#102A43]/10">
          <span className="text-[10px] font-mono uppercase text-[#829AB1] block">Yield Modeling</span>
          <strong className="font-mono font-bold text-[#B45309] text-xs">PROHIBITED</strong>
          <span className="text-[10px] text-[#829AB1] block">Non-Causal Gate</span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-[#102A43]/10 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase text-[#829AB1] block">Financial Forecast</span>
          <strong className="font-mono font-bold text-[#B45309] text-xs">PROHIBITED</strong>
          <span className="text-[10px] text-[#829AB1] block">Non-Commercial</span>
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-[#EBF5EE] border border-[#3F7D58]/25 text-[11px] text-[#1B4D2E] leading-relaxed flex items-start gap-2">
        <Activity className="w-3.5 h-3.5 text-[#3F7D58] shrink-0 mt-0.5" />
        <p>
          <strong>Non-Causal Agro-Meteorological Disclosure:</strong> VarshaSetu calculates statistical downscaled probabilities and meteorological risk indicators. It does not establish direct agronomic causation, and operational dissemination channels (SMS/telecom) remain disabled. Extension officers must integrate localized field inspections before recommending farm-level interventions.
        </p>
      </div>
    </div>
  );
};
