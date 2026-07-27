import React, { useState } from 'react';
import { ChapterFrame } from '../../shared/ui/ChapterFrame';
import { PageFrame } from '../../shared/ui/PageFrame';
import { ContentGrid } from '../../shared/ui/ContentGrid';
import { Badge } from '../../shared/ui/Badge';
import { MOCK_EVIDENCES } from '../../shared/mock/storyData';
import { useDetailNavigation } from '@/shared/hooks/useDetailNavigation';
import { FileSearch, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ChapterRecord: React.FC = () => {
  const { openEvidence } = useDetailNavigation();
  const [selectedEvidenceIndex, setSelectedEvidenceIndex] = useState(0);

  const activeItem = MOCK_EVIDENCES[selectedEvidenceIndex] || MOCK_EVIDENCES[0];

  return (
    <ChapterFrame id="record" orderNumber="CHAPTER 02">
      <PageFrame>
        <div className="mb-10">
          <Badge label="증거 사슬" variant="neutral" className="mb-3" />
          <h2 className="type-heading-1 font-serif text-[var(--color-ink)] mb-4">
            요구에서 결과까지의 사슬
          </h2>
          <p className="type-body-l text-[var(--color-neutral-700)] max-w-2xl">
            국정감사의 한 질문이 공식 보고서의 문장으로 정착하기까지 거치는 5단계 증거 사슬(Evidence Chain)입니다.
            문장이 변형되는 지점에서 저널리즘적 간극이 발생합니다.
          </p>
        </div>

        {/* Evidence Switcher Bar */}
        <div
          className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-[var(--color-neutral-200)] pb-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-behavior-red-deep)]"
          role="region"
          aria-label="증거 사안 가로 선택 목록"
          tabIndex={0}
        >
          <span className="type-caption font-mono text-[var(--color-neutral-500)] mr-2 shrink-0">
            사안 선택:
          </span>
          {MOCK_EVIDENCES.map((ev, idx) => (
            <button
              type="button"
              key={ev.id}
              onClick={() => setSelectedEvidenceIndex(idx)}
              className={`min-h-11 px-3 py-1.5 text-xs font-mono border whitespace-nowrap transition-all ${
                selectedEvidenceIndex === idx
                  ? 'bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)] font-bold'
                  : 'bg-[var(--color-surface)] border-[var(--line-strong)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]'
              }`}
            >
              {ev.id.toUpperCase()} · {ev.issue.slice(0, 18)}...
            </button>
          ))}
        </div>

        {/* 5-Step Evidence Chain Interactive Stage */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-neutral-200)] p-6 md:p-8">
          {/* Top Chain Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[var(--color-neutral-200)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="type-mono text-xs font-bold text-[var(--color-behavior-red-deep)]">
                  {activeItem.id.toUpperCase()}
                </span>
                <span className="type-caption text-[var(--color-neutral-500)]">
                  {activeItem.auditYear}년 국정감사 · {activeItem.targetOrg}
                </span>
              </div>
              <h3 className="type-heading-2 font-serif text-[var(--color-ink)]">
                {activeItem.issue}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => openEvidence(activeItem.id)}
              className="flex min-h-11 items-center gap-2 bg-[var(--color-ink)] px-4 py-2 font-mono text-xs text-[var(--color-paper)] transition-colors hover:bg-[var(--color-neutral-700)]"
            >
              <FileSearch className="w-4 h-4" />
              <span>전체 원문 및 증거 드로어 열기</span>
            </button>
          </div>

          {/* 5-Step Grid */}
          <ContentGrid className="gap-y-6">
            {/* Step 1: Demand */}
            <div className="col-span-12 lg:col-span-4 p-5 bg-[var(--color-paper)] border border-[var(--color-neutral-200)]">
              <div className="flex items-center justify-between mb-3">
                <span className="type-mono text-xs font-bold text-[var(--color-neutral-500)]">STEP 01</span>
                <Badge label="국정감사 요구" variant="neutral" />
              </div>
              <div className="type-caption text-[var(--color-neutral-500)] mb-2 font-mono">
                질의자: {activeItem.questioner}
              </div>
              <p className="type-body-m font-serif font-bold text-[var(--color-ink)] leading-snug">
                "{activeItem.issue}"
              </p>
            </div>

            {/* Step 2: Question Excerpt */}
            <div className="col-span-12 lg:col-span-4 p-5 bg-[var(--color-paper)] border border-[var(--color-neutral-200)]">
              <div className="flex items-center justify-between mb-3">
                <span className="type-mono text-xs font-bold text-[var(--color-neutral-500)]">STEP 02</span>
                <Badge label="속기록 실질 질의" variant="neutral" />
              </div>
              <p className="type-body-m text-[var(--color-neutral-700)] italic leading-relaxed">
                {activeItem.questionExcerpt}
              </p>
            </div>

            {/* Step 3: Official Answer */}
            <div className="col-span-12 lg:col-span-4 p-5 bg-[var(--color-paper)] border border-[var(--color-neutral-200)]">
              <div className="flex items-center justify-between mb-3">
                <span className="type-mono text-xs font-bold text-[var(--color-neutral-500)]">STEP 03</span>
                <Badge label={activeItem.behaviorLabel} variant="behavior" family={activeItem.behaviorType.startsWith('A1') || activeItem.behaviorType.startsWith('A6') || activeItem.behaviorType.startsWith('A8') ? 'red' : activeItem.behaviorType.startsWith('A5') || activeItem.behaviorType.startsWith('A7') ? 'blue' : 'amber'} />
              </div>
              <p className="type-body-m text-[var(--color-neutral-900)] leading-relaxed">
                {activeItem.answerExcerpt}
              </p>
            </div>

            {/* Step 4: Reported Outcome */}
            <div className="col-span-12 lg:col-span-6 p-5 bg-[var(--color-paper)] border border-[var(--color-neutral-200)]">
              <div className="flex items-center justify-between mb-3">
                <span className="type-mono text-xs font-bold text-[var(--color-neutral-500)]">STEP 04</span>
                <Badge label={activeItem.reportedStatusLabel} variant="status" status={activeItem.reportedStatus} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-behavior-blue-deep)]" />
                <span className="type-caption font-bold text-[var(--color-ink)]">공식 보고서 최종 기재 상태</span>
              </div>
              <p className="type-caption text-[var(--color-neutral-700)]">
                출처: {activeItem.sourceLabel} ({activeItem.sourcePage})
              </p>
            </div>

            {/* Step 5: Journalism Check */}
            <div className="col-span-12 lg:col-span-6 p-5 bg-[var(--color-behavior-red-bg)] border border-[var(--color-behavior-red-soft)]">
              <div className="flex items-center justify-between mb-3">
                <span className="type-mono text-xs font-bold text-[var(--color-behavior-red-deep)]">STEP 05</span>
                <span className="type-mono text-xs font-bold text-[var(--color-behavior-red-deep)]">저널리즘 실질 검증</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--color-behavior-red-deep)] shrink-0 mt-0.5" />
                <div>
                  <p className="type-body-m font-bold text-[var(--color-behavior-red-deep)] mb-1">
                    {activeItem.verificationLabel}
                  </p>
                  <p className="type-caption text-[var(--color-neutral-700)]">
                    {activeItem.verificationDetail}
                  </p>
                </div>
              </div>
            </div>
          </ContentGrid>
        </div>
      </PageFrame>
    </ChapterFrame>
  );
};
