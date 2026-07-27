import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Database,
  FileCheck2,
  FileText,
  GitBranch,
  KeyRound,
  Layers3,
  LockKeyhole,
  Network,
  ShieldCheck,
} from 'lucide-react';

import { useAtlasRelease } from '@/shared/api/atlas/useAtlasRelease';
import { PageFrame } from '@/shared/ui/PageFrame';
import {
  AtlasDataUnavailable,
  AtlasErrorState,
  AtlasLoadingState,
} from '@/shared/ui/atlas';

import './data-page.css';

type LayerTone = 'raw' | 'core' | 'semantic' | 'candidate' | 'gold' | 'analysis' | 'export';

type ContractEntity = {
  entity: string;
  layer: string;
  grain: string;
  primaryKey: string;
  foreignKeys: string;
  lifecycle: string;
  publicScope: string;
};

type FieldSpec = {
  field: string;
  type: string;
  required: string;
  rule: string;
};

const researchQuestions = [
  {
    id: 'RQ1',
    question: '피감기관은 질문에 어떤 방식으로 답했는가?',
    method: '질문–답변 관계를 복원한 뒤 승인된 A1–A8 행태 코드를 decision group 단위로 집계합니다.',
  },
  {
    id: 'RQ2',
    question: '답변의 약속은 공식 후속조치와 어떻게 연결되는가?',
    method: '답변과 시정·처리요구를 직접 연결할 수 있는 64개 승인 link만 근거 분석에 포함합니다.',
  },
  {
    id: 'RQ3',
    question: '“완료”라는 보고 상태는 원문 근거로 추적 가능한가?',
    method: '보고 상태와 별도로 verification status를 유지하고 PDF·페이지·파일 hash까지 역추적합니다.',
  },
  {
    id: 'RQ4',
    question: '주제 공간에서 답변 행태는 어떤 분포를 보이는가?',
    method: '761개 decision group을 하나의 고정 projection에 배치해 기술적으로 탐색하며, 2D 거리를 효과나 인과로 해석하지 않습니다.',
  },
];

const layers: Array<{
  number: string;
  name: string;
  path: string;
  description: string;
  tone: LayerTone;
}> = [
  { number: '00', name: 'Raw evidence', path: 'data/00_raw', description: 'PDF·XLSX·CSV 원본과 SHA-256 manifest. 수정하지 않는 증거층.', tone: 'raw' },
  { number: '10', name: 'Core', path: 'data/10_core', description: '회의·페이지·블록·발언·검색 구간. 원본 식별자를 보존하는 계산 SSOT.', tone: 'core' },
  { number: '20', name: 'Semantic', path: 'data/20_semantic', description: '화자, 질문–답변 쌍, 답변 단위, 문장과 weak behavior 후보.', tone: 'semantic' },
  { number: '30', name: 'Retrieval', path: 'data/30_retrieval', description: '지적사항과 답변의 검색 후보. 후보는 공개 사실로 취급하지 않음.', tone: 'candidate' },
  { number: '40', name: 'Gold review', path: 'data/40_review/gold', description: '검토·승인된 행태, target-answer link, 완료 검증과 공개 근거.', tone: 'gold' },
  { number: '50', name: 'Analysis', path: 'data/50_analysis', description: '승인 입력, projection point, topic bin, centroid, Atlas node.', tone: 'analysis' },
  { number: '90', name: 'Frontend export', path: 'data/90_exports/frontend/approved', description: 'manifest·hash 검증을 통과한 공개용 불변 bundle.', tone: 'export' },
];

