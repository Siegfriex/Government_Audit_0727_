import {
  ANSWER_TYPE_MARKS,
  ATLAS_FOCUS_HALO_OFFSET_PX,
  ATLAS_SELECTION_RING_OFFSET_PX,
  STATUS_STROKE_DASH,
  type NodeInteractionState,
} from '@/shared/config/atlas/atlasEncoding';
import type { AnswerType, AtlasNodeStatus, AtlasShapeToken } from '@/shared/types/atlas';

export type AtlasGlyphState = NodeInteractionState;

interface AtlasNodeGlyphProps {
  shape: AtlasShapeToken;
  answerType: AnswerType;
  status: AtlasNodeStatus;
  fill: string;
  stroke?: string;
  opacity?: number;
  radius?: number;
  state?: AtlasGlyphState;
  showAnswerMark?: boolean;
  evidenceAvailable?: boolean;
}

function InnerMark({ answerType, radius }: Pick<AtlasNodeGlyphProps, 'answerType'> & { radius: number }) {
  const extent = Math.max(4, radius * 0.42);
  const common = { stroke: 'var(--ink-primary)', strokeWidth: 1.75, vectorEffect: 'non-scaling-stroke' as const };
  const mark = ANSWER_TYPE_MARKS[answerType];
  if (mark === 'horizontal-bar') return <line x1={-extent} x2={extent} y1={0} y2={0} {...common} />;
  if (mark === 'vertical-bar') return <line x1={0} x2={0} y1={-extent} y2={extent} {...common} />;
  if (mark === 'center-dot') return <circle r={Math.max(2, radius * 0.14)} fill="var(--ink-primary)" />;
  if (mark === 'diagonal-slash') return <line x1={-extent} x2={extent} y1={extent} y2={-extent} {...common} />;
  if (mark === 'plus') return <><line x1={-extent} x2={extent} y1={0} y2={0} {...common} /><line x1={0} x2={0} y1={-extent} y2={extent} {...common} /></>;
  if (mark === 'double-dot') return <><circle cx={-extent * 0.48} r={Math.max(1.8, radius * 0.11)} fill="var(--ink-primary)" /><circle cx={extent * 0.48} r={Math.max(1.8, radius * 0.11)} fill="var(--ink-primary)" /></>;
  return <g data-empty-mark="true" />;
}

export function AtlasNodeGlyph({
  shape,
  answerType,
  status,
  fill,
  stroke = 'var(--ink-primary)',
  opacity = 1,
  radius = 18,
  state = 'default',
  showAnswerMark = true,
  evidenceAvailable = true,
}: AtlasNodeGlyphProps) {
  const scale = state === 'hovered' ? 1.06 : 1;
  const selected = state === 'selected' || state === 'focused-selected';
  const focused = state === 'focused' || state === 'focused-selected';
  const markProps = {
    className: 'atlas-node-glyph__source-shape atlas-node-glyph__source-shape--mark',
    fill,
    fillOpacity: Math.max(0.38, opacity * 0.72),
    stroke,
    strokeOpacity: Math.max(0.72, opacity),
    strokeWidth: 1.75,
    strokeDasharray: STATUS_STROKE_DASH[status],
    vectorEffect: 'non-scaling-stroke' as const,
  };
  const squareRadius = radius * 0.9;
  const diamondRadius = radius * 1.08;
  const separatorProps = {
    className: 'atlas-node-glyph__source-shape atlas-node-glyph__source-shape--separator',
    fill: 'none',
    stroke: 'var(--paper-surface)',
    strokeWidth: 5,
    vectorEffect: 'non-scaling-stroke' as const,
  };

  return (
    <g
      className="atlas-node-glyph"
      data-answer-mark={ANSWER_TYPE_MARKS[answerType]}
      data-shape-token={shape}
      data-evidence-available={evidenceAvailable ? 'true' : 'false'}
      data-interaction-state={state}
      data-status-stroke={status}
      pointerEvents="none"
      style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
    >
      {focused ? <circle data-focus-halo="true" r={radius + ATLAS_FOCUS_HALO_OFFSET_PX} fill="none" stroke="var(--ink-primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" /> : null}
      {selected ? <circle data-selection-ring="true" r={radius + ATLAS_SELECTION_RING_OFFSET_PX} fill="none" stroke="var(--signal-red)" strokeWidth="3" vectorEffect="non-scaling-stroke" /> : null}
      {shape === 'diamond' ? <path d={`M 0 ${-diamondRadius} L ${diamondRadius} 0 L 0 ${diamondRadius} L ${-diamondRadius} 0 Z`} {...separatorProps} /> : null}
      {shape === 'square' ? <rect x={-squareRadius} y={-squareRadius} width={squareRadius * 2} height={squareRadius * 2} rx={Math.max(2.5, radius * 0.22)} {...separatorProps} /> : null}
      {shape === 'circle' ? <circle r={radius} {...separatorProps} /> : null}
      {shape === 'diamond' ? <path d={`M 0 ${-diamondRadius} L ${diamondRadius} 0 L 0 ${diamondRadius} L ${-diamondRadius} 0 Z`} {...markProps} /> : null}
      {shape === 'square' ? <rect x={-squareRadius} y={-squareRadius} width={squareRadius * 2} height={squareRadius * 2} rx={Math.max(2.5, radius * 0.22)} {...markProps} /> : null}
      {shape === 'circle' ? <circle r={radius} {...markProps} /> : null}
      <circle
        className="story-atlas-circle-shape story-atlas-circle-shape--separator"
        data-story-circle-node="separator"
        display="none"
        r={radius}
        fill="none"
        stroke="var(--paper-surface)"
        strokeWidth="5"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        className="story-atlas-circle-shape story-atlas-circle-shape--mark"
        data-story-circle-node="mark"
        display="none"
        r={radius}
        fill={fill}
        fillOpacity={Math.max(0.38, opacity * 0.72)}
        stroke={stroke}
        strokeOpacity={Math.max(0.72, opacity)}
        strokeWidth="1.75"
        strokeDasharray={STATUS_STROKE_DASH[status]}
        vectorEffect="non-scaling-stroke"
      />
      {showAnswerMark ? <InnerMark answerType={answerType} radius={radius} /> : null}
      {!evidenceAvailable ? (
        <g data-evidence-indicator="unavailable" transform={`translate(${radius * 0.58} ${radius * 0.58})`}>
          <circle r={Math.max(3.5, radius * 0.24)} fill="var(--paper-surface)" stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <line x1={-2.5} y1={2.5} x2={2.5} y2={-2.5} stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </g>
      ) : null}
    </g>
  );
}
