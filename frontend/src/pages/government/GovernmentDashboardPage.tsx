import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ClimateSignalCard } from '../../components/analyst/ClimateSignalCard';
import { ProvenanceCard } from '../../components/analyst/ProvenanceCard';
import { Landmark, TrendingUp, AlertTriangle, ShieldAlert, Activity, CheckCircle2, XCircle, Database } from 'lucide-react';
import { forecastService, ForecastStatusResponse, ForecastAvailabilityResponse } from '../../services/forecastService';
import { eventService, OperationalStatusResponse } from '../../services/eventService';
import { Radio, BellRing, Server, ShieldCheck, Sprout } from 'lucide-react';

export const GovernmentDashboardPage: React.FC = () => {
  const [forecastStatus, setForecastStatus] = useState<ForecastStatusResponse | null>(null);
  const [availability, setAvailability] = useState<ForecastAvailabilityResponse | null>(null);
  const [opStatus, setOpStatus] = useState<OperationalStatusResponse | null>(null);

  useEffect(() => {
    const fetchGovData = async () => {
      try {
        const [stRes, avRes, opRes] = await Promise.all([
          forecastService.getForecastStatus().catch(() => null),
          forecastService.getForecastAvailability('UP_LKO_BKT').catch(() => null),
          eventService.getOperationalStatus().catch(() => null),
        ]);
        if (stRes?.success && stRes.data) setForecastStatus(stRes.data);
        if (avRes?.success && avRes.data) setAvailability(avRes.data);
        if (opRes?.success && opRes.data) setOpStatus(opRes.data);
      } catch (err) {
        // Fallback
      }
    };
    fetchGovData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" data-testid="government-dashboard-page">
      {/* 1. Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-surface-border shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 text-white">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading font-bold text-2xl text-slate-900">
                State Meteorological Command & Coverage Overview
              </h1>
              <Badge variant="teal" size="sm">Uttar Pradesh State</Badge>
              <Badge variant="amber" size="sm">Ground Anchor: Lucknow (UP_LKO_BKT)</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Statewide forecast ingestion status, spatial coverage gaps, and multi-year validation audits
            </p>
          </div>
        </div>

        <Badge variant="neutral" size="md">
          Phase 4E Product Layer
        </Badge>
      </div>

      {/* 2. Scientific Data Reality & Coverage Gap Disclosure */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 space-y-1.5 leading-relaxed">
          <div className="font-semibold text-amber-900 flex items-center gap-2">
            Statewide Observational Coverage & Scientific Integrity Disclosure
            <Badge variant="amber" size="sm" className="font-mono text-[10px]">
              ASSIMILATED: 1 BLOCK / 820+ PENDING
            </Badge>
          </div>
          <p>
            VarshaSetu strictly adheres to scientific honesty and does not fabricate statewide spatial aggregates.
            High-resolution daily ground truth observations currently cover <strong>1 block (Bakshi Ka Talab, UP_LKO_BKT)</strong> for Kharif 2024.
            The remaining 820+ blocks across Uttar Pradesh are classified as <em>Pending Multi-Station Assimilation</em>.
          </p>
        </div>
      </div>

      {/* 3. Coverage Status Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider block">
            Statewide Coverage
          </span>
          <div className="font-heading font-bold text-2xl text-slate-900 mt-1 flex items-center justify-between">
            <span>1 / 826 Blocks</span>
            <XCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xs text-amber-800 mt-0.5 font-medium">
            Assimilated: UP_LKO_BKT
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider block">
            Data Freshness
          </span>
          <div className="font-heading font-bold text-lg text-slate-900 mt-1">
            {availability?.data_freshness || 'HISTORICAL_ONLY'}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest: {availability?.latest_observation_date || '2024-09-30'}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider block">
            Model Gating
          </span>
          <div className="font-heading font-bold text-lg text-amber-800 mt-1">
            {forecastStatus?.system_status || 'DIAGNOSTIC_ONLY'}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational Allowed: false
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider block">
            Feature Completeness
          </span>
          <div className="font-heading font-bold text-2xl text-emerald-700 mt-1 flex items-center justify-between">
            <span>19 / 19</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs text-emerald-800 mt-0.5 font-medium">
            100% Core Features Present
          </p>
        </Card>
      </div>

      {/* 4. Operational Delivery & Production Gating Status (Phase 4F) */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-brand-teal" />
            <div>
              <h2 className="font-heading font-bold text-base text-slate-900">
                Operational Delivery Channels & Gating Infrastructure
              </h2>
              <p className="text-xs text-slate-500">
                Phase 4F alert engine, forecast state machine, and provider-neutral telemetry
              </p>
            </div>
          </div>
          <Badge variant="amber" size="sm">
            DIAGNOSTIC ONLY — NON-OPERATIONAL
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-3.5 bg-surface-muted/50 rounded-xl border border-surface-border space-y-1">
            <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider">
              In-App Notification
            </span>
            <div className="font-bold text-sm text-slate-900 font-mono">
              SIMULATED / ACTIVE
            </div>
            <p className="text-[10px] text-slate-500">
              Internal state machine & delivery logs recorded.
            </p>
          </div>

          <div className="p-3.5 bg-surface-muted/50 rounded-xl border border-surface-border space-y-1">
            <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider">
              SMS Gateway
            </span>
            <div className="font-bold text-sm text-amber-700 font-mono">
              NOT CONFIGURED
            </div>
            <p className="text-[10px] text-slate-500">
              External telecommunication carrier not active.
            </p>
          </div>

          <div className="p-3.5 bg-surface-muted/50 rounded-xl border border-surface-border space-y-1">
            <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider">
              WhatsApp Broadcasting
            </span>
            <div className="font-bold text-sm text-amber-700 font-mono">
              NOT CONFIGURED
            </div>
            <p className="text-[10px] text-slate-500">
              Broadcasting disabled until production readiness.
            </p>
          </div>

          <div className="p-3.5 bg-surface-muted/50 rounded-xl border border-surface-border space-y-1">
            <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider">
              Voice / IVR Gateway
            </span>
            <div className="font-bold text-sm text-amber-700 font-mono">
              NOT CONFIGURED
            </div>
            <p className="text-[10px] text-slate-500">
              Outbound telephony calls strictly disabled.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
          <Server className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong>Operational System Note:</strong> In accordance with scientific verification rules, all alert thresholds, lifecycle states, and notification events are gated to <code>DIAGNOSTIC_ONLY</code>. Outbound push distribution to farmers will remain disabled until multi-year hindcasting achieves operational certification.
          </p>
        </div>
      </Card>

      {/* 5. Phase 5A: Agronomic Intelligence & Safety Gate Coverage Matrix */}
      <Card className="p-5 space-y-4 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-brand-teal" />
            <h3 className="font-heading font-bold text-base text-slate-900">
              State Agronomic Intelligence & Safety Gate Coverage
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="teal" size="sm">Phase 5A Active</Badge>
            <Badge variant="amber" size="sm">DIAGNOSTIC_ONLY</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-surface-muted/50 rounded-xl border border-surface-border space-y-1">
            <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider">
              Controlled Crop Registry
            </span>
            <div className="font-bold text-lg text-slate-900 font-mono">
              6 Crops Active
            </div>
            <p className="text-[10px] text-slate-500">
              Paddy, Maize, Wheat, Pulses, Mustard, General Agro-Met
            </p>
          </div>

          <div className="p-3.5 bg-surface-muted/50 rounded-xl border border-surface-border space-y-1">
            <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider">
              Agronomic Rules Catalog
            </span>
            <div className="font-bold text-lg text-slate-900 font-mono">
              9 Registered Rules
            </div>
            <p className="text-[10px] text-slate-500">
              Heavy rain, dry spells, onset surge, false onset, anomaly
            </p>
          </div>

          <div className="p-3.5 bg-surface-muted/50 rounded-xl border border-surface-border space-y-1">
            <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider">
              Spatial Validation Anchor
            </span>
            <div className="font-bold text-lg text-slate-900 font-mono">
              1 Station (UP_LKO_BKT)
            </div>
            <p className="text-[10px] text-slate-500">
              Bakshi Ka Talab validated; 5 regional blocks provisional
            </p>
          </div>

          <div className="p-3.5 bg-surface-muted/50 rounded-xl border border-surface-border space-y-1">
            <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider">
              Safety Gate State
            </span>
            <div className="font-bold text-lg text-brand-emerald font-mono">
              21 Checks Active
            </div>
            <p className="text-[10px] text-slate-500">
              13 advisory checks + 8 scenario safety checks
            </p>
          </div>
        </div>

        {/* Phase 5B: Scenario Analysis Capacity */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <strong className="text-slate-900 font-heading">What-If Scenario & Sensitivity Engine (Phase 5B)</strong>
              <Badge variant="amber" size="sm">SCENARIO_INDICATOR_ONLY</Badge>
            </div>
            <p className="text-slate-600 text-[11px]">
              6 controlled scenario types (sowing delay, supplemental irrigation, seasonal anomaly, timing shift, heavy rain concentration, compound multi-hazard) evaluated on Kharif 2024 meteorological baseline without yield or economic predictions.
            </p>
          </div>
          <Badge variant="teal" size="sm" className="shrink-0">
            Ground Anchor: UP_LKO_BKT
          </Badge>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong>Advisory Coverage Boundary:</strong> Operational crop advisories are strictly gated to diagnostic situational awareness based on Kharif 2024 archive records. No imperative farming directives or crop yield estimates are published without ICAR/IMD field validation.
          </p>
        </div>
      </Card>

      {/* 6. Global Climate Teleconnections & Provenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClimateSignalCard />
        <ProvenanceCard />
      </div>
    </div>
  );
};
