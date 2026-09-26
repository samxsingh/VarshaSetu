import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Sprout,
  Calendar,
  Check,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { geographyService } from '../../services/geographyService';
import { CropType, CropGrowthStage, IrrigationFacility, SoilType, StateEntity, DistrictEntity, BlockEntity, PanchayatEntity } from '@shared/types';
import { ScientificStatusBadge } from '../../components/farmer/ScientificStatusBadge';

export const FarmerOnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    location,
    setLocation,
    crop,
    setCrop,
    stage,
    setStage,
    irrigation,
    setIrrigation,
    soil,
    setSoil,
    farmSizeAcres,
    setFarmSizeAcres,
    completeOnboarding,
  } = useFarmerStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [states, setStates] = useState<StateEntity[]>([]);
  const [districts, setDistricts] = useState<DistrictEntity[]>([]);
  const [blocks, setBlocks] = useState<BlockEntity[]>([]);
  const [panchayats, setPanchayats] = useState<PanchayatEntity[]>([]);
  const [isLiveGeography, setIsLiveGeography] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  React.useEffect(() => {
    async function loadGeography() {
      setGeoLoading(true);
      try {
        const statesRes = await geographyService.getStates();
        if (statesRes.success && statesRes.data.length > 0) {
          setStates(statesRes.data);
          const defaultState = statesRes.data[0];
          const distRes = await geographyService.getDistricts(defaultState.id);
          if (distRes.success && distRes.data.length > 0) {
            setDistricts(distRes.data);
            const defaultDist = distRes.data[0];
            const blocksRes = await geographyService.getBlocks(defaultDist.id);
            if (blocksRes.success && blocksRes.data.length > 0) {
              setBlocks(blocksRes.data);
              setIsLiveGeography(true);
              const bktBlock = blocksRes.data.find((b) => b.name === location.block) || blocksRes.data[0];
              const panchRes = await geographyService.getPanchayats(bktBlock.id);
              if (panchRes.success && panchRes.data.length > 0) {
                setPanchayats(panchRes.data);
              }
            }
          }
        }
      } catch {
        // Graceful fallback to default demo selection
        setIsLiveGeography(false);
      } finally {
        setGeoLoading(false);
      }
    }
    loadGeography();
  }, [location.block]);

  const handleBlockChange = async (blockName: string) => {
    setLocation({ block: blockName });
    const selectedBlock = blocks.find((b) => b.name === blockName);
    if (selectedBlock) {
      try {
        const res = await geographyService.getPanchayats(selectedBlock.id);
        if (res.success && res.data.length > 0) {
          setPanchayats(res.data);
          setLocation({ village: res.data[0].name, panchayat: res.data[0].name });
        }
      } catch {
        // Retain existing
      }
    }
  };

  const cropsList: { type: CropType; label: string; icon: string; desc: string }[] = [
    { type: 'PADDY', label: t('crops.PADDY') || 'Paddy', icon: '🌾', desc: 'Basmati, Swarna, Swarna Sub-1, Sambha' },
    { type: 'MAIZE', label: t('crops.MAIZE') || 'Maize', icon: '🌽', desc: 'Hybrid Kharif Maize, Baby Corn' },
    { type: 'SOYBEAN', label: t('crops.SOYBEAN') || 'Soybean', icon: '🌱', desc: 'JS-9560, JS-2034 varieties' },
    { type: 'PULSES', label: t('crops.PULSES') || 'Pulses', icon: '🫘', desc: 'Pigeonpea (Arhar), Greengram (Moong)' },
    { type: 'COTTON', label: t('crops.COTTON') || 'Cotton', icon: '☁️', desc: 'Bt Cotton, Desi varieties' },
    { type: 'GROUNDNUT', label: t('crops.GROUNDNUT') || 'Groundnut', icon: '🥜', desc: 'Kharif bunch/spreading types' },
    { type: 'MILLETS', label: t('crops.MILLETS') || 'Millets', icon: '🌾', desc: 'Pearl Millet (Bajra), Sorghum (Jowar)' },
  ];

  const stagesList: { type: CropGrowthStage; label: string; desc: string }[] = [
    {
      type: 'LAND_PREPARATION',
      label: t('stages.LAND_PREPARATION') || 'Land Preparation',
      desc: 'Ploughing, field leveling, bund repair before monsoon showers arrive.',
    },
    {
      type: 'NURSERY_SOWING',
      label: t('stages.NURSERY_SOWING') || 'Nursery & Sowing',
      desc: 'Seed treatment, nursery wet-bed raising, or direct field drilling.',
    },
    {
      type: 'VEGETATIVE',
      label: t('stages.VEGETATIVE') || 'Vegetative Tillering',
      desc: 'Active tillering, branching, root establishment, weed management.',
    },
    {
      type: 'FLOWERING_REPRODUCTIVE',
      label: t('stages.FLOWERING_REPRODUCTIVE') || 'Flowering & Reproductive',
      desc: 'Panicle initiation, tasseling, flowering (peak water-sensitive stage).',
    },
    {
      type: 'GRAIN_POD_FILLING',
      label: t('stages.GRAIN_POD_FILLING') || 'Grain Filling',
      desc: 'Milky stage, grain dough development, pod enlargement.',
    },
    {
      type: 'MATURITY_HARVESTING',
      label: t('stages.MATURITY_HARVESTING') || 'Maturity & Harvesting',
      desc: 'Yellowing of leaves, physiological maturity, cutting and threshing.',
    },
  ];

  const handleFinish = () => {
    completeOnboarding();
    navigate('/farmer/dashboard');
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 py-8">
      {/* Step Indicator Header */}
      <div className="mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#DCEFF0] border border-[#008F83]/40 text-[#006B65] text-xs font-heading font-extrabold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#0B1726]">
          {t('onboarding.step') || 'Step'} {currentStep} of 4
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#0B1726]">
          Tell us about your farm
        </h1>
        <p className="text-xs sm:text-sm text-[#435466] max-w-md mx-auto font-sans">
          We use this to downscale atmospheric signals into exact advice for your crops.
        </p>

        {/* Neo-brutalist Progress Bar */}
        <div className="w-full max-w-xs mx-auto h-3 bg-[#F7F3EA] rounded-full border-2 border-[#0B1726] overflow-hidden mt-4 shadow-[1.5px_1.5px_0px_#0B1726]">
          <div
            className="h-full bg-[#008F83] transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: WHERE IS YOUR FARM? */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border-2 border-[#0B1726] p-6 sm:p-7 shadow-[4px_4px_0px_#0B1726] space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-[#008F83]" />
              <h2 className="font-heading font-black text-xl text-[#0B1726]">
                {t('onboarding.step1Title') || 'Where is your farm located?'}
              </h2>
            </div>
            <p className="text-xs text-[#435466] leading-relaxed font-sans">
              {t('onboarding.step1Subtitle') || 'Select your district and block to connect with the local meteorological ground anchor.'}
            </p>
          </div>

          {/* Configurable Demo Notice */}
          <div className="bg-[#DCEFF0]/60 border-2 border-[#0B1726] p-4 rounded-xl space-y-1.5 shadow-[2px_2px_0px_#0B1726]">
            <div className="flex items-center justify-between">
              <span className="font-heading font-extrabold text-xs text-[#006B65] uppercase tracking-wider">
                Geographic Hierarchy
              </span>
              {isLiveGeography ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EBF5EE] text-[#2F7D4A]">POSTGIS / API CONNECTED</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-[#006B65]">DEFAULT DEMO: LUCKNOW, UP</span>
              )}
            </div>
            <p className="text-xs text-[#0B1726] leading-relaxed font-sans">
              {isLiveGeography
                ? 'Administrative nodes loaded live from PostgreSQL / PostGIS backend hierarchy.'
                : 'In development mode, initialized to Lucknow District. Select demonstration blocks and panchayats:'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#0B1726] block mb-1.5">
                State
              </label>
              <input
                type="text"
                disabled
                value={states.length > 0 ? states[0].name : location.state}
                className="w-full bg-[#F7F3EA] border-2 border-[#0B1726]/30 rounded-xl p-2.5 text-xs text-[#435466] font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#0B1726] block mb-1.5">
                District
              </label>
              <input
                type="text"
                disabled
                value={districts.length > 0 ? districts[0].name : location.district}
                className="w-full bg-[#F7F3EA] border-2 border-[#0B1726]/30 rounded-xl p-2.5 text-xs text-[#435466] font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#0B1726] block mb-1.5">
                Block
              </label>
              <select
                value={location.block}
                onChange={(e) => handleBlockChange(e.target.value)}
                className="w-full bg-white border-2 border-[#0B1726] rounded-xl p-2.5 text-xs text-[#0B1726] font-bold focus:ring-2 focus:ring-[#008F83]"
              >
                {blocks.length > 0 ? (
                  blocks.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Bakshi Ka Talab">Bakshi Ka Talab</option>
                    <option value="Malihabad">Malihabad</option>
                    <option value="Mohanlalganj">Mohanlalganj</option>
                    <option value="Sarojininagar">Sarojininagar</option>
                    <option value="Gosainganj">Gosainganj</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#0B1726] block mb-1.5">
                Gram Panchayat & Village
              </label>
              <select
                value={location.village}
                onChange={(e) => setLocation({ village: e.target.value, panchayat: e.target.value })}
                className="w-full bg-white border-2 border-[#0B1726] rounded-xl p-2.5 text-xs text-[#0B1726] font-bold focus:ring-2 focus:ring-[#008F83]"
              >
                {panchayats.length > 0 ? (
                  panchayats.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Bhaisamau">Bhaisamau (भैंसामऊ)</option>
                    <option value="Rampur">Rampur (रामपुर)</option>
                    <option value="Mampur">Mampur (मामपुर)</option>
                    <option value="Kamalpur">Kamalpur (कमलपुर)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t-2 border-[#0B1726]/10">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#008F83] text-white border-2 border-[#0B1726] font-heading font-bold text-xs shadow-[2px_2px_0px_#0B1726] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0B1726] transition-all"
            >
              <span>{t('common.next') || 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: WHAT ARE YOU GROWING? */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border-2 border-[#0B1726] p-6 sm:p-7 shadow-[4px_4px_0px_#0B1726] space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sprout className="w-5 h-5 text-[#2F7D4A]" />
              <h2 className="font-heading font-black text-xl text-[#0B1726]">
                {t('onboarding.step2Title') || 'What are you growing?'}
              </h2>
            </div>
            <p className="text-xs text-[#435466] leading-relaxed font-sans">
              {t('onboarding.step2Subtitle') || 'Select your target crop so the agronomic engine applies crop-specific thresholds.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {cropsList.map((item) => {
              const isSelected = crop === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => setCrop(item.type)}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 min-h-[72px] ${
                    isSelected
                      ? 'bg-[#EBF5EE] border-[#2F7D4A] shadow-[2px_2px_0px_#0B1726]'
                      : 'bg-[#F7F3EA] border-[#0B1726]/20 hover:border-[#0B1726] hover:bg-white'
                  }`}
                >
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-black text-sm text-[#0B1726]">
                        {item.label}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#2F7D4A]" />}
                    </div>
                    <p className="text-xs text-[#435466] mt-0.5 line-clamp-1 font-sans">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t-2 border-[#0B1726]/10">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-heading font-bold text-[#62768A] hover:text-[#0B1726] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common.back') || 'Back'}</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#008F83] text-white border-2 border-[#0B1726] font-heading font-bold text-xs shadow-[2px_2px_0px_#0B1726] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0B1726] transition-all"
            >
              <span>{t('common.next') || 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: WHICH STAGE IS YOUR CROP IN? */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border-2 border-[#0B1726] p-6 sm:p-7 shadow-[4px_4px_0px_#0B1726] space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-[#008F83]" />
              <h2 className="font-heading font-black text-xl text-[#0B1726]">
                {t('onboarding.step3Title') || 'Which growth stage is your crop currently in?'}
              </h2>
            </div>
            <p className="text-xs text-[#435466] leading-relaxed font-sans">
              {t('onboarding.step3Subtitle') || 'Crop vulnerability to moisture stress and heavy downpours varies across growth stages.'}
            </p>
          </div>

          <div className="space-y-3">
            {stagesList.map((item) => {
              const isSelected = stage === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => setStage(item.type)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between min-h-[56px] ${
                    isSelected
                      ? 'bg-[#EBF5EE] border-[#2F7D4A] shadow-[2px_2px_0px_#0B1726]'
                      : 'bg-[#F7F3EA] border-[#0B1726]/20 hover:border-[#0B1726] hover:bg-white'
                  }`}
                >
                  <div>
                    <span className="font-heading font-black text-sm text-[#0B1726] block">
                      {item.label}
                    </span>
                    <span className="text-xs text-[#435466] block mt-0.5 font-sans">{item.desc}</span>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-[#2F7D4A] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t-2 border-[#0B1726]/10">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-heading font-bold text-[#62768A] hover:text-[#0B1726] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common.back') || 'Back'}</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleFinish}
                className="px-4 py-2.5 rounded-xl border border-[#0B1726]/30 text-xs font-heading font-bold text-[#435466] hover:bg-[#F7F3EA] transition-all"
              >
                {t('common.skip') || 'Skip'} & Finish
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#008F83] text-white border-2 border-[#0B1726] font-heading font-bold text-xs shadow-[2px_2px_0px_#0B1726] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0B1726] transition-all"
              >
                <span>{t('common.next') || 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: OPTIONAL ENRICHMENT */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border-2 border-[#0B1726] p-6 sm:p-7 shadow-[4px_4px_0px_#0B1726] space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-black text-xl text-[#0B1726]">
                {t('onboarding.optionalTitle') || 'Field Attributes & Soil Properties'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F7F3EA] border border-[#0B1726]/20 text-[#62768A]">
                Skippable
              </span>
            </div>
            <p className="text-xs text-[#435466] mt-1 font-sans">
              Adding irrigation and soil details refines the precision of what-if simulations.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#0B1726] block mb-1.5">
                {t('onboarding.irrigationType') || 'Irrigation Type'}
              </label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value as IrrigationFacility)}
                className="w-full bg-[#F7F3EA] border-2 border-[#0B1726]/30 rounded-xl p-2.5 text-xs text-[#0B1726] font-bold focus:ring-2 focus:ring-[#008F83]"
              >
                <option value="RAINFED">Rainfed (वर्षा आधारित)</option>
                <option value="CANAL">Canal Irrigation (नहरी पानी)</option>
                <option value="TUBEWELL">Private / Community Tubewell (नलकूप / बोरवेल)</option>
                <option value="DRIP_SPRINKLER">Drip / Sprinkler (ड्रिप / फव्वारा)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#0B1726] block mb-1.5">
                {t('onboarding.soilType') || 'Soil Type'}
              </label>
              <select
                value={soil}
                onChange={(e) => setSoil(e.target.value as SoilType)}
                className="w-full bg-[#F7F3EA] border-2 border-[#0B1726]/30 rounded-xl p-2.5 text-xs text-[#0B1726] font-bold focus:ring-2 focus:ring-[#008F83]"
              >
                <option value="ALLUVIAL">Alluvial / Loam (दोमट मिट्टी - Gangetic Plains)</option>
                <option value="CLAY">Clay / Heavy (मटियार / चिकनी मिट्टी)</option>
                <option value="SANDY_LOAM">Sandy Loam (बलुई दोमट)</option>
                <option value="BLACK_COTTON">Black Cotton Soil (काली मिट्टी)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#0B1726] block mb-1.5">
                {t('onboarding.farmSize') || 'Farm Size (Acres)'}
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={farmSizeAcres}
                onChange={(e) => setFarmSizeAcres(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#0B1726]/30 rounded-xl p-2.5 text-xs text-[#0B1726] font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t-2 border-[#0B1726]/10">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-heading font-bold text-[#62768A] hover:text-[#0B1726] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common.back') || 'Back'}</span>
            </button>
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#008F83] text-white border-2 border-[#0B1726] font-heading font-bold text-xs shadow-[2px_2px_0px_#0B1726] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0B1726] transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{t('onboarding.finish') || 'Save & Launch Dashboard'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
