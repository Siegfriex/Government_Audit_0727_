import type {
  AnswerType,
  AtlasEncodingViewModel,
  AtlasNodeStatus,
  AtlasPlotRect,
  AtlasShapeToken,
  BehaviorFamily,
} from '@/shared/types/atlas';
import { BEHAVIOR_FAMILY_PRESENTATION } from './atlasSemantics';

export const ATLAS_VIEWBOX = Object.freeze({ width: 720, height: 520 });
export const ATLAS_PLOT_RECT: AtlasPlotRect = Object.freeze({ x: 76, y: 48, width: 600, height: 408 });
export const ATLAS_MINIMUM_HIT_TARGET_PX = 44;
export const ATLAS_PROJECTION_PADDING_PX = 48;
export const ATLAS_SELECTION_RING_OFFSET_PX = 7;
export const ATLAS_FOCUS_HALO_OFFSET_PX = 13;

export type NodeInteractionState =
  | 'default'
  | 'hovered'
  | 'focused'
  | 'selected'
  | 'focused-selected'
  | 'dimmed';

export type NodeFilterState = 'matched' | 'context' | 'excluded';

export type AnswerTypeMark = 'empty' | 'horizontal-bar' | 'vertical-bar' | 'center-dot' | 'diagonal-slash' | 'plus' | 'double-dot';

export interface NodeGlyphToken {
  family: BehaviorFamily;
  shape: AtlasShapeToken;
}

export interface NodeRadiusPresentationPolicy {
  minVisualRadiusPx: number;
  maxVisualRadiusPx: number;
  sourceRadiusPreserved: boolean;
}

export const NODE_RADIUS_PRESENTATION_POLICY: NodeRadiusPresentationPolicy = Object.freeze({
  minVisualRadiusPx: 0,
  maxVisualRadiusPx: Number.POSITIVE_INFINITY,
  sourceRadiusPreserved: true,
});

export const ATLAS_CONFIDENCE_PRESENTATION_POLICY = Object.freeze({
  status: 'PROVISIONAL_PENDING_APPROVED_DISTRIBUTION' as const,
  fixtureFloor: 0.45,
  nullOpacity: 0.72,
});

export const NODE_GLYPH_TOKENS: Readonly<Record<BehaviorFamily, NodeGlyphToken>> = Object.freeze({
  information_non_direct: Object.freeze({ family: 'information_non_direct', shape: 'circle' }),
  deferral_procedural: Object.freeze({ family: 'deferral_procedural', shape: 'square' }),
  action_evidence: Object.freeze({ family: 'action_evidence', shape: 'diamond' }),
});

export const BEHAVIOR_FAMILY_SHORT_LABEL: Readonly<Record<BehaviorFamily, string>> = Object.freeze({
  information_non_direct: BEHAVIOR_FAMILY_PRESENTATION.information_non_direct.shortLabel,
  deferral_procedural: BEHAVIOR_FAMILY_PRESENTATION.deferral_procedural.shortLabel,
  action_evidence: BEHAVIOR_FAMILY_PRESENTATION.action_evidence.shortLabel,
});

export const ANSWER_TYPE_MARKS: Readonly<Record<AnswerType, AnswerTypeMark>> = Object.freeze({
  A1: 'empty',
  A2: 'horizontal-bar',
  A3: 'vertical-bar',
  A4: 'center-dot',
  A5: 'empty',
  A6: 'diagonal-slash',
  A7: 'plus',
  A8: 'double-dot',
});

const ANSWER_TYPE_FAMILY: Readonly<Record<AnswerType, BehaviorFamily>> = Object.freeze({
  A1: 'information_non_direct',
  A2: 'information_non_direct',
  A3: 'information_non_direct',
  A4: 'information_non_direct',
  A5: 'deferral_procedural',
  A6: 'deferral_procedural',
  A7: 'action_evidence',
  A8: 'action_evidence',
});

export const STATUS_STROKE_DASH: Readonly<Record<AtlasNodeStatus, string | undefined>> = Object.freeze({
  complete: undefined,
  active: '12 6',
  unresolved: '2 5',
});

