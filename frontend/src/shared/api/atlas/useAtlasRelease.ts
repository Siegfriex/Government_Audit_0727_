import { useCallback, useEffect, useState } from 'react';

import {
  atlasReleaseResource,
  type AtlasReleaseResource,
  type AtlasReleaseResult,
} from '@/shared/api/atlas/atlasReleaseResource';

export type UseAtlasReleaseState =
  | { status: 'loading'; retry: () => void }
  | ({ status: 'ready'; retry: () => void } & Omit<Extract<AtlasReleaseResult, { status: 'ready' }>, 'status'>)
  | ({ status: 'unavailable'; retry: () => void } & Omit<Extract<AtlasReleaseResult, { status: 'unavailable' }>, 'status'>)
  | { status: 'error'; error: Error; retry: () => void };

export function useAtlasRelease(resource: AtlasReleaseResource = atlasReleaseResource): UseAtlasReleaseState {
  const [retryKey, setRetryKey] = useState(0);
  const [result, setResult] = useState<AtlasReleaseResult | null>(() => resource.peek());
  const [error, setError] = useState<Error | null>(null);
  const retry = useCallback(() => {
    resource.invalidate();
    setResult(null);
    setError(null);
    setRetryKey((value) => value + 1);
  }, [resource]);

  useEffect(() => {
    const controller = new AbortController();
    void resource.load(controller.signal).then((next) => {
      if (!controller.signal.aborted) setResult(next);
    }).catch((reason: unknown) => {
      if (controller.signal.aborted) return;
      setError(reason instanceof Error ? reason : new Error('Unknown Atlas release error'));
    });
    return () => controller.abort();
  }, [resource, retryKey]);

  if (error) return { status: 'error', error, retry };
  if (!result) return { status: 'loading', retry };
  if (result.status === 'unavailable') return { ...result, retry };
  return { ...result, retry };
}
