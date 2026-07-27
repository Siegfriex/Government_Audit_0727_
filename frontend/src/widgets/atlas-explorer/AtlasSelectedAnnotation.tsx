import { ANSWER_TYPE_SEMANTICS } from '@/shared/config/atlas/atlasSemantics';
import type { AtlasNodeViewModel } from '@/shared/types/atlas';
import { resolveAtlasSelectedAnnotationLayout } from './atlasSelectedAnnotationLayout';

interface AtlasSelectedAnnotationProps {
  node: AtlasNodeViewModel;
}

export function AtlasSelectedAnnotation({ node }: AtlasSelectedAnnotationProps) {
  const layout = resolveAtlasSelectedAnnotationLayout(node);
  return (
    <g
      className="atlas-selected-annotation"
      aria-hidden="true"
      data-annotation-side={layout.side}
      data-annotation-vertical={layout.vertical}
      data-selected-annotation={node.id}
    >
      <path
        className="atlas-selected-annotation__connector"
        d={`M ${layout.nodeEdgeX} ${node.screen.y} L ${layout.elbowX} ${node.screen.y} L ${layout.elbowX} ${layout.boxCenterY} L ${layout.boxEdgeX} ${layout.boxCenterY}`}
      />
      <circle className="atlas-selected-annotation__origin" cx={layout.nodeEdgeX} cy={node.screen.y} r="3.5" />
      <rect
        className="atlas-selected-annotation__panel"
        x={layout.boxX}
        y={layout.boxY}
        width={layout.width}
        height={layout.height}
        rx="2"
      />
      <rect
        className="atlas-selected-annotation__accent"
        x={layout.boxX}
        y={layout.boxY}
        width="5"
        height={layout.height}
        rx="2"
      />
      <text x={layout.boxX + 16} y={layout.boxY + 20} textAnchor="start">
        <tspan className="atlas-selected-annotation__label" x={layout.boxX + 16}>{node.answerType} · {ANSWER_TYPE_SEMANTICS[node.answerType].name}</tspan>
        <tspan className="atlas-selected-annotation__metrics" x={layout.boxX + 16} dy="16">{node.answerCount} answers · {node.linkCount} links</tspan>
      </text>
    </g>
  );
}
