import { create } from 'zustand';

export type RiskMapLayer = 'ONSET' | 'DRY_SPELL' | 'HEAVY_RAIN' | 'ANOMALY';

interface OfficerState {
  selectedDistrict: string;
  selectedBlock: string;
  selectedPanchayat: string;
  activeRiskLayer: RiskMapLayer;
  isBulletinModalOpen: boolean;
  selectedHorizon: 7 | 14 | 21 | 30;

  setSelectedDistrict: (district: string) => void;
  setSelectedBlock: (block: string) => void;
  setSelectedPanchayat: (panchayat: string) => void;
  setActiveRiskLayer: (layer: RiskMapLayer) => void;
  setBulletinModalOpen: (open: boolean) => void;
  setSelectedHorizon: (horizon: 7 | 14 | 21 | 30) => void;
}

export const useOfficerStore = create<OfficerState>((set) => ({
  selectedDistrict: 'Lucknow',
  selectedBlock: 'Bakshi Ka Talab',
  selectedPanchayat: 'Bhaisamau',
  activeRiskLayer: 'DRY_SPELL',
  isBulletinModalOpen: false,
  selectedHorizon: 14,

  setSelectedDistrict: (selectedDistrict) => set({ selectedDistrict }),
  setSelectedBlock: (selectedBlock) => set({ selectedBlock }),
  setSelectedPanchayat: (selectedPanchayat) => set({ selectedPanchayat }),
  setActiveRiskLayer: (activeRiskLayer) => set({ activeRiskLayer }),
  setBulletinModalOpen: (isBulletinModalOpen) => set({ isBulletinModalOpen }),
  setSelectedHorizon: (selectedHorizon) => set({ selectedHorizon }),
}));
