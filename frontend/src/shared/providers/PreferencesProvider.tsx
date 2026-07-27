import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { PreferenceContext } from './preferenceContext';

const getSystemReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [isPresentationMode, setPresentationMode] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(getSystemReducedMotion);
  const [reducedMotionOverride, setReducedMotionOverride] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => setSystemReducedMotion(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const isReducedMotion = reducedMotionOverride ?? systemReducedMotion;
  const value = useMemo(
    () => ({
      isPresentationMode,
      isReducedMotion,
      togglePresentationMode: () => setPresentationMode((current) => !current),
      toggleReducedMotion: () =>
        setReducedMotionOverride((current) => !(current ?? systemReducedMotion)),
    }),
    [isPresentationMode, isReducedMotion, systemReducedMotion],
  );

  return <PreferenceContext.Provider value={value}>{children}</PreferenceContext.Provider>;
}
