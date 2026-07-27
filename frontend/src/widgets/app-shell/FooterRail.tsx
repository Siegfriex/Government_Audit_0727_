import { STORY_CHAPTER_NAVIGATION } from '@/shared/config/chapterNavigation';
import { useAtlasRelease } from '@/shared/api/atlas/useAtlasRelease';

interface FooterRailProps {
  currentChapterId: string;
}

export function FooterRail({ currentChapterId }: FooterRailProps) {
  const release = useAtlasRelease();
  const activeChapterIndex = STORY_CHAPTER_NAVIGATION.findIndex((chapter) => chapter.id === currentChapterId);
  const progressPercent = activeChapterIndex >= 0
    ? Math.min(100, Math.max(0, ((activeChapterIndex + 1) / STORY_CHAPTER_NAVIGATION.length) * 100))
    : 0;
  const releaseLabel = release.status === 'ready'
    ? `APPROVED · ${release.bundle.releaseId}`
    : release.status === 'loading'
      ? 'RELEASE CHECKING'
      : release.status === 'unavailable'
        ? 'RELEASE UNAVAILABLE'
        : 'RELEASE ERROR';

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[var(--z-sticky)] h-11 bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-between px-4 sm:px-8 border-t border-[var(--color-neutral-900)] text-[10px] font-mono tracking-widest uppercase shadow-xl select-none">
      <div className="sticky-bottom-progress" aria-hidden="true">
        <div className="sticky-bottom-progress-bar" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="hidden min-w-0 items-center gap-4 truncate sm:flex">
        <span className="opacity-60 hidden sm:inline">PROJECT: P3_CULTURE</span>
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 ${release.status === 'ready' ? 'bg-[var(--color-behavior-blue-soft)]' : 'bg-[var(--color-behavior-amber-soft)]'}`} />
          <span className="truncate opacity-90">ATLAS DATA: {releaseLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 font-mono text-[10px] shrink-0">
        <span className="text-[var(--color-behavior-red-soft)] font-bold">
          CHAPTER: {currentChapterId.toUpperCase()}
        </span>
        <span className="opacity-40 hidden sm:inline">|</span>
        <span className="opacity-50 hidden sm:inline">V1.0 EDITORIAL SCROLLYTELLING</span>
      </div>
    </footer>
  );
}
