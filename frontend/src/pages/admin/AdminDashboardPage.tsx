import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Settings, Users, Shield, Database, Server } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#102A43] text-white">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-black text-2xl text-[#102A43]">
              System Administration & Access Control
            </h1>
            <p className="text-xs text-[#486581] mt-0.5 font-medium">
              User roles, permission grants, infrastructure health, and configuration parameters.
            </p>
          </div>
        </div>

        <Badge variant="teal" size="sm">Admin Role Active</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-2 border-[#102A43] rounded-2xl shadow-[3px_3px_0px_#102A43] bg-white">
          <Users className="w-5 h-5 text-[#0E7490] mb-2" />
          <span className="text-[11px] font-bold text-[#486581] uppercase tracking-wider block">Registered Users</span>
          <span className="font-heading font-black text-3xl text-[#102A43] mt-1 block">1,842</span>
          <span className="text-[11px] text-[#829AB1] font-medium">Farmers, Officers, Analysts</span>
        </Card>

        <Card className="p-4 border-2 border-[#102A43] rounded-2xl shadow-[3px_3px_0px_#102A43] bg-white">
          <Shield className="w-5 h-5 text-[#2563EB] mb-2" />
          <span className="text-[11px] font-bold text-[#486581] uppercase tracking-wider block">RBAC Personas</span>
          <span className="font-heading font-black text-3xl text-[#102A43] mt-1 block">5 Roles</span>
          <span className="text-[11px] text-[#829AB1] font-medium">Farmer, Officer, Gov, Analyst, Admin</span>
        </Card>

        <Card className="p-4 border-2 border-[#102A43] rounded-2xl shadow-[3px_3px_0px_#102A43] bg-white">
          <Server className="w-5 h-5 text-[#D97706] mb-2" />
          <span className="text-[11px] font-bold text-[#486581] uppercase tracking-wider block">Microservices</span>
          <span className="font-heading font-black text-3xl text-[#102A43] mt-1 block">3 Services</span>
          <span className="text-[11px] text-[#829AB1] font-medium">Frontend, Node API, FastAPI ML</span>
        </Card>

        <Card className="p-4 border-2 border-[#102A43] rounded-2xl shadow-[3px_3px_0px_#102A43] bg-white">
          <Database className="w-5 h-5 text-[#3F7D58] mb-2" />
          <span className="text-[11px] font-bold text-[#486581] uppercase tracking-wider block">PostGIS Geometries</span>
          <span className="font-heading font-black text-3xl text-[#102A43] mt-1 block">440 Panchayats</span>
          <span className="text-[11px] text-[#829AB1] font-medium">Lucknow District Seeded</span>
        </Card>
      </div>

      <Card className="p-5 border-2 border-[#102A43] rounded-2xl shadow-[4px_4px_0px_#102A43] bg-white">
        <CardHeader className="pb-3 border-b-2 border-[#102A43]/10">
          <CardTitle className="text-base font-heading font-bold text-[#102A43]">System Configuration Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-[#EAF0F2] border border-[#102A43]/15 rounded-xl space-y-1">
              <span className="text-[#829AB1] font-mono text-[10px] block uppercase font-bold">DEFAULT_DEMO_LOCATION</span>
              <strong className="text-[#102A43] font-mono text-xs block">
                Lucknow District, UP (Bhaisamau, BKT)
              </strong>
              <span className="text-[#486581]">Configured via environment; no hardcoded location logic.</span>
            </div>
            <div className="p-3 bg-[#FEF3C7] border border-[#D97706]/30 rounded-xl space-y-1">
              <span className="text-[#D97706] font-mono text-[10px] block uppercase font-bold">DATA_MODE</span>
              <strong className="text-[#D97706] font-mono text-xs block">
                DEMO (Simulated Development Shell)
              </strong>
              <span className="text-[#486581]">Enforces transparent demo badges on all predictions.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
