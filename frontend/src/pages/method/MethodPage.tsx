import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCircle2,
  Database,
  FileCheck2,
  FileSearch,
  GitBranch,
  History,
  Layers3,
  Link2,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from 'lucide-react';

import './method-page.css';

type Tone = 'neutral' | 'gold' | 'approved' | 'candidate' | 'warning';

type Fact = {
  value: string;
  label: string;
  description: string;
  unit: string;
  tone?: Tone;
};

type PipelineStep = {
  number: string;
  title: string;
  metric: string;
  input: string;
  process: string;
  validation: string;
};

type BehaviorCode = {
  code: string;
  name: string;
  definition: string;
  rule: string;
  count: number;
};

const facts: Fact[] = [
  { value: '45', label: '원본 PDF', description: '회의록 42건 + 시정·처리결과 3건', unit: 'files' },
  { value: '4,991', label: '원본 페이지', description: '회의록 4,495쪽 + 조치결과 496쪽', unit: 'pages' },
  { value: '65,590', label: '발언 단위', description: '화자 전환을 기준으로 분할한 발언', unit: 'turns' },
  { value: '26,063', label: '답변 단위', description: '질문에 대응하는 기관 측 답변', unit: 'answer units' },
  { value: '769', label: 'Gold 행태 라벨', description: '761개 답변 결정 그룹에 부여', unit: 'labels', tone: 'gold' },
  { value: '64', label: '승인 분석 엔터티', description: '검증된 target-answer link', unit: 'links', tone: 'approved' },
];

const pipeline: PipelineStep[] = [
  {
    number: '01',
    title: '원본 수집',
    metric: '49 files · hash verification',
    input: '회의록 PDF 42건, 시정·처리결과 PDF 3건, 회의 등록부 XLSX 1건, target marker CSV 3건',
    process: '국회 공식 기록을 파일 단위로 보존하고 원본과 분석 저장소의 위치를 분리했습니다.',
    validation: 'source hash와 destination hash의 SHA-256 일치 여부, 파일 수, PDF 페이지 수를 대조했습니다.',
  },
  {
    number: '02',
    title: 'PDF 구조화',
    metric: '4,495 meeting pages',
    input: '문화체육관광위원회 국정감사 회의록 PDF',
    process: 'PDF를 페이지 단위로 분리하고 문서·회의·페이지 식별자를 함께 부여했습니다.',
    validation: '원본 페이지 순서와 구조화된 page key가 끊기거나 중복되지 않는지 확인했습니다.',
  },
  {
    number: '03',
    title: '발언 복원',
    metric: '293,717 text blocks · 65,590 turns',
    input: '페이지별 텍스트 블록과 화자 표기',
    process: '본문 블록을 읽기 순서로 정렬하고 같은 화자의 연속 문장을 하나의 turn으로 묶었습니다.',
    validation: '화자명·직책·기관 파싱 결과와 페이지 경계를 표본 및 규칙 검증으로 점검했습니다.',
  },
  {
    number: '04',
    title: '검색 문맥 생성',
    metric: '196,686 retrieval segments',
    input: '발언 원문, 정규화 문장, 인접 발언 문맥',
    process: '후보 탐색과 중복 검증을 위해 검색용 문맥 조각을 만들되 원문 display text는 별도로 보존했습니다.',
    validation: '정규화 텍스트가 원문 계보를 잃지 않는지 text hash와 source key로 대조했습니다.',
  },
  {
    number: '05',
    title: '질문·답변 연결',
    metric: '25,958 QA pairs · 26,063 answer units',
    input: '위원 측 질문 turn과 기관 측 답변 turn',
    process: '발언 순서를 이용해 질문과 답변을 연결하고, 복수 답변·연속 발언을 보존하는 별도 단위를 생성했습니다.',
    validation: '질문·답변 역할, 회의 경계, pair와 answer unit의 PK/FK를 검사했습니다.',
  },
  {
    number: '06',
    title: '답변 행태 후보 탐지',
    metric: 'rule-based weak labels',
    input: '기관 측 answer unit과 A1–A8 표현 사전',
    process: '정규식 사전으로 후보를 찾고 부정문·질문 재인용·의문문 문맥은 억제 규칙으로 구분했습니다.',
    validation: 'weak label은 공개 판정으로 사용하지 않고 반드시 검토 inbox에만 적재했습니다.',
  },
  {
    number: '07',
    title: 'Gold 검토·승격',
    metric: '769 labels · 761 groups',
    input: '후보 문장, 앞뒤 문맥, PDF/page 계보, 검토 결정',
    process: '코드북 기준으로 primary·secondary label을 판정하고 예외와 승인 근거를 함께 고정했습니다.',
    validation: '정확한 A1–A8 분포, 중복·누락·결정 그룹 무결성과 release hash를 검사했습니다.',
  },
  {
    number: '08',
    title: '감사 지적사항 연결',
    metric: '64 accepted target-answer links',
    input: 'Gold 답변, 시정·처리결과 target, 공개 근거 후보',
    process: '주제가 비슷한 문장이 아니라 동일 지적사항에 대한 답변인지 문맥과 계보로 연결했습니다.',
    validation: 'link decision, target anchor, answer unit, 상태, evidence eligibility를 각각 검증했습니다.',
  },
  {
    number: '09',
    title: '근거 분석 입력 확정',
    metric: '64 approved link entities',
    input: '승인된 Gold target-answer link 64건',
    process: '한 개 link를 한 개 분석 엔터티로 삼고 다중 행태는 엔터티의 속성으로 유지했습니다.',
    validation: 'PK/FK, 비어 있지 않은 텍스트, topic anchor, 공개 계보, text leakage 검사를 통과한 release만 승인했습니다.',
  },
  {
    number: '10',
    title: 'P3_FINAL Atlas 파생 릴리스',
    metric: '761 groups · 96D · 24 bins · 140 nodes',
    input: 'Behavior Gold 761 decision groups. 이 중 64건은 승인 link가 있고 697건은 NO_APPROVED_TARGET_LINK 상태입니다.',
    process: '한 decision group을 한 점으로 삼아 char TF-IDF(2–5), TruncatedSVD 96D, L2 정규화, UMAP, KMeans를 순서대로 실행했습니다.',
    validation: 'MEMBER_GRAIN_CONTROL_PASS, EMBEDDING_CONTRACT_PASS, PROJECTION_INSTANCE_PASS, CANONICAL_RELEASE_PACKAGE_PASS를 확인했습니다.',
  },
];

