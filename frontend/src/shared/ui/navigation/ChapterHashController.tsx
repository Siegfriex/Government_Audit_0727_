import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { isChapterId } from '@/shared/config/chapterNavigation';
import { usePreferences } from '@/shared/hooks/usePreferences';

export function ChapterHashController() {
  const location = useLocation();
  const { isReducedMotion } = usePreferences();

  useEffect(() => {
    const chapterId = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!isChapterId(chapterId)) return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(chapterId)?.scrollIntoView({
        behavior: isReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isReducedMotion, location.hash, location.key]);

  return null;
}
