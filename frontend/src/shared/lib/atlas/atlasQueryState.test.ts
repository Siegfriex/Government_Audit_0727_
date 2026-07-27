import { describe, expect, it } from 'vitest';

import { ANSWER_TYPES } from '@/shared/types/atlas';
import {
  buildAtlasHrefFromPreview,
  parseAtlasQueryState,
  removeAtlasQueryParameters,
  serializeAtlasQueryState,
} from './atlasQueryState';

describe('Atlas query state contract', () => {
  it('canonicalizes answer types in A1 to A8 order and reports invalid values', () => {
    const result = parseAtlasQueryState('?status=active&types=A8,A2,A9,A1&node=contract-node-001&view=bad');
    expect(result.state).toEqual({
      status: 'active',
      types: ['A1', 'A2', 'A8'],
      nodeId: 'contract-node-001',
      view: 'map',
      relationType: null,
      depth: 1,
    });
    expect(result.issues).toEqual(['invalid answer type: A9', 'invalid view: bad']);
    expect(result.canonicalSearch).toBe('status=active&types=A1%2CA2%2CA8&node=contract-node-001');
    expect(result.wasNormalized).toBe(true);
  });

  it('normalizes invalid values without writing or inventing a selected node', () => {
    const result = parseAtlasQueryState('?status=pending&types=NOPE&node=%3CNA%3E');
    expect(result.state).toEqual({ status: 'all', types: [...ANSWER_TYPES], nodeId: null, view: 'map', relationType: null, depth: 1 });
    expect(result.canonicalSearch).toBe('');
    expect(result.issues).toHaveLength(4);
  });

  it('reset removes only Atlas parameters and default state serializes to an empty query', () => {
    expect(removeAtlasQueryParameters('?status=active&types=A1&node=n1&view=nodes&utm_source=audit')).toBe('utm_source=audit');
    expect(serializeAtlasQueryState({ status: 'all', types: [...ANSWER_TYPES], nodeId: null, view: 'map', relationType: null, depth: 1 })).toBe('');
  });

  it('builds a Story preview handoff URL without touching Story state', () => {
    expect(buildAtlasHrefFromPreview('complete', ['A7', 'A1'])).toBe('/atlas?status=complete&types=A1%2CA7');
  });

  it('restores the three public views and a validated relation filter', () => {
    const result = parseAtlasQueryState('?view=relations&relation=semantic_neighbor&depth=1');
    expect(result.state).toEqual({
      status: 'all',
      types: [...ANSWER_TYPES],
      nodeId: null,
      view: 'relations',
      relationType: 'semantic_neighbor',
      depth: 1,
    });
    expect(result.canonicalSearch).toBe('view=relations&relation=semantic_neighbor');
  });
});
