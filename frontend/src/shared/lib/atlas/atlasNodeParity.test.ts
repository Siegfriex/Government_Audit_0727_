import { describe, expect, it } from 'vitest';

import type { AtlasNodeViewModel } from '@/shared/types/atlas';
import { selectStoryAtlasNodes, storyExplorerNodeParity } from './atlasNodeParity';

function node(id: string, screenX: number): AtlasNodeViewModel {
  return {
    id,
    projectionId: 'contract-projection',
    topicBinId: 'topic-1',
    topicLabel: null,
    status: 'active',
    answerType: 'A5',
    behaviorFamily: 'deferral_procedural',
    anchor: { x: 0.1, y: 0.2 },
    display: { x: 0.12, y: 0.22 },
    screen: { x: screenX, y: 50 },
    radiusPx: 17,
    normalizedMass: 0.4,
    answerCount: 3,
    linkCount: 1,
    confidence: 0.7,
    meanSimilarity: 0.82,
    representativeEvidenceId: null,
    isPublicEvidenceAvailable: false,
    encoding: { shapeToken: 'diamond', fillToken: 'ochre', strokeToken: 'amber', opacity: 0.7 },
  };
}

const selectionContract = {
  explorerReleaseId: 'release-1',
  storyReleaseId: 'release-1',
  explorerProjectionId: 'contract-projection',
  storyProjectionId: 'contract-projection',
};

describe('Story and Explorer node parity', () => {
  it('selects only an approved deterministic ID list and preserves node identity', () => {
    const explorerNodes = [node('n1', 40), node('n2', 80)];
    const storyNodes = selectStoryAtlasNodes(explorerNodes, ['n2', 'n1'], selectionContract);
    expect(storyNodes.map(({ id }) => id)).toEqual(['n2', 'n1']);
    expect(storyNodes[0]).toBe(explorerNodes[1]);
    expect(() => selectStoryAtlasNodes(explorerNodes, [], selectionContract)).toThrow(/Approved Story preview node IDs/);
    expect(() => selectStoryAtlasNodes(explorerNodes, ['missing'], selectionContract)).toThrow(/missing/);
    expect(() => selectStoryAtlasNodes(explorerNodes, ['n1', 'n1'], selectionContract)).toThrow(/unique/);
  });

  it('fails closed on release or projection mismatch', () => {
    const explorerNodes = [node('n1', 40)];
    expect(() => selectStoryAtlasNodes(explorerNodes, ['n1'], { ...selectionContract, storyReleaseId: 'release-2' })).toThrow(/release IDs/);
    expect(() => selectStoryAtlasNodes(explorerNodes, ['n1'], { ...selectionContract, storyProjectionId: 'projection-2' })).toThrow(/projection IDs/);
    expect(() => selectStoryAtlasNodes([{ ...explorerNodes[0], projectionId: 'wrong' }], ['n1'], selectionContract)).toThrow(/node projection mismatch/);
  });

  it('requires semantic equality while allowing viewport screen coordinates to differ', () => {
    const explorerNode = node('n1', 40);
    const storyNode = { ...explorerNode, screen: { x: 140, y: 150 } };
    expect(storyExplorerNodeParity(storyNode, explorerNode)).toBe(true);
    expect(storyExplorerNodeParity({ ...storyNode, radiusPx: 18 }, explorerNode)).toBe(false);
  });
});
