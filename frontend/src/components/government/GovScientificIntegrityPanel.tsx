import React from 'react';
import { ShieldAlert, Database, Compass, Calendar, AlertOctagon, Activity, FileCheck } from 'lucide-react';

export const GovScientificIntegrityPanel: React.FC = () => {
  return (
    <div
      className="bg-[#F7F3EA] border-2 border-[#0B1726] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#0B1726] space-y-4"
      data-testid="gov-scientific-integrity-panel"
    >
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#0B1726]/15">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#0B1726] text-[#E5A33D]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#0B1726] uppercase tracking-wider">
              Scientific Integrity & Governance Boundaries
            </h3>
            <span className="text-[11px] text-[#435466]">
              Public-sector diagnostic constraints, empirical grounding, and non-operational disclosures
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[10px] font-mono font-bold uppercase tracking-wider">
            DIAGNOSTIC ONLY
          </span>
          <span className="px-3 py-1 rounded-md bg-[#0B1726] text-white text-[10px] font-mono font-bold">
            GATED
          </span>
        </div>
      </div>

      {/* Grid of 8 Core Scientific Constraints */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
        <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15 space-y-0.5">
          <span className="text-[9px] font-mono uppercase text-[#62768A] block">Ground Anchor</span>
          <strong className="font-mono font-bold text-[#0B1726] text-xs block">UP_LKO_BKT</strong>
          <span className="text-[10px] text-[#62768A] block truncate">Bakshi Ka Talab</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15 space-y-0.5">
          <span className="text-[9px] font-mono uppercase text-[#62768A] block">Territory</span>
          <strong className="font-mono font-bold text-[#0B1726] text-xs block">Lucknow, UP</strong>
          <span className="text-[10px] text-[#62768A] block">Centroid Grid</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15 space-y-0.5">
          <span className="text-[9px] font-mono uppercase text-[#62768A] block">Archive Period</span>
          <strong className="font-mono font-bold text-[#0B1726] text-xs block">Kharif 2024</strong>
          <span className="text-[10px] text-[#62768A] block">June–Sept</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15 space-y-0.5">
          <span className="text-[9px] font-mono uppercase text-[#62768A] block">Observations</span>
          <strong className="font-mono font-bold text-[#0B1726] text-xs block">122 Daily</strong>
          <span className="text-[10px] text-[#2F7D4A] block font-medium">Station Truth</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15 space-y-0.5">
          <span className="text-[9px] font-mono uppercase text-[#62768A] block">Spatial Grid</span>
          <strong className="font-mono font-bold text-[#0B1726] text-xs block">BLOCK Level</strong>
          <span className="text-[10px] text-[#62768A] block">~9 km centroid</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15 space-y-0.5">
          <span className="text-[9px] font-mono uppercase text-[#62768A] block">Operational Fcst</span>
          <strong className="font-mono font-bold text-[#E5A33D] text-xs block">NOT ACTIVE</strong>
          <span className="text-[10px] text-[#62768A] block">Single-Season</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15 space-y-0.5">
          <span className="text-[9px] font-mono uppercase text-[#62768A] block">Multi-Year Gate</span>
          <strong className="font-mono font-bold text-[#9A6218] text-xs block">BLOCKED</strong>
          <span className="text-[10px] text-[#62768A] block">Single Season</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#0B1726]/15 space-y-0.5">
          <span className="text-[9px] font-mono uppercase text-[#62768A] block">Yield Modeling</span>
          <strong className="font-mono font-bold text-[#9A6218] text-xs block">PROHIBITED</strong>
          <span className="text-[10px] text-[#62768A] block">Non-Causal</span>
        </div>
      </div>

      {/* Explicit Public Sector Note */}
      <div className="p-3.5 rounded-xl bg-white border border-[#0B1726]/15 text-xs text-[#435466] leading-relaxed flex items-start gap-2.5">
        <Activity className="w-4 h-4 text-[#008F83] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#0B1726]">Critical Government Disclosure:</strong> Technical service uptime (HTTP 200) does <em>NOT</em> imply scientific operational authority. In accordance with IMD/ICAR protocol, all probability downscalings, advisory rules, and scenario simulations operate strictly in <code>DIAGNOSTIC_ONLY</code> mode anchored to the Kharif 2024 single-season archive. Outbound public push broadcasts (SMS, WhatsApp, Voice) remain systematically blocked.
        </p>
      </div>
    </div>
  );
};
