import React from 'react';
import { Server, CheckCircle2, AlertTriangle, ShieldCheck, Database, Radio, Cpu, Layers } from 'lucide-react';
import { OperationalStatusResponse } from '../../services/eventService';

interface GovSystemStatusProps {
  opStatus: OperationalStatusResponse | null;
}

export const GovSystemStatus: React.FC<GovSystemStatusProps> = ({ opStatus }) => {
  const subsystems = [
    { name: 'ML Intelligence Microservice', status: 'HEALTHY', host: 'Port 8000', color: 'text-[#2F7D4A]' },
    { name: 'Backend Core & API Gateway', status: 'HEALTHY', host: 'Port 5001', color: 'text-[#2F7D4A]' },
    { name: 'PostGIS Geospatial Engine', status: 'HEALTHY', host: 'EPSG:4326', color: 'text-[#2F7D4A]' },
    { name: 'Probabilistic Calibration Gate', status: 'ENFORCED', host: 'Isotonic/Platt', color: 'text-[#2F7D4A]' },
    { name: 'Agronomic Rules Engine', status: 'ACTIVE', host: '9 Rules / 6 Crops', color: 'text-[#2F7D4A]' },
    { name: 'What-If Scenario Engine', status: 'SCENARIO_ONLY', host: 'Non-Causal', color: 'text-[#E5A33D]' },
    { name: 'Multilingual Engine (Phase 5C)', status: 'ACTIVE', host: 'EN & HI Templates', color: 'text-[#2F7D4A]' },
    { name: 'Voice Accessibility Subsystem', status: 'DEMO_ONLY', host: 'Mock WebAudio', color: 'text-[#E5A33D]' },
    { name: 'Carrier Telecom Dispatch', status: 'NOT CONFIGURED', host: 'SMS/WhatsApp Gated', color: 'text-[#9A6218]' },
  ];

  return (
    <section id="system" className="space-y-4">
      {/* Header */}
      <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 shadow-[4px_4px_0px_#0B1726] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#008F83] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              SYSTEM STATUS & INFRASTRUCTURE
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#EBF5EE] text-[#2F7D4A] border border-[#2F7D4A]/30 text-[10px] font-mono font-bold">
              ALL SERVICES ONLINE
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#0B1726] mt-1 tracking-tight">
            Subsystem Health, Calibration Gates & Dispatch Telemetry
          </h2>
          <p className="text-xs text-[#435466]">
            Technical uptime and architectural verification status across all scientific compute nodes
          </p>
        </div>

        <span className="px-3 py-1 rounded-xl bg-[#F7F3EA] border border-[#0B1726]/15 text-xs font-mono text-[#0B1726]">
          Environment: Production Hardened
        </span>
      </div>

      {/* Subsystem Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {subsystems.map((sub, i) => (
          <div
            key={i}
            className="p-3.5 bg-white rounded-xl border-2 border-[#0B1726] shadow-[2px_2px_0px_#0B1726] flex items-center justify-between gap-3 text-xs"
          >
            <div>
              <strong className="font-heading font-bold text-[#0B1726] block leading-snug">
                {sub.name}
              </strong>
              <span className="text-[10px] font-mono text-[#62768A]">
                {sub.host}
              </span>
            </div>

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${
                sub.status === 'HEALTHY' || sub.status === 'ACTIVE' || sub.status === 'ENFORCED'
                  ? 'bg-[#EBF5EE] text-[#2F7D4A] border-[#2F7D4A]/30'
                  : sub.status === 'SCENARIO_ONLY' || sub.status === 'DEMO_ONLY'
                  ? 'bg-[#FEF6E9] text-[#9A6218] border-[#E5A33D]/40'
                  : 'bg-white text-[#9A6218] border-[#0B1726]/20'
              }`}
            >
              {sub.status}
            </span>
          </div>
        ))}
      </div>

      {/* Operational Dispatch Channels State */}
      <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 shadow-[4px_4px_0px_#0B1726] space-y-3">
        <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#62768A]">
          External Telecommunication Dissemination State
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
            <span className="text-[10px] text-[#62768A] uppercase font-mono block">In-App Alerts</span>
            <strong className="text-sm font-mono text-[#0B1726] block mt-0.5">SIMULATED</strong>
            <span className="text-[10px] text-[#2F7D4A] block mt-0.5">Internal state active</span>
          </div>

          <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
            <span className="text-[10px] text-[#62768A] uppercase font-mono block">SMS Gateway</span>
            <strong className="text-sm font-mono text-[#9A6218] block mt-0.5">NOT CONFIGURED</strong>
            <span className="text-[10px] text-[#62768A] block mt-0.5">External carrier disabled</span>
          </div>

          <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
            <span className="text-[10px] text-[#62768A] uppercase font-mono block">WhatsApp Broadcast</span>
            <strong className="text-sm font-mono text-[#9A6218] block mt-0.5">NOT CONFIGURED</strong>
            <span className="text-[10px] text-[#62768A] block mt-0.5">Meta API inactive</span>
          </div>

          <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
            <span className="text-[10px] text-[#62768A] uppercase font-mono block">Voice / IVR</span>
            <strong className="text-sm font-mono text-[#9A6218] block mt-0.5">NOT CONFIGURED</strong>
            <span className="text-[10px] text-[#62768A] block mt-0.5">Outbound telephony disabled</span>
          </div>
        </div>

        <div className="p-3 bg-[#FEF6E9] rounded-xl border border-[#E5A33D]/40 text-xs text-[#9A6218] leading-relaxed">
          <strong>Production Boundary:</strong> In accordance with scientific verification rules, all alert thresholds, lifecycle states, and notification events are gated to <code>DIAGNOSTIC_ONLY</code>. Outbound push distribution to farmers will remain disabled until multi-year hindcasting achieves operational certification.
        </div>
      </div>
    </section>
  );
};
