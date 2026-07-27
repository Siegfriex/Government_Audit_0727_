import { clippedTopicLabel, selectVisibleTopicBins } from '@/shared/lib/atlas/atlasTopicPresentation';
import type { TopicBinViewModel } from '@/shared/types/atlas';

interface AtlasTopicIndexProps {
  topicBins: readonly TopicBinViewModel[];
  visibleTopicBinIds: ReadonlySet<string>;
}

export function AtlasTopicIndex({ topicBins, visibleTopicBinIds }: AtlasTopicIndexProps) {
  const selected = selectVisibleTopicBins(topicBins, visibleTopicBinIds);
  return (
    <section className="atlas-topic-index" aria-labelledby="atlas-topic-index-heading">
      <header>
        <p className="redline-meta">APPROVED TOPIC CENTROIDS</p>
        <h3 id="atlas-topic-index-heading">현재 조건의 주요 topic 기준점</h3>
      </header>
      <ol tabIndex={0} aria-label="현재 조건의 주요 topic 기준점 목록">
        {selected.map((bin, index) => (
          <li key={bin.id}>
            <span>T{index + 1}</span>
            <div><strong>{clippedTopicLabel(bin.label)}</strong><small>{bin.memberCount} members · {bin.id}</small></div>
          </li>
        ))}
      </ol>
    </section>
  );
}
