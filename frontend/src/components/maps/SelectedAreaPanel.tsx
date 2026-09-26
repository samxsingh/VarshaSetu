import React from 'react';
import { MapPin, Sprout, AlertTriangle, Send, CheckCircle2, Droplets, ChevronRight } from 'lucide-react';
import { useOfficerStore } from '../../stores/useOfficerStore';
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
    <div className="bg-white border-2 border-[#102A43] rounded-xl shadow-[3px_3px_0px_#102A43] p-4 flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        {/* Header Strip */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#102A43]/15">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#E8F4F6] text-[#155E75] border border-[#0E7490]/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm text-[#102A43]">
                {selectedBlock} Block
              </h3>
              <p className="text-[11px] font-mono text-[#829AB1]">
                Lucknow District • 84 Gram Panchayats
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] border border-[#D97706] text-[#B45309] text-[10px] font-mono font-bold">
            Watch Tier 2
          </span>
        </div>

        {/* Soil Moisture & Meteorological Vulnerability */}
        <div className="bg-[#F3F6F7] p-3.5 rounded-xl border border-[#102A43]/15 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#486581] font-medium flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#0E7490]" />
              Topsoil Moisture Saturation
            </span>
            <strong className="text-[#102A43] font-mono font-bold">62% (Adequate)</strong>
          </div>
          <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#102A43]/15">
            <div className="bg-[#0E7490] h-full rounded-full" style={{ width: '62%' }} />
          </div>
          <p className="text-[10px] text-[#829AB1] leading-relaxed">
            Projected 5-day dry spell post-onset may reduce topsoil moisture to ~35% on light sandy loams.
          </p>
        </div>

        {/* Sample Gram Panchayats Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-[#829AB1]">
              Sample Gram Panchayats ({mockPanchayats.length})
            </span>
            <span className="text-[10px] font-mono text-[#829AB1]">Kharif Centroids</span>
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
                      ? 'bg-[#0E7490] text-white border-[#102A43] shadow-[2px_2px_0px_#102A43]'
                      : 'bg-[#FFFFFF] border-[#102A43]/10 hover:border-[#102A43]/40 hover:bg-white text-[#102A43]'
                  }`}
                >
                  <div>
                    <span className="block font-heading font-bold text-xs">{p.name}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#829AB1]'}`}>
                      {p.crop}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        isSelected
                          ? 'bg-white text-[#0E7490]'
                          : p.risk === 'HIGH'
                          ? 'bg-[#FEF3C7] text-[#B45309] border border-[#D97706]/40'
                          : p.risk === 'MODERATE'
                          ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#3B82F6]/30'
                          : 'bg-[#EBF5EE] text-[#3F7D58] border border-[#3F7D58]/30'
                      }`}
                    >
                      {p.risk}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#829AB1]'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t-2 border-[#102A43]/10">
        <button
          onClick={() => setBulletinModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0E7490] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs font-heading font-bold min-h-[40px]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Disseminate to {selectedBlock}</span>
        </button>
      </div>
    </div>
  );
};
