import { useEffect, useMemo, useState } from 'react';

import type { NodeFilterState } from '@/shared/config/atlas/atlasEncoding';
import { atlasNodeAccessibleName } from '@/shared/lib/atlas/atlasAccessibility';
import {
  ANSWER_TYPES,
  type AnswerType,
  type AtlasQueryState,
  type AtlasViewModelBundle,
} from '@/shared/types/atlas';
import { AtlasEmptyState, AtlasProjectionNote } from '@/shared/ui/atlas';
import { AtlasControls } from './AtlasControls';
import { AtlasDistributionStrip } from './AtlasDistributionStrip';
import { AtlasDomMirror } from './AtlasDomMirror';
import { AtlasEvidenceView } from './AtlasEvidenceView';
import { AtlasHeaderSummary, type AtlasFilteredSummary } from './AtlasHeaderSummary';
import { AtlasInspector } from './AtlasInspector';
import { AtlasLegend } from './AtlasLegend';
import { AtlasRelationsView } from './AtlasRelationsView';
import { AtlasScene } from './AtlasScene';
import { AtlasViewTabs } from './AtlasViewTabs';

interface AtlasExplorerProps {
  bundle: AtlasViewModelBundle;
  query: AtlasQueryState;
  queryIssues: readonly string[];
  fixtureProvenance?: 'CONTRACT_FIXTURE';
  onQueryChange: (query: AtlasQueryState) => void;
}

function answerTypeCounts(nodes: readonly AtlasViewModelBundle['nodes'][number][]): Record<AnswerType, number> {
  const counts = Object.fromEntries(ANSWER_TYPES.map((type) => [type, 0])) as Record<AnswerType, number>;
  nodes.forEach((node) => { counts[node.answerType] += node.answerCount; });
  return counts;
}

