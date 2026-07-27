import { lazy, Suspense } from 'react';
import { useLocation, Routes, Route } from 'react-router';
import type { BackgroundLocationState } from '@/shared/types/routing';
import { AppShell } from './AppShell';
import { DetailPage } from './DetailPage';
import { EvidenceRouteOverlay } from './EvidenceRouteOverlay';
import { FoundationsPage } from './FoundationsPage';
import { NotFoundPage } from './NotFoundPage';
import { RouteErrorBoundary } from './RouteErrorBoundary';

const LazyAtlasPage = lazy(async () => {
  const module = await import('@/pages/atlas/AtlasPage');
  return { default: module.AtlasPage };
});

const LazyStoryPage = lazy(async () => {
  const module = await import('@/pages/story/StoryPage');
  return { default: module.StoryPage };
});

const LazyAboutPage = lazy(async () => {
  const module = await import('@/pages/about/AboutPage');
  return { default: module.AboutPage };
});

const LazyDataPage = lazy(async () => {
  const module = await import('@/pages/data/DataPage');
  return { default: module.DataPage };
});

const LazyMethodPage = lazy(async () => {
  const module = await import('@/pages/method/MethodPage');
  return { default: module.MethodPage };
});

const LazyProjectionMethodLabPage = lazy(async () => {
  const module = await import('@/pages/method/ProjectionMethodLabPage');
  return { default: module.ProjectionMethodLabPage };
});

const atlasRouteLoading = (
  <main id="main-content" className="page-frame py-20" aria-busy="true" data-testid="atlas-lazy-loading" tabIndex={-1}>
    <p className="font-mono text-xs text-[var(--color-neutral-700)]">ATLAS ROUTE LOADING</p>
    <h1 className="mt-3 font-serif text-3xl font-bold">답변행태 지도를 불러오고 있습니다</h1>
  </main>
);

const secondaryRouteLoading = (
  <main id="main-content" className="page-frame py-20" aria-busy="true" data-testid="secondary-route-loading" tabIndex={-1}>
    <p className="font-mono text-xs text-[var(--color-neutral-700)]">PAGE LOADING</p>
    <h1 className="mt-3 font-serif text-3xl font-bold">페이지를 불러오고 있습니다</h1>
  </main>
);

export function AppRouter() {
  const location = useLocation();
  const state = location.state as BackgroundLocationState | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <RouteErrorBoundary>
      <Routes location={backgroundLocation ?? location}>
        <Route element={<AppShell />}>
          <Route index element={<Suspense fallback={secondaryRouteLoading}><LazyStoryPage /></Suspense>} />
          <Route path="method" element={<Suspense fallback={secondaryRouteLoading}><LazyMethodPage /></Suspense>} />
          <Route path="method/projection" element={<Suspense fallback={atlasRouteLoading}><LazyProjectionMethodLabPage /></Suspense>} />
          <Route path="data" element={<Suspense fallback={secondaryRouteLoading}><LazyDataPage /></Suspense>} />
          <Route path="about" element={<Suspense fallback={secondaryRouteLoading}><LazyAboutPage /></Suspense>} />
          <Route
            path="atlas"
            element={(
              <Suspense fallback={atlasRouteLoading}>
                <LazyAtlasPage />
              </Suspense>
            )}
          />
          <Route path="evidence/:evidenceId" element={<DetailPage kind="evidence" />} />
          <Route path="case/:caseId" element={<DetailPage kind="case" />} />
          <Route path="dev/foundations" element={import.meta.env.DEV ? <FoundationsPage /> : <NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route path="/evidence/:evidenceId" element={<EvidenceRouteOverlay kind="evidence" />} />
          <Route path="/case/:caseId" element={<EvidenceRouteOverlay kind="case" />} />
        </Routes>
      )}
    </RouteErrorBoundary>
  );
}
