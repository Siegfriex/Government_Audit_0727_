import { selectVisibleTopicBins } from '@/shared/lib/atlas/atlasTopicPresentation';
import type { TopicBinViewModel } from '@/shared/types/atlas';

interface AtlasTopicLayerProps {
  topicBins: readonly TopicBinViewModel[];
  visibleTopicBinIds: ReadonlySet<string>;
}

export function AtlasTopicLayer({ topicBins, visibleTopicBinIds }: AtlasTopicLayerProps) {
  const selected = selectVisibleTopicBins(topicBins, visibleTopicBinIds);

  return (
    <g className="atlas-topic-layer" aria-hidden="true">
      {selected.map((bin, index) => (
        <g key={bin.id} data-topic-label={bin.id}>
          <circle cx={bin.screen.x} cy={bin.screen.y} r="8" />
          <text x={bin.screen.x} y={bin.screen.y + 2.8} textAnchor="middle">T{index + 1}</text>
          <title>{bin.label ?? '주제 라벨 미제공'} · {bin.memberCount} members</title>
        </g>
      ))}
    </g>
  );
}
