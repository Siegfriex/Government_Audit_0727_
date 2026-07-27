import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ANSWER_TYPES, type AtlasQueryState, type AtlasViewModelBundle } from '@/shared/types/atlas';
import { AtlasExplorer } from './AtlasExplorer';

function bundleFixture(nodes = 1): AtlasViewModelBundle {
  return {
    releaseId: 'contract-release-001',
    dataVersion: 'contract-data-001',
    projectionId: 'contract-projection-001',
    projectionHash: 'a'.repeat(64),
    bounds: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 },
    nodes: nodes === 0 ? [] : [{
      id: 'contract-node-001',
      projectionId: 'contract-projection-001',
      topicBinId: 'contract-topic-001',
      topicLabel: '계약 검증 주제',
      status: 'active',
      answerType: 'A1',
      behaviorFamily: 'information_non_direct',
      anchor: { x: 0.2, y: 0.3 },
      display: { x: 0.21, y: 0.31 },
      screen: { x: 200, y: 180 },
      radiusPx: 18,
      normalizedMass: 0.5,
      answerCount: 2,
      linkCount: 1,
      confidence: 0.8,
      meanSimilarity: 0.75,
      representativeEvidenceId: null,
      isPublicEvidenceAvailable: false,
      encoding: {
        shapeToken: 'circle',
        fillToken: 'var(--color-behavior-red-deep)',
        strokeToken: 'var(--status-active)',
        opacity: 0.8,
      },
    }],
    topicBins: [],
    centroids: [],
    evidence: [],
    storySummary: {
      analysisEntityCount: nodes,
      atlasNodeCount: nodes,
      behaviorChildCount: nodes,
      primaryBehaviorDistribution: { A1: nodes, A2: 0, A3: 0, A4: 0, A5: 0, A6: 0, A7: 0, A8: 0 },
      projectionPointCount: nodes,
      publicEvidenceCount: 0,
      statusDistribution: { complete: 0, active: nodes, unresolved: 0 },
      topicBinCount: 0,
      warnings: [],
    },
    storyPreviewNodeIds: ['contract-node-001'],
    evidenceRepository: {
      getSummary: () => null,
      getDetail: async () => { throw new Error('not available in component fixture'); },
    },
    relations: null,
  };
}

function queryFixture(nodeId: string | null = null): AtlasQueryState {
  return { status: 'all', types: [...ANSWER_TYPES], nodeId, view: 'map', relationType: null, depth: 1 };
}

function renderExplorer(
  bundle = bundleFixture(),
  query = queryFixture(),
  onQueryChange = vi.fn(),
) {
  return {
    onQueryChange,
    ...render(
      <MemoryRouter>
        <AtlasExplorer bundle={bundle} query={query} queryIssues={[]} onQueryChange={onQueryChange} />
      </MemoryRouter>,
    ),
  };
}

describe('AtlasExplorer accessibility contract shell', () => {
  it('exposes an accessible SVG name, chart summary, DOM mirror, and live region', () => {
    renderExplorer();
    expect(screen.getByRole('img', { name: /^답변행태 지도/ })).toBeInTheDocument();
    expect(document.querySelector('#atlas-chart-summary')).toHaveTextContent('1개 aggregate node');
    expect(screen.getByRole('heading', { name: '접근 가능한 node 목록' })).toBeInTheDocument();
    expect(screen.getByTestId('atlas-live-region')).toHaveTextContent('1개 node 표시');
    expect(screen.getAllByRole('button', { name: /^정보 부재·비직접 계열, 추진중, A1$/ })).toHaveLength(1);
  });

  it('preserves upstream radius and separates a 44px minimum hit target from the visual mark', () => {
    const bundle = bundleFixture();
    bundle.nodes[0] = { ...bundle.nodes[0], radiusPx: 7.25 };
    const { container } = renderExplorer(bundle);
    const nodeGroup = container.querySelector('[data-node-id="contract-node-001"]');
    expect(nodeGroup).toHaveAttribute('data-source-radius', '7.25');
    expect(nodeGroup).toHaveAttribute('data-rendered-radius', '7.25');
    expect(nodeGroup?.querySelector('[data-atlas-hit-target="true"]')).toHaveAttribute('r', '22');
  });

  it('uses the DOM mirror as the single keyboard owner for Enter selection and Escape clearing', async () => {
    const user = userEvent.setup();
    const first = renderExplorer();
    expect(first.container.querySelector('[data-node-id="contract-node-001"]')).not.toHaveAttribute('tabindex');
    const mirrorNode = within(first.container).getByRole('button', { name: /^정보 부재·비직접 계열, 추진중, A1$/ });
    mirrorNode.focus();
    await user.keyboard('{Enter}');
    expect(first.onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ nodeId: 'contract-node-001' }));

    first.unmount();
    const second = renderExplorer(bundleFixture(), queryFixture('contract-node-001'));
    within(second.container).getByRole('button', { name: /^정보 부재·비직접 계열, 추진중, A1$/ }).focus();
    await user.keyboard('{Escape}');
    expect(second.onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ nodeId: null }));
  });

  it('renders explicit empty, filtered-empty, and invalid-node states', () => {
    const empty = renderExplorer(bundleFixture(0));
    expect(screen.getByTestId('atlas-empty-state')).toBeInTheDocument();
    empty.unmount();

    const filtered = renderExplorer(bundleFixture(), { ...queryFixture(), status: 'complete' });
    expect(screen.getByTestId('atlas-filter-empty-state')).toBeInTheDocument();
    expect(filtered.container.querySelector('[data-node-id="contract-node-001"]')).toBeNull();
    expect(filtered.container.querySelector('[data-testid="atlas-chart"] svg')).toBeInTheDocument();
    expect(within(filtered.container).getByTestId('atlas-chart')).toHaveTextContent('1개는 제외 상태');
    filtered.unmount();

    renderExplorer(bundleFixture(), queryFixture('contract-node-missing'));
    expect(screen.getByTestId('atlas-invalid-node-state')).toBeInTheDocument();
  });

  it('renders independent focus halo and selection ring for a focused selected node', async () => {
    const { container } = renderExplorer(bundleFixture(), queryFixture('contract-node-001'));
    const mirrorNode = within(container).getByRole('button', { name: /^정보 부재·비직접 계열, 추진중, A1$/ });
    mirrorNode.focus();
    const glyph = container.querySelector('[data-node-id="contract-node-001"] .atlas-node-glyph');
    await waitFor(() => expect(glyph).toHaveAttribute('data-interaction-state', 'focused-selected'));
    expect(glyph?.querySelector('[data-focus-halo="true"]')).toBeInTheDocument();
    expect(glyph?.querySelector('[data-selection-ring="true"]')).toBeInTheDocument();
  });

  it('clears a selected node when the active filters exclude it without choosing a replacement', async () => {
    const onQueryChange = vi.fn();
    renderExplorer(
      bundleFixture(),
      { ...queryFixture('contract-node-001'), status: 'complete' },
      onQueryChange,
    );
    await waitFor(() => expect(onQueryChange).toHaveBeenCalledWith({
      ...queryFixture(null),
      status: 'complete',
    }));
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });
});
