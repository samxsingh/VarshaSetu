import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Sprout, AlertTriangle, Droplets } from 'lucide-react';

export const OfficerCropsPage: React.FC = () => {
  const cropVulnerabilities = [
    {
      name: 'Paddy (धान)',
      acreage: '72,000 Hectares',
      vulnerableBlocks: 'Malihabad (Dry Break Vulnerability)',
      riskLevel: 'MODERATE',
      advisoryNote: 'Advise nursery raising on raised beds; encourage short duration Swarna Sub-1 varieties in flood-prone riverine tracts.',
    },
    {
      name: 'Pulses (अरहर / मूंग)',
      acreage: '18,500 Hectares',
      vulnerableBlocks: 'Bakshi Ka Talab & Sarojininagar',
      riskLevel: 'HIGH',
      advisoryNote: 'High susceptibility to waterlogging on clay soils. Ensure ridge-furrow planting to prevent root rot during heavy rainfall surges.',
    },
    {
      name: 'Kharif Maize (मक्का)',
      acreage: '12,200 Hectares',
      vulnerableBlocks: 'Mohanlalganj & Gosainganj',
      riskLevel: 'LOW',
      advisoryNote: 'Tolerant of anticipated onset conditions. Sowing recommended immediately following initial 25mm soaking rain.',
    },
    {
      name: 'Commercial Vegetables',
      acreage: '9,800 Hectares',
      vulnerableBlocks: 'Chinhat & Sarojininagar',
      riskLevel: 'HIGH',
      advisoryNote: 'High economic risk from June 27 heavy rain (>65mm). Stake tomato and cucurbit vines to avoid direct soil-borne blight.',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-xl text-slate-900">
              Crop Vulnerability Matrix & Agricultural Contingency
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Assessing localized climate risks against Lucknow district crop acreages
            </p>
          </div>
          <Badge variant="teal" size="sm">Kharif Season 2026</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cropVulnerabilities.map((c) => (
          <Card key={c.name} className="p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between pb-2 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-brand-teal" />
                  <h3 className="font-heading font-bold text-base text-slate-900">{c.name}</h3>
                </div>
                <Badge variant={c.riskLevel === 'HIGH' ? 'amber' : 'emerald'} size="sm">
                  {c.riskLevel} Risk
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Estimated Cultivation Area:</span>
                <strong className="text-slate-900">{c.acreage}</strong>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Vulnerable Clusters:</span>
                <span className="text-brand-amber-dark font-medium">{c.vulnerableBlocks}</span>
              </div>

              <div className="p-3 bg-surface-muted rounded-xl text-xs text-slate-700 leading-relaxed border border-surface-border">
                <strong>Agronomic Directive:</strong> {c.advisoryNote}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
