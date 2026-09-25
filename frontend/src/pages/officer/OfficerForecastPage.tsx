import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { CloudRain, SunMedium, CloudLightning, TrendingUp } from 'lucide-react';

export const OfficerForecastPage: React.FC = () => {
  const [horizon, setHorizon] = useState<'7' | '14' | '21' | '30'>('14');

  const blocksForecast = [
    { name: 'Bakshi Ka Talab', onset: 88, drySpell: 58, heavyRain: 65, anomaly: '+14%', riskTier: 'MODERATE' },
    { name: 'Malihabad', onset: 82, drySpell: 74, heavyRain: 45, anomaly: '-8%', riskTier: 'HIGH' },
    { name: 'Mohanlalganj', onset: 91, drySpell: 35, heavyRain: 72, anomaly: '+24%', riskTier: 'LOW' },
    { name: 'Sarojininagar', onset: 89, drySpell: 42, heavyRain: 55, anomaly: '+18%', riskTier: 'LOW' },
    { name: 'Gosainganj', onset: 86, drySpell: 38, heavyRain: 68, anomaly: '+12%', riskTier: 'LOW' },
    { name: 'Chinhat / Urban', onset: 87, drySpell: 45, heavyRain: 58, anomaly: '+6%', riskTier: 'LOW' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-lg text-slate-900">
                Block-Level Probabilistic Forecast Comparison
              </h2>
              <Badge variant="demo" size="sm">Simulated Forecasts</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Multi-horizon comparative table across all 6 administrative blocks in Lucknow
            </p>
          </div>

          <Tabs
            items={[
              { id: '7', label: '7-Day' },
              { id: '14', label: '14-Day' },
              { id: '21', label: '21-Day' },
              { id: '30', label: '30-Day' },
            ]}
            activeId={horizon}
            onChange={(id) => setHorizon(id as any)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-surface-border font-heading text-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Administrative Block</th>
                <th className="py-3 px-4">Onset Likelihood</th>
                <th className="py-3 px-4">Dry Spell Break Risk</th>
                <th className="py-3 px-4">Heavy Rain Risk (&gt;65mm)</th>
                <th className="py-3 px-4">Rainfall Departure</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {blocksForecast.map((b) => (
                <tr key={b.name} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-heading font-bold text-slate-900">{b.name}</td>
                  <td className="py-3.5 px-4 font-semibold text-brand-teal-dark">{b.onset}%</td>
                  <td className="py-3.5 px-4 font-semibold text-brand-amber-dark">{b.drySpell}%</td>
                  <td className="py-3.5 px-4 font-semibold text-brand-azure-dark">{b.heavyRain}%</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{b.anomaly}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={b.riskTier === 'HIGH' ? 'amber' : 'emerald'} size="sm">
                      {b.riskTier}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
