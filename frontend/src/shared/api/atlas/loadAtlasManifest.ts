import {
  AtlasSchemaError,
  parseAtlasReleasePointer,
  parseFrontendManifest,
  type FrontendManifestTransport,
} from '@/shared/api/atlas/atlasTransportSchema';

export type AtlasUnavailableReason =
  | 'NO_APPROVED_RELEASE_CONFIGURED'
  | 'APPROVED_MANIFEST_NOT_FOUND';

export type AtlasManifestLoadResult =
  | { status: 'ready'; manifest: FrontendManifestTransport; baseUrl: string; source: 'env' | 'pointer' }
  | { status: 'unavailable'; reason: AtlasUnavailableReason };

export class AtlasLoadError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AtlasLoadError';
  }
}

export function validAtlasReleaseId(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(value);
}

export function configuredAtlasReleaseId(): string | null {
  const releaseId = import.meta.env.VITE_ATLAS_RELEASE_ID?.trim();
  if (!releaseId) return null;
  if (!validAtlasReleaseId(releaseId)) throw new AtlasLoadError('Configured Atlas release ID is invalid');
  return releaseId;
}

function publicAssetUrl(relativePath: string): string {
  const viteBase = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  return `${viteBase}${relativePath.replace(/^\/+/, '')}`;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes));
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

interface ResolvedRelease {
  releaseId: string;
  manifestSha256: string | null;
  projectionId: string | null;
  projectionHash: string | null;
  source: 'env' | 'pointer';
}

async function resolveRelease(
  releaseId: string | null | undefined,
  fetchImpl: typeof fetch,
  signal?: AbortSignal,
): Promise<ResolvedRelease | null> {
  if (releaseId === null) return null;
  if (releaseId !== undefined) {
    if (!validAtlasReleaseId(releaseId)) throw new AtlasLoadError('Configured Atlas release ID is invalid');
    return { releaseId, manifestSha256: null, projectionId: null, projectionHash: null, source: 'env' };
  }

  const envReleaseId = configuredAtlasReleaseId();
  if (envReleaseId) {
    return { releaseId: envReleaseId, manifestSha256: null, projectionId: null, projectionHash: null, source: 'env' };
  }

  let response: Response;
  try {
    response = await fetchImpl(publicAssetUrl('data/current-release.json'), {
      signal,
      headers: { Accept: 'application/json' },
      cache: 'no-cache',
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new AtlasLoadError('Current Atlas release pointer request failed', { cause: error });
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new AtlasLoadError(`Current Atlas release pointer returned HTTP ${response.status}`);

  try {
    const pointer = parseAtlasReleasePointer(await response.json());
    if (!validAtlasReleaseId(pointer.release_id)) throw new AtlasSchemaError('pointer.release_id is invalid');
    const expectedPath = `/data/releases/${pointer.release_id}/frontend-manifest.json`;
    if (pointer.manifest_path !== expectedPath) {
      throw new AtlasSchemaError('pointer.manifest_path does not match pointer.release_id');
    }
    return {
      releaseId: pointer.release_id,
      manifestSha256: pointer.manifest_sha256,
      projectionId: pointer.projection_id,
      projectionHash: pointer.projection_hash,
      source: 'pointer',
    };
  } catch (error) {
    if (error instanceof AtlasSchemaError) throw error;
    throw new AtlasLoadError('Current Atlas release pointer is not valid JSON', { cause: error });
  }
}

export async function loadAtlasManifest(
  releaseId: string | null | undefined = undefined,
  fetchImpl: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<AtlasManifestLoadResult> {
  const resolved = await resolveRelease(releaseId, fetchImpl, signal);
  if (!resolved) return { status: 'unavailable', reason: 'NO_APPROVED_RELEASE_CONFIGURED' };

  const baseUrl = publicAssetUrl(`data/releases/${encodeURIComponent(resolved.releaseId)}`).replace(/\/$/, '');
  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}/frontend-manifest.json`, {
      signal,
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new AtlasLoadError('Approved Atlas manifest request failed', { cause: error });
  }

  if (response.status === 404) {
    return { status: 'unavailable', reason: 'APPROVED_MANIFEST_NOT_FOUND' };
  }
  if (!response.ok) throw new AtlasLoadError(`Approved Atlas manifest returned HTTP ${response.status}`);

  try {
    const bytes = await response.arrayBuffer();
    if (resolved.manifestSha256 && await sha256(bytes) !== resolved.manifestSha256) {
      throw new AtlasLoadError('Approved Atlas manifest SHA-256 does not match current-release.json');
    }
    const manifest = parseFrontendManifest(JSON.parse(new TextDecoder().decode(bytes)) as unknown);
    if (manifest.release_id !== resolved.releaseId) {
      throw new AtlasSchemaError('manifest.release_id does not match resolved release');
    }
    if (resolved.projectionId && manifest.projection_id !== resolved.projectionId) {
      throw new AtlasSchemaError('manifest.projection_id does not match current-release.json');
    }
    if (resolved.projectionHash && manifest.projection_hash !== resolved.projectionHash) {
      throw new AtlasSchemaError('manifest.projection_hash does not match current-release.json');
    }
    return { status: 'ready', manifest, baseUrl, source: resolved.source };
  } catch (error) {
    if (error instanceof AtlasSchemaError || error instanceof AtlasLoadError) throw error;
    throw new AtlasLoadError('Approved Atlas manifest is not valid JSON', { cause: error });
  }
}
