import { useNavigate, useParams } from 'react-router';
import type { DetailKind } from '@/shared/types/routing';
import { EDITORIAL_CASES, MOCK_EVIDENCES } from '@/shared/mock/storyData';
import { Drawer } from '@/shared/ui/overlay/Drawer';
import { GlobalOverlayRoot } from '@/widgets/overlay-root/GlobalOverlayRoot';

interface EvidenceRouteOverlayProps {
  kind: DetailKind;
}

export function EvidenceRouteOverlay({ kind }: EvidenceRouteOverlayProps) {
  const navigate = useNavigate();
  const params = useParams();
  const itemId = kind === 'evidence' ? params.evidenceId : params.caseId;
  const fixtureMode = import.meta.env.DEV
    && import.meta.env.VITE_ATLAS_FIXTURE_PROVENANCE === 'CONTRACT_FIXTURE';
  const isValid = fixtureMode
    ? kind === 'evidence'
      ? MOCK_EVIDENCES.some((item) => item.id === itemId)
      : EDITORIAL_CASES.some((item) => item.id === itemId)
    : Boolean(itemId);
  const close = () => navigate(-1);

  if (!itemId || !isValid) {
    return (
      <Drawer open onClose={close} titleId="invalid-detail-title" descriptionId="invalid-detail-description">
        <div className="overlay-detail-error">
          <h2 id="invalid-detail-title" className="type-heading-2 font-serif">기록을 찾을 수 없습니다</h2>
          <p id="invalid-detail-description" className="mt-3">잘못된 ID입니다. 이전 화면으로 돌아가 주세요.</p>
          <button className="mt-6 underline" type="button" onClick={close}>이전 화면으로 돌아가기</button>
        </div>
      </Drawer>
    );
  }

  return <GlobalOverlayRoot kind={kind} itemId={itemId} onClose={close} />;
}