export const ANSWER_TYPE_COLOR_TOKENS: Readonly<Record<AnswerType, string>> = Object.freeze({
  A1: '#9f1239',
  A2: '#c43f4f',
  A3: '#d96758',
  A4: '#c98a4a',
  A5: '#6c91a8',
  A6: '#3f7fa6',
  A7: '#2167a8',
  A8: '#064f9e',
});

const STATUS_STROKE: Record<AtlasNodeStatus, string> = {
  complete: 'var(--status-complete)',
  active: 'var(--status-active)',
  unresolved: 'var(--status-unresolved)',
};

export function createAtlasEncoding(
  answerType: AnswerType,
  status: AtlasNodeStatus,
  confidence: number | null,
  behaviorFamily: BehaviorFamily = ANSWER_TYPE_FAMILY[answerType],
): AtlasEncodingViewModel {
  const opacity = confidence === null
    ? ATLAS_CONFIDENCE_PRESENTATION_POLICY.nullOpacity
    : Math.min(1, Math.max(ATLAS_CONFIDENCE_PRESENTATION_POLICY.fixtureFloor, confidence));
  return {
    shapeToken: NODE_GLYPH_TOKENS[behaviorFamily].shape,
    fillToken: ANSWER_TYPE_COLOR_TOKENS[answerType],
    strokeToken: STATUS_STROKE[status],
    opacity,
  };
}

export function getPresentedNodeRadius(sourceRadiusPx: number): number {
  if (!Number.isFinite(sourceRadiusPx) || sourceRadiusPx <= 0) {
    throw new Error('Atlas node radiusPx must be a positive finite number');
  }
  return sourceRadiusPx;
}

export function getNodeHitRadius(sourceRadiusPx: number): number {
  return Math.max(ATLAS_MINIMUM_HIT_TARGET_PX / 2, getPresentedNodeRadius(sourceRadiusPx));
}

export function getRequiredProjectionPadding(maxSourceRadiusPx: number): number {
  return getPresentedNodeRadius(maxSourceRadiusPx) + ATLAS_FOCUS_HALO_OFFSET_PX + 8;
}

export function getRequiredProjectionPaddingForRadii(sourceRadiiPx: readonly number[]): number {
  if (sourceRadiiPx.length === 0) throw new Error('Full aggregate node radius set is required');
  const maxSourceRadiusPx = sourceRadiiPx.reduce(
    (maximum, radius) => Math.max(maximum, getPresentedNodeRadius(radius)),
    0,
  );
  return getRequiredProjectionPadding(maxSourceRadiusPx);
}

export interface NodeOpacityInput {
  semanticOpacity: number;
  interactionState: NodeInteractionState;
  filterState: NodeFilterState;
  isSelected: boolean;
  isFocused: boolean;
}

export function getNodeDisplayOpacity({
  semanticOpacity,
  interactionState,
  filterState,
  isSelected,
  isFocused,
}: NodeOpacityInput): number {
  const boundedSemanticOpacity = Math.min(
    1,
    Math.max(ATLAS_CONFIDENCE_PRESENTATION_POLICY.fixtureFloor, semanticOpacity),
  );
  if (filterState === 'excluded') return 0;
  if (filterState === 'context') return Math.min(0.4, Math.max(0.24, boundedSemanticOpacity));
  if (isSelected || isFocused) return Math.max(0.88, boundedSemanticOpacity);
  if (interactionState === 'hovered') return Math.max(0.82, boundedSemanticOpacity);
  if (interactionState === 'dimmed') return Math.min(0.4, Math.max(0.24, boundedSemanticOpacity));
  return boundedSemanticOpacity;
}

interface ResolveNodeInteractionStateInput {
  isHovered: boolean;
  isFocused: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  filterState: NodeFilterState;
}

export function resolveNodeInteractionState({
  isHovered,
  isFocused,
  isSelected,
  isDimmed,
  filterState,
}: ResolveNodeInteractionStateInput): NodeInteractionState {
  if (filterState !== 'matched') return 'dimmed';
  if (isFocused && isSelected) return 'focused-selected';
  if (isFocused) return 'focused';
  if (isSelected) return 'selected';
  if (isHovered) return 'hovered';
  if (isDimmed) return 'dimmed';
  return 'default';
}