const entities: ContractEntity[] = [
  { entity: 'meeting_registry', layer: '10 Core', grain: '회의 1건', primaryKey: 'meeting_id', foreignKeys: '—', lifecycle: 'AUTHORITATIVE', publicScope: '집계만' },
  { entity: 'pages', layer: '10 Core', grain: '물리 PDF 1쪽', primaryKey: 'page_no', foreignKeys: 'meeting_id, index_no', lifecycle: 'AUTHORITATIVE', publicScope: '근거 경로' },
  { entity: 'speaker_turns', layer: '10 Core', grain: '연속 화자 발언 1회', primaryKey: 'turn_no', foreignKeys: 'meeting_id, page_start/end_no', lifecycle: 'AUTHORITATIVE', publicScope: '승인 발췌만' },
  { entity: 'qa_pairs', layer: '20 Semantic', grain: '질문–답변 관계 1건', primaryKey: 'qa_pair_id', foreignKeys: 'question_turn_no, primary_answer_turn_no', lifecycle: 'AUTHORITATIVE', publicScope: '비공개' },
  { entity: 'answer_units', layer: '20 Semantic', grain: '기관 답변 1단위', primaryKey: 'answer_unit_id', foreignKeys: 'qa_pair_id, meeting_id, page_start/end_no', lifecycle: 'AUTHORITATIVE', publicScope: '승인 발췌만' },
  { entity: 'target_issues', layer: '30 Retrieval', grain: '정규화 지적사항 1건', primaryKey: 'target_issue_id', foreignKeys: 'target_raw_id, source_document_id', lifecycle: 'CANDIDATE', publicScope: '단독 공개 금지' },
  { entity: 'answer_behavior_label_groups_gold', layer: '40 Gold', grain: '승인 행태 결정 1그룹', primaryKey: 'gold_label_group_id', foreignKeys: 'answer_unit_id, qa_pair_id, review_row_id', lifecycle: 'APPROVED', publicScope: '집계·Atlas' },
  { entity: 'target_answer_links', layer: '40 Gold', grain: '승인 지적–답변 연결 1건', primaryKey: 'target_answer_link_id', foreignKeys: 'target_issue_id, qa_pair_id, answer_unit_id', lifecycle: 'APPROVED', publicScope: '근거 승인 시' },
  { entity: 'evidence_records', layer: '40 Gold', grain: '공개 승인 근거 1건', primaryKey: 'evidence_id', foreignKeys: 'target_answer_link_id, meeting_id, page_start/end_no', lifecycle: 'APPROVED', publicScope: '공개 가능' },
  { entity: 'projection_points', layer: '50 Analysis', grain: 'projection 내 entity 1점', primaryKey: 'projection_id + entity_type + entity_id', foreignKeys: 'topic_bin_id', lifecycle: 'APPROVED', publicScope: '좌표 파생값' },
  { entity: 'atlas_nodes', layer: '50 Analysis', grain: '상태×주제×행태 집계 1노드', primaryKey: 'atlas_node_id', foreignKeys: 'projection_id, topic_bin_id', lifecycle: 'APPROVED', publicScope: '공개' },
  { entity: 'frontend_manifest', layer: '90 Export', grain: 'bundle 파일 등록 1건', primaryKey: 'bundle_id', foreignKeys: 'release_id, projection_id, pipeline_run_id', lifecycle: 'APPROVED_EXPORT', publicScope: '공개' },
];

const sourceFields: FieldSpec[] = [
  { field: 'meeting_id', type: 'string', required: 'YES', rule: '회의 PK. 원본 식별자를 보존하며 숫자로 변환하지 않음.' },
  { field: 'page_start_no / page_end_no', type: 'string', required: 'CONTEXTUAL', rule: 'Core pages.page_no를 참조하는 잠긴 FK.' },
  { field: 'pdf_asset_id', type: 'string', required: 'YES', rule: '공개 근거가 참조하는 원본 PDF 자산 식별자.' },
  { field: 'source_pdf_sha256', type: 'sha256', required: 'DETAIL', rule: '소문자 64자리 hex. 원본 파일 무결성 검증.' },
];

const evidenceFields: FieldSpec[] = [
  { field: 'evidence_id', type: 'string', required: 'YES', rule: '공개 근거의 전역 PK.' },
  { field: 'reported_status', type: 'string | null', required: 'SUMMARY', rule: '기관이 보고한 상태. 검증 결론과 혼합하지 않음.' },
  { field: 'verification_status', type: 'string | null', required: 'SUMMARY', rule: '별도 검증 결과. reported_status를 덮어쓰지 않음.' },
  { field: 'request/question/answer_text', type: 'string', required: 'DETAIL', rule: '승인된 공개 발췌만 허용. 후보·비공개 검토 메모 제외.' },
  { field: 'public_visibility', type: 'literal true', required: 'YES', rule: 'false 또는 누락 레코드는 public bundle 진입 금지.' },
];

