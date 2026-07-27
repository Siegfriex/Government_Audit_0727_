import { useEffect, useState } from 'react';

import { ANSWER_TYPE_SEMANTICS, BEHAVIOR_FAMILY_PRESENTATION } from '@/shared/config/atlas/atlasSemantics';
import { useDetailNavigation } from '@/shared/hooks/useDetailNavigation';
import type {
  AtlasNodeViewModel,
  EvidenceDetailViewModel,
  EvidenceRepository,
  EvidenceSummaryViewModel,
} from '@/shared/types/atlas';
import { EvidenceProvenanceGraph } from './EvidenceProvenanceGraph';

interface AtlasEvidenceDossierProps {
  node: AtlasNodeViewModel | null;
  evidenceSummary: EvidenceSummaryViewModel | null;
  evidenceRepository: EvidenceRepository;
  mode?: 'inspector' | 'full';
}

type DetailState =
  | { evidenceId: string; status: 'ready'; detail: EvidenceDetailViewModel }
  | { evidenceId: string; status: 'error'; detail: null };

const STATUS_LABEL = {
  complete: '추진완료',
  active: '추진중',
  unresolved: '미완료·단절',
} as const;

export function AtlasEvidenceDossier({
  node,
  evidenceSummary,
  evidenceRepository,
  mode = 'inspector',
}: AtlasEvidenceDossierProps) {
  const { openEvidence } = useDetailNavigation();
  const [loadedDetail, setLoadedDetail] = useState<DetailState | null>(null);
  const evidenceId = node?.representativeEvidenceId ?? null;

  useEffect(() => {
    if (!evidenceId || !evidenceSummary) {
      return;
    }
    const controller = new AbortController();
    void evidenceRepository.getDetail(evidenceId, controller.signal)
      .then((detail) => {
        if (!controller.signal.aborted) setLoadedDetail({ evidenceId, status: 'ready', detail });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadedDetail({ evidenceId, status: 'error', detail: null });
      });
    return () => controller.abort();
  }, [evidenceId, evidenceRepository, evidenceSummary]);

  if (!node) {
    return (
      <section className="atlas-dossier atlas-dossier--empty" aria-label="Evidence dossier">
        <p className="redline-meta">EVIDENCE DOSSIER / 00</p>
        <h2>node를 선택해 근거 계보를 여십시오</h2>
        <p>지도와 접근 가능한 node 목록에서 하나를 선택하면 답변행태, 비교 지표, 원문과 PDF/page 계보가 표시됩니다.</p>
      </section>
    );
  }

  const semantics = ANSWER_TYPE_SEMANTICS[node.answerType];
  const detailState = !evidenceId || !evidenceSummary
    ? 'idle'
    : loadedDetail?.evidenceId === evidenceId
      ? loadedDetail.status
      : 'loading';
  const detail = loadedDetail?.evidenceId === evidenceId && loadedDetail.status === 'ready'
    ? loadedDetail.detail
    : null;
  return (
    <section className={`atlas-dossier atlas-dossier--${mode}`} aria-labelledby="atlas-dossier-heading" data-testid="atlas-evidence-dossier">
      <header className="atlas-dossier__identity">
        <p className="redline-meta">EVIDENCE DOSSIER / {node.answerType} / {STATUS_LABEL[node.status]}</p>
        <p>{semantics.name} · {BEHAVIOR_FAMILY_PRESENTATION[node.behaviorFamily].label}</p>
      </header>

      <section className="atlas-dossier__source atlas-dossier__source--lead" aria-labelledby="atlas-dossier-heading">
        <p className="redline-meta">ORIGINAL RECORD / 원문 기록</p>
        <h2 id="atlas-dossier-heading">대표 답변</h2>
        {detailState === 'loading' ? <p role="status">승인된 대표 답변을 불러오는 중입니다.</p> : null}
        {detailState === 'error' ? <p role="status">승인된 대표 답변을 불러오지 못했습니다. 요약 계보만 표시합니다.</p> : null}
        {detail ? (
          <>
            <blockquote className="atlas-dossier__answer"><p>{detail.answerText}</p></blockquote>
            <div className="atlas-dossier__question-context">
              <strong>이 답변을 끌어낸 질문</strong>
              <p>{detail.questionText}</p>
            </div>
          </>
        ) : null}
        {!evidenceSummary ? (
          <div className="atlas-dossier__source-unavailable" role="status">
            <strong>대표 답변 원문 미제공</strong>
            <p>node 선택은 정상입니다. 이 aggregate에는 공개 승인된 대표 Evidence가 연결되지 않아 답변 문장을 표시할 수 없습니다.</p>
          </div>
        ) : null}
      </section>

      <section className="atlas-dossier__context" aria-labelledby="atlas-topic-context-heading">
        <h3 id="atlas-topic-context-heading">질문·주제 맥락</h3>
        <p>{node.topicLabel ?? '승인된 주제 라벨이 제공되지 않았습니다.'}</p>
      </section>

      <section className="atlas-dossier__definition" aria-labelledby="atlas-behavior-definition-heading">
        <h3 id="atlas-behavior-definition-heading">행태 정의</h3>
        <p>{semantics.definition}</p>
      </section>

      <dl className="atlas-dossier__metrics" aria-label="선택 node 지표">
        <div><dt>답변 수</dt><dd>{node.answerCount}건</dd></div>
        <div><dt>승인 link 수</dt><dd>{node.linkCount}건</dd></div>
        <div><dt>정규화 질량 지수</dt><dd>{(node.normalizedMass * 100).toFixed(1)}<span> / 100</span></dd></div>
        <div><dt>평균 신뢰도</dt><dd>{node.confidence === null ? '미제공' : `${(node.confidence * 100).toFixed(0)} / 100`}</dd></div>
      </dl>
      <p className="atlas-dossier__metric-note">질량 지수는 upstream의 0–1 정규화 값이며 전체 질량 점유율이나 정책 성과 순위가 아닙니다.</p>

      <section className="atlas-dossier__relations" aria-labelledby="atlas-dossier-relations-heading">
        <h3 id="atlas-dossier-relations-heading">관계</h3>
        <p><strong>RELATION_DATA_BLOCKED</strong> · 현재 release에는 감사 가능한 node-to-node 관계 엔터티가 없습니다.</p>
      </section>

      <section className="atlas-dossier__provenance" aria-labelledby="atlas-provenance-heading">
        <h3 id="atlas-provenance-heading">근거 계보</h3>
        <EvidenceProvenanceGraph node={node} summary={evidenceSummary} detail={detail} />
      </section>

      {evidenceSummary ? (
        <button type="button" className="atlas-action-primary w-full" aria-label="승인된 대표 증거 보기" onClick={() => openEvidence(evidenceSummary.id)}>
          Evidence 원문·PDF 위치 검증
        </button>
      ) : null}
    </section>
  );
}
