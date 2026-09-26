import React from 'react';
import { Radio, ArrowRight, Bell, CheckCircle2, Clock, ShieldAlert, AlertCircle } from 'lucide-react';
import { ForecastEvent } from '../../services/eventService';

interface GovAlertLifecycleProps {
  events: ForecastEvent[];
}

export const GovAlertLifecycle: React.FC<GovAlertLifecycleProps> = ({ events }) => {
  const lifecycleStages = [
    { num: '01', name: 'SIGNAL DETECTED', desc: 'Threshold exceedance identified by downscaled forecast model' },
    { num: '02', name: 'RULE EVALUATED', desc: 'Agronomic engine correlates signal with crop phenology' },
    { num: '03', name: 'ADVISORY GENERATED', desc: 'Non-causal directive created with deterministic translation' },
    { num: '04', name: 'OFFICER REVIEWED', desc: 'Duty extension officer reviews local ground context' },
    { num: '05', name: 'DIAGNOSTIC ARCHIVE', desc: 'Logged to internal state register (telecom broadcast gated)' },
  ];

  const displayEvents = events.length > 0 ? events.slice(0, 4) : [
    {
      event_id: 'EVT_20240915_001',
      block_id: 'UP_LKO_BKT',
      event_type: 'HEAVY_RAIN_WARNING',
      severity: 'WARNING',
      state: 'ACKNOWLEDGED',
      probability: 0.584,
      description: 'Threshold exceedance projected for Bakshi Ka Talab centroid within 7-day window.',
      created_at: '2024-09-15T06:00:00Z',
    },
    {
      event_id: 'EVT_20240710_002',
      block_id: 'UP_LKO_MLH',
      event_type: 'DRY_SPELL_WATCH',
      severity: 'WATCH',
      state: 'ACTIVE',
      probability: 0.74,
      description: 'Potential 5-day hiatus post-onset in Malihabad spatial interpolation prior.',
      created_at: '2024-07-10T06:00:00Z',
    },
  ];

  return (
    <section id="alerts" className="space-y-4">
      {/* Header */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0E7490] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              ALERT LIFECYCLE
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] border border-[#D97706] text-[#B45309] text-[10px] font-mono font-bold">
              STATE MACHINE ACTIVE
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#102A43] mt-1 tracking-tight">
            Hazard Event State Machine & Delivery Telemetry
          </h2>
          <p className="text-xs text-[#486581]">
            Auditable progression of detected atmospheric events through agronomic evaluation, officer acknowledgment, and internal logging
          </p>
        </div>

        <span className="px-3 py-1 rounded-xl bg-[#F3F6F7] border border-[#102A43]/15 text-xs font-mono text-[#102A43]">
          Telecom Outbound: NOT CONFIGURED
        </span>
      </div>

      {/* 5-Step Lifecycle Visual Pipeline */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43] space-y-4">
        <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#829AB1]">
          Hazard Event Lifecycle Pipeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {lifecycleStages.map((st, i) => (
            <div
              key={st.num}
              className="p-3 bg-[#F3F6F7] rounded-xl border-2 border-[#102A43]/15 flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-xs text-[#0E7490]">{st.num}</span>
                <span className="w-2 h-2 rounded-full bg-[#0E7490]" />
              </div>
              <div>
                <strong className="font-heading font-bold text-xs text-[#102A43] block leading-tight">
                  {st.name}
                </strong>
                <p className="text-[10px] text-[#486581] mt-1 leading-snug">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent State Register Logs */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#102A43]/10">
          <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#102A43]">
            Recent Alert Event Register
          </span>
          <span className="text-[11px] font-mono text-[#829AB1]">
            {displayEvents.length} Active Records
          </span>
        </div>

        <div className="space-y-2">
          {displayEvents.map((evt) => (
            <div
              key={evt.event_id}
              className="p-3 bg-[#FFFFFF] rounded-xl border border-[#102A43]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="font-heading font-bold text-[#102A43]">
                    {evt.event_type.replace(/_/g, ' ')}
                  </strong>
                  <span className="font-mono text-[10px] text-[#829AB1]">({evt.event_id})</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      evt.severity === 'WARNING' || evt.severity === 'CRITICAL'
                        ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30'
                        : 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40'
                    }`}
                  >
                    {evt.severity}
                  </span>
                </div>
                <p className="text-[11px] text-[#486581]">{evt.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono">
                <span className="text-[#829AB1]">Block: {evt.block_id}</span>
                <span className="px-2 py-0.5 rounded bg-[#EBF5EE] text-[#3F7D58] border border-[#3F7D58]/30 font-bold">
                  {evt.state}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
