import React from 'react';
import { ChapterFrame } from '../../shared/ui/ChapterFrame';
import { PageFrame } from '../../shared/ui/PageFrame';
import { ContentGrid } from '../../shared/ui/ContentGrid';
import { Badge } from '../../shared/ui/Badge';
import { EDITORIAL_CASES } from '../../shared/mock/storyData';
import { useDetailNavigation } from '@/shared/hooks/useDetailNavigation';
import { FileText, ArrowRight } from 'lucide-react';

export const ChapterCases: React.FC = () => {
  const { openCase, openEvidence } = useDetailNavigation();

  return (
    <ChapterFrame id="cases" orderNumber="CHAPTER 05">
      <PageFrame>
        <div className="mb-10">
          <Badge label="심층 추적 사례" variant="neutral" className="mb-3" />
          <h2 className="type-heading-1 font-serif text-[var(--color-ink)] mb-4">
            완료라고 쓰였지만
          </h2>
          <p className="type-body-l text-[var(--color-neutral-700)] max-w-2xl">
            숫자와 지표의 그늘에 숨겨진 5대 핵심 사례입니다.
            공식 보고서의 단정한 "완료" 문구 뒤에서 실제 문화예술 현장이 마주했던 한계와 진실을 기록합니다.
          </p>
        </div>

        {/* 5 Representative Cases Grid */}
        <ContentGrid className="gap-y-8">
          {EDITORIAL_CASES.map((item) => (
            <div
              key={item.id}
              className="col-span-12 lg:col-span-6 p-6 md:p-8 bg-[var(--color-surface)] border border-[var(--color-neutral-200)] flex flex-col justify-between hover:border-[var(--color-ink)] transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--color-neutral-200)]">
                  <div className="flex items-center gap-2">
                    <span className="type-mono font-bold text-xs text-[var(--color-behavior-red-deep)] px-2 py-0.5 bg-[var(--color-behavior-red-bg)]">
                      {item.caseNumber}
                    </span>
                    <span className="type-caption font-mono text-[var(--color-neutral-500)]">
                      {item.eyebrow}
                    </span>
                  </div>
                  <span className="type-mono text-[11px] text-[var(--color-neutral-500)]">
                    {item.yearRange}
                  </span>
                </div>

                <h3 className="type-heading-2 font-serif text-[var(--color-ink)] mb-3 leading-snug">
                  {item.title}
                </h3>

                <p className="type-body-m text-[var(--color-neutral-700)] mb-6 leading-relaxed">
                  {item.summary}
                </p>

                {/* Structured Breakdown */}
                <div className="space-y-3 mb-6 bg-[var(--color-paper)] p-4 border border-[var(--color-neutral-200)]">
                  <div className="text-xs">
                    <span className="font-mono text-[var(--color-neutral-500)] block mb-0.5">요구 사항:</span>
                    <span className="font-serif font-bold text-[var(--color-ink)]">{item.demandStatement}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-mono text-[var(--color-neutral-500)] block mb-0.5">당시 답변:</span>
                    <span className="text-[var(--color-neutral-700)] italic">{item.answerStatement}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-mono text-[var(--color-neutral-500)] block mb-0.5">공식 결과:</span>
                    <span className="font-mono font-bold text-[var(--color-behavior-blue-deep)]">{item.officialOutcome}</span>
                  </div>
                  <div className="text-xs pt-2 border-t border-[var(--color-neutral-200)] text-[var(--color-behavior-red-deep)] font-medium">
                    <span className="font-mono block text-[10px] uppercase tracking-wider mb-0.5">Journalism Verification:</span>
                    <span>{item.journalismCheck}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--color-neutral-200)]">
                <button
                  type="button"
                  onClick={() => openCase(item.id)}
                  className="flex min-h-11 items-center gap-2 bg-[var(--color-ink)] px-4 py-2 font-mono text-xs text-[var(--color-paper)] transition-colors hover:bg-[var(--color-neutral-700)]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>사례 심층 분석 & 원문</span>
                </button>

                <button
                  type="button"
                  onClick={() => openEvidence(item.evidenceId)}
                  className="flex min-h-11 items-center gap-1 px-2 font-mono text-xs text-[var(--color-neutral-700)] hover:text-[var(--color-ink)]"
                >
                  <span>관련 증거 ({item.evidenceId.toUpperCase()})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </ContentGrid>
      </PageFrame>
    </ChapterFrame>
  );
};
