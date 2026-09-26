import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, MapPin, Sprout, Droplets, RotateCcw, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { ScientificStatusBadge } from '../../components/farmer/ScientificStatusBadge';

export const FarmerProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { location, crop, stage, irrigation, soil, farmSizeAcres, resetOnboarding } = useFarmerStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border-2 border-[#102A43] p-6 sm:p-7 shadow-[4px_4px_0px_#102A43] space-y-6">
        
        {/* Header Profile Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b-2 border-[#102A43]/10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0E7490] text-white flex items-center justify-center font-heading font-black text-xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43]">
              RL
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-black text-2xl text-[#102A43]">
                  Ram Lakhan
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-[#EBF5EE] border border-[#3F7D58] text-[#3F7D58] text-xs font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Farmer Profile</span>
                </span>
              </div>
              <p className="text-xs text-[#829AB1] mt-0.5 font-sans">
                Registered Marginal Farmer • Bhaisamau Village • KVK Lucknow Member
              </p>
            </div>
          </div>

          <ScientificStatusBadge status="DEMO IDENTITY" size="sm" />
        </div>

        {/* 4 Profile Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-4 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15 space-y-1">
            <span className="text-[#829AB1] uppercase font-heading font-bold text-[10px] block tracking-wider">
              Farm Location
            </span>
            <strong className="text-[#102A43] block text-sm font-heading font-bold">
              {location.village}, {location.block}
            </strong>
            <span className="text-[#486581] block">
              {location.district} District, {location.state} • UP_LKO_BKT
            </span>
          </div>

          <div className="p-4 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15 space-y-1">
            <span className="text-[#829AB1] uppercase font-heading font-bold text-[10px] block tracking-wider">
              Current Crop & Phenology
            </span>
            <strong className="text-[#102A43] block text-sm font-heading font-bold">
              {t(`crops.${crop}`)}
            </strong>
            <span className="text-[#486581] block">
              {t(`stages.${stage}`)} • Kharif 2024 Cycle
            </span>
          </div>

          <div className="p-4 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15 space-y-1">
            <span className="text-[#829AB1] uppercase font-heading font-bold text-[10px] block tracking-wider">
              Irrigation & Soil Type
            </span>
            <strong className="text-[#102A43] block text-sm font-heading font-bold">
              {irrigation} Facility
            </strong>
            <span className="text-[#486581] block">
              {soil} Soil • {farmSizeAcres} Total Acres
            </span>
          </div>

          <div className="p-4 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15 space-y-1">
            <span className="text-[#829AB1] uppercase font-heading font-bold text-[10px] block tracking-wider">
              Language Preference
            </span>
            <div className="pt-1">
              <LanguageToggle />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t-2 border-[#102A43]/10">
          <Link to="/farmer/onboarding" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0E7490] text-white border-2 border-[#102A43] font-heading font-bold text-xs shadow-[2px_2px_0px_#102A43] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#102A43] transition-all">
              Reconfigure Farm Details
            </button>
          </Link>

          <button
            onClick={resetOnboarding}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold text-[#829AB1] hover:text-[#102A43] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Demonstration Default</span>
          </button>
        </div>
      </div>
    </div>
  );
};
