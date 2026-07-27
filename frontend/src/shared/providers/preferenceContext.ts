import { createContext } from 'react';

export interface PreferenceContextValue {
  isPresentationMode: boolean;
  isReducedMotion: boolean;
  togglePresentationMode: () => void;
  toggleReducedMotion: () => void;
}

export const PreferenceContext = createContext<PreferenceContextValue | null>(null);
