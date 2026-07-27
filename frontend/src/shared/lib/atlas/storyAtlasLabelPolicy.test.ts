import { describe, expect, it } from 'vitest';

import type { AtlasNodeViewModel } from '@/shared/types/atlas';
import { selectStoryPersistentLabelNodeIds } from './storyAtlasLabelPolicy';

function node(
  id: string,
  x: number,
  y: number,
  normalizedMass: number,
  isPublicEvidenceAvailable = false,
): AtlasNodeViewModel {
  return {
    id,
    projectionId: 'projection-1',
    topicBinId: `bin-${id}`,
    topicLabel: `topic ${id}`,
    status: 'active',
    answerType: 'A2',
    behaviorFamily: 'information_non_direct',
    anchor: { x, y },
    display: { x, y },
    screen: { x, y },
    radiusPx: 12,
    normalizedMass,
    answerCount: Math.round(normalizedMass * 100),
    linkCount: 1,
    confidence: 0.8,
    meanSimilarity: 0.7,
    representativeEvidenceId: isPublicEvidenceAvailable ? `evidence-${id}` : null,
    isPublicEvidenceAvailable,
    encoding: { shapeToken: 'circle', fillToken: '#c43f4f', strokeToken: 'black', opacity: 0.8 },
  };
}

describe('selectStoryPersistentLabelNodeIds', () => {
  it('keeps labels spatially separated and prefers public evidence without moving nodes', () => {
    const nodes = [
      node('dense-heavy', 100, 100, 0.9),
      node('dense-public', 115, 112, 0.6, true),
      node('right', 350, 100, 0.5),
      node('lower', 100, 350, 0.4),
    ];
    const before = JSON.stringify(nodes);
    const selected = selectStoryPersistentLabelNodeIds(nodes, { maximumLabels: 3, minimumScreenDistance: 140, avoidNodeCollisions: false });

    expect([...selected]).toEqual(['dense-public', 'right', 'lower']);
    expect(JSON.stringify(nodes)).toBe(before);
  });

  it('returns no labels when the label ceiling is zero', () => {
    expect(selectStoryPersistentLabelNodeIds([node('one', 0, 0, 1)], { maximumLabels: 0 })).toEqual(new Set());
  });

  it('keeps persistent labels away from an explicitly selected node', () => {
    const selected = node('selected', 100, 100, 1, true);
    const labels = selectStoryPersistentLabelNodeIds(
      [node('near', 120, 100, 0.9), node('far', 350, 100, 0.5)],
      { maximumLabels: 2, minimumScreenDistance: 140, reservedNodes: [selected], avoidNodeCollisions: false },
    );
    expect([...labels]).toEqual(['far']);
  });

  it('skips a label whose text corridor crosses another node', () => {
    const labels = selectStoryPersistentLabelNodeIds(
      [node('blocked', 100, 100, 0.9), node('blocker', 210, 100, 0.5)],
      { maximumLabels: 1, minimumScreenDistance: 0 },
    );
    expect([...labels]).toEqual(['blocker']);
  });
});
