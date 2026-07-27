import { useContext } from 'react';
import { PreferenceContext } from '@/shared/providers/preferenceContext';

export function usePreferences() {
  const context = useContext(PreferenceContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
