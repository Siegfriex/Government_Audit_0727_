import publicDataPlaceholder from '@/assets/editorial/public-data-placeholder.svg';

import { ChapterFrame } from '@/shared/ui/ChapterFrame';
import { PageFrame } from '@/shared/ui/PageFrame';

// The portfolio build excludes third-party editorial binaries whose reuse rights
// are not part of the public data contract. Captions remain as context while a
// repository-owned neutral placeholder keeps the layout stable.
const auditPhoto = publicDataPlaceholder;
const dopingReportExcerpt = publicDataPlaceholder;
const lawmakerPhoto = publicDataPlaceholder;
const memorialPhoto = publicDataPlaceholder;
const ministerPhoto = publicDataPlaceholder;
const spcLogo = publicDataPlaceholder;

interface EditorialFigureProps {
  src: string;
  alt: string;
  caption: string;
  source: string;
  className?: string;
  contain?: boolean;
}

const RECORD_TRACE = [
  { year: '2022', label: '사고', detail: 'SPL 평택공장 노동자 사망사고' },
  { year: '사고 이후', label: '감독', detail: '고용노동부 SPC 계열사 기획감독' },
  { year: '감독 결과', label: '시정', detail: '산업안전보건법 위반 및 시정조치' },
  { year: '행정상 처리', label: '완료', detail: '공식 문서에 시정조치 완료 보고' },
  { year: '그 이후', label: '반복', detail: '유사 안전사고와 중대재해 재발' },
];

const EVASIVE_BY_YEAR = [
  { year: 2020, value: 201 },
  { year: 2021, value: 176 },
  { year: 2022, value: 250 },
  { year: 2023, value: 104 },
  { year: 2024, value: 428 },
  { year: 2025, value: 249 },
];

const IMPLEMENTATION_BY_YEAR = [
  { year: 2020, complete: 159, active: 317, completeRate: 33.4, activeRate: 66.6 },
  { year: 2022, complete: 354, active: 147, completeRate: 70.7, activeRate: 29.3 },
  { year: 2024, complete: 317, active: 272, completeRate: 53.8, activeRate: 46.2 },
];

const DOPING_POLICY_STEPS = [
  { eyebrow: '국정감사 지적', title: '입시 반영 필요', detail: '도핑 제재 이력을 체육특기자 전형에 반영할 기준 요구' },
  { eyebrow: '정부 답변', title: '관계기관 협의', detail: '교육부·대교협·대학스포츠협의회와 제도 개선 검토' },
  { eyebrow: '행정상 상태', title: '조치 중', detail: '국회 제출 결과보고서에는 장기 진행 상태로 분류' },
  { eyebrow: '협의 장기화', title: '공개 부족', detail: '추진 일정과 기관별 논의 내용은 충분히 공개되지 않음' },
  { eyebrow: '2026 확인', title: '결과 미확인', detail: '입시 반영 기준과 공식 제도화 결과를 찾기 어려움' },
];

const DOPING_CASE_STEPS = [
  { eyebrow: '선수 A', title: '고교 럭비선수', detail: '전국종별선수권대회 출전' },
  { eyebrow: '검사', title: '도핑 양성', detail: '메틸프레드니솔론 검출' },
  { eyebrow: '징계', title: '실적 박탈', detail: '자격 정지 1년 6개월' },
  { eyebrow: '입시 제도', title: '반영 규정 없음', detail: '제재 이력이 전형 기준에서 작동하지 않음' },
  { eyebrow: '2022', title: '대학 합격', detail: '자격 정지 상태에서 체육특기자 전형 입학' },
];

function EditorialFigure({ src, alt, caption, source, className = '', contain = false }: EditorialFigureProps) {
  return (
    <figure className={`story-figure ${className}`.trim()}>
      <div className="story-figure__image-wrap">
        <img
          src={src}
          alt={alt}
          className={contain ? 'story-figure__image story-figure__image--contain' : 'story-figure__image'}
          loading="lazy"
        />
        <span className="story-figure__stamp" aria-hidden="true">PDF SOURCE / RIGHTS REVIEW</span>
      </div>
      <figcaption className="story-figure__caption">
        <span>{caption}</span>
        <span className="story-figure__source">출처 · {source}</span>
      </figcaption>
    </figure>
  );
}