const atlasFields: FieldSpec[] = [
  { field: 'atlas_node_id', type: 'string', required: 'YES', rule: '집계 노드 PK. 원 답변 식별자로 사용하지 않음.' },
  { field: 'status_canvas', type: 'complete | active | unresolved', required: 'YES', rule: 'Atlas 필터용 잠긴 도메인.' },
  { field: 'answer_type_code', type: 'A1 … A8', required: 'YES', rule: '승인된 primary behavior code.' },
  { field: 'anchor_x/y · display_x/y', type: 'finite number', required: 'YES', rule: 'anchor는 감사용, display는 충돌 조정 표시용. 필터로 재계산 금지.' },
  { field: 'raw_answer_count / raw_link_count', type: 'integer ≥ 0', required: 'YES', rule: '노드가 대표하는 승인 개수. 반지름과 동일한 값이 아님.' },
  { field: 'normalized_mass', type: 'number [0,1]', required: 'YES', rule: '시각 인코딩용 정규화 질량.' },
  { field: 'representative_evidence_id', type: 'string | null', required: 'NO', rule: '공개 승인 근거가 있을 때만 연결.' },
];

const resources = [
  { resource: 'current-release.json', role: '현재 승인 릴리스 포인터', contract: 'release_id, manifest_path, manifest_sha256, projection_id/hash', policy: 'no-store · 선택 포인터' },
  { resource: 'frontend-manifest.json', role: 'bundle 파일 명세', contract: '파일별 path, format, row_count, size_bytes, sha256, cache_policy', policy: 'manifest 검증 후 로드' },
  { resource: 'atlas-summary.json', role: '공개 모집단 요약', contract: 'release/projection identity, node count, story preview IDs', policy: 'immutable' },
  { resource: 'atlas-nodes-all.json', role: 'Atlas aggregate nodes', contract: '140 nodes · 좌표·행태·상태·질량·근거 FK', policy: 'immutable' },
  { resource: 'atlas-topic-bins.json', role: '주제 bin', contract: '24 bins · 중심·member count·대표 target', policy: 'immutable' },
  { resource: 'evidence-index.json', role: '공개 근거 요약', contract: '64 approved summaries · route-safe metadata', policy: 'immutable' },
  { resource: 'evidence/<evidence_id>.json', role: '근거 상세', contract: '요구·질문·답변·발췌·PDF/page/hash lineage', policy: '요청 시 로드 · immutable' },
  { resource: 'projection-meta.json', role: '좌표계 잠금', contract: 'projection_id/hash, bounds, fit_scope=all_statuses', policy: '필터와 무관하게 고정' },
];

const gates = [
  { gate: 'RAW_HASH_PASS', test: '원본과 복사본 SHA-256, 파일 수, PDF page count', failure: '수집·구조화 중단' },
  { gate: 'CORE_EQUIVALENCE_PASS', test: 'row·PK·FK·텍스트 hash·SQLite/Parquet 등가성', failure: 'Semantic 진입 금지' },
  { gate: 'SEMANTIC_BASELINE_EQUIVALENCE_PASS', test: '질문·답변·발언 연결 수, 식별자·텍스트 불변성', failure: '후보 탐색 금지' },
  { gate: 'BEHAVIOR_GOLD_PASS', test: '761 decision groups, 769 labels, 코드·결정 계보', failure: '승인 행태 집계 금지' },
  { gate: 'FULL_GOLD_LABELING_PASS', test: 'target link·완료 검증·공개 eligibility·evidence PK/FK', failure: '공개 근거 생성 금지' },
  { gate: 'APPROVED_ANALYSIS_INPUT_PASS', test: 'projection grain·텍스트 누출·Gold hash·제외 사유', failure: 'projection 실행 금지' },
  { gate: 'PROJECTION_INSTANCE_PASS', test: 'fit scope, seed, parameter, point count, projection hash', failure: 'Atlas 생성 금지' },
  { gate: 'APPROVED_FRONTEND_BUNDLE_PASS', test: 'manifest schema·파일 hash/size/count·공개 범위·runtime copy', failure: 'DataUnavailable · fixture fallback 금지' },
];

