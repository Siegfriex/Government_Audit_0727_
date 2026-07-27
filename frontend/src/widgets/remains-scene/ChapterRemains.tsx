import React from 'react';
import { Check, Database, FileText, Share2 } from 'lucide-react';
import { Link } from 'react-router';

import { ChapterFrame } from '../../shared/ui/ChapterFrame';
import { PageFrame } from '../../shared/ui/PageFrame';

const EVASIVE_BY_YEAR = [
  { year: 2020, value: 201 }, { year: 2021, value: 176 }, { year: 2022, value: 250 },
  { year: 2023, value: 104 }, { year: 2024, value: 428 }, { year: 2025, value: 249 },
];

export const ChapterRemains: React.FC = () => {
  const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'error'>('idle');

  React.useEffect(() => {
    if (copyState === 'idle') return;
    const timeout = window.setTimeout(() => setCopyState('idle'), 2500);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const handleCopyCitation = async () => {
    const citationText = '문체위 국정감사 6년: 요구–답변–처리결과 사이의 간극을 추적하는 Editorial Scrollytelling (2020–2025)';
    try {
      await navigator.clipboard.writeText(citationText);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  };

  return (
    <ChapterFrame id="remains" orderNumber="CHAPTER 06" className="story-chapter story-chapter--remains">
      <PageFrame>
        <header className="story-editorial-header">
          <div>
            <p className="story-hierarchy-1 story-accent-red">결언 및 후속 과제 / CONCLUSION</p>
            <h2 className="story-hierarchy-5">끝나지 않은 문장</h2>
          </div>
          <p className="story-hierarchy-4">감사는 반복됐지만, 답변 방식과 현장의 위험은 충분히 달라지지 않았습니다.</p>
        </header>

        <section className="story-remains-summary" aria-label="기사 결론 요약">
          <p className="story-remains-summary__eyebrow story-hierarchy-1">FINAL FINDING / EDITORIAL VERDICT</p>
          <div className="story-reading-column">
            <p className="story-hierarchy-2 story-dropcap">
              기사 원고의 집계에서는 시정요구 사항의 47%가 아직 완전히 이행되지 않았습니다. ‘조치 완료’로 종결된 SPC 사례에서도
              산업재해가 반복됐고, ‘조치 중’인 체대 입시 도핑 문제는 수년이 지나도록 협의 결과를 확인하기 어려웠습니다.
            </p>
            <p className="story-hierarchy-2">
              여기에 2020년부터 2025년까지 회의록에서 분류된 회피성 답변 1,408건을 함께 놓으면,
              국정감사가 실제 기관 행태와 정책 집행을 바꾸는 장치로 작동했는지를 다시 묻게 됩니다.
            </p>
          </div>

          <div className="story-remains-finding">
            <p className="story-hierarchy-1">EVASIVE ANSWERS / 2020—2025</p>
            <strong>1,408</strong><span>건</span>
            <h3 className="story-hierarchy-3">감사장에서 반복된 회피성 답변</h3>
            <div className="story-remains-spark" role="group" aria-label="연도별 회피성 답변 수">
              {EVASIVE_BY_YEAR.map((item) => (
                <div key={item.year} className={item.year === 2024 ? 'is-peak' : ''}>
                  <span style={{ height: `${Math.max(18, (item.value / 428) * 100)}%` }} aria-hidden="true" />
                  <b>{item.value}</b><small>{item.year}</small>
                </div>
              ))}
            </div>
            <p className="story-hierarchy-2"><strong>2024년 428건.</strong> 누적 → 급증 → 반복의 궤적입니다.</p>
          </div>
        </section>

        <blockquote className="story-final-appeal">
          <p>
            공식 보고서의 단정한 수치 뒤에 가려진 행태를 계속 추적하고 기록하는 일. 그것이 시민 저널리즘이 의회 민주주의와
            행정부 사이에 그어야 할 끊어지지 않는 선입니다.
          </p>
          <footer>
            <span>LAST APPEAL / PUBLIC RECORD</span>
            <strong>기록은 ‘완료’ 상태에서 멈추지 않습니다.</strong>
          </footer>
        </blockquote>

        <div className="story-remains-actions">
          <Link to="/method" className="atlas-action-primary"><FileText className="h-4 w-4" aria-hidden="true" />분석 방법론 & 출처 계약</Link>
          <Link to="/data" className="atlas-action-secondary"><Database className="h-4 w-4" aria-hidden="true" />데이터 스키마 & 약관</Link>
          <button type="button" onClick={handleCopyCitation} className="atlas-action-secondary">
            {copyState === 'copied' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
            {copyState === 'copied' ? '인용구 복사됨' : copyState === 'error' ? '복사 실패 · 다시 시도' : '작품 인용구 복사'}
          </button>
          <span className="sr-only" aria-live="polite">{copyState === 'copied' ? '작품 인용구를 클립보드에 복사했습니다.' : copyState === 'error' ? '클립보드 복사에 실패했습니다.' : ''}</span>
        </div>
        <p className="story-remains-source story-hierarchy-1">국회 문화체육관광위원회 2020–2025 국정감사 기록 데이터 에세이</p>
      </PageFrame>
    </ChapterFrame>
  );
};
