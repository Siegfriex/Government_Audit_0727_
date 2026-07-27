import type { TopicBinViewModel } from '@/shared/types/atlas';

export function selectVisibleTopicBins(
  topicBins: readonly TopicBinViewModel[],
  visibleTopicBinIds: ReadonlySet<string>,
  maximum = 7,
): TopicBinViewModel[] {
  const candidates = topicBins
    .filter((bin) => visibleTopicBinIds.has(bin.id))
    .sort((left, right) => right.memberCount - left.memberCount || left.id.localeCompare(right.id));
  const selected: TopicBinViewModel[] = [];
  for (const candidate of candidates) {
    if (selected.length >= maximum) break;
    if (selected.every((current) => Math.hypot(current.screen.x - candidate.screen.x, current.screen.y - candidate.screen.y) >= 86)) {
      selected.push(candidate);
    }
  }
  return selected;
}

export function clippedTopicLabel(label: string | null): string {
  if (!label) return '주제 라벨 미제공';
  const normalized = label.replace(/\s+/g, ' ').trim();
  return normalized.length > 52 ? `${normalized.slice(0, 52)}…` : normalized;
}
