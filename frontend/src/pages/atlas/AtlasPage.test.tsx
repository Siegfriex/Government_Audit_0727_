import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { AtlasPage } from './AtlasPage';

vi.mock('@/shared/api/atlas/useAtlasRelease', () => ({
  useAtlasRelease: () => ({
    status: 'unavailable',
    reason: 'NO_APPROVED_RELEASE_CONFIGURED',
    retry: vi.fn(),
  }),
}));

describe('AtlasPage fail-closed production contract', () => {
  it('shows DataUnavailable only for an explicit unavailable release result', async () => {
    render(
      <MemoryRouter initialEntries={['/atlas?status=active&types=A1,A2&view=nodes']}>
        <AtlasPage />
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('atlas-data-unavailable')).toBeInTheDocument();
    expect(screen.getByText(/개발용 또는 legacy 좌표를 대신 표시하지 않습니다/)).toBeInTheDocument();
    expect(screen.queryByText(/CONTRACT_FIXTURE/)).not.toBeInTheDocument();
  });
});
