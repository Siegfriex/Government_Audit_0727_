import { getNodeHitRadius } from '@/shared/config/atlas/atlasEncoding';
import type { AtlasNodeViewModel, Point2D } from '@/shared/types/atlas';

export interface AtlasNodeHitOverlap {
  firstNodeId: string;
  secondNodeId: string;
  centerDistance: number;
  combinedHitRadius: number;
}

function compareCanonicalNodeIds(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

export function resolvePointerNode(
  pointer: Point2D,
  nodes: readonly AtlasNodeViewModel[],
): AtlasNodeViewModel | null {
  const candidates = nodes
    .map((node) => ({
      node,
      distance: Math.hypot(node.screen.x - pointer.x, node.screen.y - pointer.y),
      hitRadius: getNodeHitRadius(node.radiusPx),
    }))
    .filter(({ distance, hitRadius }) => distance <= hitRadius)
    .sort((left, right) => left.distance - right.distance || compareCanonicalNodeIds(left.node.id, right.node.id));

  return candidates[0]?.node ?? null;
}

export function findNodeHitOverlaps(nodes: readonly AtlasNodeViewModel[]): AtlasNodeHitOverlap[] {
  const overlaps: AtlasNodeHitOverlap[] = [];
  for (let first = 0; first < nodes.length; first += 1) {
    for (let second = first + 1; second < nodes.length; second += 1) {
      const left = nodes[first];
      const right = nodes[second];
      const centerDistance = Math.hypot(left.screen.x - right.screen.x, left.screen.y - right.screen.y);
      const combinedHitRadius = getNodeHitRadius(left.radiusPx) + getNodeHitRadius(right.radiusPx);
      if (centerDistance < combinedHitRadius) {
        overlaps.push({
          firstNodeId: left.id,
          secondNodeId: right.id,
          centerDistance,
          combinedHitRadius,
        });
      }
    }
  }
  return overlaps;
}
