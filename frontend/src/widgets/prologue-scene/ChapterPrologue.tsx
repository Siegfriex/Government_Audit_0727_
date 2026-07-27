import React from 'react';
import { motion, type Variants } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import ministryIdentity from '@/assets/editorial/public-data-placeholder.svg';
import { ChapterFrame } from '../../shared/ui/ChapterFrame';
import { PageFrame } from '../../shared/ui/PageFrame';
import { EditorialImageField } from '../../shared/ui/EditorialImageField';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useDetailNavigation } from '@/shared/hooks/useDetailNavigation';
import { usePreferences } from '@/shared/hooks/usePreferences';
import type { AtlasViewModelBundle } from '@/shared/types/atlas';

// Mirrors --evidence-line-entry-duration / --evidence-line-handoff-duration
// in tokens.css: the straight entry stroke settles in first, then the curve
// that hands off to the next chapter follows.
const EVIDENCE_LINE_ENTRY_DURATION = 0.55;
const EVIDENCE_LINE_HANDOFF_DURATION = 0.6;

interface ChapterPrologueProps {
  bundle: AtlasViewModelBundle | null;
}

export const ChapterPrologue: React.FC<ChapterPrologueProps> = ({ bundle }) => {
  const navigate = useNavigate();
  const { openEvidence } = useDetailNavigation();
  const { isReducedMotion, isPresentationMode } = usePreferences();
  const firstEvidence = bundle?.evidence[0] ?? null;

  const handleScrollToScale = () => {
    navigate({ pathname: '/', hash: '#scale' });
  };

  // Motion variants for staggered viewport reveal
  const containerVariants: Variants = {
    hidden: { opacity: isReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: isReducedMotion ? 1 : 0, y: isReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isReducedMotion ? 0 : 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <ChapterFrame id="prologue" orderNumber="CHAPTER 00" className="story-chapter story-chapter--prologue">
      <PageFrame>
        <div className="relative min-h-[var(--layout-hero-min-height)] flex flex-col justify-between py-[var(--chapter-prologue-padding-block)]">

          {/* Background SVG Evidence Line Geometry with Scale Handoff Elbow */}
          <div className="absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2 pointer-events-none" aria-hidden="true">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Evidence Line Entry — enters from the viewport edge, then drops through the chapter */}
              <motion.g
                initial={isReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: isReducedMotion ? 0 : EVIDENCE_LINE_ENTRY_DURATION, ease: [0.16, 1, 0.3, 1] }}
              >
                <path
                  className="hidden md:block"
                  d="M 0 8 L 12 8 L 12 80"
                  fill="none"
                  stroke="var(--color-behavior-red-deep)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  className="md:hidden"
                  d="M 0 8 L 4 8 L 4 80"
                  fill="none"
                  stroke="var(--color-behavior-red-deep)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </motion.g>

              {/* Handoff Curve — exits at the opposite viewport edge */}
              <motion.g
                initial={isReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: isReducedMotion ? 0 : EVIDENCE_LINE_HANDOFF_DURATION,
                  delay: isReducedMotion ? 0 : EVIDENCE_LINE_ENTRY_DURATION,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <path
                  className="hidden md:block"
                  d="M 12 80 C 12 92, 24 92, 36 92 L 100 92"
                  fill="none"
                  stroke="var(--color-behavior-red-deep)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  className="md:hidden"
                  d="M 4 80 C 4 92, 16 92, 28 92 L 100 92"
                  fill="none"
                  stroke="var(--color-behavior-red-deep)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </motion.g>

              {/* Compact anchors keep the rule legible without becoming a decorative mass. */}
              <circle
                className="hidden md:block"
                cx="12"
                cy="8"
                r="0.65"
                fill="var(--color-behavior-red-deep)"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                className="md:hidden"
                cx="4"
                cy="8"
                r="0.65"
                fill="var(--color-behavior-red-deep)"
                vectorEffect="non-scaling-stroke"
              />

              {/* The half-clipped terminal makes the rule visibly continue beyond the scene. */}
              <circle
                cx="100"
                cy="92"
                r="0.65"
                fill="var(--color-ink)"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* Top Metadata & Eyebrow Bar */}
          <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-neutral-200)] pb-4">
            <div className="flex items-center gap-3">
              <span className="type-meta-micro text-[var(--color-ink)] font-bold">
                PROLOGUE
              </span>
              <span className="text-[var(--color-neutral-300)]">|</span>
              <span className="type-meta-micro">
                문화체육관광위원회 국정감사 6년 데이터저널리즘
              </span>
            </div>
            <div className="type-meta-micro text-[var(--color-neutral-500)]">
              {bundle
                ? `[2020–2025] ${bundle.storySummary.analysisEntityCount.toLocaleString('ko-KR')}개 decision group 증거 추적`
                : '[2020–2025] 승인 데이터 연결 대기'}
            </div>
          </header>

          {/* Main 12-Column Magazine Hero Layout */}
          <motion.div
            className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-x-6 items-start my-8 md:my-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Headline Block (Cols 2–10) */}
            <motion.div
              className="md:col-start-2 md:col-end-9 space-y-5 md:pl-6"
              variants={itemVariants}
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono bg-[var(--color-behavior-red-bg)] text-[var(--color-behavior-red-deep)] border border-[var(--color-behavior-red-soft)]">
                <span>저널리즘 에세이</span>
                <span className="text-[var(--color-neutral-300)]">•</span>
                <span>CHAPTER 00</span>
              </div>

              <h1 className={`story-hierarchy-5 text-[var(--color-ink)] ${isPresentationMode ? 'text-6xl md:text-8xl' : ''}`}>
                국정감사 단순히 쇼인가?
              </h1>

              <h2 className="story-hierarchy-4 text-[var(--color-neutral-700)]">
                6년 뒤, 국정감사엔 무엇이 남았는가
              </h2>
            </motion.div>

            {/* Hero Image Slot (Cols 9–12 on Desktop, Inline on Mobile) */}
            <motion.div
              className="md:col-start-9 md:col-end-13 md:row-start-1 md:row-span-3 z-20 md:-mt-2"
              variants={itemVariants}
            >
              <EditorialImageField
                src={ministryIdentity}
                alt="문화체육관광부 국문·영문 기관 표장"
                slotId="prologue-hero-identity"
                aspectRatio="auto"
                objectFit="contain"
                maskVariant="none"
                stampBadge="PDF SOURCE / IDENTITY"
                placeholderCaption="문화체육관광부 기관 표장"
                className="prologue-identity-field shadow-sm hover:opacity-100 transition-opacity"
                mobileCrop="inline"
              />
            </motion.div>

            {/* Supporting Paragraph & Primary Action (Cols 2–8) */}
            <motion.div
              className="md:col-start-2 md:col-end-8 space-y-6 md:mt-2 md:pl-6"
              variants={itemVariants}
            >
              <p className="type-body-l text-[var(--color-neutral-700)] leading-relaxed max-w-2xl font-normal">
                최근 체육계와 관련해 많은 문제가 제기되는 가운데, 문체부의 국정감사 지적이 실제로 어떻게 처리됐는지를 물었습니다.
                요구사항과 시정사항 가운데 얼마나 조치됐는지, 아직 ‘조치 중’인 비율은 얼마인지 회의록과 결과보고서를 따라갑니다.
              </p>

              <p className="story-hierarchy-1 max-w-2xl text-[var(--color-neutral-500)]" role="status">
                {bundle
                  ? `APPROVED EXPLORATION LAYER · ${bundle.storySummary.analysisEntityCount.toLocaleString('ko-KR')} decision groups · ${bundle.storySummary.atlasNodeCount.toLocaleString('ko-KR')} nodes · ${bundle.storySummary.publicEvidenceCount.toLocaleString('ko-KR')} public evidence`
                  : 'APPROVED EXPLORATION LAYER · 연결 대기 · 기사 원고 수치와 승인 Atlas 집계는 분리 표시'}
              </p>

              <p className="story-contract-note max-w-2xl">
                기사 방법 · 2020~2025 문체부 국정감사 회의록 42건 전수 분석 · 2020~2024 국정감사결과 시정조치 및 결과보고서 전수 분석
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                {firstEvidence ? (
                  <button
                    type="button"
                    onClick={() => openEvidence(firstEvidence.id)}
                    className="flex min-h-11 items-center gap-2 bg-[var(--color-ink)] px-5 py-2.5 font-mono text-xs text-[var(--color-paper)] shadow-sm transition-all hover:bg-[var(--color-neutral-700)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-focus)] cursor-pointer"
                    aria-label={`${firstEvidence.title} 첫 승인 증거 원문 확인하기`}
                  >
                    <span>첫 승인 증거 원문 확인하기</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <Link className="atlas-action-primary" to="/data">
                    데이터 승인 상태 확인
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}

                <span className="type-caption font-mono text-[var(--color-neutral-500)]">
                  {bundle
                    ? `PUBLIC DATA / ${bundle.releaseId}`
                    : 'PUBLIC DATA STATUS: APPROVAL PENDING'}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Scroll Guidance / Handoff to Scale */}
          <footer className="relative z-10 flex flex-col items-center justify-center gap-2 pt-6 border-t border-[var(--color-neutral-200)]">
            <button
              type="button"
              onClick={handleScrollToScale}
              className="group flex min-h-11 flex-col items-center gap-1.5 p-2 font-mono text-xs text-[var(--color-neutral-500)] transition-colors hover:text-[var(--color-ink)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-focus)] cursor-pointer"
              aria-label="다음 챕터 스케일로 스크롤하여 이동"
            >
              <span>스크롤하여 6년간의 증거 선을 추적하십시오</span>
              <ChevronDown
                className={`w-4 h-4 text-[var(--color-behavior-red-deep)] ${
                  isReducedMotion ? '' : 'animate-bounce'
                }`}
              />
            </button>
          </footer>
        </div>
      </PageFrame>
    </ChapterFrame>
  );
};
