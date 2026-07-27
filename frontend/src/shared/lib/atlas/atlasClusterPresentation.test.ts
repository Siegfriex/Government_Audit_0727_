import { describe, expect, it } from 'vitest';

import type { AtlasNodeViewModel, TopicBinViewModel } from '@/shared/types/atlas';
import { buildAtlasClusterPresentation } from './atlasClusterPresentation';

function node(id: string, topicBinId: string, x: number, hasEvidence = false): AtlasNodeViewModel {
  return {
    id,
    projectionId: 'projection-1',
    topicBinId,
    topicLabel: `topic ${topicBinId}`,
    status: 'active',
    answerType: 'A2',
    behaviorFamily: 'information_non_direct',
    anchor: { x, y: 0 },
    display: { x, y: 0 },
    screen: { x, y: 0 },
    radiusPx: 12,
    normalizedMass: 0.2,
    answerCount: 1,
    linkCount: 1,
    confidence: 0.8,
    meanSimilarity: 0.7,
    representativeEvidenceId: hasEvidence ? `evidence-${id}` : null,
    isPublicEvidenceAvailable: hasEvidence,
    encoding: { shapeToken: 'circle', fillToken: '#c43f4f', strokeToken: 'black', opacity: 0.8 },
  };
}

const bins: TopicBinViewModel[] = [
  { id: 'bin-a', label: '질문 A', center: { x: 0, y: 0 }, screen: { x: 0, y: 0 }, memberCount: 10, representativeTargetIssueId: 'target-a' },
  { id: 'bin-b', label: '질문 B', center: { x: 10, y: 0 }, screen: { x: 10, y: 0 }, memberCount: 5, representativeTargetIssueId: null },
];

describe('buildAtlasClusterPresentation', () => {
  it('groups approved topic bins and chooses the nearest public Evidence node without changing coordinates', () => {
    const nodes = [node('near-no-evidence', 'bin-a', 0.1), node('public', 'bin-a', 0.4, true), node('bin-b', 'bin-b', 10.2)];
    const before = JSON.stringify(nodes);
    const result = buildAtlasClusterPresentation(nodes, bins);
    expect(result.map((cluster) => cluster.bin.id)).toEqual(['bin-a', 'bin-b']);
    expect(result[0].matchingNodeCount).toBe(2);
    expect(result[0].representativeNode.id).toBe('public');
    expect(result[0].displayDistanceToCenter).toBeCloseTo(0.4);
    expect(JSON.stringify(nodes)).toBe(before);
  });
});
