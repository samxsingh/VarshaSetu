import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ClimateSignalCard } from '../../components/analyst/ClimateSignalCard';
import { ProvenanceCard } from '../../components/analyst/ProvenanceCard';
import { MapContainer } from '../../components/maps/MapContainer';
import { Landmark, TrendingUp, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export const GovernmentDashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* State / National Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-surface-border shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 text-white">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-2xl text-slate-900">
                State Disaster & Monsoon Command Center
              </h1>
              <Badge variant="teal" size="sm">Uttar Pradesh State</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-level climate teleconnections, regional drought watch, and forecast validation provenance.
            </p>
          </div>
        </div>

        <Badge variant="demo" size="md">
          State Operational Prototype
        </Badge>
      </div>

      {/* Statewide Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider block">
            Statewide Onset Progress
          </span>
          <div className="font-heading font-bold text-2xl text-slate-900 mt-1">
            Eastern UP: Active
          </div>
          <p className="text-xs text-brand-teal-dark mt-0.5 font-medium">
            Advancing northwestward toward Lucknow & Central UP
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider block">
            Drought & Hiatus Early Warning
          </span>
          <div className="font-heading font-bold text-2xl text-brand-amber mt-1">
            2 Districts On Watch
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Bundelkhand & Southern UP parched hiatus risk &gt;65%
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider block">
            Model Forecast Health
          </span>
          <div className="font-heading font-bold text-2xl text-brand-emerald mt-1">
            100% Operational
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Evaluated against 30-year IMD climatology baselines
          </p>
        </Card>
      </div>

      {/* Global Climate Teleconnections */}
      <ClimateSignalCard />

      {/* Regional GIS Map Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-slate-900">
            District-Level Vulnerability & Soil Moisture Saturation
          </h3>
          <span className="text-xs text-slate-500">Demo Focus: Lucknow District</span>
        </div>
        <MapContainer />
      </div>

      {/* Provenance & Pipeline Health */}
      <ProvenanceCard />
    </div>
  );
};
