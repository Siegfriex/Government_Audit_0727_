import { ATLAS_PROJECTION_PADDING_PX } from '@/shared/config/atlas/atlasEncoding';
import type { AtlasPlotRect, Point2D, ProjectionBounds } from '@/shared/types/atlas';

export interface ProjectionScale {
  readonly bounds: ProjectionBounds;
  readonly plot: AtlasPlotRect;
  readonly contentRect: AtlasPlotRect;
  readonly scaleFactor: number;
  project(point: Point2D): Point2D;
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
}

export function createProjectionScale(
  bounds: ProjectionBounds,
  plot: AtlasPlotRect,
  padding = ATLAS_PROJECTION_PADDING_PX,
): ProjectionScale {
  Object.entries(bounds).forEach(([key, value]) => assertFinite(value, `bounds.${key}`));
  Object.entries(plot).forEach(([key, value]) => assertFinite(value, `plot.${key}`));

  if (bounds.xMax <= bounds.xMin || bounds.yMax <= bounds.yMin) {
    throw new Error('Projection bounds must have positive width and height');
  }
  if (plot.width <= 0 || plot.height <= 0) {
    throw new Error('Plot rectangle must have positive width and height');
  }
  assertFinite(padding, 'padding');
  if (padding < 0 || padding * 2 >= plot.width || padding * 2 >= plot.height) {
    throw new Error('Projection padding must leave positive content bounds');
  }

  const xSpan = bounds.xMax - bounds.xMin;
  const ySpan = bounds.yMax - bounds.yMin;
  const availableWidth = plot.width - padding * 2;
  const availableHeight = plot.height - padding * 2;
  const scaleFactor = Math.min(availableWidth / xSpan, availableHeight / ySpan);
  const contentWidth = xSpan * scaleFactor;
  const contentHeight = ySpan * scaleFactor;
  const contentRect = Object.freeze({
    x: plot.x + padding + (availableWidth - contentWidth) / 2,
    y: plot.y + padding + (availableHeight - contentHeight) / 2,
    width: contentWidth,
    height: contentHeight,
  });
  const project = ({ x, y }: Point2D): Point2D => ({
    x: contentRect.x + (x - bounds.xMin) * scaleFactor,
    y: contentRect.y + contentRect.height - (y - bounds.yMin) * scaleFactor,
  });

  return Object.freeze({
    bounds: Object.freeze({ ...bounds }),
    plot: Object.freeze({ ...plot }),
    contentRect,
    scaleFactor,
    project,
  });
}
