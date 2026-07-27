import type { AtlasNodeViewModel, TopicBinViewModel } from '@/shared/types/atlas';

export interface AtlasClusterPresentation {
  bin: TopicBinViewModel;
  matchingNodeCount: number;
  representativeNode: AtlasNodeViewModel;
  displayDistanceToCenter: number;
}

function displayDistance(node: AtlasNodeViewModel, bin: TopicBinViewModel): number {
  return Math.hypot(node.display.x - bin.center.x, node.display.y - bin.center.y);
}

export function buildAtlasClusterPresentation(
  nodes: readonly AtlasNodeViewModel[],
  bins: readonly TopicBinViewModel[],
): AtlasClusterPresentation[] {
  const nodesByBin = new Map<string, AtlasNodeViewModel[]>();
  for (const node of nodes) {
    const current = nodesByBin.get(node.topicBinId) ?? [];
    current.push(node);
    nodesByBin.set(node.topicBinId, current);
  }

  return bins.flatMap((bin) => {
    const matchingNodes = nodesByBin.get(bin.id) ?? [];
    if (matchingNodes.length === 0) return [];
    const publicCandidates = matchingNodes.filter((node) => node.isPublicEvidenceAvailable);
    const candidates = publicCandidates.length > 0 ? publicCandidates : matchingNodes;
    const representativeNode = [...candidates].sort((left, right) => {
      const distanceDelta = displayDistance(left, bin) - displayDistance(right, bin);
      return distanceDelta || left.id.localeCompare(right.id);
    })[0];
    return [{
      bin,
      matchingNodeCount: matchingNodes.length,
      representativeNode,
      displayDistanceToCenter: displayDistance(representativeNode, bin),
    }];
  }).sort((left, right) =>
    right.matchingNodeCount - left.matchingNodeCount
    || right.bin.memberCount - left.bin.memberCount
    || left.bin.id.localeCompare(right.bin.id)
  );
}
