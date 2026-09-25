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
  Sparkles,
  Droplets,
  Layers,
  Ruler,
} from 'lucide-react';
import { useFarmerStore, DEFAULT_DEMO_SELECTION } from '../../stores/useFarmerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CropType, CropGrowthStage, IrrigationFacility, SoilType } from '@shared/types';

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

  const cropsList: { type: CropType; label: string; icon: string; desc: string }[] = [
    { type: 'PADDY', label: t('crops.PADDY'), icon: '🌾', desc: 'Basmati, Swarna, Swarna Sub-1, Sambha' },
    { type: 'MAIZE', label: t('crops.MAIZE'), icon: '🌽', desc: 'Hybrid Kharif Maize, Baby Corn' },
    { type: 'SOYBEAN', label: t('crops.SOYBEAN'), icon: '🌱', desc: 'JS-9560, JS-2034 varieties' },
    { type: 'PULSES', label: t('crops.PULSES'), icon: '🫘', desc: 'Pigeonpea (Arhar), Greengram (Moong)' },
    { type: 'COTTON', label: t('crops.COTTON'), icon: '☁️', desc: 'Bt Cotton, Desi varieties' },
    { type: 'GROUNDNUT', label: t('crops.GROUNDNUT'), icon: '🥜', desc: 'Kharif bunch/spreading types' },
    { type: 'MILLETS', label: t('crops.MILLETS'), icon: '🌾', desc: 'Pearl Millet (Bajra), Sorghum (Jowar)' },
  ];

  const stagesList: { type: CropGrowthStage; label: string; desc: string }[] = [
    {
      type: 'LAND_PREPARATION',
      label: t('stages.LAND_PREPARATION'),
      desc: 'Ploughing, field leveling, bund repair before monsoon showers arrive.',
    },
    {
      type: 'NURSERY_SOWING',
      label: t('stages.NURSERY_SOWING'),
      desc: 'Seed treatment, nursery wet-bed raising, or direct field drilling.',
    },
    {
      type: 'VEGETATIVE',
      label: t('stages.VEGETATIVE'),
      desc: 'Active tillering, branching, root establishment, weed management.',
    },
    {
      type: 'FLOWERING_REPRODUCTIVE',
      label: t('stages.FLOWERING_REPRODUCTIVE'),
      desc: 'Panicle initiation, tasseling, flowering (peak water-sensitive stage).',
    },
    {
      type: 'GRAIN_POD_FILLING',
      label: t('stages.GRAIN_POD_FILLING'),
      desc: 'Milky stage, grain dough development, pod enlargement.',
    },
    {
      type: 'MATURITY_HARVESTING',
      label: t('stages.MATURITY_HARVESTING'),
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
        <Badge variant="teal" size="sm">
          {t('onboarding.step')} {currentStep} of 4
        </Badge>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900">
          Tell us about your farm
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          We use this to downscale atmospheric signals into exact advice for your crops.
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mx-auto h-2 bg-slate-200 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-brand-teal transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: WHERE IS YOUR FARM? */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-brand-teal" />
              <h2 className="font-heading font-bold text-xl text-slate-900">
                {t('onboarding.step1Title')}
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('onboarding.step1Subtitle')}
            </p>
          </div>

          {/* Configurable Demo Notice */}
          <div className="bg-brand-teal-tint/50 border border-brand-teal-border p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-xs text-brand-teal-dark uppercase tracking-wider">
                Default Demonstration Location
              </span>
              <Badge variant="teal" size="sm">Lucknow District, UP</Badge>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              In this development version, geography is initialized to Lucknow District. You can select sample blocks and panchayats below:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                State
              </label>
              <input
                type="text"
                disabled
                value={location.state}
                className="w-full bg-slate-100 border border-surface-border rounded-lg p-2.5 text-xs text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                District
              </label>
              <input
                type="text"
                disabled
                value={location.district}
                className="w-full bg-slate-100 border border-surface-border rounded-lg p-2.5 text-xs text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                Block
              </label>
              <select
                value={location.block}
                onChange={(e) => setLocation({ block: e.target.value })}
                className="w-full bg-white border border-surface-border rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:ring-1 focus:ring-brand-teal"
              >
                <option value="Bakshi Ka Talab">Bakshi Ka Talab</option>
                <option value="Malihabad">Malihabad</option>
                <option value="Mohanlalganj">Mohanlalganj</option>
                <option value="Sarojininagar">Sarojininagar</option>
                <option value="Gosainganj">Gosainganj</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                Gram Panchayat & Village
              </label>
              <select
                value={location.village}
                onChange={(e) => setLocation({ village: e.target.value, panchayat: e.target.value })}
                className="w-full bg-white border border-surface-border rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:ring-1 focus:ring-brand-teal"
              >
                <option value="Bhaisamau">Bhaisamau (भैंसामऊ)</option>
                <option value="Asti">Asti (अस्ती)</option>
                <option value="Bargadi Magath">Bargadi Magath (बरगदी मगठ)</option>
                <option value="Itaunja">Itaunja (इटौंजा)</option>
                <option value="Kathwara">Kathwara (कठवारा)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-surface-border">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setCurrentStep(2)}
            >
              {t('common.next')}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: WHAT ARE YOU GROWING? */}
      {currentStep === 2 && (
        <Card className="p-6 space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sprout className="w-5 h-5 text-brand-teal" />
              <h2 className="font-heading font-bold text-xl text-slate-900">
                {t('onboarding.step2Title')}
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('onboarding.step2Subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cropsList.map((item) => {
              const isSelected = crop === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => setCrop(item.type)}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 min-h-[72px] ${
                    isSelected
                      ? 'bg-brand-teal-tint/60 border-brand-teal ring-2 ring-brand-teal/40'
                      : 'bg-white border-surface-border hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-sm text-slate-900">
                        {item.label}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-brand-teal" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setCurrentStep(1)}
            >
              {t('common.back')}
            </Button>
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setCurrentStep(3)}
            >
              {t('common.next')}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: WHICH STAGE IS YOUR CROP IN? */}
      {currentStep === 3 && (
        <Card className="p-6 space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-brand-teal" />
              <h2 className="font-heading font-bold text-xl text-slate-900">
                {t('onboarding.step3Title')}
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('onboarding.step3Subtitle')}
            </p>
          </div>

          <div className="space-y-2.5">
            {stagesList.map((item) => {
              const isSelected = stage === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => setStage(item.type)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between min-h-[56px] ${
                    isSelected
                      ? 'bg-brand-teal-tint/60 border-brand-teal ring-2 ring-brand-teal/40'
                      : 'bg-white border-surface-border hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-heading font-bold text-sm text-slate-900 block">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">{item.desc}</span>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-brand-teal shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setCurrentStep(2)}
            >
              {t('common.back')}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleFinish}>
                {t('common.skip')} & Finish
              </Button>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setCurrentStep(4)}
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: OPTIONAL ENRICHMENT (SKIPPABLE) */}
      {currentStep === 4 && (
        <Card className="p-6 space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-slate-900">
                {t('onboarding.optionalTitle')}
              </h2>
              <Badge variant="neutral" size="sm">Skippable</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Adding irrigation and soil details refines the precision of what-if simulations.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                {t('onboarding.irrigationType')}
              </label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value as IrrigationFacility)}
                className="w-full bg-white border border-surface-border rounded-lg p-2.5 text-xs text-slate-900 font-medium"
              >
                <option value="RAINFED">Rainfed (वर्षा आधारित)</option>
                <option value="CANAL">Canal Irrigation (नहरी पानी)</option>
                <option value="TUBEWELL">Private / Community Tubewell (नलकूप / बोरवेल)</option>
                <option value="DRIP_SPRINKLER">Drip / Sprinkler (ड्रिप / फव्वारा)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                {t('onboarding.soilType')}
              </label>
              <select
                value={soil}
                onChange={(e) => setSoil(e.target.value as SoilType)}
                className="w-full bg-white border border-surface-border rounded-lg p-2.5 text-xs text-slate-900 font-medium"
              >
                <option value="ALLUVIAL">Alluvial / Loam (दोमट मिट्टी - Gangetic Plains)</option>
                <option value="CLAY">Clay / Heavy (मटियार / चिकनी मिट्टी)</option>
                <option value="SANDY_LOAM">Sandy Loam (बलुई दोमट)</option>
                <option value="BLACK_COTTON">Black Cotton Soil (काली मिट्टी)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                {t('onboarding.farmSize')}
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={farmSizeAcres}
                onChange={(e) => setFarmSizeAcres(Number(e.target.value))}
                className="w-full bg-white border border-surface-border rounded-lg p-2.5 text-xs text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setCurrentStep(3)}
            >
              {t('common.back')}
            </Button>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<Check className="w-4 h-4" />}
              onClick={handleFinish}
            >
              {t('onboarding.finish')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
