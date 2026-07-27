import type { AnswerType, AtlasStatus } from '@/shared/types/atlas';

export interface AtlasFilteredSummary {
  nodeCount: number;
  totalNodeCount: number;
  answerCount: number;
  totalAnswerCount: number;
  linkCount: number;
  totalLinkCount: number;
  evidenceNodeCount: number;
  evidenceCoveragePercent: number;
}

interface AtlasHeaderSummaryProps {
  releaseId: string;
  projectionId: string;
  dataVersion: string;
  status: AtlasStatus;
  types: readonly AnswerType[];
  summary: AtlasFilteredSummary;
}

const STATUS_LABEL: Record<AtlasStatus, string> = {
  all: '전체 상태',
  complete: '추진완료',
  active: '추진중',
  unresolved: '미완료·단절',
};

export function AtlasHeaderSummary({
  releaseId,
  projectionId,
  dataVersion,
  status,
  types,
  summary,
}: AtlasHeaderSummaryProps) {
  return (
    <section className="atlas-header-summary" aria-labelledby="atlas-current-filter-heading">
      <div className="atlas-header-summary__identity">
        <p className="redline-meta">DATA VERSION / RELEASE / PROJECTION</p>
        <dl>
          <div><dt>Release</dt><dd>{releaseId}</dd></div>
          <div><dt>Projection</dt><dd>{projectionId}</dd></div>
          <div><dt>Data</dt><dd>{dataVersion}</dd></div>
        </dl>
      </div>
      <div className="atlas-header-summary__copy">
        <h2 id="atlas-current-filter-heading">현재 선택 조건</h2>
        <p>{STATUS_LABEL[status]}에서 A1–A8 중 {types.length}개 유형에 해당하는 승인 aggregate node를 표시합니다.</p>
      </div>
      <dl className="atlas-summary-metrics" aria-label="현재 필터 집계">
        <div><dt>노드</dt><dd>{summary.nodeCount}<span> / {summary.totalNodeCount}</span></dd></div>
        <div><dt>답변</dt><dd>{summary.answerCount}<span> / {summary.totalAnswerCount}</span></dd></div>
        <div><dt>연결 레코드</dt><dd>{summary.linkCount}<span> / {summary.totalLinkCount}</span></dd></div>
        <div><dt>대표 근거 보유 노드</dt><dd>{summary.evidenceCoveragePercent}%<span> · {summary.evidenceNodeCount}개</span></dd></div>
      </dl>
    </section>
  );
}
