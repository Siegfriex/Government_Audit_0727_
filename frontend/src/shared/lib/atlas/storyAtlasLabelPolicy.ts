import type { AtlasNodeViewModel } from '@/shared/types/atlas';

export interface StoryAtlasLabelPolicyOptions {
  maximumLabels?: number;
  minimumScreenDistance?: number;
  reservedNodes?: readonly Pick<AtlasNodeViewModel, 'screen'>[];
  avoidNodeCollisions?: boolean;
}

const STORY_LABEL_WIDTH_PX = 190;
const STORY_LABEL_HEIGHT_PX = 42;
const LABEL_LEFT_THRESHOLD_PX = 496;

function hasClearLabelCorridor(candidate: AtlasNodeViewModel, nodes: readonly AtlasNodeViewModel[]): boolean {
  const labelOnLeft = candidate.screen.x > LABEL_LEFT_THRESHOLD_PX;
  const anchorX = candidate.screen.x + (labelOnLeft ? -(candidate.radiusPx + 14) : candidate.radiusPx + 14);
  const left = labelOnLeft ? anchorX - STORY_LABEL_WIDTH_PX : anchorX;
  const right = labelOnLeft ? anchorX : anchorX + STORY_LABEL_WIDTH_PX;
  const top = candidate.screen.y - candidate.radiusPx - 22;
  const bottom = top + STORY_LABEL_HEIGHT_PX;

  return nodes.every((node) => {
    if (node.id === candidate.id) return true;
    const padding = node.radiusPx + 8;
    return node.screen.x < left - padding
      || node.screen.x > right + padding
      || node.screen.y < top - padding
      || node.screen.y > bottom + padding;
  });
}

/**
 * Selects a small, deterministic set of editorial labels without moving nodes.
 * Priority follows evidence availability, mass, answer count, then stable ID.
 * Screen-distance suppression keeps dense UMAP neighborhoods legible.
 */
export function selectStoryPersistentLabelNodeIds(
  nodes: readonly AtlasNodeViewModel[],
  {
    maximumLabels = 3,
    minimumScreenDistance = 148,
    reservedNodes = [],
    avoidNodeCollisions = true,
  }: StoryAtlasLabelPolicyOptions = {},
): ReadonlySet<string> {
  if (maximumLabels <= 0 || nodes.length === 0) return new Set();

  const ranked = [...nodes].sort((left, right) =>
    Number(right.isPublicEvidenceAvailable) - Number(left.isPublicEvidenceAvailable)
    || right.normalizedMass - left.normalizedMass
    || right.answerCount - left.answerCount
    || left.id.localeCompare(right.id)
  );
  const selected: AtlasNodeViewModel[] = [];
  const occupiedScreens = reservedNodes.map((node) => node.screen);

  for (const node of ranked) {
    if (avoidNodeCollisions && !hasClearLabelCorridor(node, nodes)) continue;
    const separated = occupiedScreens.every((screen) =>
      Math.hypot(node.screen.x - screen.x, node.screen.y - screen.y) >= minimumScreenDistance
    );
    if (!separated) continue;
    selected.push(node);
    occupiedScreens.push(node.screen);
    if (selected.length === maximumLabels) break;
  }

  return new Set(selected.map((node) => node.id));
}
