import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from './AppRouter';

vi.mock('@/shared/api/atlas/useAtlasRelease', () => ({
  useAtlasRelease: () => ({
    status: 'unavailable',
    reason: 'NO_APPROVED_RELEASE_CONFIGURED',
    retry: vi.fn(),
  }),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </MemoryRouter>
  );
}

describe('AppRouter', () => {
  beforeEach(() => vi.stubEnv('VITE_ATLAS_FIXTURE_PROVENANCE', 'CONTRACT_FIXTURE'));
  afterEach(() => vi.unstubAllEnvs());

  it('renders the story route and semantic global links', async () => {
    renderAt('/');
    expect(await screen.findByRole(
      'heading',
      { name: '국정감사 단순히 쇼인가?' },
      { timeout: 5_000 },
    )).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '방법론 (Method)' })).toHaveAttribute('href', '/method');
  });

  it('renders the projection method lab as a fail-closed analysis route', async () => {
    renderAt('/method/projection');
    expect(await screen.findByRole('heading', { name: '투영 방식은 어떻게 다르게 보이는가' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Method Lab의 승인 Atlas release가 없습니다' })).toBeInTheDocument();
  });

  it('renders a direct evidence URL as a full detail page', () => {
    renderAt('/evidence/ev-101');
    const detailPage = screen.getByTestId('evidence-direct-page');
    expect(detailPage).toBeInTheDocument();
    expect(within(detailPage).getByText('EV-101')).toBeInTheDocument();
  });

  it('shows an explicit not-found state for an unknown detail id', () => {
    renderAt('/case/not-real');
    expect(screen.getByTestId('detail-not-found')).toBeInTheDocument();
  });

  it('renders the wildcard 404 page', () => {
    renderAt('/missing-route');
    expect(screen.getByRole('heading', { name: '요청한 기록을 찾을 수 없습니다' })).toBeInTheDocument();
  });
});
