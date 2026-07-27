import { ATLAS_PLOT_RECT } from '@/shared/config/atlas/atlasEncoding';
import type { AtlasNodeViewModel } from '@/shared/types/atlas';

const ANNOTATION_WIDTH = 224;
const ANNOTATION_HEIGHT = 52;
const ANNOTATION_INSET = 14;
const ANNOTATION_GAP = 30;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function resolveAtlasSelectedAnnotationLayout(node: Pick<AtlasNodeViewModel, 'screen' | 'radiusPx'>) {
  const plotRight = ATLAS_PLOT_RECT.x + ATLAS_PLOT_RECT.width;
  const plotBottom = ATLAS_PLOT_RECT.y + ATLAS_PLOT_RECT.height;
  const plotCenterX = ATLAS_PLOT_RECT.x + ATLAS_PLOT_RECT.width / 2;
  const side = node.screen.x <= plotCenterX ? 'right' : 'left';
  const vertical = node.screen.y > ATLAS_PLOT_RECT.y + 132 ? 'above' : 'below';
  const direction = side === 'right' ? 1 : -1;
  const preferredBoxX = side === 'right'
    ? node.screen.x + node.radiusPx + ANNOTATION_GAP
    : node.screen.x - node.radiusPx - ANNOTATION_GAP - ANNOTATION_WIDTH;
  const preferredBoxY = vertical === 'above'
    ? node.screen.y - node.radiusPx - ANNOTATION_GAP - ANNOTATION_HEIGHT
    : node.screen.y + node.radiusPx + ANNOTATION_GAP;
  const boxX = clamp(
    preferredBoxX,
    ATLAS_PLOT_RECT.x + ANNOTATION_INSET,
    plotRight - ANNOTATION_WIDTH - ANNOTATION_INSET,
  );
  const boxY = clamp(
    preferredBoxY,
    ATLAS_PLOT_RECT.y + ANNOTATION_INSET,
    plotBottom - ANNOTATION_HEIGHT - ANNOTATION_INSET,
  );
  const boxEdgeX = side === 'right' ? boxX : boxX + ANNOTATION_WIDTH;
  const boxCenterY = boxY + ANNOTATION_HEIGHT / 2;
  const nodeEdgeX = node.screen.x + direction * (node.radiusPx + 8);
  const elbowX = boxEdgeX - direction * 12;

  return {
    boxX,
    boxY,
    boxEdgeX,
    boxCenterY,
    nodeEdgeX,
    elbowX,
    side,
    vertical,
    width: ANNOTATION_WIDTH,
    height: ANNOTATION_HEIGHT,
  } as const;
}
