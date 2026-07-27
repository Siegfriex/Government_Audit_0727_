import { useEvidenceDetail } from '@/shared/api/atlas/useEvidenceDetail';
import { ANSWER_TYPE_SEMANTICS, BEHAVIOR_FAMILY_PRESENTATION } from '@/shared/config/atlas/atlasSemantics';
import type { AtlasNodeViewModel } from '@/shared/types/atlas';

const STATUS_LABELS: Record<AtlasNodeViewModel['status'], string> = {
  complete: '추진완료',
  active: '추진중',
  unresolved: '미완료·단절',
};

interface StoryAtlasDossierProps {
  node: AtlasNodeViewModel | null;
  onOpenEvidence: (evidenceId: string) => void;
  isEditorialAnchor: boolean;
  isExplicitSelection: boolean;
  atlasNodeCount: number;
  anchorCount: number;
}

export function StoryAtlasDossier({ node, onOpenEvidence, isEditorialAnchor, isExplicitSelection, atlasNodeCount, anchorCount }: StoryAtlasDossierProps) {
  const semantics = node ? ANSWER_TYPE_SEMANTICS[node.answerType] : null;
  const family = node ? BEHAVIOR_FAMILY_PRESENTATION[node.behaviorFamily] : null;
  const evidence = useEvidenceDetail(node?.representativeEvidenceId ?? null);
  return (
    <aside className="story-atlas-dossier" aria-label={isExplicitSelection ? 'Story 선택 node 요약' : 'Story 대표 node 맥락'} aria-live="polite">
      <p className="redline-meta text-[var(--signal-red-dark)]">
        {isExplicitSelection ? 'SELECTED CONTEXT' : 'FEATURED CONTEXT'} / STORY DEPTH
      </p>
      {!node ? (
        <div className="story-atlas-dossier__empty">
          <span aria-hidden="true">↳</span>
          <h3>한 점을 선택해 답변행태를 읽어보세요</h3>
          <p>위치는 주제, A1–A8 색은 답변행태, 크기는 정규화된 질량을 뜻합니다.</p>
          <dl>
            <div><dt>전체 지형</dt><dd>{atlasNodeCount} nodes</dd></div>
            <div><dt>편집 anchor</dt><dd>{anchorCount} nodes</dd></div>
          </dl>
        </div>
      ) : (
        <div className="story-atlas-dossier__selected" data-testid="story-selected-dossier">
          <header className="story-atlas-dossier__identity">
            <span>{node.answerType}</span>
            <div>
              <p>{isEditorialAnchor ? 'EDITORIAL ANCHOR · ' : ''}{family?.label}</p>
              <h3>{semantics?.name}</h3>
            </div>
            <p className="story-atlas-dossier__definition">{semantics?.definition}</p>
          </header>

          <div
            className="story-atlas-evidence-context"
            data-testid={evidence.status === 'ready' ? 'story-atlas-evidence-context' : undefined}
          >
            <section className="story-atlas-dossier__question" data-testid="story-atlas-question-context">
              <span>QUESTION CONTEXT / 이 답변을 끌어낸 질문</span>
              {evidence.status === 'ready' ? (
                <details className="story-atlas-dossier__question-disclosure">
                  <summary>
                    <span className="story-atlas-dossier__question-copy">{evidence.detail.questionText}</span>
                    <strong>
                      <span className="story-atlas-dossier__question-more">질문 전체 읽기</span>
                      <span className="story-atlas-dossier__question-less">질문 접기</span>
                    </strong>
                  </summary>
                </details>
              ) : (
                <p className="story-atlas-dossier__question-copy">{node.topicLabel ?? '검토된 질문 맥락 없음'}</p>
              )}
              {evidence.status === 'ready' ? <small>시정요구 맥락 · {evidence.detail.requestText}</small> : null}
            </section>

            <section
              aria-busy={evidence.status === 'loading'}
              className="story-atlas-dossier__answer"
              data-testid="story-atlas-answer-focus"
            >
              <span>AGENCY ANSWER / 대표 승인 답변</span>
              {evidence.status === 'loading' ? <p role="status">대표 답변을 불러오는 중입니다.</p> : null}
              {evidence.status === 'ready' ? <blockquote>{evidence.detail.answerText}</blockquote> : null}
              {evidence.status === 'unavailable' ? (
                <p role="status">이 aggregate node에는 공개 승인된 대표 답변이 연결되어 있지 않습니다. 질문 맥락과 통계는 표시하되 임시 답변을 대신 만들지 않습니다.</p>
              ) : null}
              {evidence.status === 'error' ? <p role="alert">승인 대표 답변을 불러오지 못했습니다: {evidence.error.message}</p> : null}
            </section>
          </div>

          <div className="story-atlas-dossier__details" data-testid="story-atlas-node-details">
            <div className="story-atlas-dossier__narrative">
              <blockquote className="story-atlas-dossier__topic">
                <span>TOPIC / CLUSTER CONTEXT</span>
                {node.topicLabel ?? '검토된 topic label 없음'}
              </blockquote>
              <p className="story-atlas-dossier__reading">
                위치는 승인 topic projection, 크기는 질량, red→blue 색은 A1–A8 유형입니다. 화면 거리 자체는 유사도 점수가 아닙니다.
              </p>
              {evidence.status === 'ready' ? (
                <p className="story-atlas-dossier__excerpt"><span>VERIFIED EXCERPT</span>{evidence.detail.excerpt}</p>
              ) : null}
            </div>
            <div className="story-atlas-dossier__facts">
              <dl className="story-atlas-dossier__metrics">
                <div><dt>처리상태</dt><dd>{STATUS_LABELS[node.status]}</dd></div>
                <div><dt>답변 수</dt><dd>{node.answerCount}건</dd></div>
                <div><dt>정규화 질량</dt><dd>{node.normalizedMass.toFixed(3)}</dd></div>
                <div><dt>신뢰도</dt><dd>{node.confidence === null ? '미제공' : node.confidence.toFixed(3)}</dd></div>
                <div><dt>node 내부 평균 유사도</dt><dd>{node.meanSimilarity === null ? '미제공' : node.meanSimilarity.toFixed(3)}</dd></div>
                <div><dt>표시 좌표</dt><dd>{node.display.x.toFixed(3)}, {node.display.y.toFixed(3)}</dd></div>
              </dl>
              <p className="story-atlas-dossier__similarity-note">평균 유사도는 node 내부 응집도이며 두 점 사이 화면 거리와 다른 값입니다.</p>
              <p className="story-atlas-dossier__id">{node.id}</p>
              {node.isPublicEvidenceAvailable && node.representativeEvidenceId ? (
                <button className="atlas-action-primary w-full" type="button" onClick={() => onOpenEvidence(node.representativeEvidenceId!)}>
                  대표 근거와 원문 보기
                </button>
              ) : (
                <p className="story-atlas-dossier__unavailable" role="status">공개 승인된 대표 근거가 연결되지 않은 node입니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
