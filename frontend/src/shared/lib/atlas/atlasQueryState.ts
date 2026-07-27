import {
  ANSWER_TYPES,
  ATLAS_RELATION_TYPES,
  ATLAS_STATUSES,
  type AnswerType,
  type AtlasQueryState,
  type AtlasRelationType,
  type AtlasStatus,
  type AtlasViewMode,
} from '@/shared/types/atlas';

export const ATLAS_QUERY_KEYS = ['status', 'types', 'node', 'view', 'relation', 'depth'] as const;

export interface AtlasQueryParseResult {
  state: AtlasQueryState;
  issues: string[];
  canonicalSearch: string;
  wasNormalized: boolean;
}

const DEFAULT_STATE: AtlasQueryState = {
  status: 'all',
  types: [...ANSWER_TYPES],
  nodeId: null,
  view: 'map',
  relationType: null,
  depth: 1,
};

function isAtlasStatus(value: string): value is AtlasStatus {
  return (ATLAS_STATUSES as readonly string[]).includes(value);
}

function isAnswerType(value: string): value is AnswerType {
  return (ANSWER_TYPES as readonly string[]).includes(value);
}

function isAtlasViewMode(value: string): value is AtlasViewMode {
  return value === 'map' || value === 'relations' || value === 'evidence';
}

function isAtlasRelationType(value: string): value is AtlasRelationType {
  return (ATLAS_RELATION_TYPES as readonly string[]).includes(value);
}

function isNodeId(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value);
}

function toSearchParams(input: URLSearchParams | string): URLSearchParams {
  if (input instanceof URLSearchParams) return new URLSearchParams(input);
  return new URLSearchParams(input.startsWith('?') ? input.slice(1) : input);
}

function sameTypes(left: readonly AnswerType[], right: readonly AnswerType[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function serializeAtlasQueryState(state: AtlasQueryState): string {
  const params = new URLSearchParams();
  const canonicalTypes = ANSWER_TYPES.filter((value) => state.types.includes(value));
  const isDefault = state.status === 'all'
    && sameTypes(canonicalTypes, ANSWER_TYPES)
    && state.nodeId === null
    && state.view === 'map'
    && state.relationType === null;
  if (isDefault) return '';

  if (state.status !== 'all') params.set('status', state.status);
  if (!sameTypes(canonicalTypes, ANSWER_TYPES)) params.set('types', canonicalTypes.join(','));
  if (state.nodeId) params.set('node', state.nodeId);
  if (state.view !== 'map') params.set('view', state.view);
  if (state.view === 'relations' && state.relationType) params.set('relation', state.relationType);
  return params.toString();
}

export function parseAtlasQueryState(input: URLSearchParams | string): AtlasQueryParseResult {
  const source = toSearchParams(input);
  const issues: string[] = [];

  const rawStatus = source.get('status');
  const status = rawStatus === null || rawStatus === ''
    ? DEFAULT_STATE.status
    : isAtlasStatus(rawStatus)
      ? rawStatus
      : (issues.push(`invalid status: ${rawStatus}`), DEFAULT_STATE.status);

  const rawTypes = source.get('types');
  let types = [...ANSWER_TYPES];
  if (rawTypes !== null && rawTypes !== '') {
    const requested = new Set(rawTypes.split(',').filter(Boolean));
    const invalid = [...requested].filter((value) => !isAnswerType(value));
    invalid.forEach((value) => issues.push(`invalid answer type: ${value}`));
    const normalized = ANSWER_TYPES.filter((value) => requested.has(value));
    if (normalized.length > 0) types = normalized;
    else issues.push('types normalized to all because no valid answer type remained');
  }

  const rawNode = source.get('node');
  const nodeId = rawNode && isNodeId(rawNode)
    ? rawNode
    : (rawNode ? (issues.push(`invalid node: ${rawNode}`), null) : null);

  const rawView = source.get('view');
  let view: AtlasViewMode = DEFAULT_STATE.view;
  if (rawView === 'nodes') {
    issues.push('legacy view normalized: nodes');
  } else if (rawView !== null && rawView !== '') {
    if (isAtlasViewMode(rawView)) view = rawView;
    else issues.push(`invalid view: ${rawView}`);
  }

  const rawRelation = source.get('relation');
  let relationType: AtlasRelationType | null = null;
  if (rawRelation) {
    if (view !== 'relations') issues.push('relation removed outside Relations View');
    else if (isAtlasRelationType(rawRelation)) relationType = rawRelation;
    else issues.push(`invalid relation: ${rawRelation}`);
  }

  const rawDepth = source.get('depth');
  if (rawDepth !== null && rawDepth !== '1') issues.push(`invalid depth: ${rawDepth}`);

  const state: AtlasQueryState = { status, types, nodeId, view, relationType, depth: 1 };
  const canonicalSearch = serializeAtlasQueryState(state);
  const atlasSource = new URLSearchParams();
  ATLAS_QUERY_KEYS.forEach((key) => {
    const value = source.get(key);
    if (value !== null) atlasSource.set(key, value);
  });

  return {
    state,
    issues,
    canonicalSearch,
    wasNormalized: atlasSource.toString() !== canonicalSearch,
  };
}

export function removeAtlasQueryParameters(input: URLSearchParams | string): string {
  const params = toSearchParams(input);
  ATLAS_QUERY_KEYS.forEach((key) => params.delete(key));
  return params.toString();
}

export function buildAtlasHrefFromPreview(
  status: AtlasStatus,
  types: readonly AnswerType[],
): string {
  const search = serializeAtlasQueryState({
    status,
    types: [...types],
    nodeId: null,
    view: 'map',
    relationType: null,
    depth: 1,
  });
  return search ? `/atlas?${search}` : '/atlas';
}
