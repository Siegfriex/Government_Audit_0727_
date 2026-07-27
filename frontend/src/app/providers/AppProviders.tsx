import type { PropsWithChildren } from 'react';
import { PreferencesProvider } from '@/shared/providers/PreferencesProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return <PreferencesProvider>{children}</PreferencesProvider>;
}
