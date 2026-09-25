import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const WhatIfPreviewCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card className="bg-gradient-to-br from-brand-teal-tint/50 via-white to-surface-muted border-brand-teal-border/70 mb-6">
      <CardContent className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-brand-teal text-white">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-heading font-bold text-base text-slate-900">
                {t('simulator.title')}
              </h3>
              <Badge variant="teal" size="sm">
                Interactive Tool
              </Badge>
            </div>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Unsure whether to sow this week or hold off? Compare risk scores, soil moisture projections, and nursery timing for <em>"Sow Now"</em> versus <em>"Wait 7 Days"</em>.
            </p>
          </div>

          <Link to="/farmer/what-if" className="shrink-0">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Decision Simulator
            </Button>
          </Link>
        </div>

        {/* Mini Comparison Teaser */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-surface-border/60">
          <div className="bg-white p-3 rounded-xl border border-surface-border text-xs flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 block">Sow Now (June 26)</span>
              <span className="text-brand-emerald-dark font-medium">Optimal 18% moisture stress risk</span>
            </div>
            <Badge variant="emerald" size="sm">Recommended</Badge>
          </div>

          <div className="bg-white p-3 rounded-xl border border-surface-border text-xs flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 block">Wait 7 Days (July 3)</span>
              <span className="text-brand-amber-dark font-medium">+42% risk due to dry break window</span>
            </div>
            <Badge variant="amber" size="sm">Higher Risk</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
