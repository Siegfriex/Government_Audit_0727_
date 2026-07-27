import type { DialogProps } from './overlay.types';
import { Dialog } from './Dialog';

export function BottomSheet(props: DialogProps) {
  return <Dialog {...props} className={`overlay-bottom-sheet ${props.className ?? ''}`} />;
}
