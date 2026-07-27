import fs from 'node:fs';
import path from 'node:path';
import { createHash, webcrypto } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAtlasReleaseResource } from './atlasReleaseResource';
import { parseAtlasReleasePointer, parseFrontendManifest } from './atlasTransportSchema';

function publicFileFetch() {
  return vi.fn<typeof fetch>(async (input) => {
    const value = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
    const pathname = new URL(value, 'http://localhost').pathname;
    const file = path.join(process.cwd(), 'public', pathname.replace(/^\/+/, ''));
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return new Response('', { status: 404 });
    return new Response(fs.readFileSync(file), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
}

describe('AtlasReleaseResource', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('resolves the pointer, dedupes concurrent loads, caches the adapted release, and invalidates explicitly', async () => {
    vi.stubEnv('VITE_ATLAS_RELEASE_ID', '');
    vi.stubGlobal('crypto', webcrypto);
    const fetchMock = publicFileFetch();
    const resource = createAtlasReleaseResource(fetchMock);
    const [first, second] = await Promise.all([resource.load(), resource.load()]);
    expect(first).toBe(second);
    expect(first.status).toBe('ready');
    if (first.status !== 'ready') throw new Error('Expected ready release');
    expect(first.source).toBe('pointer');
    expect(first.bundle.nodes).toHaveLength(140);
    expect(first.bundle.storyPreviewNodeIds).toHaveLength(16);
    expect(first.bundle.releaseId).toBe('ATLAS_DG761_STORY_20260724_022353_KST_BF673FD1');
    expect(resource.peek()).toBe(first);

    const pointerCalls = () => fetchMock.mock.calls.filter(([input]) => String(input).includes('current-release.json')).length;
    expect(pointerCalls()).toBe(1);
    expect(await resource.load()).toBe(first);
    expect(pointerCalls()).toBe(1);

    resource.invalidate();
    const reloaded = await resource.load();
    expect(reloaded.status).toBe('ready');
    expect(pointerCalls()).toBe(2);
  });

  it('matches every public release file to the approved manifest hash and byte size', () => {
    const publicDir = path.join(process.cwd(), 'public');
    const pointerBytes = fs.readFileSync(path.join(publicDir, 'data/current-release.json'));
    const pointer = parseAtlasReleasePointer(JSON.parse(pointerBytes.toString('utf8')));
    const manifestPath = path.join(publicDir, pointer.manifest_path.replace(/^\/+/, ''));
    const manifestBytes = fs.readFileSync(manifestPath);

    expect(createHash('sha256').update(manifestBytes).digest('hex')).toBe(pointer.manifest_sha256);

    const manifest = parseFrontendManifest(JSON.parse(manifestBytes.toString('utf8')));
    expect(manifest.release_id).toBe(pointer.release_id);
    expect(manifest.projection_id).toBe(pointer.projection_id);
    expect(manifest.projection_hash).toBe(pointer.projection_hash);

    const releaseDir = path.dirname(manifestPath);
    const declaredPaths = new Set<string>();
    for (const entry of manifest.files) {
      expect(path.isAbsolute(entry.path)).toBe(false);
      expect(entry.path.split('/')).not.toContain('..');
      expect(declaredPaths.has(entry.path)).toBe(false);
      declaredPaths.add(entry.path);

      const filePath = path.join(releaseDir, entry.path);
      const bytes = fs.readFileSync(filePath);
      expect(bytes.byteLength, entry.logical_name).toBe(entry.size_bytes);
      expect(createHash('sha256').update(bytes).digest('hex'), entry.logical_name).toBe(entry.sha256);
      expect(() => JSON.parse(bytes.toString('utf8')), entry.logical_name).not.toThrow();
    }

    expect(declaredPaths.size).toBe(80);
  });
});
