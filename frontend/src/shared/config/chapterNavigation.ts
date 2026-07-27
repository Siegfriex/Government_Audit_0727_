export const CHAPTER_IDS = ['prologue', 'scale', 'record', 'gap', 'answers', 'cases', 'remains'] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export const STORY_CHAPTER_NAVIGATION = [
  { id: 'prologue', order: 0, title: '질문은 남았다' },
  { id: 'scale', order: 1, title: '얼마나 조치됐나' },
  { id: 'record', order: 2, title: '완료 뒤 남은 위험' },
  { id: 'gap', order: 3, title: '상태 너머의 의미' },
  { id: 'answers', order: 4, title: '답변의 지형' },
  { id: 'cases', order: 5, title: '회피성 답변 1,408' },
  { id: 'remains', order: 6, title: '끝나지 않은 문장' },
] as const satisfies ReadonlyArray<{ id: ChapterId; order: number; title: string }>;

export function isChapterId(value: string): value is ChapterId {
  return CHAPTER_IDS.includes(value as ChapterId);
}
