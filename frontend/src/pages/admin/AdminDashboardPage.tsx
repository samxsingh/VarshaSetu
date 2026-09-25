import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Settings, Users, Shield, Database, Lock, Server } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-surface-border shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 text-white">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-900">
              System Administration & Access Control
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              User roles, permission grants, infrastructure health, and configuration parameters.
            </p>
          </div>
        </div>

        <Badge variant="teal" size="sm">Admin Role Active</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <Users className="w-5 h-5 text-brand-teal mb-2" />
          <span className="text-xs text-slate-500 uppercase font-semibold block">Registered Users</span>
          <span className="font-heading font-bold text-2xl text-slate-900 mt-1 block">1,842</span>
          <span className="text-[11px] text-slate-500">Farmers, Officers, Analysts</span>
        </Card>

        <Card className="p-4">
          <Shield className="w-5 h-5 text-brand-azure mb-2" />
          <span className="text-xs text-slate-500 uppercase font-semibold block">RBAC Personas</span>
          <span className="font-heading font-bold text-2xl text-slate-900 mt-1 block">5 Roles</span>
          <span className="text-[11px] text-slate-500">Farmer, Officer, Gov, Analyst, Admin</span>
        </Card>

        <Card className="p-4">
          <Server className="w-5 h-5 text-brand-amber mb-2" />
          <span className="text-xs text-slate-500 uppercase font-semibold block">Microservices</span>
          <span className="font-heading font-bold text-2xl text-slate-900 mt-1 block">3 Services</span>
          <span className="text-[11px] text-slate-500">Frontend, Node API, FastAPI ML</span>
        </Card>

        <Card className="p-4">
          <Database className="w-5 h-5 text-brand-emerald mb-2" />
          <span className="text-xs text-slate-500 uppercase font-semibold block">PostGIS Geometries</span>
          <span className="font-heading font-bold text-2xl text-slate-900 mt-1 block">440 Panchayats</span>
          <span className="text-[11px] text-slate-500">Lucknow District Seeded</span>
        </Card>
      </div>

      <Card className="p-5">
        <CardHeader className="pb-3 border-b border-surface-border">
          <CardTitle className="text-base">System Configuration Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-surface-muted rounded-xl space-y-1">
              <span className="text-slate-400 font-mono text-[10px] block uppercase">DEFAULT_DEMO_LOCATION</span>
              <strong className="text-slate-900 font-mono text-xs block">
                Lucknow District, UP (Bhaisamau, BKT)
              </strong>
              <span className="text-slate-500">Configured via environment; no hardcoded location logic.</span>
            </div>
            <div className="p-3 bg-surface-muted rounded-xl space-y-1">
              <span className="text-slate-400 font-mono text-[10px] block uppercase">DATA_MODE</span>
              <strong className="text-amber-800 font-mono text-xs block">
                DEMO (Simulated Development Shell)
              </strong>
              <span className="text-slate-500">Enforces transparent demo badges on all predictions.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