const behaviorCodes: BehaviorCode[] = [
  { code: 'A1', name: '기억 부재 진술', definition: '기억이 나지 않거나 기억하지 못한다고 명시한 답변', rule: '기억 자체의 부재가 핵심일 때', count: 26 },
  { code: 'A2', name: '정보 미보유·확인 필요', definition: '현재 수치·사실을 갖고 있지 않거나 추가 확인이 필요한 답변', rule: '현재 정보 보유 여부를 판단', count: 172 },
  { code: 'A3', name: '타기관·타주체 귀속', definition: '책임 또는 답변 주체를 다른 기관·주체로 이동한 답변', rule: '책임 주체 이동이 핵심일 때', count: 3 },
  { code: 'A4', name: '질문 비직접 대응', definition: '질문의 핵심에 직접 답하지 않고 일반론이나 주변 설명으로 우회한 답변', rule: '질문 핵심 충족 여부로 판단', count: 32 },
  { code: 'A5', name: '검토·협의 유보', definition: '구체적 후속 절차나 기한 없이 검토·협의를 미래로 미룬 답변', rule: '후속 절차·기한이 불명확한 검토', count: 49 },
  { code: 'A6', name: '조사·자료 제출 절차', definition: '조사, 확인, 자료 제출, 서면 답변 등 절차적 후속조치를 제시한 답변', rule: '절차는 있으나 결과는 아직 없을 때', count: 127 },
  { code: 'A7', name: '구체 조치 약속', definition: '특정 행동, 주체 또는 기한이 있는 조치를 약속한 답변', rule: '주체·행동·기한 중 구체성이 존재', count: 59 },
  { code: 'A8', name: '완료·근거 제시', definition: '실행 완료 사실과 확인 가능한 수치·문서·조치 근거를 함께 제시한 답변', rule: '완료된 행동과 검증 가능한 근거 필요', count: 301 },
];

const sourceRows = [
  { source: '문화체육관광위원회 국정감사 회의록', period: '2020–2025', count: '42 PDF', pages: '4,495', role: '질문·답변 및 발언 원문', status: 'HASH VERIFIED' },
  { source: '시정·처리결과 자료', period: '2020·2022·2024', count: '3 PDF', pages: '496', role: '감사 지적사항과 후속 조치', status: 'HASH VERIFIED' },
  { source: '회의 등록부', period: '2020–2025', count: '1 XLSX', pages: '—', role: '회의·날짜·출처 식별', status: 'CONFORMED' },
  { source: 'target marker export', period: '해당 연도', count: '3 CSV', pages: '—', role: '지적사항 구조화 보조', status: 'CONFORMED' },
];

const railItems = [
  { href: '#source-corpus', number: '01', label: '자료' },
  { href: '#data-pipeline', number: '02', label: '처리' },
  { href: '#gold-review', number: '03', label: 'Gold' },
  { href: '#projection-decision', number: '04', label: '분석대상' },
  { href: '#evidence-traceability', number: '05', label: '근거' },
  { href: '#limitations', number: '06', label: '한계' },
];

function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`method-status method-status--${tone}`}>{children}</span>;
}

function SectionHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <header className="method-section-heading">
      <p className="method-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {lead ? <p className="method-section-lead">{lead}</p> : null}
    </header>
  );
}

function MethodologyHero() {
  return (
    <header className="method-hero">
      <div className="method-hero__copy">
        <p className="method-eyebrow">METHODOLOGY · DATA &amp; JOURNALISM</p>
        <h1>
          국정감사 발언은 어떻게
          <span>검증 가능한 데이터가 되었나</span>
        </h1>
        <p className="method-hero__dek">
          이 프로젝트는 회의록에 등장한 한 문장을 곧바로 통계로 사용하지 않았습니다. 원본 PDF의 페이지와 발언 순서를
          보존하고, 질문과 답변을 연결한 뒤, 답변 행태·감사 지적사항·후속 조치·공개 근거를 단계별로 검증했습니다. 이
          페이지는 수집에서 Gold 확정, 분석 대상 선정까지의 전체 과정을 공개합니다.
        </p>
      </div>

      <div className="method-hero__scope" aria-label="분석 자료 범위">
        <p className="method-hero__scope-label">REPORTING SCOPE</p>
        <p>
          본 작품은 <strong>2020년부터 2025년까지</strong> 대한민국 국회 문화체육관광위원회 국정감사 회의록 42건과,
          2020·2022·2024년 시정·처리결과 자료를 결합해 국정감사 답변의 행태와 후속 조치 상태를 분석했습니다.
        </p>
      </div>

      <div className="method-hero__badges" aria-label="데이터 릴리스 상태">
        <StatusBadge>DATA PERIOD · 2020–2025</StatusBadge>
        <StatusBadge tone="gold">BEHAVIOR GOLD · 769 LABELS</StatusBadge>
        <StatusBadge tone="approved">ANALYSIS INPUT · 64 LINKS</StatusBadge>
        <StatusBadge>SOURCE TRACEABLE · PDF/PAGE</StatusBadge>
        <StatusBadge>UPDATED · 2026.07.24</StatusBadge>
        <StatusBadge tone="approved">CANONICAL ATLAS · 761 GROUPS</StatusBadge>
      </div>
    </header>
  );
}

function ScopeFactGrid() {
  return (
    <section className="method-facts" aria-labelledby="facts-title">
      <div className="method-facts__heading">
        <p className="method-eyebrow">DATA AT A GLANCE</p>
        <h2 id="facts-title">한눈에 보는 데이터</h2>
      </div>
      <div className="method-fact-grid" data-testid="methodology-fact-grid">
        {facts.map((fact) => (
          <article className={`method-fact-card method-fact-card--${fact.tone ?? 'neutral'}`} key={fact.label}>
            <div className="method-fact-card__topline">
              <span className="method-fact-card__value">{fact.value}</span>
              <span className="method-fact-card__unit">{fact.unit}</span>
            </div>
            <h3>{fact.label}</h3>
            <p>{fact.description}</p>
          </article>
        ))}
      </div>
      <p className="method-facts__note">
        <InfoMark />
        <span>
          숫자는 서로 다른 데이터 단계를 뜻합니다. 26,063개 전체 답변 중 행태 Gold는 769개이며, 그중 검증된 감사
          지적사항·근거 계보까지 연결된 64개 링크가 근거 분석 입력으로 승인되었습니다. 이후 Atlas 파생 릴리스는 761개
          decision group을 별도 모집단으로 사용하며, link가 없는 697개는 NO_APPROVED_TARGET_LINK 상태를 유지합니다.
        </span>
      </p>
    </section>
  );
}

function InfoMark() {
  return <span className="method-info-mark" aria-hidden="true">i</span>;
}

