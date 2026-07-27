import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface OverlayPortalProps {
  children: ReactNode;
}

export function OverlayPortal({ children }: OverlayPortalProps) {
  const root = document.getElementById('overlay-root');
  return root ? createPortal(children, root) : null;
}