export function AtlasExplorer({ bundle, query, queryIssues, fixtureProvenance, onQueryChange }: AtlasExplorerProps) {
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const statusNodes = useMemo(
    () => bundle.nodes.filter((node) => query.status === 'all' || node.status === query.status),
    [bundle.nodes, query.status],
  );
  const filteredNodes = useMemo(
    () => statusNodes.filter((node) => query.types.includes(node.answerType)),
    [statusNodes, query.types],
  );
  const typeCounts = useMemo(() => answerTypeCounts(statusNodes), [statusNodes]);
  const matchedNodeIds = useMemo(() => new Set(filteredNodes.map((node) => node.id)), [filteredNodes]);
  const nodeFilterStates = useMemo(
    () => new Map(bundle.nodes.map((node): [string, NodeFilterState] => [node.id, matchedNodeIds.has(node.id) ? 'matched' : 'excluded'])),
    [bundle.nodes, matchedNodeIds],
  );
  const selectedNode = query.nodeId ? bundle.nodes.find((node) => node.id === query.nodeId) ?? null : null;
  const invalidNode = query.nodeId !== null && selectedNode === null;
  const focusedNode = focusNodeId ? bundle.nodes.find((node) => node.id === focusNodeId) ?? null : null;
  const evidenceSummary = selectedNode?.representativeEvidenceId
    ? bundle.evidenceRepository.getSummary(selectedNode.representativeEvidenceId)
    : null;
  const filteredSummary = useMemo<AtlasFilteredSummary>(() => {
    const evidenceNodeCount = filteredNodes.filter((node) => node.isPublicEvidenceAvailable).length;
    return {
      nodeCount: filteredNodes.length,
      totalNodeCount: bundle.nodes.length,
      answerCount: filteredNodes.reduce((sum, node) => sum + node.answerCount, 0),
      totalAnswerCount: bundle.storySummary.analysisEntityCount,
      linkCount: filteredNodes.reduce((sum, node) => sum + node.linkCount, 0),
      totalLinkCount: bundle.storySummary.publicEvidenceCount,
      evidenceNodeCount,
      evidenceCoveragePercent: filteredNodes.length === 0 ? 0 : Math.round((evidenceNodeCount / filteredNodes.length) * 100),
    };
  }, [bundle.nodes.length, bundle.storySummary.analysisEntityCount, bundle.storySummary.publicEvidenceCount, filteredNodes]);
  const announce = invalidNode
    ? `존재하지 않는 node ${query.nodeId}`
    : selectedNode
      ? `${atlasNodeAccessibleName(selectedNode)} 선택됨, ${query.view} 보기`
      : focusedNode
        ? `${atlasNodeAccessibleName(focusedNode)} 포커스`
        : `${filteredNodes.length}개 node 표시, ${query.view} 보기`;

  const clearSelection = () => onQueryChange({ ...query, nodeId: null });
  const selectNode = (nodeId: string) => {
    onQueryChange({ ...query, nodeId });
    if (typeof window.matchMedia !== 'function' || !window.matchMedia('(max-width: 64rem)').matches) return;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const inspector = document.getElementById('atlas-selection-inspector');
        if (!inspector) return;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        inspector.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  };
  const reset = () => onQueryChange({
    status: 'all',
    types: [...ANSWER_TYPES],
    nodeId: null,
    view: 'map',
    relationType: null,
    depth: 1,
  });

  useEffect(() => {
    if (selectedNode && !matchedNodeIds.has(selectedNode.id)) {
      onQueryChange({ ...query, nodeId: null });
    }
  }, [matchedNodeIds, onQueryChange, query, selectedNode]);

  return (
    <div
      className="atlas-explorer"
      data-testid="atlas-explorer-ready"
      data-release-id={bundle.releaseId}
      data-projection-id={bundle.projectionId}
      data-projection-hash={bundle.projectionHash}
      onKeyDown={(event) => { if (event.key === 'Escape' && query.nodeId) clearSelection(); }}
    >
      {fixtureProvenance ? (
        <p className="border border-[var(--status-active)] bg-[var(--color-behavior-amber-bg)] px-4 py-3 font-mono text-xs" data-testid="fixture-provenance">
          CONTRACT_FIXTURE / 개발·테스트 전용 / 실제 분석 결과가 아님
        </p>
      ) : null}
      {queryIssues.length > 0 ? (
        <div className="border border-[var(--status-active)] px-4 py-3 text-sm" role="status">URL 값 {queryIssues.length}개를 canonical Atlas 계약으로 정규화했습니다.</div>
      ) : null}

      <AtlasHeaderSummary
        releaseId={bundle.releaseId}
        projectionId={bundle.projectionId}
        dataVersion={bundle.dataVersion}
        status={query.status}
        types={query.types}
        summary={filteredSummary}
      />
      <AtlasViewTabs
        view={query.view}
        onViewChange={(view) => onQueryChange({
          ...query,
          view,
          relationType: view === 'relations' ? query.relationType : null,
        })}
      />
      <AtlasControls
        status={query.status}
        types={query.types}
        typeCounts={typeCounts}
        view={query.view}
        relationType={query.relationType}
        onStatusChange={(status) => onQueryChange({ ...query, status })}
        onTypesChange={(types) => onQueryChange({ ...query, types })}
        onRelationTypeChange={(relationType) => onQueryChange({ ...query, relationType })}
        onReset={reset}
      />
      <p className="sr-only" aria-live="polite" aria-atomic="true" data-testid="atlas-live-region">{announce}</p>

      {bundle.nodes.length === 0 ? (
        <AtlasEmptyState
          title="표시할 승인 node가 없습니다"
          description="manifest와 bundle은 유효하지만 공개 가능한 aggregate node가 0개입니다. 가짜 점을 대신 표시하지 않습니다."
        />
      ) : null}

      {bundle.nodes.length > 0 && query.view === 'map' ? (
        <div id="atlas-view-map" role="tabpanel" className="atlas-map-layout">
          <AtlasScene
            nodes={bundle.nodes}
            topicBins={bundle.topicBins}
            nodeFilterStates={nodeFilterStates}
            selectedNodeId={query.nodeId}
            previewNodeId={previewNodeId}
            focusNodeId={focusNodeId}
            onSelectNode={selectNode}
            onPreviewNode={setPreviewNodeId}
          />
          <AtlasInspector
            node={invalidNode ? null : selectedNode}
            invalidNodeId={invalidNode ? query.nodeId : null}
            onClearInvalidNode={invalidNode ? clearSelection : undefined}
            evidenceSummary={evidenceSummary}
            evidenceRepository={bundle.evidenceRepository}
          />
        </div>
      ) : null}

      {bundle.nodes.length > 0 && query.view === 'relations' ? (
        <AtlasRelationsView selectedNode={selectedNode} relationType={query.relationType} />
      ) : null}

      {bundle.nodes.length > 0 && query.view === 'evidence' ? (
        <AtlasEvidenceView
          node={invalidNode ? null : selectedNode}
          evidenceSummary={evidenceSummary}
          evidenceRepository={bundle.evidenceRepository}
        />
      ) : null}

      {filteredNodes.length === 0 && bundle.nodes.length > 0 ? (
        <AtlasEmptyState
          title="조건에 맞는 node가 없습니다"
          description="선택한 처리 상태와 답변 유형의 교집합이 비어 있습니다. projection과 viewport는 유지됩니다."
          onReset={reset}
          testId="atlas-filter-empty-state"
        />
      ) : null}

      {filteredNodes.length > 0 ? (
        <AtlasDistributionStrip nodes={filteredNodes} selectedAnswerType={selectedNode?.answerType ?? null} />
      ) : null}
      {filteredNodes.length > 0 ? (
        <AtlasDomMirror
          nodes={filteredNodes}
          selectedNodeId={query.nodeId}
          onSelectNode={selectNode}
          onClearSelection={clearSelection}
          onPreviewNode={setPreviewNodeId}
          onFocusNode={setFocusNodeId}
        />
      ) : null}
      <AtlasLegend />
      <AtlasProjectionNote />
    </div>
  );
}
