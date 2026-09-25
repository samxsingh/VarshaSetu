import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Bell, Send, CheckCircle2, Clock } from 'lucide-react';
import { useOfficerStore } from '../../stores/useOfficerStore';

export const OfficerAdvisoriesPage: React.FC = () => {
  const { setBulletinModalOpen } = useOfficerStore();

  const bulletins = [
    {
      id: 'BUL-2026-08',
      title: 'Monsoon Onset Sowing & Drainage Directive',
      block: 'Bakshi Ka Talab & Malihabad',
      targetCrops: 'Paddy, Pulses',
      dispatchedAt: 'Today, 06:30 AM',
      reachCount: '18,400 farmers reached via SMS',
      status: 'DISPATCHED',
    },
    {
      id: 'BUL-2026-07',
      title: 'Pre-Monsoon Soil Conservation & FYM Application Advisory',
      block: 'District-wide (All 6 Blocks)',
      targetCrops: 'All Kharif crops',
      dispatchedAt: 'June 18, 08:00 AM',
      reachCount: '42,000 farmers reached via KVK',
      status: 'ARCHIVED',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-surface-border">
        <div>
          <h2 className="font-heading font-bold text-xl text-slate-900">
            Advisory Bulletin Dispatch Center
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Manage, schedule, and broadcast localized agromet advisories to extension personnel.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Send className="w-4 h-4" />}
          onClick={() => setBulletinModalOpen(true)}
        >
          Draft New Bulletin
        </Button>
      </div>

      <div className="space-y-4">
        {bulletins.map((b) => (
          <Card key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="teal" size="sm">{b.id}</Badge>
                <h3 className="font-heading font-bold text-base text-slate-900">{b.title}</h3>
              </div>
              <p className="text-xs text-slate-600">
                Scope: <strong className="text-slate-800">{b.block}</strong> • Crops: {b.targetCrops}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {b.dispatchedAt}</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" /> {b.reachCount}</span>
              </div>
            </div>

            <Button variant="secondary" size="sm">
              View Dispatched PDF
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
