import type { DetailKind } from '@/shared/types/routing';
import { EvidenceDrawer } from '@/widgets/evidence-drawer/EvidenceDrawer';

interface GlobalOverlayRootProps {
  kind: DetailKind;
  itemId: string;
  onClose: () => void;
}

export function GlobalOverlayRoot({ kind, itemId, onClose }: GlobalOverlayRootProps) {
  return <EvidenceDrawer kind={kind} itemId={itemId} onClose={onClose} />;
}
