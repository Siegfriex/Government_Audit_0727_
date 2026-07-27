import { describe, expect, it } from 'vitest';

import { ATLAS_PLOT_RECT } from '@/shared/config/atlas/atlasEncoding';
import { resolveAtlasSelectedAnnotationLayout } from './atlasSelectedAnnotationLayout';

describe('resolveAtlasSelectedAnnotationLayout', () => {
  it.each([
    { screen: { x: 88, y: 60 }, radiusPx: 12 },
    { screen: { x: 360, y: 250 }, radiusPx: 24 },
    { screen: { x: 664, y: 444 }, radiusPx: 18 },
  ])('keeps the complete annotation panel inside the approved plot for $screen', (node) => {
    const layout = resolveAtlasSelectedAnnotationLayout(node);
    expect(layout.boxX).toBeGreaterThanOrEqual(ATLAS_PLOT_RECT.x);
    expect(layout.boxY).toBeGreaterThanOrEqual(ATLAS_PLOT_RECT.y);
    expect(layout.boxX + layout.width).toBeLessThanOrEqual(ATLAS_PLOT_RECT.x + ATLAS_PLOT_RECT.width);
    expect(layout.boxY + layout.height).toBeLessThanOrEqual(ATLAS_PLOT_RECT.y + ATLAS_PLOT_RECT.height);
  });

  it('places left-field nodes to the right and lower-field nodes above', () => {
    expect(resolveAtlasSelectedAnnotationLayout({ screen: { x: 180, y: 90 }, radiusPx: 16 })).toMatchObject({
      side: 'right',
      vertical: 'below',
    });
    expect(resolveAtlasSelectedAnnotationLayout({ screen: { x: 560, y: 400 }, radiusPx: 16 })).toMatchObject({
      side: 'left',
      vertical: 'above',
    });
  });
});