const contractEnvelope = {
  contract_version: '1.0',
  project: '문체위 국정감사 6년',
  research_period: { from: 2020, to: 2025, timezone: 'Asia/Seoul' },
  source_corpus: {
    meeting_minutes: { files: 42, pages: 4495 },
    result_reports: { files: 3, years: [2020, 2022, 2024], pages: 496 },
    registry_files: 1,
    target_marker_files: 3,
  },
  approved_populations: {
    answer_units: 26063,
    behavior_decision_groups: 761,
    behavior_labels: 769,
    target_answer_links: 64,
    public_evidence_records: 64,
    atlas_nodes: 140,
    topic_bins: 24,
  },
  identity_policy: 'all identifiers are strings; source IDs are never integer-cast',
  public_policy: 'approved manifest only; candidate, provisional, private review data and fixtures are excluded',
  unavailable_policy: 'APPROVED_FRONTEND_BUNDLE_ABSENT => DataUnavailable; no fallback',
  status_policy: 'reported_status and verification_status remain independent',
  projection_policy: 'coordinates are immutable across filters; no browser embedding, aggregation, jitter or force layout',
};

const atlasNodeViewModel = `interface AtlasNodeViewModel {
  id: string;
  projectionId: string;
  topicBinId: string;
  topicLabel: string | null;
  status: 'complete' | 'active' | 'unresolved';
  answerType: 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8';
  behaviorFamily: 'information_non_direct' | 'deferral_procedural' | 'action_evidence';
  anchor: { x: number; y: number };   // audit coordinate
  display: { x: number; y: number };  // upstream collision-adjusted
  screen: { x: number; y: number };   // viewport-only scale
  radiusPx: number;
  normalizedMass: number;
  answerCount: number;
  linkCount: number;
  confidence: number | null;
  representativeEvidenceId: string | null;
  isPublicEvidenceAvailable: boolean;
}`;

const evidenceViewModel = `interface EvidenceDetailViewModel {
  id: string;
  title: string;
  requestText: string;
  questionText: string;
  answerText: string;
  excerpt: string;
  reportedStatus: string;      // institution-reported
  verificationStatus: string;  // independently recorded
  meetingId: string;
  pageStartNo: string;
  pageEndNo: string;
  pdfAssetId: string;
  sourcePdfSha256: string;
  pipelineRunId: string;
  publicVisibility: true;
}`;

const releaseViewModel = `type DataReleaseViewModel =
  | { status: 'loading' }
  | { status: 'unavailable'; reason: 'APPROVED_FRONTEND_BUNDLE_ABSENT' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      source: 'pointer' | 'env';
      releaseId: string;
      projectionId: string;
      projectionHash: string;
      nodeCount: number;
      topicBinCount: number;
      publicEvidenceCount: number;
    };`;

function SectionHeading({ index, eyebrow, title, lead }: { index: string; eyebrow: string; title: string; lead: string }) {
  return (
    <header className="data-section-heading">
      <span className="data-section-heading__index" aria-hidden="true">{index}</span>
      <div>
        <p className="data-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{lead}</p>
      </div>
    </header>
  );
}

function TableRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="data-table-region" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}

function FieldTable({ title, eyebrow, fields }: { title: string; eyebrow: string; fields: FieldSpec[] }) {
  return (
    <article className="data-field-card">
      <header>
        <p className="data-eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </header>
      <TableRegion label={`${title} 필드 명세`}>
        <table className="data-compact-table">
          <thead><tr><th>field</th><th>type</th><th>required</th><th>계약 규칙</th></tr></thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.field}>
                <td><code>{field.field}</code></td>
                <td><code>{field.type}</code></td>
                <td>{field.required}</td>
                <td>{field.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableRegion>
    </article>
  );
}

function CodeContract({ label, code }: { label: string; code: string }) {
  return (
    <article className="data-code-card">
      <div className="data-code-card__bar">
        <span>{label}</span>
        <span>TypeScript · UI contract</span>
      </div>
      <pre tabIndex={0} aria-label={`${label} TypeScript 명세`}><code>{code}</code></pre>
    </article>
  );
}

