import React, { useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { ChapterFrame } from '../../shared/ui/ChapterFrame';
import { PageFrame } from '../../shared/ui/PageFrame';
import { ContentGrid } from '../../shared/ui/ContentGrid';
import { Badge } from '../../shared/ui/Badge';
import { STORY_METRICS } from '../../shared/mock/storyData';
import { usePreferences } from '@/shared/hooks/usePreferences';

export const ChapterScale: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const { isReducedMotion } = usePreferences();

  // Same stagger/easing voice as the Prologue reveal, applied here so the
  // motion language reads as one system rather than a one-off hero effect.
  const containerVariants: Variants = {
    hidden: { opacity: isReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: isReducedMotion ? 1 : 0, y: isReducedMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: isReducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const yearStats = [
    { year: 2018, count: 420, completed: 348, evasive: 182 },
    { year: 2019, count: 462, completed: 382, evasive: 195 },
    { year: 2020, count: 485, completed: 398, evasive: 204 },
    { year: 2021, count: 492, completed: 405, evasive: 210 },
    { year: 2022, count: 488, completed: 402, evasive: 198 },
    { year: 2023, count: 495, completed: 407, evasive: 201 },
  ];

  return (
    <ChapterFrame id="scale" orderNumber="CHAPTER 01">
      <PageFrame>
        <div className="mb-10">
          <Badge label="규모와 범위" variant="neutral" className="mb-3" />
          <h2 className="type-heading-1 font-serif text-[var(--color-ink)] mb-4">
            요구는 얼마나 쌓였는가
          </h2>
          <p className="type-body-l text-[var(--color-neutral-700)] max-w-2xl">
            6년의 세월 동안 문화체육관광위원회 국정감사장에서 요구된 시정 사항은 단 한 번의 이벤트가 아닙니다.
            매년 쌓인 2,842건의 수치는 공식 완료 보고서의 높은 수치 뒤에 가려진 행태의 무거움을 보여줍니다.
          </p>
        </div>

        {/* Big Metric Statements — Sentence-first representation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
        <ContentGrid className="mb-12">
          {STORY_METRICS.map((metric) => (
            <motion.div
              key={metric.id}
              variants={itemVariants}
              className="col-span-12 sm:col-span-6 lg:col-span-3 p-6 bg-[var(--color-surface)] border border-[var(--color-neutral-200)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="type-caption font-mono text-[var(--color-neutral-500)]">
                    {metric.label}
                  </span>
                  {metric.mock && <Badge label="MOCK" variant="mock" />}
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-serif text-4xl font-bold text-[var(--color-ink)]">
                    {metric.value}
                  </span>
                  {metric.unit && (
                    <span className="font-serif text-xl text-[var(--color-neutral-700)]">
                      {metric.unit}
                    </span>
                  )}
                </div>
                <p className="type-caption text-[var(--color-neutral-700)] mb-4">
                  {metric.comparison}
                </p>
              </div>
              <div className="type-mono text-[11px] text-[var(--color-neutral-500)] border-t border-[var(--color-neutral-200)] pt-2 truncate">
                {metric.sourceLabel}
              </div>
            </motion.div>
          ))}
        </ContentGrid>
        </motion.div>

        {/* Cumulative Timeline Visualizer (2018–2023) */}
        <motion.div
          className="bg-[var(--color-surface)] border border-[var(--color-neutral-200)] p-6 md:p-8"
          initial={isReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: isReducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-neutral-200)]">
            <div>
              <h3 className="type-heading-2 font-serif text-[var(--color-ink)]">
                연도별 시정요구 및 처리 보고 추이
              </h3>
              <p className="type-caption text-[var(--color-neutral-500)]">
                각 연도별 총 시정요구 건수 및 피감기관 답변 유형 누적 비교
              </p>
            </div>

            {/* Year Selector */}
            <div
              className="w-full max-w-full overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] lg:w-auto"
              role="region"
              aria-label="연도별 시정요구 필터"
              tabIndex={0}
            >
              <div className="flex w-max items-center gap-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedYear('all')}
                  className={`min-h-11 px-2.5 py-1 border transition-colors ${
                    selectedYear === 'all'
                      ? 'bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]'
                      : 'border-[var(--line-strong)] hover:bg-[var(--color-neutral-100)]'
                  }`}
                >
                  전체 (2018–2023)
                </button>
                {yearStats.map((item) => (
                  <button
                    type="button"
                    key={item.year}
                    onClick={() => setSelectedYear(item.year)}
                    className={`min-h-11 px-2.5 py-1 border transition-colors ${
                      selectedYear === item.year
                        ? 'bg-[var(--color-behavior-red-deep)] text-white border-[var(--color-behavior-red-deep)]'
                        : 'border-[var(--line-strong)] hover:bg-[var(--color-neutral-100)]'
                    }`}
                  >
                    {item.year}년
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bar / Node Chart */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {yearStats.map((item) => {
              const isSelected = selectedYear === 'all' || selectedYear === item.year;
              return (
                <div
                  key={item.year}
                  className={`p-4 border transition-all ${
                    isSelected
                      ? 'border-[var(--color-ink)] bg-[var(--color-paper)] shadow-sm'
                      : 'border-[var(--color-neutral-200)] opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 font-mono text-xs font-bold text-[var(--color-ink)]">
                    <span>{item.year}년</span>
                    <span className="text-[var(--color-behavior-red-deep)]">{item.count}건</span>
                  </div>

                  {/* Visual Proportional Bar */}
                  <div className="w-full bg-[var(--color-neutral-200)] h-3 rounded-none overflow-hidden flex mb-3">
                    <div
                      style={{ width: `${(item.completed / item.count) * 100}%` }}
                      className="bg-[var(--color-behavior-blue-deep)] h-full"
                      title={`공식 완료: ${item.completed}건`}
                    />
                    <div
                      style={{ width: `${(item.evasive / item.count) * 100}%` }}
                      className="bg-[var(--color-behavior-red-deep)] h-full"
                      title={`원론적 답변: ${item.evasive}건`}
                    />
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-[var(--color-neutral-700)]">
                    <div className="flex justify-between">
                      <span>공식 완료:</span>
                      <span className="font-bold text-[var(--color-behavior-blue-deep)]">
                        {item.completed}건
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>원론적 답변:</span>
                      <span className="font-bold text-[var(--color-behavior-red-deep)]">
                        {item.evasive}건
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--color-neutral-200)] flex items-center justify-between text-xs font-mono text-[var(--color-neutral-500)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[var(--color-behavior-blue-deep)] inline-block" />
                공식 완료 보고 (Average 82%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[var(--color-behavior-red-deep)] inline-block" />
                원론적 답변 / 검토 미루기 (Average 41.8%)
              </span>
            </div>
            <span>[MOCK Data Reference]</span>
          </div>
        </motion.div>
      </PageFrame>
    </ChapterFrame>
  );
};
