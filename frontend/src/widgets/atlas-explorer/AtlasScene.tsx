import { useLayoutEffect, useRef } from 'react';

import {
  ATLAS_PLOT_RECT,
  ATLAS_VIEWBOX,
  getNodeDisplayOpacity,
  getNodeHitRadius,
  getPresentedNodeRadius,
  resolveNodeInteractionState,
  type NodeFilterState,
} from '@/shared/config/atlas/atlasEncoding';
import { ANSWER_TYPE_SEMANTICS } from '@/shared/config/atlas/atlasSemantics';
import { resolvePointerNode } from '@/shared/lib/atlas/atlasNodeHitTesting';
import type { AtlasNodeViewModel, TopicBinViewModel } from '@/shared/types/atlas';
import { AtlasNodeGlyph } from './AtlasNodeGlyph';
import { AtlasSelectedAnnotation } from './AtlasSelectedAnnotation';
import { AtlasStageFrame } from './AtlasStageFrame';
import { AtlasTopicIndex } from './AtlasTopicIndex';
import { AtlasTopicLayer } from './AtlasTopicLayer';

interface AtlasSceneProps {
  nodes: readonly AtlasNodeViewModel[];
  nodeFilterStates: ReadonlyMap<string, NodeFilterState>;
  selectedNodeId: string | null;
  previewNodeId: string | null;
  focusNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onPreviewNode: (nodeId: string | null) => void;
  editorialAnchorNodeIds?: ReadonlySet<string>;
  persistentLabelNodeIds?: ReadonlySet<string>;
  topicBins?: readonly TopicBinViewModel[];
}

const EMPTY_NODE_IDS: ReadonlySet<string> = new Set();

interface SvgPointerCoordinates {
  currentTarget: SVGSVGElement;
  clientX: number;
  clientY: number;
}

function toSvgPoint(event: SvgPointerCoordinates) {
  const svg = event.currentTarget;
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(matrix.inverse());
}

