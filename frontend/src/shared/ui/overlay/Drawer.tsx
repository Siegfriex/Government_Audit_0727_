import type { DialogProps } from './overlay.types';
import { Dialog } from './Dialog';

export function Drawer(props: DialogProps) {
  return <Dialog {...props} className={`overlay-drawer ${props.className ?? ''}`} />;
}