function NativeFlow({ title, steps, caption }: { title: string; steps: typeof DOPING_POLICY_STEPS; caption: string }) {
  return (
    <figure className="story-native-figure">
      <header>
        <p className="story-hierarchy-1">NATIVE EDITORIAL GRAPHIC / HTML + CSS</p>
        <h3 className="story-hierarchy-3">{title}</h3>
      </header>
      <ol className="story-native-flow">
        {steps.map((step, index) => (
          <li key={`${step.eyebrow}-${step.title}`}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <p className="story-hierarchy-1">{step.eyebrow}</p>
            <h4>{step.title}</h4>
            <p>{step.detail}</p>
          </li>
        ))}
      </ol>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function ExecutionOverview() {
  return (
    <figure className="story-execution-figure">
      <header>
        <p className="story-hierarchy-1">2020 · 2022 · 2024 RESULT REPORTS</p>
        <h3 className="story-hierarchy-3">연도별 조치 완료와 조치 중 비중</h3>
      </header>
      <div className="story-execution-bars">
        {IMPLEMENTATION_BY_YEAR.map((item) => (
          <div key={item.year}>
            <div className="story-execution-bars__label"><strong>{item.year}</strong><span>{item.complete + item.active}건</span></div>
            <div className="story-execution-bars__track" role="img" aria-label={`${item.year}년 완료 ${item.complete}건 ${item.completeRate}퍼센트, 조치 중 ${item.active}건 ${item.activeRate}퍼센트`}>
              <span className="is-complete" style={{ width: `${item.completeRate}%` }}><b>{item.complete}</b><small>{item.completeRate}%</small></span>
              <span className="is-active" style={{ width: `${item.activeRate}%` }}><b>{item.active}</b><small>{item.activeRate}%</small></span>
            </div>
          </div>
        ))}
      </div>
      <figcaption><span>■ 조치 완료 830건</span><span>■ 조치 중·향후 계획 736건</span><strong>합계 1,566건</strong></figcaption>
    </figure>
  );
}

export function ChapterApprovedScale() {
  return (
    <ChapterFrame id="scale" orderNumber="CHAPTER 01" className="story-chapter story-chapter--scale">
      <PageFrame>
        <header className="story-editorial-header story-editorial-header--wide">
          <div>
            <p className="story-hierarchy-1 story-accent-red">전체 이행 현황 / 2020 · 2022 · 2024</p>
            <h2 className="story-hierarchy-5">요구한 것 중,<br />얼마나 조치됐나</h2>
          </div>
          <p className="story-hierarchy-4">
            결과보고서 1,566건 가운데 830건은 완료, 736건은 여전히 조치 중이었습니다.
          </p>
        </header>

        <div className="story-finding-metrics" role="group" aria-label="기사 원고 시정 처리 요구 집계">
          <article className="story-finding-metrics__total">
            <p className="story-hierarchy-1">TOTAL REQUESTS</p><strong>1,566</strong><span>건</span><p>시정·처리요구 사항</p>
          </article>
          <article>
            <p className="story-hierarchy-1">COMPLETE</p><strong>830</strong><span>건</span><p>53.0% · 조치 완료</p>
          </article>
          <article className="story-finding-metrics__risk">
            <p className="story-hierarchy-1">STILL ACTIVE</p><strong>736</strong><span>건</span><p>47.0% · 조치 중·향후 계획</p>
          </article>
        </div>

        <div className="story-gap-layout">
          <EditorialFigure
            src={auditPhoto}
            alt="국회 문화체육관광위원회 국정감사장에서 의원이 마이크 앞에서 질의하는 모습"
            caption="국정감사 이후 결과보고서는 통상 2년 뒤 제출된다. 그때까지도 ‘조치 중’인 요구가 47%였다."
            source="포토뉴스 · 사용자 제공 PDF 수록본"
          />
          <div className="story-reading-column">
            <p className="story-hierarchy-2 story-dropcap">
              2020년, 2022년, 2024년 문화체육관광위원회 결과보고서를 분석한 결과 전체 시정·처리요구 1,566건 가운데
              830건(53.0%)은 조치 완료, 736건(47.0%)은 조치 중 또는 향후 조치계획으로 집계됐습니다.
            </p>
            <p className="story-hierarchy-2">
              장기 조치가 필요한 사안도 분명 존재합니다. 그러나 국정감사 이후 2년이 지나 제출되는 보고서에서도 약 절반이
              ‘조치 중’이라면, 완료 여부뿐 아니라 일정과 장애 요인, 다음 확인 시점을 함께 공개할 필요가 있습니다.
            </p>
            <blockquote className="story-callout story-hierarchy-3">
              “2년이 넘었는데 아직도 조치 중?” 상태 라벨만으로는 정책이 움직이고 있는지 판단하기 어렵습니다.
            </blockquote>
          </div>
        </div>

        <ExecutionOverview />

        <section className="story-case-transition" aria-labelledby="doping-case-heading">
          <p className="story-hierarchy-1 story-accent-red">CASE 01 / 체대 입시 도핑</p>
          <h3 id="doping-case-heading" className="story-hierarchy-5">“조치 중” 3년째…<br />관계기관 협의는 어디까지 왔나</h3>
          <p className="story-hierarchy-4">완료율의 반대편에서, 장기 진행 상태가 무엇을 감추는지 한 사례를 따라갑니다.</p>
        </section>

        <NativeFlow
          title="국정감사 지적에서 2026년 확인까지"
          steps={DOPING_POLICY_STEPS}
          caption="‘조치 중’이라는 분류만으로는 정책 진행 정도를 알기 어렵다. 협의 과정·일정·제도화 여부를 함께 공개해야 한다."
        />

        <div className="story-scale-lede">
          <NativeFlow
            title="도핑 적발 뒤에도 대학 입시가 가능했던 경로"
            steps={DOPING_CASE_STEPS}
            caption="기사에 제시된 사실관계를 이 페이지의 네이티브 시각 언어로 재구성했다."
          />
          <div className="story-reading-column">
            <p className="story-hierarchy-2 story-dropcap">
              고교 3학년 럭비선수 A씨는 메틸프레드니솔론 검출로 경기 실적을 박탈당하고 1년 6개월 자격 정지 처분을 받았습니다.
              그러나 제재 이력을 대학 입시에 반영하는 규정이 없어, 자격 정지 상태에서 2022년 체육특기자 전형으로 입학했습니다.
            </p>
            <p className="story-hierarchy-2">
              문체부는 교육부·한국대학교육협의회·한국대학스포츠협의회와 제도 개선을 협의하겠다고 답했습니다.
              하지만 2026년 현재 공식 자료에서 협의 완료나 입시 반영 기준을 확인하기 어렵습니다.
            </p>
            <p className="story-hierarchy-2">
              여러 기관이 참여하는 정책은 조정과 법적 검토에 시간이 걸릴 수 있습니다. 그럴수록 협의 단계와 일정,
              추진 현황을 주기적으로 공개해야 시민이 진행과 중단을 구분할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="story-media-pair">
          <blockquote className="story-callout story-hierarchy-3">행정 상태가 ‘진행’이라고 쓰였다는 사실과, 제도가 실제로 바뀌었다는 사실은 같지 않습니다.</blockquote>
          <EditorialFigure
            src={lawmakerPhoto}
            alt="국회 문화체육관광위원회 국정감사에서 발언하는 이병훈 의원"
            caption="이병훈 의원은 체대 입시가 도핑 사각지대에 놓였다고 지적했다."
            source="뉴시스"
          />
        </div>

        <figure className="story-document-excerpt">
          <img src={dopingReportExcerpt} alt="체대 입시에 도핑 제재 이력이 반영되도록 관계기관 대책 논의가 필요하며 조치 중이라고 적힌 결과보고서 발췌" />
          <figcaption>국정감사결과 시정조치 및 결과보고서 · 요구사항 139번</figcaption>
        </figure>

      </PageFrame>
    </ChapterFrame>
  );
}

export function ChapterApprovedRecord() {
  return (
    <ChapterFrame id="record" orderNumber="CHAPTER 02" className="story-chapter story-chapter--record">
      <PageFrame>
        <header className="story-editorial-header">
          <div>
            <p className="story-hierarchy-1 story-accent-red">증거 사슬 / PAPER COMPLETION, FIELD RISK</p>
            <h2 className="story-hierarchy-5">“조치 완료” 보고 뒤에도<br />반복된 사망사고</h2>
          </div>
          <p className="story-hierarchy-4">서류와 현장의 간극을 한 사건의 시간축으로 다시 읽습니다.</p>
        </header>

        <div className="story-record-copy">
          <p className="story-hierarchy-2 story-dropcap">
            2022년 SPL 평택 제빵공장에서 20대 노동자가 컨베이어 벨트에 끼여 숨진 뒤, 고용노동부는 SPC 계열사 전반을
            대상으로 특별기획감독을 실시했습니다. 감독에서는 위험기계 안전장치와 방호장치, 작업절차, 위험성 평가 등
            기본 안전관리 위반이 다수 확인됐고 정부는 시정명령 뒤 대부분 개선됐다고 발표했습니다.
          </p>
          <p className="story-hierarchy-2">
            그러나 이후에도 계열 사업장에서 기계 끼임과 안전수칙 미준수 사례가 이어졌고 중대재해가 다시 발생했습니다.
            문서상 ‘조치 완료’가 현장의 위험 제거와 같은 뜻인지 확인하려면, 동일 사고 재발과 후속 현장점검 결과를 함께 봐야 합니다.
          </p>
        </div>

        <ol className="story-redline-timeline" aria-label="SPC 안전 문제 5단계 증거 사슬">
          {RECORD_TRACE.map((step, index) => (
            <li key={step.year}>
              <span className="story-redline-timeline__node" aria-hidden="true">{index + 1}</span>
              <p className="story-hierarchy-1">{step.year}</p>
              <h3 className="story-hierarchy-3">{step.label}</h3>
              <p className="story-hierarchy-2">{step.detail}</p>
            </li>
          ))}
        </ol>

        <blockquote className="story-fullwidth-quote story-hierarchy-4">
          <p>시정조치 건수와 완료율만으로는 충분하지 않습니다. 이후 같은 사고가 재발했는지, 작업 현장이 실제로 바뀌었는지를 확인해야 합니다.</p>
        </blockquote>

        <div className="story-record-evidence">
          <EditorialFigure
            src={memorialPhoto}
            alt="SPC 계열 제빵공장 노동자 사망사고 희생자를 추모하는 빈소"
            caption="‘조치 완료’라는 행정적 결과 이후에도 현장의 위험이 제거됐는지 다시 물어야 했다."
            source="사용자 제공 PDF 수록 보도사진"
          />
          <EditorialFigure
            src={spcLogo}
            alt="SPC그룹 로고"
            caption="SPC 사례는 행정적 완료와 현장 개선 사이의 간극을 보여주는 대표 사례다."
            source="Liberty Korea Post News 워터마크 수록본"
            contain
          />
        </div>

      </PageFrame>
    </ChapterFrame>
  );
}

export function ChapterApprovedGap() {
  return (
    <ChapterFrame id="gap" orderNumber="CHAPTER 03" className="story-chapter story-chapter--gap">
      <PageFrame>
        <header className="story-editorial-header story-editorial-header--wide">
          <div>
            <p className="story-hierarchy-1 story-accent-red">두 사례를 관통하는 의미 / BEYOND STATUS</p>
            <h2 className="story-hierarchy-5">완료와 진행,<br />그 사이를 묻다</h2>
          </div>
          <p className="story-hierarchy-4">하나는 완료됐지만 효과를 확인할 수 없고, 다른 하나는 진행 중이지만 과정을 확인하기 어렵습니다.</p>
        </header>

        <div className="story-contrast-grid">
          <article>
            <p className="story-hierarchy-1">SPC / REPORTED COMPLETE</p>
            <strong>완료</strong>
            <h3 className="story-hierarchy-3">효과가 확인되지 않는 문제</h3>
            <p className="story-hierarchy-2">행정적으로 시정이 끝났다고 기록됐지만 현장에서는 같은 유형의 위험과 사고가 반복됐습니다.</p>
          </article>
          <article>
            <p className="story-hierarchy-1">DOPING / STILL ACTIVE</p>
            <strong>진행</strong>
            <h3 className="story-hierarchy-3">과정이 보이지 않는 문제</h3>
            <p className="story-hierarchy-2">관계기관 협의가 계속된다고 기록됐지만 일정과 논의 결과, 제도화 단계는 확인하기 어렵습니다.</p>
          </article>
        </div>

        <div className="story-gap-meaning">
          <p className="story-hierarchy-2 story-dropcap">
            두 사례는 국정감사 결과보고서가 ‘완료’, ‘조치 중’, ‘미조치’ 같은 행정 분류에 머물러서는 안 된다는 점을 보여줍니다.
            정책이 현장에서 어떤 변화를 만들었는지, 추진 과정이 시민에게 투명하게 공개되는지를 함께 평가해야 합니다.
          </p>
          <div className="story-reading-column">
            <p className="story-hierarchy-2">완료에는 재발 여부와 사후 점검이 뒤따라야 하고, 진행에는 일정·협의 주체·다음 공개 시점이 따라야 합니다.</p>
            <blockquote className="story-callout story-hierarchy-3">상태를 세는 감사에서, 변화를 검증하는 감사로.</blockquote>
          </div>
        </div>
      </PageFrame>
    </ChapterFrame>
  );
}

export function ChapterApprovedCases() {
  const maxEvasive = Math.max(...EVASIVE_BY_YEAR.map((item) => item.value));

  return (
    <ChapterFrame id="cases" orderNumber="CHAPTER 05" className="story-chapter story-chapter--cases">
      <PageFrame>
        <header className="story-editorial-header story-editorial-header--wide">
          <div>
            <p className="story-hierarchy-1 story-accent-red">회피성 답변 / ANSWER BEHAVIOR</p>
            <h2 className="story-hierarchy-5">“모르겠습니다.”<br />“기억이 안 납니다.”</h2>
          </div>
          <p className="story-hierarchy-4">감사장에서 계속된 회피성 발언은 6년간 1,408건이었습니다.</p>
        </header>

        <p className="story-cases-definition story-hierarchy-2">
          회피답변은 <strong>기억부재</strong>(“기억이 나지 않습니다”), <strong>정보 없음</strong>(“모르겠습니다”, “확인해보겠습니다”),
          <strong>질문 비직접 대응</strong>(질문과 맞지 않는 답변)으로 정의했습니다. 2020~2025년 회의록을 같은 기준으로 분류해
          연도별 변화와 실제 질의 장면을 함께 읽었습니다.
        </p>

        <div className="story-cases-hero">
          <div className="story-cases-hero__metric">
            <p className="story-hierarchy-1">2020—2025 / EVASIVE ANSWERS</p>
            <strong>1,408</strong><span>건</span>
            <p className="story-hierarchy-2">회의록에서 확인된 기억부재·정보 없음·질문 비직접 대응</p>
          </div>
          <EditorialFigure
            src={ministerPhoto}
            alt="2024년 국정감사에서 답변하는 유인촌 문화체육관광부 장관"
            caption="2024년 실제 질의에서 ‘제가 있을 때 일어난 일이 아니기 때문에 잘 모르겠습니다’라는 답변이 나왔다."
            source="포토뉴스"
          />
        </div>

        <section className="story-quote-record">
          <header>
            <p className="story-hierarchy-1">2024 국정감사 실제 질의 / 잼버리 K-POP 콘서트</p>
            <h3 className="story-hierarchy-3">답변자 · 유인촌 문화체육관광부 장관</h3>
          </header>
          <blockquote>
            <p><span>질문</span> “문체부가 서울월드컵경기장 대관료를 얼마나 냈는지 알고 계십니까?”</p>
            <p><span>답변</span> “제가 있을 때 일어난 일이 아니기 때문에 저는 잘 모르겠습니다.”</p>
            <p><span>질문</span> “훼손된 상암구장 잔디에 대한 적절한 사후조치를 했다고 생각하십니까?”</p>
            <p><span>답변</span> “글쎄요, 그때는 제가 없어서 잘 모르겠는데요.”</p>
          </blockquote>
        </section>

        <section className="story-year-bars" aria-labelledby="evasive-year-heading">
          <header>
            <p className="story-hierarchy-1">YEARLY TRANSCRIPT COUNT</p>
            <h3 id="evasive-year-heading" className="story-hierarchy-3">2024년 428건으로 급증</h3>
          </header>
          <div className="story-year-bars__plot">
            {EVASIVE_BY_YEAR.map((item) => (
              <div key={item.year} className={item.year === 2024 ? 'is-peak' : ''}>
                <span className="story-year-bars__value">{item.value}</span>
                <span className="story-year-bars__bar" style={{ height: `${Math.max(18, (item.value / maxEvasive) * 100)}%` }} aria-hidden="true" />
                <span className="story-year-bars__year">{item.year}</span>
              </div>
            ))}
          </div>
          <p className="story-contract-note">기사 원고가 정의한 회피성 답변 기준에 따른 회의록 분류값입니다. 승인 Atlas의 behavior label 분포와 같은 집계로 간주하지 않습니다.</p>
        </section>

      </PageFrame>
    </ChapterFrame>
  );
}
