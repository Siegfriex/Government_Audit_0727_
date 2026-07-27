import type { AtlasNodeViewModel, EvidenceDetailViewModel, EvidenceSummaryViewModel } from '@/shared/types/atlas';

interface EvidenceProvenanceGraphProps {
  node: AtlasNodeViewModel;
  summary: EvidenceSummaryViewModel | null;
  detail: EvidenceDetailViewModel | null;
}

export function EvidenceProvenanceGraph({ node, summary, detail }: EvidenceProvenanceGraphProps) {
  return (
    <ol className="atlas-provenance" aria-label="선택 node의 공개 근거 계보">
      <li><span>01</span><div><strong>Atlas node</strong><small>{node.id}</small></div></li>
      <li data-chain-state={summary ? 'confirmed' : 'missing'}><span>02</span><div><strong>대표 Evidence</strong><small>{summary?.id ?? '공개 연결 없음'}</small></div></li>
      <li data-chain-state={summary ? 'confirmed' : 'missing'}><span>03</span><div><strong>회의록 위치</strong><small>{summary ? `${summary.meetingId} · ${summary.pageStartNo}–${summary.pageEndNo}` : '검증 불가'}</small></div></li>
      <li data-chain-state={detail ? 'confirmed' : summary ? 'pending' : 'missing'}><span>04</span><div><strong>PDF 원본</strong><small>{detail?.pdfAssetId ?? summary?.pdfAssetId ?? '공개 자산 없음'}</small></div></li>
    </ol>
  );
}
