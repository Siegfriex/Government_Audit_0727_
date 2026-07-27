import { useMemo } from 'react';

import { buildAtlasClusterPresentation } from '@/shared/lib/atlas/atlasClusterPresentation';
import type { AtlasNodeViewModel, TopicBinViewModel } from '@/shared/types/atlas';

interface StoryAtlasClusterNavigatorProps {
  nodes: readonly AtlasNodeViewModel[];
  topicBins: readonly TopicBinViewModel[];
  selectedTopicBinId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export function StoryAtlasClusterNavigator({ nodes, topicBins, selectedTopicBinId, onSelectNode }: StoryAtlasClusterNavigatorProps) {
  const clusters = useMemo(() => buildAtlasClusterPresentation(nodes, topicBins), [nodes, topicBins]);
  return (
    <section className="story-atlas-clusters" aria-labelledby="story-atlas-clusters-title" data-testid="story-atlas-clusters">
      <header className="story-atlas-clusters__header">
        <div>
          <p className="redline-meta">APPROVED KMEANS / 24 TOPIC BINS</p>
          <h3 id="story-atlas-clusters-title">필터 결과가 모이는 질문 군집</h3>
        </div>
      </header>
      <div className="story-atlas-clusters__summary" role="status">
        <strong>{nodes.length}</strong> filtered nodes · <strong>{clusters.length}</strong> visible clusters
      </div>
      {clusters.length > 0 ? (
        <ol
          aria-label="필터 결과 KMeans 군집 목록"
          className="story-atlas-clusters__grid"
          tabIndex={0}
        >
          {clusters.map((cluster, index) => (
            <li key={cluster.bin.id}>
              <button
                type="button"
                className="story-atlas-cluster-card"
                aria-pressed={cluster.bin.id === selectedTopicBinId}
                data-cluster-id={cluster.bin.id}
                onClick={() => onSelectNode(cluster.representativeNode.id)}
              >
                <span className="story-atlas-cluster-card__index">K{String(index + 1).padStart(2, '0')}</span>
                <span className="story-atlas-cluster-card__counts">filter {cluster.matchingNodeCount} · upstream {cluster.bin.memberCount}</span>
                <strong>{cluster.bin.label ?? '승인 topic label 없음'}</strong>
                <small>
                  {cluster.bin.representativeTargetIssueId ?? 'TARGET ID 미연결'} · center Δ {cluster.displayDistanceToCenter.toFixed(3)}
                </small>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="story-atlas-clusters__empty">현재 필터에 해당하는 승인 KMeans 군집이 없습니다.</p>
      )}
    </section>
  );
}
