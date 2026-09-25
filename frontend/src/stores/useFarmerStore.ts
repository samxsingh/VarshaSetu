import { create } from 'zustand';
import {
  CropType,
  CropGrowthStage,
  ForecastHorizonDays,
  IrrigationFacility,
  SoilType,
} from '@shared/types';

export interface LocationSelection {
  state: string;
  district: string;
  block: string;
  panchayat: string;
  village: string;
  latitude: number;
  longitude: number;
}

// Configurable default demo location (Lucknow District, UP)
export const DEFAULT_DEMO_SELECTION: LocationSelection = {
  state: 'Uttar Pradesh',
  district: 'Lucknow',
  block: 'Bakshi Ka Talab',
  panchayat: 'Bhaisamau',
  village: 'Bhaisamau',
  latitude: 26.9856,
  longitude: 80.9254,
};

interface FarmerState {
  location: LocationSelection;
  crop: CropType;
  stage: CropGrowthStage;
  horizon: ForecastHorizonDays;
  irrigation: IrrigationFacility;
  soil: SoilType;
  farmSizeAcres: number;
  onboardingStep: number;
  hasCompletedOnboarding: boolean;
  
  setLocation: (loc: Partial<LocationSelection>) => void;
  setCrop: (crop: CropType) => void;
  setStage: (stage: CropGrowthStage) => void;
  setHorizon: (horizon: ForecastHorizonDays) => void;
  setIrrigation: (irr: IrrigationFacility) => void;
  setSoil: (soil: SoilType) => void;
  setFarmSizeAcres: (size: number) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useFarmerStore = create<FarmerState>((set) => ({
  location: DEFAULT_DEMO_SELECTION,
  crop: 'PADDY',
  stage: 'LAND_PREPARATION',
  horizon: 7,
  irrigation: 'RAINFED',
  soil: 'ALLUVIAL',
  farmSizeAcres: 2.5,
  onboardingStep: 1,
  hasCompletedOnboarding: true,

  setLocation: (loc) =>
    set((state) => ({ location: { ...state.location, ...loc } })),
  setCrop: (crop) => set({ crop }),
  setStage: (stage) => set({ stage }),
  setHorizon: (horizon) => set({ horizon }),
  setIrrigation: (irrigation) => set({ irrigation }),
  setSoil: (soil) => set({ soil }),
  setFarmSizeAcres: (farmSizeAcres) => set({ farmSizeAcres }),
  setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  resetOnboarding: () => set({ hasCompletedOnboarding: false, onboardingStep: 1 }),
}));
