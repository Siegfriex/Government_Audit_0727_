import { describe, expect, it } from 'vitest';

import type { AtlasNodeViewModel } from '@/shared/types/atlas';
import { findDirectionalNode, findNextAtlasNodeId } from './atlasNodeNavigation';

function node(id: string, x: number, y: number): AtlasNodeViewModel {
  return {
    id,
    projectionId: 'projection-1',
    topicBinId: `topic-${id}`,
    topicLabel: null,
    status: 'active',
    answerType: 'A1',
    behaviorFamily: 'information_non_direct',
    anchor: { x, y },
    display: { x, y },
    screen: { x, y },
    radiusPx: 12,
    normalizedMass: 0.5,
    answerCount: 2,
    linkCount: 1,
    confidence: null,
    meanSimilarity: null,
    representativeEvidenceId: null,
    isPublicEvidenceAvailable: false,
    encoding: {
      shapeToken: 'circle',
      fillToken: 'var(--ink-primary)',
      strokeToken: 'var(--line-strong)',
      opacity: 1,
    },
  };
}

const nodes = [
  node('center', 100, 100),
  node('left', 40, 100),
  node('right-near', 130, 105),
  node('right-far', 180, 100),
  node('up', 100, 20),
  node('down', 100, 180),
];

describe('findNextAtlasNodeId', () => {
  it('prioritizes angular deviation, then directional distance, without changing coordinates', () => {
    const before = JSON.stringify(nodes.map(({ id, screen }) => ({ id, screen })));
    expect(findNextAtlasNodeId(nodes, 'center', 'ArrowLeft')).toBe('left');
    expect(findNextAtlasNodeId(nodes, 'center', 'ArrowRight')).toBe('right-far');
    expect(findNextAtlasNodeId(nodes, 'center', 'ArrowUp')).toBe('up');
    expect(findNextAtlasNodeId(nodes, 'center', 'ArrowDown')).toBe('down');
    expect(JSON.stringify(nodes.map(({ id, screen }) => ({ id, screen })))).toBe(before);
  });

  it('uses canonical node ID for an exact directional tie', () => {
    const center = node('center', 0, 0);
    const beta = node('beta', 10, 5);
    const alpha = node('alpha', 10, -5);
    expect(findDirectionalNode({ current: center, candidates: [center, beta, alpha], direction: 'right' })?.id).toBe('alpha');
  });

  it('supports canonical Home and End and stays put without a directional candidate', () => {
    expect(findNextAtlasNodeId(nodes, 'center', 'Home')).toBe('center');
    expect(findNextAtlasNodeId(nodes, 'center', 'End')).toBe('up');
    expect(findNextAtlasNodeId(nodes, 'left', 'ArrowLeft')).toBe('left');
  });

  it('recomputes from the filtered candidates without moving node coordinates', () => {
    const filtered = [nodes[0], nodes[2]];
    const before = JSON.stringify(filtered.map(({ id, screen }) => ({ id, screen })));
    expect(findNextAtlasNodeId(filtered, 'center', 'ArrowRight')).toBe('right-near');
    expect(JSON.stringify(filtered.map(({ id, screen }) => ({ id, screen })))).toBe(before);
  });

  it('preserves directional results after a proportional viewport resize', () => {
    const resized = nodes.map((current) => ({
      ...current,
      screen: { x: current.screen.x * 0.5, y: current.screen.y * 0.5 },
    }));
    expect(findNextAtlasNodeId(resized, 'center', 'ArrowLeft')).toBe('left');
    expect(findNextAtlasNodeId(resized, 'center', 'ArrowRight')).toBe('right-far');
    expect(findNextAtlasNodeId(resized, 'center', 'ArrowUp')).toBe('up');
    expect(findNextAtlasNodeId(resized, 'center', 'ArrowDown')).toBe('down');
  });

  it('uses angular deviation for diagonal candidates before directional distance', () => {
    const center = node('center', 0, 0);
    const diagonalNear = node('diagonal-near', 10, -10);
    const straightFar = node('straight-far', 0, -100);
    expect(findDirectionalNode({
      current: center,
      candidates: [center, diagonalNear, straightFar],
      direction: 'up',
    })?.id).toBe('straight-far');
  });
});
