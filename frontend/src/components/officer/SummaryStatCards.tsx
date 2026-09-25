import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, AlertTriangle, CloudSun, Radio, Database } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const SummaryStatCards: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('officer.monitoredPanchayats'),
      value: '440',
      subtitle: 'Across 6 Blocks (Lucknow)',
      icon: <Building2 className="w-5 h-5 text-brand-teal" />,
      tag: '100% Synced',
      tagVariant: 'teal' as const,
    },
    {
      title: t('officer.highRiskBlocks'),
      value: '2',
      subtitle: 'Malihabad & BKT (Dry Break)',
      icon: <AlertTriangle className="w-5 h-5 text-brand-amber" />,
      tag: 'Watch Active',
      tagVariant: 'amber' as const,
    },
    {
      title: t('officer.heavyRainAlerts'),
      value: '3 Blocks',
      subtitle: '>65mm event projected June 27',
      icon: <CloudSun className="w-5 h-5 text-brand-azure" />,
      tag: 'Alert Tier 2',
      tagVariant: 'azure' as const,
    },
    {
      title: t('officer.dataFreshness'),
      value: 'FRESH',
      subtitle: 'Simulated Demo Pipeline',
      icon: <Database className="w-5 h-5 text-brand-emerald" />,
      tag: 'Demo Mode',
      tagVariant: 'demo' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s, i) => (
        <Card key={i} className="p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {s.title}
            </span>
            <div className="p-2 rounded-xl bg-surface-muted border border-surface-border">
              {s.icon}
            </div>
          </div>

          <div className="my-2">
            <span className="font-heading font-bold text-2xl text-slate-900 block">
              {s.value}
            </span>
            <span className="text-xs text-slate-600 block mt-0.5">{s.subtitle}</span>
          </div>

          <div className="pt-2 border-t border-surface-border/60">
            <Badge variant={s.tagVariant} size="sm">
              {s.tag}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
};
