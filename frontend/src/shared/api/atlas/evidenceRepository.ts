import { parseEvidenceDetail, type EvidenceSummaryTransport, type FrontendManifestTransport } from '@/shared/api/atlas/atlasTransportSchema';
import type { EvidenceDetailViewModel, EvidenceRepository, EvidenceSummaryViewModel } from '@/shared/types/atlas';

function toSummary(record: EvidenceSummaryTransport): EvidenceSummaryViewModel {
  return {
    id: record.evidence_id,
    title: record.title,
    reportedStatus: record.reported_status,
    verificationStatus: record.verification_status,
    meetingId: record.meeting_id,
    pageStartNo: record.page_start_no,
    pageEndNo: record.page_end_no,
    pdfAssetId: record.pdf_asset_id,
    publicVisibility: true,
  };
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes));
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function toDetail(record: ReturnType<typeof parseEvidenceDetail>): EvidenceDetailViewModel {
  return {
    id: record.evidence_id,
    title: record.title,
    requestText: record.request_text,
    questionText: record.question_text,
    answerText: record.answer_text,
    excerpt: record.evidence_excerpt,
    reportedStatus: record.reported_status,
    verificationStatus: record.verification_status,
    meetingId: record.meeting_id,
    pageStartNo: record.page_start_no,
    pageEndNo: record.page_end_no,
    pdfAssetId: record.pdf_asset_id,
    sourcePdfSha256: record.source_pdf_sha256,
    pipelineRunId: record.pipeline_run_id,
    publicVisibility: true,
  };
}

function withAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException('The operation was aborted', 'AbortError'));
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new DOMException('The operation was aborted', 'AbortError'));
    signal.addEventListener('abort', abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

export function createEvidenceRepository(
  manifest: FrontendManifestTransport,
  records: readonly EvidenceSummaryTransport[],
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
): EvidenceRepository {
  const summaries = new Map(records.map((record) => [record.evidence_id, toSummary(record)]));
  const detailCache = new Map<string, EvidenceDetailViewModel>();
  const detailRequests = new Map<string, Promise<EvidenceDetailViewModel>>();

  return {
    getSummary(evidenceId) {
      return summaries.get(evidenceId) ?? null;
    },
    async getDetail(evidenceId, signal) {
      if (!summaries.has(evidenceId)) throw new Error('Evidence is not approved for public access');
      if (manifest.evidence_detail_transport !== 'route-json') {
        throw new Error('Arrow evidence detail transport is not implemented in the contract shell');
      }
      const cached = detailCache.get(evidenceId);
      if (cached) return cached;
      const manifestFile = manifest.files.find((file) => file.logical_name === `evidence-detail:${evidenceId}`);
      if (!manifestFile || manifestFile.format !== 'json') {
        throw new Error('Approved Evidence detail is absent from the release manifest');
      }
      let request = detailRequests.get(evidenceId);
      if (!request) {
        request = (async () => {
          const encodedPath = manifestFile.path.split('/').map((part) => encodeURIComponent(part)).join('/');
          const response = await fetchImpl(`${baseUrl}/${encodedPath}`, { headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error(`Evidence detail returned HTTP ${response.status}`);
          const bytes = await response.arrayBuffer();
          if (await sha256(bytes) !== manifestFile.sha256) {
            throw new Error('Evidence detail SHA-256 does not match the approved manifest');
          }
          const record = parseEvidenceDetail(JSON.parse(new TextDecoder().decode(bytes)) as unknown);
          if (record.evidence_id !== evidenceId) throw new Error('Evidence detail ID does not match the approved request');
          if (record.pipeline_run_id !== manifest.pipeline_run_id) {
            throw new Error('Evidence detail pipeline run does not match the approved manifest');
          }
          const summary = summaries.get(evidenceId);
          if (!summary
            || record.title !== summary.title
            || record.meeting_id !== summary.meetingId
            || record.pdf_asset_id !== summary.pdfAssetId) {
            throw new Error('Evidence detail does not match the approved evidence index');
          }
          const detail = toDetail(record);
          detailCache.set(evidenceId, detail);
          return detail;
        })().finally(() => detailRequests.delete(evidenceId));
        detailRequests.set(evidenceId, request);
      }
      return withAbort(request, signal);
    },
  };
}
