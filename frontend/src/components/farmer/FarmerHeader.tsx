import React from 'react';
import { MapPin, Sprout, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { ScientificStatusBadge } from './ScientificStatusBadge';

export const FarmerHeader: React.FC = () => {
  const { t } = useTranslation();
  const { location, crop, stage } = useFarmerStore();

  return (
    <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#102A43] mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Location & Synchronized Time */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#E8F4F6] border border-[#0E7490]/40 text-[#155E75] shrink-0 mt-0.5 shadow-[1.5px_1.5px_0px_#102A43]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-black text-xl text-[#102A43]">
                {location.village}, {location.block}
              </h2>
              <ScientificStatusBadge status="DEMO LOCATION" size="sm" />
            </div>
            <p className="text-xs text-[#486581] mt-1 font-sans">
              {location.district} District, {location.state} • <span className="font-mono text-[11px] text-[#829AB1]">UP_LKO_BKT Ground Anchor</span>
            </p>
          </div>
        </div>

        {/* Crop Profile & Change Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#102A43]/10 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2.5 bg-[#F3F6F7] px-3.5 py-2 rounded-xl border border-[#102A43]/20">
            <Sprout className="w-4 h-4 text-[#3F7D58]" />
            <div className="text-left">
              <span className="text-[10px] font-heading font-bold text-[#829AB1] uppercase tracking-wider block">
                Target Crop
              </span>
              <span className="text-xs font-heading font-black text-[#102A43] block">
                {t(`crops.${crop}`)} • {t(`stages.${stage}`)}
              </span>
            </div>
          </div>

          <Link
            to="/farmer/onboarding"
            className="p-2.5 text-[#486581] hover:text-[#0E7490] bg-[#F3F6F7] hover:bg-[#E8F4F6] rounded-xl border border-[#102A43]/20 transition-all shadow-[1.5px_1.5px_0px_#102A43] hover:shadow-none"
            title="Edit farm details"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
