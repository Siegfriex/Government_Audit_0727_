import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { AppProviders } from '@/app/providers/AppProviders';
import type { AtlasNodeViewModel, AtlasViewModelBundle } from '@/shared/types/atlas';
import { ChapterAnswersAtlas } from './ChapterAnswersAtlas';

const mocks = vi.hoisted(() => ({ releaseState: null as unknown }));

const nodes: AtlasNodeViewModel[] = Array.from({ length: 140 }, (_, index) => ({
  id: `story-node-${String(index + 1).padStart(2, '0')}`,
  projectionId: 'projection-story-001',
  topicBinId: `topic-${index + 1}`,
  topicLabel: `주제 ${index + 1}`,
  status: (['complete', 'active', 'unresolved'] as const)[index % 3],
  answerType: (['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'] as const)[index % 8],
  behaviorFamily: (['information_non_direct', 'deferral_procedural', 'action_evidence'] as const)[index % 3],
  anchor: { x: index / 20, y: index / 20 },
  display: { x: index / 20, y: index / 20 },
  screen: { x: 100 + (index % 4) * 150, y: 100 + Math.floor(index / 4) * 120 },
  radiusPx: 10 + index / 10,
  normalizedMass: (index + 1) / 16,
  answerCount: index + 1,
  linkCount: 1,
  confidence: 0.8,
  meanSimilarity: 0.75,
  representativeEvidenceId: index === 0 ? 'EVID_APPROVED_001' : null,
  isPublicEvidenceAvailable: index === 0,
  encoding: {
    shapeToken: 'circle',
    fillToken: 'var(--ink-primary)',
    strokeToken: 'var(--line-strong)',
    opacity: 0.8,
  },
}));

const bundle: AtlasViewModelBundle = {
  releaseId: 'ATLAS_DG761_STORY_TEST',
  dataVersion: 'STORY_TEST_DATA',
  projectionId: 'projection-story-001',
  projectionHash: 'a'.repeat(64),
  bounds: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 },
  nodes,
  topicBins: [],
  centroids: [],
  evidence: [],
  storySummary: {
    analysisEntityCount: 140,
    atlasNodeCount: 140,
    behaviorChildCount: 140,
    primaryBehaviorDistribution: { A1: 18, A2: 18, A3: 18, A4: 18, A5: 17, A6: 17, A7: 17, A8: 17 },
    projectionPointCount: 140,
    publicEvidenceCount: 0,
    statusDistribution: { complete: 47, active: 47, unresolved: 46 },
    topicBinCount: 0,
    warnings: [],
  },
  storyPreviewNodeIds: nodes.slice(0, 16).map((node) => node.id),
  evidenceRepository: {
    getSummary: () => null,
    getDetail: async () => { throw new Error('not used'); },
  },
  relations: null,
};

vi.mock('@/shared/api/atlas/useAtlasRelease', () => ({
  useAtlasRelease: () => mocks.releaseState,
}));

describe('ChapterAnswersAtlas approved Story Preview', () => {
  it('renders all 140 approved nodes with 16 editorial anchors and carries filters to the Explorer', async () => {
    mocks.releaseState = { status: 'ready', source: 'pointer', bundle, retry: vi.fn() };
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter initialEntries={['/#answers']}>
        <AppProviders><ChapterAnswersAtlas /></AppProviders>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('story-atlas-ready')).toHaveAttribute('data-release-id', bundle.releaseId);
    expect(screen.getByTestId('story-atlas-type-primer').querySelectorAll('[data-answer-type]')).toHaveLength(8);
    expect(container.querySelectorAll('[data-testid="atlas-chart"] [data-node-id]')).toHaveLength(140);
    expect(container.querySelectorAll('[data-testid="atlas-chart"] [data-editorial-anchor="true"]')).toHaveLength(16);
    expect(container.querySelectorAll('[data-node-filter-state="matched"]')).toHaveLength(16);
    expect(container.querySelectorAll('[data-node-filter-state="context"]')).toHaveLength(124);
    expect(container.querySelectorAll('.atlas-node-navigator')).toHaveLength(140);
    expect(screen.getByTestId('story-atlas-cluster-disclosure')).not.toHaveAttribute('open');
    expect(screen.getByTestId('story-atlas-node-directory')).not.toHaveAttribute('open');
    expect(screen.getByTestId('story-selected-dossier')).toHaveTextContent('기억 부재 진술');
    expect(screen.getByText(/FEATURED CONTEXT/)).toBeInTheDocument();
    expect(container.querySelectorAll('[data-selection-ring="true"]')).toHaveLength(0);
    expect(screen.queryByTestId('story-atlas-data-unavailable')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '현재 필터로 전체 답변행태 지도 보기' })).toHaveAttribute('href', '/atlas');

    await user.selectOptions(screen.getByLabelText('처리 상태'), 'active');
    const storyNodeIds = new Set(bundle.storyPreviewNodeIds);
    const activeAnchorCount = bundle.nodes.filter((node) => node.status === 'active' && storyNodeIds.has(node.id)).length;
    const activeNodeCount = bundle.nodes.filter((node) => node.status === 'active').length;
    expect(container.querySelectorAll('[data-testid="atlas-chart"] [data-node-id]')).toHaveLength(140);
    expect(container.querySelectorAll('[data-node-filter-state="matched"]')).toHaveLength(activeAnchorCount);
    expect(container.querySelectorAll('[data-node-filter-state="context"]')).toHaveLength(140 - activeAnchorCount);
    expect(container.querySelectorAll('.atlas-node-navigator')).toHaveLength(activeNodeCount);
    expect(screen.getByRole('link', { name: '현재 필터로 전체 답변행태 지도 보기' })).toHaveAttribute('href', '/atlas?status=active');
  });
});
