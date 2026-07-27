import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import type { AppOutletContext } from '@/shared/types/routing';
import { useAtlasRelease } from '@/shared/api/atlas/useAtlasRelease';
import { CHAPTER_IDS } from '@/shared/config/chapterNavigation';
import { ChapterHashController } from '@/shared/ui/navigation/ChapterHashController';
import { StoryChapterUnavailable } from '@/shared/ui/story/StoryChapterUnavailable';
import { ChapterAnswersAtlas } from '@/widgets/atlas-scene/ChapterAnswersAtlas';
import { ProgressTracker } from '@/widgets/app-shell/ProgressTracker';
import {
  ChapterApprovedCases,
  ChapterApprovedGap,
  ChapterApprovedRecord,
  ChapterApprovedScale,
} from '@/widgets/approved-story-scenes/ApprovedStoryChapters';
import { ChapterPrologue } from '@/widgets/prologue-scene/ChapterPrologue';
import { ChapterRemains } from '@/widgets/remains-scene/ChapterRemains';

export function StoryPage() {
  const navigate = useNavigate();
  const { activeChapterId, setActiveChapterId } = useOutletContext<AppOutletContext>();
  const release = useAtlasRelease();
  const bundle = release.status === 'ready' ? release.bundle : null;
  const unavailableReason = release.status === 'unavailable'
    ? release.reason
    : release.status === 'error'
      ? release.error.message
      : 'APPROVED_RELEASE_LOADING';

  useEffect(() => {
    let animationFrame = 0;

    const updateActiveChapter = () => {
      animationFrame = 0;
      const chapters = document.querySelectorAll('section[data-chapter-id]');
      const headerHeight = document.querySelector('body > #root header')?.getBoundingClientRect().height ?? 56;
      const readingLine = headerHeight + Math.min(240, Math.max(80, (window.innerHeight - headerHeight) * 0.34));
      const measured = Array.from(chapters).map((chapter) => ({ chapter, rect: chapter.getBoundingClientRect() }));
      const current = measured.find(({ rect }) => rect.top <= readingLine && rect.bottom > readingLine)
        ?? measured.sort((left, right) => Math.abs(left.rect.top - readingLine) - Math.abs(right.rect.top - readingLine))[0];
      const id = current?.chapter.getAttribute('data-chapter-id');
      if (id) setActiveChapterId(id);
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateActiveChapter);
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [setActiveChapterId]);

  useEffect(() => {
    const handleChapterKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key.toLowerCase() !== 'j' && event.key.toLowerCase() !== 'k') return;

      const target = event.target;
      if (target instanceof HTMLElement && (
        target.isContentEditable
        || target.matches('input, textarea, select, button, a, [role="textbox"]')
      )) return;

      const currentIndex = Math.max(0, CHAPTER_IDS.indexOf(activeChapterId as typeof CHAPTER_IDS[number]));
      const direction = event.key.toLowerCase() === 'j' ? 1 : -1;
      const nextIndex = Math.min(CHAPTER_IDS.length - 1, Math.max(0, currentIndex + direction));
      if (nextIndex === currentIndex) return;

      event.preventDefault();
      navigate({ pathname: '/', hash: `#${CHAPTER_IDS[nextIndex]}` });
    };

    window.addEventListener('keydown', handleChapterKeyDown);
    return () => window.removeEventListener('keydown', handleChapterKeyDown);
  }, [activeChapterId, navigate]);

  const handleChapterNavigate = (chapterId: string) => {
    navigate({ pathname: '/', hash: `#${chapterId}` });
  };

  return (
    <main id="main-content" className="relative" tabIndex={-1}>
      <ChapterHashController />
      <ProgressTracker
        currentChapterId={activeChapterId}
        onChapterNavigate={handleChapterNavigate}
      />
      <ChapterPrologue bundle={bundle} />
      {bundle ? <ChapterApprovedScale /> : (
        <StoryChapterUnavailable
          id="scale"
          orderNumber="CHAPTER 01"
          title={release.status === 'loading' ? '승인 release를 확인하고 있습니다' : '규모 지표의 승인 데이터를 불러올 수 없습니다'}
          description="승인된 atlas-summary transport만 이 챕터에 연결하며 개발용 지표를 대신 표시하지 않습니다."
          reason={unavailableReason}
        />
      )}
      {bundle ? <ChapterApprovedRecord /> : (
        <StoryChapterUnavailable
          id="record"
          orderNumber="CHAPTER 02"
          title={release.status === 'loading' ? '승인 Evidence를 확인하고 있습니다' : '증거 사슬의 승인 데이터를 불러올 수 없습니다'}
          description="승인된 EvidenceRepository 결과만 이 챕터에 연결합니다."
          reason={unavailableReason}
        />
      )}
      {bundle ? <ChapterApprovedGap /> : (
        <StoryChapterUnavailable
          id="gap"
          orderNumber="CHAPTER 03"
          title={release.status === 'loading' ? '승인 상태 분포를 확인하고 있습니다' : '처리 간극의 승인 데이터를 불러올 수 없습니다'}
          description="브라우저에서 상태 집계를 새로 계산하지 않고 승인 summary의 precomputed 분포만 표시합니다."
          reason={unavailableReason}
        />
      )}
      <ChapterAnswersAtlas />
      {bundle ? <ChapterApprovedCases /> : (
        <StoryChapterUnavailable
          id="cases"
          orderNumber="CHAPTER 05"
          title={release.status === 'loading' ? '승인 사례 기록을 확인하고 있습니다' : '사례의 승인 데이터를 불러올 수 없습니다'}
          description="프론트가 사례 의미를 새로 판정하지 않고 승인 Evidence index만 표시합니다."
          reason={unavailableReason}
        />
      )}
      <ChapterRemains />
    </main>
  );
}
