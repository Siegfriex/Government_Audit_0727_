import type { AtlasViewMode } from '@/shared/types/atlas';

interface AtlasViewTabsProps {
  view: AtlasViewMode;
  onViewChange: (view: AtlasViewMode) => void;
}

const VIEW_LABELS: ReadonlyArray<{ value: AtlasViewMode; label: string; description: string }> = [
  { value: 'map', label: '지도', description: 'Topic Space와 답변행태 분포' },
  { value: 'relations', label: '관계', description: '승인된 node 관계와 연결 이유' },
  { value: 'evidence', label: '근거 흐름', description: 'node에서 PDF까지의 공개 계보' },
];

export function AtlasViewTabs({ view, onViewChange }: AtlasViewTabsProps) {
  return (
    <nav className="atlas-view-tabs" aria-label="Atlas 보기 전환" role="tablist">
      {VIEW_LABELS.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={view === item.value}
          aria-controls={`atlas-view-${item.value}`}
          className="atlas-view-tab"
          onClick={() => onViewChange(item.value)}
        >
          <strong>{item.label}</strong>
          <span>{item.description}</span>
        </button>
      ))}
    </nav>
  );
}
