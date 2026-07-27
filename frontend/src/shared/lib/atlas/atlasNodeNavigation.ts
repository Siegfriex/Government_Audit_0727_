import type { AtlasNodeViewModel } from '@/shared/types/atlas';

export type AtlasNavigationKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Home' | 'End';
export type AtlasDirection = 'left' | 'right' | 'up' | 'down';

interface FindDirectionalNodeInput {
  current: AtlasNodeViewModel;
  candidates: readonly AtlasNodeViewModel[];
  direction: AtlasDirection;
}

const DIRECTION_VECTOR: Record<AtlasDirection, readonly [number, number]> = {
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1],
};

function compareCanonicalNodeIds(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

export function findDirectionalNode({
  current,
  candidates,
  direction,
}: FindDirectionalNodeInput): AtlasNodeViewModel | null {
  const [directionX, directionY] = DIRECTION_VECTOR[direction];
  const ranked = candidates
    .filter((node) => node.id !== current.id)
    .map((node) => {
      const deltaX = node.screen.x - current.screen.x;
      const deltaY = node.screen.y - current.screen.y;
      const distance = Math.hypot(deltaX, deltaY);
      const directionalDistance = deltaX * directionX + deltaY * directionY;
      const angularDeviation = distance === 0
        ? Number.POSITIVE_INFINITY
        : Math.acos(Math.min(1, Math.max(-1, directionalDistance / distance)));
      return { node, angularDeviation, directionalDistance };
    })
    .filter(({ directionalDistance }) => directionalDistance > 0)
    .sort((left, right) =>
      left.angularDeviation - right.angularDeviation
      || left.directionalDistance - right.directionalDistance
      || compareCanonicalNodeIds(left.node.id, right.node.id));

  return ranked[0]?.node ?? null;
}

export function findNextAtlasNodeId(
  nodes: readonly AtlasNodeViewModel[],
  currentNodeId: string,
  key: AtlasNavigationKey,
): string {
  if (nodes.length === 0) return currentNodeId;
  if (key === 'Home' || key === 'End') {
    const canonicalNodeIds = nodes.map(({ id }) => id).sort(compareCanonicalNodeIds);
    return key === 'Home' ? canonicalNodeIds[0] : canonicalNodeIds[canonicalNodeIds.length - 1];
  }

  const current = nodes.find((node) => node.id === currentNodeId);
  if (!current) return nodes[0].id;
  const direction = ({
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
  } as const)[key];
  return findDirectionalNode({ current, candidates: nodes, direction })?.id ?? current.id;
}