function ReleaseStatusPanel() {
  const release = useAtlasRelease();

  if (release.status === 'loading') {
    return <AtlasLoadingState title="공개 릴리스 계약을 확인하고 있습니다" description="현재 포인터, manifest, 파일 hash와 runtime schema를 검증합니다." testId="data-release-loading" />;
  }

  if (release.status === 'unavailable') {
    return (
      <AtlasDataUnavailable
        title="공개 승인 릴리스가 없습니다"
        description="연구·스키마 명세는 공개하지만 승인되지 않은 후보 데이터나 fixture는 표본으로 대신 표시하지 않습니다."
        reason={release.reason}
        testId="data-release-unavailable"
      />
    );
  }

  if (release.status === 'error') {
    return (
      <AtlasErrorState
        title="공개 릴리스의 무결성을 확인하지 못했습니다"
        description="계약 불일치 또는 파일 검증 실패 시 데이터 표시를 중단합니다."
        technicalDetail={release.error.message}
        onRetry={release.retry}
        testId="data-release-error"
      />
    );
  }

  const answerCount = release.bundle.nodes.reduce((sum, node) => sum + node.answerCount, 0);
  return (
    <section className="data-release-ready" data-testid="data-release-ready" aria-labelledby="release-ready-title">
      <div className="data-release-ready__signal" aria-hidden="true"><CheckCircle2 /></div>
      <div className="data-release-ready__body">
        <p className="data-eyebrow">APPROVED RELEASE · RUNTIME VERIFIED</p>
        <h3 id="release-ready-title">승인 bundle을 사용 중입니다</h3>
        <p>포인터에서 manifest를 찾고, 필수 JSON의 SHA-256과 schema를 확인한 뒤 ViewModel로 변환했습니다.</p>
        <dl className="data-release-metrics">
          <div><dt>decision groups</dt><dd>{answerCount.toLocaleString('ko-KR')}</dd></div>
          <div><dt>atlas nodes</dt><dd>{release.bundle.nodes.length.toLocaleString('ko-KR')}</dd></div>
          <div><dt>topic bins</dt><dd>{release.bundle.topicBins.length.toLocaleString('ko-KR')}</dd></div>
          <div><dt>public evidence</dt><dd>{release.bundle.evidence.length.toLocaleString('ko-KR')}</dd></div>
        </dl>
        <div className="data-release-identifiers">
          <p><span>release</span><code>{release.bundle.releaseId}</code></p>
          <p><span>projection</span><code>{release.bundle.projectionId}</code></p>
          <p><span>source</span><code>{release.source}</code></p>
        </div>
      </div>
    </section>
  );
}

