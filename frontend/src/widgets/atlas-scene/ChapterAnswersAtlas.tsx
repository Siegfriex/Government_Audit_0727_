import { useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';

import { useAtlasRelease } from '@/shared/api/atlas/useAtlasRelease';
import type { NodeFilterState } from '@/shared/config/atlas/atlasEncoding';
import { useDetailNavigation } from '@/shared/hooks/useDetailNavigation';
import { selectStoryAtlasNodes } from '@/shared/lib/atlas/atlasNodeParity';
import { selectStoryPersistentLabelNodeIds } from '@/shared/lib/atlas/storyAtlasLabelPolicy';
import {
  buildAtlasHrefFromPreview,
  parseAtlasQueryState,
  serializeAtlasQueryState,
} from '@/shared/lib/atlas/atlasQueryState';
import { ANSWER_TYPES, type AtlasQueryState } from '@/shared/types/atlas';
import { ChapterFrame } from '@/shared/ui/ChapterFrame';
import { PageFrame } from '@/shared/ui/PageFrame';
import { AtlasDataUnavailable, AtlasEmptyState, AtlasLoadingState, AtlasProjectionNote } from '@/shared/ui/atlas';
import { AtlasControls } from '@/widgets/atlas-explorer/AtlasControls';
import { AtlasDomMirror } from '@/widgets/atlas-explorer/AtlasDomMirror';
import { AtlasLegend } from '@/widgets/atlas-explorer/AtlasLegend';
import { AtlasMetadataRail } from '@/widgets/atlas-explorer/AtlasMetadataRail';
import { AtlasScene } from '@/widgets/atlas-explorer/AtlasScene';
import { AtlasSectionHeader } from '@/widgets/atlas-explorer/AtlasSectionHeader';
import { StoryAtlasDossier } from './StoryAtlasDossier';
import { StoryAtlasClusterNavigator } from './StoryAtlasClusterNavigator';
import { StoryAtlasTypePrimer } from './StoryAtlasTypePrimer';
import './story-atlas-vid.css';

export function ChapterAnswersAtlas() {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const release = useAtlasRelease();
  const releaseBundle = release.status === 'ready' ? release.bundle : null;
  const { openEvidence } = useDetailNavigation();
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const queryResult = useMemo(() => parseAtlasQueryState(location.search), [location.search]);
  const query = queryResult.state;
  const explorerHref = buildAtlasHrefFromPreview(query.status, query.types);
  const fixtureMode = import.meta.env.DEV
    && import.meta.env.VITE_ATLAS_FIXTURE_PROVENANCE === 'CONTRACT_FIXTURE';

  const storySelection = useMemo(() => {
    if (!releaseBundle) return null;
    try {
      return {
        nodes: selectStoryAtlasNodes(
          releaseBundle.nodes,
          releaseBundle.storyPreviewNodeIds,
          {
            explorerReleaseId: releaseBundle.releaseId,
            storyReleaseId: releaseBundle.releaseId,
            explorerProjectionId: releaseBundle.projectionId,
            storyProjectionId: releaseBundle.projectionId,
          },
        ),
        error: null,
      };
    } catch (error) {
      return { nodes: [], error: error instanceof Error ? error : new Error('Unknown Story selection error') };
    }
  }, [releaseBundle]);

  const storyNodes = useMemo(() => storySelection?.nodes ?? [], [storySelection]);
  const allNodes = useMemo(() => releaseBundle?.nodes ?? [], [releaseBundle]);
  const filteredNodes = useMemo(
    () => allNodes.filter((node) => (query.status === 'all' || node.status === query.status) && query.types.includes(node.answerType)),
    [allNodes, query.status, query.types],
  );
  const editorialAnchorNodeIds = useMemo(() => new Set(storyNodes.map((node) => node.id)), [storyNodes]);
  const matchedAnchorIds = useMemo(
    () => new Set(filteredNodes.filter((node) => editorialAnchorNodeIds.has(node.id)).map((node) => node.id)),
    [editorialAnchorNodeIds, filteredNodes],
  );
  const requestedNode = query.nodeId ? allNodes.find((node) => node.id === query.nodeId) ?? null : null;
  const filterStates = useMemo(
    () => new Map(allNodes.map((node): [string, NodeFilterState] => [
      node.id,
      matchedAnchorIds.has(node.id) || requestedNode?.id === node.id ? 'matched' : 'context',
    ])),
    [allNodes, matchedAnchorIds, requestedNode?.id],
  );
  const defaultNode = filteredNodes.find((node) => editorialAnchorNodeIds.has(node.id) && node.isPublicEvidenceAvailable)
    ?? filteredNodes.find((node) => editorialAnchorNodeIds.has(node.id))
    ?? filteredNodes.find((node) => node.isPublicEvidenceAvailable)
    ?? filteredNodes[0]
    ?? null;
  const selectedNode = query.nodeId ? requestedNode : defaultNode;
  const visualSelectedNode = query.nodeId ? selectedNode : null;
  const isSelectedEditorialAnchor = selectedNode ? editorialAnchorNodeIds.has(selectedNode.id) : false;
  const persistentLabelNodeIds = useMemo(
    () => selectStoryPersistentLabelNodeIds(
      storyNodes.filter((node) => node.id !== visualSelectedNode?.id),
      {
        maximumLabels: visualSelectedNode ? 1 : 3,
        minimumScreenDistance: 148,
        reservedNodes: visualSelectedNode ? [visualSelectedNode] : [],
      },
    ),
    [storyNodes, visualSelectedNode],
  );

  const updateQuery = (next: AtlasQueryState) => setSearchParams(serializeAtlasQueryState(next));
  const reset = () => updateQuery({
    status: 'all',
    types: [...ANSWER_TYPES],
    nodeId: null,
    view: 'map',
    relationType: null,
    depth: 1,
  });

  return (
    <ChapterFrame id="answers" orderNumber="CHAPTER 04">
      <PageFrame className="story-atlas-vid">
        <AtlasSectionHeader
          index="04"
          eyebrow="어떻게 답했나 / STORY PREVIEW"
          title="답변은 어디에 모였는가"
          thesis="같은 주제 공간 안에서 답변이 어떤 유형과 처리 상태를 보이는지 탐색합니다. 위치는 topic projection, A1의 red부터 A8의 blue까지 색은 답변행태를 뜻합니다."
          aside={<AtlasProjectionNote compact />}
          headingLevel="h2"
        />

        <div className="mt-6">
          <AtlasMetadataRail
            label="Story Preview 계약 상태"
            items={[
              { label: 'Story role', value: 'EDITORIAL PREVIEW' },
              { label: 'Explorer role', value: 'URL-BACKED FIELD' },
              { label: 'Data status', value: release.status === 'ready' ? 'APPROVED RELEASE' : 'UNAVAILABLE', tone: release.status === 'ready' ? 'default' : 'warning' },
              { label: 'Fallback', value: 'PROHIBITED', tone: 'signal' },
            ]}
          />
        </div>

        {fixtureMode ? (
          <p className="mt-8 border border-[var(--atlas-state-warning)] bg-[var(--color-behavior-amber-bg)] px-4 py-3 font-mono text-xs font-bold" data-testid="story-fixture-provenance">
            CONTRACT_FIXTURE / 개발·테스트 전용
          </p>
        ) : null}

        <div className="mt-8">
          {release.status === 'loading' ? <AtlasLoadingState testId="story-atlas-loading" /> : null}
          {release.status === 'unavailable' ? (
            <AtlasDataUnavailable
              title="Story Preview의 승인 데이터를 불러올 수 없습니다"
              description="current release pointer 또는 승인 manifest가 없으며 개발용 node를 대신 표시하지 않습니다."
              reason={release.reason}
              testId="story-atlas-data-unavailable"
              actions={(
                <>
                  <Link className="atlas-action-primary" to={explorerHref}>전체 답변행태 지도 보기</Link>
                  <Link className="atlas-action-secondary" to="/data">데이터 승인 상태 확인</Link>
                </>
              )}
            />
          ) : null}
          {release.status === 'error' || storySelection?.error ? (
            <AtlasDataUnavailable
              title="Story Preview 계약 검증에 실패했습니다"
              description={(release.status === 'error' ? release.error : storySelection?.error)?.message ?? '알 수 없는 오류'}
              reason="STORY_APPROVED_VIEWMODEL_INVALID"
              testId="story-atlas-data-unavailable"
              actions={<button className="atlas-action-primary" type="button" onClick={release.retry}>다시 시도</button>}
            />
          ) : null}
          {release.status === 'ready' && storySelection && !storySelection.error ? (
            <section
              className="story-atlas-ready flex flex-col"
              data-testid="story-atlas-ready"
              data-release-id={release.bundle.releaseId}
              data-projection-id={release.bundle.projectionId}
              data-projection-hash={release.bundle.projectionHash}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && query.nodeId) updateQuery({ ...query, nodeId: null });
              }}
            >
              <div className="flex flex-col gap-3 border-y border-[var(--line-medium)] py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="redline-meta text-[var(--ink-tertiary)]">APPROVED RELEASE / SHARED VIEWMODEL</p>
                  <p className="mt-1 break-all font-mono text-xs font-bold">{release.bundle.releaseId}</p>
                </div>
                <p className="inline-flex min-h-11 items-center border border-[var(--atlas-state-ready)] bg-[var(--color-behavior-blue-bg)] px-4 font-mono text-xs font-bold">
                  전체 {allNodes.length} nodes · 편집 anchor {storyNodes.length}
                </p>
              </div>
              {queryResult.issues.length > 0 ? (
                <p className="border border-[var(--atlas-state-warning)] px-4 py-3 text-sm" role="status">URL parameter {queryResult.issues.length}개를 안전한 기본값으로 해석했습니다.</p>
              ) : null}
              <StoryAtlasTypePrimer
                distribution={release.bundle.storySummary.primaryBehaviorDistribution}
                selectedTypes={query.types}
                onSelectType={(answerType) => updateQuery({
                  ...query,
                  types: query.types.length === 1 && query.types[0] === answerType ? [...ANSWER_TYPES] : [answerType],
                  nodeId: null,
                })}
                onShowAll={() => updateQuery({ ...query, types: [...ANSWER_TYPES], nodeId: null })}
              />
              <AtlasControls
                status={query.status}
                types={query.types}
                onStatusChange={(status) => updateQuery({ ...query, status, nodeId: null })}
                onTypesChange={(types) => updateQuery({ ...query, types, nodeId: null })}
                onReset={reset}
              />
              <div className="story-atlas-map-intro">
                <div>
                  <p className="redline-meta">EDITORIAL FIELD / 16 ANCHORS FIRST</p>
                  <h3>전체 지형 안에서 핵심 답변부터 읽습니다</h3>
                </div>
                <p>
                  옅은 표식은 승인된 140개 전체 맥락, 선명한 표식은 기사 흐름으로 고정한 16개 앵커입니다.
                  필터·호버·선택은 앵커에 우선 적용되고 전체 비교는 Explorer로 이어집니다.
                </p>
              </div>
              <AtlasLegend />
              <div className="story-atlas-workspace">
                <p className="story-atlas-scroll-cue">
                  <span>SCROLL / DRAG</span>
                  작은 화면에서는 지도를 좌우로 움직여 전체 좌표를 탐색할 수 있습니다.
                </p>
                <AtlasScene
                  nodes={allNodes}
                  nodeFilterStates={filterStates}
                  selectedNodeId={visualSelectedNode?.id ?? null}
                  previewNodeId={previewNodeId}
                  focusNodeId={focusNodeId}
                  onSelectNode={(nodeId) => updateQuery({ ...query, nodeId })}
                  onPreviewNode={setPreviewNodeId}
                  editorialAnchorNodeIds={editorialAnchorNodeIds}
                  persistentLabelNodeIds={persistentLabelNodeIds}
                  topicBins={release.bundle.topicBins}
                />
              </div>
              <details className="story-atlas-technical-disclosure" data-testid="story-atlas-cluster-disclosure">
                <summary>
                  <span className="redline-meta">DEEP DIVE / KMEANS</span>
                  <strong>질문 군집별로 더 깊게 보기</strong>
                  <small>{filteredNodes.length}개 필터 결과의 기술 탐색 열기</small>
                </summary>
                <StoryAtlasClusterNavigator
                  nodes={filteredNodes}
                  topicBins={release.bundle.topicBins}
                  selectedTopicBinId={visualSelectedNode?.topicBinId ?? null}
                  onSelectNode={(nodeId) => updateQuery({ ...query, nodeId })}
                />
              </details>
              <StoryAtlasDossier
                node={selectedNode}
                onOpenEvidence={openEvidence}
                isEditorialAnchor={isSelectedEditorialAnchor}
                isExplicitSelection={Boolean(query.nodeId)}
                atlasNodeCount={allNodes.length}
                anchorCount={storyNodes.length}
              />
              {filteredNodes.length === 0 ? (
                <AtlasEmptyState
                  title="조건에 맞는 Story node가 없습니다"
                  description="승인된 140-node projection은 유지되며 선택한 상태와 유형의 교집합만 비어 있습니다."
                  onReset={reset}
                  testId="story-atlas-filter-empty-state"
                />
              ) : (
                <details className="story-atlas-technical-disclosure" data-testid="story-atlas-node-directory">
                  <summary>
                    <span className="redline-meta">ACCESSIBLE DIRECTORY / KEYBOARD</span>
                    <strong>전체 node 키보드 목록</strong>
                    <small>{filteredNodes.length}개 필터 결과의 접근 가능한 목록 열기</small>
                  </summary>
                  <div
                    aria-label="필터와 동기화된 접근 가능한 node 목록"
                    className="story-atlas-dom-mirror"
                    role="region"
                    tabIndex={0}
                  >
                    <AtlasDomMirror
                      nodes={filteredNodes}
                      selectedNodeId={visualSelectedNode?.id ?? null}
                      onSelectNode={(nodeId) => updateQuery({ ...query, nodeId })}
                      onClearSelection={() => updateQuery({ ...query, nodeId: null })}
                      onPreviewNode={setPreviewNodeId}
                      onFocusNode={setFocusNodeId}
                    />
                  </div>
                </details>
              )}
              <div className="flex flex-wrap gap-3 border-t border-[var(--line-medium)] pt-5">
                <Link className="atlas-action-primary" to={explorerHref}>현재 필터로 전체 답변행태 지도 보기</Link>
                <Link className="atlas-action-secondary" to="/method">투영 방법 확인</Link>
              </div>
            </section>
          ) : null}
        </div>

        <p className="redline-annotation-rule mt-8 max-w-3xl text-sm leading-relaxed text-[var(--ink-secondary)]">
          이 장면은 승인된 140개 node 전체 지형과 편집 계약으로 고정된 16개 anchor를 함께 보여줍니다. 더 깊은 비교·URL 공유·근거 추적은 Full Explorer에서 이어집니다.
        </p>
      </PageFrame>
    </ChapterFrame>
  );
}
