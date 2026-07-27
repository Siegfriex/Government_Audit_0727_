import { loadAtlasBundle } from '@/shared/api/atlas/loadAtlasBundle';
import { loadAtlasManifest, type AtlasUnavailableReason } from '@/shared/api/atlas/loadAtlasManifest';
import { ATLAS_PLOT_RECT, getRequiredProjectionPaddingForRadii } from '@/shared/config/atlas/atlasEncoding';
import { createProjectionScale } from '@/shared/lib/atlas/scaleProjection';
import { toAtlasViewModel } from '@/shared/lib/atlas/toAtlasViewModel';
import type { AtlasViewModelBundle } from '@/shared/types/atlas';

export type AtlasReleaseResult =
  | { status: 'ready'; bundle: AtlasViewModelBundle; source: 'env' | 'pointer' }
  | { status: 'unavailable'; reason: AtlasUnavailableReason };

export interface AtlasReleaseResource {
  load(signal?: AbortSignal): Promise<AtlasReleaseResult>;
  invalidate(): void;
  peek(): AtlasReleaseResult | null;
}

function withConsumerAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException('The operation was aborted', 'AbortError'));
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new DOMException('The operation was aborted', 'AbortError'));
    signal.addEventListener('abort', abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

export function createAtlasReleaseResource(fetchImpl: typeof fetch = fetch): AtlasReleaseResource {
  let cached: AtlasReleaseResult | null = null;
  let inFlight: Promise<AtlasReleaseResult> | null = null;
  let controller: AbortController | null = null;
  let generation = 0;

  return {
    load(signal) {
      if (cached) return withConsumerAbort(Promise.resolve(cached), signal);
      if (!inFlight) {
        const requestGeneration = generation;
        const requestController = new AbortController();
        controller = requestController;
        inFlight = (async (): Promise<AtlasReleaseResult> => {
          const manifestResult = await loadAtlasManifest(undefined, fetchImpl, requestController.signal);
          if (manifestResult.status === 'unavailable') return manifestResult;
          const transport = await loadAtlasBundle(
            manifestResult.manifest,
            manifestResult.baseUrl,
            fetchImpl,
            requestController.signal,
          );
          const bounds = {
            xMin: transport.projectionMeta.x_min,
            xMax: transport.projectionMeta.x_max,
            yMin: transport.projectionMeta.y_min,
            yMax: transport.projectionMeta.y_max,
          };
          const scale = transport.nodes.length > 0
            ? createProjectionScale(
                bounds,
                ATLAS_PLOT_RECT,
                getRequiredProjectionPaddingForRadii(transport.nodes.map((node) => node.node_radius)),
              )
            : createProjectionScale(bounds, ATLAS_PLOT_RECT);
          return {
            status: 'ready',
            bundle: toAtlasViewModel(transport, scale, manifestResult.baseUrl),
            source: manifestResult.source,
          };
        })().then((result) => {
          if (requestGeneration === generation) cached = result;
          return result;
        }).finally(() => {
          if (requestGeneration === generation) {
            inFlight = null;
            controller = null;
          }
        });
      }
      return withConsumerAbort(inFlight, signal);
    },
    invalidate() {
      generation += 1;
      controller?.abort();
      controller = null;
      inFlight = null;
      cached = null;
    },
    peek() {
      return cached;
    },
  };
}

export const atlasReleaseResource = createAtlasReleaseResource();