export const DataPage: React.FC = () => {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (copyState === 'idle') return;
    const timeout = window.setTimeout(() => setCopyState('idle'), 2500);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const handleCopyContract = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(contractEnvelope, null, 2));
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  };

  return (
    <main id="main-content" className="data-page" tabIndex={-1}>
      <PageFrame>
        <header className="data-hero">
          <div className="data-hero__kicker">
            <span>DATA CONTRACT</span>
            <span>VERSION 1.0</span>
            <span>2020—2025</span>
          </div>
          <div className="data-hero__grid">
            <div className="data-hero__copy">
              <p className="data-eyebrow">문체위 국정감사 6년 · 연구 및 공개 명세서</p>
              <h1>데이터가 무엇을 말하고,<br /><em>어디까지 말할 수 있는가</em></h1>
              <p className="data-hero__dek">
                42개 회의록의 원문부터 질문–답변 관계, 승인된 답변 행태, 시정요구 연결, 공개 근거와 Atlas 좌표까지.
                이 페이지는 분석 단위와 식별자, 변환 규칙, 공개 경계, 실패 조건을 재현 가능한 계약으로 고정합니다.
              </p>
            </div>
            <aside className="data-hero__scope" aria-label="연구 범위 요약">
              <p className="data-hero__scope-label">RESEARCH SCOPE</p>
              <dl>
                <div><dt>기간</dt><dd>2020–2025</dd></div>
                <div><dt>위원회</dt><dd>국회 문화체육관광위원회</dd></div>
                <div><dt>회의록</dt><dd>42건 · 4,495쪽</dd></div>
                <div><dt>답변 단위</dt><dd>26,063건</dd></div>
                <div><dt>Gold 모집단</dt><dd>761 decision groups</dd></div>
                <div><dt>공개 근거</dt><dd>64 approved records</dd></div>
              </dl>
            </aside>
          </div>
          <div className="data-hero__footer">
            <div className="data-hero__principle"><LockKeyhole aria-hidden="true" /><span>식별자 보존</span></div>
            <div className="data-hero__principle"><GitBranch aria-hidden="true" /><span>PDF/page 계보</span></div>
            <div className="data-hero__principle"><ShieldCheck aria-hidden="true" /><span>승인 데이터만 공개</span></div>
            <button type="button" className="data-copy-button" onClick={handleCopyContract}>
              {copyState === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copyState === 'copied' ? 'JSON 계약 복사됨' : copyState === 'error' ? '복사 실패 · 다시 시도' : '핵심 JSON 계약 복사'}
            </button>
            <span className="sr-only" aria-live="polite">{copyState === 'copied' ? '핵심 데이터 계약을 클립보드에 복사했습니다.' : copyState === 'error' ? '클립보드 복사에 실패했습니다.' : ''}</span>
          </div>
        </header>

        <nav className="data-jump-nav" aria-label="데이터 명세 목차">
          <a href="#research-spec">01 연구 명세</a>
          <a href="#lineage">02 계보</a>
          <a href="#entity-schema">03 엔터티</a>
          <a href="#field-schema">04 필드</a>
          <a href="#view-models">05 ViewModel</a>
          <a href="#runtime-contract">06 런타임</a>
          <a href="#quality-gates">07 검증</a>
        </nav>

        <section className="data-section" id="research-spec">
          <SectionHeading
            index="01"
            eyebrow="RESEARCH SPECIFICATION"
            title="연구 질문과 분석 경계"
            lead="이 프로젝트는 답변 문장의 빈도를 세는 작업이 아니라, 질문–답변–지적사항–후속조치–공개 근거의 연결을 검증하는 기록 연구입니다."
          />
          <div className="data-rq-grid">
            {researchQuestions.map((item) => (
              <article key={item.id} className="data-rq-card">
                <span>{item.id}</span>
                <h3>{item.question}</h3>
                <p>{item.method}</p>
              </article>
            ))}
          </div>
          <div className="data-boundary-grid">
            <article>
              <div className="data-icon-title"><CheckCircle2 aria-hidden="true" /><h3>포함</h3></div>
              <ul>
                <li>2020–2025년 문체위 국정감사 회의록 42건의 발언 원문</li>
                <li>질문자와 기관 답변자의 역할이 구조적으로 연결된 QA/answer unit</li>
                <li>승인 계보가 있는 761개 behavior decision group과 769개 label</li>
                <li>동일 지적사항 연결이 승인된 64개 target-answer link와 공개 evidence</li>
              </ul>
            </article>
            <article>
              <div className="data-icon-title"><AlertTriangle aria-hidden="true" /><h3>제외·비추론</h3></div>
              <ul>
                <li>weak label, 검색 후보, provisional 분석물, 비공개 검토 메모</li>
                <li>회의록에 없는 의도·진실성·정책 효과·인과관계의 추정</li>
                <li>공식 “완료” 상태를 실제 이행 완료로 자동 치환하는 해석</li>
                <li>2D Atlas 거리·군집을 통계적 유의성이나 유사도 점수로 읽는 해석</li>
              </ul>
            </article>
          </div>
          <div className="data-unit-callout">
            <KeyRound aria-hidden="true" />
            <div>
              <p className="data-eyebrow">UNIT OF ANALYSIS</p>
              <p><strong>행태 지도:</strong> 승인된 답변 행태 decision group 1개 = 점 1개. <strong>근거 분석:</strong> 승인된 target-answer link 1개 = entity 1개. secondary label은 속성이며 점을 복제하지 않습니다.</p>
            </div>
          </div>
        </section>

        <section className="data-section" id="lineage">
          <SectionHeading
            index="02"
            eyebrow="LINEAGE & LIFECYCLE"
            title="원본에서 공개 화면까지"
            lead="각 층은 앞 단계의 승인을 소비합니다. CANDIDATE는 Gold가 아니며, Gold는 곧바로 공개 bundle을 뜻하지 않습니다."
          />
          <ol className="data-layer-list">
            {layers.map((layer, index) => (
              <li key={layer.number} className={`data-layer data-layer--${layer.tone}`}>
                <div className="data-layer__number">{layer.number}</div>
                <div className="data-layer__body">
                  <div><h3>{layer.name}</h3><code>{layer.path}</code></div>
                  <p>{layer.description}</p>
                </div>
                {index < layers.length - 1 ? <ArrowRight className="data-layer__arrow" aria-hidden="true" /> : null}
              </li>
            ))}
          </ol>
          <div className="data-rule-strip">
            <FileCheck2 aria-hidden="true" />
            <p><strong>승격 규칙 · copy-on-validate</strong><span>임시 run에서 생성 → schema/hash/PK/FK 검증 → 통과한 버전만 다음 lifecycle 디렉터리에 게시. 실패한 run은 기존 승인 데이터를 덮어쓰지 않습니다.</span></p>
          </div>
        </section>

        <section className="data-section" id="entity-schema">
          <SectionHeading
            index="03"
            eyebrow="CANONICAL ENTITY SCHEMA"
            title="핵심 엔터티 계약"
            lead="grain은 한 행이 무엇을 뜻하는지 고정합니다. PK와 FK를 잃은 파생 데이터는 공개 릴리스로 승격할 수 없습니다."
          />
          <TableRegion label="핵심 엔터티 계약 표">
            <table className="data-schema-table">
              <thead>
                <tr><th>entity</th><th>layer</th><th>grain</th><th>primary key</th><th>foreign keys</th><th>lifecycle</th><th>public scope</th></tr>
              </thead>
              <tbody>
                {entities.map((entity) => (
                  <tr key={entity.entity}>
                    <td><code>{entity.entity}</code></td>
                    <td>{entity.layer}</td>
                    <td>{entity.grain}</td>
                    <td><code>{entity.primaryKey}</code></td>
                    <td><code>{entity.foreignKeys}</code></td>
                    <td><span className={`data-lifecycle data-lifecycle--${entity.lifecycle.toLowerCase().replace('_', '-')}`}>{entity.lifecycle}</span></td>
                    <td>{entity.publicScope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableRegion>
          <p className="data-table-note"><Database aria-hidden="true" /> 전체 물리 계약의 권위는 P3_FINAL <code>ENTITY_REGISTRY.csv</code>와 <code>COLUMN_DICTIONARY.csv</code>입니다. 이 표는 공개 화면이 소비하는 핵심 경로를 요약합니다.</p>
        </section>

        <section className="data-section" id="field-schema">
          <SectionHeading
            index="04"
            eyebrow="FIELD DICTIONARY"
            title="필드·타입·불변조건"
            lead="화면에 같은 문자열로 보여도 보고 상태와 검증 상태, 원 좌표와 표시 좌표는 서로 다른 의미를 가집니다."
          />
          <div className="data-field-stack">
            <FieldTable eyebrow="SOURCE & IDENTITY" title="원문 계보" fields={sourceFields} />
            <FieldTable eyebrow="PUBLIC EVIDENCE" title="공개 근거" fields={evidenceFields} />
            <FieldTable eyebrow="ATLAS TRANSPORT" title="집계 노드" fields={atlasFields} />
          </div>
          <div className="data-invariant-grid">
            <article><LockKeyhole aria-hidden="true" /><h3>ID는 모두 문자열</h3><p>leading zero와 복합 인코딩을 보존합니다. CSV·JSON 소비자가 임의로 integer cast하면 계약 위반입니다.</p></article>
            <article><Network aria-hidden="true" /><h3>좌표는 필터 불변</h3><p>필터는 visibility만 바꿉니다. 브라우저에서 embedding, aggregation, force layout, random jitter를 다시 수행하지 않습니다.</p></article>
            <article><ShieldCheck aria-hidden="true" /><h3>공개 여부는 독립 통제</h3><p>분석 포함과 공개 evidence eligibility는 별도 값입니다. 분석에 쓰였다는 이유만으로 원문을 공개하지 않습니다.</p></article>
          </div>
        </section>

        <section className="data-section" id="view-models">
          <SectionHeading
            index="05"
            eyebrow="UI VIEW MODEL"
            title="전송 스키마와 화면 모델의 분리"
            lead="JSON의 snake_case transport를 직접 렌더링하지 않습니다. 런타임 검증 후 의미가 명시된 camelCase ViewModel로 변환하며 색·도형 같은 시각 토큰은 adapter/config 층에서만 부여합니다."
          />
          <div className="data-adapter-flow" aria-label="Transport에서 ViewModel까지의 변환 흐름">
            <div><FileText aria-hidden="true" /><span>JSON transport</span><small>snake_case · untrusted input</small></div>
            <ArrowRight aria-hidden="true" />
            <div><ShieldCheck aria-hidden="true" /><span>runtime schema</span><small>type · domain · hash · FK</small></div>
            <ArrowRight aria-hidden="true" />
            <div><Layers3 aria-hidden="true" /><span>adapter</span><small>semantic mapping · tokens</small></div>
            <ArrowRight aria-hidden="true" />
            <div><Network aria-hidden="true" /><span>UI ViewModel</span><small>render-safe · explicit null</small></div>
          </div>
          <div className="data-code-stack">
            <CodeContract label="AtlasNodeViewModel" code={atlasNodeViewModel} />
            <CodeContract label="EvidenceDetailViewModel" code={evidenceViewModel} />
            <CodeContract label="DataReleaseViewModel" code={releaseViewModel} />
          </div>
        </section>

        <section className="data-section" id="runtime-contract">
          <SectionHeading
            index="06"
            eyebrow="RUNTIME & PUBLICATION CONTRACT"
            title="브라우저가 읽는 공개 bundle"
            lead="공개 화면은 현재 포인터 하나에서 시작해 승인 manifest가 등록한 파일만 읽습니다. 경로 추측이나 legacy 폴더 fallback은 허용하지 않습니다."
          />
          <ReleaseStatusPanel />
          <TableRegion label="프론트엔드 런타임 리소스 계약 표">
            <table className="data-resource-table">
              <thead><tr><th>resource</th><th>역할</th><th>핵심 계약</th><th>load/cache 정책</th></tr></thead>
              <tbody>
                {resources.map((item) => (
                  <tr key={item.resource}><td><code>{item.resource}</code></td><td>{item.role}</td><td>{item.contract}</td><td>{item.policy}</td></tr>
                ))}
              </tbody>
            </table>
          </TableRegion>
          <div className="data-state-contract">
            <article><span className="data-state-contract__code">READY</span><h3>검증 후 표시</h3><p>manifest identity, SHA-256, schema, projection identity가 모두 일치할 때만 ViewModel을 생성합니다.</p></article>
            <article><span className="data-state-contract__code">UNAVAILABLE</span><h3>없으면 명시</h3><p>승인 포인터나 bundle이 없으면 DataUnavailable을 표시합니다. mock·fixture·legacy data로 대체하지 않습니다.</p></article>
            <article><span className="data-state-contract__code">ERROR</span><h3>틀리면 중단</h3><p>파일 hash, 필수 필드, 도메인, projection이 다르면 기술 오류를 기록하고 데이터 렌더링을 중단합니다.</p></article>
          </div>
        </section>

        <section className="data-section" id="quality-gates">
          <SectionHeading
            index="07"
            eyebrow="QUALITY GATES"
            title="통과해야 다음 단계로 간다"
            lead="‘파일이 존재한다’와 ‘분석·공개가 승인됐다’를 구분합니다. 각 Gate는 허용 범위가 다르며 하위 단계 PASS가 상위 공개 승인을 대신하지 않습니다."
          />
          <div className="data-gate-list">
            {gates.map((item, index) => (
              <article key={item.gate}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h3><code>{item.gate}</code></h3><p>{item.test}</p></div>
                <div className="data-gate-list__failure"><small>FAIL ACTION</small><strong>{item.failure}</strong></div>
              </article>
            ))}
          </div>
        </section>

        <section className="data-limitations" aria-labelledby="limitations-title">
          <div>
            <p className="data-eyebrow">INTERPRETATION LIMITS</p>
            <h2 id="limitations-title">이 데이터가 답하지 않는 것</h2>
          </div>
          <div className="data-limitations__body">
            <p>회의록은 공식 기록이지만 모든 비언어적 맥락과 비공개 협의를 담지 않습니다. 행태 코드는 답변의 담화적 형식을 기술하며 사람의 의도나 진실성을 판정하지 않습니다.</p>
            <p>2020·2022·2024년 처리결과 자료와 직접 연결된 64건은 검증 가능한 근거 모집단이지, 6년 전체 질문의 정책 이행률을 대표하는 확률표본이 아닙니다.</p>
            <p>Atlas는 탐색 도구입니다. 2D 위치와 노드 크기는 고정된 파생 모델의 표현이며, 원문·승인 결정·PDF 계보를 대신하는 증거가 아닙니다.</p>
          </div>
        </section>

        <footer className="data-page-footer">
          <div><span>CONTRACT</span><strong>P3_CULTURE · DATA v1.0</strong></div>
          <div><span>AUTHORITY</span><strong>P3_FINAL SSOT / approved manifest</strong></div>
          <div><span>UPDATED</span><strong>2026.07.24 · Asia/Seoul</strong></div>
          <div className="data-page-footer__actions">
            <Link to="/method">방법론 읽기 <ArrowRight aria-hidden="true" /></Link>
            <Link to="/atlas">승인 Atlas 열기 <ArrowRight aria-hidden="true" /></Link>
          </div>
        </footer>
      </PageFrame>
    </main>
  );
};
