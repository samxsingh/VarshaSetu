import React from 'react';
import { MapPin, Sprout, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { useOfficerStore } from '../../stores/useOfficerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';

export const SelectedAreaPanel: React.FC = () => {
  const { selectedBlock, selectedPanchayat, setSelectedPanchayat, setBulletinModalOpen } =
    useOfficerStore();

  const mockPanchayats = [
    { name: 'Bhaisamau', risk: 'HIGH', drySpell: 68, crop: 'Paddy / Swarna' },
    { name: 'Asti', risk: 'MODERATE', drySpell: 52, crop: 'Pulses / Arhar' },
    { name: 'Bargadi Magath', risk: 'LOW', drySpell: 34, crop: 'Paddy' },
    { name: 'Itaunja', risk: 'HIGH', drySpell: 72, crop: 'Vegetables' },
    { name: 'Kathwara', risk: 'MODERATE', drySpell: 48, crop: 'Paddy / Maize' },
  ];

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 border-b border-surface-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-teal-tint text-brand-teal">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base">{selectedBlock} Block</CardTitle>
                <p className="text-xs text-slate-500">Lucknow District • 84 Gram Panchayats</p>
              </div>
            </div>
            <Badge variant="amber" size="sm">
              Watch Tier 2
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Soil Moisture & Vulnerability */}
          <div className="bg-surface-muted p-3.5 rounded-xl border border-surface-border space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Topsoil Moisture Saturation</span>
              <strong className="text-slate-900 font-heading">62% (Adequate)</strong>
            </div>
            <Progress value={62} color="teal" height="sm" />
            <p className="text-[11px] text-slate-500">
              Projected 5-day dry spell post-onset may drop moisture to 35% without irrigation.
            </p>
          </div>

          {/* Panchayat Quick Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-heading font-semibold text-xs text-slate-700 uppercase tracking-wider">
                Sample Gram Panchayats
              </h5>
              <span className="text-[11px] text-slate-500">Showing 5</span>
            </div>
            <div className="space-y-1.5">
              {mockPanchayats.map((p) => {
                const isSelected = selectedPanchayat === p.name;
                return (
                  <button
                    key={p.name}
                    onClick={() => setSelectedPanchayat(p.name)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs text-left transition-all border ${
                      isSelected
                        ? 'bg-brand-teal-tint/60 border-brand-teal text-brand-teal-dark font-semibold'
                        : 'bg-white border-surface-border hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <span className="block font-medium">{p.name}</span>
                      <span className="text-[11px] text-slate-500">{p.crop}</span>
                    </div>
                    <Badge
                      variant={p.risk === 'HIGH' ? 'amber' : p.risk === 'MODERATE' ? 'azure' : 'emerald'}
                      size="sm"
                    >
                      {p.drySpell}% risk
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </div>

      <div className="pt-4 border-t border-surface-border mt-4">
        <Button
          variant="primary"
          fullWidth
          size="md"
          leftIcon={<Send className="w-4 h-4" />}
          onClick={() => setBulletinModalOpen(true)}
        >
          Draft Broadcast Bulletin
        </Button>
      </div>
    </Card>
  );
};
