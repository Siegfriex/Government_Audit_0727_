import type { AtlasNodeViewModel, EvidenceRepository, EvidenceSummaryViewModel } from '@/shared/types/atlas';
import { AtlasEvidenceDossier } from './AtlasEvidenceDossier';

interface AtlasEvidenceViewProps {
  node: AtlasNodeViewModel | null;
  evidenceSummary: EvidenceSummaryViewModel | null;
  evidenceRepository: EvidenceRepository;
}

export function AtlasEvidenceView({ node, evidenceSummary, evidenceRepository }: AtlasEvidenceViewProps) {
  return (
    <div id="atlas-view-evidence" role="tabpanel" className="atlas-evidence-view">
      <div className="atlas-evidence-view__intro">
        <p className="redline-meta">NODE → EVIDENCE → PDF / PAGE</p>
        <h2>해석이 원문으로 이어지는 경로</h2>
        <p>현재 공개 bundle에서 검증 가능한 node, 대표 Evidence, 회의록 페이지와 PDF 자산만 표시합니다. 누락된 연결은 숨기지 않습니다.</p>
      </div>
      <AtlasEvidenceDossier node={node} evidenceSummary={evidenceSummary} evidenceRepository={evidenceRepository} mode="full" />
    </div>
  );
}
