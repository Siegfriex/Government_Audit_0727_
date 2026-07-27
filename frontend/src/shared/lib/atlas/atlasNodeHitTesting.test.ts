import { describe, expect, it } from 'vitest';

import type { AtlasNodeViewModel } from '@/shared/types/atlas';
import { findNodeHitOverlaps, resolvePointerNode } from './atlasNodeHitTesting';

function node(id: string, x: number, y: number, radiusPx = 8): AtlasNodeViewModel {
  return {
    id,
    projectionId: 'contract-projection',
    topicBinId: 'contract-topic',
    topicLabel: null,
    status: 'complete',
    answerType: 'A2',
    behaviorFamily: 'information_non_direct',
    anchor: { x, y },
    display: { x, y },
    screen: { x, y },
    radiusPx,
    normalizedMass: 0.3,
    answerCount: 1,
    linkCount: 0,
    confidence: null,
    meanSimilarity: null,
    representativeEvidenceId: null,
    isPublicEvidenceAvailable: false,
    encoding: { shapeToken: 'circle', fillToken: 'black', strokeToken: 'black', opacity: 0.72 },
  };
}

describe('Atlas node hit testing', () => {
  it('resolves overlapping 44px targets by center distance and canonical ID tie', () => {
    const nodes = [node('beta', 100, 100), node('alpha', 100, 100), node('near', 105, 100)];
    expect(resolvePointerNode({ x: 100, y: 100 }, nodes)?.id).toBe('alpha');
    expect(resolvePointerNode({ x: 106, y: 100 }, nodes)?.id).toBe('near');
    expect(resolvePointerNode({ x: 200, y: 200 }, nodes)).toBeNull();
  });

  it('reports geometry overlap for audit without moving coordinates', () => {
    const nodes = [node('one', 0, 0), node('two', 40, 0), node('far', 100, 0)];
    expect(findNodeHitOverlaps(nodes)).toEqual([
      expect.objectContaining({ firstNodeId: 'one', secondNodeId: 'two', combinedHitRadius: 44 }),
    ]);
  });
});