export function AtlasScene({
  nodes,
  nodeFilterStates,
  selectedNodeId,
  previewNodeId,
  focusNodeId,
  onSelectNode,
  onPreviewNode,
  editorialAnchorNodeIds = EMPTY_NODE_IDS,
  persistentLabelNodeIds = EMPTY_NODE_IDS,
  topicBins = [],
}: AtlasSceneProps) {
  const visualScrollRef = useRef<HTMLDivElement>(null);
  const hasCenteredVisualScroll = useRef(false);
  const renderedNodes = nodes.filter((node) => nodeFilterStates.get(node.id) !== 'excluded');
  const interactiveNodes = renderedNodes.filter((node) => (nodeFilterStates.get(node.id) ?? 'matched') === 'matched');
  const contextCount = renderedNodes.length - interactiveNodes.length;
  const excludedCount = nodes.length - renderedNodes.length;
  const summary = `${nodes.length}개 aggregate node 중 ${interactiveNodes.length}개가 현재 필터에 해당하고 ${contextCount}개는 비상호작용 context, ${excludedCount}개는 제외 상태입니다. 위치는 주제 투영 좌표, 외곽 형태는 답변행태 계열, 내부 표식과 보조색은 A1–A8, 크기는 upstream radiusPx를 나타냅니다.`;
  const gridXs = [0.25, 0.5, 0.75].map((ratio) => ATLAS_PLOT_RECT.x + ATLAS_PLOT_RECT.width * ratio);
  const gridYs = [0.25, 0.5, 0.75].map((ratio) => ATLAS_PLOT_RECT.y + ATLAS_PLOT_RECT.height * ratio);
  const visibleTopicBinIds = new Set(interactiveNodes.map((node) => node.topicBinId));
  const selectedNode = renderedNodes.find((node) => node.id === selectedNodeId) ?? null;

  useLayoutEffect(() => {
    const scroller = visualScrollRef.current;
    if (!scroller || hasCenteredVisualScroll.current || interactiveNodes.length === 0) return;

    if (scroller.scrollWidth <= scroller.clientWidth + 1) {
      hasCenteredVisualScroll.current = true;
      return;
    }

    const nodeXs = interactiveNodes.map((node) => node.screen.x);
    const fieldCenterX = (Math.min(...nodeXs) + Math.max(...nodeXs)) / 2;
    const renderedScale = scroller.scrollWidth / ATLAS_VIEWBOX.width;
    const desiredScrollLeft = fieldCenterX * renderedScale - scroller.clientWidth / 2;
    scroller.scrollLeft = Math.min(
      scroller.scrollWidth - scroller.clientWidth,
      Math.max(0, desiredScrollLeft),
    );
    hasCenteredVisualScroll.current = true;
  }, [interactiveNodes]);

  return (
    <AtlasStageFrame
      label="QUESTION / ANSWER FIELD"
      title="Topic Space의 답변행태 분포"
      testId="atlas-chart"
      footer={<p id="atlas-chart-summary">{summary}</p>}
    >
      <AtlasTopicIndex topicBins={topicBins} visibleTopicBinIds={visibleTopicBinIds} />
      <div
        ref={visualScrollRef}
        className="atlas-visual-scroll"
        role="region"
        aria-label="답변행태 시각 지도 스크롤 영역"
        tabIndex={0}
      >
        <svg
          className="redline-registration-grid block h-auto"
          viewBox={`0 0 ${ATLAS_VIEWBOX.width} ${ATLAS_VIEWBOX.height}`}
          role="img"
          aria-labelledby="atlas-svg-title atlas-svg-description"
          focusable="false"
          onPointerMove={(event) => {
            const point = toSvgPoint(event);
            onPreviewNode(point ? resolvePointerNode(point, interactiveNodes)?.id ?? null : null);
          }}
          onPointerLeave={() => onPreviewNode(null)}
          onClick={(event) => {
            const point = toSvgPoint(event);
            const node = point ? resolvePointerNode(point, interactiveNodes) : null;
            if (node) onSelectNode(node.id);
          }}
        >
        <title id="atlas-svg-title">답변행태 지도</title>
        <desc id="atlas-svg-description">{summary} 아래 동기화 목록으로도 모든 node를 탐색할 수 있습니다.</desc>
        <rect className="atlas-plot-surface" x={ATLAS_PLOT_RECT.x} y={ATLAS_PLOT_RECT.y} width={ATLAS_PLOT_RECT.width} height={ATLAS_PLOT_RECT.height} />
        <g aria-hidden="true" stroke="var(--color-neutral-300)" strokeDasharray="5 7" vectorEffect="non-scaling-stroke">
          {gridXs.map((x) => <line key={`x-${x}`} x1={x} x2={x} y1={ATLAS_PLOT_RECT.y} y2={ATLAS_PLOT_RECT.y + ATLAS_PLOT_RECT.height} />)}
          {gridYs.map((y) => <line key={`y-${y}`} x1={ATLAS_PLOT_RECT.x} x2={ATLAS_PLOT_RECT.x + ATLAS_PLOT_RECT.width} y1={y} y2={y} />)}
        </g>
        <AtlasTopicLayer topicBins={topicBins} visibleTopicBinIds={visibleTopicBinIds} />
        {renderedNodes.map((node) => {
          const filterState = nodeFilterStates.get(node.id) ?? 'matched';
          const interactive = filterState === 'matched';
          const selected = node.id === selectedNodeId;
          const previewed = node.id === previewNodeId;
          const focused = node.id === focusNodeId;
          const editorialAnchor = editorialAnchorNodeIds.has(node.id);
          const dimmed = interactive && Boolean((selectedNodeId && !selected) || (previewNodeId && !previewed));
          const state = resolveNodeInteractionState({
            isHovered: previewed,
            isFocused: focused,
            isSelected: selected,
            isDimmed: dimmed,
            filterState,
          });
          const radius = getPresentedNodeRadius(node.radiusPx);
          const opacity = getNodeDisplayOpacity({
            semanticOpacity: node.encoding.opacity,
            interactionState: state,
            filterState,
            isSelected: selected,
            isFocused: focused,
          });
          const showLabel = interactive && !selected && (previewed || focused || persistentLabelNodeIds.has(node.id));
          const labelOnLeft = node.screen.x > ATLAS_PLOT_RECT.x + ATLAS_PLOT_RECT.width * 0.7;
          const labelX = labelOnLeft ? -(radius + 14) : radius + 14;
          return (
            <g
              key={node.id}
              transform={`translate(${node.screen.x} ${node.screen.y})`}
              aria-hidden="true"
              data-node-id={node.id}
              data-topic-bin-id={node.topicBinId}
              data-anchor-x={node.anchor.x}
              data-anchor-y={node.anchor.y}
              data-display-x={node.display.x}
              data-display-y={node.display.y}
              data-screen-x={node.screen.x}
              data-screen-y={node.screen.y}
              data-source-radius={node.radiusPx}
              data-rendered-radius={radius}
              data-node-opacity={opacity}
              data-node-state={state}
              data-node-filter-state={filterState}
              data-editorial-anchor={editorialAnchor ? 'true' : undefined}
              className={interactive ? 'cursor-pointer' : undefined}
            >
              {interactive ? (
                <circle
                  data-atlas-hit-target="true"
                  r={getNodeHitRadius(node.radiusPx)}
                  fill="transparent"
                  stroke="transparent"
                  pointerEvents="all"
                />
              ) : null}
              {editorialAnchor && interactive ? (
                <circle
                  data-editorial-anchor-ring="true"
                  r={radius + 5}
                  fill="none"
                  stroke={node.encoding.fillToken}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              ) : null}
              <AtlasNodeGlyph
                shape={node.encoding.shapeToken}
                answerType={node.answerType}
                status={node.status}
                fill={node.encoding.fillToken}
                stroke={node.encoding.strokeToken}
                opacity={opacity}
                radius={radius}
                state={state}
                showAnswerMark
                evidenceAvailable={node.isPublicEvidenceAvailable}
              />
              {showLabel ? (
                <g className="atlas-node-label" transform={`translate(${labelX} ${-(radius + 10)})`}>
                  <line x1={labelOnLeft ? 8 : -8} x2={labelOnLeft ? 18 : -18} y1={12} y2={radius + 8} stroke="var(--line-strong)" vectorEffect="non-scaling-stroke" />
                  <text textAnchor={labelOnLeft ? 'end' : 'start'} className="fill-[var(--ink-primary)] font-mono text-[11px] font-bold">
                    <tspan x="0" dy="0">{node.answerType} / {ANSWER_TYPE_SEMANTICS[node.answerType].name}</tspan>
                    <tspan x="0" dy="15">{node.answerCount}건</tspan>
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
        {selectedNode ? <AtlasSelectedAnnotation node={selectedNode} /> : null}
        </svg>
      </div>
    </AtlasStageFrame>
  );
}
