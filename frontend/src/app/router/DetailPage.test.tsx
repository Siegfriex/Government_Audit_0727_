import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { DetailPage } from './DetailPage';

vi.mock('@/shared/api/atlas/useEvidenceDetail', () => ({
  useEvidenceDetail: () => ({
    status: 'ready',
    summary: { id: 'EVID_APPROVED_001' },
    detail: {
      id: 'EVID_APPROVED_001', title: '승인 증거 제목', requestText: '시정요구', questionText: '질문',
      answerText: '답변', excerpt: '공개 발췌', reportedStatus: 'complete', verificationStatus: 'VERIFIED',
      meetingId: '050606', pageStartNo: '050606_0001', pageEndNo: '050606_0002', pdfAssetId: '050606',
      sourcePdfSha256: 'a'.repeat(64), pipelineRunId: 'run-1', publicVisibility: true,
    },
  }),
}));

describe('approved Evidence direct route', () => {
  it('renders repository detail without development fixture labels', () => {
    render(
      <MemoryRouter initialEntries={['/evidence/EVID_APPROVED_001']}>
        <Routes><Route path="/evidence/:evidenceId" element={<DetailPage kind="evidence" />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('approved-evidence-detail')).toHaveAttribute('data-evidence-id', 'EVID_APPROVED_001');
    expect(screen.getByRole('heading', { name: '승인 증거 제목' })).toBeInTheDocument();
    expect(screen.queryByText(/MOCK PREVIEW/)).not.toBeInTheDocument();
  });
});
