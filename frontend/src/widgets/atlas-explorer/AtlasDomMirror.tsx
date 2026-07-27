import { useRef, useState, type KeyboardEvent } from 'react';

import { atlasNodeAccessibleName, atlasNodeMetricDescription } from '@/shared/lib/atlas/atlasAccessibility';
import { findNextAtlasNodeId, type AtlasNavigationKey } from '@/shared/lib/atlas/atlasNodeNavigation';
import type { AtlasNodeViewModel } from '@/shared/types/atlas';

interface AtlasDomMirrorProps {
  nodes: readonly AtlasNodeViewModel[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onClearSelection: () => void;
  onPreviewNode: (nodeId: string | null) => void;
  onFocusNode: (nodeId: string | null) => void;
}

const NAVIGATION_KEYS: readonly AtlasNavigationKey[] = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
];

export function AtlasDomMirror({
  nodes,
  selectedNodeId,
  onSelectNode,
  onClearSelection,
  onPreviewNode,
  onFocusNode,
}: AtlasDomMirrorProps) {
  const [activeNodeId, setActiveNodeId] = useState(() => selectedNodeId ?? nodes[0]?.id ?? '');
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const effectiveActiveNodeId = selectedNodeId && nodes.some((node) => node.id === selectedNodeId)
    ? selectedNodeId
    : nodes.some((node) => node.id === activeNodeId)
      ? activeNodeId
      : nodes[0]?.id ?? '';

  const moveFocus = (currentNodeId: string, key: AtlasNavigationKey) => {
    const nextNodeId = findNextAtlasNodeId(nodes, currentNodeId, key);
    setActiveNodeId(nextNodeId);
    buttonRefs.current.get(nextNodeId)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, nodeId: string) => {
    if (NAVIGATION_KEYS.includes(event.key as AtlasNavigationKey)) {
      event.preventDefault();
      moveFocus(nodeId, event.key as AtlasNavigationKey);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClearSelection();
    }
  };

  return (
    <section
      id="atlas-node-list"
      aria-labelledby="atlas-list-heading"
      className="border-y border-[var(--line-medium)] py-5 md:py-6"
      tabIndex={-1}
    >
      <p className="redline-meta text-[var(--ink-secondary)]">DOM MIRROR / KEYBOARD OWNER</p>
      <h2 id="atlas-list-heading" className="mt-2 font-serif text-2xl font-bold" tabIndex={-1}>접근 가능한 node 목록</h2>
      <p id="atlas-list-instructions" className="mt-1 text-sm text-[var(--color-neutral-700)]">
        지도와 같은 필터 결과입니다. Tab으로 목록에 진입한 뒤 방향키로 이동하고 Enter 또는 Space로 선택합니다. Escape는 선택을 지웁니다.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3" aria-describedby="atlas-list-instructions">
        {nodes.map((node) => {
          const metricsId = `atlas-node-metrics-${node.id}`;
          return (
            <li key={node.id}>
              <button
                ref={(element) => {
                  if (element) buttonRefs.current.set(node.id, element);
                  else buttonRefs.current.delete(node.id);
                }}
                type="button"
                className="atlas-node-navigator relative min-h-11 w-full border border-[var(--line-strong)] bg-[var(--paper-surface)] px-3 py-3 text-left text-sm aria-pressed:border-[var(--signal-red-dark)] aria-pressed:before:absolute aria-pressed:before:inset-y-0 aria-pressed:before:left-0 aria-pressed:before:w-0.5 aria-pressed:before:bg-[var(--signal-red)]"
                tabIndex={node.id === effectiveActiveNodeId ? 0 : -1}
                aria-pressed={node.id === selectedNodeId}
                aria-label={atlasNodeAccessibleName(node)}
                aria-describedby={metricsId}
                onClick={() => onSelectNode(node.id)}
                onKeyDown={(event) => handleKeyDown(event, node.id)}
                onFocus={() => {
                  setActiveNodeId(node.id);
                  onFocusNode(node.id);
                }}
                onBlur={() => onFocusNode(null)}
                onPointerEnter={() => onPreviewNode(node.id)}
                onPointerLeave={() => onPreviewNode(null)}
              >
                <span className="font-mono font-bold">{node.answerType}</span>{' '}
                <span>{node.topicLabel ?? '주제 라벨 미제공'}</span>{' '}
                <span className="text-[var(--color-neutral-700)]">({node.answerCount}건)</span>
                <span id={metricsId} className="sr-only">{atlasNodeMetricDescription(node)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
