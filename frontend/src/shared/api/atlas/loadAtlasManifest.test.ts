import { webcrypto } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadAtlasManifest } from './loadAtlasManifest';

describe('approved Atlas manifest resolution', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  it('does not make a request when no approved release is configured', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    await expect(loadAtlasManifest(null, fetchMock)).resolves.toEqual({
      status: 'unavailable',
      reason: 'NO_APPROVED_RELEASE_CONFIGURED',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps a missing configured manifest to DataUnavailable without fixture fallback', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 404 }));
    await expect(loadAtlasManifest('contract-release-001', fetchMock)).resolves.toEqual({
      status: 'unavailable',
      reason: 'APPROVED_MANIFEST_NOT_FOUND',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('uses current-release.json when no env override exists and verifies the manifest hash', async () => {
    vi.stubEnv('VITE_ATLAS_RELEASE_ID', '');
    vi.stubGlobal('crypto', webcrypto);
    const manifest = {
      manifest_version: '1.0', release_id: 'pointer-release-001', app_contract_version: '1.0',
      data_version: 'v1', pipeline_run_id: 'run-1', projection_id: 'projection-1',
      projection_hash: 'a'.repeat(64), publication_ready: true, generated_at: '2026-07-24T00:00:00Z',
      status_partitioned: false, evidence_detail_transport: 'route-json', files: [],
    };
    const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest));
    const digest = await webcrypto.subtle.digest('SHA-256', manifestBytes);
    const hash = Buffer.from(digest).toString('hex');
    const pointer = {
      schema_version: '1.0', release_id: manifest.release_id,
      manifest_path: `/data/releases/${manifest.release_id}/frontend-manifest.json`,
      manifest_sha256: hash, projection_id: manifest.projection_id,
      projection_hash: manifest.projection_hash, generated_at: manifest.generated_at,
    };
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(pointer))
      .mockResolvedValueOnce(new Response(manifestBytes));
    const result = await loadAtlasManifest(undefined, fetchMock);
    expect(result).toMatchObject({ status: 'ready', source: 'pointer', baseUrl: '/data/releases/pointer-release-001' });
    expect(fetchMock.mock.calls[0][0]).toBe('/data/current-release.json');
  });

  it('keeps an explicit env release ahead of the pointer', async () => {
    vi.stubEnv('VITE_ATLAS_RELEASE_ID', 'env-release-001');
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 404 }));
    await expect(loadAtlasManifest(undefined, fetchMock)).resolves.toEqual({
      status: 'unavailable', reason: 'APPROVED_MANIFEST_NOT_FOUND',
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain('/data/releases/env-release-001/frontend-manifest.json');
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('current-release.json');
  });

  it('rejects pointer projection metadata that differs from the approved manifest', async () => {
    vi.stubEnv('VITE_ATLAS_RELEASE_ID', '');
    vi.stubGlobal('crypto', webcrypto);
    const manifest = {
      manifest_version: '1.0', release_id: 'pointer-release-001', app_contract_version: '1.0',
      data_version: 'v1', pipeline_run_id: 'run-1', projection_id: 'projection-manifest',
      projection_hash: 'a'.repeat(64), publication_ready: true, generated_at: '2026-07-24T00:00:00Z',
      status_partitioned: false, evidence_detail_transport: 'route-json', files: [],
    };
    const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest));
    const hash = Buffer.from(await webcrypto.subtle.digest('SHA-256', manifestBytes)).toString('hex');
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({
        schema_version: '1.0', release_id: manifest.release_id,
        manifest_path: `/data/releases/${manifest.release_id}/frontend-manifest.json`,
        manifest_sha256: hash, projection_id: 'projection-pointer',
        projection_hash: manifest.projection_hash, generated_at: manifest.generated_at,
      }))
      .mockResolvedValueOnce(new Response(manifestBytes));

    await expect(loadAtlasManifest(undefined, fetchMock)).rejects.toThrow(/projection_id/);
  });
});
