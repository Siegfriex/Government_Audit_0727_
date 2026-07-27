import type { AtlasNodeViewModel } from '@/shared/types/atlas';

export class StoryNodeSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoryNodeSelectionError';
  }
}

export interface StoryNodeSelectionContract {
  explorerReleaseId: string;
  storyReleaseId: string;
  explorerProjectionId: string;
  storyProjectionId: string;
}

export function selectStoryAtlasNodes(
  explorerNodes: readonly AtlasNodeViewModel[],
  approvedStoryPreviewNodeIds: readonly string[],
  contract: StoryNodeSelectionContract,
): AtlasNodeViewModel[] {
  if (contract.storyReleaseId !== contract.explorerReleaseId) {
    throw new StoryNodeSelectionError('Story and Full Explorer release IDs must match');
  }
  if (contract.storyProjectionId !== contract.explorerProjectionId) {
    throw new StoryNodeSelectionError('Story and Full Explorer projection IDs must match');
  }
  if (approvedStoryPreviewNodeIds.length === 0) {
    throw new StoryNodeSelectionError('Approved Story preview node IDs are required');
  }
  if (new Set(approvedStoryPreviewNodeIds).size !== approvedStoryPreviewNodeIds.length) {
    throw new StoryNodeSelectionError('Approved Story preview node IDs must be unique');
  }

  const nodesById = new Map(explorerNodes.map((node) => [node.id, node]));
  return approvedStoryPreviewNodeIds.map((nodeId) => {
    const node = nodesById.get(nodeId);
    if (!node) throw new StoryNodeSelectionError(`Story preview node is absent from Full Explorer: ${nodeId}`);
    if (node.projectionId !== contract.explorerProjectionId) {
      throw new StoryNodeSelectionError(`Story preview node projection mismatch: ${nodeId}`);
    }
    return node;
  });
}

export function storyExplorerNodeParity(
  storyNode: AtlasNodeViewModel,
  explorerNode: AtlasNodeViewModel,
): boolean {
  return storyNode.id === explorerNode.id
    && storyNode.projectionId === explorerNode.projectionId
    && JSON.stringify(storyNode.anchor) === JSON.stringify(explorerNode.anchor)
    && JSON.stringify(storyNode.display) === JSON.stringify(explorerNode.display)
    && storyNode.answerType === explorerNode.answerType
    && storyNode.behaviorFamily === explorerNode.behaviorFamily
    && storyNode.status === explorerNode.status
    && storyNode.normalizedMass === explorerNode.normalizedMass
    && storyNode.radiusPx === explorerNode.radiusPx
    && storyNode.confidence === explorerNode.confidence
    && storyNode.meanSimilarity === explorerNode.meanSimilarity
    && JSON.stringify(storyNode.encoding) === JSON.stringify(explorerNode.encoding);
}
