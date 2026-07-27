import { useEffect, useMemo, useState } from 'react';

import { useAtlasRelease } from '@/shared/api/atlas/useAtlasRelease';
import type { EvidenceDetailViewModel, EvidenceSummaryViewModel } from '@/shared/types/atlas';

export type UseEvidenceDetailState =
  | { status: 'loading' }
  | { status: 'unavailable'; reason: string }
  | { status: 'error'; error: Error; retry: () => void }
  | { status: 'ready'; detail: EvidenceDetailViewModel; summary: EvidenceSummaryViewModel };

export function useEvidenceDetail(evidenceId: string | null): UseEvidenceDetailState {
  const release = useAtlasRelease();
  const bundle = release.status === 'ready' ? release.bundle : null;
  const [loaded, setLoaded] = useState<{ evidenceId: string; detail: EvidenceDetailViewModel } | null>(null);
  const [detailError, setDetailError] = useState<{ evidenceId: string; error: Error } | null>(null);
  const summary = useMemo(
    () => bundle && evidenceId
      ? bundle.evidenceRepository.getSummary(evidenceId)
      : null,
    [bundle, evidenceId],
  );

  useEffect(() => {
    if (!bundle || !evidenceId || !summary) return;
    const controller = new AbortController();
    void bundle.evidenceRepository.getDetail(evidenceId, controller.signal).then((record) => {
      if (!controller.signal.aborted) setLoaded({ evidenceId, detail: record });
    }).catch((reason: unknown) => {
      if (controller.signal.aborted) return;
      setDetailError({
        evidenceId,
        error: reason instanceof Error ? reason : new Error('Unknown Evidence detail error'),
      });
    });
    return () => controller.abort();
  }, [bundle, evidenceId, summary]);

  if (!evidenceId) return { status: 'unavailable', reason: 'EVIDENCE_ID_MISSING' };
  if (release.status === 'loading') return { status: 'loading' };
  if (release.status === 'unavailable') return { status: 'unavailable', reason: release.reason };
  if (release.status === 'error') return { status: 'error', error: release.error, retry: release.retry };
  if (!summary) return { status: 'unavailable', reason: 'EVIDENCE_NOT_APPROVED' };
  if (detailError?.evidenceId === evidenceId) return { status: 'error', error: detailError.error, retry: release.retry };
  if (loaded?.evidenceId !== evidenceId) return { status: 'loading' };
  return { status: 'ready', detail: loaded.detail, summary };
}