function StickySectionNavigation() {
  return (
    <aside className="method-rail" aria-label="방법론 목차">
      <div className="method-rail__inner">
        <p className="method-rail__title">ON THIS PAGE</p>
        <nav>
          {railItems.map((item) => (
            <a href={item.href} key={item.href}>
              <span>{item.number}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="method-rail__release">
          <span>RELEASE SNAPSHOT</span>
          <strong>2026.07.24</strong>
          <small>CANONICAL_RELEASE_PACKAGE_PASS</small>
        </div>
      </div>
    </aside>
  );
}

function ResearchQuestion() {
  return (
    <section className="method-section" id="research-question">
      <SectionHeading eyebrow="01 · RESEARCH QUESTION" title="무엇을 확인하려 했나" />
      <div className="method-prose">
        <p>
          국정감사에서는 정부와 공공기관이 수많은 답변을 내놓습니다. 그러나 모든 답변이 같은 정도의 구체성을 갖는 것은
          아닙니다. 어떤 답변은 사실이나 완료된 조치를 제시하고, 어떤 답변은 확인·검토·자료 제출을 약속하며, 어떤 답변은
          질문에 직접 답하지 않거나 다른 기관의 소관이라고 설명합니다.
        </p>
        <p>
          이 프로젝트는 답변을 ‘좋다’ 또는 ‘나쁘다’로 평가하기보다, 답변이 취한 언어적·절차적 행태를 일관된 기준으로
          분류합니다. 이후 공식 시정·처리결과 자료와 연결해 해당 답변이 어떤 감사 지적사항과 관련되어 있고, 공개 가능한
          근거가 어디에 있는지를 추적합니다.
        </p>
      </div>
      <blockquote className="method-pullquote">
        답변 행태는 발언의 진실성이나 정책 성과를 직접 판정하는 지표가 아닙니다.
      </blockquote>
    </section>
  );
}

function CollectionAndCrawling() {
  const crawlSteps = [
    ['01', 'Registry 선택', '회의 ID와 PDF URL이 함께 있는 Excel sheet를 식별하고 컬럼명을 표준화합니다.'],
    ['02', 'Critical gate', 'URL scheme, meeting ID 안전성, 중복 URL, 파일 경로 충돌을 검사합니다.'],
    ['03', 'HTTP 수집', 'requests.Session, retry/backoff, rate limit, streaming download와 임시 .part 파일을 사용합니다.'],
    ['04', '파일 검증', '%PDF- signature, HTML/JSON 오류 본문, fitz.open, page_count≥1을 확인합니다.'],
    ['05', '원본 고정', 'SHA-256, page count, HTTP 상태, 수집 로그와 checkpoint를 manifest에 기록합니다.'],
  ];

  return (
    <section className="method-section" id="collection-crawling">
      <SectionHeading
        eyebrow="02 · COLLECTION & CRAWLING"
        title="원본 PDF는 어떻게 수집했나"
        lead="수집과 텍스트 분석을 한 단계로 뭉개지 않았습니다. 크롤러는 원본 다운로드와 무결성 검증까지만 담당합니다."
      />
      <div className="method-crawl-contract">
        <div className="method-crawl-contract__title">
          <Database aria-hidden="true" />
          <div>
            <span>EXECUTED NOTEBOOK</span>
            <strong>02_pdf_crawler.ipynb</strong>
            <small>18 / 18 code cells · 0 errors</small>
          </div>
        </div>
        <p>
          이 노트북은 PDF 본문 추출, OCR, 발언자 판별, TF-IDF, embedding을 실행하지 않습니다. 기존 PDF가 손상됐거나
          registry critical gate가 실패하면 신규 다운로드 전체를 중단하는 circuit breaker를 둡니다.
        </p>
      </div>
      <ol className="method-crawl-steps">
        {crawlSteps.map(([number, title, body]) => (
          <li key={number}>
            <span>{number}</span>
            <div><strong>{title}</strong><p>{body}</p></div>
          </li>
        ))}
      </ol>
      <div className="method-boundary-note">
        <strong>수집 경계</strong>
        <p>
          회의록 42건은 registry URL을 통해 수집·검증했습니다. 시정·처리결과 PDF 3건과 보조 XLSX·CSV는 별도 원천으로
          등록한 뒤 P3_FINAL migration에서 45개 PDF의 magic, page count, source/destination hash를 다시 대조했습니다.
        </p>
      </div>
    </section>
  );
}

function SourceCorpus() {
  return (
    <section className="method-section" id="source-corpus">
      <SectionHeading
        eyebrow="03 · SOURCE CORPUS"
        title="어떤 자료를 사용했나"
        lead="공식 기록, 보조 등록부, 구조화 export의 역할을 분리해 원본과 파생 데이터를 혼동하지 않도록 했습니다."
      />
      <div className="method-table-wrap">
        <table className="method-table">
          <caption>자료별 기간, 건수, 페이지, 역할과 검증 상태</caption>
          <thead>
            <tr>
              <th scope="col">자료</th>
              <th scope="col">기간</th>
              <th scope="col">건수</th>
              <th scope="col">페이지</th>
              <th scope="col">역할 / 검증</th>
            </tr>
          </thead>
          <tbody>
            {sourceRows.map((row) => (
              <tr key={row.source}>
                <th scope="row" data-label="자료">{row.source}</th>
                <td data-label="기간">{row.period}</td>
                <td data-label="건수">{row.count}</td>
                <td data-label="페이지">{row.pages}</td>
                <td data-label="역할 / 검증">
                  <span className="method-table__role">{row.role}</span>
                  <span className="method-table__status"><Check size={12} aria-hidden="true" />{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="method-source-note">
        <FileCheck2 aria-hidden="true" />
        <p>
          회의록과 시정·처리결과 문서는 국회 공식 기록을 기준으로 수집했습니다. 모든 원본은 파일 단위 SHA-256과 PDF
          페이지 수를 기록했습니다. 원본에서 분석 저장소로 이동한 49개 파일은 source hash와 destination hash가 모두
          일치했습니다.
        </p>
      </div>
    </section>
  );
}

function DataPipeline() {
  return (
    <section className="method-section" id="data-pipeline">
      <SectionHeading
        eyebrow="04 · DATA PIPELINE"
        title="데이터가 만들어진 과정"
        lead="각 단계를 열면 입력, 처리 규칙, 통과 기준을 확인할 수 있습니다."
      />
      <div className="method-prose method-prose--intro">
        <p>
          원본 PDF는 페이지 단위로 분리한 뒤 텍스트 블록과 화자 발언으로 복원했습니다. 발언 순서를 이용해 질문과 답변을
          연결하고, 한 질문에 여러 답변이 이어지거나 한 답변이 여러 발언에 걸친 경우를 보존하기 위해 별도의 QA pair와
          answer unit을 만들었습니다.
        </p>
        <p>
          정규화된 문장은 검색과 중복 검증에 사용하지만, 화면에 표시되는 인용문과 근거 확인에는 원문에 가까운 display
          text와 PDF 페이지를 함께 사용합니다.
        </p>
      </div>
      <div className="method-pipeline" data-testid="methodology-pipeline">
        {pipeline.map((step, index) => (
          <details className="method-pipeline-step" key={step.number} open={index === 0}>
            <summary>
              <span className="method-pipeline-step__number">{step.number}</span>
              <span className="method-pipeline-step__title">
                <strong>{step.title}</strong>
                <small>{step.metric}</small>
              </span>
              <span className="method-pipeline-step__toggle" aria-hidden="true">+</span>
            </summary>
            <div className="method-pipeline-step__body">
              <div><span>입력</span><p>{step.input}</p></div>
              <div><span>처리 규칙</span><p>{step.process}</p></div>
              <div><span>검증 기준</span><p>{step.validation}</p></div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function AnswerUnitDefinition() {
  const definitions = [
    ['발언 Turn', '화자가 바뀌지 않는 연속 발언입니다.', '65,590 turns'],
    ['질문–답변 Pair', '위원의 질문과 이에 대응하는 기관 측 답변의 관계입니다.', '25,958 pairs'],
    ['답변 Unit', '하나의 질문에 대한 의미상 연속된 기관 측 답변입니다.', '26,063 units'],
    ['Behavior Decision Group', '동일 답변에 부여된 하나의 행태 판단 단위입니다.', '761 groups · 769 labels'],
  ];
  return (
    <section className="method-section" id="answer-units">
      <SectionHeading eyebrow="05 · UNIT OF ANALYSIS" title="무엇을 한 건으로 셌나" />
      <div className="method-definition-grid">
        {definitions.map(([title, description, metric], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <small>{metric}</small>
          </article>
        ))}
      </div>
      <div className="method-warning">
        <AlertTriangle aria-hidden="true" />
        <p>
          <strong>769개 라벨을 769개의 독립 답변 또는 769개의 지도 점으로 해석해서는 안 됩니다.</strong>
          multi-label 답변은 하나의 답변에 여러 속성이 존재하는 경우입니다. 8개 그룹은 두 개의 행태를 함께 갖습니다.
        </p>
      </div>
    </section>
  );
}

function BehaviorCodebook() {
  return (
    <section className="method-section" id="codebook">
      <SectionHeading
        eyebrow="06 · BEHAVIOR CODEBOOK"
        title="답변 행태 A1–A8 코드북"
        lead="행태 코드는 가치 판단이 아니라, 답변이 취한 언어적·절차적 형식을 재현 가능한 기준으로 기록한 것입니다."
      />
      <div className="method-codebook-grid" data-testid="methodology-codebook">
        {behaviorCodes.map((item) => (
          <article className="method-code-card" key={item.code}>
            <header>
              <span>{item.code}</span>
              <small>{item.count} labels</small>
            </header>
            <h3>{item.name}</h3>
            <p>{item.definition}</p>
            <div><strong>판정 기준</strong>{item.rule}</div>
          </article>
        ))}
      </div>
      <p className="method-codebook-note">
        후보 탐지는 표현 사전으로 시작하지만, 부정문·질문 재인용·문맥상 인용은 억제하며 최종 Gold는 규칙 적중만으로
        확정하지 않습니다.
      </p>
    </section>
  );
}

function GoldReviewProcess() {
  const stages = [
    { label: 'CANDIDATE', title: '기계 후보', body: '정규식과 문맥 규칙으로 발견한 검토 대상', tone: 'candidate' as Tone },
    { label: 'BEHAVIOR GOLD', title: '행태 확정', body: '769 labels · 761 decision groups', tone: 'gold' as Tone },
    { label: 'FULL GOLD', title: '관계 확정', body: '64 links · 57 completion verifications · 64 evidence records', tone: 'gold' as Tone },
    { label: 'APPROVED ANALYSIS', title: '분석 입력 승인', body: '64 unique projection entities', tone: 'approved' as Tone },
  ];
  return (
    <section className="method-section" id="gold-review">
      <SectionHeading
        eyebrow="07 · GOLD REVIEW"
        title="후보는 어떻게 Gold가 되었나"
        lead="후보 발견, 검토 결정, 관계 검증, 분석 입력 승인을 서로 다른 lifecycle로 관리했습니다."
      />
      <div className="method-lifecycle" aria-label="데이터 승인 단계">
        {stages.map((stage, index) => (
          <article key={stage.label}>
            <StatusBadge tone={stage.tone}>{stage.label}</StatusBadge>
            <h3>{stage.title}</h3>
            <p>{stage.body}</p>
            {index < stages.length - 1 ? <ArrowRight aria-hidden="true" /> : null}
          </article>
        ))}
      </div>
      <div className="method-prose">
        <p>
          Gold 검토에서는 후보 문장만 보지 않고 앞뒤 발언, 화자 역할, 질문 연결, 원본 PDF 페이지를 함께 확인했습니다.
          primary와 secondary label을 분리해 다중 행태를 보존했고, 판단이 충돌하거나 입력 형식이 불완전한 항목은 예외
          기록에 남겼습니다.
        </p>
        <p>
          최종 승격은 versioned release와 승인 지시를 근거로 수행했습니다. 파일명으로 검토자 신원이나 검토 시각을
          추정하지 않았으며, 불완전한 candidate와 rejected 산출물은 canonical Gold와 물리적으로 분리했습니다.
        </p>
      </div>
      <div className="method-key-statement">
        <LockKeyhole aria-hidden="true" />
        <p>
          <strong>Gold는 immutable input입니다.</strong> 이후 분석 대상에 포함되지 않았다는 이유로 기존 Gold 라벨을
          삭제하거나 강등하지 않습니다.
        </p>
      </div>
    </section>
  );
}

function ProjectionPopulationDecision() {
  return (
    <section className="method-section" id="projection-decision">
      <SectionHeading
        eyebrow="08 · POPULATION DECISION"
        title="64개 근거 모집단과 761개 Atlas 모집단"
        lead="근거가 완결된 link 분석과 전체 Gold decision-group 지형을 서로 다른 모집단으로 관리합니다."
      />
      <div className="method-decision-card">
        <div className="method-decision-card__selected">
          <span>SELECTED GRAIN</span>
          <strong>1 link = 1 entity</strong>
          <p>Gold 지적사항–답변 연결 64건</p>
          <StatusBadge tone="approved">PROJECTION_GRAIN_DECISION_PASS</StatusBadge>
        </div>
        <div className="method-decision-card__reason">
          <h3>선택 기준</h3>
          <ul>
            <li><CheckCircle2 aria-hidden="true" />안정적인 target-answer link ID</li>
            <li><CheckCircle2 aria-hidden="true" />감사 지적사항·topic anchor</li>
            <li><CheckCircle2 aria-hidden="true" />answer unit과 원본 PDF 계보</li>
            <li><CheckCircle2 aria-hidden="true" />유효 상태·Gold 행태·공개 근거</li>
          </ul>
        </div>
      </div>
      <div className="method-alternative-grid">
        <article>
          <span>OPTION B · NOT SELECTED</span>
          <strong>761 decision groups</strong>
          <p>검증된 topic linkage가 48개 그룹에만 존재해 전체를 같은 조건으로 비교할 수 없습니다.</p>
        </article>
        <article>
          <span>OPTION C · NOT SELECTED</span>
          <strong>769 label rows</strong>
          <p>topic linkage는 49개 라벨뿐이며 multi-label 8개 그룹을 중복된 점으로 만들게 됩니다.</p>
        </article>
      </div>
      <blockquote className="method-population-statement">
        답변 행태 Gold는 769개입니다. 이 중 감사 지적사항, 답변, 상태, 공개 근거의 계보가 모두 검증된 64개 링크를 현재
        근거 분석 입력으로 사용합니다. Atlas는 761개 decision group을 파생 입력으로 사용하지만, link가 없는 697개를
        근거가 확인된 사례처럼 표시하지 않습니다. 어느 모집단에서도 제외를 이유로 Gold 라벨을 삭제하거나 강등하지 않습니다.
      </blockquote>
      <div className="method-atlas-population">
        <div>
          <span>CANONICAL ATLAS DERIVED INPUT</span>
          <strong>761 decision groups</strong>
          <p>64 approved-link members + 697 NO_APPROVED_TARGET_LINK members</p>
        </div>
        <StatusBadge tone="approved">MEMBER_GRAIN_CONTROL_PASS</StatusBadge>
      </div>
      <a className="atlas-action-primary mt-5" href="/method/projection">
        PCA·UMAP Projection Method Lab 열기 <ArrowRight aria-hidden="true" />
      </a>
    </section>
  );
}

function TechnicalModeling() {
  const executionRows = [
    ['02_pdf_crawler.ipynb', '18 / 18', 'EXECUTED', 'HTTP 원본 수집·무결성'],
    ['09_audit_minutes_pdf_etl.ipynb', '16 / 16', 'EXECUTED', 'PyMuPDF Core ETL'],
    ['P3_0722/main.ipynb', '0 / 7', 'READER SHELL', '편집자용 점검 화면'],
    ['P3_FINAL_MASTER_ANALYSIS.ipynb', '0 / 2', 'PLAN SHELL', 'M7 계획 목차'],
    ['07 / 08 release scripts', 'manifest PASS', 'EXECUTED', 'P3_FINAL 모델·Atlas 릴리스'],
  ];

  const transformerSteps = [
    ['01', 'PDF bytes', '공식 PDF와 SHA-256을 고정'],
    ['02', 'PyMuPDF block', 'page.get_text("blocks", sort=True)'],
    ['03', 'Turn · segment', '화자 발언과 검색 문맥 복원'],
    ['04', 'Normalize', '검색용 공백·문자 정규화'],
    ['05', 'Sparse gate', '동일 연도 TF-IDF top 50'],
    ['06', 'Subword tokens', '<s> · token ids · </s> · <pad>'],
    ['07', 'Transformer', '12-layer multi-head self-attention'],
    ['08', 'Mean pooling', '유효 토큰 hidden state 평균'],
    ['09', 'L2 · cosine', '384D 정규화 벡터 내적'],
    ['10', 'RRF · review', '세 순위 결합 후 사람 검토'],
  ];

  const statusRows = [
    ['2020', '110', '56', '54'],
    ['2022', '116', '77', '39'],
    ['2024', '71', '37', '34'],
    ['합계', '297', '170', '127'],
  ];

  return (
    <section className="method-section" id="technical-modeling">
      <SectionHeading
        eyebrow="09 · TECHNICAL MODELING"
        title="TF-IDF, Transformer, SVD와 UMAP을 어디에 썼나"
        lead="코드에 등장한 모델과 현재 canonical release를 만든 모델은 같지 않습니다. 실제 실행 상태와 역할을 분리해 공개합니다."
      />

      <div className="method-model-stack">
        <article>
          <header><span>RETRIEVAL · P3_0722</span><StatusBadge tone="candidate">CANDIDATE SEARCH</StatusBadge></header>
          <h3>char + word TF-IDF로 후보를 좁혔습니다</h3>
          <p>
            같은 감사 연도의 retrieval segment만 대상으로 char 3–5 gram과 word 1–2 gram을 각각 계산했습니다. issue text에
            action text 벡터의 0.25를 더하고, char 65% + word 35% 점수로 연도별 top 50 후보를 만들었습니다.
          </p>
          <dl>
            <div><dt>char features</dt><dd>3–5 gram · max 120,000</dd></div>
            <div><dt>word features</dt><dd>1–2 gram · max 80,000</dd></div>
            <div><dt>temporal gate</dt><dd>strict same audit cycle</dd></div>
            <div><dt>review status</dt><dd>후보이며 정답 아님</dd></div>
          </dl>
        </article>

        <article>
          <header><span>DENSE RERANK · P3_0722</span><StatusBadge tone="warning">PROVISIONAL</StatusBadge></header>
          <h3>MiniLM Transformer는 후보 재정렬·과거 투영에만 사용했습니다</h3>
          <p>
            <code>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</code>로 384차원 mean-pooled sentence embedding을
            만들고 L2 정규화해 sparse top-50 pool을 dense cosine 점수로 재정렬하는 코드가 존재합니다. 이 MiniLM 기반
            PCA50/UMAP은 Gold 이전 provisional 산출물이며 현재 canonical Atlas의 모델이 아닙니다.
          </p>
          <dl>
            <div><dt>framework</dt><dd>sentence-transformers</dd></div>
            <div><dt>dimension</dt><dd>384</dd></div>
            <div><dt>pooling</dt><dd>mean + L2</dd></div>
            <div><dt>release role</dt><dd>legacy/provisional only</dd></div>
          </dl>
        </article>

        <article className="method-model-stack__canonical">
          <header><span>CANONICAL MODEL · P3_FINAL</span><StatusBadge tone="approved">EXECUTED &amp; HASHED</StatusBadge></header>
          <h3>현재 Atlas는 결정론적 TF-IDF → SVD → UMAP 파이프라인입니다</h3>
          <p>
            761개 Behavior Decision Group의 topic anchor text에 Unicode character 2–5 gram TF-IDF를 적용하고, TruncatedSVD로
            96차원까지 축약한 뒤 L2 정규화했습니다. 이 96차원 행렬에 cosine UMAP을 한 번 fit해 2차원 좌표를 만들었습니다.
          </p>
          <dl>
            <div><dt>vectorizer</dt><dd>char(2,5) · min_df=2 · 8,192 features</dd></div>
            <div><dt>reduction</dt><dd>TruncatedSVD 96D · n_iter=15</dd></div>
            <div><dt>projection</dt><dd>UMAP cosine · neighbors=20 · min_dist=0.08</dd></div>
            <div><dt>reproducibility</dt><dd>random_state=42 · CPU · L2</dd></div>
          </dl>
        </article>

        <article>
          <header><span>TOPIC &amp; ATLAS</span><StatusBadge tone="approved">24 BINS · 140 NODES</StatusBadge></header>
          <h3>군집 이름은 화면 위치가 아니라 고차원 문맥에서 정했습니다</h3>
          <p>
            96차원 공간에서 KMeans 24개 군집을 만들고 cosine medoid를 대표 문장으로 선택했습니다. word TF-IDF 상위 용어는
            설명 보조로만 사용했습니다. Atlas node는 topic, 상태, primary answer type을 조합하며 64개 공개 근거만 별도로 연결합니다.
          </p>
          <dl>
            <div><dt>clustering</dt><dd>KMeans 24 · n_init=40</dd></div>
            <div><dt>representative</dt><dd>cosine medoid anchor</dd></div>
            <div><dt>node count</dt><dd>140</dd></div>
            <div><dt>public evidence</dt><dd>64 records</dd></div>
          </dl>
        </article>
      </div>

      <div className="method-transformer-trace" aria-labelledby="transformer-trace-title">
        <div className="method-transformer-trace__intro">
          <span>PROVISIONAL DENSE RERANK · EXECUTED CODE PATH</span>
          <h3 id="transformer-trace-title">PDF 한 쪽이 Transformer cosine 점수가 되기까지</h3>
          <p>
            Transformer가 원본 PDF를 직접 읽는 것은 아닙니다. PyMuPDF가 페이지와 블록을 꺼내고, 발언·검색 문맥을
            복원한 다음, 같은 감사연도의 sparse top-50 후보에 한해서만 MiniLM을 적용했습니다. 따라서 dense model은
            전체 corpus에서 정답을 결정한 분류기가 아니라 검토 후보의 순서를 다시 매긴 reranker입니다.
          </p>
        </div>
        <ol>
          {transformerSteps.map(([number, title, description]) => (
            <li key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <p>{description}</p>
            </li>
          ))}
        </ol>
        <p className="method-transformer-trace__boundary">
          <strong>경계:</strong> 01–04는 PDF ETL, 05는 sparse retrieval, 06–09는 provisional MiniLM rerank, 10은 후보 통합과
          검토입니다. 현재 canonical Atlas 좌표는 이 384D MiniLM 벡터가 아니라 별도의 char TF-IDF–SVD96 행렬로 생성했습니다.
        </p>
      </div>

      <div className="method-transformer-spec">
        <div>
          <span>LOCAL MODEL SNAPSHOT</span>
          <strong>paraphrase-multilingual-MiniLM-L12-v2</strong>
          <p>코드와 함께 보존된 config·tokenizer·pooling 설정에서 직접 확인한 값입니다.</p>
        </div>
        <dl>
          <div><dt>encoder</dt><dd>BERT-style · 12 layers</dd></div>
          <div><dt>attention</dt><dd>12 heads · hidden 384</dd></div>
          <div><dt>feed-forward</dt><dd>1,536 · GELU</dd></div>
          <div><dt>sequence</dt><dd>max 512 tokens</dd></div>
          <div><dt>tokenizer</dt><dd>Fast · vocab 250,037</dd></div>
          <div><dt>sentence vector</dt><dd>mean pool · 384D · L2</dd></div>
        </dl>
      </div>

      <details className="method-algorithm-ledger" open>
        <summary>Transformer 내부 계산과 cosine 유사도 보기 <span aria-hidden="true">+</span></summary>
        <div className="method-algorithm-ledger__body">
          <article>
            <span>01 · TOKENIZE &amp; EMBED</span>
            <code>H⁽⁰⁾ = E_token(ids) + E_position(pos) + E_type(segment)</code>
            <p>
              Fast tokenizer가 문자열을 subword token id로 바꾸고 <code>attention_mask</code>로 실제 토큰과 padding을 구분합니다.
              로컬 설정의 special token은 <code>&lt;s&gt;</code>, <code>&lt;/s&gt;</code>, <code>&lt;pad&gt;</code>입니다. 화면의 토큰 예시는
              개념 설명이며 특정 한국어 문장의 실제 분절값을 꾸며내지 않습니다.
            </p>
          </article>
          <article>
            <span>02 · SCALED DOT-PRODUCT ATTENTION</span>
            <code>A(Q,K,V) = softmax((QKᵀ / √dₖ) + M) V</code>
            <p>
              각 토큰은 query, key, value 투영을 만들고 다른 토큰과의 관련도를 계산합니다. <code>M</code>은 padding 위치를
              attention에서 제외하는 mask입니다.
            </p>
          </article>
          <article>
            <span>03 · MULTI-HEAD · FFN</span>
            <code>headᵢ=A(HWᵢQ,HWᵢK,HWᵢV); MHA=Concat(headᵢ)Wᴼ</code>
            <code>FFN(H)=GELU(HW₁+b₁)W₂+b₂</code>
            <p>12개 head가 서로 다른 관계를 병렬로 계산하며, residual connection과 LayerNorm을 거쳐 12개 층을 통과합니다.</p>
          </article>
          <article>
            <span>04 · MASKED MEAN POOLING</span>
            <code>s = (Σᵢ mᵢhᵢ) / (Σᵢ mᵢ)</code>
            <p>padding을 제외한 마지막 층 token hidden state를 평균내 하나의 384차원 sentence vector로 만듭니다.</p>
          </article>
          <article>
            <span>05 · NORMALIZE &amp; COSINE</span>
            <code>e = s / ‖s‖₂; cos(q,d) = e_q · e_d</code>
            <p>
              코드가 <code>normalize_embeddings=True</code>를 사용하므로 query와 document의 행렬곱은 곧 cosine similarity입니다.
              점수는 의미적 근접도일 뿐 사실성·인과성·답변 품질의 확률이 아닙니다.
            </p>
          </article>
        </div>
      </details>

      <div className="method-formulas" aria-label="모델 계산식">
        <h3>코드가 구현한 핵심 계산식</h3>
        <div>
          <article>
            <span>01 · TF-IDF</span>
            <code>tfidf(t,d) = (1 + log f(t,d)) × [log((1+N)/(1+df(t))) + 1]</code>
            <p>sublinear_tf=True와 smoothed idf를 사용하고 각 문서 벡터를 L2 정규화합니다.</p>
          </article>
          <article>
            <span>02 · SPARSE SCORE</span>
            <code>S = 0.65·cos(q_char,d_char) + 0.35·cos(q_word,d_word)</code>
            <p>q = L2(v(issue) + 0.25·v(action)); 시간 적격 corpus 안에서만 점수를 계산합니다.</p>
          </article>
          <article>
            <span>03 · RANK FUSION</span>
            <code>RRF = Σ 1 / (60 + rank_i)</code>
            <p>char, word, provisional dense MiniLM 순위를 결합해 검토 후보 순서를 만듭니다.</p>
          </article>
          <article>
            <span>04 · CANONICAL PROJECTION</span>
            <code>X₉₆ = L2(SVD₉₆(TFIDF_char)); Y = UMAP_cosine(X₉₆)</code>
            <p>좌표는 [0,1]로 min–max 변환하지만 거리나 축에 고정된 정책 의미를 부여하지 않습니다.</p>
          </article>
        </div>
      </div>

      <div className="method-status-model" aria-labelledby="status-model-title">
        <div className="method-status-model__header">
          <div>
            <span>TARGET DOCUMENT PARSING · 2020 / 2022 / 2024</span>
            <h3 id="status-model-title">‘조치완료·조치중·향후 추진계획’을 어떻게 상태로 바꿨나</h3>
          </div>
          <StatusBadge tone="approved">64 LINKS · 41 COMPLETE / 23 ACTIVE</StatusBadge>
        </div>

        <div className="method-status-model__fields">
          <article><span>원문 열 01</span><strong>조치사항</strong><code>action_text</code><p>문서의 조치완료·조치중 선두 표기를 우선 보존</p></article>
          <ArrowRight aria-hidden="true" />
          <article><span>원문 열 02</span><strong>향후 추진계획</strong><code>future_plan_text</code><p>독립 label이 아니라 active 판단에 쓰이는 근거 필드</p></article>
          <ArrowRight aria-hidden="true" />
          <article><span>정규화</span><strong>공개 상태</strong><code>complete · active</code><p>그 밖의 값은 canvas에서 unresolved로 보존</p></article>
        </div>

        <div className="method-status-model__rules">
          <div>
            <h4>규칙 우선순위</h4>
            <ol>
              <li><strong>미조치·미완료·조치불가</strong><span>→ uncomplete</span></li>
              <li><strong>action_text가 ‘조치중’으로 시작</strong><span>→ active</span></li>
              <li><strong>action_text가 ‘조치완료’로 시작</strong><span>→ complete</span></li>
              <li><strong>명시적 완료 표현</strong><span>→ complete</span></li>
              <li><strong>향후계획 존재 또는 진행·예정 표현</strong><span>→ active</span></li>
              <li><strong>과거 조치 표현</strong><span>→ complete, 아니면 null</span></li>
            </ol>
          </div>
          <div>
            <h4>marker export 분포</h4>
            <table>
              <thead><tr><th>연도</th><th>전체</th><th>완료</th><th>진행</th></tr></thead>
              <tbody>
                {statusRows.map(([year, total, complete, active]) => (
                  <tr key={year}><th>{year}</th><td>{total}</td><td>{complete}</td><td>{active}</td></tr>
                ))}
              </tbody>
            </table>
            <p>현재 세 export의 `uncomplete`와 `null`은 0건입니다. 값이 없다는 사실과 허용 domain이 없다는 뜻은 다릅니다.</p>
          </div>
        </div>

        <div className="method-status-model__note">
          <AlertTriangle aria-hidden="true" />
          <p>
            <strong>‘향후 추진계획’은 세 번째 상태 label이 아닙니다.</strong> 원본의 별도 텍스트 열이며, 값이 있으면 active 판정의
            한 근거가 됩니다. `reported_status`는 공식 문서가 보고한 상태이고, <code>completion_verification_status</code>는 그 기록과
            근거 계보를 검토한 결과입니다. 공식 ‘완료’를 독립적인 정책 효과 검증으로 해석하지 않습니다.
          </p>
        </div>
      </div>

      <details className="method-execution-ledger">
        <summary>Notebook과 release 실행 근거 보기 <span aria-hidden="true">+</span></summary>
        <div>
          {executionRows.map(([artifact, cells, status, role]) => (
            <div key={artifact}>
              <strong>{artifact}</strong><span>{cells}</span><span>{status}</span><p>{role}</p>
            </div>
          ))}
        </div>
      </details>
      <p className="method-execution-note">
        Notebook의 코드셀 존재만으로 실행을 주장하지 않습니다. 현재 모델의 실행 증거는 P3_FINAL의 model joblib, Parquet,
        SHA-256 manifest, validation JSON과 canonical release pointer를 기준으로 판정했습니다.
      </p>
    </section>
  );
}

function EvidenceTraceability() {
  const chain = [
    ['SOURCE', 'PDF file · SHA-256'],
    ['LOCATION', 'meeting ID · page number'],
    ['SPEECH', 'turn ID · display text'],
    ['ANSWER', 'QA pair · answer unit ID'],
    ['DECISION', 'Gold label group · A1–A8'],
    ['LINK', 'target-answer link ID'],
    ['EVIDENCE', 'status · public evidence record'],
  ];
  return (
    <section className="method-section" id="evidence-traceability">
      <SectionHeading
        eyebrow="10 · EVIDENCE TRACEABILITY"
        title="화면의 한 문장을 원본까지 추적할 수 있나"
        lead="독자가 요약 문장에서 멈추지 않고 원본 문서의 위치와 판단 계보를 역추적할 수 있도록 식별자를 연결했습니다."
      />
      <div className="method-lineage">
        {chain.map(([label, value], index) => (
          <div className="method-lineage__item" key={label}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div><small>{label}</small><strong>{value}</strong></div>
            {index < chain.length - 1 ? <ArrowRight aria-hidden="true" /> : null}
          </div>
        ))}
      </div>
      <div className="method-evidence-note">
        <FileSearch aria-hidden="true" />
        <div>
          <h3>표시용 문장과 검색용 문장을 분리했습니다</h3>
          <p>
            검색에는 정규화 text를 사용하되, 인용과 근거 확인에는 원문에 가까운 display text, PDF asset ID, 시작·끝 페이지를
            사용합니다. 정규화 과정이 원문의 의미를 대신하지 않습니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function QualityAssurance() {
  const checks = [
    ['Source integrity', '49/49', 'source–destination hash 일치'],
    ['Gold integrity', '769 / 761', '정확한 라벨·그룹 수와 A1–A8 분포'],
    ['Evidence linkage', '64/64', '승인 link와 공개 evidence lineage'],
    ['Embedding matrix', '761 × 96', 'null·non-finite·entity mismatch 0'],
    ['Projection points', '761/761', '유한 좌표·PK 중복·FK orphan 0'],
    ['Canonical release', 'PASS', 'pointer·payload·manifest hash 검증'],
  ];
  return (
    <section className="method-section" id="quality-assurance">
      <SectionHeading eyebrow="11 · QUALITY ASSURANCE" title="어떤 검사를 통과해야 했나" />
      <div className="method-qa-grid">
        {checks.map(([label, value, description]) => (
          <article key={label}>
            <ShieldCheck aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <p className="method-qa-note">
        통과 표시는 해당 release에서 선언한 검사 범위에 한정됩니다. 데이터 무결성 검사가 독립적인 사실 확인이나 정책 효과
        검증을 대신하지 않습니다.
      </p>
    </section>
  );
}

function JournalismPrinciples() {
  const principles = [
    ['공식 기록도 검증 대상', '기관이 “완료”라고 보고했다는 사실과 실제 효과가 입증됐다는 판단을 분리합니다.', Scale],
    ['판단보다 행태 기술', '답변자를 평가하지 않고 답변이 취한 언어·절차의 형태를 코드북으로 기록합니다.', FileSearch],
    ['불확실성 보존', 'candidate, rejected, unknown을 숨기거나 Gold로 포장하지 않고 lifecycle 상태를 공개합니다.', Layers3],
    ['원문으로 돌아갈 권리', '요약·시각화보다 PDF 페이지와 근거 계보를 우선해 독자의 재검증 경로를 보존합니다.', Link2],
  ];
  return (
    <section className="method-section" id="journalism-principles">
      <SectionHeading eyebrow="12 · JOURNALISM PRINCIPLES" title="데이터 저널리즘 원칙" />
      <div className="method-principle-grid">
        {principles.map(([title, body, Icon]) => {
          const PrincipleIcon = Icon as typeof Scale;
          return (
            <article key={title as string}>
              <PrincipleIcon aria-hidden="true" />
              <h3>{title as string}</h3>
              <p>{body as string}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Limitations() {
  const items = [
    '분석 범위는 2020–2025년 문화체육관광위원회 국정감사 회의록과 2020·2022·2024년 시정·처리결과 자료에 한정됩니다.',
    '26,063개 전체 답변에 Gold가 부여된 것이 아닙니다. 769개 Gold label은 검토·승인된 부분 모집단입니다.',
    '64개 분석 엔터티는 target, answer, status, evidence 계보가 모두 연결된 사례이며 전체 769개 Gold의 대표 표본이라고 단정할 수 없습니다.',
    '답변 행태 코드는 문장의 진실성, 답변자의 의도, 정책의 적절성 또는 법적 책임을 판정하지 않습니다.',
    '공식 시정·처리결과의 “완료” 기록은 독립적인 현장 확인이나 정책 효과 검증과 다릅니다.',
    'target-answer link는 문서상 관계를 나타내며 인과관계나 영향의 크기를 뜻하지 않습니다.',
    '현재 UMAP의 축 자체에는 고정된 의미가 없고, 점 사이 거리도 인과관계나 통계적 유의성을 뜻하지 않습니다.',
  ];
  return (
    <section className="method-section" id="limitations">
      <SectionHeading eyebrow="13 · LIMITATIONS" title="이 분석이 말하지 않는 것" />
      <ol className="method-limitations">
        {items.map((item, index) => (
          <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>
        ))}
      </ol>
      <div className="method-pending">
        <GitBranch aria-hidden="true" />
        <div>
          <strong>CANONICAL ATLAS RELEASE · GENERATED 2026.07.24</strong>
          <p>
            P3_FINAL canonical package는 761점·24 topic bins·140 nodes를 포함합니다. 이 통과는 모델 재현성과 파일 무결성에
            관한 것이며, 군집의 실재성이나 정책적 인과를 보증하지 않습니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function VersionAndCorrectionPolicy() {
  const versions = [
    ['Data version', 'CORE_1.0.1__SEMANTIC_1.2.0__c29d2523c0ee', 'Core / Semantic SSOT'],
    ['Behavior Gold', 'BGR_20260723_174240_KST_05CBCD65', '769 labels · 761 groups'],
    ['Full Gold', 'FGR_20260723_180452_KST_EB8454A9', '64 target-answer links'],
    ['Approved evidence input', 'AAIR_20260723_205505_KST_84DD4F79', '64 link entities'],
    ['Atlas derived input', 'STATIC_ATLAS_20260723_213011_KST', '761 decision groups · 769 child labels'],
    ['Projection', 'PROJ_DG761_20260723_213011_KST_4665FDF3E5CF', 'TF-IDF–SVD96–UMAP · 761 points'],
    ['Canonical frontend release', 'ATLAS_DG761_STORY_20260724_022353_KST_BF673FD1', '140 nodes · 64 evidence · 16 story preview nodes'],
    ['Lifecycle', 'CANONICAL_RELEASE_PACKAGE_PASS', 'single active authority pointer'],
  ];
  return (
    <footer className="method-version" id="version-corrections">
      <div className="method-version__heading">
        <div>
          <p className="method-eyebrow">14 · VERSION &amp; CORRECTIONS</p>
          <h2>버전·재현성·정정 정책</h2>
        </div>
        <History aria-hidden="true" />
      </div>
      <p className="method-version__intro">
        공개 문구나 분류가 바뀌면 기존 release를 덮어쓰지 않고 새 버전, 변경 이유, 영향을 받은 데이터 단계를 기록합니다.
        원본 정정과 해석 수정은 구분해 남깁니다.
      </p>
      <dl className="method-version__list">
        {versions.map(([label, value, note]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd><strong>{value}</strong><span>{note}</span></dd>
          </div>
        ))}
      </dl>
      <div className="method-version__actions">
        <a href="#evidence-traceability"><GitBranch aria-hidden="true" />데이터 계보 보기</a>
        <a href="/methodology/behavior-codebook.csv" download><ArrowDownToLine aria-hidden="true" />코드북 내려받기</a>
        <a href="#version-corrections"><History aria-hidden="true" />정정 및 업데이트 기록</a>
      </div>
      <p className="method-version__stamp">CANONICAL DATA &amp; ATLAS RELEASE · 2026.07.24 · SEOUL, KST</p>
    </footer>
  );
}

export function MethodPage() {
  return (
    <main id="main-content" className="method-page" data-testid="methodology-page" tabIndex={-1}>
      <div className="method-page__frame">
        <MethodologyHero />
        <ScopeFactGrid />
        <div className="method-report-layout">
          <article className="method-report">
            <ResearchQuestion />
            <CollectionAndCrawling />
            <SourceCorpus />
            <DataPipeline />
            <AnswerUnitDefinition />
            <BehaviorCodebook />
            <GoldReviewProcess />
            <ProjectionPopulationDecision />
            <TechnicalModeling />
            <EvidenceTraceability />
            <QualityAssurance />
            <JournalismPrinciples />
            <Limitations />
            <VersionAndCorrectionPolicy />
          </article>
          <StickySectionNavigation />
        </div>
      </div>
    </main>
  );
}
