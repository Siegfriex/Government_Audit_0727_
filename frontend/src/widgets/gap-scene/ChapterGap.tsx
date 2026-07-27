import React, { useState } from 'react';
import { ChapterFrame } from '../../shared/ui/ChapterFrame';
import { PageFrame } from '../../shared/ui/PageFrame';
import { ContentGrid } from '../../shared/ui/ContentGrid';
import { Badge } from '../../shared/ui/Badge';
import { LineSymbol } from '../../shared/ui/LineSymbol';
import { SankeyFlowDiagram } from '../../shared/ui/SankeyFlowDiagram';
import { MOCK_EVIDENCES } from '../../shared/mock/storyData';
import { useDetailNavigation } from '@/shared/hooks/useDetailNavigation';
import { LineStyle, ReportedStatus } from '../../shared/types/story';
import { Filter, Eye } from 'lucide-react';

export const ChapterGap: React.FC = () => {
  const { openEvidence } = useDetailNavigation();
  const [activeStatusFilter, setActiveStatusFilter] = useState<ReportedStatus | 'all'>('all');

  const lineLegend: Array<{ style: LineStyle; label: string; desc: string }> = [
    { style: 'solid', label: '실질 완결 (Solid Line)', desc: '법안 제정 및 예산 반영으로 현장 시정이 완료된 선' },
    { style: 'dashed', label: '진행 중 (Dashed Line)', desc: '부처 간 협의나 예산 심의가 진행 중인 선' },
    { style: 'dotted', label: '미확정 / 요약 대체 (Dotted Line)', desc: '공식 보고서엔 완료로 쓰였으나 요약본 대치 등에 그친 선' },
    { style: 'break', label: '근거 누락 / 단절 (Broken Line)', desc: '이행 과제가 공백 상태로 방치되거나 실질 미완료된 선' },
    { style: 'loop', label: '반복 질의 (Looping Line)', desc: '매년 동일 답변이 반복되는 순환 구조 선' },
  ];

  const filteredEvidences = activeStatusFilter === 'all'
    ? MOCK_EVIDENCES
    : MOCK_EVIDENCES.filter((ev) => ev.reportedStatus === activeStatusFilter);

  return (
    <ChapterFrame id="gap" orderNumber="CHAPTER 03">
      <PageFrame>
        <div className="mb-10">
          <Badge label="간극과 명암" variant="neutral" className="mb-3" />
          <h2 className="type-heading-1 font-serif text-[var(--color-ink)] mb-4">
            "2년이 넘었는데 아직도 조치중?" 도대체 언제까지 조치중인가?
          </h2>
          <p className="type-body-l text-[var(--color-neutral-700)] max-w-2xl">
            총 1,566건의 시정·처리요구 사항 중 830건(53.0%)은 조치가 완료됐으며, 736건(47.0%)은 조치 중(향후 조치계획 포함)인 것으로 집계됐다.
          </p>
        </div>

        {/* Line Style Legend Cards */}
        <ContentGrid className="mb-12">
          {lineLegend.map((item) => (
            <div
              key={item.style}
              className="col-span-12 sm:col-span-6 lg:col-span-4 p-4 bg-[var(--color-surface)] border border-[var(--color-neutral-200)] flex flex-col justify-between"
            >
              <div>
                <div className="mb-3">
                  <LineSymbol style={item.style} length={120} label={item.label} />
                </div>
                <p className="type-caption text-[var(--color-neutral-700)]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </ContentGrid>

        {/* Interactive Sankey Horizontal Flow Diagram */}
        <div className="mb-12">
          <SankeyFlowDiagram />
        </div>

        {/* Status Lane Filter Bar */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-neutral-200)] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-neutral-200)]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--color-neutral-500)]" />
              <h3 className="type-heading-2 font-serif text-[var(--color-ink)]">
                상태 레인(Status Lane) 분류 탐색
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveStatusFilter('all')}
                className={`min-h-11 px-3 py-1.5 border transition-all ${
                  activeStatusFilter === 'all'
                    ? 'bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)] font-bold'
                    : 'border-[var(--line-strong)] hover:bg-[var(--color-neutral-100)]'
                }`}
              >
                전체 레인 보기 ({MOCK_EVIDENCES.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveStatusFilter('complete')}
                className={`min-h-11 px-3 py-1.5 border transition-all ${
                  activeStatusFilter === 'complete'
                    ? 'bg-[var(--color-behavior-blue-deep)] text-white border-[var(--color-behavior-blue-deep)] font-bold'
                    : 'border-[var(--line-strong)] hover:bg-[var(--color-neutral-100)]'
                }`}
              >
                추진완료 레인
              </button>
              <button
                type="button"
                onClick={() => setActiveStatusFilter('active')}
                className={`min-h-11 px-3 py-1.5 border transition-all ${
                  activeStatusFilter === 'active'
                    ? 'bg-[var(--color-behavior-amber-deep)] text-white border-[var(--color-behavior-amber-deep)] font-bold'
                    : 'border-[var(--line-strong)] hover:bg-[var(--color-neutral-100)]'
                }`}
              >
                추진중 레인
              </button>
              <button
                type="button"
                onClick={() => setActiveStatusFilter('unresolved')}
                className={`min-h-11 px-3 py-1.5 border transition-all ${
                  activeStatusFilter === 'unresolved'
                    ? 'bg-[var(--color-behavior-red-deep)] text-white border-[var(--color-behavior-red-deep)] font-bold'
                    : 'border-[var(--line-strong)] hover:bg-[var(--color-neutral-100)]'
                }`}
              >
                미완료/단절 레인
              </button>
            </div>
          </div>

          {/* Evidence Cards List */}
          <div className="space-y-4">
            {filteredEvidences.map((ev) => (
              <button
                type="button"
                key={ev.id}
                onClick={() => openEvidence(ev.id)}
                className="group flex min-h-11 w-full cursor-pointer flex-col items-start justify-between gap-4 border border-[var(--line-strong)] bg-[var(--color-paper)] p-5 text-left transition-all hover:border-[var(--color-ink)] md:flex-row md:items-center"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="type-mono text-xs font-bold text-[var(--color-behavior-red-deep)]">
                      {ev.id.toUpperCase()}
                    </span>
                    <Badge label={ev.reportedStatusLabel} variant="status" status={ev.reportedStatus} />
                    <LineSymbol style={ev.lineStyle} length={50} />
                    <span className="type-caption text-[var(--color-neutral-500)] font-mono">
                      {ev.auditYear}년 · {ev.targetOrg}
                    </span>
                  </div>

                  <h4 className="type-body-l font-serif font-bold text-[var(--color-ink)] group-hover:text-[var(--color-behavior-red-deep)] transition-colors mb-1">
                    {ev.issue}
                  </h4>

                  <p className="type-caption text-[var(--color-neutral-700)]">
                    저널리즘 검증: {ev.verificationLabel}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-neutral-700)] group-hover:text-[var(--color-ink)] shrink-0 border-t md:border-t-0 md:border-l border-[var(--color-neutral-200)] pt-3 md:pt-0 md:pl-4 w-full md:w-auto justify-between md:justify-start">
                  <span>원문 및 출처 보기</span>
                  <Eye className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </PageFrame>
    </ChapterFrame>
  );
};
