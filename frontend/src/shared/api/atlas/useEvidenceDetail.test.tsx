import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { EvidenceDetailViewModel, EvidenceRepository, EvidenceSummaryViewModel } from '@/shared/types/atlas';
import { useEvidenceDetail } from './useEvidenceDetail';

const mocks = vi.hoisted(() => ({
  getDetail: vi.fn<(evidenceId: string, signal?: AbortSignal) => Promise<EvidenceDetailViewModel>>(),
  releaseState: null as unknown,
}));

const summary: EvidenceSummaryViewModel = {
  id: 'EVID_APPROVED', title: '승인 증거', reportedStatus: 'complete', verificationStatus: 'VERIFIED',
  meetingId: 'meeting-1', pageStartNo: '1', pageEndNo: '2', pdfAssetId: 'pdf-1', publicVisibility: true,
};
const detail: EvidenceDetailViewModel = {
  id: summary.id, title: summary.title, requestText: '요구', questionText: '질문', answerText: '답변', excerpt: '발췌',
  reportedStatus: 'complete', verificationStatus: 'VERIFIED', meetingId: 'meeting-1', pageStartNo: '1', pageEndNo: '2',
  pdfAssetId: 'pdf-1', sourcePdfSha256: 'a'.repeat(64), pipelineRunId: 'run-1', publicVisibility: true,
};
const repository: EvidenceRepository = {
  getSummary: (evidenceId) => evidenceId === summary.id ? summary : null,
  getDetail: mocks.getDetail,
};
const bundle = {
  releaseId: 'release-1', projectionId: 'projection-1', projectionHash: 'a'.repeat(64),
  bounds: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }, nodes: [], topicBins: [], centroids: [],
  evidence: [summary], storyPreviewNodeIds: ['node-1'], evidenceRepository: repository,
};

vi.mock('./useAtlasRelease', () => ({
  useAtlasRelease: () => mocks.releaseState,
}));

function Harness() {
  const state = useEvidenceDetail(summary.id);
  return <p data-testid="state">{state.status === 'ready' ? state.detail.id : state.status}</p>;
}

describe('useEvidenceDetail', () => {
  it('settles without refetching when its own state update rerenders', async () => {
    mocks.releaseState = { status: 'ready' as const, bundle, source: 'pointer' as const, retry: vi.fn() };
    mocks.getDetail.mockResolvedValue(detail);
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent(summary.id));
    expect(mocks.getDetail).toHaveBeenCalledTimes(1);
  });
});
