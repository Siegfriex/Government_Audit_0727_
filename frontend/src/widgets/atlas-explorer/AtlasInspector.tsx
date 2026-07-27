import type { AtlasNodeViewModel, EvidenceRepository, EvidenceSummaryViewModel } from '@/shared/types/atlas';
import { AtlasInvalidNodeState } from '@/shared/ui/atlas';
import { AtlasEvidenceDossier } from './AtlasEvidenceDossier';

interface AtlasInspectorProps {
  node: AtlasNodeViewModel | null;
  invalidNodeId?: string | null;
  onClearInvalidNode?: () => void;
  evidenceSummary: EvidenceSummaryViewModel | null;
  evidenceRepository: EvidenceRepository;
}

export function AtlasInspector({
  node,
  invalidNodeId,
  onClearInvalidNode,
  evidenceSummary,
  evidenceRepository,
}: AtlasInspectorProps) {
  return (
    <aside id="atlas-selection-inspector" aria-label="선택 node 상세" className="atlas-selection-inspector border-t-2 border-[var(--ink-primary)] bg-[var(--paper-muted)] p-5 md:p-6 xl:sticky xl:top-20 xl:self-start" tabIndex={-1}>
      {invalidNodeId && onClearInvalidNode ? (
        <AtlasInvalidNodeState nodeId={invalidNodeId} onClear={onClearInvalidNode} />
      ) : (
        <AtlasEvidenceDossier node={node} evidenceSummary={evidenceSummary} evidenceRepository={evidenceRepository} />
      )}
    </aside>
  );
}
