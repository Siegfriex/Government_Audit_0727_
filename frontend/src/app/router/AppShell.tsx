import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import type { BackgroundLocationState } from '@/shared/types/routing';
import { AppScrollRestoration } from './AppScrollRestoration';
import { FooterRail } from '@/widgets/app-shell/FooterRail';
import { HeaderNav } from '@/widgets/app-shell/HeaderNav';
import { RouteAccessibility } from './RouteAccessibility';
import { SkipLinks } from './SkipLinks';

export function AppShell() {
  const [activeChapterId, setActiveChapterId] = useState('prologue');
  const location = useLocation();
  const state = location.state as BackgroundLocationState | null;
  const shellPathname = state?.backgroundLocation?.pathname ?? location.pathname;
  const isStoryRoute = shellPathname === '/';

  return (
    <div className={`min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-behavior-red-bg)] selection:text-[var(--color-behavior-red-deep)] ${isStoryRoute ? 'pb-14' : ''}`}>
      <RouteAccessibility />
      <SkipLinks />
      <HeaderNav />
      <AppScrollRestoration />
      <Outlet context={{ activeChapterId, setActiveChapterId }} />
      {isStoryRoute ? <FooterRail currentChapterId={activeChapterId} /> : null}
    </div>
  );
}
