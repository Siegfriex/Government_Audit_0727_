import fs from 'node:fs';
import path from 'node:path';
import { webcrypto } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseEvidenceSummaries, parseFrontendManifest } from './atlasTransportSchema';
import { createEvidenceRepository } from './evidenceRepository';

const releaseId = 'ATLAS_DG761_STORY_20260724_022353_KST_BF673FD1';
const releaseDir = path.join(process.cwd(), 'public/data/releases', releaseId);

describe('EvidenceRepository approved detail transport', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('validates, dedupes, and caches an approved detail request', async () => {
    vi.stubGlobal('crypto', webcrypto);
    const manifest = parseFrontendManifest(JSON.parse(fs.readFileSync(path.join(releaseDir, 'frontend-manifest.json'), 'utf8')));
    const records = parseEvidenceSummaries(JSON.parse(fs.readFileSync(path.join(releaseDir, 'evidence-index.json'), 'utf8')));
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const pathname = new URL(String(input), 'http://localhost').pathname;
      const file = path.join(process.cwd(), 'public', pathname.replace(/^\/+/, ''));
      return new Response(fs.readFileSync(file));
    });
    const repository = createEvidenceRepository(manifest, records, `/data/releases/${releaseId}`, fetchMock);
    const evidenceId = 'EVID_18557647961C4C1481271E6B';
    const [first, second] = await Promise.all([repository.getDetail(evidenceId), repository.getDetail(evidenceId)]);
    expect(first).toBe(second);
    expect(first.id).toBe(evidenceId);
    expect(first.publicVisibility).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await repository.getDetail(evidenceId)).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await expect(repository.getDetail('EVID_NOT_APPROVED')).rejects.toThrow(/not approved/);
  });
});
