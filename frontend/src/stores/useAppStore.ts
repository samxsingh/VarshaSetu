import { create } from 'zustand';
import i18n from '../i18n/config';
import { UserRole } from '@shared/types';

interface AppState {
  currentRole: UserRole;
  language: 'en' | 'hi';
  isAudioBriefingPlaying: boolean;
  setRole: (role: UserRole) => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  setAudioBriefingPlaying: (playing: boolean) => void;
  toggleAudioBriefing: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRole: 'FARMER',
  language: 'en',
  isAudioBriefingPlaying: false,
  setRole: (role) => set({ currentRole: role }),
  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
  },
  setAudioBriefingPlaying: (playing) => set({ isAudioBriefingPlaying: playing }),
  toggleAudioBriefing: () => set((state) => ({ isAudioBriefingPlaying: !state.isAudioBriefingPlaying })),
}));
