export { CHAPTER_IDS, isChapterId, type ChapterId } from '@/shared/config/chapterNavigation';

export const PRIMARY_ROUTES = [
  { path: '/', label: '에세이 (Story)', end: true },
  { path: '/method', label: '방법론 (Method)', end: false },
  { path: '/data', label: '데이터 (Data)', end: false },
  { path: '/about', label: '소개 (About)', end: false },
] as const;
