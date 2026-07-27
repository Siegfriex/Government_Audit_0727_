import { describe, expect, it } from 'vitest';

import { CHAPTER_IDS, isChapterId, PRIMARY_ROUTES } from './routeConfig';

describe('route contract', () => {
  it('keeps the four public primary routes stable', () => {
    expect(PRIMARY_ROUTES.map((route) => route.path)).toEqual(['/', '/method', '/data', '/about']);
  });

  it('recognizes only supported story chapter hashes', () => {
    expect(CHAPTER_IDS).toEqual(['prologue', 'scale', 'record', 'gap', 'answers', 'cases', 'remains']);
    expect(isChapterId('scale')).toBe(true);
    expect(isChapterId('unknown')).toBe(false);
  });
});
